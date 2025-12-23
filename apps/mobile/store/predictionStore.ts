import { create } from 'zustand';
import {
  Prediction,
  MacroPredictionInput,
  TimingPredictionInput,
  DivinationInput,
} from '@/types';
import { api } from '@/lib/api';
import { storage } from '@/lib/storage';

interface PredictionState {
  predictions: Prediction[];
  currentPrediction: Prediction | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadPredictions: () => Promise<void>;
  loadPrediction: (id: string) => Promise<void>;
  createMacroPrediction: (input: MacroPredictionInput) => Promise<Prediction>;
  createTimingPrediction: (input: TimingPredictionInput) => Promise<Prediction>;
  createDivination: (input: DivinationInput) => Promise<Prediction>;
  cachePredictions: () => Promise<void>;
  loadCachedPredictions: () => Promise<void>;
  clearError: () => void;
}

export const usePredictionStore = create<PredictionState>((set, get) => ({
  predictions: [],
  currentPrediction: null,
  loading: false,
  error: null,

  loadPredictions: async () => {
    set({ loading: true, error: null });
    try {
      const predictions = await api.getPredictions(20);
      set({ predictions, loading: false });

      // Cache predictions for offline access
      await get().cachePredictions();
    } catch (error: any) {
      set({ error: error.message, loading: false });

      // Try to load cached predictions if online fetch fails
      await get().loadCachedPredictions();
      throw error;
    }
  },

  loadPrediction: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const prediction = await api.getPrediction(id);
      set({ currentPrediction: prediction, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createMacroPrediction: async (input: MacroPredictionInput) => {
    set({ loading: true, error: null });
    try {
      const prediction = await api.createMacroPrediction(input);
      set((state) => ({
        predictions: [prediction, ...state.predictions],
        currentPrediction: prediction,
        loading: false,
      }));

      // Cache updated predictions
      await get().cachePredictions();

      return prediction;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createTimingPrediction: async (input: TimingPredictionInput) => {
    set({ loading: true, error: null });
    try {
      const prediction = await api.createTimingPrediction(input);
      set((state) => ({
        predictions: [prediction, ...state.predictions],
        currentPrediction: prediction,
        loading: false,
      }));

      await get().cachePredictions();

      return prediction;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createDivination: async (input: DivinationInput) => {
    set({ loading: true, error: null });
    try {
      const prediction = await api.createDivination(input);
      set((state) => ({
        predictions: [prediction, ...state.predictions],
        currentPrediction: prediction,
        loading: false,
      }));

      await get().cachePredictions();

      return prediction;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  cachePredictions: async () => {
    const { predictions } = get();
    // Cache last 10 predictions
    const toCache = predictions.slice(0, 10);
    await storage.setItem('cached_predictions', JSON.stringify(toCache));
  },

  loadCachedPredictions: async () => {
    try {
      const cached = await storage.getItem('cached_predictions');
      if (cached) {
        const predictions = JSON.parse(cached);
        set({ predictions });
      }
    } catch (error) {
      console.error('Failed to load cached predictions:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
