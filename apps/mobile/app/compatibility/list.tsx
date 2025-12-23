import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompatibilityCard } from '@/components/CompatibilityCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { useCompatibilityStore } from '@/store/compatibilityStore';
import { Colors } from '@/constants/Colors';

export default function CompatibilityListScreen() {
  const router = useRouter();
  const { assets, loading, loadCompatibilities } = useCompatibilityStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadCompatibilities().catch(() => {});
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCompatibilities();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !refreshing) {
    return <LoadingSpinner fullScreen message="Loading compatible assets..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Compatible Assets</Text>
        <Text style={styles.subtitle}>
          Assets aligned with your cosmic energy
        </Text>
      </View>

      {assets.length === 0 ? (
        <EmptyState
          icon={<Text style={styles.emptyIcon}>💫</Text>}
          title="No Compatible Assets"
          message="Complete your birth chart to discover assets that match your astrological profile"
          actionLabel="Update Profile"
          onAction={() => router.push('/settings/profile')}
        />
      ) : (
        <FlatList
          data={assets}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => (
            <CompatibilityCard
              asset={item}
              onPress={() => router.push(`/compatibility/${item.symbol}`)}
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
