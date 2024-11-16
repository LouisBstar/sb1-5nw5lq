import React from 'react';
import { Home, BarChart2, Settings, ListTodo, Plus, Users } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddHabit: () => void;
  onOpenFeed: () => void;
}

export function Navigation({ activeTab, onTabChange, onAddHabit, onOpenFeed }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 z-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`p-3 rounded-lg transition-colors ${
              activeTab === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500'
            }`}
          >
            <Home size={24} />
          </button>
          
          <button
            onClick={() => onTabChange('analytics')}
            className={`p-3 rounded-lg transition-colors ${
              activeTab === 'analytics' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500'
            }`}
          >
            <BarChart2 size={24} />
          </button>

          <div className="flex flex-col items-center -mt-6">
            <button
              onClick={onAddHabit}
              className="p-4 bg-indigo-600 rounded-full text-white shadow-lg hover:bg-indigo-700 transition-all mb-2"
            >
              <Plus size={24} />
            </button>
            <button
              onClick={onOpenFeed}
              className="p-2 bg-indigo-100 rounded-full text-indigo-600 hover:bg-indigo-200 transition-all"
            >
              <Users size={20} />
            </button>
          </div>

          <button
            onClick={() => onTabChange('habits')}
            className={`p-3 rounded-lg transition-colors ${
              activeTab === 'habits' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500'
            }`}
          >
            <ListTodo size={24} />
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`p-3 rounded-lg transition-colors ${
              activeTab === 'settings' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500'
            }`}
          >
            <Settings size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}