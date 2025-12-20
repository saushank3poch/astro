'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ScoreGauge } from './ScoreGauge';
import { ElementIndicator } from '@/components/astro';
import type { ChineseElement } from '@/types';

interface AssetClassPrediction {
  assetClass: string;
  score: number;
  element?: ChineseElement;
  favorablePeriods: string[];
  recommendations: string[];
}

interface MacroResultProps {
  year: number;
  method: string;
  yearElement?: ChineseElement;
  yearAnimal?: string;
  overview?: string;
  assetClasses: AssetClassPrediction[];
  marketEnergy?: number;
}

export function MacroResult({
  year,
  method,
  yearElement,
  yearAnimal,
  overview,
  assetClasses,
  marketEnergy = 7,
}: MacroResultProps) {
  // Sort asset classes by score
  const sortedAssets = [...assetClasses].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      {/* Year Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="glass" padding="lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center">
              {year} Market Predictions
            </CardTitle>
            {yearElement && yearAnimal && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <span className="text-xl text-cosmic-gold">Year of the {yearAnimal}</span>
                <ElementIndicator element={yearElement} size="md" />
              </div>
            )}
          </CardHeader>
          <CardContent>
            {overview && (
              <p className="text-cosmic-silver/80 text-center mb-6">{overview}</p>
            )}

            {/* Overall Market Energy */}
            <div className="flex flex-col items-center">
              <h4 className="text-lg font-semibold mb-4 text-cosmic-violet">
                Overall Market Energy
              </h4>
              <ScoreGauge score={marketEnergy} label="Market Vitality" size="lg" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Asset Class Predictions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAssets.map((asset, index) => (
          <motion.div
            key={asset.assetClass}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              variant="glass"
              padding="lg"
              className="h-full hover:border-cosmic-violet/50 transition-all"
            >
              <CardContent className="flex flex-col h-full">
                {/* Asset Class Name */}
                <h3 className="text-xl font-bold text-cosmic-gold mb-4 text-center">
                  {asset.assetClass}
                </h3>

                {/* Score Gauge */}
                <div className="flex justify-center mb-4">
                  <ScoreGauge score={asset.score} size="md" />
                </div>

                {/* Element Harmony */}
                {asset.element && (
                  <div className="mb-4">
                    <p className="text-xs text-cosmic-silver/60 mb-2 text-center">
                      Element Harmony
                    </p>
                    <div className="flex justify-center">
                      <ElementIndicator element={asset.element} size="sm" />
                    </div>
                  </div>
                )}

                {/* Favorable Periods */}
                {asset.favorablePeriods.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-cosmic-silver/60 mb-2">
                      Favorable Periods:
                    </p>
                    <ul className="text-sm text-cosmic-silver/80 space-y-1">
                      {asset.favorablePeriods.slice(0, 3).map((period, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-cosmic-gold">•</span>
                          <span>{period}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Recommendations */}
                {asset.recommendations.length > 0 && (
                  <div className="mt-auto">
                    <p className="text-xs text-cosmic-silver/60 mb-2">
                      Key Recommendations:
                    </p>
                    <ul className="text-sm text-cosmic-silver/80 space-y-1">
                      {asset.recommendations.slice(0, 2).map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-cosmic-violet">→</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card variant="glass" padding="md">
          <CardContent>
            <p className="text-xs text-cosmic-silver/60 text-center">
              ⚠️ These predictions are for entertainment purposes only. Always do your own research and consult with financial advisors before making investment decisions.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
