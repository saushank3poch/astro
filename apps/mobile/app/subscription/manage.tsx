import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { Colors } from '@/constants/Colors';
import { Platform } from 'react-native';

export default function ManageSubscriptionScreen() {
  const router = useRouter();
  const { tier, credits, expiresAt, autoRenew } = useSubscription();

  const handleManageSubscription = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else {
      Linking.openURL(
        'https://play.google.com/store/account/subscriptions'
      );
    }
  };

  const handleUpgrade = () => {
    router.push('/subscription/plans');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Manage Subscription</Text>

        <SubscriptionStatus
          tier={tier}
          credits={credits}
          expiresAt={expiresAt}
          autoRenew={autoRenew}
        />

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Subscription Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plan:</Text>
            <Text style={styles.infoValue}>{tier.toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Monthly Credits:</Text>
            <Text style={styles.infoValue}>{credits}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Auto-Renewal:</Text>
            <Text style={styles.infoValue}>{autoRenew ? 'ON' : 'OFF'}</Text>
          </View>
        </Card>

        {tier !== 'pro' && (
          <Card style={styles.upgradeCard}>
            <Text style={styles.upgradeTitle}>Unlock More Features</Text>
            <Text style={styles.upgradeText}>
              Upgrade to a higher tier for more predictions and advanced features
            </Text>
            <Button
              title="View Plans"
              onPress={handleUpgrade}
              style={styles.upgradeButton}
            />
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            title="Manage on App Store"
            onPress={handleManageSubscription}
            variant="outline"
            style={styles.actionButton}
          />
        </View>

        <Card style={styles.helpCard}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            For billing questions or subscription issues, please contact our support team.
          </Text>
        </Card>
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
    marginBottom: 24,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  upgradeCard: {
    backgroundColor: Colors.primary,
    marginBottom: 16,
    alignItems: 'center',
  },
  upgradeTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  upgradeText: {
    color: Colors.text,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  upgradeButton: {
    backgroundColor: Colors.text,
  },
  actions: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  helpCard: {
    backgroundColor: Colors.surfaceLight,
  },
  helpTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  helpText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
