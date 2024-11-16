export type HabitFrequency = 'daily' | 'weekly' | 'custom';
export type TaskStatus = 'neutral' | 'completed' | 'failed';

export interface DayProgress {
  date: string;
  status: TaskStatus;
}

export interface WeeklyProgress {
  startDate: string;
  days: DayProgress[];
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  target: number;
  tags: string[];
  color: string;
  createdAt: Date;
  weeklyProgress: WeeklyProgress[];
  order: number;
}