'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { AICostStats, DateRangePreset } from '@/types/admin';
import MetricCard from '@/components/admin/charts/MetricCard';
import LineChart from '@/components/admin/charts/LineChart';
import PieChart from '@/components/admin/charts/PieChart';
import DateRangePicker from '@/components/admin/DateRangePicker';
import { format, subDays } from 'date-fns';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function AICostsPage() {
  const [stats, setStats] = useState<AICostStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAICosts(dateRange.start, dateRange.end);
      setStats(data);
    } catch (error) {
      console.error('Failed to load AI costs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (
    startDate: string,
    endDate: string,
    preset: DateRangePreset
  ) => {
    setDateRange({ start: startDate, end: endDate });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading AI costs...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Failed to load AI costs</p>
      </div>
    );
  }

  // Prepare chart data
  const costByTypeData = Object.entries(stats.byPredictionType).map(
    ([type, data]) => ({
      name: type,
      value: data.cost,
    })
  );

  const costByModelData = Object.entries(stats.byModel).map(([model, cost]) => ({
    name: model,
    value: cost,
  }));

  const budgetPercentage = (stats.budget.currentSpend / stats.budget.monthlyBudget) * 100;
  const isBudgetWarning = budgetPercentage > 80;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">AI Costs</h1>
        <p className="text-gray-400">Track and optimize AI spending</p>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker onRangeChange={handleDateRangeChange} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Cost"
          value={`$${stats.totalCost.toFixed(2)}`}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
        />

        <MetricCard
          title="Total Tokens"
          value={stats.totalTokens.toLocaleString()}
          icon={<ChartBarIcon className="w-6 h-6" />}
        />

        <MetricCard
          title="Budget Status"
          value={`${budgetPercentage.toFixed(1)}%`}
          growth={budgetPercentage}
          trend={isBudgetWarning ? 'down' : 'up'}
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
        />
      </div>

      {/* Budget Tracker */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Monthly Budget Tracker</h3>
          <span className="text-sm text-gray-400">
            {stats.budget.daysRemaining} days remaining
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">
              ${stats.budget.currentSpend.toFixed(2)} / ${stats.budget.monthlyBudget.toFixed(2)}
            </span>
            <span className={`font-semibold ${isBudgetWarning ? 'text-red-400' : 'text-green-400'}`}>
              ${(stats.budget.monthlyBudget - stats.budget.currentSpend).toFixed(2)} left
            </span>
          </div>

          <div className="w-full bg-gray-800 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                isBudgetWarning ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            />
          </div>

          {isBudgetWarning && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="text-sm">Warning: Budget usage is over 80%</span>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Over Time */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cost Over Time</h3>
          <LineChart
            data={stats.timeline}
            lines={[
              { dataKey: 'cost', color: '#8B5CF6', name: 'Cost ($)' },
            ]}
            xAxisKey="date"
            height={300}
          />
        </div>

        {/* Cost by Model */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cost by Model</h3>
          <PieChart
            data={costByModelData}
            dataKey="value"
            nameKey="name"
            height={300}
          />
        </div>
      </div>

      {/* Cost by Prediction Type */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Cost by Prediction Type
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-800">
                <th className="pb-3 text-gray-400 font-medium">Type</th>
                <th className="pb-3 text-gray-400 font-medium">Count</th>
                <th className="pb-3 text-gray-400 font-medium">Tokens</th>
                <th className="pb-3 text-gray-400 font-medium">Cost</th>
                <th className="pb-3 text-gray-400 font-medium">Avg Cost/Prediction</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.byPredictionType).map(([type, data]) => (
                <tr key={type} className="border-b border-gray-800/50">
                  <td className="py-3 text-white font-medium">{type}</td>
                  <td className="py-3 text-gray-400">{data.count}</td>
                  <td className="py-3 text-gray-400">
                    {data.tokens.toLocaleString()}
                  </td>
                  <td className="py-3 text-green-400">${data.cost.toFixed(4)}</td>
                  <td className="py-3 text-purple-400">
                    ${(data.cost / data.count).toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Expensive Predictions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Most Expensive Predictions
        </h3>
        <div className="space-y-3">
          {stats.topExpensivePredictions.map((pred) => (
            <div
              key={pred.id}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
            >
              <div className="flex-1">
                <p className="text-white font-medium">{pred.type}</p>
                <p className="text-gray-400 text-sm">
                  {pred.model} • {pred.tokens.toLocaleString()} tokens
                </p>
              </div>
              <div className="text-right">
                <p className="text-red-400 font-semibold text-lg">
                  ${pred.cost.toFixed(4)}
                </p>
                <p className="text-gray-500 text-xs">
                  {format(new Date(pred.createdAt), 'MMM dd, HH:mm')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
