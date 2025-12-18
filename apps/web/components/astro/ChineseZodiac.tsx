import React from 'react';
import type { ChineseZodiac as ChineseZodiacType } from '@/types';
import { Card, CardContent } from '@/components/ui';

interface ChineseZodiacProps {
  animal: ChineseZodiacType;
  year?: number;
  showDescription?: boolean;
}

const zodiacConfig: Record<ChineseZodiacType, { emoji: string; name: string; description: string }> = {
  rat: {
    emoji: '🐭',
    name: 'Rat',
    description: 'Quick-witted, resourceful, versatile, kind',
  },
  ox: {
    emoji: '🐂',
    name: 'Ox',
    description: 'Diligent, dependable, strong, determined',
  },
  tiger: {
    emoji: '🐅',
    name: 'Tiger',
    description: 'Brave, confident, competitive, unpredictable',
  },
  rabbit: {
    emoji: '🐰',
    name: 'Rabbit',
    description: 'Quiet, elegant, kind, responsible',
  },
  dragon: {
    emoji: '🐲',
    name: 'Dragon',
    description: 'Confident, intelligent, enthusiastic',
  },
  snake: {
    emoji: '🐍',
    name: 'Snake',
    description: 'Enigmatic, intelligent, wise',
  },
  horse: {
    emoji: '🐴',
    name: 'Horse',
    description: 'Animated, active, energetic',
  },
  goat: {
    emoji: '🐐',
    name: 'Goat',
    description: 'Calm, gentle, sympathetic',
  },
  monkey: {
    emoji: '🐵',
    name: 'Monkey',
    description: 'Sharp, smart, curious',
  },
  rooster: {
    emoji: '🐓',
    name: 'Rooster',
    description: 'Observant, hardworking, courageous',
  },
  dog: {
    emoji: '🐕',
    name: 'Dog',
    description: 'Lovely, honest, prudent',
  },
  pig: {
    emoji: '🐷',
    name: 'Pig',
    description: 'Compassionate, generous, diligent',
  },
};

export function ChineseZodiac({ animal, year, showDescription = true }: ChineseZodiacProps) {
  const config = zodiacConfig[animal];

  return (
    <div className="text-center">
      <div className="text-6xl mb-3">{config.emoji}</div>
      <h3 className="text-2xl font-bold text-cosmic-gold mb-1">{config.name}</h3>
      {year && <p className="text-sm text-cosmic-silver/70 mb-2">Year {year}</p>}
      {showDescription && (
        <p className="text-sm text-cosmic-silver/80 max-w-xs mx-auto">{config.description}</p>
      )}
    </div>
  );
}

export default ChineseZodiac;
