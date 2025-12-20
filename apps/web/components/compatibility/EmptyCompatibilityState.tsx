'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, TrendingUp, Star } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';

interface EmptyCompatibilityStateProps {
  hasProfile?: boolean;
}

export function EmptyCompatibilityState({ hasProfile = true }: EmptyCompatibilityStateProps) {
  if (!hasProfile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <Card variant="glass" padding="lg" className="max-w-md">
          <CardContent className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-6"
            >
              <Star className="w-20 h-20 mx-auto text-cosmic-gold" />
            </motion.div>

            <h2 className="text-2xl font-bold mb-3 text-cosmic-gold">
              Complete Your Cosmic Profile
            </h2>

            <p className="text-cosmic-silver/80 mb-6">
              To discover assets aligned with your astrological blueprint,
              you need to complete your birth information first.
            </p>

            <div className="space-y-3 mb-6 text-left">
              <div className="flex items-center gap-3 text-sm text-cosmic-silver/70">
                <Sparkles size={16} className="text-cosmic-violet" />
                <span>Add your birth date, time, and location</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-cosmic-silver/70">
                <Sparkles size={16} className="text-cosmic-violet" />
                <span>We'll calculate your birth chart</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-cosmic-silver/70">
                <Sparkles size={16} className="text-cosmic-violet" />
                <span>Discover your most compatible assets</span>
              </div>
            </div>

            <Link href="/settings">
              <Button variant="primary" fullWidth>
                Complete Birth Information
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <Card variant="glass" padding="lg" className="max-w-md">
        <CardContent className="text-center py-8">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-6"
          >
            <Sparkles className="w-20 h-20 mx-auto text-cosmic-violet" />
          </motion.div>

          <h2 className="text-2xl font-bold mb-3 text-cosmic-violet">
            Analyzing Your Cosmic Compatibility
          </h2>

          <p className="text-cosmic-silver/80 mb-6">
            We're calculating compatibility scores for thousands of assets
            based on your unique astrological profile.
          </p>

          <div className="space-y-3 mb-6 text-left bg-cosmic-deep/30 rounded-lg p-4">
            <div className="flex items-center gap-3 text-sm text-cosmic-silver/70">
              <div className="w-2 h-2 bg-cosmic-violet rounded-full animate-pulse" />
              <span>Analyzing Five Elements harmony...</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-cosmic-silver/70">
              <div className="w-2 h-2 bg-cosmic-violet rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span>Calculating planetary alignments...</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-cosmic-silver/70">
              <div className="w-2 h-2 bg-cosmic-violet rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              <span>Finding your best matches...</span>
            </div>
          </div>

          <p className="text-xs text-cosmic-silver/60 mb-4">
            This may take a few moments. You can explore other features while we calculate.
          </p>

          <div className="flex gap-3">
            <Link href="/profile" className="flex-1">
              <Button variant="outline" fullWidth>
                View Birth Chart
              </Button>
            </Link>
            <Link href="/assets" className="flex-1">
              <Button variant="outline" fullWidth className="flex items-center justify-center gap-2">
                <TrendingUp size={16} />
                Browse Assets
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
