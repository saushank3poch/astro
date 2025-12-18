'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input } from '@/components/ui';
import { ElementIndicator, ZodiacSign } from '@/components/astro';
import type { Asset, AssetType, ChineseElement } from '@/types';

export default function AssetsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<AssetType | 'all'>('all');
  const [filterElement, setFilterElement] = useState<ChineseElement | 'all'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchAssets();
  }, [isAuthenticated, router]);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getAssets({ limit: 100 });
      setAssets(response.data);
    } catch (err: any) {
      console.error('Error fetching assets:', err);
      setError(err.response?.data?.error?.message || 'Failed to load assets');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      searchQuery === '' ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || asset.assetType === filterType;
    const matchesElement =
      filterElement === 'all' || asset.primaryElement === filterElement;

    return matchesSearch && matchesType && matchesElement;
  });

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">Loading assets...</div>
          <div className="animate-spin text-4xl">✨</div>
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
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Asset Birth Charts</h1>
              <p className="text-cosmic-silver/70">
                Explore the astrological profiles of crypto and stocks
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card variant="glass" padding="lg">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cosmic-silver/50" size={20} />
                <Input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as AssetType | 'all')}
                className="px-4 py-2 rounded-lg bg-cosmic-deep border border-cosmic-violet/30 text-cosmic-white focus:outline-none focus:ring-2 focus:ring-cosmic-violet"
              >
                <option value="all">All Types</option>
                <option value="crypto">Crypto</option>
                <option value="stock">Stocks</option>
                <option value="commodity">Commodities</option>
              </select>

              {/* Element Filter */}
              <select
                value={filterElement}
                onChange={(e) => setFilterElement(e.target.value as ChineseElement | 'all')}
                className="px-4 py-2 rounded-lg bg-cosmic-deep border border-cosmic-violet/30 text-cosmic-white focus:outline-none focus:ring-2 focus:ring-cosmic-violet"
              >
                <option value="all">All Elements</option>
                <option value="metal">Metal</option>
                <option value="wood">Wood</option>
                <option value="water">Water</option>
                <option value="fire">Fire</option>
                <option value="earth">Earth</option>
              </select>
            </div>
          </Card>
        </motion.div>

        {/* Results Count */}
        <div className="mb-4 text-cosmic-silver/70">
          Showing {filteredAssets.length} of {assets.length} assets
        </div>

        {/* Assets Grid */}
        {error ? (
          <Card variant="glass" padding="lg">
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold mb-4">Error Loading Assets</h2>
                <p className="text-cosmic-silver/80 mb-6">{error}</p>
                <Button variant="primary" onClick={fetchAssets}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredAssets.length === 0 ? (
          <Card variant="glass" padding="lg">
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold mb-4">No Assets Found</h2>
                <p className="text-cosmic-silver/80">Try adjusting your filters</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAssets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Link href={`/assets/${asset.symbol}`}>
                  <Card
                    variant="glass"
                    padding="lg"
                    className="hover:border-cosmic-violet/50 transition-all duration-200 cursor-pointer h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-cosmic-gold mb-1">
                          {asset.symbol}
                        </h3>
                        <p className="text-sm text-cosmic-silver/70">{asset.name}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-cosmic-violet/20 text-cosmic-violet capitalize">
                        {asset.assetType}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Primary Element */}
                      {asset.primaryElement && (
                        <div>
                          <span className="text-xs text-cosmic-silver/60 block mb-1">
                            Primary Element
                          </span>
                          <ElementIndicator element={asset.primaryElement} size="sm" />
                        </div>
                      )}

                      {/* Zodiac */}
                      {asset.sunSign && (
                        <div>
                          <span className="text-xs text-cosmic-silver/60 block mb-1">
                            Sun Sign
                          </span>
                          <ZodiacSign sign={asset.sunSign} size="sm" />
                        </div>
                      )}

                      {/* Market Cap */}
                      {asset.marketCap && (
                        <div>
                          <span className="text-xs text-cosmic-silver/60">Market Cap: </span>
                          <span className="text-sm font-medium">
                            ${(asset.marketCap / 1e9).toFixed(2)}B
                          </span>
                        </div>
                      )}

                      {/* Birth Date Confidence */}
                      {asset.birthDateConfidence && (
                        <div>
                          <span className="text-xs text-cosmic-silver/60">Data Confidence: </span>
                          <span
                            className={`text-xs font-medium capitalize ${
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

                    <div className="mt-4 pt-4 border-t border-cosmic-violet/20">
                      <Button variant="ghost" fullWidth size="sm">
                        View Birth Chart →
                      </Button>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
