import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { CompatibilityGauge } from '@/components/CompatibilityGauge';
import { ElementBadge } from '@/components/ElementBadge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useCompatibilityStore } from '@/store/compatibilityStore';
import { Colors } from '@/constants/Colors';

export default function AssetDetailScreen() {
  const { symbol } = useLocalSearchParams();
  const { currentAsset, loading, loadAssetCompatibility } = useCompatibilityStore();

  useEffect(() => {
    if (symbol && typeof symbol === 'string') {
      loadAssetCompatibility(symbol);
    }
  }, [symbol]);

  if (loading || !currentAsset) {
    return <LoadingSpinner fullScreen message="Loading asset details..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.symbol}>{currentAsset.symbol}</Text>
          <Text style={styles.name}>{currentAsset.name}</Text>
          <Text style={styles.type}>{currentAsset.type.toUpperCase()}</Text>
        </View>

        <View style={styles.gaugeContainer}>
          <CompatibilityGauge score={currentAsset.compatibilityScore} />
        </View>

        <Card style={styles.elementCard}>
          <Text style={styles.cardTitle}>Element</Text>
          <ElementBadge element={currentAsset.element} />
        </Card>

        <Card style={styles.reasoningCard}>
          <Text style={styles.cardTitle}>Why This Asset?</Text>
          <Text style={styles.reasoning}>{currentAsset.reasoning}</Text>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Compatibility</Text>
          <Text style={styles.infoText}>
            Compatibility scores are calculated based on your birth chart, planetary positions,
            and the asset's astrological characteristics. Higher scores indicate stronger
            alignment with your cosmic energy.
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  symbol: {
    color: Colors.text,
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  name: {
    color: Colors.textSecondary,
    fontSize: 20,
    marginBottom: 4,
  },
  type: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  elementCard: {
    marginBottom: 16,
    alignItems: 'center',
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  reasoningCard: {
    marginBottom: 16,
  },
  reasoning: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: Colors.surfaceLight,
  },
  infoTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
