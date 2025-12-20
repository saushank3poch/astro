'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CompatibilityGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function CompatibilityGauge({ score, size = 'lg', showLabel = true }: CompatibilityGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getSize = () => {
    switch (size) {
      case 'sm':
        return { width: 120, strokeWidth: 8, fontSize: 24 };
      case 'md':
        return { width: 180, strokeWidth: 12, fontSize: 36 };
      case 'lg':
        return { width: 240, strokeWidth: 16, fontSize: 48 };
    }
  };

  const getColor = (score: number) => {
    if (score >= 7) return { stroke: 'rgb(34, 197, 94)', text: 'text-green-400' };
    if (score >= 4) return { stroke: 'rgb(234, 179, 8)', text: 'text-yellow-400' };
    return { stroke: 'rgb(239, 68, 68)', text: 'text-red-400' };
  };

  const { width, strokeWidth, fontSize } = getSize();
  const { stroke, text } = getColor(score);
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 10) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        {/* Background Circle */}
        <svg width={width} height={width} className="transform -rotate-90">
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke="rgba(139, 92, 246, 0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Circle */}
          <motion.circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke={stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>

        {/* Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`font-bold ${text}`}
            style={{ fontSize }}
          >
            {animatedScore.toFixed(1)}
          </motion.div>
          <div className="text-xs text-cosmic-silver/50 mt-1">/ 10</div>
        </div>
      </div>

      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center"
        >
          <div className="text-sm text-cosmic-silver/70">Compatibility Score</div>
          <div className={`text-lg font-semibold ${text}`}>
            {score >= 7 ? 'Highly Compatible' : score >= 4 ? 'Moderately Compatible' : 'Low Compatibility'}
          </div>
        </motion.div>
      )}
    </div>
  );
}
