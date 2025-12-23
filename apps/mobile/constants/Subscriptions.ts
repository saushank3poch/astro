import { SubscriptionPlan } from '@/types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    tier: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    monthlyCredits: 5,
    features: [
      '5 predictions per month',
      'Basic compatibility scores',
      'Daily horoscope',
      'Birth chart analysis',
    ],
  },
  {
    id: 'basic',
    tier: 'basic',
    name: 'Basic',
    price: 9.99,
    currency: 'USD',
    monthlyCredits: 30,
    features: [
      '30 predictions per month',
      'Advanced compatibility analysis',
      'Timing predictions',
      'Priority support',
      'No ads',
    ],
  },
  {
    id: 'pro',
    tier: 'pro',
    name: 'Pro',
    price: 19.99,
    currency: 'USD',
    monthlyCredits: 100,
    popular: true,
    features: [
      '100 predictions per month',
      'Unlimited compatibility checks',
      'Advanced divination',
      'Real-time transit alerts',
      'Priority support',
      'No ads',
      'Export reports',
    ],
  },
];

export const CREDIT_COSTS = {
  macro: 2,
  timing: 1,
  divination: 1,
};

export const REVENUECAT_CONFIG = {
  ios: {
    apiKey: 'appl_xxxxxxxxxxxxxxxxx',
  },
  android: {
    apiKey: 'goog_xxxxxxxxxxxxxxxxx',
  },
};
