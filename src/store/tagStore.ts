import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Habit } from '../types/habit';

interface Tag {
  name: string;
  color: string;
  habitCount?: number;
}

interface TagState {
  version: number;
  tags: Tag[];
}

interface TagStore {
  version: number;
  tags: Tag[];
  addTag: (tag: Tag) => void;
  updateTag: (oldName: string, newTag: Tag) => void;
  deleteTag: (name: string) => void;
  getTagColor: (name: string) => string | undefined;
  getHabitsByTag: (tagName: string, habits: Habit[]) => Habit[];
  updateHabitCount: (habits: Habit[]) => void;
}

const currentVersion = 1;

export const useTagStore = create<TagStore>()(
  persist(
    (set, get) => ({
      version: currentVersion,
      tags: [],
      
      addTag: (tag) => {
        set((state) => ({
          tags: [...state.tags, { ...tag, habitCount: 0 }]
        }));
      },

      updateTag: (oldName, newTag) => {
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.name === oldName ? { ...newTag, habitCount: tag.habitCount } : tag
          )
        }));
      },

      deleteTag: (name) => {
        set((state) => ({
          tags: state.tags.filter((tag) => tag.name !== name)
        }));
      },

      getTagColor: (name) => {
        const tag = get().tags.find((t) => t.name === name);
        return tag?.color;
      },

      getHabitsByTag: (tagName, habits) => {
        return habits.filter(habit => habit.tags.includes(tagName));
      },

      updateHabitCount: (habits) => {
        set((state) => ({
          tags: state.tags.map(tag => ({
            ...tag,
            habitCount: habits.filter(habit => habit.tags.includes(tag.name)).length
          }))
        }));
      }
    }),
    {
      name: 'tag-store',
      version: currentVersion,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            version: currentVersion,
            tags: persistedState.tags || [],
          };
        }
        return persistedState as TagState;
      },
    }
  )
);