export type NotificationRepeat = 'daily' | 'weekly' | 'custom';

export interface NotificationTime {
  hour: number;
  minute: number;
}

export interface NotificationSchedule {
  id: string;
  time: NotificationTime;
  enabled: boolean;
  sound: string;
  repeat: NotificationRepeat;
  days: number[]; // 0-6 for Sunday-Saturday
  label: string;
}