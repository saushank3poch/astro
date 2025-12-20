'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { ElementIndicator } from '@/components/astro';
import {
  CompatibilityCard,
  CompatibilityFiltersComponent,
  EmptyCompatibilityState,
} from '@/components/compatibility';
import type { CompatibleAsset, CompatibilityFilters } from '@/types/compatibility';
import type { ChineseElement } from '@/types';

export default function CompatibilityHubPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [compatibleAssets, setCompatibleAssets] = useState<CompatibleAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<CompatibleAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorableElements, setFavorableElements] = useState<ChineseElement[]>([]);
  const [filters, setFilters] = useState<CompatibilityFilters>({
    assetType: 'all',
    sortBy: 'score',
    searchQuery: '',
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    fetchCompatibilities();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    applyFilters();
  }, [compatibleAssets, filters]);

  const fetchCompatibilities = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch user's birth chart to get favorable elements
      try {
        const birthChart = await apiClient.getUserBirthChart(user.id);
        if (birthChart?.chinese?.favorableElements) {
          setFavorableElements(birthChart.chinese.favorableElements);
        }
      } catch (error) {
        console.error('Error fetching birth chart:', error);
      }

      // Fetch all compatible assets
      const response = await apiClient.getTopCompatibleAssets(user.id, { limit: 50 });

      // Transform the data to match CompatibleAsset interface
      const transformedAssets: CompatibleAsset[] = (response.topAssets || []).map((item: any) => ({
        id: item.asset.id,
        symbol: item.asset.symbol,
        name: item.asset.name,
        assetType: item.asset.assetType,
        compatibilityScore: item.compatibilityScore,
        elementHarmony: {
          favorableMatch: item.compatibilityScore >= 6,
          elementScore: item.compatibilityScore,
          reasoning: item.reasoning || 'Element harmony calculated based on Five Elements theory',
          userElements: favorableElements,
          assetElements: item.asset.primaryElement ? [item.asset.primaryElement] : [],
          relationship: item.compatibilityScore >= 7 ? 'productive' : item.compatibilityScore >= 4 ? 'neutral' : 'controlling',
        },
        overallReasoning: item.reasoning || 'Compatibility calculated based on astrological factors',
        asset: item.asset,
      }));

      setCompatibleAssets(transformedAssets);
    } catch (error) {
      console.error('Error fetching compatibilities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...compatibleAssets];

    // Asset type filter
    if (filters.assetType && filters.assetType !== 'all') {
      filtered = filtered.filter((asset) => asset.assetType === filters.assetType);
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          asset.symbol.toLowerCase().includes(query) ||
          asset.name.toLowerCase().includes(query)
      );
    }

    // Min score filter
    if (filters.minScore) {
      filtered = filtered.filter((asset) => asset.compatibilityScore >= filters.minScore!);
    }

    // Sort
    if (filters.sortBy === 'score') {
      filtered.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    } else if (filters.sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }

    setFilteredAssets(filtered);
  };

  const hasProfile = user?.birthDate && user?.birthTime && user?.birthLocation;

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-6xl mb-4"
          >
            ✨
          </motion.div>
          <div className="text-xl text-cosmic-silver/80">Calculating cosmic compatibility...</div>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto py-8">
          <EmptyCompatibilityState hasProfile={false} />
        </div>
      </div>
    );
  }

  if (compatibleAssets.length === 0) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto py-8">
          <EmptyCompatibilityState hasProfile={true} />
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
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} className="mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <h1 className="text-4xl font-bold mb-2">Your Compatible Assets</h1>
          <p className="text-cosmic-silver/70">
            Assets aligned with your cosmic blueprint
          </p>
        </motion.div>

        {/* Favorable Elements Display */}
        {favorableElements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card variant="glass" padding="lg">
              <CardContent>
                <div className="flex items-center gap-4">
                  <Sparkles className="text-cosmic-gold" size={24} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-cosmic-silver/70 mb-2">
                      Your Favorable Elements
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {favorableElements.map((element, index) => (
                        <ElementIndicator key={index} element={element} size="md" />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-cosmic-silver/60">
                    Assets matching these elements may be more favorable for you
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <CompatibilityFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            resultCount={filteredAssets.length}
          />
        </motion.div>

        {/* Assets Grid */}
        {filteredAssets.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAssets.map((asset, index) => (
              <CompatibilityCard key={asset.id} asset={asset} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Card variant="glass" padding="lg">
              <CardContent>
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No assets found</h3>
                <p className="text-cosmic-silver/70 mb-6">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={() => setFilters({ assetType: 'all', sortBy: 'score', searchQuery: '' })}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
