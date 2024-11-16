import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Calendar } from 'lucide-react';
import { Habit, TaskStatus, WeeklyProgress } from '../types/habit';
import { startOfWeek, format, addDays } from 'date-fns';

interface HabitCardProps {
  habit: Habit;
  onUpdateStatus: (date: string) => void;
  currentDate: Date;
}

export function HabitCard({ habit, onUpdateStatus, currentDate }: HabitCardProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  
  const defaultWeekDays = Array.from({ length: 7 }, (_, i) => ({
    date: format(addDays(weekStart, i), 'yyyy-MM-dd'),
    status: 'neutral' as TaskStatus
  }));
  
  const currentWeekProgress = habit.weeklyProgress.find(wp => 
    wp.startDate === weekStartStr
  ) || {
    startDate: weekStartStr,
    days: defaultWeekDays
  };

  const getCompletionRate = () => {
    const completed = currentWeekProgress.days.filter(p => p.status === 'completed').length;
    const target = habit.frequency === 'daily' ? 7 : habit.target;
    const percentage = (completed / target) * 100;
    return habit.frequency === 'daily' 
      ? Math.min(Math.round(percentage), 100)
      : Math.round(percentage);
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />;
      case 'failed':
        return <X className="w-3 h-3 md:w-4 md:h-4 text-white" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 hover:bg-green-600';
      case 'failed':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-100 hover:bg-gray-200';
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-500';
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getFrequencyText = () => {
    switch (habit.frequency) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        return 'Once a week';
      default:
        return `${habit.target} days per week`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-3 md:p-6 shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 space-y-2 md:space-y-0">
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">{habit.name}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <div className="flex items-center text-xs md:text-sm text-gray-600">
              <Calendar size={12} className="mr-1" />
              {getFrequencyText()}
            </div>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {habit.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-indigo-50 text-indigo-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <motion.span
            key={getCompletionRate()}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-xl md:text-2xl font-bold ${getCompletionColor(getCompletionRate())}`}
          >
            {getCompletionRate()}%
          </motion.span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-3 px-3 pb-2">
        <div className="grid grid-cols-7 gap-1 md:gap-3 min-w-min">
          {currentWeekProgress.days.map((day) => (
            <div key={day.date} className="flex flex-col items-center">
              <span className="text-[10px] md:text-xs text-gray-500 mb-1">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onUpdateStatus(day.date)}
                className={`w-7 h-7 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all
                  ${getStatusColor(day.status)}
                  ${day.status === 'neutral' ? 'border-2 border-gray-200' : ''}
                `}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={day.status}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {getStatusIcon(day.status)}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}