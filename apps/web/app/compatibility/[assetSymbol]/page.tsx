'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { ElementIndicator, ZodiacSign } from '@/components/astro';
import type { CompatibilityResult, Asset } from '@/types';

export default function CompatibilityPage() {
  const router = useRouter();
  const params = useParams();
  const assetSymbol = params.assetSymbol as string;
  const { user, isAuthenticated } = useAuthStore();
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    fetchCompatibility();
  }, [isAuthenticated, user, assetSymbol, router]);

  const fetchCompatibility = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Search for the asset first
      const assetResponse = await apiClient.searchAssets(assetSymbol, 1);
      if (assetResponse.results.length === 0) {
        setError('Asset not found');
        return;
      }

      const foundAsset = assetResponse.results[0];
      setAsset(foundAsset);

      // Fetch compatibility
      const compatResult = await apiClient.getCompatibility(user.id, foundAsset.id);
      setCompatibility(compatResult);
    } catch (err: any) {
      console.error('Error fetching compatibility:', err);
      setError(err.response?.data?.error?.message || 'Failed to calculate compatibility');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRecommendationColor = (level: string) => {
    switch (level) {
      case 'highly_favorable':
        return 'text-green-400';
      case 'favorable':
        return 'text-yellow-400';
      case 'neutral':
        return 'text-cosmic-silver';
      case 'unfavorable':
        return 'text-orange-400';
      case 'avoid':
        return 'text-red-400';
      default:
        return 'text-cosmic-silver';
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">Calculating cosmic compatibility...</div>
          <div className="animate-spin text-4xl">✨</div>
        </div>
      </div>
    );
  }

  if (error || !compatibility || !asset) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto py-8">
          <Card variant="glass" padding="lg">
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold mb-4">Compatibility Unavailable</h2>
                <p className="text-cosmic-silver/80 mb-6">
                  {error || 'Could not calculate compatibility for this asset'}
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/assets">
                    <Button variant="primary">Browse Assets</Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline">View Profile</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/assets/${asset.symbol}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} className="mr-2" />
                Back to {asset.symbol}
              </Button>
            </Link>
          </div>

          <h1 className="text-4xl font-bold mb-2">Compatibility Analysis</h1>
          <p className="text-cosmic-silver/70">
            Your cosmic alignment with {asset.name} ({asset.symbol})
          </p>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card variant="glass" padding="lg">
            <CardContent>
              <div className="text-center">
                <div className={`text-7xl font-bold mb-4 ${getScoreColor(compatibility.compatibilityScore)}`}>
                  {compatibility.compatibilityScore.toFixed(1)}
                  <span className="text-2xl text-cosmic-silver/50">/10</span>
                </div>
                <div className="text-xl text-cosmic-silver/80 mb-2">Overall Compatibility Score</div>
                <div
                  className={`text-lg font-semibold capitalize ${getRecommendationColor(
                    compatibility.recommendationLevel
                  )}`}
                >
                  {compatibility.recommendationLevel.replace('_', ' ')}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                Element Harmony
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(compatibility.elementCompatibilityScore)}`}>
                  {compatibility.elementCompatibilityScore.toFixed(1)}
                </div>
                <div className="text-sm text-cosmic-silver/70 mt-2">
                  Based on Five Elements compatibility
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🌟</span>
                Planetary Alignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(compatibility.planetaryCompatibilityScore)}`}>
                  {compatibility.planetaryCompatibilityScore.toFixed(1)}
                </div>
                <div className="text-sm text-cosmic-silver/70 mt-2">
                  Based on planetary positions
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⏰</span>
                Timing Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(compatibility.timingCompatibilityScore)}`}>
                  {compatibility.timingCompatibilityScore.toFixed(1)}
                </div>
                <div className="text-sm text-cosmic-silver/70 mt-2">
                  Current market timing compatibility
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="text-green-400" size={24} />
                Why This Is Good For You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-cosmic-silver/80">{compatibility.whyGoodForUser}</p>
            </CardContent>
          </Card>

          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-cosmic-violet" size={24} />
                Investment Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-cosmic-silver/80">{compatibility.tips}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reasoning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle>Astrological Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-cosmic-silver/80 whitespace-pre-line">{compatibility.reasoning}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Best Entry Periods */}
        {compatibility.bestEntryPeriods && compatibility.bestEntryPeriods.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📅</span>
                  Best Entry Periods
                </CardTitle>
                <CardDescription>Favorable times to consider entering this position</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {compatibility.bestEntryPeriods.map((period, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-cosmic-deep/50 border border-cosmic-violet/20"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-cosmic-gold mb-1">
                          {new Date(period.start).toLocaleDateString()} -{' '}
                          {new Date(period.end).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-cosmic-silver/70">{period.reason}</div>
                      </div>
                      <div className={`text-2xl font-bold ml-4 ${getScoreColor(period.score)}`}>
                        {period.score.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Element Harmony Details */}
        {asset.primaryElement && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle>Element Harmony</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-sm text-cosmic-silver/70 mb-2">Your Element</div>
                    {user.birthDate ? (
                      <div className="text-lg font-medium">To be calculated</div>
                    ) : (
                      <div className="text-sm text-cosmic-silver/60">Add birth info</div>
                    )}
                  </div>
                  <div className="text-3xl text-cosmic-violet">⇄</div>
                  <div className="text-center">
                    <div className="text-sm text-cosmic-silver/70 mb-2">{asset.symbol} Element</div>
                    <ElementIndicator element={asset.primaryElement} size="md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Calculation Info */}
        <div className="mt-8 text-center text-sm text-cosmic-silver/50">
          Analysis calculated on {new Date(compatibility.calculatedAt).toLocaleString()}
          {compatibility.expiresAt && (
            <> • Valid until {new Date(compatibility.expiresAt).toLocaleString()}</>
          )}
        </div>
      </div>
    </div>
  );
}
