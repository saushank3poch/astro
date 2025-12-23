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
import { MacroResultCard } from '@/components/MacroResultCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { usePredictionStore } from '@/store/predictionStore';
import { useSubscription } from '@/hooks/useSubscription';
import { Colors } from '@/constants/Colors';
import { MacroPredictionResult } from '@/types';

export default function MacroPredictionScreen() {
  const router = useRouter();
  const { createMacroPrediction, currentPrediction, loading } = usePredictionStore();
  const { canMakePrediction, credits } = useSubscription();

  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [result, setResult] = useState<MacroPredictionResult | null>(null);

  const handleSubmit = async () => {
    if (!canMakePrediction()) {
      Alert.alert(
        'Insufficient Credits',
        'You need more credits to make a prediction. Upgrade your plan or wait for your monthly refresh.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription/plans') },
        ]
      );
      return;
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
      Alert.alert('Invalid Year', 'Please enter a valid year between 2020 and 2100');
      return;
    }

    try {
      const prediction = await createMacroPrediction({
        year: yearNum,
        assetClasses: ['crypto', 'stocks', 'commodities', 'forex'],
      });

      if (prediction.result) {
        setResult(prediction.result as MacroPredictionResult);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create prediction');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Macro Prediction</Text>
        <Text style={styles.subtitle}>
          Discover which asset classes will thrive this year
        </Text>

        <Card style={styles.formCard}>
          <Text style={styles.label}>Select Year</Text>
          <Input
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
            placeholder="2025"
          />

          <View style={styles.creditsInfo}>
            <Text style={styles.creditsText}>Credits: {credits}</Text>
            <Text style={styles.costText}>Cost: 1 credit</Text>
          </View>

          <Button
            title={loading ? 'Generating...' : 'Generate Prediction'}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </Card>

        {loading && <LoadingSpinner message="Consulting the stars..." />}

        {result && !loading && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>
              Predictions for {result.year}
            </Text>
            {result.predictions.map((pred, index) => (
              <MacroResultCard
                key={index}
                asset={pred.asset}
                score={pred.score}
                reasoning={pred.reasoning}
              />
            ))}
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
});
