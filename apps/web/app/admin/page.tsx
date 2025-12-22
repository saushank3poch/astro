'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { OverviewStats } from '@/types/admin';
import MetricCard from '@/components/admin/charts/MetricCard';
import LineChart from '@/components/admin/charts/LineChart';
import PieChart from '@/components/admin/charts/PieChart';
import {
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await apiClient.getAdminOverview();
      setStats(data);
    } catch (error) {
      console.error('Failed to load overview stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading overview...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Failed to load stats</p>
      </div>
    );
  }

  // Prepare chart data
  const predictionTypeData = Object.entries(stats.predictionsByType).map(
    ([type, count]) => ({
      name: type,
      value: count,
    })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
        <p className="text-gray-400">System-wide metrics and analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          growth={stats.userGrowth}
          trend={stats.userGrowth > 0 ? 'up' : stats.userGrowth < 0 ? 'down' : 'neutral'}
          icon={<UserGroupIcon className="w-6 h-6" />}
        />

        <MetricCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          icon={<ChartBarIcon className="w-6 h-6" />}
        />

        <MetricCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          growth={stats.revenueGrowth}
          trend={stats.revenueGrowth > 0 ? 'up' : stats.revenueGrowth < 0 ? 'down' : 'neutral'}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
        />

        <MetricCard
          title="AI Costs"
          value={`$${stats.aiCosts.toFixed(2)}`}
          growth={((stats.aiCosts / stats.totalRevenue) * 100)}
          trend="neutral"
          icon={<CpuChipIcon className="w-6 h-6" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictions by Type */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Predictions by Type
          </h3>
          <PieChart
            data={predictionTypeData}
            dataKey="value"
            nameKey="name"
            height={300}
          />
        </div>

        {/* Revenue Stats */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Predictions</span>
                <span className="text-white font-semibold">
                  {stats.totalPredictions.toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Profit (Revenue - AI Costs)</span>
                <span className="text-green-400 font-semibold">
                  ${stats.profit.toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">AI Cost %</span>
                <span className="text-purple-400 font-semibold">
                  {((stats.aiCosts / stats.totalRevenue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min((stats.aiCosts / stats.totalRevenue) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Predictions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Predictions
          </h3>
          <div className="space-y-3">
            {stats.recentPredictions.map((pred) => (
              <div
                key={pred.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{pred.type}</p>
                  <p className="text-gray-400 text-xs">
                    {pred.username || pred.userId.substring(0, 8)}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      pred.status === 'completed'
                        ? 'bg-green-500/10 text-green-400'
                        : pred.status === 'failed'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}
                  >
                    {pred.status}
                  </span>
                  <p className="text-gray-500 text-xs mt-1">
                    {format(new Date(pred.createdAt), 'MMM dd, HH:mm')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Errors */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Errors</h3>
          <div className="space-y-3">
            {stats.recentErrors.length > 0 ? (
              stats.recentErrors.map((error) => (
                <div
                  key={error.id}
                  className="flex items-start justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">
                      {error.errorType}
                    </p>
                    <p className="text-gray-400 text-xs line-clamp-1">
                      {error.message}
                    </p>
                  </div>
                  <div className="ml-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        error.severity === 'critical'
                          ? 'bg-red-500/10 text-red-400'
                          : error.severity === 'high'
                          ? 'bg-orange-500/10 text-orange-400'
                          : error.severity === 'medium'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {error.severity}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No recent errors</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Users */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-800">
                <th className="pb-3 text-gray-400 font-medium">User</th>
                <th className="pb-3 text-gray-400 font-medium">Predictions</th>
                <th className="pb-3 text-gray-400 font-medium">Total Spent</th>
                <th className="pb-3 text-gray-400 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.topUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-800/50">
                  <td className="py-3 text-white">
                    {user.username || user.email || user.id.substring(0, 8)}
                  </td>
                  <td className="py-3 text-gray-400">
                    {user.predictionCount}
                  </td>
                  <td className="py-3 text-green-400">
                    ${user.totalSpent.toFixed(2)}
                  </td>
                  <td className="py-3 text-gray-400">
                    {format(new Date(user.joinedAt), 'MMM dd, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
