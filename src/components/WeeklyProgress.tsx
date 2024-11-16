import React from 'react';
import { format, startOfWeek, addDays } from 'date-fns';

interface WeeklyProgressProps {
  completedDates: Date[];
  currentDate: Date;
}

export function WeeklyProgress({ completedDates, currentDate }: WeeklyProgressProps) {
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="grid grid-cols-7 gap-2 p-4 bg-white rounded-xl shadow-sm">
      {weekDays.map((date) => {
        const isCompleted = completedDates.some(
          (completedDate) => format(completedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
        const isToday = format(date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');

        return (
          <div
            key={format(date, 'yyyy-MM-dd')}
            className="flex flex-col items-center"
          >
            <span className="text-xs text-gray-600 mb-1">
              {format(date, 'EEE')}
            </span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted
                  ? 'bg-indigo-600 text-white'
                  : isToday
                  ? 'border-2 border-indigo-600 text-indigo-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {format(date, 'd')}
            </div>
          </div>
        );
      })}
    </div>
  );
}