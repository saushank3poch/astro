import { create } from 'zustand';
import { SubscriptionStatus, SubscriptionTier } from '@/types';
import { api } from '@/lib/api';
import { iap } from '@/lib/iap';
import { Platform } from 'react-native';

interface SubscriptionState {
  tier: SubscriptionTier;
  credits: number;
  monthlyCredits: number;
  expiresAt: Date | null;
  isActive: boolean;
  autoRenew: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  loadSubscription: () => Promise<void>;
  purchaseSubscription: (productId: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
  canMakePrediction: () => boolean;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  tier: 'free',
  credits: 3,
  monthlyCredits: 3,
  expiresAt: null,
  isActive: false,
  autoRenew: false,
  loading: false,
  error: null,

  loadSubscription: async () => {
    set({ loading: true, error: null });
    try {
      const status = await api.getSubscriptionStatus();
      set({
        tier: status.tier,
        credits: status.credits,
        monthlyCredits: status.monthlyCredits,
        expiresAt: status.expiresAt ? new Date(status.expiresAt) : null,
        isActive: status.isActive,
        autoRenew: status.autoRenew,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  purchaseSubscription: async (productId: string) => {
    set({ loading: true, error: null });
    try {
      // Initialize IAP
      await iap.initialize();

      // Make purchase
      const receipt = await iap.purchaseProduct(productId);

      // Validate with backend
      await api.validateReceipt({
        productId,
        transactionId: receipt.transactionId,
        receipt: receipt.receipt,
        platform: Platform.OS as 'ios' | 'android',
      });

      // Reload subscription status
      await get().loadSubscription();

      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  restorePurchases: async () => {
    set({ loading: true, error: null });
    try {
      await iap.restorePurchases();
      await get().loadSubscription();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  canMakePrediction: () => {
    const state = get();
    return state.credits > 0 && state.isActive;
  },

  clearError: () => set({ error: null }),
}));
