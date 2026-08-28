export type HabitIconName =
  | 'calendar'
  | 'clock'
  | 'heart'
  | 'leaf'
  | 'message'
  | 'seed'
  | 'spark'
  | 'sun'
  | 'water';

export type HabitTaskSeed = {
  id: number;
  title: string;
  detail: string;
  category: string;
  icon: HabitIconName;
  sortOrder: number;
};

export const HABIT_TASKS: HabitTaskSeed[] = [
  { id: 1, title: '醒来先喝一杯水', detail: '300 ml · 清晨', category: '身体', icon: 'water', sortOrder: 1 },
  { id: 2, title: '晒到 10 分钟阳光', detail: '10 min · 能量', category: '能量', icon: 'sun', sortOrder: 2 },
  { id: 3, title: '整理床铺', detail: '2 min · 空间', category: '空间', icon: 'seed', sortOrder: 3 },
  { id: 4, title: '完成一次专注冲刺', detail: '25 min · 工作', category: '专注', icon: 'clock', sortOrder: 4 },
  { id: 5, title: '走出去动一动', detail: '15 min · 身体', category: '身体', icon: 'heart', sortOrder: 5 },
  { id: 6, title: '吃一份绿色食物', detail: '1 serving · 营养', category: '营养', icon: 'leaf', sortOrder: 6 },
  { id: 7, title: '和对方读十分钟', detail: '10 min · 连接', category: '连接', icon: 'message', sortOrder: 7 },
  { id: 8, title: '收拾一个小角落', detail: '5 min · 空间', category: '空间', icon: 'spark', sortOrder: 8 },
  { id: 9, title: '发一条温柔的消息', detail: '1 message · 连接', category: '连接', icon: 'message', sortOrder: 9 },
  { id: 10, title: '睡前写下三件好事', detail: '3 lines · 日记', category: '日记', icon: 'calendar', sortOrder: 10 },
  { id: 11, title: '在 23:00 前关灯', detail: 'before 23:00 · 休息', category: '休息', icon: 'sun', sortOrder: 11 },
];
