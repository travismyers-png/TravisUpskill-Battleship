import { GameState, Coord, Ship } from '../types/game';

const STANDARD_SHIP_LENGTHS = [5, 4, 3, 3, 2];

/**
 * Gets the next shot for the hard AI player
 * Uses probability-based targeting by scoring cells based on ship fit possibilities
 */
export function getNextShot(game: GameState, side: 0 | 1): Coord {
  const opponentIndex = side === 0 ? 1 : 0;
  const opponent = game.players[opponentIndex];
  const board = opponent.board;

  const remainingShipLengths = getRemainingShipLengths(board, opponent.ships);
  
  const scores = calculateCellScores(board, remainingShipLengths);
  
  return selectBestCell(scores);
}

/**
 * Determines which ship lengths are still unsunk
 */
function getRemainingShipLengths(
  board: { size: number; cells: string[][] },
  ships: Ship[]
): number[] {
  const remaining: number[] = [];
  
  for (const ship of ships) {
    const isSunk = ship.coords.every(coord => 
      board.cells[coord.row][coord.col] === 'hit'
    );
    
    if (!isSunk) {
      remaining.push(ship.length);
    }
  }
  
  return remaining;
}

/**
 * Calculates probability scores for each cell based on ship fit possibilities
 */
function calculateCellScores(
  board: { size: number; cells: string[][] },
  shipLengths: number[]
): Map<string, number> {
  const scores = new Map<string, number>();
  
  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      if (board.cells[row][col] !== 'hit' && board.cells[row][col] !== 'miss') {
        scores.set(`${row},${col}`, 0);
      }
    }
  }
  
  for (const length of shipLengths) {
    for (let row = 0; row < board.size; row++) {
      for (let col = 0; col < board.size; col++) {
        if (canPlaceShipAt(board, row, col, length, 'horizontal')) {
          for (let i = 0; i < length; i++) {
            const key = `${row},${col + i}`;
            if (scores.has(key)) {
              scores.set(key, scores.get(key)! + 1);
            }
          }
        }
        
        if (canPlaceShipAt(board, row, col, length, 'vertical')) {
          for (let i = 0; i < length; i++) {
            const key = `${row + i},${col}`;
            if (scores.has(key)) {
              scores.set(key, scores.get(key)! + 1);
            }
          }
        }
      }
    }
  }
  
  return scores;
}

/**
 * Checks if a ship of given length can fit at the position
 */
function canPlaceShipAt(
  board: { size: number; cells: string[][] },
  row: number,
  col: number,
  length: number,
  orientation: 'horizontal' | 'vertical'
): boolean {
  if (orientation === 'horizontal') {
    if (col + length > board.size) return false;
    
    for (let i = 0; i < length; i++) {
      const cell = board.cells[row][col + i];
      if (cell === 'miss') return false;
    }
    
    return true;
  } else {
    if (row + length > board.size) return false;
    
    for (let i = 0; i < length; i++) {
      const cell = board.cells[row + i][col];
      if (cell === 'miss') return false;
    }
    
    return true;
  }
}

/**
 * Selects the cell with the highest score, with random tie-breaking
 */
function selectBestCell(scores: Map<string, number>): Coord {
  if (scores.size === 0) {
    throw new Error('No available cells to shoot');
  }
  
  let maxScore = -1;
  const bestCells: Coord[] = [];
  
  for (const [key, score] of scores.entries()) {
    if (score > maxScore) {
      maxScore = score;
      bestCells.length = 0;
      const [row, col] = key.split(',').map(Number);
      bestCells.push({ row, col });
    } else if (score === maxScore) {
      const [row, col] = key.split(',').map(Number);
      bestCells.push({ row, col });
    }
  }
  
  const randomIndex = Math.floor(Math.random() * bestCells.length);
  return bestCells[randomIndex];
}
