import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Colors } from '@/constants/Colors';
import { CompatibleAsset } from '@/types';

interface CompatibilityCardProps {
  asset: CompatibleAsset;
  onPress: () => void;
}

export function CompatibilityCard({ asset, onPress }: CompatibilityCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return Colors.highCompatibility;
    if (score >= 40) return Colors.mediumCompatibility;
    return Colors.lowCompatibility;
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.symbol}>{asset.symbol}</Text>
          <Text style={styles.name}>{asset.name}</Text>
          <Text style={styles.type}>{asset.type.toUpperCase()}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text
            style={[
              styles.score,
              { color: getScoreColor(asset.compatibilityScore) },
            ]}
          >
            {asset.compatibilityScore}
          </Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  symbol: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  name: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 2,
  },
  type: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  score: {
    fontSize: 32,
    fontWeight: '700',
  },
  scoreLabel: {
    color: Colors.textMuted,
    fontSize: 12,
  },
});
