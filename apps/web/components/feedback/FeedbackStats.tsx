'use client';

import React from 'react';
import StarRating from './StarRating';
import {
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface FeedbackStatsProps {
  avgRating: number;
  totalCount: number;
  helpfulPercentage: number;
  accuracyPercentage: number;
  className?: string;
}

export default function FeedbackStats({
  avgRating,
  totalCount,
  helpfulPercentage,
  accuracyPercentage,
  className = '',
}: FeedbackStatsProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${className}`}>
      {/* Average Rating */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <ChartBarIcon className="w-5 h-5 text-purple-400" />
          <span className="text-sm text-gray-400">Avg Rating</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-white">
            {avgRating.toFixed(1)}
          </span>
          <StarRating rating={Math.round(avgRating)} readonly size="small" />
        </div>
      </div>

      {/* Total Feedback */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-400" />
          <span className="text-sm text-gray-400">Total Feedback</span>
        </div>
        <div className="text-2xl font-bold text-white">{totalCount}</div>
      </div>

      {/* Helpful Percentage */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircleIcon className="w-5 h-5 text-green-400" />
          <span className="text-sm text-gray-400">Helpful</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-white">
            {helpfulPercentage.toFixed(0)}%
          </span>
          <div className="flex-1 bg-gray-800 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${helpfulPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Accuracy Percentage */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircleIcon className="w-5 h-5 text-blue-400" />
          <span className="text-sm text-gray-400">Accuracy</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-white">
            {accuracyPercentage.toFixed(0)}%
          </span>
          <div className="flex-1 bg-gray-800 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${accuracyPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
