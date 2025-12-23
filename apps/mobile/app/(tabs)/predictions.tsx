import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PredictionTypeCard } from '@/components/PredictionTypeCard';
import { Colors } from '@/constants/Colors';

export default function PredictionsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Choose Your Prediction</Text>
        <Text style={styles.subtitle}>
          Select the type of cosmic insight you seek
        </Text>

        <PredictionTypeCard
          type="macro"
          title="Macro Prediction"
          description="Discover which asset classes will thrive in the coming year based on planetary alignments"
          icon="📈"
          onPress={() => router.push('/predictions/macro')}
        />

        <PredictionTypeCard
          type="timing"
          title="Timing Analysis"
          description="Find the most favorable periods for trading specific assets using astrological cycles"
          icon="⏰"
          onPress={() => router.push('/predictions/timing')}
        />

        <PredictionTypeCard
          type="divination"
          title="Divination"
          description="Seek guidance through Tarot or I Ching for your financial questions"
          icon="🔮"
          onPress={() => router.push('/predictions/divination')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: 24,
  },
});
