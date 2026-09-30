"use client";

import { useState } from 'react';

export default function StarRating({ 
  rating = 0, 
  onRatingChange = null, 
  size = 20, 
  readOnly = false,
  showLabel = false 
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const labels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent!'
  };

  const currentScore = hoverRating || rating;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
      <div 
        style={{ display: 'inline-flex', gap: '2px', cursor: readOnly ? 'default' : 'pointer' }}
        onMouseLeave={() => !readOnly && setHoverRating(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= currentScore;
          return (
            <span
              key={star}
              onClick={() => !readOnly && onRatingChange && onRatingChange(star)}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              style={{
                fontSize: `${size}px`,
                color: filled ? '#F59E0B' : '#D1D5DB',
                transition: 'transform 0.15s ease, color 0.15s ease',
                transform: !readOnly && hoverRating === star ? 'scale(1.2)' : 'none',
                userSelect: 'none',
                lineHeight: 1
              }}
              title={readOnly ? `${rating} stars` : `${star} stars - ${labels[star]}`}
            >
              ★
            </span>
          );
        })}
      </div>
      {showLabel && (
        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: currentScore > 0 ? '#B45309' : '#6B7280', minWidth: '70px' }}>
          {labels[currentScore] || 'Select Rating'}
        </span>
      )}
    </div>
  );
}
