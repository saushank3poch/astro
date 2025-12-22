'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { PerformanceStats } from '@/types/admin';
import MetricCard from '@/components/admin/charts/MetricCard';
import LineChart from '@/components/admin/charts/LineChart';
import BarChart from '@/components/admin/charts/BarChart';
import {
  BoltIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function PerformancePage() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await apiClient.getPerformanceStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load performance stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading performance stats...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Failed to load performance stats</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Performance</h1>
          <p className="text-gray-400">API performance monitoring and metrics</p>
        </div>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Requests"
          value={stats.totalRequests.toLocaleString()}
          icon={<ServerIcon className="w-6 h-6" />}
        />

        <MetricCard
          title="Avg Response Time"
          value={`${stats.avgResponseTime}ms`}
          icon={<ClockIcon className="w-6 h-6" />}
        />

        <MetricCard
          title="Error Rate"
          value={`${stats.errorRate.toFixed(2)}%`}
          trend={stats.errorRate > 5 ? 'down' : 'up'}
          icon={<ExclamationCircleIcon className="w-6 h-6" />}
        />

        <MetricCard
          title="Cache Hit Rate"
          value={`${stats.cacheHitRate.toFixed(1)}%`}
          icon={<BoltIcon className="w-6 h-6" />}
        />
      </div>

      {/* Response Time Percentiles */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Response Time Percentiles
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">p50 (Median)</p>
            <p className="text-2xl font-bold text-white">{stats.p50}ms</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">p95</p>
            <p className="text-2xl font-bold text-white">{stats.p95}ms</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">p99</p>
            <p className="text-2xl font-bold text-white">{stats.p99}ms</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Over Time */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Response Time Over Time
          </h3>
          <LineChart
            data={stats.timelineData}
            lines={[
              { dataKey: 'p50', color: '#8B5CF6', name: 'p50' },
              { dataKey: 'p95', color: '#F59E0B', name: 'p95' },
              { dataKey: 'p99', color: '#EF4444', name: 'p99' },
            ]}
            xAxisKey="timestamp"
            height={300}
          />
        </div>

        {/* Requests by Endpoint */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Requests by Endpoint (Top 10)
          </h3>
          <BarChart
            data={stats.requestsByEndpoint.slice(0, 10)}
            dataKey="requests"
            xAxisKey="endpoint"
            name="Requests"
            color="#8B5CF6"
            height={300}
            layout="horizontal"
          />
        </div>
      </div>

      {/* Endpoint Stats Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Endpoint Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-800">
                <th className="pb-3 text-gray-400 font-medium">Endpoint</th>
                <th className="pb-3 text-gray-400 font-medium">Requests</th>
                <th className="pb-3 text-gray-400 font-medium">Avg Response Time</th>
                <th className="pb-3 text-gray-400 font-medium">Error Rate</th>
              </tr>
            </thead>
            <tbody>
              {stats.requestsByEndpoint.map((endpoint, index) => (
                <tr key={index} className="border-b border-gray-800/50">
                  <td className="py-3 text-white font-mono text-sm">
                    {endpoint.endpoint}
                  </td>
                  <td className="py-3 text-gray-400">
                    {endpoint.requests.toLocaleString()}
                  </td>
                  <td className="py-3 text-purple-400">
                    {endpoint.avgResponseTime}ms
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        endpoint.errorRate > 5
                          ? 'bg-red-500/10 text-red-400'
                          : endpoint.errorRate > 1
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-green-500/10 text-green-400'
                      }`}
                    >
                      {endpoint.errorRate.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slow Requests */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Slowest Recent Requests
        </h3>
        <div className="space-y-3">
          {stats.slowRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs font-medium">
                    {req.method}
                  </span>
                  <p className="text-white font-mono text-sm">{req.endpoint}</p>
                </div>
                <p className="text-gray-400 text-xs">
                  {req.userId && `User: ${req.userId.substring(0, 8)}... • `}
                  Status: {req.statusCode}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="text-red-400 font-semibold text-lg">
                  {req.responseTime}ms
                </p>
                <p className="text-gray-500 text-xs">
                  {format(new Date(req.timestamp), 'MMM dd, HH:mm:ss')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cache Stats */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cache Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Hit Rate</p>
            <p className="text-2xl font-bold text-green-400">
              {stats.cacheStats.hitRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Miss Rate</p>
            <p className="text-2xl font-bold text-yellow-400">
              {stats.cacheStats.missRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Entries</p>
            <p className="text-2xl font-bold text-white">
              {stats.cacheStats.totalEntries.toLocaleString()}
            </p>
          </div>
        </div>

        <h4 className="text-md font-semibold text-white mb-3">Most Cached Items</h4>
        <div className="space-y-2">
          {stats.cacheStats.mostCached.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
            >
              <span className="text-white font-mono text-sm">{item.key}</span>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">
                  {item.hits.toLocaleString()} hits
                </span>
                <span className="text-gray-500 text-xs">
                  {format(new Date(item.createdAt), 'MMM dd, HH:mm')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
