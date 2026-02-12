import React from 'react';

type BatEmblemProps = {
  size?: number;
  strokeWidth?: number;
  strokeDasharray?: string;
};

/**
 * Sleek angular bat emblem — swept-back wings with pointed tips,
 * compact body, ear points. Original design inspired by modern angular style.
 * viewBox 0 0 256 128 for wide aspect ratio, crisp at 14–20px.
 */
const BAT_PATH =
  'M128 16 L122 4 L118 20 L108 14 L104 28 L72 18 L56 40 L40 36 L4 68 L52 62 L44 78 L76 68 L88 96 L104 72 L116 88 L128 76 L140 88 L152 72 L168 96 L180 68 L212 78 L204 62 L252 68 L216 36 L200 40 L184 18 L152 28 L148 14 L138 20 L134 4 Z';

export function BatEmblem({
  size = 16,
  strokeWidth = 6,
  strokeDasharray,
}: BatEmblemProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 128"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      shapeRendering="geometricPrecision"
      className="icon-blueprint"
    >
      {/* Subtle fill silhouette behind outline */}
      <path d={BAT_PATH} fill="currentColor" opacity={0.18} stroke="none" />
      {/* Crisp outline on top */}
      <path
        d={BAT_PATH}
        vectorEffect="non-scaling-stroke"
        strokeDasharray={strokeDasharray}
      />
    </svg>
  );
}

/** Ship-specific BatEmblem variants */
const SHIP_VARIANTS: Record<string, React.FC> = {
  Destroyer:  () => <BatEmblem size={14} strokeWidth={7} />,
  Cruiser:    () => <BatEmblem size={16} strokeWidth={6} strokeDasharray="8 4" />,
  Submarine:  () => <BatEmblem size={16} strokeWidth={6} />,
  Battleship: () => <BatEmblem size={18} strokeWidth={7} />,
  Carrier:    () => <BatEmblem size={20} strokeWidth={6} />,
};

export function getShipIcon(shipName: string): React.FC | null {
  return SHIP_VARIANTS[shipName] ?? null;
}
