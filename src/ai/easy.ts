import { GameState, Coord } from '../types/game';

/**
 * Gets the next shot for the AI player
 * Returns a random unshot cell from the opponent's board
 */
export function getNextShot(game: GameState, side: 0 | 1): Coord {
  const opponentIndex = side === 0 ? 1 : 0;
  const opponentBoard = game.players[opponentIndex].board;

  const availableCells: Coord[] = [];

  for (let row = 0; row < opponentBoard.size; row++) {
    for (let col = 0; col < opponentBoard.size; col++) {
      const cellState = opponentBoard.cells[row][col];
      if (cellState !== 'hit' && cellState !== 'miss') {
        availableCells.push({ row, col });
      }
    }
  }

  if (availableCells.length === 0) {
    throw new Error('No available cells to shoot');
  }

  const randomIndex = Math.floor(Math.random() * availableCells.length);
  return availableCells[randomIndex];
}
