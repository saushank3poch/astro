import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MacroResultCard } from '@/components/MacroResultCard';
import { TimingCalendar } from '@/components/TimingCalendar';
import { TarotCard } from '@/components/TarotCard';
import { IChingHexagram } from '@/components/IChingHexagram';
import { usePredictionStore } from '@/store/predictionStore';
import { Colors } from '@/constants/Colors';
import { format, parseISO } from 'date-fns';

export default function PredictionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentPrediction, loading, loadPrediction } = usePredictionStore();

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadPrediction(id);
    }
  }, [id]);

  const handleShare = async () => {
    if (!currentPrediction) return;

    try {
      await Share.share({
        message: `Check out my ${currentPrediction.type} prediction from Astro!`,
        title: 'Astro Prediction',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (loading || !currentPrediction) {
    return <LoadingSpinner fullScreen message="Loading prediction..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.type}>
            {currentPrediction.type.toUpperCase()} PREDICTION
          </Text>
          <Text style={styles.date}>
            {format(parseISO(currentPrediction.createdAt), 'MMM dd, yyyy - HH:mm')}
          </Text>
        </View>

        {currentPrediction.type === 'macro' && currentPrediction.result?.predictions && (
          <View>
            {currentPrediction.result.predictions.map((pred: any, index: number) => (
              <MacroResultCard
                key={index}
                asset={pred.asset}
                score={pred.score}
                reasoning={pred.reasoning}
              />
            ))}
          </View>
        )}

        {currentPrediction.type === 'timing' && currentPrediction.result?.periods && (
          <Card>
            <TimingCalendar periods={currentPrediction.result.periods} />
          </Card>
        )}

        {currentPrediction.type === 'divination' && currentPrediction.result && (
          <View>
            {currentPrediction.result.cards?.map((card: any, index: number) => (
              <TarotCard
                key={index}
                name={card.name}
                position={card.position}
                meaning={card.meaning}
                reversed={card.reversed}
              />
            ))}

            {currentPrediction.result.hexagram && (
              <IChingHexagram
                number={currentPrediction.result.hexagram.number}
                name={currentPrediction.result.hexagram.name}
                interpretation={currentPrediction.result.hexagram.interpretation}
              />
            )}

            {currentPrediction.result.interpretation && (
              <Card style={styles.interpretationCard}>
                <Text style={styles.interpretationTitle}>Interpretation</Text>
                <Text style={styles.interpretationText}>
                  {currentPrediction.result.interpretation}
                </Text>
              </Card>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Share"
            onPress={handleShare}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="New Prediction"
            onPress={() => router.push('/(tabs)/predictions')}
            style={styles.actionButton}
          />
        </View>
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
  header: {
    marginBottom: 24,
  },
  type: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  date: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  interpretationCard: {
    marginTop: 16,
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
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
  },
});
