import React from 'react';
import { Ship } from '@/types/game';
import { STANDARD_SHIPS } from '@/shared/ships';
import { BatmobileBattleshipSprite } from './ShipSprites';

export type ShipSelectorProps = {
  ships: Ship[];
  selectedShipIndex: number | null;
  onSelectShip: (index: number) => void;
};

export default function ShipSelector({ ships, selectedShipIndex, onSelectShip }: ShipSelectorProps) {
  const placedCount = ships.filter(ship => ship.coords.length > 0).length;
  const totalShips = STANDARD_SHIPS.length;

  return (
    <div className="ship-selector">
      <h3 className="ship-selector-title">Select Ship</h3>
      <div className="text-center mb-2" style={{ color: 'var(--bat-accent)', fontSize: '0.75rem', fontWeight: 600 }}>
        {placedCount}/{totalShips} Ships Placed
      </div>
      <div className="ship-selector-list">
        {STANDARD_SHIPS.map((def, i) => {
          const placed = ships[i].coords.length > 0;
          const selected = selectedShipIndex === i;
          return (
            <button
              key={def.name}
              className={`ship-selector-item${selected ? ' selected' : ''}${placed ? ' placed' : ''}`}
              onClick={() => { if (!placed) onSelectShip(i); }}
              disabled={placed}
              aria-pressed={selected}
              aria-disabled={placed}
            >
              <span className="ship-selector-name">{def.name}</span>
              <span className="ship-selector-dots">
                {Array.from({ length: def.length }, (_, j) => (
                  <BatmobileBattleshipSprite key={j} className="icon-blueprint" sunk={false} />
                ))}
              </span>
              {placed && <span className="ship-selector-check" aria-label="Placed">&#x2713;</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
