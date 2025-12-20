'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui';

interface PredictionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  credits: number;
  example?: string;
  onClick: () => void;
  delay?: number;
  disabled?: boolean;
}

export function PredictionCard({
  title,
  description,
  icon,
  credits,
  example,
  onClick,
  delay = 0,
  disabled = false,
}: PredictionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      className="h-full"
    >
      <Card
        variant="glass"
        padding="lg"
        className={`h-full flex flex-col transition-all duration-300 ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:border-cosmic-violet/50 hover:shadow-glow'
        }`}
        onClick={disabled ? undefined : onClick}
      >
        <CardContent className="flex flex-col h-full">
          {/* Icon */}
          <div className="text-5xl mb-4 text-center">{icon}</div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-cosmic-gold mb-2 text-center">
            {title}
          </h3>

          {/* Description */}
          <p className="text-cosmic-silver/80 text-center mb-4 flex-grow">
            {description}
          </p>

          {/* Example */}
          {example && (
            <div className="mb-4 p-3 bg-cosmic-deep/50 rounded-lg border border-cosmic-violet/20">
              <p className="text-xs text-cosmic-silver/60 mb-1">Example:</p>
              <p className="text-sm text-cosmic-silver/90 italic">"{example}"</p>
            </div>
          )}

          {/* Credits required */}
          <div className="flex items-center justify-between p-3 bg-cosmic-deep/30 rounded-lg border border-cosmic-violet/20">
            <span className="text-sm text-cosmic-silver/70">Credits Required:</span>
            <span className="text-lg font-bold text-cosmic-gold">{credits}</span>
          </div>

          {/* Button */}
          <motion.button
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            className={`mt-4 w-full py-3 rounded-lg font-semibold transition-all ${
              disabled
                ? 'bg-cosmic-deep/50 text-cosmic-silver/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-cosmic-violet to-cosmic-indigo text-white hover:shadow-glow'
            }`}
            disabled={disabled}
          >
            Get Prediction
          </motion.button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
