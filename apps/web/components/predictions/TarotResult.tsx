'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui';

interface TarotCard {
  name: string;
  position: string;
  isReversed: boolean;
  interpretation: string;
  financialMeaning: string;
  imageUrl?: string;
}

interface TarotResultProps {
  question: string;
  spread: 'three-card' | 'celtic-cross';
  cards: TarotCard[];
  overallReading: string;
  guidance: string[];
  confidenceScore: number;
}

export function TarotResult({
  question,
  spread,
  cards,
  overallReading,
  guidance,
  confidenceScore,
}: TarotResultProps) {
  return (
    <div className="space-y-6">
      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="glass" padding="lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Tarot Reading</CardTitle>
            <CardDescription className="text-center text-lg">
              {spread === 'three-card' ? 'Three Card Spread' : 'Celtic Cross'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-cosmic-silver/60 mb-2">Your Question:</p>
              <p className="text-xl text-cosmic-gold italic">"{question}"</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cards */}
      <div className={`grid ${spread === 'three-card' ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{
              delay: index * 0.3,
              duration: 0.6,
              type: 'spring',
            }}
          >
            <Card
              variant="glass"
              padding="lg"
              className="h-full"
            >
              <CardContent className="flex flex-col h-full">
                {/* Card visual representation */}
                <div className="relative mb-4">
                  <div className={`aspect-[2/3] rounded-lg bg-gradient-to-br from-cosmic-gold/20 to-cosmic-violet/20 border-2 border-cosmic-gold/50 flex items-center justify-center ${
                    card.isReversed ? 'rotate-180' : ''
                  }`}>
                    {card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-6xl">🌟</div>
                    )}
                  </div>
                  {card.isReversed && (
                    <div className="absolute top-2 right-2 bg-cosmic-deep px-2 py-1 rounded text-xs text-cosmic-gold rotate-180">
                      Reversed
                    </div>
                  )}
                </div>

                {/* Card info */}
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-cosmic-gold mb-2 text-center">
                    {card.name}
                  </h3>

                  <div className="mb-3 p-2 bg-cosmic-violet/10 rounded text-center">
                    <p className="text-sm text-cosmic-violet font-semibold">
                      {card.position}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-cosmic-silver/60 mb-1">Interpretation:</p>
                      <p className="text-sm text-cosmic-silver/90">{card.interpretation}</p>
                    </div>

                    <div>
                      <p className="text-xs text-cosmic-silver/60 mb-1">Financial Meaning:</p>
                      <p className="text-sm text-cosmic-silver/90">{card.financialMeaning}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Overall Reading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: cards.length * 0.3 }}
      >
        <Card variant="glass" padding="lg">
          <CardHeader>
            <CardTitle className="text-cosmic-violet">Overall Reading</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-cosmic-silver/90 text-lg leading-relaxed">
              {overallReading}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Guidance and Recommendations */}
      {guidance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: cards.length * 0.3 + 0.1 }}
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="text-cosmic-gold">Guidance & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {guidance.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: cards.length * 0.3 + 0.2 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-cosmic-violet text-xl">•</span>
                    <span className="text-cosmic-silver/90">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Confidence Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: cards.length * 0.3 + 0.2 }}
      >
        <Card variant="glass" padding="lg">
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-cosmic-silver/70">Reading Confidence:</span>
              <div className="flex items-center gap-3">
                <div className="w-48 h-2 bg-cosmic-deep rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cosmic-violet to-cosmic-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${confidenceScore}%` }}
                    transition={{ delay: cards.length * 0.3 + 0.3, duration: 1 }}
                  />
                </div>
                <span className="text-cosmic-gold font-bold">{confidenceScore}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: cards.length * 0.3 + 0.3 }}
      >
        <Card variant="glass" padding="md">
          <CardContent>
            <p className="text-xs text-cosmic-silver/60 text-center">
              ⚠️ Tarot readings are for entertainment and spiritual guidance only. They should not be used as the sole basis for financial decisions. Always consult with qualified financial advisors.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
