'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { PredictionCard } from '@/components/predictions';
import { Card, CardContent } from '@/components/ui';

export default function PredictionsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const predictions = [
    {
      title: 'Macro Predictions',
      description: 'Discover which markets and asset classes will shine in the coming year based on cosmic alignments.',
      icon: '🌍',
      credits: 50,
      example: 'Will crypto or stocks perform better in 2025?',
      path: '/predictions/macro',
    },
    {
      title: 'Asset Timing',
      description: 'Find the perfect entry and exit points for your favorite assets using astrological timing.',
      icon: '⏰',
      credits: 30,
      example: 'When should I buy Bitcoin?',
      path: '/predictions/timing',
    },
    {
      title: 'Divine Guidance',
      description: 'Ask the cosmos any question about your investments through Tarot or I Ching divination.',
      icon: '🔮',
      credits: 40,
      example: 'Should I hold or sell my position?',
      path: '/predictions/divination',
    },
  ];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cosmic-gold via-cosmic-violet to-cosmic-cyan bg-clip-text text-transparent">
            Cosmic Predictions
          </h1>
          <p className="text-xl text-cosmic-silver/80 mb-6">
            Harness ancient wisdom to illuminate your financial path
          </p>

          {/* Credits display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass" padding="md" className="inline-block">
              <CardContent>
                <div className="flex items-center gap-3">
                  <span className="text-cosmic-silver/70">Available Credits:</span>
                  <span className="text-3xl font-bold text-cosmic-gold">
                    {user.creditsBalance || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Prediction Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {predictions.map((prediction, index) => (
            <PredictionCard
              key={prediction.path}
              title={prediction.title}
              description={prediction.description}
              icon={prediction.icon}
              credits={prediction.credits}
              example={prediction.example}
              onClick={() => router.push(prediction.path)}
              delay={0.3 + index * 0.1}
              disabled={(user.creditsBalance || 0) < prediction.credits}
            />
          ))}
        </div>

        {/* Low balance warning */}
        {(user.creditsBalance || 0) < 30 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card variant="glass" padding="lg" className="border-orange-500/50">
              <CardContent>
                <div className="text-center">
                  <p className="text-orange-400 font-semibold mb-2">
                    ⚠️ Low Credit Balance
                  </p>
                  <p className="text-cosmic-silver/80 mb-4">
                    You're running low on credits. Purchase more to continue receiving cosmic insights.
                  </p>
                  <button
                    onClick={() => router.push('/settings')}
                    className="px-6 py-2 bg-gradient-to-r from-cosmic-gold to-yellow-500 text-cosmic-void font-semibold rounded-lg hover:shadow-glow transition-all"
                  >
                    Buy More Credits
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-2 gap-6 mt-12"
        >
          <Card variant="glass" padding="lg">
            <CardContent>
              <h3 className="text-xl font-bold text-cosmic-violet mb-3">
                How It Works
              </h3>
              <ol className="space-y-2 text-cosmic-silver/80">
                <li className="flex items-start gap-2">
                  <span className="text-cosmic-gold font-bold">1.</span>
                  <span>Choose your prediction type based on your question</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cosmic-gold font-bold">2.</span>
                  <span>Fill in the required information (asset, timeframe, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cosmic-gold font-bold">3.</span>
                  <span>Our AI analyzes planetary positions and ancient wisdom</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cosmic-gold font-bold">4.</span>
                  <span>Receive detailed insights and actionable recommendations</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card variant="glass" padding="lg">
            <CardContent>
              <h3 className="text-xl font-bold text-cosmic-violet mb-3">
                Your Prediction History
              </h3>
              <p className="text-cosmic-silver/80 mb-4">
                View all your past predictions and track the accuracy of cosmic insights over time.
              </p>
              <button
                onClick={() => router.push('/predictions/history')}
                className="w-full px-6 py-3 border-2 border-cosmic-violet text-cosmic-violet font-semibold rounded-lg hover:bg-cosmic-violet hover:text-white transition-all"
              >
                View History
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card variant="glass" padding="md">
            <CardContent>
              <p className="text-xs text-cosmic-silver/60 text-center">
                ⚠️ All predictions are for entertainment purposes only and should not be considered financial advice.
                Past performance and astrological patterns do not guarantee future results.
                Always conduct your own research and consult with qualified financial advisors before making investment decisions.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
