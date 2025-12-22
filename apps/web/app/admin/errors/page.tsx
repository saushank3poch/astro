'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorLog, ErrorStats, ErrorSeverity, ErrorFilters } from '@/types/admin';
import MetricCard from '@/components/admin/charts/MetricCard';
import PieChart from '@/components/admin/charts/PieChart';
import BarChart from '@/components/admin/charts/BarChart';
import ErrorCard from '@/components/admin/ErrorCard';
import FilterBar, { Filter } from '@/components/admin/FilterBar';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function ErrorsPage() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [errorStats, setErrorStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ErrorFilters>({});

  useEffect(() => {
    loadErrors();
    loadErrorStats();
  }, [filters]);

  const loadErrors = async () => {
    try {
      const data = await apiClient.getErrors(filters);
      setErrors(data);
    } catch (error) {
      console.error('Failed to load errors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadErrorStats = async () => {
    try {
      const data = await apiClient.getErrorStats();
      setErrorStats(data);
    } catch (error) {
      console.error('Failed to load error stats:', error);
    }
  };

  const handleMarkResolved = async (errorId: string) => {
    try {
      await apiClient.markErrorResolved(errorId);
      // Reload errors
      await loadErrors();
      await loadErrorStats();
    } catch (error) {
      console.error('Failed to mark error as resolved:', error);
    }
  };

  const handleFilterChange = (filterId: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterId]: value === 'all' ? undefined : value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const filterConfigs: Filter[] = [
    {
      id: 'severity',
      label: 'Severity',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
      value: filters.severity,
    },
    {
      id: 'resolved',
      label: 'Status',
      options: [
        { label: 'Unresolved', value: 'false' },
        { label: 'Resolved', value: 'true' },
      ],
      value: filters.resolved !== undefined ? String(filters.resolved) : undefined,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading errors...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const errorsByTypeData = errorStats
    ? Object.entries(errorStats.byType).map(([type, count]) => ({
        name: type,
        value: count,
      }))
    : [];

  const errorsBySeverityData = errorStats
    ? Object.entries(errorStats.bySeverity).map(([severity, count]) => ({
        name: severity,
        value: count,
      }))
    : [];

  const hasCriticalErrors = errorStats && errorStats.bySeverity.critical > 0;
  const highErrorRate = errorStats && errorStats.errorRate > 5;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Error Dashboard</h1>
        <p className="text-gray-400">Track and resolve system errors</p>
      </div>

      {/* Alerts */}
      {(hasCriticalErrors || highErrorRate) && (
        <div className="space-y-3">
          {hasCriticalErrors && (
            <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-semibold">Critical Errors Detected</p>
                <p className="text-red-300 text-sm">
                  {errorStats?.bySeverity.critical} critical error(s) require immediate attention
                </p>
              </div>
            </div>
          )}
          {highErrorRate && (
            <div className="flex items-center space-x-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 font-semibold">High Error Rate</p>
                <p className="text-yellow-300 text-sm">
                  Error rate is {errorStats?.errorRate.toFixed(2)}% (threshold: 5%)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      {errorStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Errors"
            value={errorStats.totalErrors.toLocaleString()}
            icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          />

          <MetricCard
            title="Error Rate"
            value={`${errorStats.errorRate.toFixed(2)}%`}
            trend={errorStats.errorRate > 5 ? 'down' : 'up'}
            icon={<XCircleIcon className="w-6 h-6" />}
          />

          <MetricCard
            title="Resolved"
            value={errorStats.resolvedCount.toLocaleString()}
            icon={<CheckCircleIcon className="w-6 h-6" />}
          />

          <MetricCard
            title="Unresolved"
            value={errorStats.unresolvedCount.toLocaleString()}
            icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          />
        </div>
      )}

      {/* Charts */}
      {errorStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Errors by Type */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Errors by Type</h3>
            <PieChart
              data={errorsByTypeData}
              dataKey="value"
              nameKey="name"
              height={300}
            />
          </div>

          {/* Errors by Severity */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Errors by Severity
            </h3>
            <BarChart
              data={errorsBySeverityData}
              dataKey="value"
              xAxisKey="name"
              name="Count"
              color="#EF4444"
              height={300}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <FilterBar
        filters={filterConfigs}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearFilters}
      />

      {/* Error List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Error Log ({errors.length})
        </h3>
        <div className="space-y-3">
          {errors.length > 0 ? (
            errors.map((error) => (
              <ErrorCard
                key={error.id}
                error={error}
                onMarkResolved={handleMarkResolved}
              />
            ))
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-400">No errors found with the current filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
