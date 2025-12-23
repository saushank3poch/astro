import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ElementBadgeProps {
  element: string;
}

export function ElementBadge({ element }: ElementBadgeProps) {
  const elementColors = {
    fire: Colors.fire,
    earth: Colors.earth,
    air: Colors.air,
    water: Colors.water,
  };

  const elementIcons = {
    fire: '🔥',
    earth: '🌍',
    air: '💨',
    water: '💧',
  };

  const color = elementColors[element.toLowerCase() as keyof typeof elementColors] || Colors.textMuted;
  const icon = elementIcons[element.toLowerCase() as keyof typeof elementIcons] || '⭐';

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.text}>{element}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
