import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Colors } from '@/constants/Colors';
import { PredictionType } from '@/types';

interface PredictionTypeCardProps {
  type: PredictionType;
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
}

export function PredictionTypeCard({
  type,
  title,
  description,
  icon,
  onPress,
}: PredictionTypeCardProps) {
  return (
    <Card style={styles.card} onPress={onPress} variant="elevated">
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
