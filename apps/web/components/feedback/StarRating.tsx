'use client';

import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;
  className?: string;
}

const sizeClasses = {
  small: 'w-4 h-4',
  medium: 'w-6 h-6',
  large: 'w-8 h-8',
};

export default function StarRating({
  rating,
  onChange,
  size = 'medium',
  readonly = false,
  className = '',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value: number) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= displayRating;

        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => !readonly && setHoverRating(value)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            disabled={readonly}
            className={`
              transition-all
              ${!readonly ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              ${filled ? 'text-yellow-400' : 'text-gray-600'}
            `}
          >
            {filled ? (
              <StarIcon className={sizeClasses[size]} />
            ) : (
              <StarOutlineIcon className={sizeClasses[size]} />
            )}
          </button>
        );
      })}
    </div>
  );
}
