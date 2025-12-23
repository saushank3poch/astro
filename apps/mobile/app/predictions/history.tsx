import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PredictionHistoryItem } from '@/components/PredictionHistoryItem';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { usePredictionStore } from '@/store/predictionStore';
import { Colors } from '@/constants/Colors';

export default function PredictionHistoryScreen() {
  const router = useRouter();
  const { predictions, loading, loadPredictions } = usePredictionStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadPredictions().catch(() => {});
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPredictions();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !refreshing) {
    return <LoadingSpinner fullScreen message="Loading predictions..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Prediction History</Text>
        <Text style={styles.subtitle}>
          All your past predictions and insights
        </Text>
      </View>

      {predictions.length === 0 ? (
        <EmptyState
          icon={<Text style={styles.emptyIcon}>✨</Text>}
          title="No Predictions Yet"
          message="Start your cosmic journey by creating your first prediction"
          actionLabel="Create Prediction"
          onAction={() => router.push('/(tabs)/predictions')}
        />
      ) : (
        <FlatList
          data={predictions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PredictionHistoryItem
              prediction={item}
              onPress={() => router.push(`/predictions/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
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
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyIcon: {
    fontSize: 64,
  },
});
