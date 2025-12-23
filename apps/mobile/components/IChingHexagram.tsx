import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Colors } from '@/constants/Colors';

interface IChingHexagramProps {
  number: number;
  name: string;
  interpretation: string;
}

export function IChingHexagram({
  number,
  name,
  interpretation,
}: IChingHexagramProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.number}>#{number}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
      <View style={styles.hexagram}>
        {/* Simple hexagram representation - you can enhance this */}
        <View style={styles.line} />
        <View style={styles.line} />
        <View style={styles.brokenLine}>
          <View style={styles.lineHalf} />
          <View style={styles.lineHalf} />
        </View>
        <View style={styles.line} />
        <View style={styles.brokenLine}>
          <View style={styles.lineHalf} />
          <View style={styles.lineHalf} />
        </View>
        <View style={styles.line} />
      </View>
      <Text style={styles.interpretation}>{interpretation}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  number: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  name: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  hexagram: {
    width: 120,
    gap: 8,
    marginBottom: 16,
  },
  line: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  brokenLine: {
    flexDirection: 'row',
    gap: 8,
  },
  lineHalf: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  interpretation: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
