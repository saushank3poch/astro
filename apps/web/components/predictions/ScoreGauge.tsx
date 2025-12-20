'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showValue?: boolean;
}

export function ScoreGauge({
  score,
  maxScore = 10,
  size = 'md',
  label,
  showValue = true,
}: ScoreGaugeProps) {
  const percentage = (score / maxScore) * 100;

  // Color based on score
  const getColor = () => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGradient = () => {
    if (percentage >= 80) return 'from-green-500 to-emerald-400';
    if (percentage >= 60) return 'from-yellow-500 to-amber-400';
    if (percentage >= 40) return 'from-orange-500 to-yellow-400';
    return 'from-red-500 to-orange-400';
  };

  const sizes = {
    sm: { width: 80, height: 80, strokeWidth: 6, fontSize: 'text-lg' },
    md: { width: 120, height: 120, strokeWidth: 8, fontSize: 'text-2xl' },
    lg: { width: 160, height: 160, strokeWidth: 10, fontSize: 'text-4xl' },
  };

  const { width, height, strokeWidth, fontSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width, height }}>
        <svg width={width} height={height} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-cosmic-deep"
          />

          {/* Progress circle */}
          <motion.circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={getGradient().split(' ')[0].replace('from-', 'text-')} stopColor="currentColor" />
              <stop offset="100%" className={getGradient().split(' ')[1].replace('to-', 'text-')} stopColor="currentColor" />
            </linearGradient>
          </defs>
        </svg>

        {/* Score text */}
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className={`font-bold ${fontSize} ${getColor()}`}
            >
              {score.toFixed(1)}
            </motion.div>
          </div>
        )}
      </div>

      {label && (
        <div className="text-sm text-cosmic-silver/70 text-center">
          {label}
        </div>
      )}
    </div>
  );
}
