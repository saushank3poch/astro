import React from 'react';
import type { ChineseElement } from '@/types';

interface ElementIndicatorProps {
  element: ChineseElement;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const elementConfig = {
  metal: {
    color: 'element-metal',
    bgColor: 'bg-element-metal',
    textColor: 'text-cosmic-void',
    label: 'Metal',
    icon: '⚪',
  },
  wood: {
    color: 'element-wood',
    bgColor: 'bg-element-wood',
    textColor: 'text-white',
    label: 'Wood',
    icon: '🌳',
  },
  water: {
    color: 'element-water',
    bgColor: 'bg-element-water',
    textColor: 'text-white',
    label: 'Water',
    icon: '💧',
  },
  fire: {
    color: 'element-fire',
    bgColor: 'bg-element-fire',
    textColor: 'text-white',
    label: 'Fire',
    icon: '🔥',
  },
  earth: {
    color: 'element-earth',
    bgColor: 'bg-element-earth',
    textColor: 'text-white',
    label: 'Earth',
    icon: '🏔️',
  },
};

export function ElementIndicator({ element, size = 'md', showLabel = true }: ElementIndicatorProps) {
  const config = elementConfig[element];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
    >
      <span>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

export default ElementIndicator;
