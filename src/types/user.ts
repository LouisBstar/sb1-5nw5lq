export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
}

export interface UserSearchResult {
  id: string;
  displayName: string;
  photoURL?: string;
  isFriend: boolean;
  isPending: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}