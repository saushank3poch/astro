'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input } from '@/components/ui';
import { ProcessingAnimation, TarotResult, IChingResult } from '@/components/predictions';
import type { Prediction, PredictionMethod } from '@/types';

const CREDITS_REQUIRED = 40;

export default function DivinationPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [question, setQuestion] = useState('');
  const [method, setMethod] = useState<'tarot' | 'iching'>('tarot');
  const [position, setPosition] = useState<'long' | 'short' | 'neutral'>('neutral');
  const [amount, setAmount] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) return;

    // Validate question
    if (question.trim().length < 10) {
      setError('Please enter a more detailed question (at least 10 characters).');
      return;
    }

    // Check credits
    if ((user.creditsBalance || 0) < CREDITS_REQUIRED) {
      setError('Insufficient credits. Please purchase more credits to continue.');
      return;
    }

    try {
      setIsProcessing(true);

      // Prepare context
      const context: any = {};
      if (position !== 'neutral') {
        context.position = position;
      }
      if (amount) {
        context.amount = amount;
      }
      if (entryPrice) {
        context.entryPrice = entryPrice;
      }
      if (targetPrice) {
        context.targetPrice = targetPrice;
      }

      // Create prediction request
      const response = await apiClient.createPrediction({
        type: 'divination',
        method: method as PredictionMethod,
        question,
        context: Object.keys(context).length > 0 ? context : undefined,
      });

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 30;
      const pollInterval = setInterval(async () => {
        try {
          const result = await apiClient.getPrediction(response.id);

          if (result.status === 'completed') {
            clearInterval(pollInterval);
            setPrediction(result);
            setIsProcessing(false);

            // Refresh user to update credits
            const updatedUser = await apiClient.getCurrentUser();
            useAuthStore.setState({ user: updatedUser });
          } else if (result.status === 'failed') {
            clearInterval(pollInterval);
            setError('Divination failed. Please try again.');
            setIsProcessing(false);
          }

          attempts++;
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setError('Divination is taking longer than expected. Please check your history later.');
            setIsProcessing(false);
          }
        } catch (err) {
          console.error('Error polling prediction:', err);
        }
      }, 1000);
    } catch (err: any) {
      console.error('Error creating divination:', err);
      setError(err.response?.data?.error?.message || 'Failed to create divination. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setPrediction(null);
    setError(null);
    setQuestion('');
    setMethod('tarot');
    setPosition('neutral');
    setAmount('');
    setEntryPrice('');
    setTargetPrice('');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  // Show processing animation
  if (isProcessing) {
    return (
      <ProcessingAnimation
        messages={
          method === 'tarot'
            ? [
                'Shuffling the cosmic deck...',
                'Drawing your cards...',
                'Interpreting the symbols...',
                'Channeling divine wisdom...',
              ]
            : [
                'Casting the yarrow stalks...',
                'Forming the hexagram...',
                'Consulting the Book of Changes...',
                'Revealing ancient wisdom...',
              ]
        }
      />
    );
  }

  // Show result
  if (prediction && prediction.divinationResult) {
    const result = prediction.divinationResult;

    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto py-8">
          {/* Header with back button */}
          <div className="mb-6 flex items-center gap-4">
            <Button variant="outline" onClick={handleReset}>
              ← New Reading
            </Button>
            <Button variant="ghost" onClick={() => router.push('/predictions')}>
              Back to Predictions
            </Button>
          </div>

          {method === 'tarot' ? (
            <TarotResult
              question={question}
              spread={result.spread || 'three-card'}
              cards={result.cards || []}
              overallReading={result.overallReading || ''}
              guidance={result.guidance || []}
              confidenceScore={result.confidenceScore || 75}
            />
          ) : (
            <IChingResult
              question={question}
              primaryHexagram={result.primaryHexagram}
              futureHexagram={result.futureHexagram}
              changingLines={result.changingLines}
              detailedInterpretation={result.detailedInterpretation || ''}
              keyDates={result.keyDates}
              actionableGuidance={result.actionableGuidance || []}
            />
          )}
        </div>
      </div>
    );
  }

  // Show form
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/predictions')}
            className="mb-4"
          >
            ← Back to Predictions
          </Button>

          <h1 className="text-4xl font-bold mb-2 text-cosmic-gold">
            Divine Guidance
          </h1>
          <p className="text-cosmic-silver/80">
            Ask the cosmos any question through Tarot or I Ching divination
          </p>
        </motion.div>

        {/* Credits display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card variant="glass" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-cosmic-silver/70">Your Credits:</span>
                  <span className="text-2xl font-bold text-cosmic-gold">
                    {user.creditsBalance || 0}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-cosmic-silver/70">Cost:</span>
                  <span className="text-2xl font-bold text-cosmic-violet">
                    {CREDITS_REQUIRED}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle>Ask Your Question</CardTitle>
              <CardDescription>
                Be specific and focus on what you truly want to know
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Question
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Example: Should I hold my Bitcoin position through the next quarter, or take profits now?"
                    className="w-full px-4 py-3 bg-cosmic-deep border border-cosmic-violet/30 rounded-lg text-foreground placeholder-cosmic-silver/50 min-h-32 focus:outline-none focus:ring-2 focus:ring-cosmic-violet"
                    maxLength={500}
                  />
                  <p className="text-xs text-cosmic-silver/60 mt-1">
                    {question.length}/500 characters
                  </p>
                </div>

                {/* Method selector */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Divination Method
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setMethod('tarot')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        method === 'tarot'
                          ? 'border-cosmic-violet bg-cosmic-violet/20'
                          : 'border-cosmic-violet/30 hover:border-cosmic-violet/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">🃏</div>
                      <div className="font-semibold text-cosmic-gold">Tarot</div>
                      <div className="text-xs text-cosmic-silver/70 mt-1">
                        Visual symbols and archetypal wisdom
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMethod('iching')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        method === 'iching'
                          ? 'border-cosmic-violet bg-cosmic-violet/20'
                          : 'border-cosmic-violet/30 hover:border-cosmic-violet/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">☯️</div>
                      <div className="font-semibold text-cosmic-gold">I Ching</div>
                      <div className="text-xs text-cosmic-silver/70 mt-1">
                        Ancient Chinese Book of Changes
                      </div>
                    </button>
                  </div>
                </div>

                {/* Optional position details */}
                <div className="border-t border-cosmic-violet/20 pt-6">
                  <h3 className="text-sm font-medium text-foreground mb-4">
                    Optional Position Details
                  </h3>

                  <div className="space-y-4">
                    {/* Position type */}
                    <div>
                      <label className="block text-sm text-cosmic-silver/70 mb-2">
                        Position Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'long', label: 'Long' },
                          { value: 'neutral', label: 'None' },
                          { value: 'short', label: 'Short' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setPosition(option.value as any)}
                            className={`p-2 rounded border transition-all text-sm ${
                              position === option.value
                                ? 'border-cosmic-violet bg-cosmic-violet/20 text-cosmic-gold'
                                : 'border-cosmic-violet/30 hover:border-cosmic-violet/50'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <Input
                        label="Amount Invested"
                        placeholder="e.g., $10,000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />

                      <Input
                        label="Entry Price"
                        placeholder="e.g., $45,000"
                        value={entryPrice}
                        onChange={(e) => setEntryPrice(e.target.value)}
                      />

                      <Input
                        label="Target Price"
                        placeholder="e.g., $50,000"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={(user.creditsBalance || 0) < CREDITS_REQUIRED || question.trim().length < 10}
                >
                  Ask the Cosmos ({CREDITS_REQUIRED} Credits)
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid md:grid-cols-2 gap-4"
        >
          <Card variant="glass" padding="md">
            <CardContent>
              <h3 className="font-semibold text-cosmic-violet mb-2">
                {method === 'tarot' ? 'Tarot Reading Includes:' : 'I Ching Reading Includes:'}
              </h3>
              {method === 'tarot' ? (
                <ul className="text-sm text-cosmic-silver/80 space-y-1">
                  <li>• 3-card or Celtic Cross spread</li>
                  <li>• Individual card interpretations</li>
                  <li>• Financial meanings for each card</li>
                  <li>• Overall reading synthesis</li>
                  <li>• Actionable guidance and recommendations</li>
                </ul>
              ) : (
                <ul className="text-sm text-cosmic-silver/80 space-y-1">
                  <li>• Primary hexagram analysis</li>
                  <li>• Changing lines (if any)</li>
                  <li>• Future hexagram (if applicable)</li>
                  <li>• Detailed interpretation</li>
                  <li>• Timing guidance and actionable steps</li>
                </ul>
              )}
            </CardContent>
          </Card>

          <Card variant="glass" padding="md">
            <CardContent>
              <h3 className="font-semibold text-cosmic-violet mb-2">Tips for Best Results:</h3>
              <ul className="text-sm text-cosmic-silver/80 space-y-1">
                <li>• Be specific and clear with your question</li>
                <li>• Focus on "What should I do?" rather than "Will X happen?"</li>
                <li>• Include relevant context (position, amounts, etc.)</li>
                <li>• Approach with an open mind and heart</li>
                <li>• Use insights as guidance, not absolute truth</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
