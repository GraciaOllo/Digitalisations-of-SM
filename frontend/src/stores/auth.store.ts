import { create } from 'zustand';

type User = {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  permissions: string[];
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setSession: (data: { accessToken: string; refreshToken: string; user: User }) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('kodo_access_token'),
  refreshToken: localStorage.getItem('kodo_refresh_token'),
  user: JSON.parse(localStorage.getItem('kodo_user') || 'null'),

  setSession: (data) => {
    localStorage.setItem('kodo_access_token', data.accessToken);
    localStorage.setItem('kodo_refresh_token', data.refreshToken);
    localStorage.setItem('kodo_user', JSON.stringify(data.user));
    set(data);
  },

  logout: () => {
    localStorage.removeItem('kodo_access_token');
    localStorage.removeItem('kodo_refresh_token');
    localStorage.removeItem('kodo_user');
    set({ accessToken: null, refreshToken: null, user: null });
  },
}));
