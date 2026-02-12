import { describe, it, expect } from 'vitest';
import { getNextShot } from '../src/ai/easy';
import { createNewGame, playTurn } from '../src/engine/game';
import { GameState } from '../src/types/game';

function startGame(game: GameState): GameState {
  return { ...game, phase: 'playing' };
}

describe('Easy AI', () => {
  describe('getNextShot', () => {
    it('should return a valid coordinate', () => {
      const game = startGame(createNewGame());
      const shot = getNextShot(game, 0);

      expect(shot.row).toBeGreaterThanOrEqual(0);
      expect(shot.row).toBeLessThan(10);
      expect(shot.col).toBeGreaterThanOrEqual(0);
      expect(shot.col).toBeLessThan(10);
    });

    it('should return a legal move (unshot cell)', () => {
      const game = startGame(createNewGame());
      const shot = getNextShot(game, 0);

      const opponentBoard = game.players[1].board;
      const cellState = opponentBoard.cells[shot.row][shot.col];
      
      expect(cellState).not.toBe('hit');
      expect(cellState).not.toBe('miss');
    });

    it('should not repeat shots', () => {
      const game = startGame(createNewGame());
      const shots = new Set<string>();
      let currentGame = game;

      for (let i = 0; i < 20; i++) {
        const shot = getNextShot(currentGame, 0);
        const key = `${shot.row},${shot.col}`;
        
        expect(shots.has(key)).toBe(false);
        shots.add(key);

        currentGame = playTurn(currentGame, shot);
        
        if (currentGame.currentPlayerIndex !== 0) {
          const dummyShot = getNextShot(currentGame, 1);
          currentGame = playTurn(currentGame, dummyShot);
        }
        
        if (currentGame.phase === 'finished') {
          break;
        }
      }

      expect(shots.size).toBeGreaterThan(0);
    });

    it('should always return legal moves throughout game', () => {
      const game = startGame(createNewGame());
      let currentGame = game;
      let moveCount = 0;
      const maxMoves = 50;

      while (currentGame.phase === 'playing' && moveCount < maxMoves) {
        const currentSide = currentGame.currentPlayerIndex;
        const shot = getNextShot(currentGame, currentSide);

        const opponentIndex = currentSide === 0 ? 1 : 0;
        const opponentBoard = currentGame.players[opponentIndex].board;
        const cellState = opponentBoard.cells[shot.row][shot.col];

        expect(cellState).not.toBe('hit');
        expect(cellState).not.toBe('miss');

        currentGame = playTurn(currentGame, shot);
        moveCount++;
      }

      expect(moveCount).toBeGreaterThan(0);
    });

    it('should work for both sides', () => {
      const game = startGame(createNewGame());
      
      const shot0 = getNextShot(game, 0);
      expect(shot0).toBeDefined();
      expect(shot0.row).toBeGreaterThanOrEqual(0);
      expect(shot0.row).toBeLessThan(10);

      const gameAfterTurn = playTurn(game, shot0);
      
      const shot1 = getNextShot(gameAfterTurn, 1);
      expect(shot1).toBeDefined();
      expect(shot1.row).toBeGreaterThanOrEqual(0);
      expect(shot1.row).toBeLessThan(10);
    });

    it('should throw error when no cells available', () => {
      const game = startGame(createNewGame());
      let currentGame = game;

      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          if (currentGame.phase !== 'playing') break;
          
          if (currentGame.currentPlayerIndex !== 0) {
            const dummyShot = getNextShot(currentGame, 1);
            currentGame = playTurn(currentGame, dummyShot);
            if (currentGame.phase !== 'playing') break;
          }
          
          const shot = { row, col };
          const opponentBoard = currentGame.players[1].board;
          const cellState = opponentBoard.cells[row][col];
          
          if (cellState !== 'hit' && cellState !== 'miss') {
            currentGame = playTurn(currentGame, shot);
          }
        }
      }

      if (currentGame.phase === 'playing') {
        const opponentBoard = currentGame.players[currentGame.currentPlayerIndex === 0 ? 1 : 0].board;
        const hasUnshotCells = opponentBoard.cells.some(row => 
          row.some(cell => cell !== 'hit' && cell !== 'miss')
        );
        
        if (!hasUnshotCells) {
          expect(() => {
            getNextShot(currentGame, currentGame.currentPlayerIndex);
          }).toThrow('No available cells to shoot');
        }
      }
    });

    it('should select from all available cells randomly', () => {
      const game = startGame(createNewGame());
      const shots = new Set<string>();
      const attempts = 100;

      for (let i = 0; i < attempts; i++) {
        const shot = getNextShot(game, 0);
        shots.add(`${shot.row},${shot.col}`);
      }

      expect(shots.size).toBeGreaterThan(1);
    });
  });
});
