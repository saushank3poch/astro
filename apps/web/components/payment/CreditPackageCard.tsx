'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditPackage } from '@/types/payment';

interface CreditPackageCardProps {
  package: CreditPackage;
  isSelected: boolean;
  onSelect: () => void;
}

export function CreditPackageCard({ package: pkg, isSelected, onSelect }: CreditPackageCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`relative p-6 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'bg-gradient-to-br from-cosmic-violet/20 to-cosmic-gold/20 border-2 border-cosmic-gold shadow-[0_0_20px_rgba(212,175,55,0.5)]'
          : 'glass border border-cosmic-violet/30 hover:border-cosmic-violet/50'
      }`}
    >
      {/* Badges */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
        {pkg.discount && (
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500/80 to-green-600/80 text-white text-xs font-bold">
            Save {pkg.discount}
          </div>
        )}
        {pkg.bestValue && (
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-cosmic-gold/80 to-yellow-600/80 text-cosmic-deep text-xs font-bold">
            Best Value
          </div>
        )}
      </div>

      {/* Package Icon */}
      <div className="mb-4">
        {pkg.credits === -1 ? (
          <div className="text-6xl">♾️</div>
        ) : pkg.credits === 10 ? (
          <div className="text-6xl">💎</div>
        ) : pkg.credits === 50 ? (
          <div className="text-6xl">💰</div>
        ) : (
          <div className="text-6xl">👑</div>
        )}
      </div>

      {/* Credits */}
      <div className="mb-2">
        <div className="text-3xl font-bold text-cosmic-gold">
          {pkg.credits === -1 ? 'Unlimited' : `${pkg.credits} Credits`}
        </div>
        {pkg.credits === -1 && (
          <div className="text-sm text-cosmic-silver/60">30 days</div>
        )}
      </div>

      {/* Price */}
      <div className="text-2xl font-semibold text-cosmic-silver mb-3">
        ${pkg.priceUSD.toFixed(2)}
      </div>

      {/* Description */}
      <div className="text-sm text-cosmic-silver/70 mb-4">
        {pkg.description}
      </div>

      {/* Select Button */}
      <button
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          isSelected
            ? 'bg-gradient-to-r from-cosmic-gold to-yellow-600 text-cosmic-deep shadow-lg'
            : 'bg-cosmic-violet/30 text-cosmic-silver hover:bg-cosmic-violet/50'
        }`}
      >
        {isSelected ? 'Selected' : 'Select'}
      </button>
    </motion.div>
  );
}
