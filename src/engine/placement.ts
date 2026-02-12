import { Board, Coord, Orientation } from '../types/game';
import { getShipCoords } from '../shared/coords';

/**
 * Checks if a ship can be placed at the given position
 */
export function canPlaceShip(
  board: Board,
  start: Coord,
  length: number,
  orientation: Orientation
): boolean {
  const coords = getShipCoords(start, length, orientation);

  for (const coord of coords) {
    if (coord.row < 0 || coord.row >= board.size || coord.col < 0 || coord.col >= board.size) {
      return false;
    }

    if (board.cells[coord.row][coord.col] !== 'empty') {
      return false;
    }
  }

  return true;
}

/**
 * Places a ship on the board and returns a new board (immutable)
 */
export function placeShip(
  board: Board,
  start: Coord,
  length: number,
  orientation: Orientation
): Board {
  if (!canPlaceShip(board, start, length, orientation)) {
    throw new Error('Cannot place ship at this position');
  }

  const coords = getShipCoords(start, length, orientation);
  
  const newCells = board.cells.map(row => [...row]);
  
  for (const coord of coords) {
    newCells[coord.row][coord.col] = 'ship';
  }

  return {
    size: board.size,
    cells: newCells,
  };
}

