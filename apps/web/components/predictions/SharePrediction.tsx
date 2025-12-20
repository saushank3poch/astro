'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, Button } from '@/components/ui';

interface SharePredictionProps {
  predictionId: string;
  title: string;
  summary?: string;
}

export function SharePrediction({ predictionId, title, summary }: SharePredictionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/predictions/shared/${predictionId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTwitterShare = () => {
    const text = `Check out my cosmic prediction: ${title}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleTelegramShare = () => {
    const text = `Check out my cosmic prediction: ${title}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <>
      {/* Share button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <span>🔗</span>
        <span>Share</span>
      </Button>

      {/* Share modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-cosmic-void/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md"
              >
                <Card variant="glass" padding="lg">
                  <CardContent>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-cosmic-gold mb-1">
                          Share Prediction
                        </h3>
                        <p className="text-sm text-cosmic-silver/70">
                          Share your cosmic insights with others
                        </p>
                      </div>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="text-cosmic-silver/70 hover:text-cosmic-silver transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Preview */}
                    {summary && (
                      <div className="mb-6 p-4 bg-cosmic-deep/50 rounded-lg border border-cosmic-violet/20">
                        <p className="text-sm text-cosmic-silver/80">{summary}</p>
                      </div>
                    )}

                    {/* Copy link */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Share Link
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={shareUrl}
                          readOnly
                          className="flex-grow px-4 py-2 bg-cosmic-deep border border-cosmic-violet/30 rounded-lg text-cosmic-silver/80 text-sm"
                        />
                        <Button
                          variant={copied ? 'secondary' : 'primary'}
                          onClick={handleCopyLink}
                          className="whitespace-nowrap"
                        >
                          {copied ? '✓ Copied' : 'Copy'}
                        </Button>
                      </div>
                    </div>

                    {/* Social share buttons */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        Share on Social Media
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          onClick={handleTwitterShare}
                          className="flex items-center justify-center gap-2"
                        >
                          <span className="text-xl">𝕏</span>
                          <span>Twitter/X</span>
                        </Button>

                        <Button
                          variant="outline"
                          onClick={handleTelegramShare}
                          className="flex items-center justify-center gap-2"
                        >
                          <span className="text-xl">✈️</span>
                          <span>Telegram</span>
                        </Button>
                      </div>
                    </div>

                    {/* Note */}
                    <p className="text-xs text-cosmic-silver/60 mt-6 text-center">
                      Note: Shared predictions are public and can be viewed by anyone with the link.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
