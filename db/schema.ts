import { HABIT_TASKS } from '../app/lib/habi-content';

export const D1_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '我们的花园',
    watered_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS room_members (
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    initials TEXT NOT NULL,
    joined_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    PRIMARY KEY (room_id, user_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id)`,
  `CREATE TABLE IF NOT EXISTS habit_tasks (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    detail TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS task_completions (
    room_id TEXT NOT NULL,
    task_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    user_id TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    PRIMARY KEY (room_id, task_id, date, user_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_task_completions_room_date ON task_completions(room_id, date)`,
  `CREATE TABLE IF NOT EXISTS garden_events (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    task_id INTEGER,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_garden_events_room_created ON garden_events(room_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    tone TEXT NOT NULL DEFAULT 'sage',
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_journal_entries_room_created ON journal_entries(room_id, created_at DESC)`,
];

export const TASK_SEED_STATEMENTS = HABIT_TASKS.map((task) => ({
  sql: `INSERT OR IGNORE INTO habit_tasks (id, title, detail, category, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
  bindings: [task.id, task.title, task.detail, task.category, task.icon, task.sortOrder] as Array<string | number>,
}));
