import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, Check, Clock } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useFriendStore } from '../store/friendStore';
import { UserSearchResult } from '../types/user';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFriendModal({ isOpen, onClose }: AddFriendModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { searchResults, loading, searchUsers } = useUserStore();
  const { sendFriendRequest } = useFriendStore();
  const [requestSent, setRequestSent] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (searchTerm) {
      const delayDebounceFn = setTimeout(() => {
        searchUsers(searchTerm);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm]);

  const handleSendRequest = async (user: UserSearchResult) => {
    try {
      await sendFriendRequest(user.id);
      setRequestSent(prev => ({ ...prev, [user.id]: true }));
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl w-full max-w-md mx-4"
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Add Friends</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="relative mb-6">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {user.displayName[0]}
                            </span>
                          </div>
                        )}
                        <span className="font-medium text-gray-900">
                          {user.displayName}
                        </span>
                      </div>
                      
                      {user.isFriend ? (
                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm flex items-center gap-1">
                          <Check size={16} />
                          Friends
                        </span>
                      ) : user.isPending || requestSent[user.id] ? (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm flex items-center gap-1">
                          <Clock size={16} />
                          Pending
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(user)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center gap-1"
                        >
                          <UserPlus size={16} />
                          Add Friend
                        </button>
                      )}
                    </div>
                  ))
                ) : searchTerm ? (
                  <p className="text-center text-gray-500 py-4">
                    No users found matching "{searchTerm}"
                  </p>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Start typing to search for friends
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}