'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input } from '@/components/ui';
import { ProcessingAnimation, TimingResult } from '@/components/predictions';
import type { Asset, Prediction, Timeframe } from '@/types';

const CREDITS_REQUIRED = 30;

export default function TimingPredictionPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>('short_term');
  const [specificDate, setSpecificDate] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Search assets
  useEffect(() => {
    const searchAssets = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const response = await apiClient.searchAssets(searchQuery, 10);
        setSearchResults(response.results || []);
      } catch (err) {
        console.error('Error searching assets:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchAssets, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !selectedAsset) return;

    // Check credits
    if ((user.creditsBalance || 0) < CREDITS_REQUIRED) {
      setError('Insufficient credits. Please purchase more credits to continue.');
      return;
    }

    try {
      setIsProcessing(true);

      // Create prediction request
      const response = await apiClient.createPrediction({
        type: 'birth_date',
        method: 'combined',
        targetAssetId: selectedAsset.id,
        timeframe,
        specificDate: specificDate || undefined,
      });

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 30;
      const pollInterval = setInterval(async () => {
        try {
          const result = await apiClient.getPrediction(response.id);

          if (result.status === 'completed') {
            clearInterval(pollInterval);
            setPrediction(result);
            setIsProcessing(false);

            // Refresh user to update credits
            const updatedUser = await apiClient.getCurrentUser();
            useAuthStore.setState({ user: updatedUser });
          } else if (result.status === 'failed') {
            clearInterval(pollInterval);
            setError('Prediction failed. Please try again.');
            setIsProcessing(false);
          }

          attempts++;
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setError('Prediction is taking longer than expected. Please check your history later.');
            setIsProcessing(false);
          }
        } catch (err) {
          console.error('Error polling prediction:', err);
        }
      }, 1000);
    } catch (err: any) {
      console.error('Error creating prediction:', err);
      setError(err.response?.data?.error?.message || 'Failed to create prediction. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setPrediction(null);
    setError(null);
    setSearchQuery('');
    setSelectedAsset(null);
    setTimeframe('short_term');
    setSpecificDate('');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  // Show processing animation
  if (isProcessing) {
    return <ProcessingAnimation />;
  }

  // Show result
  if (prediction && prediction.predictionResult) {
    const result = prediction.predictionResult;
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto py-8">
          {/* Header with back button */}
          <div className="mb-6 flex items-center gap-4">
            <Button variant="outline" onClick={handleReset}>
              ← New Prediction
            </Button>
            <Button variant="ghost" onClick={() => router.push('/predictions')}>
              Back to Predictions
            </Button>
          </div>

          <TimingResult
            assetSymbol={result.assetSymbol || selectedAsset?.symbol || ''}
            assetName={result.assetName || selectedAsset?.name || ''}
            timeframe={timeframe}
            currentScore={result.currentScore || 5}
            bestEntryDate={result.bestEntryDate}
            favorablePeriods={result.favorablePeriods || []}
            challengingPeriods={result.challengingPeriods || []}
            recommendation={result.recommendation || ''}
            heatmapData={result.heatmapData || []}
            transitDetails={result.transitDetails}
          />
        </div>
      </div>
    );
  }

  // Show form
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto py-8">
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
            Asset Timing Analysis
          </h1>
          <p className="text-cosmic-silver/80">
            Find the perfect entry and exit points using astrological timing
          </p>
        </motion.div>

        {/* Credits display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card variant="glass" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-cosmic-silver/70">Your Credits:</span>
                  <span className="text-2xl font-bold text-cosmic-gold">
                    {user.creditsBalance || 0}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-cosmic-silver/70">Cost:</span>
                  <span className="text-2xl font-bold text-cosmic-violet">
                    {CREDITS_REQUIRED}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle>Configure Your Analysis</CardTitle>
              <CardDescription>
                Select an asset and timeframe for timing analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Asset search */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Search Asset
                  </label>
                  <div className="relative">
                    <Input
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (selectedAsset) setSelectedAsset(null);
                      }}
                      placeholder="Search for crypto, stocks, or commodities..."
                      disabled={!!selectedAsset}
                    />

                    {/* Search results dropdown */}
                    {!selectedAsset && searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-cosmic-deep border border-cosmic-violet/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((asset) => (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                            className="w-full p-3 text-left hover:bg-cosmic-violet/20 transition-colors border-b border-cosmic-violet/10 last:border-b-0"
                          >
                            <div className="font-semibold text-cosmic-gold">
                              {asset.symbol}
                            </div>
                            <div className="text-sm text-cosmic-silver/70">
                              {asset.name} • {asset.assetType}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin h-5 w-5 border-2 border-cosmic-violet border-t-transparent rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Selected asset */}
                  {selectedAsset && (
                    <div className="mt-3 p-3 bg-cosmic-violet/20 rounded-lg border border-cosmic-violet/30 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-cosmic-gold">
                          {selectedAsset.symbol}
                        </div>
                        <div className="text-sm text-cosmic-silver/70">
                          {selectedAsset.name}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedAsset(null)}
                        className="text-cosmic-silver/70 hover:text-cosmic-silver"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Timeframe selector */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Timeframe
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'short_term', label: 'Short-term', desc: '7-30 days' },
                      { value: 'medium_term', label: 'Medium-term', desc: '1-3 months' },
                      { value: 'long_term', label: 'Long-term', desc: '3-12 months' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTimeframe(option.value as Timeframe)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          timeframe === option.value
                            ? 'border-cosmic-violet bg-cosmic-violet/20 text-cosmic-gold'
                            : 'border-cosmic-violet/30 hover:border-cosmic-violet/50'
                        }`}
                      >
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-xs text-cosmic-silver/60">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific date (optional) */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Specific Date to Analyze (Optional)
                  </label>
                  <Input
                    type="date"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-cosmic-silver/60 mt-1">
                    Leave blank for general timeframe analysis
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={(user.creditsBalance || 0) < CREDITS_REQUIRED || !selectedAsset}
                >
                  Analyze Timing ({CREDITS_REQUIRED} Credits)
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid md:grid-cols-2 gap-4"
        >
          <Card variant="glass" padding="md">
            <CardContent>
              <h3 className="font-semibold text-cosmic-violet mb-2">What You'll Get:</h3>
              <ul className="text-sm text-cosmic-silver/80 space-y-1">
                <li>• Current timing score (1-10)</li>
                <li>• Calendar heatmap of favorable/challenging days</li>
                <li>• Best entry date recommendation</li>
                <li>• Detailed favorable and challenging periods</li>
                <li>• Astrological transit analysis</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="glass" padding="md">
            <CardContent>
              <h3 className="font-semibold text-cosmic-violet mb-2">How It Works:</h3>
              <p className="text-sm text-cosmic-silver/80">
                We analyze the asset's birth chart (genesis date) and compare it with current
                and upcoming planetary transits to identify optimal timing windows for entry
                and exit.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
