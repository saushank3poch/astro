import { create } from 'zustand';
import { User } from '@/types';
import { api } from '@/lib/api';
import { storage } from '@/lib/storage';
import { biometric } from '@/lib/biometric';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  setBiometric: (enabled: boolean) => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  biometricEnabled: false,
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.login(email, password);
      set({
        user: response.user,
        token: response.accessToken,
        isAuthenticated: true,
        loading: false,
      });
      await storage.setToken(response.accessToken);
      await storage.setItem('user', JSON.stringify(response.user));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  register: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const response = await api.register(data);
      set({
        user: response.user,
        token: response.accessToken,
        isAuthenticated: true,
        loading: false,
      });
      await storage.setToken(response.accessToken);
      await storage.setItem('user', JSON.stringify(response.user));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        biometricEnabled: false,
      });
      await storage.removeToken();
      await storage.removeItem('user');
      await storage.removeItem('biometricEnabled');
    }
  },

  loadStoredAuth: async () => {
    set({ loading: true });
    try {
      const token = await storage.getToken();
      const userStr = await storage.getItem('user');
      const biometricEnabled = await storage.getItem('biometricEnabled');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        api.setToken(token);
        set({
          user,
          token,
          isAuthenticated: true,
          biometricEnabled: biometricEnabled === 'true',
        });
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      set({ loading: false });
    }
  },

  setBiometric: async (enabled: boolean) => {
    if (enabled) {
      const available = await biometric.isAvailable();
      if (!available) {
        throw new Error('Biometric authentication is not available');
      }
    }

    set({ biometricEnabled: enabled });
    await storage.setItem('biometricEnabled', enabled.toString());
  },

  authenticateWithBiometric: async () => {
    try {
      const result = await biometric.authenticate('Authenticate to access your account');
      return result;
    } catch (error) {
      console.error('Biometric auth failed:', error);
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
