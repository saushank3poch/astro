import { create } from 'zustand';
import { User, BirthChart } from '@/types';
import { api } from '@/lib/api';

interface UserState {
  profile: User | null;
  birthChart: BirthChart | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loadBirthChart: () => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  birthChart: null,
  loading: false,
  error: null,

  loadProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await api.getProfile();
      set({ profile, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ loading: true, error: null });
    try {
      const profile = await api.updateProfile(data);
      set({ profile, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  loadBirthChart: async () => {
    set({ loading: true, error: null });
    try {
      const birthChart = await api.getBirthChart();
      set({ birthChart, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
