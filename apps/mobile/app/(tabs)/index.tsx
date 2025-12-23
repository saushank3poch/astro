import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { usePredictionStore } from '@/store/predictionStore';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { tier, credits, expiresAt, autoRenew, loadSubscription } = useSubscription();
  const { predictions, loading, loadPredictions } = usePredictionStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadPredictions().catch(() => {});
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadSubscription(), loadPredictions()]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const recentPredictions = predictions.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name || 'Astro User'}</Text>
        </View>

        <SubscriptionStatus
          tier={tier}
          credits={credits}
          expiresAt={expiresAt}
          autoRenew={autoRenew}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Card style={styles.actionCard} onPress={() => router.push('/predictions/macro')}>
              <Text style={styles.actionIcon}>📈</Text>
              <Text style={styles.actionText}>Macro Prediction</Text>
            </Card>
            <Card style={styles.actionCard} onPress={() => router.push('/predictions/timing')}>
              <Text style={styles.actionIcon}>⏰</Text>
              <Text style={styles.actionText}>Timing Analysis</Text>
            </Card>
            <Card style={styles.actionCard} onPress={() => router.push('/predictions/divination')}>
              <Text style={styles.actionIcon}>🔮</Text>
              <Text style={styles.actionText}>Divination</Text>
            </Card>
            <Card style={styles.actionCard} onPress={() => router.push('/compatibility/list')}>
              <Text style={styles.actionIcon}>💎</Text>
              <Text style={styles.actionText}>Compatibility</Text>
            </Card>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Predictions</Text>
            <Button
              title="View All"
              onPress={() => router.push('/predictions/history')}
              variant="outline"
              size="small"
            />
          </View>

          {loading ? (
            <LoadingSpinner />
          ) : recentPredictions.length > 0 ? (
            recentPredictions.map((prediction) => (
              <Card
                key={prediction.id}
                style={styles.predictionCard}
                onPress={() => router.push(`/predictions/${prediction.id}`)}
              >
                <Text style={styles.predictionType}>
                  {prediction.type.toUpperCase()}
                </Text>
                <Text style={styles.predictionDate}>
                  {new Date(prediction.createdAt).toLocaleDateString()}
                </Text>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No predictions yet</Text>
              <Text style={styles.emptySubtext}>
                Start your cosmic journey with a prediction
              </Text>
            </Card>
          )}
        </View>

        {tier === 'free' && (
          <Card style={styles.upgradeCard}>
            <Text style={styles.upgradeTitle}>Unlock Premium Features</Text>
            <Text style={styles.upgradeText}>
              Upgrade to Basic or Pro for unlimited predictions and advanced insights
            </Text>
            <Button
              title="View Plans"
              onPress={() => router.push('/subscription/plans')}
              style={styles.upgradeButton}
            />
          </Card>
        )}
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
  header: {
    marginBottom: 24,
  },
  greeting: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  name: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  predictionCard: {
    marginBottom: 12,
  },
  predictionType: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  predictionDate: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  upgradeCard: {
    backgroundColor: Colors.primary,
    padding: 24,
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
});
