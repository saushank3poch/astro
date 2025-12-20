'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { ElementIndicator } from '@/components/astro';
import type { CompatibleAsset } from '@/types/compatibility';

interface CompatibilityCardProps {
  asset: CompatibleAsset;
  index?: number;
}

export function CompatibilityCard({ asset, index = 0 }: CompatibilityCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'from-green-500 to-green-600';
    if (score >= 4) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 7) return 'text-green-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/compatibility/${asset.symbol}`}>
        <Card
          variant="glass"
          className="group hover:border-cosmic-violet/50 transition-all duration-300 cursor-pointer h-full"
        >
          <CardContent className="p-5">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-cosmic-gold">{asset.symbol}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cosmic-violet/20 text-cosmic-violet">
                    {asset.assetType}
                  </span>
                </div>
                <p className="text-sm text-cosmic-silver/70">{asset.name}</p>
              </div>

              {/* Score */}
              <div className="flex flex-col items-end">
                <div className={`text-2xl font-bold ${getScoreTextColor(asset.compatibilityScore)}`}>
                  {asset.compatibilityScore.toFixed(1)}
                </div>
                <div className="text-xs text-cosmic-silver/50">/ 10</div>
              </div>
            </div>

            {/* Visual Score Bar */}
            <div className="mb-4">
              <div className="h-2 bg-cosmic-deep/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(asset.compatibilityScore / 10) * 100}%` }}
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.6 }}
                  className={`h-full bg-gradient-to-r ${getScoreColor(asset.compatibilityScore)}`}
                />
              </div>
            </div>

            {/* Elements */}
            {asset.elementHarmony && (
              <div className="mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {asset.elementHarmony.assetElements.map((element, i) => (
                    <ElementIndicator key={i} element={element} size="sm" />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Reasoning */}
            <div className="text-xs text-cosmic-silver/70 line-clamp-2 mb-3">
              {asset.overallReasoning}
            </div>

            {/* View Details Link */}
            <div className="flex items-center justify-between pt-3 border-t border-cosmic-violet/10">
              <span className="text-xs text-cosmic-silver/50">
                {asset.elementHarmony.favorableMatch ? 'Favorable Match' : 'Review Compatibility'}
              </span>
              <TrendingUp
                size={16}
                className="text-cosmic-violet group-hover:translate-x-1 transition-transform"
              />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
