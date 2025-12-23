import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useBiometric } from '@/hooks/useBiometric';

interface BiometricToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function BiometricToggle({ enabled, onToggle }: BiometricToggleProps) {
  const { isAvailable, biometricType, loading } = useBiometric();

  if (loading || !isAvailable) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Enable {biometricType}</Text>
        <Text style={styles.description}>
          Use {biometricType} to quickly and securely access your account
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor={Colors.text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  labelContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
});
