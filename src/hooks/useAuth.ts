import { create } from 'zustand';

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
  user: null, 
  login: (token, user) => {
    localStorage.setItem('gate_token', token);
    set({ token, isAuthenticated: true, user });
  },
  logout: () => {
    localStorage.removeItem('gate_token');
    set({ token: null, isAuthenticated: false, user: null });
  },
}));

