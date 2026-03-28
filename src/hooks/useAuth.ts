import { create } from 'zustand';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: any | null;
  login: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => {
  const storedUser = localStorage.getItem('gate_user');
  
  return {
    token: localStorage.getItem('gate_token'),
    isAuthenticated: !!localStorage.getItem('gate_token'),
    user: storedUser ? JSON.parse(storedUser) : null, 
    login: (token, user) => {
      localStorage.setItem('gate_token', token);
      localStorage.setItem('gate_user', JSON.stringify(user));
      set({ token, isAuthenticated: true, user });
    },
    logout: () => {
      localStorage.removeItem('gate_token');
      localStorage.removeItem('gate_user');
      set({ token: null, isAuthenticated: false, user: null });
    },
  };
});

