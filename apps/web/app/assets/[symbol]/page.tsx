'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import {
  ChineseZodiac,
  ElementIndicator,
  ZodiacSign,
  PlanetaryPositions,
  BirthChartWheel,
  ElementsChart,
} from '@/components/astro';
import type { Asset, BirthChart } from '@/types';

export default function AssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const symbol = params.symbol as string;
  const { user, isAuthenticated } = useAuthStore();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [birthChart, setBirthChart] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchAssetData();
  }, [isAuthenticated, symbol, router]);

  const fetchAssetData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // For now, we'll search for the asset by symbol
      const response = await apiClient.searchAssets(symbol, 1);
      if (response.results.length > 0) {
        const foundAsset = response.results[0];
        setAsset(foundAsset);

        // Fetch birth chart if available
        // Note: This endpoint might need to be added to the API
        // For now, we'll create a mock structure
        if (foundAsset.birthDate) {
          setBirthChart({
            assetId: foundAsset.id,
            chinese: foundAsset.chineseZodiac ? {
              zodiacAnimal: foundAsset.chineseZodiac,
              element: foundAsset.primaryElement,
              secondaryElement: foundAsset.secondaryElement,
            } : null,
            western: foundAsset.sunSign ? {
              sunSign: foundAsset.sunSign,
              dominantPlanet: foundAsset.dominantPlanet,
            } : null,
          });
        }
      } else {
        setError('Asset not found');
      }
    } catch (err: any) {
      console.error('Error fetching asset:', err);
      setError(err.response?.data?.error?.message || 'Failed to load asset');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">Loading asset profile...</div>
          <div className="animate-spin text-4xl">✨</div>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto py-8">
          <Card variant="glass" padding="lg">
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold mb-4">Asset Not Found</h2>
                <p className="text-cosmic-silver/80 mb-6">{error || 'The requested asset could not be found'}</p>
                <Link href="/assets">
                  <Button variant="primary">Back to Assets</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href="/assets">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} className="mr-2" />
                Back to Assets
              </Button>
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">{asset.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-2xl text-cosmic-gold">{asset.symbol}</span>
                <span className="text-sm px-3 py-1 rounded-full bg-cosmic-violet/20 text-cosmic-violet capitalize">
                  {asset.assetType}
                </span>
              </div>
            </div>
            {user && (
              <Link href={`/compatibility/${asset.symbol}`}>
                <Button variant="primary">
                  <TrendingUp size={20} className="mr-2" />
                  Check Compatibility
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Asset Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle>Birth Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {asset.birthDate && (
                  <div>
                    <span className="text-cosmic-silver/70">Birth Date: </span>
                    <span className="font-medium">{new Date(asset.birthDate).toLocaleDateString()}</span>
                  </div>
                )}
                {asset.birthLocation && (
                  <div>
                    <span className="text-cosmic-silver/70">Location: </span>
                    <span className="font-medium">
                      {asset.birthLocation.city}, {asset.birthLocation.country}
                    </span>
                  </div>
                )}
                {asset.birthDateSource && (
                  <div>
                    <span className="text-cosmic-silver/70">Source: </span>
                    <span className="font-medium">{asset.birthDateSource}</span>
                  </div>
                )}
                {asset.birthDateConfidence && (
                  <div>
                    <span className="text-cosmic-silver/70">Confidence: </span>
                    <span
                      className={`font-medium capitalize ${
                        asset.birthDateConfidence === 'high'
                          ? 'text-green-400'
                          : asset.birthDateConfidence === 'medium'
                          ? 'text-yellow-400'
                          : 'text-orange-400'
                      }`}
                    >
                      {asset.birthDateConfidence}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {asset.primaryElement && (
            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle>Primary Element</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <ElementIndicator element={asset.primaryElement} size="lg" />
                  <p className="text-sm text-cosmic-silver/70 mt-4">
                    This element represents the core energy of {asset.symbol}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {asset.marketCap && (
            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle>Market Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-cosmic-silver/70">Market Cap: </span>
                    <span className="font-medium text-cosmic-gold">
                      ${(asset.marketCap / 1e9).toFixed(2)}B
                    </span>
                  </div>
                  {asset.currentPrice && (
                    <div>
                      <span className="text-cosmic-silver/70">Price: </span>
                      <span className="font-medium">${asset.currentPrice.toFixed(2)}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-cosmic-silver/70">Status: </span>
                    <span className={`font-medium ${asset.isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {asset.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Chinese Astrology */}
        {birthChart?.chinese && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-4 text-cosmic-gold">Chinese Astrology</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {birthChart.chinese.zodiacAnimal && (
                <Card variant="glass" padding="lg">
                  <CardContent>
                    <ChineseZodiac
                      animal={birthChart.chinese.zodiacAnimal}
                      showDescription
                    />
                  </CardContent>
                </Card>
              )}

              <Card variant="glass" padding="lg">
                <CardHeader>
                  <CardTitle>Elements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {birthChart.chinese.element && (
                      <div>
                        <span className="text-sm text-cosmic-silver/70 block mb-2">Primary Element</span>
                        <ElementIndicator element={birthChart.chinese.element} size="lg" />
                      </div>
                    )}
                    {birthChart.chinese.secondaryElement && (
                      <div>
                        <span className="text-sm text-cosmic-silver/70 block mb-2">Secondary Element</span>
                        <ElementIndicator element={birthChart.chinese.secondaryElement} size="lg" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Western Astrology */}
        {birthChart?.western && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-cosmic-violet">Western Astrology</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {birthChart.western.sunSign && (
                <Card variant="glass" padding="lg">
                  <CardHeader>
                    <CardTitle>Sun Sign</CardTitle>
                    <CardDescription>Core identity of {asset.symbol}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <ZodiacSign sign={birthChart.western.sunSign} size="lg" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {birthChart.western.dominantPlanet && (
                <Card variant="glass" padding="lg">
                  <CardHeader>
                    <CardTitle>Dominant Planet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cosmic-gold capitalize">
                        {birthChart.western.dominantPlanet}
                      </div>
                      <p className="text-sm text-cosmic-silver/70 mt-2">
                        Primary planetary influence on {asset.symbol}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {/* Why This Element */}
        {asset.primaryElement && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle>Why {asset.symbol} is {asset.primaryElement}?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-cosmic-silver/80">
                  The {asset.primaryElement} element was determined based on {asset.symbol}'s birth date
                  {asset.birthLocation && `, location (${asset.birthLocation.city})`}, and the cosmic
                  alignments at the time of its inception. This element influences its market behavior,
                  compatibility with investors, and optimal trading periods.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
