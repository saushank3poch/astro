'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  paymentUrl: string;
  amount: number;
  currency: string;
  expiresAt: string;
  onExpired?: () => void;
}

export function QRCodeDisplay({
  paymentUrl,
  amount,
  currency,
  expiresAt,
  onExpired,
}: QRCodeDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = Math.max(0, expiry - now);
      return Math.floor(diff / 1000);
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const left = calculateTimeLeft();
      setTimeLeft(left);

      if (left === 0 && onExpired) {
        onExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getTimerColor = () => {
    if (timeLeft > 180) return 'text-green-400'; // > 3 minutes
    if (timeLeft > 60) return 'text-yellow-400'; // > 1 minute
    return 'text-red-400'; // < 1 minute
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* QR Code */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 bg-white rounded-xl shadow-lg"
      >
        <QRCodeSVG
          value={paymentUrl}
          size={256}
          level="H"
          includeMargin={true}
        />
      </motion.div>

      {/* Scan Instruction */}
      <div className="text-center">
        <p className="text-lg font-semibold text-cosmic-silver mb-1">
          Scan with Phantom
        </p>
        <p className="text-sm text-cosmic-silver/60">
          {amount} {currency}
        </p>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-2">
        <span className="text-cosmic-silver/60">Expires in:</span>
        <span className={`text-2xl font-bold ${getTimerColor()}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>

      {/* Copy URL Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCopyUrl}
        className="px-6 py-3 rounded-lg bg-cosmic-violet/30 hover:bg-cosmic-violet/50 text-cosmic-silver border border-cosmic-violet/50 transition-all"
      >
        {copied ? '✓ Copied!' : '📋 Copy Payment URL'}
      </motion.button>

      {/* Mobile Deep Link */}
      {paymentUrl && (
        <a
          href={paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cosmic-violet hover:text-cosmic-indigo underline text-sm"
        >
          Open in Phantom
        </a>
      )}
    </div>
  );
}
