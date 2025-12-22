'use client';

import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface MetricCardProps {
  title: string;
  value: string | number;
  growth?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export default function MetricCard({
  title,
  value,
  growth,
  icon,
  trend,
  className = '',
}: MetricCardProps) {
  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return 'text-gray-400';
    return trend === 'up' ? 'text-green-400' : 'text-red-400';
  };

  const getTrendBg = () => {
    if (!trend || trend === 'neutral') return 'bg-gray-500/10';
    return trend === 'up' ? 'bg-green-500/10' : 'bg-red-500/10';
  };

  return (
    <div
      className={`bg-gray-900 border border-gray-800 rounded-xl p-6 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>

          {growth !== undefined && (
            <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
              <span className={`${getTrendBg()} px-2 py-1 rounded-full flex items-center space-x-1`}>
                {trend === 'up' && <ArrowUpIcon className="w-3 h-3" />}
                {trend === 'down' && <ArrowDownIcon className="w-3 h-3" />}
                <span>{Math.abs(growth)}%</span>
              </span>
              <span className="text-gray-500 text-xs">this week</span>
            </div>
          )}
        </div>

        {icon && (
          <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
