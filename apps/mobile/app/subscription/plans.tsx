import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SubscriptionTierCard } from '@/components/SubscriptionTierCard';
import { Button } from '@/components/Button';
import { useSubscription } from '@/hooks/useSubscription';
import { Colors } from '@/constants/Colors';
import { SubscriptionPlan } from '@/types';

const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    tier: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    monthlyCredits: 3,
    features: [
      '3 predictions per month',
      'Basic birth chart analysis',
      'Asset compatibility matching',
      'Community support',
    ],
  },
  {
    id: 'com.astro.basic.monthly',
    tier: 'basic',
    name: 'Basic',
    price: 9.99,
    currency: 'USD',
    monthlyCredits: 20,
    features: [
      '20 predictions per month',
      'Detailed birth chart analysis',
      'Advanced compatibility matching',
      'Priority support',
      'Ad-free experience',
    ],
    popular: true,
  },
  {
    id: 'com.astro.pro.monthly',
    tier: 'pro',
    name: 'Pro',
    price: 29.99,
    currency: 'USD',
    monthlyCredits: 100,
    features: [
      'Unlimited predictions',
      'Expert birth chart analysis',
      'Real-time market insights',
      'Custom astrological reports',
      'Priority support',
      'Early access to new features',
    ],
  },
];

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const { tier, purchaseSubscription, restorePurchases } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (productId: string) => {
    if (productId === 'free') {
      Alert.alert('Free Plan', 'You are already on the free plan');
      return;
    }

    setLoading(productId);
    try {
      await purchaseSubscription(productId);
      Alert.alert('Success', 'Subscription activated successfully!', [
        { text: 'OK', onPress: () => router.push('/subscription/success') },
      ]);
    } catch (error: any) {
      Alert.alert('Purchase Failed', error.message || 'Failed to complete purchase');
    } finally {
      setLoading(null);
    }
  };

  const handleRestore = async () => {
    setLoading('restore');
    try {
      await restorePurchases();
      Alert.alert('Success', 'Purchases restored successfully!');
    } catch (error: any) {
      Alert.alert('Restore Failed', error.message || 'No purchases to restore');
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Unlock cosmic insights and elevate your financial journey
        </Text>

        {PLANS.map((plan) => (
          <SubscriptionTierCard
            key={plan.id}
            plan={plan}
            isCurrentTier={plan.tier === tier}
            onSubscribe={() => handleSubscribe(plan.id)}
            loading={loading === plan.id}
          />
        ))}

        <Button
          title="Restore Purchases"
          onPress={handleRestore}
          variant="outline"
          loading={loading === 'restore'}
          style={styles.restoreButton}
        />

        <Text style={styles.disclaimer}>
          Subscriptions auto-renew monthly. Cancel anytime. Terms & Conditions apply.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: 24,
  },
  restoreButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  disclaimer: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
