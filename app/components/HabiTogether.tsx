'use client';

import type { CSSProperties, FormEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HABIT_TASKS } from '../lib/habi-content';
import type { HabiJournalEntry, HabiState, HabiTask } from '../lib/habi-types';

type IconName =
  | 'arrow'
  | 'bell'
  | 'calendar'
  | 'check'
  | 'chevron'
  | 'clock'
  | 'garden'
  | 'heart'
  | 'leaf'
  | 'link'
  | 'lock'
  | 'message'
  | 'more'
  | 'plus'
  | 'search'
  | 'seed'
  | 'spark'
  | 'sun'
  | 'water';

type ViewName = 'today' | 'garden' | 'pair' | 'journal';
type Task = HabiTask;

type HabiRuntimeConfig = {
  apiOrigin?: string;
  basePath?: string;
};

const runtimeConfig = typeof window !== 'undefined'
  ? (window as Window & { __HABI_RUNTIME__?: HabiRuntimeConfig }).__HABI_RUNTIME__ ?? {}
  : {};
const HABI_API_ORIGIN = runtimeConfig.apiOrigin?.replace(/\/$/, '') ?? '';
const HABI_PUBLIC_BASE_PATH = runtimeConfig.basePath?.replace(/\/$/, '') ?? '';
const HABI_USER_STORAGE_KEY = 'habi_together_user_id';
const HABI_ROOM_STORAGE_KEY = 'habi_together_room_code';

function publicAsset(path: string) {
  return `${HABI_PUBLIC_BASE_PATH}${path}`;
}

const INITIAL_TASKS: Task[] = HABIT_TASKS.map(({ id, title, detail, category, icon }) => ({
  id,
  title,
  detail,
  category,
  icon,
  completed: false,
  completedByPartner: false,
}));

const NAV_ITEMS: Array<{ id: ViewName; label: string; hint: string; icon: IconName }> = [
  { id: 'today', label: '今日', hint: 'Today', icon: 'sun' },
  { id: 'garden', label: '我们的花园', hint: 'Garden', icon: 'garden' },
  { id: 'pair', label: '双人连接', hint: 'Pair', icon: 'link' },
  { id: 'journal', label: '成长日记', hint: 'Journal', icon: 'calendar' },
];

const GROWTH_SNAPSHOTS = [
  { image: publicAsset('/images/growth-snapshot-01.jpg'), stage: '01 / 起点', title: '找到一点动力', note: '第一轮专注完成 · 87 XP' },
  { image: publicAsset('/images/growth-snapshot-02.jpg'), stage: '02 / 进行中', title: '今天也在发光', note: '一起完成 · 100% 准确' },
  { image: publicAsset('/images/growth-snapshot-03.jpg'), stage: '03 / 长出新叶', title: '把好事继续下去', note: '共同连续 · 第 14 天' },
];

function Icon({ name, size = 18, strokeWidth = 1.8 }: { name: IconName; size?: number; strokeWidth?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'arrow':
      return <svg {...common}><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></svg>;
    case 'bell':
      return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>;
    case 'calendar':
      return <svg {...common}><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M7 3v4M17 3v4M3.5 9.5h17" /><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" /></svg>;
    case 'check':
      return <svg {...common}><path d="m5 12.5 4.2 4.2L19 7" /></svg>;
    case 'chevron':
      return <svg {...common}><path d="m9 6 6 6-6 6" /></svg>;
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.2 2" /></svg>;
    case 'garden':
      return <svg {...common}><path d="M5 20V9.5C5 7 7.2 5 10 5c1.6 0 3.1.7 4 1.8C14.9 5.7 16.4 5 18 5c.6 0 1.2.1 1.7.3" /><path d="M5 13c3-1.7 6.1-1.5 9 .2 2.1 1.2 3.8 1.1 5.8-.2" /><path d="M10 20c.1-3.8 1.6-6.8 4.8-9.1" /></svg>;
    case 'heart':
      return <svg {...common}><path d="M20.8 8.8c0 5.4-8.8 10.1-8.8 10.1S3.2 14.2 3.2 8.8A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.4Z" /></svg>;
    case 'leaf':
      return <svg {...common}><path d="M20.5 3.5C12.2 3.7 6.2 6.4 5 11.1c-.8 3.1 1.8 5.4 4.3 4.4 4-1.6 7.6-5.2 10.8-12Z" /><path d="M4 21c2.9-5.5 7.3-8.7 12.7-11.7" /></svg>;
    case 'link':
      return <svg {...common}><path d="M9.5 14.5 14.5 9.5" /><path d="M7.4 17.1 5.7 18.8a3.3 3.3 0 0 1-4.7-4.7l4-4a3.3 3.3 0 0 1 4.7 0" /><path d="m16.6 6.9 1.7-1.7a3.3 3.3 0 0 1 4.7 4.7l-4 4a3.3 3.3 0 0 1-4.7 0" /></svg>;
    case 'lock':
      return <svg {...common}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
    case 'message':
      return <svg {...common}><path d="M19.5 17.5 21 21l-4.3-1.6A8.5 8.5 0 1 1 19.5 17.5Z" /><path d="M8 10h8M8 14h5" /></svg>;
    case 'more':
      return <svg {...common}><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></svg>;
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case 'search':
      return <svg {...common}><circle cx="10.8" cy="10.8" r="6.6" /><path d="m16 16 4.2 4.2" /></svg>;
    case 'seed':
      return <svg {...common}><path d="M12 20V9" /><path d="M12 10C8 10 5.5 7.8 5.5 4.5 9.2 4.5 12 6 12 10Z" /><path d="M12 14c4 0 6.5-2.2 6.5-5.5C14.8 8.5 12 10 12 14Z" /><path d="M8 20h8" /></svg>;
    case 'spark':
      return <svg {...common}><path d="m12 3 1.4 5.1L18 10l-4.6 1.9L12 17l-1.4-5.1L6 10l4.6-1.9L12 3Z" /><path d="m19 16 .6 2.1L22 19l-2.4.9L19 22l-.6-2.1L16 19l2.4-.9L19 16Z" /></svg>;
    case 'sun':
      return <svg {...common}><circle cx="12" cy="12" r="3.5" /><path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4M18.7 18.7l-1.4-1.4M6.7 6.7 5.3 5.3" /></svg>;
    case 'water':
      return <svg {...common}><path d="M12 3.5s5 5.1 5 9.1a5 5 0 0 1-10 0c0-4 5-9.1 5-9.1Z" /><path d="M10 15.4c.5.7 1.1 1 2 1" /></svg>;
    default:
      return null;
  }
}

function Avatar({ initials, tone, size = 'regular' }: { initials: string; tone: 'sage' | 'clay' | 'lavender'; size?: 'small' | 'regular' | 'large' }) {
  return <span className={`avatar avatar-${tone} avatar-${size}`} aria-hidden="true">{initials}</span>;
}

function LogoMark() {
  return <span className="logo-mark" aria-hidden="true"><span className="logo-stem" /><span className="logo-leaf logo-leaf-left" /><span className="logo-leaf logo-leaf-right" /></span>;
}

function formatDateLabel(date: string | undefined) {
  if (!date) return '今天';
  const parsed = new Date(`${date}T12:00:00+08:00`);
  const weekday = new Intl.DateTimeFormat('zh-CN', { weekday: 'long', timeZone: 'Asia/Shanghai' }).format(parsed);
  return `${weekday} · ${date.slice(5, 7)} 月 ${date.slice(8)} 日`;
}

function formatRelativeTime(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 1000));
  if (seconds < 60) return '刚刚';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时前`;
  return `${Math.floor(seconds / 86400)} 天前`;
}

function formatJournalDate(iso: string) {
  const parts = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Shanghai' }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('month')} 月 ${get('day')} 日 · ${get('hour')}:${get('minute')}`;
}

function TaskList({ tasks, showAll, disabled, onToggle, onShowAll, onNotify }: {
  tasks: Task[];
  showAll: boolean;
  disabled: boolean;
  onToggle: (task: Task) => void;
  onShowAll: () => void;
  onNotify: (message: string) => void;
}) {
  const completedCount = tasks.filter((task) => task.completed).length;
  const visibleTasks = showAll ? tasks : tasks.slice(0, 6);

  return <section className="surface-card task-card" aria-labelledby="task-card-title"><div className="card-heading task-card-heading"><div><p className="section-kicker"><span className="kicker-line" /> 今日的 11 项仪式</p><h2 id="task-card-title">让一天有个好开始</h2></div><div className="task-count"><strong>{String(completedCount).padStart(2, '0')}</strong><span>/ 11</span></div></div><div className="progress-track" aria-label={`今日完成 ${completedCount} 项，共 11 项`}><span style={{ width: `${(completedCount / Math.max(1, tasks.length)) * 100}%` }} /></div><div className="task-list">{visibleTasks.map((task) => <div className={`task-row ${task.completed ? 'is-complete' : ''}`} key={task.id}><span className={`task-icon task-icon-${task.category}`}><Icon name={task.icon} size={16} /></span><button className="task-copy" type="button" disabled={disabled} onClick={() => onToggle(task)}><span className="task-title">{task.title}</span><span className="task-detail">{task.completedByPartner ? `${task.detail} · 对方也完成了` : task.detail}</span></button><button className="task-check" type="button" disabled={disabled} aria-label={task.completed ? `取消完成：${task.title}` : `完成：${task.title}`} aria-pressed={task.completed} onClick={() => onToggle(task)}>{task.completed ? <Icon name="check" size={16} strokeWidth={2.2} /> : <span />}</button></div>)}</div><div className="task-card-footer"><button className="text-button" type="button" onClick={onShowAll}><span>{showAll ? '收起仪式' : '查看全部 11 项'}</span><Icon name="arrow" size={15} /></button><button className="quiet-icon-button" type="button" aria-label="今日仪式设置" onClick={() => onNotify('11 项每日仪式已固定，完成状态会自动保存。')}><Icon name="more" size={17} /></button></div></section>;
}

function PlantFigure() {
  return <div className="plant-figure" aria-hidden="true"><span className="plant-pot" /><span className="plant-stem" /><span className="plant-leaf plant-leaf-a" /><span className="plant-leaf plant-leaf-b" /><span className="plant-leaf plant-leaf-c" /><span className="plant-bloom" /></div>;
}

function GardenWorld({ progress, plantStage, plantLabel, roomCode, lastWateredLabel, partnerOnline, partnerName, watered, disabled, onWater }: {
  progress: number;
  plantStage: string;
  plantLabel: string;
  roomCode: string;
  lastWateredLabel: string;
  partnerOnline: boolean;
  partnerName: string;
  watered: boolean;
  disabled: boolean;
  onWater: () => void;
}) {
  const [gardenMood, setGardenMood] = useState('calm');
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    event.currentTarget.style.setProperty('--garden-shift-x', `${x * 9}px`);
    event.currentTarget.style.setProperty('--garden-shift-y', `${y * 7}px`);
  };
  const resetPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--garden-shift-x', '0px');
    event.currentTarget.style.setProperty('--garden-shift-y', '0px');
  };
  return <section className={`garden-card ${watered ? 'is-watered' : ''}`} style={{ '--garden-image': `url(${publicAsset('/images/duolingo-bird.jpg')})` } as CSSProperties} aria-labelledby="garden-card-title" onPointerMove={handlePointerMove} onPointerLeave={resetPointer}><div className="garden-image" /><div className="garden-vignette" /><div className="garden-grid" /><div className="garden-light garden-light-one" /><div className="garden-light garden-light-two" /><div className="garden-topline"><div className="garden-status"><span className="live-dot" /> {partnerOnline ? '双人实时同步中' : '等待对方上线'}</div><div className="garden-room">{roomCode} <strong>·</strong></div></div><div className="garden-marker garden-marker-one"><span className="marker-dot" /><div><small>NEW LEAF</small><strong>{plantLabel}</strong></div></div><div className="garden-marker garden-marker-two"><span className="marker-dot marker-dot-clay" /><div><small>LAST WATERED</small><strong>{lastWateredLabel} · {partnerOnline ? '你们俩' : '等待记录'}</strong></div></div><div className="garden-compass"><span>N</span><i /></div><div className="garden-bottom-copy"><p className="garden-eyebrow"><span className="kicker-line" /> 共同的生长空间</p><h2 id="garden-card-title">房间里，<em>有光。</em></h2><p className="garden-subtitle">每完成一项，花园都会替你们记住。</p><div className="garden-progress-row"><span>今日养分</span><span><strong>{progress}%</strong> / 100</span></div><div className="garden-progress"><span style={{ width: `${progress}%` }} /></div></div><div className="garden-actions"><button className={`garden-water-button ${watered ? 'is-active' : ''}`} type="button" disabled={disabled} onClick={onWater}><Icon name="water" size={17} /><span>{watered ? '水已送达' : '一起浇水'}</span><Icon name="arrow" size={15} /></button><button className="garden-mood-button" type="button" aria-label="切换花园氛围" onClick={() => setGardenMood(gardenMood === 'calm' ? 'night' : 'calm')}><span className={`mood-swatch mood-${gardenMood}`} /><span>{gardenMood === 'calm' ? '柔光' : '夜色'}</span></button></div><div className="plant-status-card"><div className="plant-status-art"><PlantFigure /></div><div className="plant-status-copy"><span className="mini-label">LEMON BALM · STAGE {plantStage}</span><strong>{plantLabel}</strong><span>{progress}% 距离下一阶段</span></div><div className="plant-ring" style={{ '--plant-progress': `${progress * 3.6}deg` } as CSSProperties}><span>{progress}</span></div></div><span className="garden-partner-label">{partnerName === '等待伙伴' ? '房间码可分享给伙伴' : `${partnerName} 的花园也在这里`}</span></section>;
}

function PairPulse({ streakDays, partnerOnline, partnerName, onNavigate }: { streakDays: number; partnerOnline: boolean; partnerName: string; onNavigate: (view: ViewName) => void }) {
  return <section className="pair-pulse surface-card" aria-labelledby="pair-pulse-title"><div className="pair-pulse-copy"><p className="section-kicker"><span className="kicker-line" /> 你们的共同节奏</p><h2 id="pair-pulse-title">{streakDays} 天，<em>{streakDays ? '没有掉队。' : '从今天开始。'}</em></h2><p>{partnerOnline ? `${partnerName} 在线，完成状态会在几秒内同步到这里。` : '把房间码分享给伙伴，完成同一座花园的第一次绑定。'}</p><button className="text-button" type="button" onClick={() => onNavigate('pair')}><span>查看双人状态</span><Icon name="arrow" size={15} /></button></div><div className="pair-pulse-visual"><div className="pulse-orbit pulse-orbit-one" /><div className="pulse-orbit pulse-orbit-two" /><Avatar initials="Y" tone="sage" size="large" /><span className="pulse-connector" /><Avatar initials={partnerOnline ? 'X' : '?'} tone={partnerOnline ? 'clay' : 'lavender'} size="large" /><span className="pulse-heart"><Icon name="heart" size={14} /></span></div></section>;
}

function MetricCard({ label, value, note, tone, icon }: { label: string; value: string; note: string; tone: string; icon: IconName }) {
  return <div className={`metric-card metric-${tone}`}><div className="metric-icon"><Icon name={icon} size={16} /></div><span className="mini-label">{label}</span><strong>{value}</strong><span className="metric-note">{note}</span></div>;
}

function SnapshotGallery({ onSave }: { onSave: (snapshot: (typeof GROWTH_SNAPSHOTS)[number]) => void }) {
  return <section className="snapshots-card surface-card" aria-labelledby="snapshots-title"><div className="card-heading snapshots-heading"><div><p className="section-kicker"><span className="kicker-line" /> 共同成长快照</p><h2 id="snapshots-title">把每一次坚持，留成一张照片。</h2></div><span className="mini-label">3 MOMENTS</span></div><div className="snapshot-list">{GROWTH_SNAPSHOTS.map((snapshot) => <article className="snapshot-item" key={snapshot.image}><div className="snapshot-photo"><img src={snapshot.image} alt={snapshot.title} loading="lazy" /></div><div className="snapshot-copy"><span className="snapshot-stage">{snapshot.stage}</span><h3>{snapshot.title}</h3><p>{snapshot.note}</p></div><button className="snapshot-button" type="button" onClick={() => onSave(snapshot)} aria-label={`记录${snapshot.title}`}><Icon name="plus" size={14} /></button></article>)}</div></section>;
}

function ViewHeader({ eyebrow, title, description, action, onAction }: { eyebrow: string; title: React.ReactNode; description: string; action?: string; onAction?: () => void }) {
  return <div className="view-header"><div><p className="page-kicker"><span className="kicker-line" /> {eyebrow}</p><h1>{title}</h1><p className="view-description">{description}</p></div>{action && onAction ? <button className="outline-action" type="button" onClick={onAction}><Icon name="plus" size={15} /> {action}</button> : null}</div>;
}

function TodayView({ state, tasks, showAll, isSaving, watered, onToggle, onShowAll, onNotify, onWater, onSaveSnapshot, onNavigate }: { state: HabiState | null; tasks: Task[]; showAll: boolean; isSaving: boolean; watered: boolean; onToggle: (task: Task) => void; onShowAll: () => void; onNotify: (message: string) => void; onWater: () => void; onSaveSnapshot: (snapshot: (typeof GROWTH_SNAPSHOTS)[number]) => void; onNavigate: (view: ViewName) => void }) {
  const metrics = state?.metrics ?? { streakDays: 0, waterCount: 0, focusMinutes: 0, unlockedPlants: 1, lastSync: '连接中' };
  const progress = state?.plant.progress ?? 0;
  const partnerName = state?.partner?.name ?? '等待伙伴';
  return <><ViewHeader eyebrow={formatDateLabel(state?.today)} title={<>一起，把日子<em>种好。</em></>} description="每一次小小的完成，都会在你们的共同花园里留下痕迹。" action="写一条日记" onAction={() => onNavigate('journal')} /><div className="today-grid"><TaskList tasks={tasks} showAll={showAll} disabled={isSaving} onToggle={onToggle} onShowAll={onShowAll} onNotify={onNotify} /><GardenWorld progress={progress} plantStage={state?.plant.stage ?? 'I'} plantLabel={state?.plant.label ?? '刚刚发芽'} roomCode={state?.room.code ?? '连接中'} lastWateredLabel={state?.lastWateredLabel ?? '还没有记录'} partnerOnline={Boolean(state?.partnerOnline)} partnerName={partnerName} watered={watered} disabled={isSaving} onWater={onWater} /></div><div className="lower-grid"><PairPulse streakDays={metrics.streakDays} partnerOnline={Boolean(state?.partnerOnline)} partnerName={partnerName} onNavigate={onNavigate} /><div className="metrics-grid"><MetricCard label="共同连续" value={`${metrics.streakDays} 天`} note={metrics.streakDays ? '持续完成同一天的仪式' : '完成当天 11 项后开始计算'} tone="sage" icon="spark" /><MetricCard label="花园浇水" value={`${metrics.waterCount} 次`} note={state?.lastWateredLabel ?? '还没有记录'} tone="clay" icon="water" /><MetricCard label="共同专注" value={`${metrics.focusMinutes} 分钟`} note={`${metrics.unlockedPlants} / 12 株植物已解锁`} tone="lavender" icon="lock" /></div></div><SnapshotGallery onSave={onSaveSnapshot} /></>;
}

function GardenView({ state, isSaving, watered, onWater, onNotify }: { state: HabiState | null; isSaving: boolean; watered: boolean; onWater: () => void; onNotify: (message: string) => void }) {
  const metrics = state?.metrics ?? { streakDays: 0, waterCount: 0, focusMinutes: 0, unlockedPlants: 1, lastSync: '连接中' };
  return <><ViewHeader eyebrow={`共享空间 · ${state?.room.code ?? '连接中'}`} title={<>花园正在<em>醒来。</em></>} description="这里记录着你们一起完成过的每一件小事。可以拖动视角，看看新叶长在哪里。" action="种下一颗种子" onAction={() => onNotify('新的种子会在完成下一项仪式后发芽。')} /><div className="garden-view-layout"><GardenWorld progress={state?.plant.progress ?? 0} plantStage={state?.plant.stage ?? 'I'} plantLabel={state?.plant.label ?? '刚刚发芽'} roomCode={state?.room.code ?? '连接中'} lastWateredLabel={state?.lastWateredLabel ?? '还没有记录'} partnerOnline={Boolean(state?.partnerOnline)} partnerName={state?.partner?.name ?? '等待伙伴'} watered={watered} disabled={isSaving} onWater={onWater} /><aside className="garden-side-panel surface-card"><div className="card-heading"><div><p className="section-kicker"><span className="kicker-line" /> 生长档案</p><h2>一块地，两个人。</h2></div><Icon name="garden" size={21} /></div><div className="growth-stat"><span className="mini-label">CURRENT STAGE</span><strong>{state?.plant.stage ?? 'I'} / {state?.plant.label ?? '刚刚发芽'}</strong><p>所有成长数据都来自这座花园的真实完成记录。</p></div><div className="growth-list"><div><span>已经浇水</span><strong>{metrics.waterCount} 次</strong></div><div><span>解锁植物</span><strong>{String(metrics.unlockedPlants).padStart(2, '0')} / 12</strong></div><div><span>共同专注</span><strong>{metrics.focusMinutes}m</strong></div></div><button className="dark-action" type="button" onClick={() => { void navigator.clipboard?.writeText(state?.room.code ?? ''); onNotify('房间码已复制，可以发给伙伴。'); }}><Icon name="link" size={16} /> 分享这座花园 <Icon name="arrow" size={15} /></button></aside></div></>;
}

function PairView({ state, isSaving, onNotify, onJoinRoom, onHighFive }: { state: HabiState | null; isSaving: boolean; onNotify: (message: string) => void; onJoinRoom: (code: string, name: string) => Promise<void>; onHighFive: () => void }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('小满');
  const partner = state?.partner;
  const members = state?.members ?? [];
  const events = state?.events ?? [];
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!code.trim()) return;
    await onJoinRoom(code, name);
    setCode('');
  };
  return <><ViewHeader eyebrow={`双人连接 · ${state?.room.code ?? '连接中'}`} title={<>两个人的习惯，<em>不必一个人扛。</em></>} description="实时同步彼此的完成状态，在对方需要的时候，送一滴水过去。" /><div className="pair-view-grid"><section className="pair-hero surface-card"><div className="pair-hero-top"><span className={`online-badge ${state?.partnerOnline ? '' : 'is-waiting'}`}><span className="live-dot" /> {state?.partnerOnline ? '在线 · 实时同步' : partner ? '已绑定 · 等待上线' : '等待伙伴加入'}</span><button className="quiet-icon-button" type="button" aria-label="更多连接设置" onClick={() => onNotify('房间码绑定只允许两位成员，数据保存在 D1。')}><Icon name="more" size={18} /></button></div><div className="pair-avatars"><div className="pair-avatar-wrap"><Avatar initials={state?.currentUser.initials ?? 'Y'} tone="sage" size="large" /><span className="avatar-status" /></div><div className="pair-line" /><div className="pair-avatar-wrap"><Avatar initials={partner?.initials ?? '?'} tone={partner ? 'clay' : 'lavender'} size="large" />{partner ? <span className="avatar-status" /> : null}</div></div><div className="pair-names"><strong>{state?.currentUser.name ?? '你'}</strong><span>+</span><strong>{partner?.name ?? '等待伙伴'}</strong></div><p className="pair-quote">“今天也一起走到这里。”</p><div className="pair-streak"><span>共同连续</span><strong>{state?.metrics.streakDays ?? 0}</strong><small>天</small><div className="streak-bars">{Array.from({ length: 14 }).map((_, index) => <span key={index} className={index >= (state?.metrics.streakDays ?? 0) ? 'is-soft' : ''} />)}</div></div><div className="pair-code-block"><div><span className="mini-label">SHARED ROOM CODE</span><small>把这个码发给第二个人</small></div><div className="pair-code-row"><strong>{state?.room.code ?? '连接中'}</strong><button type="button" onClick={() => { void navigator.clipboard?.writeText(state?.room.code ?? ''); onNotify('房间码已复制。'); }}>复制</button></div></div></section><section className="connection-details surface-card"><div className="card-heading"><div><p className="section-kicker"><span className="kicker-line" /> 连接详情</p><h2>一起完成，比完成更多。</h2></div><Icon name="link" size={21} /></div><div className="connection-members"><span className="mini-label">MEMBERS · {members.length} / 2</span>{members.map((member) => <div className="connection-member" key={member.id}><Avatar initials={member.initials} tone={member.isCurrentUser ? 'sage' : 'clay'} size="small" /><div><strong>{member.name}{member.isCurrentUser ? ' · 你' : ''}</strong><span>{member.isCurrentUser || state?.partnerOnline ? '最近在线' : '等待上线'}</span></div><span className="event-check"><Icon name="check" size={13} /></span></div>)}{!partner ? <p className="empty-state">还差一个伙伴。输入房间码即可加入另一座花园。</p> : null}</div><form className="pair-join-form" onSubmit={(event) => { void handleSubmit(event); }}><div className="form-heading"><span className="mini-label">JOIN A GARDEN</span><small>你也可以在这里切换到别人的房间</small></div><label>房间码<input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="TWN-AB12" maxLength={13} autoComplete="off" /></label><label>你的名字<input value={name} onChange={(event) => setName(event.target.value)} placeholder="小满" maxLength={24} /></label><button className="dark-action" type="submit" disabled={isSaving || !code.trim()}><Icon name="link" size={16} /> {isSaving ? '正在绑定…' : '绑定这座花园'} <Icon name="arrow" size={15} /></button></form><div className="connection-events"><span className="mini-label">RECENT EVENTS</span>{events.length ? events.slice(0, 3).map((event) => <div className="connection-event" key={event.id}><Avatar initials={event.initials} tone={event.userId === state?.currentUser.id ? 'sage' : 'clay'} size="small" /><div><strong>{event.message}</strong><span>{formatRelativeTime(event.createdAt)} · 已保存</span></div><span className="event-check"><Icon name="check" size={13} /></span></div>) : <p className="empty-state">完成一项仪式或浇一次水，这里就会留下第一条记录。</p>}</div><button className="dark-action" type="button" disabled={isSaving} onClick={onHighFive}><Icon name="heart" size={16} /> 送一个击掌 <Icon name="arrow" size={15} /></button></section></div></>;
}

function JournalView({ entries, isSaving, onNotify, onCreateJournal }: { entries: HabiJournalEntry[]; isSaving: boolean; onNotify: (message: string) => void; onCreateJournal: (title: string, text: string) => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !text.trim()) {
      onNotify('先写下标题和一句话，再保存这页日记。');
      return;
    }
    await onCreateJournal(title, text);
    setTitle('');
    setText('');
  };
  return <><ViewHeader eyebrow="成长日记 · 共同记录" title={<>把那些<em>微小的好事</em>留下来。</>} description="习惯不是一条直线，是你们一起走过的许多片刻。" action="写下今天" onAction={() => document.getElementById('journal-title')?.focus()} /><div className="journal-layout"><section className="journal-card surface-card"><div className="card-heading"><div><p className="section-kicker"><span className="kicker-line" /> 最近发生</p><h2>你们的共同时间线</h2></div><span className="mini-label">{entries.length} ENTRIES</span></div><div className="journal-list">{entries.length ? entries.map((entry) => <article className="journal-entry" key={entry.id}><span className={`journal-node node-${entry.tone}`} /><div><span className="journal-date">{formatJournalDate(entry.createdAt)} · {entry.authorName}</span><h3>{entry.title}</h3><p>{entry.text}</p></div><Icon name="chevron" size={17} /></article>) : <div className="empty-journal"><span className="note-sun"><Icon name="seed" size={16} /></span><strong>第一件好事，还等着被记下来。</strong><p>写一句话，保存后它会出现在你们两个人的时间线上。</p></div>}</div></section><aside className="journal-note surface-card"><span className="note-sun"><Icon name="sun" size={16} /></span><p className="section-kicker"><span className="kicker-line" /> 今日提示</p><h2>留一点时间，给正在发生的好事。</h2><p>不必写得完整。一句话、一个瞬间，也足够让未来的你们重新回到今天。</p><form className="journal-form" onSubmit={(event) => { void submit(event); }}><label htmlFor="journal-title">标题<input id="journal-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="今天也一起走到这里" maxLength={80} /></label><label htmlFor="journal-text">记下这一刻<textarea id="journal-text" value={text} onChange={(event) => setText(event.target.value)} placeholder="一句话就够了…" rows={4} maxLength={240} /></label><button className="text-button" type="submit" disabled={isSaving}><span>{isSaving ? '正在保存…' : '保存到共同日记'}</span><Icon name="arrow" size={15} /></button></form></aside></div></>;
}

function externalHeaders() {
  if (!HABI_API_ORIGIN || typeof window === 'undefined') return {};
  let userId = window.localStorage.getItem(HABI_USER_STORAGE_KEY);
  if (!userId) {
    userId = window.crypto.randomUUID();
    window.localStorage.setItem(HABI_USER_STORAGE_KEY, userId);
  }
  const roomCode = window.localStorage.getItem(HABI_ROOM_STORAGE_KEY);
  return {
    'X-Habi-User-Id': userId,
    ...(roomCode ? { 'X-Habi-Room-Code': roomCode } : {}),
  };
}

async function requestHabiState(path: string, options?: RequestInit) {
  const response = await fetch(`${HABI_API_ORIGIN}${path}`, { ...options, cache: 'no-store', credentials: HABI_API_ORIGIN ? 'include' : 'same-origin', headers: { 'Content-Type': 'application/json', ...externalHeaders(), ...(options?.headers ?? {}) } });
  const payload = await response.json() as HabiState | { error?: string };
  if (!response.ok) throw new Error('error' in payload && payload.error ? payload.error : '连接花园数据失败。');
  const next = payload as HabiState;
  if (HABI_API_ORIGIN && typeof window !== 'undefined' && next.room?.code) window.localStorage.setItem(HABI_ROOM_STORAGE_KEY, next.room.code);
  return next;
}

export default function HabiTogether() {
  const [activeView, setActiveView] = useState<ViewName>('today');
  const [data, setData] = useState<HabiState | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [watered, setWatered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dataError, setDataError] = useState('');
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | null>(null);

  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 3400);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const next = await requestHabiState('/api/habi/state');
        if (mounted) {
          setData(next);
          setDataError('');
          setIsLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setDataError(error instanceof Error ? error.message : '连接花园数据失败。');
          setIsLoading(false);
        }
      }
    };
    void load();
    const poll = window.setInterval(() => { void load(); }, 5000);
    return () => {
      mounted = false;
      window.clearInterval(poll);
    };
  }, []);

  const completedCount = useMemo(() => data?.completedCount ?? 0, [data]);
  const tasks = data?.tasks ?? INITIAL_TASKS;

  const mutate = async (path: string, body: Record<string, unknown>, successMessage?: string) => {
    setIsSaving(true);
    try {
      const next = await requestHabiState(path, { method: 'POST', body: JSON.stringify(body) });
      setData(next);
      setDataError('');
      if (successMessage) notify(successMessage);
    } catch (error) {
      notify(error instanceof Error ? error.message : '保存失败，请稍后重试。');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTask = (task: Task) => { void mutate('/api/habi/task', { taskId: task.id, completed: !task.completed }, task.completed ? `${task.title} 已撤回，数据已保存。` : `${task.title} 已完成，并同步给伙伴。`); };
  const waterGarden = () => { setWatered(true); window.setTimeout(() => setWatered(false), 2400); void mutate('/api/habi/water', {}, '你们一起给花园浇了水。记录已保存。'); };
  const highFive = () => { void mutate('/api/habi/high-five', {}, '击掌已送达伙伴的花园。'); };
  const createJournal = async (title: string, text: string) => { await mutate('/api/habi/journal', { title, text }, '这件小事已经留在你们的共同日记里。'); };
  const saveSnapshot = async (snapshot: (typeof GROWTH_SNAPSHOTS)[number]) => { await mutate('/api/habi/journal', { title: snapshot.title, text: `${snapshot.note}。来自共同成长快照。` }, `${snapshot.title} 已放进你们的成长日记。`); };
  const joinRoom = async (code: string, name: string) => { await mutate('/api/habi/join', { code, name }, '已经绑定到这座花园，接下来一起完成吧。'); setActiveView('today'); };

  return <div className={`habi-shell ${isLoading ? 'is-loading' : ''}`}><aside className="habi-sidebar"><div><div className="brand-lockup"><LogoMark /><div><span className="brand-name">HabiTogether</span><span className="brand-tagline">shared habits, softer days</span></div></div><div className="sidebar-divider" /><p className="sidebar-label">工作台</p><nav className="primary-nav" aria-label="主导航">{NAV_ITEMS.map((item) => <button className={`nav-item ${activeView === item.id ? 'is-active' : ''}`} key={item.id} type="button" onClick={() => setActiveView(item.id)} aria-current={activeView === item.id ? 'page' : undefined}><span className="nav-icon"><Icon name={item.icon} size={17} /></span><span><strong>{item.label}</strong><small>{item.hint}</small></span>{activeView === item.id ? <span className="nav-active-mark" /> : null}</button>)}</nav></div><div className="sidebar-bottom"><div className="sidebar-weather"><div className="weather-icon"><Icon name="water" size={15} /></div><div><span>今日数据</span><strong>{completedCount} / 11 已完成</strong></div><span className="weather-arrow">↗</span></div><div className="sidebar-pair"><div className="avatar-stack"><Avatar initials={data?.currentUser.initials ?? 'Y'} tone="sage" size="small" />{data?.partner ? <Avatar initials={data.partner.initials} tone="clay" size="small" /> : null}</div><div><span>当前花园</span><strong>{data?.room.code ?? '连接中'}</strong></div><button type="button" aria-label="打开连接设置" onClick={() => setActiveView('pair')}><Icon name="more" size={16} /></button></div><div className="sidebar-footer"><span><span className={`footer-dot ${dataError ? 'is-error' : ''}`} /> {dataError ? '需要检查连接' : data ? 'D1 安全同步' : '连接数据库中'}</span><span>v0.5.0</span></div></div></aside><main className="habi-main"><header className="top-header"><div className="breadcrumb"><span>HABITOGETHER</span><i>/</i><strong>{NAV_ITEMS.find((item) => item.id === activeView)?.hint.toUpperCase()}</strong></div><div className="header-actions"><span className={`sync-status ${dataError ? 'is-error' : ''}`}><span className="live-dot" /> {dataError ? '数据库未连接' : isSaving ? '正在保存' : data ? (data.partnerOnline ? '和伙伴同步中' : '数据已保存') : '连接数据中'}</span><button className="header-icon-button" type="button" aria-label="搜索" onClick={() => notify('搜索会在下一版开放，先去看看今天的仪式吧。')}><Icon name="search" size={18} /></button><button className="header-icon-button has-notice" type="button" aria-label="通知" onClick={() => notify(data?.events[0]?.message ?? '完成第一项仪式后，这里会出现同步动态。')}><Icon name="bell" size={18} /></button><Avatar initials={data?.currentUser.initials ?? 'Y'} tone="sage" size="small" /></div></header><div className="habi-content">{dataError ? <div className="data-status-banner" role="alert"><span className="status-icon"><Icon name="lock" size={15} /></span><div><strong>暂时读不到共享数据</strong><p>{dataError} 本地页面仍可浏览，完成保存前请先配置 Sites 的 D1 绑定。</p></div><button type="button" onClick={() => window.location.reload()}>重试</button></div> : null}{activeView === 'today' ? <TodayView state={data} tasks={tasks} showAll={showAll} isSaving={isSaving} watered={watered} onToggle={toggleTask} onShowAll={() => setShowAll((current) => !current)} onNotify={notify} onWater={waterGarden} onSaveSnapshot={(snapshot) => { void saveSnapshot(snapshot); }} onNavigate={setActiveView} /> : null}{activeView === 'garden' ? <GardenView state={data} isSaving={isSaving} watered={watered} onWater={waterGarden} onNotify={notify} /> : null}{activeView === 'pair' ? <PairView state={data} isSaving={isSaving} onNotify={notify} onJoinRoom={joinRoom} onHighFive={highFive} /> : null}{activeView === 'journal' ? <JournalView entries={data?.journal ?? []} isSaving={isSaving} onNotify={notify} onCreateJournal={createJournal} /> : null}<footer className="content-footer"><span>MADE FOR TWO <i>·</i> CULTIVATE THE ORDINARY</span><span>{data ? 'D1 真实数据 · 每 5 秒同步' : '正在连接 D1 数据库'}</span></footer></div></main>{toast ? <div className="toast" role="status" aria-live="polite"><span className="toast-mark"><Icon name="check" size={14} /></span><span>{toast}</span></div> : null}</div>;
}
