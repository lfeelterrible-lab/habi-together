CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '我们的花园',
  watered_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS room_members (
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  initials TEXT NOT NULL,
  joined_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);

CREATE TABLE IF NOT EXISTS habit_tasks (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS task_completions (
  room_id TEXT NOT NULL,
  task_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  user_id TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  PRIMARY KEY (room_id, task_id, date, user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_completions_room_date ON task_completions(room_id, date);

CREATE TABLE IF NOT EXISTS garden_events (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  task_id INTEGER,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_garden_events_room_created ON garden_events(room_id, created_at DESC);

CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'sage',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_room_created ON journal_entries(room_id, created_at DESC);

INSERT OR IGNORE INTO habit_tasks (id, title, detail, category, icon, sort_order) VALUES (1, '醒来先喝一杯水', '300 ml · 清晨', '身体', 'water', 1);
INSERT OR IGNORE INTO habit_tasks (id, title, detail, category, icon, sort_order) VALUES (2, '晒到 10 分钟阳光', '10 min · 能量', '能量', 'sun', 2);
INSERT OR IGNORE INTO habit_tasks (id, title, detail, category, icon, sort_order) VALUES (3, '整理床铺', '2 min · 空间', '空间', 'seed', 3);
INSERT OR IGNORE INTO habit_tasks (id, title, detail, category, icon, sort_order) VALUES (4, '完成一次专注冲刺', '25 min · 工作', '专注', 'clock', 4);
INSERT OR IGNORE INTO habit_tasks (id, title, detail, category, icon, sort_order) VALUES (5, '走出去动一动', '15 min · 身体', '身体', 'heart', 5);
INSERT OR IGNORE INTO habit_tasks (id, title, detail, category, icon, sort_order) VALUES (6, '吃一份绿色食物', '1 serving · 营养', '营养', 'leaf', 6);
INSERT OR IGNORE INTO habit_tasks (id, title, detail, category, icon, sort_order) VALUES (7, '和对方读十分钟', '10 min · 连接', '连接', 'message', 7);
INSERT OR IGNORE INTO habit_tasks (id, title, detail, category, icon, sort_order) VALUES (8, '收拾一个小角落', '5 min · 空间', '空间', 'spark', 8);
INSERT OR IGNORE INTO habit_tasks (id, title, detail, category, icon, sort_order) VALUES (9, '发一条温柔的消息', '1 message · 连接', '连接', 'message', 9);
INSERT OR IGNORE INTO habit_tasks (id, title, detail, category, icon, sort_order) VALUES (10, '睡前写下三件好事', '3 lines · 日记', '日记', 'calendar', 10);
INSERT OR IGNORE INTO habit_tasks (id, title, detail, category, icon, sort_order) VALUES (11, '在 23:00 前关灯', 'before 23:00 · 休息', '休息', 'sun', 11);
