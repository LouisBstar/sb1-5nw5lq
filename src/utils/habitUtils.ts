import { Habit } from '../types/habit';
import { startOfWeek, format } from 'date-fns';

export function calculateWeeklyProgress(habits: Habit[]): number {
  if (!habits.length) return 0;

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');

  const totalCompletions = habits.reduce((sum, habit) => {
    const weekProgress = habit.weeklyProgress.find(wp => wp.startDate === weekStartStr);
    if (!weekProgress) return sum;
    
    const completedDays = weekProgress.days.filter(day => day.status === 'completed').length;
    return sum + completedDays;
  }, 0);

  const totalPossibleCompletions = habits.reduce((sum, habit) => {
    const weekProgress = habit.weeklyProgress.find(wp => wp.startDate === weekStartStr);
    if (!weekProgress) return sum + (habit.frequency === 'daily' ? 7 : habit.target);
    
    return sum + (habit.frequency === 'daily' ? weekProgress.days.length : habit.target);
  }, 0);

  return totalPossibleCompletions > 0 
    ? Math.round((totalCompletions / totalPossibleCompletions) * 100)
    : 0;
}