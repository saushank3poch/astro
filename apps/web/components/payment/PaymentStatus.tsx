'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentStatus as PaymentStatusType } from '@/types/payment';
import confetti from 'canvas-confetti';

interface PaymentStatusProps {
  status: PaymentStatusType;
  error?: string | null;
  creditsGranted?: number;
}

export function PaymentStatus({ status, error, creditsGranted }: PaymentStatusProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (status === 'success' && !showConfetti) {
      setShowConfetti(true);
      // Trigger confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [status, showConfetti]);

  const statusConfig = {
    idle: {
      icon: '⏳',
      title: 'Initializing...',
      description: 'Setting up payment...',
      color: 'text-cosmic-silver/60',
      showSpinner: false,
    },
    creating: {
      icon: '⚙️',
      title: 'Creating Payment',
      description: 'Generating payment request...',
      color: 'text-blue-400',
      showSpinner: true,
    },
    waiting: {
      icon: '⏱️',
      title: 'Waiting for Payment',
      description: 'Please complete the transaction...',
      color: 'text-blue-400',
      showSpinner: true,
    },
    processing: {
      icon: '🔄',
      title: 'Confirming Transaction',
      description: 'Transaction detected! Waiting for confirmation...',
      color: 'text-cosmic-violet',
      showSpinner: true,
      showProgress: true,
    },
    success: {
      icon: '✅',
      title: 'Payment Successful!',
      description: creditsGranted
        ? `${creditsGranted} credits added to your account!`
        : 'Credits have been added to your account!',
      color: 'text-green-400',
      showSpinner: false,
    },
    failed: {
      icon: '❌',
      title: 'Payment Failed',
      description: error || 'Something went wrong. Please try again.',
      color: 'text-red-400',
      showSpinner: false,
    },
    expired: {
      icon: '⏰',
      title: 'Payment Expired',
      description: 'The payment window has expired. Please try again.',
      color: 'text-yellow-400',
      showSpinner: false,
    },
  };

  const config = statusConfig[status];

  return (
    <div className="py-8 text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          {/* Icon */}
          <div className="text-6xl mb-4">
            {config.showSpinner ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                {config.icon}
              </motion.div>
            ) : (
              config.icon
            )}
          </div>

          {/* Title */}
          <h3 className={`text-2xl font-bold mb-2 ${config.color}`}>
            {config.title}
          </h3>

          {/* Description */}
          <p className="text-cosmic-silver/70 mb-4">
            {config.description}
          </p>

          {/* Progress Bar (for processing status) */}
          {config.showProgress && (
            <div className="w-full max-w-md mx-auto mt-6">
              <div className="h-2 bg-cosmic-violet/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 10, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-cosmic-violet to-cosmic-indigo"
                />
              </div>
            </div>
          )}

          {/* Success Credits Badge */}
          {status === 'success' && creditsGranted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cosmic-gold/20 to-cosmic-violet/20 border-2 border-cosmic-gold"
            >
              <span className="text-2xl">💎</span>
              <span className="text-xl font-bold text-cosmic-gold">
                +{creditsGranted} Credits
              </span>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
