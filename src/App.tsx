import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { Habit } from './types/habit';
import { useAuthStore } from './store/authStore';
import { useHabitStore } from './store/habitStore';
import { HabitList } from './components/HabitList';
import { HabitForm } from './components/HabitForm';
import { AuthModal } from './components/AuthModal';
import { ProgressBar } from './components/ProgressBar';
import { WeeklyCalendar } from './components/WeeklyCalendar';
import { calculateWeeklyProgress } from './utils/habitUtils';

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const user = useAuthStore(state => state.user);
  const { habits, habitsLoading, setHabitsLoading } = useHabitStore();

  useEffect(() => {
    if (!user) {
      useHabitStore.setState({ habits: [], habitsLoading: false });
      return;
    }

    setHabitsLoading(true);

    try {
      const habitsQuery = query(
        collection(db, 'habits'),
        where('userId', '==', user.id),
        orderBy('order', 'asc'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        habitsQuery,
        (snapshot) => {
          const updatedHabits = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            weeklyProgress: doc.data().weeklyProgress || [],
            order: doc.data().order || 0
          })) as Habit[];
          
          useHabitStore.setState({ habits: updatedHabits, habitsLoading: false });
        },
        (error) => {
          console.error('Error in habits listener:', error);
          useHabitStore.setState({ 
            error: 'Failed to sync habits',
            habitsLoading: false
          });
        }
      );

      return () => {
        unsubscribe();
        useHabitStore.setState({ habitsLoading: false });
      };
    } catch (error) {
      console.error('Error setting up habits listener:', error);
      useHabitStore.setState({ 
        error: 'Failed to initialize habits sync',
        habitsLoading: false
      });
    }
  }, [user, setHabitsLoading]);

  const handleEditHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setIsHabitModalOpen(true);
  };

  const handleCloseHabitModal = () => {
    setSelectedHabit(null);
    setIsHabitModalOpen(false);
  };

  const weeklyProgress = calculateWeeklyProgress(habits);
  const targetPercentage = 80;

  const renderContent = () => {
    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <img src="/logo.svg" alt="Flux" className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Welcome to Flux</h1>
            <p className="text-base md:text-lg text-gray-600 mb-8">Track your habits and achieve your goals with our beautiful and intuitive habit tracking app.</p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <LogIn size={20} />
              <span>Get Started</span>
            </button>
          </motion.div>
        </div>
      );
    }

    if (habitsLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Weekly Progress</h2>
                    <p className="text-sm text-gray-600">Track your progress towards your goals</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs md:text-sm font-medium text-indigo-600">
                      Target: {targetPercentage}%
                    </span>
                    <button
                      onClick={() => setIsHabitModalOpen(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                      Add Habit
                    </button>
                  </div>
                </div>
                <ProgressBar
                  percentage={weeklyProgress}
                  target={targetPercentage}
                />
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <WeeklyCalendar habits={habits} />
              </div>
            </div>

            <HabitList
              habits={habits}
              onEditHabit={handleEditHabit}
              onDeleteHabit={(id) => {
                if (window.confirm('Are you sure you want to delete this habit?')) {
                  useHabitStore.getState().deleteHabit(id);
                }
              }}
            />
          </div>
        </div>

        <AnimatePresence>
          {isHabitModalOpen && (
            <HabitForm
              habit={selectedHabit}
              isOpen={isHabitModalOpen}
              onClose={handleCloseHabitModal}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAuthModalOpen && (
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
    </>
  );
}