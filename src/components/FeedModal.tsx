import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Users, Search, AlertCircle } from 'lucide-react';
import { useFriendStore } from '../store/friendStore';
import { useAuthStore } from '../store/authStore';
import { AddFriendModal } from './AddFriendModal';

interface FeedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedModal({ isOpen, onClose }: FeedModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'feed' | 'friends'>('feed');
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const { user } = useAuthStore();
  const { 
    friends, 
    friendProgress,
    loading,
    error,
    fetchFriends,
    fetchFriendProgress,
    acceptFriendRequest,
    removeFriend
  } = useFriendStore();

  useEffect(() => {
    if (isOpen && user) {
      fetchFriends();
      fetchFriendProgress();
    }
  }, [isOpen, user]);

  const filteredProgress = friendProgress.filter(friend =>
    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingFriends = friends.filter(f => f.status === 'pending');

  const renderContent = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
    >
      <div className="p-6 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Activity Feed</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3 py-1 rounded-full text-sm ${
                activeTab === 'feed'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-3 py-1 rounded-full text-sm ${
                activeTab === 'friends'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Friends
              {pendingFriends.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                  {pendingFriends.length}
                </span>
              )}
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'feed' ? 'activity' : 'friends'}...`}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        ) : activeTab === 'feed' ? (
          <div className="space-y-6">
            {filteredProgress.length > 0 ? (
              filteredProgress.map((friend) => (
                <div
                  key={`feed-${friend.userId}`}
                  className="bg-white rounded-lg p-4 border"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {friend.photoURL ? (
                      <img
                        src={friend.photoURL}
                        alt={friend.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {friend.displayName[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {friend.displayName}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Today</div>
                      <div className="text-xl font-bold text-indigo-600">
                        {friend.progress.daily}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">This Week</div>
                      <div className="text-xl font-bold text-indigo-600">
                        {friend.progress.weekly}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">This Month</div>
                      <div className="text-xl font-bold text-indigo-600">
                        {friend.progress.monthly}%
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-600 mb-2">No Activity Yet</p>
                <p className="text-sm">
                  Connect with friends to see their progress here
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {pendingFriends.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Pending Requests
                </h3>
                <div className="space-y-2">
                  {pendingFriends.map((friend) => (
                    <div
                      key={`pending-${friend.id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-900">{friend.friendId}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptFriendRequest(friend.friendId)}
                          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => removeFriend(friend.friendId)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Add Friends
              </h3>
              <button
                onClick={() => setIsAddFriendModalOpen(true)}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <UserPlus size={16} />
                <span>Add Friend</span>
              </button>
            </div>

            {friends
              .filter(f => f.status === 'accepted')
              .map((friend) => {
                const progress = friendProgress.find(p => p.userId === friend.friendId);
                return (
                  <div
                    key={`friend-${friend.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {progress?.photoURL ? (
                        <img
                          src={progress.photoURL}
                          alt={progress.displayName}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {progress?.displayName[0]}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-gray-900">
                        {progress?.displayName}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFriend(friend.friendId)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            {renderContent()}
          </div>
        )}
      </AnimatePresence>

      <AddFriendModal
        isOpen={isAddFriendModalOpen}
        onClose={() => setIsAddFriendModalOpen(false)}
      />
    </>
  );
}