export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted';
  createdAt: Date;
}

export interface FriendProgress {
  userId: string;
  displayName: string;
  photoURL?: string;
  progress: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}