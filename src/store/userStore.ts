import { create } from 'zustand';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  limit,
  orderBy,
  startAt,
  endAt
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './authStore';
import { useFriendStore } from './friendStore';
import { UserSearchResult } from '../types/user';

interface UserStore {
  searchResults: UserSearchResult[];
  loading: boolean;
  error: string | null;
  searchUsers: (searchTerm: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  searchResults: [],
  loading: false,
  error: null,

  searchUsers: async (searchTerm: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser || !searchTerm.trim()) {
      set({ searchResults: [] });
      return;
    }

    set({ loading: true, error: null });
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        orderBy('displayName'),
        startAt(searchTerm),
        endAt(searchTerm + '\uf8ff'),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      const friends = useFriendStore.getState().friends;
      
      const results = snapshot.docs
        .map(doc => {
          const userData = doc.data();
          const friend = friends.find(f => 
            (f.userId === currentUser.id && f.friendId === doc.id) ||
            (f.userId === doc.id && f.friendId === currentUser.id)
          );
          
          return {
            id: doc.id,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            isFriend: friend?.status === 'accepted',
            isPending: friend?.status === 'pending'
          };
        })
        .filter(user => user.id !== currentUser.id);

      set({ searchResults: results, loading: false });
    } catch (error) {
      set({ error: 'Failed to search users', loading: false });
    }
  }
}));