import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Calendar, Clock } from 'lucide-react';
import { Habit } from '../types/habit';
import { useHabitStore } from '../store/habitStore';
import { useTagStore } from '../store/tagStore';

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: Habit | null;
}

export function HabitForm({ isOpen, onClose, habit }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [frequency, setFrequency] = useState(habit?.frequency || 'daily');
  const [target, setTarget] = useState(habit?.target?.toString() || '7');
  const [selectedTags, setSelectedTags] = useState<string[]>(habit?.tags || []);
  const [newTag, setNewTag] = useState('');

  const { tags } = useTagStore();
  const { addHabit, updateHabit } = useHabitStore();

  useEffect(() => {
    if (isOpen) {
      setName(habit?.name || '');
      setDescription(habit?.description || '');
      setFrequency(habit?.frequency || 'daily');
      setTarget(habit?.target?.toString() || '7');
      setSelectedTags(habit?.tags || []);
      setNewTag('');
    }
  }, [isOpen, habit]);

  useEffect(() => {
    switch (frequency) {
      case 'daily':
        setTarget('7');
        break;
      case 'weekly':
        setTarget('1');
        break;
      case 'custom':
        setTarget('3');
        break;
    }
  }, [frequency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const habitData = {
      name,
      description,
      frequency: frequency as 'daily' | 'weekly' | 'custom',
      target: parseInt(target),
      tags: selectedTags,
      color: tags.find(t => t.name === selectedTags[0])?.color || '#4F46E5',
    };

    try {
      if (habit) {
        await updateHabit(habit.id, habitData);
      } else {
        await addHabit(habitData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save habit:', error);
    }
  };

  const addTag = (tagName: string) => {
    if (tagName.trim() && !selectedTags.includes(tagName)) {
      setSelectedTags([...selectedTags, tagName]);
      setNewTag('');
    }
  };

  const removeTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagName));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {habit ? 'Edit Habit' : 'New Habit'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter habit name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Add a description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency Goal
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'custom')}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="daily">Daily (7 days per week)</option>
                    <option value="weekly">Weekly (once per week)</option>
                    <option value="custom">Custom frequency</option>
                  </select>
                </div>
              </div>

              {frequency === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target (times per week)
                  </label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none"
                    >
                      {[2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>
                          {num} days per week
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map((tagName) => {
                    const tag = tags.find(t => t.name === tagName);
                    return (
                      <div
                        key={tagName}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full group"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tag?.color || '#4F46E5' }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {tagName}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTag(tagName)}
                          className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} className="text-gray-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(newTag);
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.name}
                        type="button"
                        onClick={() => addTag(tag.name)}
                        disabled={selectedTags.includes(tag.name)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedTags.includes(tag.name)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {habit ? 'Save Changes' : 'Create Habit'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}