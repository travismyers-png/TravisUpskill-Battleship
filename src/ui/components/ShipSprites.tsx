import React from 'react';

/**
 * Returns a minimal outline motorcycle/vehicle SVG sprite for a given ship name.
 * Drawn horizontally (facing right) by default. viewBox is wide to span ship length.
 * Uses stroke="currentColor", fill="none", vectorEffect="non-scaling-stroke".
 *
 * When sunk=true, applies strokeDasharray for a "cracked" look.
 */

type ShipSpriteProps = {
  className?: string;
  sunk?: boolean;
};

const SUNK_DASH = '6 4';

/** Destroyer – length 2: compact sport bike silhouette */
function DestroyerSprite({ className, sunk }: ShipSpriteProps) {
  return (
    <svg
      viewBox="0 0 200 80"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={sunk ? SUNK_DASH : undefined}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Wheels */}
      <circle cx="40" cy="60" r="16" vectorEffect="non-scaling-stroke" />
      <circle cx="160" cy="60" r="16" vectorEffect="non-scaling-stroke" />
      {/* Frame */}
      <path d="M56 60 L80 30 L140 25 L176 60" vectorEffect="non-scaling-stroke" />
      {/* Seat */}
      <path d="M80 30 L100 22 L120 24" vectorEffect="non-scaling-stroke" />
      {/* Handlebars */}
      <path d="M140 25 L155 15 L165 18" vectorEffect="non-scaling-stroke" />
      {/* Engine block */}
      <rect x="75" y="38" width="30" height="16" rx="3" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Cruiser – length 3: touring cruiser bike */
function CruiserSprite({ className, sunk }: ShipSpriteProps) {
  return (
    <svg
      viewBox="0 0 300 80"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={sunk ? SUNK_DASH : undefined}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Wheels */}
      <circle cx="50" cy="60" r="16" vectorEffect="non-scaling-stroke" />
      <circle cx="250" cy="60" r="16" vectorEffect="non-scaling-stroke" />
      {/* Frame */}
      <path d="M66 60 L90 28 L230 24 L266 60" vectorEffect="non-scaling-stroke" />
      {/* Seat + backrest */}
      <path d="M100 28 L120 18 L170 16 L190 20" vectorEffect="non-scaling-stroke" />
      <path d="M100 28 L95 20" vectorEffect="non-scaling-stroke" />
      {/* Handlebars + windshield */}
      <path d="M230 24 L250 12 L260 16" vectorEffect="non-scaling-stroke" />
      <path d="M240 18 L245 6 L255 8" vectorEffect="non-scaling-stroke" />
      {/* Engine */}
      <rect x="110" y="36" width="40" height="18" rx="3" vectorEffect="non-scaling-stroke" />
      {/* Exhaust pipes */}
      <path d="M66 55 L40 50 L30 52" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Submarine – length 3: sleek café racer */
function SubmarineSprite({ className, sunk }: ShipSpriteProps) {
  return (
    <svg
      viewBox="0 0 300 80"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={sunk ? SUNK_DASH : undefined}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Wheels */}
      <circle cx="50" cy="60" r="16" vectorEffect="non-scaling-stroke" />
      <circle cx="250" cy="60" r="16" vectorEffect="non-scaling-stroke" />
      {/* Low-slung frame */}
      <path d="M66 60 L85 32 L240 28 L266 60" vectorEffect="non-scaling-stroke" />
      {/* Clip-on bars + fairing */}
      <path d="M240 28 L260 14 L270 18" vectorEffect="non-scaling-stroke" />
      <path d="M245 22 L265 10" vectorEffect="non-scaling-stroke" />
      {/* Seat – flat café style */}
      <path d="M100 30 L180 26" vectorEffect="non-scaling-stroke" />
      {/* Tank */}
      <ellipse cx="200" cy="30" rx="25" ry="10" vectorEffect="non-scaling-stroke" />
      {/* Engine */}
      <rect x="105" y="40" width="35" height="14" rx="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Battleship – length 4: heavy chopper */
function BattleshipSprite({ className, sunk }: ShipSpriteProps) {
  return (
    <svg
      viewBox="0 0 400 80"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={sunk ? SUNK_DASH : undefined}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Wheels */}
      <circle cx="60" cy="60" r="18" vectorEffect="non-scaling-stroke" />
      <circle cx="340" cy="60" r="18" vectorEffect="non-scaling-stroke" />
      {/* Extended frame – long fork */}
      <path d="M78 60 L110 30 L310 26 L358 60" vectorEffect="non-scaling-stroke" />
      {/* Ape-hanger handlebars */}
      <path d="M310 26 L330 8 L345 12" vectorEffect="non-scaling-stroke" />
      <path d="M330 8 L325 2" vectorEffect="non-scaling-stroke" />
      {/* Seat – stepped */}
      <path d="M120 30 L150 20 L200 18 L230 20 L250 26" vectorEffect="non-scaling-stroke" />
      {/* V-twin engine */}
      <path d="M150 38 L165 50 L180 38 L165 30 Z" vectorEffect="non-scaling-stroke" />
      <rect x="145" y="42" width="40" height="14" rx="3" vectorEffect="non-scaling-stroke" />
      {/* Exhaust */}
      <path d="M78 55 L45 48 L30 50 L20 48" vectorEffect="non-scaling-stroke" />
      <path d="M78 58 L50 54 L35 56" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Carrier – length 5: armored trike / heavy transport */
function CarrierSprite({ className, sunk }: ShipSpriteProps) {
  return (
    <svg
      viewBox="0 0 500 80"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={sunk ? SUNK_DASH : undefined}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Front wheel */}
      <circle cx="60" cy="60" r="18" vectorEffect="non-scaling-stroke" />
      {/* Rear dual wheels (trike) */}
      <circle cx="420" cy="60" r="18" vectorEffect="non-scaling-stroke" />
      <circle cx="460" cy="60" r="14" vectorEffect="non-scaling-stroke" />
      {/* Frame */}
      <path d="M78 60 L110 28 L400 24 L438 60" vectorEffect="non-scaling-stroke" />
      {/* Cargo platform */}
      <rect x="100" y="16" width="180" height="16" rx="4" vectorEffect="non-scaling-stroke" />
      {/* Windshield + bars */}
      <path d="M400 24 L420 8 L435 14" vectorEffect="non-scaling-stroke" />
      <path d="M410 16 L425 4" vectorEffect="non-scaling-stroke" />
      {/* Seat */}
      <path d="M300 24 L330 16 L370 18 L390 24" vectorEffect="non-scaling-stroke" />
      {/* Engine block – large */}
      <rect x="180" y="38" width="60" height="18" rx="4" vectorEffect="non-scaling-stroke" />
      {/* Exhaust */}
      <path d="M78 55 L40 48 L20 50 L8 48" vectorEffect="non-scaling-stroke" />
      {/* Rear axle */}
      <path d="M420 60 L460 60" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const SPRITE_MAP: Record<string, React.FC<ShipSpriteProps>> = {
  Destroyer: DestroyerSprite,
  Cruiser: CruiserSprite,
  Submarine: SubmarineSprite,
  Battleship: BattleshipSprite,
  Carrier: CarrierSprite,
};

/**
 * Returns the ship sprite component for a given ship name.
 * Falls back to a generic rectangle for unknown names.
 */
export function getShipSprite(shipName: string): React.FC<ShipSpriteProps> {
  return SPRITE_MAP[shipName] ?? GenericSprite;
}

function GenericSprite({ className, sunk }: ShipSpriteProps) {
  return (
    <svg
      viewBox="0 0 200 80"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={sunk ? SUNK_DASH : undefined}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x="10" y="20" width="180" height="40" rx="8" vectorEffect="non-scaling-stroke" />
      <circle cx="50" cy="60" r="14" vectorEffect="non-scaling-stroke" />
      <circle cx="150" cy="60" r="14" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
