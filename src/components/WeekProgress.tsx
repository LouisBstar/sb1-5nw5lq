import React from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekProgressProps {
  progress: { [key: string]: TaskStatus };
  onUpdateStatus: (date: string) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function WeekProgress({ progress, onUpdateStatus, currentDate, onDateChange }: WeekProgressProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? subWeeks(currentDate, 1) 
      : addWeeks(currentDate, 1);
    onDateChange(newDate);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'failed':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
    }
  };

  const renderWeek = (startDate: Date) => {
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    return (
      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {weekDays.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const status = progress[dateKey] || 'neutral';
          const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

          return (
            <motion.div
              key={dateKey}
              className="flex flex-col items-center"
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-[10px] md:text-sm text-gray-600 mb-1 md:mb-2">
                {format(date, 'EEE')}
              </span>
              <button
                onClick={() => onUpdateStatus(dateKey)}
                className={`w-8 h-8 md:w-12 md:h-12 rounded-lg flex items-center justify-center transition-colors text-xs md:text-base font-medium
                  ${getStatusColor(status)}
                  ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                `}
              >
                {format(date, 'd')}
              </button>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-3 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <button
          onClick={() => navigateWeek('prev')}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        
        <h2 className="text-base md:text-lg font-semibold text-gray-900">
          {`${format(weekStart, 'MMM d')} - ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`}
        </h2>
        
        <button
          onClick={() => navigateWeek('next')}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="overflow-x-auto -mx-3 px-3 pb-2"
      >
        <div className="min-w-min">
          {renderWeek(weekStart)}
        </div>
      </motion.div>
    </div>
  );
}