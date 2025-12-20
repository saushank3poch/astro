'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProcessingAnimationProps {
  messages?: string[];
}

const defaultMessages = [
  'Calculating planetary positions...',
  'Analyzing element harmony...',
  'Consulting ancient wisdom...',
  'Generating insights...',
];

export function ProcessingAnimation({ messages = defaultMessages }: ProcessingAnimationProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="fixed inset-0 bg-cosmic-void/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        {/* Cosmic background effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cosmic-violet rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Rotating planets */}
        <div className="relative h-48 mb-8">
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            {/* Outer orbit */}
            <div className="absolute w-40 h-40 border border-cosmic-violet/30 rounded-full" />
            <motion.div
              className="absolute w-4 h-4 bg-gradient-to-r from-cosmic-cyan to-cosmic-blue rounded-full"
              style={{ top: '0', left: '50%', marginLeft: '-8px' }}
            />
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          >
            {/* Middle orbit */}
            <div className="absolute w-28 h-28 border border-cosmic-violet/40 rounded-full" />
            <motion.div
              className="absolute w-3 h-3 bg-gradient-to-r from-cosmic-gold to-cosmic-violet rounded-full"
              style={{ top: '0', left: '50%', marginLeft: '-6px' }}
            />
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            {/* Inner orbit */}
            <div className="absolute w-16 h-16 border border-cosmic-violet/50 rounded-full" />
            <motion.div
              className="absolute w-2 h-2 bg-gradient-to-r from-cosmic-violet to-cosmic-indigo rounded-full"
              style={{ top: '0', left: '50%', marginLeft: '-4px' }}
            />
          </motion.div>

          {/* Center sun */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-cosmic-gold to-yellow-300 rounded-full shadow-glow" />
          </motion.div>
        </div>

        {/* Message */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-cosmic-gold mb-4">
            Consulting the stars...
          </h3>

          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-cosmic-silver/80"
            >
              {messages[currentMessageIndex]}
            </motion.p>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {messages.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentMessageIndex
                    ? 'bg-cosmic-violet'
                    : 'bg-cosmic-violet/30'
                }`}
                animate={{
                  scale: index === currentMessageIndex ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
