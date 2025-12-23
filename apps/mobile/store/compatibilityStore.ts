import { create } from 'zustand';
import { CompatibleAsset } from '@/types';
import { api } from '@/lib/api';
import { storage } from '@/lib/storage';

interface CompatibilityState {
  assets: CompatibleAsset[];
  currentAsset: CompatibleAsset | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadCompatibilities: () => Promise<void>;
  loadAssetCompatibility: (symbol: string) => Promise<void>;
  cacheCompatibilities: () => Promise<void>;
  loadCachedCompatibilities: () => Promise<void>;
  clearError: () => void;
}

export const useCompatibilityStore = create<CompatibilityState>((set, get) => ({
  assets: [],
  currentAsset: null,
  loading: false,
  error: null,

  loadCompatibilities: async () => {
    set({ loading: true, error: null });
    try {
      const assets = await api.getCompatibilities();
      set({ assets, loading: false });

      // Cache for offline access
      await get().cacheCompatibilities();
    } catch (error: any) {
      set({ error: error.message, loading: false });

      // Try to load cached data
      await get().loadCachedCompatibilities();
      throw error;
    }
  },

  loadAssetCompatibility: async (symbol: string) => {
    set({ loading: true, error: null });
    try {
      const asset = await api.getAssetCompatibility(symbol);
      set({ currentAsset: asset, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  cacheCompatibilities: async () => {
    const { assets } = get();
    await storage.setItem('cached_compatibilities', JSON.stringify(assets));
  },

  loadCachedCompatibilities: async () => {
    try {
      const cached = await storage.getItem('cached_compatibilities');
      if (cached) {
        const assets = JSON.parse(cached);
        set({ assets });
      }
    } catch (error) {
      console.error('Failed to load cached compatibilities:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
