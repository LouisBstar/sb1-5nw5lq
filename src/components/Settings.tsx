import React, { useState } from 'react';
import { Target, Bell, Percent, Plus, X, Volume2, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationSchedule, NotificationTime, NotificationRepeat } from '../types/notification';

interface SettingsProps {
  targetPercentage: number;
  onTargetChange: (value: number) => void;
}

const ALARM_SOUNDS = [
  { id: 'gentle', name: 'Gentle Chime', url: 'notification-sound-1.mp3' },
  { id: 'classic', name: 'Classic Bell', url: 'notification-sound-2.mp3' },
  { id: 'digital', name: 'Digital Beep', url: 'notification-sound-3.mp3' },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function Settings({ targetPercentage, onTargetChange }: SettingsProps) {
  const [notifications, setNotifications] = useState<NotificationSchedule[]>([]);
  const [isAddingNotification, setIsAddingNotification] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationSchedule | null>(null);

  const createNotification = (notification: Omit<NotificationSchedule, 'id'>) => {
    const newNotification: NotificationSchedule = {
      ...notification,
      id: Math.random().toString(36).substring(2),
    };
    setNotifications([...notifications, newNotification]);
    setIsAddingNotification(false);
  };

  const updateNotification = (id: string, updates: Partial<NotificationSchedule>) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, ...updates } : notif
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const toggleNotification = (id: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
    ));
  };

  const NotificationForm = ({ 
    onSubmit, 
    initialData,
    onCancel 
  }: { 
    onSubmit: (data: Omit<NotificationSchedule, 'id'>) => void;
    initialData?: NotificationSchedule;
    onCancel: () => void;
  }) => {
    const [time, setTime] = useState<NotificationTime>(initialData?.time || { hour: 9, minute: 0 });
    const [repeat, setRepeat] = useState<NotificationRepeat>(initialData?.repeat || 'daily');
    const [days, setDays] = useState<number[]>(initialData?.days || [1,2,3,4,5]);
    const [sound, setSound] = useState(initialData?.sound || ALARM_SOUNDS[0].id);
    const [label, setLabel] = useState(initialData?.label || '');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
        time,
        repeat,
        days,
        sound,
        label,
        enabled: initialData?.enabled ?? true,
      });
    };

    return (
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <input
            type="time"
            value={`${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':').map(Number);
              setTime({ hour: hours, minute: minutes });
            }}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Morning Routine"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Repeat</label>
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value as NotificationRepeat)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {(repeat === 'weekly' || repeat === 'custom') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    setDays(days.includes(index)
                      ? days.filter(d => d !== index)
                      : [...days, index]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    days.includes(index)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sound</label>
          <select
            value={sound}
            onChange={(e) => setSound(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {ALARM_SOUNDS.map(sound => (
              <option key={sound.id} value={sound.id}>
                {sound.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {initialData ? 'Update' : 'Add'} Notification
          </button>
        </div>
      </motion.form>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Rate Target</h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={targetPercentage}
                onChange={(e) => onTargetChange(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex items-center gap-2 min-w-[80px]">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={targetPercentage}
                  onChange={(e) => onTargetChange(Number(e.target.value))}
                  className="w-16 px-2 py-1 border rounded-lg text-center"
                />
                <Percent size={16} className="text-gray-500" />
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Bell className="text-indigo-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              </div>
              <button
                onClick={() => setIsAddingNotification(true)}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>Add Reminder</span>
              </button>
            </div>

            <div className="space-y-3">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleNotification(notification.id)}
                      className={`p-2 rounded-lg ${
                        notification.enabled ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <Bell size={20} />
                    </button>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {notification.label || 'Reminder'}
                      </h4>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>
                            {notification.time.hour.toString().padStart(2, '0')}:
                            {notification.time.minute.toString().padStart(2, '0')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>
                            {notification.repeat === 'daily' ? 'Daily' :
                             notification.repeat === 'weekly' ? 'Weekly' :
                             `${notification.days.length} days`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingNotification(notification)}
                      className="p-2 text-gray-500 hover:text-indigo-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-gray-500 hover:text-red-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {(isAddingNotification || editingNotification) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
                  <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingNotification ? 'Edit Notification' : 'New Notification'}
                    </h3>
                    <NotificationForm
                      initialData={editingNotification || undefined}
                      onSubmit={(data) => {
                        if (editingNotification) {
                          updateNotification(editingNotification.id, data);
                          setEditingNotification(null);
                        } else {
                          createNotification(data);
                        }
                      }}
                      onCancel={() => {
                        setIsAddingNotification(false);
                        setEditingNotification(null);
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg cursor-pointer">
            <Target className="text-indigo-600" size={24} />
            <div>
              <h3 className="font-medium text-gray-900">Goals</h3>
              <p className="text-sm text-gray-600">Set and manage your goals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}