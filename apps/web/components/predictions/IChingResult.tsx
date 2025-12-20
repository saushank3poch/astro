'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui';

interface Hexagram {
  number: number;
  chineseName: string;
  englishName: string;
  lines: boolean[]; // true = yang (solid), false = yin (broken)
  judgement: string;
  image: string;
  interpretation: string;
}

interface ChangingLine {
  position: number;
  text: string;
  guidance: string;
}

interface IChingResultProps {
  question: string;
  primaryHexagram: Hexagram;
  futureHexagram?: Hexagram;
  changingLines?: ChangingLine[];
  detailedInterpretation: string;
  keyDates?: string[];
  actionableGuidance: string[];
}

export function IChingResult({
  question,
  primaryHexagram,
  futureHexagram,
  changingLines = [],
  detailedInterpretation,
  keyDates = [],
  actionableGuidance,
}: IChingResultProps) {
  // Render hexagram lines
  const renderHexagram = (hexagram: Hexagram, delay: number = 0) => {
    return (
      <div className="flex flex-col gap-2">
        {hexagram.lines.map((isYang, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: delay + (5 - index) * 0.1, duration: 0.5 }}
            className="flex justify-center"
          >
            {isYang ? (
              // Yang line (solid)
              <div className="w-32 h-2 bg-cosmic-gold rounded" />
            ) : (
              // Yin line (broken)
              <div className="flex gap-2">
                <div className="w-14 h-2 bg-cosmic-silver rounded" />
                <div className="w-14 h-2 bg-cosmic-silver rounded" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="glass" padding="lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center">I Ching Reading</CardTitle>
            <CardDescription className="text-center text-lg">
              The Book of Changes
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

      {/* Primary Hexagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="glass" padding="lg">
          <CardHeader>
            <CardTitle className="text-center text-cosmic-gold">
              Hexagram {primaryHexagram.number}: {primaryHexagram.englishName}
            </CardTitle>
            <CardDescription className="text-center text-xl">
              {primaryHexagram.chineseName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6">
              {/* Hexagram visualization */}
              {renderHexagram(primaryHexagram, 0.3)}

              {/* Judgement */}
              <div className="w-full">
                <h4 className="text-lg font-semibold text-cosmic-violet mb-2">Judgement</h4>
                <p className="text-cosmic-silver/90 italic">"{primaryHexagram.judgement}"</p>
              </div>

              {/* Image */}
              <div className="w-full">
                <h4 className="text-lg font-semibold text-cosmic-violet mb-2">Image</h4>
                <p className="text-cosmic-silver/90 italic">"{primaryHexagram.image}"</p>
              </div>

              {/* Interpretation */}
              <div className="w-full">
                <h4 className="text-lg font-semibold text-cosmic-violet mb-2">Interpretation</h4>
                <p className="text-cosmic-silver/90">{primaryHexagram.interpretation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Changing Lines */}
      {changingLines.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="text-cosmic-gold">Changing Lines</CardTitle>
              <CardDescription>
                Lines in transition, indicating areas of focus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {changingLines.map((line, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                    className="p-4 bg-cosmic-deep/50 rounded-lg border border-cosmic-violet/20"
                  >
                    <h4 className="font-semibold text-cosmic-gold mb-2">
                      Line {line.position}
                    </h4>
                    <p className="text-sm text-cosmic-silver/80 mb-2 italic">
                      "{line.text}"
                    </p>
                    <p className="text-sm text-cosmic-silver/90">
                      {line.guidance}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Future Hexagram */}
      {futureHexagram && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="text-center text-cosmic-cyan">
                Future Hexagram {futureHexagram.number}: {futureHexagram.englishName}
              </CardTitle>
              <CardDescription className="text-center text-lg">
                {futureHexagram.chineseName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6">
                {/* Hexagram visualization */}
                {renderHexagram(futureHexagram, 1.3)}

                {/* Judgement */}
                <div className="w-full">
                  <h4 className="text-lg font-semibold text-cosmic-violet mb-2">Judgement</h4>
                  <p className="text-cosmic-silver/90 italic">"{futureHexagram.judgement}"</p>
                </div>

                {/* Interpretation */}
                <div className="w-full">
                  <h4 className="text-lg font-semibold text-cosmic-violet mb-2">What This Means</h4>
                  <p className="text-cosmic-silver/90">{futureHexagram.interpretation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Detailed Interpretation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: futureHexagram ? 2.0 : 1.3 }}
      >
        <Card variant="glass" padding="lg">
          <CardHeader>
            <CardTitle className="text-cosmic-violet">Detailed Interpretation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-cosmic-silver/90 text-lg leading-relaxed">
              {detailedInterpretation}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Dates */}
      {keyDates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: futureHexagram ? 2.1 : 1.4 }}
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle className="text-cosmic-gold">Key Timing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {keyDates.map((date, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-cosmic-violet/20 rounded-lg border border-cosmic-violet/30"
                  >
                    <p className="text-cosmic-gold font-semibold">{date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Actionable Guidance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: futureHexagram ? 2.2 : 1.5 }}
      >
        <Card variant="glass" padding="lg">
          <CardHeader>
            <CardTitle className="text-cosmic-gold">Actionable Guidance</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {actionableGuidance.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (futureHexagram ? 2.3 : 1.6) + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-cosmic-violet text-xl">→</span>
                  <span className="text-cosmic-silver/90">{item}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: futureHexagram ? 2.5 : 1.8 }}
      >
        <Card variant="glass" padding="md">
          <CardContent>
            <p className="text-xs text-cosmic-silver/60 text-center">
              ⚠️ I Ching readings are for philosophical guidance and reflection. They should not be used as the sole basis for financial decisions. Always consult with qualified financial advisors.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
