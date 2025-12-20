'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui';
import { ScoreGauge } from './ScoreGauge';
import { CalendarHeatmap } from './CalendarHeatmap';

interface TimingPeriod {
  start: string;
  end: string;
  score: number;
  aspects?: string[];
  reasoning: string;
}

interface TimingResultProps {
  assetSymbol: string;
  assetName: string;
  timeframe: string;
  currentScore: number;
  bestEntryDate?: string;
  favorablePeriods: TimingPeriod[];
  challengingPeriods: TimingPeriod[];
  recommendation: string;
  heatmapData?: Array<{ date: string; score: number }>;
  transitDetails?: {
    currentTransits: string[];
    upcomingTransits: string[];
  };
}

export function TimingResult({
  assetSymbol,
  assetName,
  timeframe,
  currentScore,
  bestEntryDate,
  favorablePeriods,
  challengingPeriods,
  recommendation,
  heatmapData = [],
  transitDetails,
}: TimingResultProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="glass" padding="lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center">
              {assetSymbol} Timing Analysis
            </CardTitle>
            <CardDescription className="text-center">
              {assetName} • {timeframe}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <ScoreGauge
                score={currentScore}
                label="Current Timing Score"
                size="lg"
              />
            </div>

            {bestEntryDate && (
              <div className="mt-6 p-4 bg-gradient-to-r from-cosmic-violet/20 to-cosmic-indigo/20 rounded-lg border border-cosmic-violet/30 text-center">
                <p className="text-sm text-cosmic-silver/70 mb-1">Best Entry Date</p>
                <p className="text-2xl font-bold text-cosmic-gold">
                  {new Date(bestEntryDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Calendar Heatmap */}
      {heatmapData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle>Timing Calendar</CardTitle>
              <CardDescription>
                Daily favorability scores for the selected timeframe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarHeatmap data={heatmapData} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Favorable Periods */}
      {favorablePeriods.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="text-green-400">Favorable Periods</CardTitle>
              <CardDescription>Best times for entry or accumulation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {favorablePeriods.map((period, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="p-4 bg-cosmic-deep/50 rounded-lg border border-green-500/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-cosmic-gold">
                          {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
                        </p>
                        {period.aspects && period.aspects.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {period.aspects.map((aspect, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 bg-cosmic-violet/20 rounded text-cosmic-silver/80"
                              >
                                {aspect}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-green-400">
                        {period.score.toFixed(1)}
                      </div>
                    </div>
                    <p className="text-sm text-cosmic-silver/80">{period.reasoning}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Challenging Periods */}
      {challengingPeriods.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="text-orange-400">Challenging Periods</CardTitle>
              <CardDescription>Times to exercise caution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {challengingPeriods.map((period, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="p-4 bg-cosmic-deep/50 rounded-lg border border-orange-500/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-cosmic-gold">
                          {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
                        </p>
                        {period.aspects && period.aspects.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {period.aspects.map((aspect, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 bg-cosmic-violet/20 rounded text-cosmic-silver/80"
                              >
                                {aspect}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-orange-400">
                        {period.score.toFixed(1)}
                      </div>
                    </div>
                    <p className="text-sm text-cosmic-silver/80">{period.reasoning}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="glass" padding="lg">
          <CardHeader>
            <CardTitle className="text-cosmic-violet">Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-cosmic-silver/90 text-lg">{recommendation}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transit Details */}
      {transitDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle>Astrological Transit Details</CardTitle>
              <CardDescription>For the astrology nerds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {transitDetails.currentTransits.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-cosmic-gold mb-3">Current Transits</h4>
                    <ul className="space-y-2">
                      {transitDetails.currentTransits.map((transit, i) => (
                        <li key={i} className="text-sm text-cosmic-silver/80 flex items-start gap-2">
                          <span className="text-cosmic-violet">•</span>
                          <span>{transit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {transitDetails.upcomingTransits.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-cosmic-gold mb-3">Upcoming Transits</h4>
                    <ul className="space-y-2">
                      {transitDetails.upcomingTransits.map((transit, i) => (
                        <li key={i} className="text-sm text-cosmic-silver/80 flex items-start gap-2">
                          <span className="text-cosmic-violet">•</span>
                          <span>{transit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card variant="glass" padding="md">
          <CardContent>
            <p className="text-xs text-cosmic-silver/60 text-center">
              ⚠️ Timing predictions are for entertainment purposes only. Market timing is extremely difficult and past patterns may not predict future results. Always do your own research.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
