import { Board, Coord, Ship } from '../types/game';

export type AttackResult = {
  board: Board;
  outcome: 'hit' | 'miss' | 'sunk' | 'invalid';
  sunkShip?: Ship;
};

/**
 * Attacks a coordinate on the board
 * Returns new board and attack outcome
 */
export function attack(
  board: Board,
  ships: Ship[],
  coord: Coord
): AttackResult {
  if (coord.row < 0 || coord.row >= board.size || coord.col < 0 || coord.col >= board.size) {
    return {
      board,
      outcome: 'invalid',
    };
  }

  const cellState = board.cells[coord.row][coord.col];

  if (cellState === 'hit' || cellState === 'miss') {
    return {
      board,
      outcome: 'invalid',
    };
  }

  const newCells = board.cells.map(row => [...row]);

  if (cellState === 'ship') {
    newCells[coord.row][coord.col] = 'hit';

    const newBoard = {
      size: board.size,
      cells: newCells,
    };

    const hitShip = findShipAtCoord(ships, coord);
    if (hitShip && isShipSunk(newBoard, hitShip)) {
      return {
        board: newBoard,
        outcome: 'sunk',
        sunkShip: hitShip,
      };
    }

    return {
      board: newBoard,
      outcome: 'hit',
    };
  }

  newCells[coord.row][coord.col] = 'miss';

  return {
    board: {
      size: board.size,
      cells: newCells,
    },
    outcome: 'miss',
  };
}

/**
 * Finds the ship at the given coordinate
 */
function findShipAtCoord(ships: Ship[], coord: Coord): Ship | undefined {
  return ships.find(ship =>
    ship.coords.some(c => c.row === coord.row && c.col === coord.col)
  );
}

/**
 * Checks if all cells of a ship have been hit
 */
function isShipSunk(board: Board, ship: Ship): boolean {
  return ship.coords.every(coord => board.cells[coord.row][coord.col] === 'hit');
}
