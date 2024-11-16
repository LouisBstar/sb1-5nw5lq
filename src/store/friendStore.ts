import { create } from 'zustand';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './authStore';
import { Friend, FriendProgress } from '../types/friend';

interface FriendStore {
  friends: Friend[];
  friendProgress: FriendProgress[];
  loading: boolean;
  error: string | null;
  fetchFriends: () => Promise<void>;
  sendFriendRequest: (friendId: string) => Promise<void>;
  acceptFriendRequest: (friendId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  fetchFriendProgress: () => Promise<void>;
}

export const useFriendStore = create<FriendStore>((set, get) => ({
  friends: [],
  friendProgress: [],
  loading: false,
  error: null,

  fetchFriends: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const friendsRef = collection(db, 'friends');
      const q = query(
        friendsRef,
        where('userId', '==', user.id)
      );
      const snapshot = await getDocs(q);
      
      const friends = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Friend[];

      set({ friends, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch friends', loading: false });
    }
  },

  sendFriendRequest: async (friendId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const friendsRef = collection(db, 'friends');
      await addDoc(friendsRef, {
        userId: user.id,
        friendId,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      await get().fetchFriends();
    } catch (error) {
      set({ error: 'Failed to send friend request', loading: false });
    }
  },

  acceptFriendRequest: async (friendId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const friendsRef = collection(db, 'friends');
      const q = query(
        friendsRef,
        where('userId', '==', friendId),
        where('friendId', '==', user.id)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const friendDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'friends', friendDoc.id), {
          status: 'accepted'
        });
      }

      await get().fetchFriends();
    } catch (error) {
      set({ error: 'Failed to accept friend request', loading: false });
    }
  },

  removeFriend: async (friendId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const friendsRef = collection(db, 'friends');
      const q = query(
        friendsRef,
        where('userId', '==', user.id),
        where('friendId', '==', friendId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        await deleteDoc(doc(db, 'friends', snapshot.docs[0].id));
      }

      await get().fetchFriends();
    } catch (error) {
      set({ error: 'Failed to remove friend', loading: false });
    }
  },

  fetchFriendProgress: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const friends = get().friends.filter(f => f.status === 'accepted');
      const progress: FriendProgress[] = [];

      for (const friend of friends) {
        const userDoc = await getDocs(query(
          collection(db, 'users'),
          where('id', '==', friend.friendId)
        ));

        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          const habitsQuery = query(
            collection(db, 'habits'),
            where('userId', '==', friend.friendId)
          );
          const habitsSnapshot = await getDocs(habitsQuery);
          const habits = habitsSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          }));

          // Calculate progress percentages
          const now = new Date();
          const daily = calculateProgress(habits, 'daily', now);
          const weekly = calculateProgress(habits, 'weekly', now);
          const monthly = calculateProgress(habits, 'monthly', now);

          progress.push({
            userId: friend.friendId,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            progress: { daily, weekly, monthly }
          });
        }
      }

      set({ friendProgress: progress, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch friend progress', loading: false });
    }
  }
}));

function calculateProgress(habits: any[], period: 'daily' | 'weekly' | 'monthly', date: Date): number {
  // Implementation of progress calculation based on period
  // This is a simplified version - you might want to expand this based on your needs
  const totalHabits = habits.length;
  if (totalHabits === 0) return 0;

  let completedHabits = 0;
  habits.forEach(habit => {
    const progress = habit.progress || [];
    const completed = progress.filter((p: any) => p.status === 'completed').length;
    const target = habit.frequency === 'daily' ? 7 : habit.target;
    if (completed >= target) completedHabits++;
  });

  return Math.round((completedHabits / totalHabits) * 100);
}