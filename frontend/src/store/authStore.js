import { create } from 'zustand';
import { authAPI } from '../services/api';

// Maps DB role → app route prefix
export const rolePath = { customer: '/customer', provider: '/caterer', admin: '/owner' };

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('token', data.data.token);
      set({ user: data.data.user, token: data.data.token, isLoading: false });
      return data.data.user;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem('token', data.data.token);
      set({ user: data.data.user, token: data.data.token, isLoading: false });
      return data.data.user;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed', isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    try {
      const { data } = await authAPI.getMe();
      set({ user: data.data });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },
}));

export default useAuthStore;
