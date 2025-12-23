import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useOffline } from '@/hooks/useOffline';

export function OfflineBanner() {
  const { isOffline } = useOffline();

  if (!isOffline) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>You are offline. Some features may be limited.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.warning,
    padding: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
});
