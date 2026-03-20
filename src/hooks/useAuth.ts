import { create } from 'zustand';
import { setAuthToken } from '@/lib/graphql-client';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: any | null;
  login: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem('gate_token'),
  isAuthenticated: !!localStorage.getItem('gate_token'),
  user: null, // We could store user data but it's better to fetch profile separately
  login: (token, user) => {
    localStorage.setItem('gate_token', token);
    setAuthToken(token);
    set({ token, isAuthenticated: true, user });
  },
  logout: () => {
    localStorage.removeItem('gate_token');
    setAuthToken('');
    set({ token: null, isAuthenticated: false, user: null });
  },
}));
