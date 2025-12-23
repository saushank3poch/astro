import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/Colors';

interface AuthButtonProps {
  type: 'email' | 'google' | 'apple';
  title: string;
  onPress: () => void;
  loading?: boolean;
}

export function AuthButton({ type, title, onPress, loading }: AuthButtonProps) {
  const backgroundColor = {
    email: Colors.primary,
    google: '#FFFFFF',
    apple: '#000000',
  }[type];

  const textColor = {
    email: Colors.text,
    google: '#000000',
    apple: '#FFFFFF',
  }[type];

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {type === 'google' && <Text style={styles.icon}>G</Text>}
        {type === 'apple' && <Text style={styles.icon}></Text>}
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
