import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, subWeeks, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { Habit } from '../types/habit';

interface AnalyticsProps {
  habits: Habit[];
}

type ChartType = 'bar' | 'pie';
type TimeRange = 'thisWeek' | 'lastWeek' | 'month' | 'threeMonths' | 'custom';
type FilterType = 'all' | 'single' | 'category';

const COLORS = {
  completed: '#059669', // Green
  uncompleted: '#DC2626', // Red
  categories: ['#4F46E5', '#7C3AED', '#2563EB', '#D97706', '#059669'],
};

export function Analytics({ habits }: AnalyticsProps) {
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedHabit, setSelectedHabit] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());

  const categories = useMemo(() => {
    const tags = new Set<string>();
    habits.forEach(habit => {
      habit.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [habits]);

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case 'thisWeek':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        };
      case 'lastWeek':
        return {
          start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
          end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
        };
      case 'month':
        return {
          start: subMonths(now, 1),
          end: now,
        };
      case 'threeMonths':
        return {
          start: subMonths(now, 3),
          end: now,
        };
      case 'custom':
        return {
          start: customStartDate,
          end: customEndDate,
        };
      default:
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        };
    }
  };

  const calculateHabitCompletion = (habit: Habit, dateRange: { start: Date; end: Date }) => {
    if (!habit.weeklyProgress || habit.weeklyProgress.length === 0) return 0;

    const relevantDays = habit.weeklyProgress
      .flatMap(wp => wp.days)
      .filter(day => {
        const dayDate = parseISO(day.date);
        return isWithinInterval(dayDate, dateRange);
      });

    if (relevantDays.length === 0) return 0;

    const completed = relevantDays.filter(day => day.status === 'completed').length;
    const target = habit.frequency === 'daily' ? relevantDays.length : habit.target;
    return (completed / target) * 100;
  };

  const calculateCategoryCompletion = (category: string, dateRange: { start: Date; end: Date }) => {
    const categoryHabits = habits.filter(habit => habit.tags.includes(category));
    if (categoryHabits.length === 0) return 0;

    const completionRates = categoryHabits.map(habit => calculateHabitCompletion(habit, dateRange));
    return completionRates.reduce((sum, rate) => sum + rate, 0) / categoryHabits.length;
  };

  const calculateOverallCompletion = (dateRange: { start: Date; end: Date }) => {
    if (habits.length === 0) return 0;
    const completionRates = habits.map(habit => calculateHabitCompletion(habit, dateRange));
    return completionRates.reduce((sum, rate) => sum + rate, 0) / habits.length;
  };

  const getChartData = () => {
    const dateRange = getDateRange();

    const formatDataWithCompletion = (name: string, value: number) => [
      {
        name,
        type: 'Completed',
        value: Math.round(value),
        color: COLORS.completed,
      },
      {
        name,
        type: 'Uncompleted',
        value: Math.round(100 - value),
        color: COLORS.uncompleted,
      },
    ];

    if (filterType === 'all') {
      const overallCompletion = calculateOverallCompletion(dateRange);
      return formatDataWithCompletion('Overall', overallCompletion);
    } else if (filterType === 'category') {
      if (selectedCategory) {
        const completion = calculateCategoryCompletion(selectedCategory, dateRange);
        return formatDataWithCompletion(selectedCategory, completion);
      }
      return categories.flatMap((category, index) => {
        const completion = calculateCategoryCompletion(category, dateRange);
        return formatDataWithCompletion(category, completion);
      });
    } else {
      const habit = habits.find(h => h.id === selectedHabit);
      if (!habit) return [];
      const completion = calculateHabitCompletion(habit, dateRange);
      return formatDataWithCompletion(habit.name, completion);
    }
  };

  const chartData = useMemo(getChartData, [habits, filterType, selectedHabit, selectedCategory, timeRange, customStartDate, customEndDate, categories]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.payload.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-lg ${
                chartType === 'bar' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
              }`}
            >
              <BarChart2 size={20} />
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`p-2 rounded-lg ${
                chartType === 'pie' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
              }`}
            >
              <PieChartIcon size={20} />
            </button>
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="thisWeek">This Week</option>
            <option value="lastWeek">Last Week</option>
            <option value="month">Last Month</option>
            <option value="threeMonths">Last 3 Months</option>
            <option value="custom">Custom Range</option>
          </select>

          {timeRange === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={format(customStartDate, 'yyyy-MM-dd')}
                onChange={(e) => setCustomStartDate(new Date(e.target.value))}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <span>to</span>
              <input
                type="date"
                value={format(customEndDate, 'yyyy-MM-dd')}
                onChange={(e) => setCustomEndDate(new Date(e.target.value))}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <select
            value={filterType}
            onChange={(e) => {
              const newFilterType = e.target.value as FilterType;
              setFilterType(newFilterType);
              if (newFilterType !== 'category') {
                setSelectedCategory('');
              }
            }}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Habits</option>
            <option value="single">Single Habit</option>
            <option value="category">By Category</option>
          </select>

          {filterType === 'single' && (
            <select
              value={selectedHabit}
              onChange={(e) => setSelectedHabit(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a habit</option>
              {habits.map((habit) => (
                <option key={habit.id} value={habit.id}>
                  {habit.name}
                </option>
              ))}
            </select>
          )}

          {filterType === 'category' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Percentage">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, type, value }) => `${name} ${type}: ${value}%`}
                  outerRadius={120}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(new Set(chartData.map(data => data.name))).map((name) => {
            const completed = chartData.find(d => d.name === name && d.type === 'Completed');
            return (
              <div
                key={name}
                className="bg-gray-50 rounded-lg p-4"
              >
                <span className="font-medium text-gray-700">{name}</span>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-600" />
                    <span className="text-sm text-gray-600">
                      {completed?.value}% Complete
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-600" />
                    <span className="text-sm text-gray-600">
                      {100 - (completed?.value || 0)}% Incomplete
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}