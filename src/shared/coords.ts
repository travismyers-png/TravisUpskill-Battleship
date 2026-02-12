import { Coord, Orientation } from '../types/game';

/**
 * Computes the list of coordinates a ship occupies given a start position, length, and orientation.
 */
export function getShipCoords(
  start: Coord,
  length: number,
  orientation: Orientation
): Coord[] {
  const coords: Coord[] = [];

  for (let i = 0; i < length; i++) {
    if (orientation === 'horizontal') {
      coords.push({ row: start.row, col: start.col + i });
    } else {
      coords.push({ row: start.row + i, col: start.col });
    }
  }

  return coords;
}
