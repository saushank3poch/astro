'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import type { Prediction, PredictionType } from '@/types';

export default function PredictionHistoryPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<PredictionType | 'all'>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const limit = 10;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchPredictions();
  }, [isAuthenticated, router, filter, page]);

  const fetchPredictions = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getPredictions({
        type: filter !== 'all' ? filter : undefined,
        limit,
        offset: page * limit,
      });

      setPredictions(response.data);
      setHasMore(response.pagination.hasMore);
    } catch (err) {
      console.error('Error fetching predictions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPrediction = (prediction: Prediction) => {
    // Navigate to the appropriate prediction page based on type
    const typeRoutes = {
      macro: '/predictions/macro',
      birth_date: '/predictions/timing',
      divination: '/predictions/divination',
      polymarket: '/predictions',
    };

    router.push(`${typeRoutes[prediction.type] || '/predictions'}?id=${prediction.id}`);
  };

  const getPredictionIcon = (type: PredictionType) => {
    const icons = {
      macro: '🌍',
      birth_date: '⏰',
      divination: '🔮',
      polymarket: '📊',
    };
    return icons[type] || '⭐';
  };

  const getPredictionLabel = (type: PredictionType) => {
    const labels = {
      macro: 'Macro Prediction',
      birth_date: 'Asset Timing',
      divination: 'Divination',
      polymarket: 'Polymarket',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'text-green-400',
      processing: 'text-yellow-400',
      pending: 'text-orange-400',
      failed: 'text-red-400',
    };
    return colors[status as keyof typeof colors] || 'text-cosmic-silver';
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/predictions')}
            className="mb-4"
          >
            ← Back to Predictions
          </Button>

          <h1 className="text-4xl font-bold mb-2 text-cosmic-gold">
            Prediction History
          </h1>
          <p className="text-cosmic-silver/80">
            View all your past predictions and cosmic insights
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card variant="glass" padding="md">
            <CardContent>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-cosmic-silver/70">Filter by type:</span>
                {[
                  { value: 'all', label: 'All' },
                  { value: 'macro', label: 'Macro' },
                  { value: 'birth_date', label: 'Timing' },
                  { value: 'divination', label: 'Divination' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilter(option.value as any);
                      setPage(0);
                    }}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      filter === option.value
                        ? 'border-cosmic-violet bg-cosmic-violet/20 text-cosmic-gold'
                        : 'border-cosmic-violet/30 hover:border-cosmic-violet/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Predictions list */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin h-12 w-12 border-4 border-cosmic-violet border-t-transparent rounded-full mb-4" />
            <p className="text-cosmic-silver/70">Loading predictions...</p>
          </div>
        ) : predictions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass" padding="lg">
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔮</div>
                  <h3 className="text-xl font-semibold text-cosmic-gold mb-2">
                    No Predictions Yet
                  </h3>
                  <p className="text-cosmic-silver/70 mb-6">
                    Start your cosmic journey by creating your first prediction.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => router.push('/predictions')}
                  >
                    Create Prediction
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card
                  variant="glass"
                  padding="lg"
                  className="cursor-pointer hover:border-cosmic-violet/50 transition-all"
                  onClick={() => handleViewPrediction(prediction)}
                >
                  <CardContent>
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="text-4xl flex-shrink-0">
                        {getPredictionIcon(prediction.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-cosmic-gold">
                              {getPredictionLabel(prediction.type)}
                            </h3>
                            {prediction.question && (
                              <p className="text-sm text-cosmic-silver/80 mt-1 line-clamp-2">
                                "{prediction.question}"
                              </p>
                            )}
                            {prediction.targetAssetClass && (
                              <p className="text-sm text-cosmic-silver/60 mt-1">
                                {prediction.targetAssetClass}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className={`text-sm font-semibold ${getStatusColor(prediction.status)}`}>
                              {prediction.status.charAt(0).toUpperCase() + prediction.status.slice(1)}
                            </span>
                            {prediction.favorableScore !== undefined && prediction.status === 'completed' && (
                              <div className="text-right">
                                <div className="text-2xl font-bold text-cosmic-gold">
                                  {prediction.favorableScore.toFixed(1)}
                                </div>
                                <div className="text-xs text-cosmic-silver/60">Score</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Meta info */}
                        <div className="flex items-center gap-4 text-xs text-cosmic-silver/60 mt-3">
                          <span>
                            Method: {prediction.method.charAt(0).toUpperCase() + prediction.method.slice(1)}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(prediction.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {prediction.completedAt && (
                            <>
                              <span>•</span>
                              <span>
                                Completed: {new Date(prediction.completedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Preview/Summary */}
                        {prediction.status === 'completed' && prediction.reasoning && (
                          <div className="mt-3 p-3 bg-cosmic-deep/50 rounded border border-cosmic-violet/20">
                            <p className="text-sm text-cosmic-silver/80 line-clamp-2">
                              {prediction.reasoning}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="text-cosmic-violet flex-shrink-0">
                        →
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && predictions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex items-center justify-center gap-4"
          >
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              ← Previous
            </Button>

            <span className="text-cosmic-silver/70">
              Page {page + 1}
            </span>

            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={!hasMore}
            >
              Next →
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
