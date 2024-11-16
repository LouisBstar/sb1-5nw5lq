import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Edit, Trash2, Plus, ChevronDown, ChevronUp, Settings, GripVertical } from 'lucide-react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Habit } from '../types/habit';
import { TagManager } from './TagManager';
import { useTagStore } from '../store/tagStore';
import { useHabitStore } from '../store/habitStore';

interface HabitListProps {
  habits: Habit[];
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
}

interface SortableHabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  isDragging?: boolean;
}

function HabitCard({ habit, onEdit, onDelete, isDragging }: SortableHabitCardProps) {
  const { getTagColor } = useTagStore();

  return (
    <motion.div
      initial={false}
      animate={{
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging ? '0 8px 20px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.1)',
        opacity: isDragging ? 0.8 : 1,
      }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 text-gray-400 hover:text-gray-600">
            <GripVertical size={18} />
          </div>
          <h3 className="font-semibold text-gray-900">{habit.name}</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(habit)}
            className="p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {habit.description && (
        <p className="text-sm text-gray-600 mb-3">{habit.description}</p>
      )}

      <div className="flex items-center space-x-2 mb-3">
        <Tag size={16} className="text-gray-400" />
        <div className="flex flex-wrap gap-2">
          {habit.tags.map((tagName) => {
            const tagColor = getTagColor(tagName);
            return (
              <span
                key={tagName}
                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: tagColor }}
              >
                {tagName}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Frequency: {habit.frequency}</span>
        <span>Target: {habit.target} times</span>
      </div>
    </motion.div>
  );
}

function SortableHabitCard({ habit, onEdit, onDelete }: SortableHabitCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <HabitCard
        habit={habit}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
      />
    </div>
  );
}

export function HabitList({ habits, onEditHabit, onDeleteHabit }: HabitListProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { tags, addTag, updateTag, deleteTag, getTagColor, updateHabitCount } = useTagStore();
  const { reorderHabits } = useHabitStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    updateHabitCount(habits);
  }, [habits, updateHabitCount]);

  const habitsByTag = useMemo(() => {
    const tagMap = new Map<string, Habit[]>();
    
    tags.forEach(tag => {
      tagMap.set(tag.name, []);
    });

    habits.forEach(habit => {
      habit.tags.forEach(tagName => {
        const tagHabits = tagMap.get(tagName) || [];
        tagMap.set(tagName, [...tagHabits, habit]);
      });
    });

    const uncategorizedHabits = habits.filter(habit => !habit.tags.length);
    if (uncategorizedHabits.length) {
      tagMap.set('Uncategorized', uncategorizedHabits);
    }

    return tagMap;
  }, [habits, tags]);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over && active.id !== over.id) {
      await reorderHabits(active.id as string, over.id as string);
    }
  };

  const activeHabit = activeId ? habits.find(h => h.id === activeId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Habit Types 😊
          </h2>
          <button
            onClick={() => setIsTagManagerOpen(true)}
            className="p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {Array.from(habitsByTag.entries()).map(([tagName, tagHabits]) => (
          <motion.div
            key={tagName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <button
              onClick={() => toggleCategory(tagName)}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getTagColor(tagName) }}
                />
                <h3 className="text-lg font-semibold text-gray-900">
                  {tagName}
                </h3>
                <span className="text-sm text-gray-500">
                  ({tagHabits.length})
                </span>
              </div>
              {expandedCategories.includes(tagName) ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>

            <AnimatePresence>
              {expandedCategories.includes(tagName) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 mt-4"
                >
                  {tagHabits.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                    >
                      <SortableContext
                        items={tagHabits.map(h => h.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {tagHabits.map(habit => (
                          <SortableHabitCard
                            key={habit.id}
                            habit={habit}
                            onEdit={onEditHabit}
                            onDelete={onDeleteHabit}
                          />
                        ))}
                      </SortableContext>
                      <DragOverlay>
                        {activeHabit && (
                          <HabitCard
                            habit={activeHabit}
                            onEdit={onEditHabit}
                            onDelete={onDeleteHabit}
                            isDragging={true}
                          />
                        )}
                      </DragOverlay>
                    </DndContext>
                  ) : (
                    <p className="text-sm text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">
                      No habits assigned to this tag yet
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      <TagManager
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        tags={tags}
        onAddTag={addTag}
        onUpdateTag={updateTag}
        onDeleteTag={deleteTag}
      />
    </div>
  );
}