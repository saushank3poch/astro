import React from 'react';
import type { ZodiacSign as ZodiacSignType } from '@/types';

interface ZodiacSignProps {
  sign: ZodiacSignType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const zodiacConfig: Record<ZodiacSignType, { emoji: string; symbol: string; name: string; element: string }> = {
  aries: { emoji: '♈', symbol: '♈', name: 'Aries', element: 'Fire' },
  taurus: { emoji: '♉', symbol: '♉', name: 'Taurus', element: 'Earth' },
  gemini: { emoji: '♊', symbol: '♊', name: 'Gemini', element: 'Air' },
  cancer: { emoji: '♋', symbol: '♋', name: 'Cancer', element: 'Water' },
  leo: { emoji: '♌', symbol: '♌', name: 'Leo', element: 'Fire' },
  virgo: { emoji: '♍', symbol: '♍', name: 'Virgo', element: 'Earth' },
  libra: { emoji: '♎', symbol: '♎', name: 'Libra', element: 'Air' },
  scorpio: { emoji: '♏', symbol: '♏', name: 'Scorpio', element: 'Water' },
  sagittarius: { emoji: '♐', symbol: '♐', name: 'Sagittarius', element: 'Fire' },
  capricorn: { emoji: '♑', symbol: '♑', name: 'Capricorn', element: 'Earth' },
  aquarius: { emoji: '♒', symbol: '♒', name: 'Aquarius', element: 'Air' },
  pisces: { emoji: '♓', symbol: '♓', name: 'Pisces', element: 'Water' },
};

export function ZodiacSign({ sign, size = 'md', showLabel = true }: ZodiacSignProps) {
  const config = zodiacConfig[sign];

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`${sizeClasses[size]} text-cosmic-violet`}>{config.symbol}</span>
      {showLabel && (
        <span className={`${textSizeClasses[size]} font-medium text-cosmic-white`}>
          {config.name}
        </span>
      )}
    </div>
  );
}

export default ZodiacSign;
