import { useEffect } from 'react';
import { useSubscriptionStore } from '@/store/subscriptionStore';

export function useSubscription() {
  const {
    tier,
    credits,
    monthlyCredits,
    expiresAt,
    isActive,
    autoRenew,
    loading,
    error,
    loadSubscription,
    purchaseSubscription,
    restorePurchases,
    canMakePrediction,
    clearError,
  } = useSubscriptionStore();

  useEffect(() => {
    loadSubscription();
  }, []);

  return {
    tier,
    credits,
    monthlyCredits,
    expiresAt,
    isActive,
    autoRenew,
    loading,
    error,
    loadSubscription,
    purchaseSubscription,
    restorePurchases,
    canMakePrediction,
    clearError,
  };
}
