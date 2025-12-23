import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Colors } from '@/constants/Colors';

interface TarotCardProps {
  name: string;
  position: string;
  meaning: string;
  reversed: boolean;
}

export function TarotCard({ name, position, meaning, reversed }: TarotCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.position}>{position}</Text>
        {reversed && <Text style={styles.reversed}>Reversed</Text>}
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.meaning}>{meaning}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  position: {
    color: Colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  reversed: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  meaning: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
