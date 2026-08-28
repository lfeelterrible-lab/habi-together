import { env as cloudflareEnv } from 'cloudflare:workers';
import { D1_SCHEMA_STATEMENTS, TASK_SEED_STATEMENTS } from '../../db/schema';
import { HABIT_TASKS } from './habi-content';

type HabiBindings = { DB?: D1Database };

type Identity = {
  userId: string;
  displayName: string;
  email: string | null;
  platformIdentity: boolean;
};

type Session = {
  db: D1Database;
  roomId: string;
  identity: Identity;
  setUserCookie: boolean;
  setRoomCookie: boolean;
};

type RoomRow = {
  id: string;
  code: string;
  name: string;
  watered_at: string | null;
  created_at: string;
  updated_at: string;
};

type MemberRow = {
  room_id: string;
  user_id: string;
  display_name: string;
  initials: string;
  joined_at: string;
  last_seen_at: string;
};

type TaskRow = {
  id: number;
  title: string;
  detail: string;
  category: string;
  icon: string;
  sort_order: number;
};

type CompletionRow = {
  task_id: number;
  user_id: string;
  completed_at: string;
};

type EventRow = {
  id: string;
  user_id: string;
  type: string;
  task_id: number | null;
  message: string;
  created_at: string;
  display_name: string;
  initials: string;
};

type JournalRow = {
  id: string;
  author_id: string;
  title: string;
  text: string;
  tone: string;
  created_at: string;
  display_name: string;
};

type DailyCompletionRow = {
  date: string;
  task_count: number;
  member_count: number;
};

export class HabiDataError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'HabiDataError';
    this.status = status;
  }
}

const runtimeEnv = cloudflareEnv as unknown as HabiBindings;
const ROOM_COOKIE = 'habi_room_id';
const USER_COOKIE = 'habi_user_id';
const TIME_ZONE = 'Asia/Shanghai';

function getDatabase() {
  if (!runtimeEnv.DB) {
    throw new HabiDataError('HabiTogether 的 D1 数据库尚未配置。', 503);
  }
  return runtimeEnv.DB;
}

function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const pair = cookieHeader.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null;
}

function cookieValue(value: string) {
  return encodeURIComponent(value);
}

export function sessionCookies(session: Pick<Session, 'setUserCookie' | 'setRoomCookie'> & { userId: string; roomId: string }, request: Request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  const cookies: string[] = [];
  if (session.setUserCookie) cookies.push(`${USER_COOKIE}=${cookieValue(session.userId)}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure}`);
  if (session.setRoomCookie) cookies.push(`${ROOM_COOKIE}=${cookieValue(session.roomId)}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure}`);
  return cookies;
}

export function appendSessionCookies(response: Response, cookies: string[]) {
  cookies.forEach((cookie) => response.headers.append('Set-Cookie', cookie));
  return response;
}

function safeDecodeName(request: Request) {
  const encodedName = request.headers.get('oai-authenticated-user-full-name');
  const encoding = request.headers.get('oai-authenticated-user-full-name-encoding');
  if (!encodedName || encoding !== 'percent-encoded-utf-8') return null;
  try {
    return decodeURIComponent(encodedName);
  } catch {
    return null;
  }
}

function cleanName(value: string | null | undefined, fallback: string) {
  const normalized = value?.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 24);
  return normalized || fallback;
}

function initialsFor(name: string) {
  const chars = Array.from(name.replace(/\s+/g, ''));
  return (chars.slice(0, 2).join('') || 'Y').toUpperCase();
}

function getIdentity(request: Request) {
  const platformUserId = request.headers.get('oai-authenticated-user-id')?.trim() || null;
  const email = request.headers.get('oai-authenticated-user-email')?.trim() || null;
  const cookieUserId = readCookie(request, USER_COOKIE);
  const userId = platformUserId || cookieUserId || crypto.randomUUID();
  const displayName = cleanName(safeDecodeName(request), platformUserId ? '你' : '你');
  return {
    userId,
    displayName,
    email,
    platformIdentity: Boolean(platformUserId),
    setUserCookie: !platformUserId && !cookieUserId,
  };
}

async function initializeDatabase(db: D1Database) {
  const statements = [
    ...D1_SCHEMA_STATEMENTS.map((sql) => db.prepare(sql)),
    ...TASK_SEED_STATEMENTS.map(({ sql, bindings }) => db.prepare(sql).bind(...bindings)),
  ];
  await db.batch(statements);
}

function dateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function dateKeyOffset(offset: number) {
  return dateKey(new Date(Date.now() - offset * 86400000));
}

function nowIso() {
  return new Date().toISOString();
}

function roomCode() {
  const token = crypto.randomUUID().replace(/-/g, '').slice(0, 4).toUpperCase();
  return `TWN-${token}`;
}

async function createRoom(db: D1Database, identity: ReturnType<typeof getIdentity>) {
  const now = nowIso();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const id = crypto.randomUUID();
    const code = roomCode();
    try {
      await db.batch([
        db.prepare('INSERT INTO rooms (id, code, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').bind(id, code, '我们的花园', now, now),
        db.prepare('INSERT INTO room_members (room_id, user_id, display_name, initials, joined_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id, identity.userId, identity.displayName, initialsFor(identity.displayName), now, now),
        db.prepare('INSERT INTO garden_events (id, room_id, user_id, type, message, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(crypto.randomUUID(), id, identity.userId, 'join', `${identity.displayName} 创建了你们的花园`, now),
      ]);
      return { id, code };
    } catch (error) {
      if (attempt === 3) throw error;
    }
  }
  throw new HabiDataError('无法创建新的花园房间。');
}

async function findMember(db: D1Database, roomId: string, userId: string) {
  return db.prepare('SELECT room_id, user_id, display_name, initials, joined_at, last_seen_at FROM room_members WHERE room_id = ? AND user_id = ?').bind(roomId, userId).first<MemberRow>();
}

export async function getSession(request: Request): Promise<Session> {
  const db = getDatabase();
  await initializeDatabase(db);
  const identity = getIdentity(request);
  const roomCookie = readCookie(request, ROOM_COOKIE);
  let roomId = roomCookie;
  let setRoomCookie = false;

  if (!roomId || !(await findMember(db, roomId, identity.userId))) {
    const created = await createRoom(db, identity);
    roomId = created.id;
    setRoomCookie = true;
  } else {
    const now = nowIso();
    await db.batch([
      db.prepare('UPDATE room_members SET last_seen_at = ? WHERE room_id = ? AND user_id = ?').bind(now, roomId, identity.userId),
      db.prepare('UPDATE rooms SET updated_at = ? WHERE id = ?').bind(now, roomId),
    ]);
  }

  return { db, roomId, identity, setUserCookie: identity.setUserCookie, setRoomCookie };
}

async function roomForSession(db: D1Database, session: Session) {
  const room = await db.prepare('SELECT id, code, name, watered_at, created_at, updated_at FROM rooms WHERE id = ?').bind(session.roomId).first<RoomRow>();
  if (!room) throw new HabiDataError('找不到当前花园，请重新加入房间。', 404);
  return room;
}

function relativeLabel(iso: string | null) {
  if (!iso) return '还没有记录';
  const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 1000));
  if (seconds < 60) return '刚刚';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时前`;
  return `${Math.floor(seconds / 86400)} 天前`;
}

function stageFor(progress: number) {
  if (progress >= 88) return { code: 'IV', label: '即将盛放' };
  if (progress >= 72) return { code: 'III', label: '长出枝叶' };
  if (progress >= 45) return { code: 'II', label: '正在长出新叶' };
  return { code: 'I', label: '刚刚发芽' };
}

async function getStreak(db: D1Database, roomId: string, memberCount: number) {
  const result = await db.prepare('SELECT date, COUNT(DISTINCT task_id) AS task_count, COUNT(DISTINCT user_id) AS member_count FROM task_completions WHERE room_id = ? GROUP BY date ORDER BY date DESC LIMIT 45').bind(roomId).all<DailyCompletionRow>();
  const byDate = new Map(result.results.map((row) => [row.date, row]));
  let streak = 0;
  for (let offset = 0; offset < 45; offset += 1) {
    const row = byDate.get(dateKeyOffset(offset));
    if (!row || row.task_count < HABIT_TASKS.length || row.member_count < memberCount) break;
    streak += 1;
  }
  return streak;
}

export async function readState(request: Request) {
  const session = await getSession(request);
  return stateResult(request, session);
}

function parseJson(value: unknown) {
  if (!value || typeof value !== 'object') throw new HabiDataError('请求内容不完整。', 400);
  return value as Record<string, unknown>;
}

function taskIdFrom(value: unknown) {
  const taskId = Number(value);
  if (!Number.isInteger(taskId) || !HABIT_TASKS.some((task) => task.id === taskId)) throw new HabiDataError('无效的仪式项目。', 400);
  return taskId;
}

async function eventForTask(db: D1Database, session: Session, taskId: number, completed: boolean) {
  const task = HABIT_TASKS.find((item) => item.id === taskId);
  const now = nowIso();
  if (!task) throw new HabiDataError('无效的仪式项目。', 400);
  return db.prepare('INSERT INTO garden_events (id, room_id, user_id, type, task_id, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(crypto.randomUUID(), session.roomId, session.identity.userId, completed ? 'task_complete' : 'task_reopen', taskId, completed ? `${session.identity.displayName} 完成了「${task.title}」` : `${session.identity.displayName} 撤回了「${task.title}」`, now);
}

export async function updateTask(request: Request) {
  const session = await getSession(request);
  const body = parseJson(await request.json());
  const taskId = taskIdFrom(body.taskId);
  const completed = body.completed === true;
  const today = dateKey();
  const now = nowIso();
  const statements = completed
    ? [
        session.db.prepare('INSERT INTO task_completions (room_id, task_id, date, user_id, completed_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(room_id, task_id, date, user_id) DO UPDATE SET completed_at = excluded.completed_at').bind(session.roomId, taskId, today, session.identity.userId, now),
        await eventForTask(session.db, session, taskId, true),
      ]
    : [
        session.db.prepare('DELETE FROM task_completions WHERE room_id = ? AND task_id = ? AND date = ? AND user_id = ?').bind(session.roomId, taskId, today, session.identity.userId),
        await eventForTask(session.db, session, taskId, false),
      ];
  statements.push(session.db.prepare('UPDATE rooms SET updated_at = ? WHERE id = ?').bind(now, session.roomId));
  await session.db.batch(statements);
  return stateResult(request, session);
}

export async function waterGarden(request: Request) {
  const session = await getSession(request);
  const now = nowIso();
  await session.db.batch([
    session.db.prepare('UPDATE rooms SET watered_at = ?, updated_at = ? WHERE id = ?').bind(now, now, session.roomId),
    session.db.prepare('INSERT INTO garden_events (id, room_id, user_id, type, message, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(crypto.randomUUID(), session.roomId, session.identity.userId, 'water', `${session.identity.displayName} 给花园浇了水`, now),
  ]);
  return stateResult(request, session);
}

export async function sendHighFive(request: Request) {
  const session = await getSession(request);
  const now = nowIso();
  await session.db.batch([
    session.db.prepare('UPDATE rooms SET updated_at = ? WHERE id = ?').bind(now, session.roomId),
    session.db.prepare('INSERT INTO garden_events (id, room_id, user_id, type, message, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(crypto.randomUUID(), session.roomId, session.identity.userId, 'high_five', `${session.identity.displayName} 送出了一枚击掌`, now),
  ]);
  return stateResult(request, session);
}

export async function createJournal(request: Request) {
  const session = await getSession(request);
  const body = parseJson(await request.json());
  const title = cleanName(typeof body.title === 'string' ? body.title : '', '今天也一起走到这里');
  const text = cleanName(typeof body.text === 'string' ? body.text : '', '把这一刻留在共同的花园里。');
  if (title.length < 2 || text.length < 2) throw new HabiDataError('日记标题和内容都需要至少两个字。', 400);
  const tone = body.tone === 'clay' || body.tone === 'lavender' ? body.tone : 'sage';
  const now = nowIso();
  await session.db.batch([
    session.db.prepare('INSERT INTO journal_entries (id, room_id, author_id, title, text, tone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(crypto.randomUUID(), session.roomId, session.identity.userId, title, text, tone, now),
    session.db.prepare('UPDATE rooms SET updated_at = ? WHERE id = ?').bind(now, session.roomId),
    session.db.prepare('INSERT INTO garden_events (id, room_id, user_id, type, message, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(crypto.randomUUID(), session.roomId, session.identity.userId, 'journal', `${session.identity.displayName} 写下了一篇成长日记`, now),
  ]);
  return stateResult(request, session);
}

export async function joinRoom(request: Request) {
  const db = getDatabase();
  await initializeDatabase(db);
  const identity = getIdentity(request);
  const body = parseJson(await request.json());
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (!/^[A-Z0-9]{3,8}-[A-Z0-9]{3,8}$/.test(code)) throw new HabiDataError('请输入有效的房间码，例如 TWN-AB12。', 400);
  const room = await db.prepare('SELECT id, code, name, watered_at, created_at, updated_at FROM rooms WHERE code = ?').bind(code).first<RoomRow>();
  if (!room) throw new HabiDataError('没有找到这个房间，请检查房间码。', 404);
  const existing = await findMember(db, room.id, identity.userId);
  const members = await db.prepare('SELECT user_id FROM room_members WHERE room_id = ?').bind(room.id).all<{ user_id: string }>();
  if (!existing && members.results.length >= 2) throw new HabiDataError('这个花园已经绑定了两个人。', 409);
  const name = cleanName(typeof body.name === 'string' ? body.name : '', members.results.length === 0 ? '你' : '小满');
  const now = nowIso();
  if (!existing) {
    await db.batch([
      db.prepare('INSERT INTO room_members (room_id, user_id, display_name, initials, joined_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)').bind(room.id, identity.userId, name, initialsFor(name), now, now),
      db.prepare('UPDATE rooms SET updated_at = ? WHERE id = ?').bind(now, room.id),
      db.prepare('INSERT INTO garden_events (id, room_id, user_id, type, message, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(crypto.randomUUID(), room.id, identity.userId, 'join', `${name} 加入了你们的花园`, now),
    ]);
  } else {
    await db.prepare('UPDATE room_members SET last_seen_at = ? WHERE room_id = ? AND user_id = ?').bind(now, room.id, identity.userId).run();
  }
  const session = { db, roomId: room.id, identity, setUserCookie: identity.setUserCookie, setRoomCookie: true };
  return stateResult(request, session);
}

function stateResult(request: Request, session: Session) {
  return buildState(session).then((state) => ({
    state,
    cookies: sessionCookies({ ...session, userId: session.identity.userId, roomId: session.roomId }, request),
  }));
}

async function buildState(session: Session) {
  const room = await roomForSession(session.db, session);
  const today = dateKey();
  const [membersResult, tasksResult, completionsResult, eventsResult, journalResult, waterResult] = await Promise.all([
    session.db.prepare('SELECT room_id, user_id, display_name, initials, joined_at, last_seen_at FROM room_members WHERE room_id = ? ORDER BY joined_at ASC').bind(session.roomId).all<MemberRow>(),
    session.db.prepare('SELECT id, title, detail, category, icon, sort_order FROM habit_tasks ORDER BY sort_order ASC').all<TaskRow>(),
    session.db.prepare('SELECT task_id, user_id, completed_at FROM task_completions WHERE room_id = ? AND date = ?').bind(session.roomId, today).all<CompletionRow>(),
    session.db.prepare('SELECT e.id, e.user_id, e.type, e.task_id, e.message, e.created_at, m.display_name, m.initials FROM garden_events e JOIN room_members m ON m.room_id = e.room_id AND m.user_id = e.user_id WHERE e.room_id = ? ORDER BY e.created_at DESC LIMIT 8').bind(session.roomId).all<EventRow>(),
    session.db.prepare('SELECT j.id, j.author_id, j.title, j.text, j.tone, j.created_at, m.display_name FROM journal_entries j JOIN room_members m ON m.room_id = j.room_id AND m.user_id = j.author_id WHERE j.room_id = ? ORDER BY j.created_at DESC LIMIT 12').bind(session.roomId).all<JournalRow>(),
    session.db.prepare('SELECT COUNT(*) AS count FROM garden_events WHERE room_id = ? AND type = ?').bind(session.roomId, 'water').first<{ count: number }>(),
  ]);
  const members = membersResult.results;
  const currentMember = members.find((member) => member.user_id === session.identity.userId);
  if (!currentMember) throw new HabiDataError('当前用户尚未加入这个花园。', 403);
  const partner = members.find((member) => member.user_id !== session.identity.userId) ?? null;
  const completionRows = completionsResult.results;
  const currentCompletionIds = new Set(completionRows.filter((row) => row.user_id === session.identity.userId).map((row) => row.task_id));
  const partnerCompletionIds = new Set(completionRows.filter((row) => row.user_id !== session.identity.userId).map((row) => row.task_id));
  const completedCount = currentCompletionIds.size;
  const partnerCompletedCount = partnerCompletionIds.size;
  const totalPossible = Math.max(1, members.length * HABIT_TASKS.length);
  const progress = Math.min(100, Math.round(((completedCount + partnerCompletedCount) / totalPossible) * 100));
  const stage = stageFor(progress);
  const partnerOnline = Boolean(partner && Date.now() - Date.parse(partner.last_seen_at) < 45000);
  const streakDays = await getStreak(session.db, session.roomId, members.length);
  const focusCompletions = completionRows.filter((row) => row.task_id === 4).length;
  return {
    storage: 'd1' as const,
    generatedAt: nowIso(),
    today,
    room: { id: room.id, code: room.code, name: room.name, wateredAt: room.watered_at, updatedAt: room.updated_at },
    currentUser: { id: currentMember.user_id, name: currentMember.display_name, initials: currentMember.initials },
    partner: partner ? { id: partner.user_id, name: partner.display_name, initials: partner.initials } : null,
    partnerOnline,
    members: members.map((member) => ({ id: member.user_id, name: member.display_name, initials: member.initials, isCurrentUser: member.user_id === session.identity.userId, lastSeenAt: member.last_seen_at })),
    tasks: tasksResult.results.map((task) => ({ id: task.id, title: task.title, detail: task.detail, category: task.category, icon: task.icon, completed: currentCompletionIds.has(task.id), completedByPartner: partnerCompletionIds.has(task.id) })),
    completedCount,
    partnerCompletedCount,
    plant: { progress, stage: stage.code, label: stage.label },
    metrics: { streakDays, waterCount: Number(waterResult?.count ?? 0), focusMinutes: focusCompletions * 25, unlockedPlants: Math.min(12, Math.max(1, Math.floor(progress / 18) + 1)), lastSync: relativeLabel(room.updated_at) },
    lastWateredLabel: relativeLabel(room.watered_at),
    events: eventsResult.results.map((event) => ({ id: event.id, type: event.type, message: event.message, createdAt: event.created_at, userId: event.user_id, name: event.display_name, initials: event.initials })),
    journal: journalResult.results.map((entry) => ({ id: entry.id, authorId: entry.author_id, authorName: entry.display_name, title: entry.title, text: entry.text, tone: entry.tone, createdAt: entry.created_at })),
  };
}
