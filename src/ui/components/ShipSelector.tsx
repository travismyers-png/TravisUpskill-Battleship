import React from 'react';
import { Ship } from '@/types/game';
import { STANDARD_SHIPS } from '@/shared/ships';

export type ShipSelectorProps = {
  ships: Ship[];
  selectedShipIndex: number | null;
  onSelectShip: (index: number) => void;
};

export default function ShipSelector({ ships, selectedShipIndex, onSelectShip }: ShipSelectorProps) {
  return (
    <div className="ship-selector">
      <h3 className="ship-selector-title">Select Ship</h3>
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
                  <span key={j} className="ship-selector-dot" />
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
