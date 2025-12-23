import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Colors } from '@/constants/Colors';

interface MacroResultCardProps {
  asset: string;
  score: number;
  reasoning: string;
}

export function MacroResultCard({ asset, score, reasoning }: MacroResultCardProps) {
  const scoreColor =
    score >= 80 ? Colors.success : score >= 50 ? Colors.warning : Colors.error;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.asset}>{asset}</Text>
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>
      <Text style={styles.reasoning}>{reasoning}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  asset: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  reasoning: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
