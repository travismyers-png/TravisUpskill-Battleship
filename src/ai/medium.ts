import { GameState, Coord } from '../types/game';

/**
 * Gets the next shot for the medium AI player
 * Uses hunt/target strategy: hunts randomly until hit, then targets adjacent cells
 */
export function getNextShot(game: GameState, side: 0 | 1): Coord {
  const opponentIndex = side === 0 ? 1 : 0;
  const opponentBoard = game.players[opponentIndex].board;

  const targetCells = findTargetCells(opponentBoard);
  
  if (targetCells.length > 0) {
    const randomIndex = Math.floor(Math.random() * targetCells.length);
    return targetCells[randomIndex];
  }

  const availableCells = findAvailableCells(opponentBoard);
  
  if (availableCells.length === 0) {
    throw new Error('No available cells to shoot');
  }

  const randomIndex = Math.floor(Math.random() * availableCells.length);
  return availableCells[randomIndex];
}

/**
 * Finds cells adjacent to hits that haven't been shot yet (target mode)
 */
function findTargetCells(board: { size: number; cells: string[][] }): Coord[] {
  const targets: Coord[] = [];
  const targetSet = new Set<string>();

  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      if (board.cells[row][col] === 'hit') {
        const neighbors = getNeighbors(row, col, board.size);
        
        for (const neighbor of neighbors) {
          const cellState = board.cells[neighbor.row][neighbor.col];
          if (cellState !== 'hit' && cellState !== 'miss') {
            const key = `${neighbor.row},${neighbor.col}`;
            if (!targetSet.has(key)) {
              targetSet.add(key);
              targets.push(neighbor);
            }
          }
        }
      }
    }
  }

  return targets;
}

/**
 * Gets orthogonal neighbors (up, down, left, right)
 */
function getNeighbors(row: number, col: number, boardSize: number): Coord[] {
  const neighbors: Coord[] = [];
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  for (const dir of directions) {
    const newRow = row + dir.row;
    const newCol = col + dir.col;
    
    if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }

  return neighbors;
}

/**
 * Finds all unshot cells (hunt mode)
 */
function findAvailableCells(board: { size: number; cells: string[][] }): Coord[] {
  const available: Coord[] = [];

  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      const cellState = board.cells[row][col];
      if (cellState !== 'hit' && cellState !== 'miss') {
        available.push({ row, col });
      }
    }
  }

  return available;
}
