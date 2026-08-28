import type { HabitIconName } from './habi-content';

export type HabiTask = {
  id: number;
  title: string;
  detail: string;
  category: string;
  icon: HabitIconName;
  completed: boolean;
  completedByPartner: boolean;
};

export type HabiMember = {
  id: string;
  name: string;
  initials: string;
  isCurrentUser?: boolean;
  lastSeenAt?: string;
};

export type HabiEvent = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  userId: string;
  name: string;
  initials: string;
};

export type HabiJournalEntry = {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  text: string;
  tone: string;
  createdAt: string;
};

export type HabiState = {
  storage: 'd1';
  generatedAt: string;
  today: string;
  room: {
    id: string;
    code: string;
    name: string;
    wateredAt: string | null;
    updatedAt: string;
  };
  currentUser: { id: string; name: string; initials: string };
  partner: { id: string; name: string; initials: string } | null;
  partnerOnline: boolean;
  members: HabiMember[];
  tasks: HabiTask[];
  completedCount: number;
  partnerCompletedCount: number;
  plant: { progress: number; stage: string; label: string };
  metrics: { streakDays: number; waterCount: number; focusMinutes: number; unlockedPlants: number; lastSync: string };
  lastWateredLabel: string;
  events: HabiEvent[];
  journal: HabiJournalEntry[];
};
