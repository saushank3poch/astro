import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/Colors';

export default function SubscriptionSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>✨</Text>
        <Text style={styles.title}>Welcome to Premium!</Text>
        <Text style={styles.message}>
          Your subscription has been activated successfully. Enjoy unlimited cosmic insights!
        </Text>

        <View style={styles.actions}>
          <Button
            title="Start Predicting"
            onPress={() => router.push('/(tabs)/predictions')}
            style={styles.button}
          />
          <Button
            title="Go to Home"
            onPress={() => router.push('/(tabs)')}
            variant="outline"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  actions: {
    width: '100%',
  },
  button: {
    marginBottom: 12,
  },
});
