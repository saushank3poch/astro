'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { ProcessingAnimation, MacroResult } from '@/components/predictions';
import type { Prediction, PredictionMethod } from '@/types';

const CREDITS_REQUIRED = 50;

const assetClassOptions = [
  { value: 'crypto', label: 'Crypto' },
  { value: 'us_stocks', label: 'US Stocks' },
  { value: 'hong_kong_stocks', label: 'Hong Kong Stocks' },
  { value: 'chinese_stocks', label: 'Chinese Stocks' },
  { value: 'defi', label: 'DeFi' },
  { value: 'rwa', label: 'RWA (Real World Assets)' },
  { value: 'commodities', label: 'Commodities' },
];

export default function MacroPredictionPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [year, setYear] = useState(new Date().getFullYear() + 1);
  const [selectedAssetClasses, setSelectedAssetClasses] = useState<string[]>(['crypto', 'us_stocks']);
  const [method, setMethod] = useState<PredictionMethod>('combined');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleAssetClassToggle = (assetClass: string) => {
    if (selectedAssetClasses.includes(assetClass)) {
      setSelectedAssetClasses(selectedAssetClasses.filter((ac) => ac !== assetClass));
    } else {
      setSelectedAssetClasses([...selectedAssetClasses, assetClass]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) return;

    // Check credits
    if ((user.creditsBalance || 0) < CREDITS_REQUIRED) {
      setError('Insufficient credits. Please purchase more credits to continue.');
      return;
    }

    // Validate selection
    if (selectedAssetClasses.length === 0) {
      setError('Please select at least one asset class.');
      return;
    }

    try {
      setIsProcessing(true);

      // Create prediction request
      const response = await apiClient.createPrediction({
        type: 'macro',
        method,
        year,
        targetAssetClass: selectedAssetClasses.join(','),
      });

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds
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
    setYear(new Date().getFullYear() + 1);
    setSelectedAssetClasses(['crypto', 'us_stocks']);
    setMethod('combined');
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
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto py-8">
          {/* Header with back button */}
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleReset}
            >
              ← New Prediction
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push('/predictions')}
            >
              Back to Predictions
            </Button>
          </div>

          <MacroResult
            year={year}
            method={method}
            yearElement={prediction.predictionResult.yearElement}
            yearAnimal={prediction.predictionResult.yearAnimal}
            overview={prediction.predictionResult.overview}
            assetClasses={prediction.predictionResult.assetClasses || []}
            marketEnergy={prediction.predictionResult.marketEnergy}
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
            Macro Market Predictions
          </h1>
          <p className="text-cosmic-silver/80">
            Discover which markets and asset classes will shine based on cosmic alignments
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
              <CardTitle>Configure Your Prediction</CardTitle>
              <CardDescription>
                Select the year and asset classes you want to analyze
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Year selector */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-cosmic-deep border border-cosmic-violet/30 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-cosmic-violet"
                  >
                    {[0, 1, 2].map((offset) => {
                      const y = new Date().getFullYear() + offset;
                      return (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Asset classes selector */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Select Asset Classes (minimum 1)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {assetClassOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleAssetClassToggle(option.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedAssetClasses.includes(option.value)
                            ? 'border-cosmic-violet bg-cosmic-violet/20 text-cosmic-gold'
                            : 'border-cosmic-violet/30 hover:border-cosmic-violet/50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method selector */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Prediction Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'chinese', label: 'Chinese' },
                      { value: 'western', label: 'Western' },
                      { value: 'combined', label: 'Combined' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setMethod(option.value as PredictionMethod)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          method === option.value
                            ? 'border-cosmic-violet bg-cosmic-violet/20 text-cosmic-gold'
                            : 'border-cosmic-violet/30 hover:border-cosmic-violet/50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
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
                  disabled={(user.creditsBalance || 0) < CREDITS_REQUIRED || selectedAssetClasses.length === 0}
                >
                  Generate Prediction ({CREDITS_REQUIRED} Credits)
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
                <li>• Overall market energy score for {year}</li>
                <li>• Rankings for each asset class (1-10 score)</li>
                <li>• Favorable and challenging periods</li>
                <li>• Key recommendations for each asset class</li>
                <li>• Element harmony analysis</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="glass" padding="md">
            <CardContent>
              <h3 className="font-semibold text-cosmic-violet mb-2">Processing Time:</h3>
              <p className="text-sm text-cosmic-silver/80">
                Your prediction will be generated in 5-10 seconds. We analyze planetary positions,
                element interactions, and historical patterns to provide comprehensive insights.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
