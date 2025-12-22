'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { FeedbackStats, PredictionFeedback, FeedbackFilters } from '@/types/admin';
import FeedbackStatsComponent from '@/components/feedback/FeedbackStats';
import FeedbackCard from '@/components/feedback/FeedbackCard';
import BarChart from '@/components/admin/charts/BarChart';
import LineChart from '@/components/admin/charts/LineChart';
import FilterBar, { Filter } from '@/components/admin/FilterBar';

export default function FeedbackPage() {
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [feedbackList, setFeedbackList] = useState<PredictionFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FeedbackFilters>({});

  useEffect(() => {
    loadFeedback();
  }, [filters]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const [stats, list] = await Promise.all([
        apiClient.getFeedbackStats(filters),
        apiClient.getAllFeedback(filters),
      ]);
      setFeedbackStats(stats);
      setFeedbackList(list);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterId: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterId]: value === 'all' ? undefined : value === 'true' ? true : value === 'false' ? false : value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const filterConfigs: Filter[] = [
    {
      id: 'rating',
      label: 'Rating',
      options: [
        { label: '5 Stars', value: '5' },
        { label: '4 Stars', value: '4' },
        { label: '3 Stars', value: '3' },
        { label: '2 Stars', value: '2' },
        { label: '1 Star', value: '1' },
      ],
      value: filters.rating?.toString(),
    },
    {
      id: 'wasHelpful',
      label: 'Helpful',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
      value: filters.wasHelpful !== undefined ? String(filters.wasHelpful) : undefined,
    },
    {
      id: 'cameTrue',
      label: 'Came True',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
      value: filters.cameTrue !== undefined ? String(filters.cameTrue) : undefined,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (!feedbackStats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Failed to load feedback</p>
      </div>
    );
  }

  // Prepare chart data
  const ratingsDistributionData = Object.entries(feedbackStats.ratingsDistribution).map(
    ([stars, count]) => ({
      name: `${stars}★`,
      value: count,
    })
  );

  const feedbackByTypeData = Object.entries(feedbackStats.byPredictionType).map(
    ([type, data]) => ({
      name: type,
      avgRating: data.avgRating,
      accuracy: data.accuracyPercentage,
    })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Feedback</h1>
        <p className="text-gray-400">Analyze user satisfaction and prediction accuracy</p>
      </div>

      {/* Stats Overview */}
      <FeedbackStatsComponent
        avgRating={feedbackStats.avgRating}
        totalCount={feedbackStats.totalFeedback}
        helpfulPercentage={feedbackStats.helpfulPercentage}
        accuracyPercentage={feedbackStats.accuracyPercentage}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ratings Distribution */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Ratings Distribution
          </h3>
          <BarChart
            data={ratingsDistributionData}
            dataKey="value"
            xAxisKey="name"
            name="Count"
            color="#F59E0B"
            height={300}
          />
        </div>

        {/* Feedback Over Time */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Feedback Over Time
          </h3>
          <LineChart
            data={feedbackStats.timeline}
            lines={[
              { dataKey: 'avgRating', color: '#F59E0B', name: 'Avg Rating' },
            ]}
            xAxisKey="date"
            height={300}
          />
        </div>
      </div>

      {/* Feedback by Prediction Type */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Feedback by Prediction Type
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-800">
                <th className="pb-3 text-gray-400 font-medium">Type</th>
                <th className="pb-3 text-gray-400 font-medium">Count</th>
                <th className="pb-3 text-gray-400 font-medium">Avg Rating</th>
                <th className="pb-3 text-gray-400 font-medium">Helpful %</th>
                <th className="pb-3 text-gray-400 font-medium">Accuracy %</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(feedbackStats.byPredictionType).map(([type, data]) => (
                <tr key={type} className="border-b border-gray-800/50">
                  <td className="py-3 text-white font-medium">{type}</td>
                  <td className="py-3 text-gray-400">{data.count}</td>
                  <td className="py-3 text-yellow-400">
                    {data.avgRating.toFixed(2)} ⭐
                  </td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-800 rounded-full h-2 max-w-24">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${data.helpfulPercentage}%` }}
                        />
                      </div>
                      <span className="text-green-400 text-sm">
                        {data.helpfulPercentage.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-800 rounded-full h-2 max-w-24">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${data.accuracyPercentage}%` }}
                        />
                      </div>
                      <span className="text-blue-400 text-sm">
                        {data.accuracyPercentage.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accuracy by Type Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Accuracy by Prediction Type
        </h3>
        <BarChart
          data={feedbackByTypeData}
          dataKey="accuracy"
          xAxisKey="name"
          name="Accuracy %"
          color="#06B6D4"
          height={300}
        />
      </div>

      {/* Filters */}
      <FilterBar
        filters={filterConfigs}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearFilters}
      />

      {/* Recent Feedback */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Recent Feedback ({feedbackList.length})
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {feedbackList.length > 0 ? (
            feedbackList.map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <p className="text-gray-400">No feedback found with the current filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
