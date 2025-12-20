'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { ChineseZodiac, ZodiacSign, ElementIndicator } from '@/components/astro';
import type { BirthChart, Asset } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [birthChart, setBirthChart] = useState<BirthChart | null>(null);
  const [topAssets, setTopAssets] = useState<any[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    if (user && user.birthDate && user.birthTime && user.birthLocation) {
      fetchBirthChart();
      fetchTopCompatibleAssets();
    }
  }, [isAuthenticated, user, router]);

  const fetchBirthChart = async () => {
    if (!user) return;

    try {
      setIsLoadingChart(true);
      const chart = await apiClient.getUserBirthChart(user.id);
      setBirthChart(chart);
    } catch (error) {
      console.error('Error fetching birth chart:', error);
    } finally {
      setIsLoadingChart(false);
    }
  };

  const fetchTopCompatibleAssets = async () => {
    if (!user) return;

    try {
      setIsLoadingAssets(true);
      const response = await apiClient.getTopCompatibleAssets(user.id, { limit: 3 });
      setTopAssets(response.topAssets || []);
    } catch (error) {
      console.error('Error fetching top assets:', error);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return null;
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
            <h1 className="text-4xl font-bold mb-2">
              Welcome, {user.username || user.email || 'Cosmic Explorer'}! 🌟
            </h1>
            <p className="text-cosmic-silver/70">
              Your personalized astrological dashboard
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/settings">
              <Button variant="outline">Settings</Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cosmic-gold mb-2">
                  {user.creditsBalance || 0}
                </div>
                <div className="text-sm text-cosmic-silver/70">Credits Remaining</div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cosmic-violet mb-2">
                  {user.subscriptionTier?.toUpperCase()}
                </div>
                <div className="text-sm text-cosmic-silver/70">Subscription Tier</div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cosmic-cyan mb-2">0</div>
                <div className="text-sm text-cosmic-silver/70">Total Predictions</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Astrological Profile Card */}
        {user.birthDate && user.birthTime && user.birthLocation ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card variant="glass" padding="lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Your Astrological Profile</CardTitle>
                    <CardDescription>Your cosmic blueprint</CardDescription>
                  </div>
                  <Link href="/profile">
                    <Button variant="outline" size="sm">
                      View Full Chart
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingChart ? (
                  <div className="text-center py-8 text-cosmic-silver/70">
                    Loading your cosmic profile...
                  </div>
                ) : birthChart ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Chinese Astrology Preview */}
                    {birthChart.chinese && (
                      <div className="border-r border-cosmic-violet/20 pr-6">
                        <h4 className="text-lg font-semibold text-cosmic-gold mb-4">Chinese Astrology</h4>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-5xl">{getZodiacEmoji(birthChart.chinese.zodiacAnimal)}</div>
                          <div>
                            <div className="font-bold text-lg capitalize">{birthChart.chinese.zodiacAnimal}</div>
                            <ElementIndicator element={birthChart.chinese.element} size="sm" />
                          </div>
                        </div>
                        <div className="text-sm text-cosmic-silver/70">
                          {birthChart.chinese.personality?.slice(0, 100)}...
                        </div>
                      </div>
                    )}

                    {/* Western Astrology Preview */}
                    {birthChart.western && (
                      <div className="pl-6">
                        <h4 className="text-lg font-semibold text-cosmic-violet mb-4">Western Astrology</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-cosmic-silver/70">Sun:</span>
                            <ZodiacSign sign={birthChart.western.sunSign} size="sm" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-cosmic-silver/70">Moon:</span>
                            <ZodiacSign sign={birthChart.western.moonSign} size="sm" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-cosmic-silver/70">Rising:</span>
                            <ZodiacSign sign={birthChart.western.risingSign} size="sm" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-cosmic-silver/70">
                    <p>Unable to load birth chart</p>
                    <Link href="/profile">
                      <Button variant="outline" size="sm" className="mt-4">
                        Try Again
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>Unlock your full astrological potential</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🌟</div>
                  <p className="text-cosmic-silver/80 mb-6">
                    Add your birth date, time, and location to generate your complete birth chart
                    and discover compatible assets.
                  </p>
                  <Link href="/settings">
                    <Button variant="primary">Complete Birth Information</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Best Assets For You */}
        {user.birthDate && user.birthTime && user.birthLocation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card variant="glass" padding="lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">✨</span>
                      Best Assets For You
                    </CardTitle>
                    <CardDescription>Your top 5 compatible assets based on cosmic alignment</CardDescription>
                  </div>
                  <Link href="/compatibility">
                    <Button variant="outline" size="sm">
                      See All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAssets ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="text-5xl mb-4"
                    >
                      ✨
                    </motion.div>
                    <div className="text-cosmic-silver/70">Analyzing cosmic alignments...</div>
                  </div>
                ) : topAssets.length > 0 ? (
                  <div className="space-y-3">
                    {topAssets.slice(0, 5).map((item: any, index: number) => (
                      <motion.div
                        key={item.asset.symbol}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link href={`/compatibility/${item.asset.symbol}`}>
                          <div className="group p-4 rounded-lg bg-cosmic-deep/30 border border-cosmic-violet/20 hover:border-cosmic-violet/50 hover:bg-cosmic-deep/50 transition-all cursor-pointer">
                            <div className="flex items-center justify-between">
                              {/* Asset Info */}
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cosmic-violet/20 text-cosmic-gold font-bold">
                                  #{index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-cosmic-gold">{item.asset.symbol}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-cosmic-violet/20 text-cosmic-violet">
                                      {item.asset.assetType}
                                    </span>
                                  </div>
                                  <div className="text-sm text-cosmic-silver/70">{item.asset.name}</div>
                                </div>
                              </div>

                              {/* Element Badge */}
                              {item.asset.primaryElement && (
                                <div className="mx-4">
                                  <ElementIndicator element={item.asset.primaryElement} size="sm" />
                                </div>
                              )}

                              {/* Score */}
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className={`text-2xl font-bold ${
                                    item.compatibilityScore >= 7 ? 'text-green-400' :
                                    item.compatibilityScore >= 4 ? 'text-yellow-400' :
                                    'text-red-400'
                                  }`}>
                                    {item.compatibilityScore.toFixed(1)}
                                  </div>
                                  <div className="text-xs text-cosmic-silver/50">/ 10</div>
                                </div>
                                <div className="text-cosmic-violet group-hover:translate-x-1 transition-transform">
                                  →
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="h-1.5 bg-cosmic-deep/50 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(item.compatibilityScore / 10) * 100}%` }}
                                  transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                                  className={`h-full bg-gradient-to-r ${
                                    item.compatibilityScore >= 7 ? 'from-green-500 to-green-600' :
                                    item.compatibilityScore >= 4 ? 'from-yellow-500 to-yellow-600' :
                                    'from-red-500 to-red-600'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🔮</div>
                    <div className="text-cosmic-silver/70 mb-4">
                      No compatibility data available yet
                    </div>
                    <Link href="/compatibility">
                      <Button variant="outline" size="sm">
                        Calculate Compatibilities
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with your cosmic journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/profile">
                  <Button fullWidth variant="primary">
                    🔮 View Birth Chart
                  </Button>
                </Link>
                <Link href="/assets">
                  <Button fullWidth variant="secondary">
                    ⭐ Browse Assets
                  </Button>
                </Link>
                <Button fullWidth variant="outline" disabled>
                  📊 Polymarket Events
                </Button>
                <Button fullWidth variant="outline" disabled>
                  📈 Prediction History
                </Button>
              </div>
              <p className="text-xs text-cosmic-silver/60 text-center mt-4">
                More features coming soon!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Account information and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-cosmic-violet/20">
                  <span className="text-cosmic-silver/70">Email:</span>
                  <span className="font-medium">{user.email || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cosmic-violet/20">
                  <span className="text-cosmic-silver/70">Username:</span>
                  <span className="font-medium">{user.username || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cosmic-violet/20">
                  <span className="text-cosmic-silver/70">Primary Auth:</span>
                  <span className="font-medium capitalize">{user.primaryAuthMethod}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cosmic-violet/20">
                  <span className="text-cosmic-silver/70">Birth Date:</span>
                  <span className="font-medium">{user.birthDate || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-cosmic-silver/70">Member Since:</span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/settings">
                  <Button fullWidth variant="outline">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Helper function for Chinese zodiac emoji
function getZodiacEmoji(animal: string): string {
  const emojis: Record<string, string> = {
    rat: '🐭',
    ox: '🐂',
    tiger: '🐅',
    rabbit: '🐰',
    dragon: '🐲',
    snake: '🐍',
    horse: '🐴',
    goat: '🐐',
    monkey: '🐵',
    rooster: '🐓',
    dog: '🐕',
    pig: '🐷',
  };
  return emojis[animal] || '⭐';
}
