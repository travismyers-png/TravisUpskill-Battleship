'use client';

import React, { useState } from 'react';

export type PortraitMood = 'neutral' | 'confident' | 'worried' | 'victorious' | 'defeated';

export type PortraitProps = {
  src: string;
  label: string;
  fallbackColor: string;
  isEnemy?: boolean;
  mood?: PortraitMood;
};

export default function Portrait({ src, label, fallbackColor, isEnemy = false, mood = 'neutral' }: PortraitProps) {
  const [failed, setFailed] = useState(false);

  const moodClass = mood !== 'neutral' ? ` portrait-mood portrait-mood-${mood}` : '';
  const containerClasses =
    `w-[80px] md:w-[110px] lg:w-[140px] header-avatar${isEnemy ? ' enemy' : ''}${moodClass}`;

  if (failed) {
    return (
      <div
        data-testid={`portrait-${label.toLowerCase()}`}
        role="img"
        aria-label={`${label} portrait (${mood})`}
        className={`${containerClasses} flex items-center justify-center text-white text-xs sm:text-sm font-bold`}
        style={{ backgroundColor: fallbackColor, aspectRatio: '3/4' }}
      >
        {label}
      </div>
    );
  }

  return (
    <div
      data-testid={`portrait-${label.toLowerCase()}`}
      className={containerClasses}
    >
      <img
        src={src}
        alt={`${label} portrait (${mood})`}
        className="w-full h-auto block"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
