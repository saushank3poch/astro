'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

export interface FilterOption {
  label: string;
  value: string;
}

export interface Filter {
  id: string;
  label: string;
  options: FilterOption[];
  value?: string;
}

interface FilterBarProps {
  filters: Filter[];
  onFilterChange: (filterId: string, value: string) => void;
  onClearAll: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export default function FilterBar({
  filters,
  onFilterChange,
  onClearAll,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
}: FilterBarProps) {
  const activeFiltersCount = filters.filter((f) => f.value && f.value !== 'all').length;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex flex-wrap items-center gap-4">
        {onSearchChange && (
          <div className="flex-1 min-w-64">
            <input
              type="text"
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        )}

        {filters.map((filter) => (
          <div key={filter.id} className="flex items-center space-x-2">
            <label className="text-sm text-gray-400">{filter.label}:</label>
            <select
              value={filter.value || 'all'}
              onChange={(e) => onFilterChange(filter.id, e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="all">All</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {activeFiltersCount > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center space-x-1 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm"
          >
            <XMarkIcon className="w-4 h-4" />
            <span>Clear All ({activeFiltersCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}
