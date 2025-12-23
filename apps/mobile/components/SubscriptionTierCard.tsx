import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Button } from './Button';
import { Colors } from '@/constants/Colors';
import { SubscriptionPlan } from '@/types';

interface SubscriptionTierCardProps {
  plan: SubscriptionPlan;
  isCurrentTier: boolean;
  onSubscribe: () => void;
  loading?: boolean;
}

export function SubscriptionTierCard({
  plan,
  isCurrentTier,
  onSubscribe,
  loading,
}: SubscriptionTierCardProps) {
  return (
    <Card
      style={[styles.card, plan.popular && styles.popularCard]}
      variant={plan.popular ? 'elevated' : 'default'}
    >
      {plan.popular && <Text style={styles.popularBadge}>Most Popular</Text>}

      <Text style={styles.tierName}>{plan.name}</Text>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>${plan.price}</Text>
        <Text style={styles.period}>/month</Text>
      </View>

      <View style={styles.creditsContainer}>
        <Text style={styles.credits}>{plan.monthlyCredits}</Text>
        <Text style={styles.creditsLabel}>credits per month</Text>
      </View>

      <View style={styles.features}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <Button
        title={isCurrentTier ? 'Current Plan' : 'Subscribe'}
        onPress={onSubscribe}
        disabled={isCurrentTier}
        loading={loading}
        variant={plan.popular ? 'primary' : 'outline'}
        style={styles.button}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 24,
    position: 'relative',
  },
  popularCard: {
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: Colors.secondary,
    color: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '700',
  },
  tierName: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 8,
  },
  price: {
    color: Colors.primary,
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
  },
  period: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  creditsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  credits: {
    color: Colors.secondary,
    fontSize: 32,
    fontWeight: '700',
  },
  creditsLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  features: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    color: Colors.success,
    fontSize: 18,
    marginRight: 12,
  },
  featureText: {
    color: Colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  button: {
    width: '100%',
  },
});
