'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import {
  ChineseZodiac,
  BaziChart,
  ElementIndicator,
  ZodiacSign,
  PlanetaryPositions,
  BirthChartWheel,
  ElementsChart,
} from '@/components/astro';
import type { BirthChart } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [birthChart, setBirthChart] = useState<BirthChart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && (!user.birthDate || !user.birthTime || !user.birthLocation)) {
      setError('Please complete your birth information in settings to generate your birth chart.');
      setIsLoading(false);
      return;
    }

    fetchBirthChart();
  }, [isAuthenticated, user, router]);

  const fetchBirthChart = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const chart = await apiClient.getUserBirthChart(user.id);
      setBirthChart(chart);
    } catch (err: any) {
      console.error('Error fetching birth chart:', err);
      setError(err.response?.data?.error?.message || 'Failed to load birth chart');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">Loading your cosmic profile...</div>
          <div className="animate-spin text-4xl">✨</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto py-8">
          <Card variant="glass" padding="lg">
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔮</div>
                <h2 className="text-2xl font-bold mb-4">Birth Chart Not Available</h2>
                <p className="text-cosmic-silver/80 mb-6">{error}</p>
                <Link href="/settings">
                  <Button variant="primary">Complete Birth Information</Button>
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
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Astrological Profile</h1>
            <p className="text-cosmic-silver/70">
              Discover the cosmic influences shaping your destiny
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost">Edit Profile</Button>
            </Link>
          </div>
        </motion.div>

        {/* Chinese Astrology Section */}
        {birthChart?.chinese && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-4 text-cosmic-gold">Chinese Astrology</h2>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Zodiac Animal */}
              <Card variant="glass" padding="lg">
                <CardContent>
                  <ChineseZodiac
                    animal={birthChart.chinese.zodiacAnimal}
                    year={birthChart.chinese.zodiacYear}
                    showDescription
                  />
                </CardContent>
              </Card>

              {/* Element and Yin/Yang */}
              <Card variant="glass" padding="lg">
                <CardHeader>
                  <CardTitle>Primary Element</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="mb-4">
                      <ElementIndicator element={birthChart.chinese.element} size="lg" />
                    </div>
                    <div className="text-sm text-cosmic-silver/70">
                      Polarity: <span className="font-medium text-cosmic-white capitalize">{birthChart.chinese.yinYang}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lucky Info */}
              <Card variant="glass" padding="lg">
                <CardHeader>
                  <CardTitle>Lucky Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-cosmic-silver/70">Numbers: </span>
                      <span className="font-medium text-cosmic-gold">
                        {birthChart.chinese.luckyNumbers.join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-cosmic-silver/70">Colors: </span>
                      <span className="font-medium">
                        {birthChart.chinese.luckyColors.join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-cosmic-silver/70">Directions: </span>
                      <span className="font-medium">
                        {birthChart.chinese.luckyDirections.join(', ')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bazi Chart */}
            <Card variant="glass" padding="lg" className="mb-6">
              <CardHeader>
                <CardTitle>Bazi Chart (Four Pillars of Destiny)</CardTitle>
                <CardDescription>
                  The four pillars represent your cosmic blueprint based on year, month, day, and hour of birth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BaziChart bazi={birthChart.chinese.bazi} />
              </CardContent>
            </Card>

            {/* Elements Analysis */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card variant="glass" padding="lg">
                <CardHeader>
                  <CardTitle>Favorable Elements</CardTitle>
                  <CardDescription>Elements that bring you fortune and balance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {birthChart.chinese.favorableElements.map((element) => (
                      <ElementIndicator key={element} element={element} size="md" />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" padding="lg">
                <CardHeader>
                  <CardTitle>Unfavorable Elements</CardTitle>
                  <CardDescription>Elements to be mindful of</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {birthChart.chinese.unfavorableElements.map((element) => (
                      <ElementIndicator key={element} element={element} size="md" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Personality Traits */}
            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle>Personality Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-cosmic-silver/80 mb-4">{birthChart.chinese.personality}</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-cosmic-gold mb-2">Strengths</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-cosmic-silver/80">
                      {birthChart.chinese.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-cosmic-silver mb-2">Areas for Growth</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-cosmic-silver/80">
                      {birthChart.chinese.weaknesses.map((weakness, index) => (
                        <li key={index}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Western Astrology Section */}
        {birthChart?.western && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-cosmic-violet">Western Astrology</h2>

            {/* Big Three */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card variant="glass" padding="lg">
                <CardHeader>
                  <CardTitle>Sun Sign</CardTitle>
                  <CardDescription>Your core identity and ego</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <ZodiacSign sign={birthChart.western.sunSign} size="lg" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" padding="lg">
                <CardHeader>
                  <CardTitle>Moon Sign</CardTitle>
                  <CardDescription>Your emotions and inner self</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <ZodiacSign sign={birthChart.western.moonSign} size="lg" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" padding="lg">
                <CardHeader>
                  <CardTitle>Rising Sign</CardTitle>
                  <CardDescription>How others perceive you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <ZodiacSign sign={birthChart.western.risingSign} size="lg" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Birth Chart Wheel */}
            <Card variant="glass" padding="lg" className="mb-6">
              <CardHeader>
                <CardTitle>Birth Chart Wheel</CardTitle>
                <CardDescription>Visual representation of your natal chart</CardDescription>
              </CardHeader>
              <CardContent>
                <BirthChartWheel chart={birthChart.western} />
              </CardContent>
            </Card>

            {/* Planetary Positions */}
            <Card variant="glass" padding="lg" className="mb-6">
              <CardHeader>
                <CardTitle>Planetary Positions</CardTitle>
                <CardDescription>Where the planets were when you were born</CardDescription>
              </CardHeader>
              <CardContent>
                <PlanetaryPositions planets={birthChart.western.planets} />
              </CardContent>
            </Card>

            {/* Element Distribution */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card variant="glass" padding="lg">
                <CardHeader>
                  <CardTitle>Element Distribution</CardTitle>
                  <CardDescription>Balance of elements in your chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <ElementsChart elements={birthChart.western.dominantElements} />
                </CardContent>
              </Card>

              <Card variant="glass" padding="lg">
                <CardHeader>
                  <CardTitle>Chart Qualities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-cosmic-silver/70">Dominant Modality: </span>
                      <span className="font-medium text-cosmic-violet capitalize">
                        {birthChart.western.dominantModality}
                      </span>
                    </div>
                    <div>
                      <span className="text-cosmic-silver/70">Dominant Polarity: </span>
                      <span className="font-medium text-cosmic-cyan capitalize">
                        {birthChart.western.dominantPolarity}
                      </span>
                    </div>
                    {birthChart.western.chartPattern && (
                      <div>
                        <span className="text-cosmic-silver/70">Chart Pattern: </span>
                        <span className="font-medium text-cosmic-gold capitalize">
                          {birthChart.western.chartPattern}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Timestamp */}
        {birthChart && (
          <div className="mt-8 text-center text-sm text-cosmic-silver/50">
            Chart calculated on {new Date(birthChart.calculatedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
