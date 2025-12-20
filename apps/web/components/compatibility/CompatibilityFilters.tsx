'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import type { CompatibilityFilters } from '@/types/compatibility';

interface CompatibilityFiltersProps {
  filters: CompatibilityFilters;
  onFiltersChange: (filters: CompatibilityFilters) => void;
  resultCount?: number;
}

export function CompatibilityFiltersComponent({
  filters,
  onFiltersChange,
  resultCount,
}: CompatibilityFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const assetTypes = [
    { value: 'all', label: 'All Assets' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'stock', label: 'Stocks' },
    { value: 'commodity', label: 'Commodities' },
  ];

  const sortOptions = [
    { value: 'score', label: 'Compatibility Score' },
    { value: 'alphabetical', label: 'Alphabetical' },
  ];

  const handleAssetTypeChange = (type: string) => {
    onFiltersChange({ ...filters, assetType: type as any });
  };

  const handleSortChange = (sort: string) => {
    onFiltersChange({ ...filters, sortBy: sort as any });
  };

  const handleSearchChange = (query: string) => {
    onFiltersChange({ ...filters, searchQuery: query });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      assetType: 'all',
      sortBy: 'score',
      searchQuery: '',
      minScore: undefined,
    });
  };

  const hasActiveFilters =
    filters.assetType !== 'all' || filters.searchQuery || filters.minScore;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-cosmic-silver/50"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search assets..."
            value={filters.searchQuery || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cosmic-silver/50 hover:text-cosmic-silver transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal size={18} />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 w-2 h-2 bg-cosmic-violet rounded-full" />
          )}
        </Button>
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-lg bg-cosmic-deep/30 border border-cosmic-violet/20 space-y-4">
              {/* Asset Type Filter */}
              <div>
                <label className="text-sm font-medium text-cosmic-silver/80 mb-2 block">
                  Asset Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {assetTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleAssetTypeChange(type.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.assetType === type.value
                          ? 'bg-cosmic-violet text-white'
                          : 'bg-cosmic-deep/50 text-cosmic-silver/70 hover:bg-cosmic-deep border border-cosmic-violet/20'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium text-cosmic-silver/80 mb-2 block">
                  Sort By
                </label>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.sortBy === option.value
                          ? 'bg-cosmic-violet text-white'
                          : 'bg-cosmic-deep/50 text-cosmic-silver/70 hover:bg-cosmic-deep border border-cosmic-violet/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="pt-2 border-t border-cosmic-violet/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Count */}
      {resultCount !== undefined && (
        <div className="text-sm text-cosmic-silver/70">
          Showing {resultCount} {resultCount === 1 ? 'asset' : 'assets'}
        </div>
      )}
    </div>
  );
}
