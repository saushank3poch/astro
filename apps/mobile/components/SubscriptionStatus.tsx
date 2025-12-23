import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Colors } from '@/constants/Colors';
import { SubscriptionTier } from '@/types';
import { format } from 'date-fns';

interface SubscriptionStatusProps {
  tier: SubscriptionTier;
  credits: number;
  expiresAt: Date | null;
  autoRenew: boolean;
}

export function SubscriptionStatus({
  tier,
  credits,
  expiresAt,
  autoRenew,
}: SubscriptionStatusProps) {
  const tierNames = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
  };

  const tierColors = {
    free: Colors.textMuted,
    basic: Colors.primary,
    pro: Colors.secondary,
  };

  return (
    <Card style={styles.card} variant="elevated">
      <View style={styles.header}>
        <Text style={styles.label}>Current Plan</Text>
        <View
          style={[
            styles.tierBadge,
            { backgroundColor: tierColors[tier] },
          ]}
        >
          <Text style={styles.tierText}>{tierNames[tier]}</Text>
        </View>
      </View>

      <View style={styles.creditsContainer}>
        <Text style={styles.creditsValue}>{credits}</Text>
        <Text style={styles.creditsLabel}>Credits Remaining</Text>
      </View>

      {expiresAt && (
        <View style={styles.expiryContainer}>
          <Text style={styles.expiryLabel}>
            {autoRenew ? 'Renews on' : 'Expires on'}
          </Text>
          <Text style={styles.expiryDate}>
            {format(expiresAt, 'MMM dd, yyyy')}
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tierText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  creditsContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  creditsValue: {
    color: Colors.primary,
    fontSize: 48,
    fontWeight: '700',
  },
  creditsLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  expiryContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  expiryLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  expiryDate: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
