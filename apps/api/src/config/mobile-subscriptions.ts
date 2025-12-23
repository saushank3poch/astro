/**
 * Mobile Subscription Configuration
 * Defines subscription tiers, pricing, and features for mobile IAP
 */

export interface SubscriptionTier {
  tier: 'free' | 'basic' | 'pro';
  creditsPerMonth: number; // -1 for unlimited
  price: number;
  priceUSD?: number;
  productIds?: {
    ios: string;
    android: string;
  };
  features: string[];
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    tier: 'free',
    creditsPerMonth: 3,
    price: 0,
    features: ['basic_predictions', 'birth_chart'],
  },
  basic: {
    tier: 'basic',
    creditsPerMonth: 50,
    price: 9.99,
    priceUSD: 9.99,
    productIds: {
      ios: 'com.astro.basic.monthly',
      android: 'basic_monthly',
    },
    features: ['all_prediction_types', 'birth_chart', 'compatibility'],
  },
  pro: {
    tier: 'pro',
    creditsPerMonth: -1, // unlimited
    price: 29.99,
    priceUSD: 29.99,
    productIds: {
      ios: 'com.astro.pro.monthly',
      android: 'pro_monthly',
    },
    features: [
      'unlimited_predictions',
      'birth_chart',
      'compatibility',
      'personalized_alerts',
    ],
  },
};

/**
 * Get tier from product ID
 */
export function getTierFromProductId(productId: string): 'free' | 'basic' | 'pro' {
  if (productId.includes('basic')) {
    return 'basic';
  } else if (productId.includes('pro')) {
    return 'pro';
  }
  return 'free';
}

/**
 * Get subscription tier config
 */
export function getTierConfig(tier: string): SubscriptionTier | null {
  return SUBSCRIPTION_TIERS[tier] || null;
}

/**
 * Check if product ID is valid
 */
export function isValidProductId(productId: string): boolean {
  const allProductIds = Object.values(SUBSCRIPTION_TIERS)
    .filter(t => t.productIds)
    .flatMap(t => [t.productIds!.ios, t.productIds!.android]);

  return allProductIds.includes(productId);
}

/**
 * Get credit limit for a tier
 */
export function getCreditLimitForTier(tier: string): number {
  const config = getTierConfig(tier);
  return config ? config.creditsPerMonth : 3;
}
