'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface LowCreditBannerProps {
  credits: number;
  threshold?: number;
}

export function LowCreditBanner({ credits, threshold = 5 }: LowCreditBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (credits >= threshold || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative w-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-500/50"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Warning Message */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-yellow-200 font-semibold">
                  Low Credits Warning
                </p>
                <p className="text-yellow-100/80 text-sm">
                  You have {credits} {credits === 1 ? 'credit' : 'credits'} remaining. Purchase more to continue using predictions.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link href="/credits/purchase">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-cosmic-gold to-yellow-600 text-cosmic-deep font-semibold shadow-lg hover:shadow-xl transition-shadow"
                >
                  Purchase Credits
                </motion.button>
              </Link>

              <button
                onClick={() => setIsDismissed(true)}
                className="text-yellow-200/60 hover:text-yellow-200 text-xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
