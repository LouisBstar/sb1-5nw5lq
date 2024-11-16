import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  where,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './authStore';
import { Habit, DayProgress, WeeklyProgress } from '../types/habit';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, parseISO, addDays } from 'date-fns';

interface HabitStore {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  updateHabitProgress: (habitId: string, date: string, status: DayProgress['status']) => Promise<void>;
  reorderHabits: (sourceId: string, destinationId: string) => Promise<void>;
}

function generateWeekProgress(startDate: Date): WeeklyProgress {
  const start = startOfWeek(startDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => ({
    date: format(addDays(start, i), 'yyyy-MM-dd'),
    status: 'neutral' as const
  }));

  return {
    startDate: format(start, 'yyyy-MM-dd'),
    days
  };
}

function findOrCreateWeekProgress(habit: Habit, date: string): WeeklyProgress {
  const targetDate = parseISO(date);
  const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');

  let weekProgress = habit.weeklyProgress.find(wp => wp.startDate === weekStartStr);
  
  if (!weekProgress) {
    weekProgress = generateWeekProgress(targetDate);
    habit.weeklyProgress.push(weekProgress);
    habit.weeklyProgress.sort((a, b) => 
      parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime()
    );
  }

  return weekProgress;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  loading: false,
  error: null,

  fetchHabits: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const habitsRef = collection(db, 'habits');
      const q = query(
        habitsRef,
        where('userId', '==', user.id),
        orderBy('order', 'asc'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const habits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        weeklyProgress: doc.data().weeklyProgress || [],
        order: doc.data().order || 0
      })) as Habit[];

      set({ habits, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch habits', loading: false });
    }
  },

  addHabit: async (habitData) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const habitsRef = collection(db, 'habits');
      const currentWeek = generateWeekProgress(new Date());
      
      // Get the highest order value
      const habits = get().habits;
      const maxOrder = habits.reduce((max, habit) => Math.max(max, habit.order || 0), 0);
      
      const newHabit = {
        ...habitData,
        userId: user.id,
        createdAt: new Date(),
        weeklyProgress: [currentWeek],
        order: maxOrder + 1
      };
      
      const docRef = await addDoc(habitsRef, newHabit);
      const habit = { ...newHabit, id: docRef.id };
      
      set(state => ({
        habits: [habit, ...state.habits],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to add habit', loading: false });
    }
  },

  updateHabit: async (id, updates) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const habitRef = doc(db, 'habits', id);
      await updateDoc(habitRef, updates);
      
      set(state => ({
        habits: state.habits.map(habit =>
          habit.id === id ? { ...habit, ...updates } : habit
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update habit', loading: false });
    }
  },

  deleteHabit: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const habitRef = doc(db, 'habits', id);
      await deleteDoc(habitRef);
      
      set(state => ({
        habits: state.habits.filter(habit => habit.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete habit', loading: false });
    }
  },

  updateHabitProgress: async (habitId, date, status) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      // Optimistically update the UI first
      set(state => ({
        habits: state.habits.map(h => {
          if (h.id !== habitId) return h;

          const weekProgress = findOrCreateWeekProgress(h, date);
          const updatedDays = weekProgress.days.map(day =>
            day.date === date ? { ...day, status } : day
          );

          const updatedWeeklyProgress = h.weeklyProgress.map(wp =>
            wp.startDate === weekProgress.startDate
              ? { ...wp, days: updatedDays }
              : wp
          );

          return {
            ...h,
            weeklyProgress: updatedWeeklyProgress
          };
        })
      }));

      // Then update the database
      const habit = get().habits.find(h => h.id === habitId);
      if (!habit) throw new Error('Habit not found');

      const habitRef = doc(db, 'habits', habitId);
      await updateDoc(habitRef, { weeklyProgress: habit.weeklyProgress });
    } catch (error) {
      // Revert the optimistic update on error
      await get().fetchHabits();
      set({ error: 'Failed to update progress' });
    }
  },

  reorderHabits: async (sourceId: string, destinationId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const habits = [...get().habits];
      const sourceIndex = habits.findIndex(h => h.id === sourceId);
      const destinationIndex = habits.findIndex(h => h.id === destinationId);

      if (sourceIndex === -1 || destinationIndex === -1) return;

      // Remove the source habit and insert it at the destination
      const [movedHabit] = habits.splice(sourceIndex, 1);
      habits.splice(destinationIndex, 0, movedHabit);

      // Update order values
      const updatedHabits = habits.map((habit, index) => ({
        ...habit,
        order: index
      }));

      // Optimistically update the UI
      set({ habits: updatedHabits });

      // Update the database
      const batch = writeBatch(db);
      updatedHabits.forEach(habit => {
        const habitRef = doc(db, 'habits', habit.id);
        batch.update(habitRef, { order: habit.order });
      });
      await batch.commit();
    } catch (error) {
      // Revert on error
      await get().fetchHabits();
      set({ error: 'Failed to reorder habits' });
    }
  }
}));