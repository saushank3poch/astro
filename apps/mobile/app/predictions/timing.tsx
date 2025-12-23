import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { TimingCalendar } from '@/components/TimingCalendar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { usePredictionStore } from '@/store/predictionStore';
import { useSubscription } from '@/hooks/useSubscription';
import { Colors } from '@/constants/Colors';
import { TimingPredictionResult } from '@/types';
import { format, addDays } from 'date-fns';

export default function TimingPredictionScreen() {
  const router = useRouter();
  const { createTimingPrediction, loading } = usePredictionStore();
  const { canMakePrediction, credits } = useSubscription();

  const [symbol, setSymbol] = useState('');
  const [result, setResult] = useState<TimingPredictionResult | null>(null);

  const handleSubmit = async () => {
    if (!canMakePrediction()) {
      Alert.alert(
        'Insufficient Credits',
        'You need more credits to make a prediction.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription/plans') },
        ]
      );
      return;
    }

    if (!symbol) {
      Alert.alert('Error', 'Please enter an asset symbol');
      return;
    }

    try {
      const today = new Date();
      const prediction = await createTimingPrediction({
        assetSymbol: symbol.toUpperCase(),
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(addDays(today, 30), 'yyyy-MM-dd'),
      });

      if (prediction.result) {
        setResult(prediction.result as TimingPredictionResult);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create prediction');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Timing Analysis</Text>
        <Text style={styles.subtitle}>
          Find favorable periods for trading
        </Text>

        <Card style={styles.formCard}>
          <Text style={styles.label}>Asset Symbol</Text>
          <Input
            value={symbol}
            onChangeText={setSymbol}
            placeholder="BTC, ETH, AAPL, etc."
            autoCapitalize="characters"
          />

          <View style={styles.creditsInfo}>
            <Text style={styles.creditsText}>Credits: {credits}</Text>
            <Text style={styles.costText}>Cost: 1 credit</Text>
          </View>

          <Button
            title={loading ? 'Analyzing...' : 'Analyze Timing'}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </Card>

        {loading && <LoadingSpinner message="Analyzing planetary cycles..." />}

        {result && !loading && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>
              Timing for {result.assetSymbol}
            </Text>
            <Card>
              <TimingCalendar periods={result.periods} />
            </Card>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
                <Text style={styles.legendText}>Favorable</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.textMuted }]} />
                <Text style={styles.legendText}>Neutral</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
                <Text style={styles.legendText}>Unfavorable</Text>
              </View>
            </View>
          </View>
        )}
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
  formCard: {
    marginBottom: 24,
  },
  label: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  creditsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  creditsText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  costText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 8,
  },
  results: {
    marginTop: 8,
  },
  resultsTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    padding: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
