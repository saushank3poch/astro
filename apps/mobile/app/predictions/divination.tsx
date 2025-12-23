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
import { TarotCard } from '@/components/TarotCard';
import { IChingHexagram } from '@/components/IChingHexagram';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { usePredictionStore } from '@/store/predictionStore';
import { useSubscription } from '@/hooks/useSubscription';
import { Colors } from '@/constants/Colors';
import { DivinationResult } from '@/types';

export default function DivinationScreen() {
  const router = useRouter();
  const { createDivination, loading } = usePredictionStore();
  const { canMakePrediction, credits } = useSubscription();

  const [question, setQuestion] = useState('');
  const [method, setMethod] = useState<'tarot' | 'iching'>('tarot');
  const [result, setResult] = useState<DivinationResult | null>(null);

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

    if (!question) {
      Alert.alert('Error', 'Please enter your question');
      return;
    }

    try {
      const prediction = await createDivination({
        question,
        method,
        spread: method === 'tarot' ? 'three' : undefined,
      });

      if (prediction.result) {
        setResult(prediction.result as DivinationResult);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create prediction');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Divination</Text>
        <Text style={styles.subtitle}>
          Seek guidance for your financial journey
        </Text>

        <Card style={styles.formCard}>
          <Text style={styles.label}>Your Question</Text>
          <Input
            value={question}
            onChangeText={setQuestion}
            placeholder="What should I know about..."
            multiline
            numberOfLines={3}
            style={styles.questionInput}
          />

          <Text style={styles.label}>Method</Text>
          <View style={styles.methodButtons}>
            <Button
              title="Tarot"
              onPress={() => setMethod('tarot')}
              variant={method === 'tarot' ? 'primary' : 'outline'}
              style={styles.methodButton}
            />
            <Button
              title="I Ching"
              onPress={() => setMethod('iching')}
              variant={method === 'iching' ? 'primary' : 'outline'}
              style={styles.methodButton}
            />
          </View>

          <View style={styles.creditsInfo}>
            <Text style={styles.creditsText}>Credits: {credits}</Text>
            <Text style={styles.costText}>Cost: 1 credit</Text>
          </View>

          <Button
            title={loading ? 'Divining...' : 'Divine'}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </Card>

        {loading && <LoadingSpinner message="Consulting the ancient wisdom..." />}

        {result && !loading && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>Your Reading</Text>

            {result.cards && result.cards.map((card, index) => (
              <TarotCard
                key={index}
                name={card.name}
                position={card.position}
                meaning={card.meaning}
                reversed={card.reversed}
              />
            ))}

            {result.hexagram && (
              <IChingHexagram
                number={result.hexagram.number}
                name={result.hexagram.name}
                interpretation={result.hexagram.interpretation}
              />
            )}

            <Card style={styles.interpretationCard}>
              <Text style={styles.interpretationTitle}>Interpretation</Text>
              <Text style={styles.interpretationText}>{result.interpretation}</Text>
            </Card>
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
  questionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  methodButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  methodButton: {
    flex: 1,
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
  interpretationCard: {
    marginTop: 8,
  },
  interpretationTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  interpretationText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
});
