import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Colors } from '@/constants/Colors';
import { Prediction } from '@/types';
import { format, parseISO } from 'date-fns';

interface PredictionHistoryItemProps {
  prediction: Prediction;
  onPress: () => void;
}

export function PredictionHistoryItem({
  prediction,
  onPress,
}: PredictionHistoryItemProps) {
  const typeLabels = {
    macro: 'Macro Prediction',
    timing: 'Timing Analysis',
    divination: 'Divination',
  };

  const statusColors = {
    pending: Colors.warning,
    completed: Colors.success,
    failed: Colors.error,
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.type}>{typeLabels[prediction.type]}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[prediction.status] },
          ]}
        >
          <Text style={styles.statusText}>{prediction.status}</Text>
        </View>
      </View>
      <Text style={styles.date}>
        {format(parseISO(prediction.createdAt), 'MMM dd, yyyy - HH:mm')}
      </Text>
      <Text style={styles.credits}>{prediction.creditsUsed} credits used</Text>
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
    marginBottom: 8,
  },
  type: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  date: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  credits: {
    color: Colors.textMuted,
    fontSize: 12,
  },
});
