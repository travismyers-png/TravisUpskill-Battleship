import React from 'react';
import { Coord } from '@/types/game';
import { getShipSprite } from './ShipSprites';

export type BoardSectionProps = {
  testId: string;
  title: string;
  board: { size: number; cells: string[][] };
  ships: { name?: string; coords: Coord[] }[];
  showShips: boolean;
  onCellClick: (row: number, col: number) => void;
  clickable: boolean;
  showShipsRemaining: boolean;
  previewCoords?: Coord[];
  previewValid?: boolean;
  onCellHover?: (row: number, col: number) => void;
  onBoardLeave?: () => void;
  isEnemy?: boolean;
  cursorCoord?: Coord | null;
  placedCells?: Set<string>;
};

export default function BoardSection({
  testId,
  title,
  board,
  ships,
  showShips,
  onCellClick,
  clickable,
  showShipsRemaining,
  previewCoords = [],
  previewValid = false,
  onCellHover,
  onBoardLeave,
  isEnemy = false,
  cursorCoord,
  placedCells,
}: BoardSectionProps) {
  return (
    <div data-testid={testId}>
      <h2 className="text-xl font-bold mb-4 text-center" style={{ color: 'var(--bat-text)' }}>{title}</h2>
      {showShipsRemaining && (
        <p className="text-center text-sm mb-2 font-semibold" style={{ color: 'var(--bp-line-major)' }}>
          Ships remaining: {countRemainingShips(board, ships)}
        </p>
      )}
      <Board
        board={board}
        ships={ships}
        showShips={showShips}
        onCellClick={onCellClick}
        clickable={clickable}
        previewCoords={previewCoords}
        previewValid={previewValid}
        onCellHover={onCellHover}
        onBoardLeave={onBoardLeave}
        isEnemy={isEnemy}
        cursorCoord={cursorCoord}
        placedCells={placedCells}
      />
    </div>
  );
}

function countRemainingShips(
  board: { cells: string[][] },
  ships: { coords: Coord[] }[],
): number {
  return ships.filter(
    (ship) =>
      ship.coords.length > 0 &&
      !ship.coords.every((c) => board.cells[c.row][c.col] === 'hit'),
  ).length;
}

function Board({
  board,
  ships,
  showShips,
  onCellClick,
  clickable,
  previewCoords = [],
  previewValid = false,
  onCellHover,
  onBoardLeave,
  isEnemy = false,
  cursorCoord,
  placedCells,
}: {
  board: { size: number; cells: string[][] };
  ships: { name?: string; coords: Coord[] }[];
  showShips: boolean;
  onCellClick: (row: number, col: number) => void;
  clickable: boolean;
  previewCoords?: Coord[];
  previewValid?: boolean;
  onCellHover?: (row: number, col: number) => void;
  onBoardLeave?: () => void;
  isEnemy?: boolean;
  cursorCoord?: Coord | null;
  placedCells?: Set<string>;
}) {
  const CELL_SIZE = 32; // 2rem = 32px
  const INSET = 3; // px inset so sprites don't touch grid lines
  const previewSet = new Set(previewCoords.map((c) => `${c.row},${c.col}`));

  // Compute sunk status per ship
  const shipSunk = ships.map(
    (ship) =>
      ship.coords.length > 0 &&
      ship.coords.every((c) => board.cells[c.row]?.[c.col] === 'hit'),
  );

  // Build set of coords belonging to sunk ships (for enemy cell-sunk styling)
  const sunkCellSet = new Set<string>();
  ships.forEach((ship, idx) => {
    if (shipSunk[idx]) {
      for (const c of ship.coords) {
        sunkCellSet.add(`${c.row},${c.col}`);
      }
    }
  });

  const colLabels = Array.from({ length: board.size }, (_, i) => i + 1);
  const rowLabels = Array.from({ length: board.size }, (_, i) =>
    String.fromCharCode(65 + i),
  );

  return (
    <div className="bp-board inline-block relative" onMouseLeave={onBoardLeave}>
      {/* Ship sprite overlay – player board only, below cell content */}
      {showShips && !isEnemy && (
        <div
          className="board-overlay"
          style={{
            position: 'absolute',
            // offset by padding (0.5rem=8px) + label row/col (2rem=32px)
            left: 8 + CELL_SIZE,
            top: 8 + CELL_SIZE,
            width: board.size * CELL_SIZE,
            height: board.size * CELL_SIZE,
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          {ships.map((ship, idx) => {
            if (!ship.name || ship.coords.length === 0) return null;

            const rows = ship.coords.map((c) => c.row);
            const cols = ship.coords.map((c) => c.col);
            const minRow = Math.min(...rows);
            const minCol = Math.min(...cols);
            const isHorizontal = rows.every((r) => r === rows[0]);
            const isVertical = cols.every((c) => c === cols[0]);
            const length = ship.coords.length;

            const SpriteComponent = getShipSprite(ship.name);
            const isSunk = shipSunk[idx];

            // Always size the sprite container as a horizontal strip
            // (wide × 1-cell tall) so the SVG fills the full ship length.
            // For vertical ships we rotate the container 90° into place.
            const spanPx = length * CELL_SIZE - INSET * 2;
            const thickPx = CELL_SIZE - INSET * 2;

            let leftPx: number;
            let topPx: number;
            let transform: string | undefined;

            if (isVertical && !isHorizontal) {
              // Position so that after a 90° rotation around top-left the
              // sprite lands exactly over the vertical ship cells.
              leftPx = minCol * CELL_SIZE + INSET;
              topPx = minRow * CELL_SIZE + INSET;
              transform = `rotate(90deg) translateX(0px) translateY(-${thickPx}px)`;
            } else {
              leftPx = minCol * CELL_SIZE + INSET;
              topPx = minRow * CELL_SIZE + INSET;
              transform = undefined;
            }

            return (
              <div
                key={`ship-sprite-${idx}`}
                className={`${isSunk ? 'sprite-sunk' : ''}${placedCells && ship.coords.some(c => placedCells.has(`${c.row},${c.col}`)) ? ' ship-sprite-just-placed' : ''}`.trim() || undefined}
                style={{
                  position: 'absolute',
                  left: leftPx,
                  top: topPx,
                  width: spanPx,
                  height: thickPx,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transformOrigin: 'top left',
                  ...(transform ? { transform } : {}),
                  ...(isSunk ? { zIndex: 35 } : {}),
                }}
              >
                <SpriteComponent className="icon-blueprint" sunk={isSunk} />
              </div>
            );
          })}
        </div>
      )}
      <div className="grid" style={{ gridTemplateColumns: `2rem repeat(${board.size}, 2rem)`, gap: 0 }}>
        {/* Top-left empty corner */}
        <div className="bp-label" />
        {/* Column headers 1-10 */}
        {colLabels.map((label) => (
          <div key={`col-${label}`} className="bp-label">
            {label}
          </div>
        ))}
        {/* Rows with row label + cells */}
        {board.cells.map((row, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {/* Row label A-J */}
            <div className="bp-label">
              {rowLabels[rowIndex]}
            </div>
            {row.map((cell, colIndex) => {
              let cellClass = 'bp-cell';
              let content = '';

              // Major grid lines every 5 cells (0-indexed: col 4 and row 4)
              if (colIndex === 4) cellClass += ' bp-cell-major-right';
              if (rowIndex === 4) cellClass += ' bp-cell-major-bottom';

              const isSunkCell = sunkCellSet.has(`${rowIndex},${colIndex}`);
              if (cell === 'hit') {
                cellClass += ' bp-cell-hit';
                if (isSunkCell) {
                  cellClass += ' cell-sunk';
                }
                content = isSunkCell ? '✸' : '✕';
              } else if (cell === 'miss') {
                cellClass += ' bp-cell-miss';
                content = '•';
              } else if (cell === 'ship' && showShips) {
                cellClass += ' bp-cell-ship';
                if (placedCells?.has(`${rowIndex},${colIndex}`)) {
                  cellClass += ' bp-cell-just-placed';
                }
              }

              const isPreview = previewSet.has(`${rowIndex},${colIndex}`);
              if (isPreview && cell !== 'hit' && cell !== 'miss') {
                cellClass += previewValid
                  ? ' bp-cell-preview-valid'
                  : ' bp-cell-preview-invalid';
              }

              if (clickable && cell !== 'hit' && cell !== 'miss') {
                cellClass += isEnemy ? ' bp-cell-clickable-enemy' : ' bp-cell-clickable';
              }

              if (cursorCoord && cursorCoord.row === rowIndex && cursorCoord.col === colIndex) {
                cellClass += isEnemy ? ' bp-cell-cursor-enemy' : ' bp-cell-cursor';
              }

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  data-testid={`cell-${rowIndex}-${colIndex}`}
                  onClick={() => clickable && onCellClick(rowIndex, colIndex)}
                  onMouseEnter={() => onCellHover?.(rowIndex, colIndex)}
                  className={cellClass}
                  style={{
                    position: 'relative',
                    ...(cell === 'hit' || cell === 'miss' ? { zIndex: 30 } : {}),
                  }}
                >
                  {content ? <span className={isSunkCell ? 'marker-sunk' : undefined} style={{ position: 'relative', zIndex: 40 }}>{content}</span> : null}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
