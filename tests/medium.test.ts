import { describe, it, expect } from 'vitest';
import { getNextShot } from '../src/ai/medium';
import { createNewGame, playTurn } from '../src/engine/game';
import { placeShip } from '../src/engine/placement';
import { Board, GameState, Ship } from '../src/types/game';

function startGame(game: GameState): GameState {
  return { ...game, phase: 'playing' };
}

function createEmptyBoard(size: number = 10): Board {
  return {
    size,
    cells: Array(size).fill(null).map(() => Array(size).fill('empty')),
  };
}

function createShip(id: string, coords: { row: number; col: number }[]): Ship {
  return {
    id,
    name: `Ship ${id}`,
    length: coords.length,
    coords,
    hits: Array(coords.length).fill(false),
  };
}

describe('Medium AI (hunt/target)', () => {
  describe('getNextShot', () => {
    it('should return a valid coordinate', () => {
      const game = startGame(createNewGame());
      const shot = getNextShot(game, 0);

      expect(shot.row).toBeGreaterThanOrEqual(0);
      expect(shot.row).toBeLessThan(10);
      expect(shot.col).toBeGreaterThanOrEqual(0);
      expect(shot.col).toBeLessThan(10);
    });

    it('should target adjacent cells after a hit', () => {
      const game = startGame(createNewGame());
      
      const gameAfterHit = playTurn(game, { row: 5, col: 5 });
      
      const hitCell = gameAfterHit.players[1].board.cells[5][5];
      
      if (hitCell === 'hit') {
        if (gameAfterHit.currentPlayerIndex !== 0) {
          const dummyShot = getNextShot(gameAfterHit, 1);
          const backToPlayer0 = playTurn(gameAfterHit, dummyShot);
          
          const nextShot = getNextShot(backToPlayer0, 0);
          
          const isAdjacent = 
            (nextShot.row === 5 && (nextShot.col === 4 || nextShot.col === 6)) ||
            (nextShot.col === 5 && (nextShot.row === 4 || nextShot.row === 6));
          
          expect(isAdjacent).toBe(true);
        } else {
          const nextShot = getNextShot(gameAfterHit, 0);
          
          const isAdjacent = 
            (nextShot.row === 5 && (nextShot.col === 4 || nextShot.col === 6)) ||
            (nextShot.col === 5 && (nextShot.row === 4 || nextShot.row === 6));
          
          expect(isAdjacent).toBe(true);
        }
      }
    });

    it('should not repeat shots', () => {
      const game = startGame(createNewGame());
      const shotsPlayer0 = new Set<string>();
      const shotsPlayer1 = new Set<string>();
      let currentGame = game;

      for (let i = 0; i < 30; i++) {
        if (currentGame.phase !== 'playing') break;
        
        const currentSide = currentGame.currentPlayerIndex;
        const shot = getNextShot(currentGame, currentSide);
        const key = `${shot.row},${shot.col}`;
        
        if (currentSide === 0) {
          expect(shotsPlayer0.has(key)).toBe(false);
          shotsPlayer0.add(key);
        } else {
          expect(shotsPlayer1.has(key)).toBe(false);
          shotsPlayer1.add(key);
        }

        currentGame = playTurn(currentGame, shot);
      }

      expect(shotsPlayer0.size + shotsPlayer1.size).toBeGreaterThan(0);
    });

    it('should fall back to hunt mode when no targets available', () => {
      const game = startGame(createNewGame());
      
      let currentGame = playTurn(game, { row: 0, col: 0 });
      
      if (currentGame.players[1].board.cells[0][0] === 'miss') {
        const shot = getNextShot(currentGame, currentGame.currentPlayerIndex);
        expect(shot).toBeDefined();
        expect(shot.row).toBeGreaterThanOrEqual(0);
        expect(shot.row).toBeLessThan(10);
      }
    });

    it('should prioritize targeting over hunting when hits exist', () => {
      const game = startGame(createNewGame());
      let currentGame = game;
      let foundHit = false;
      let testedTargeting = false;

      for (let i = 0; i < 50 && !testedTargeting; i++) {
        if (currentGame.phase !== 'playing') break;
        
        const currentSide = currentGame.currentPlayerIndex;
        const shot = getNextShot(currentGame, currentSide);
        currentGame = playTurn(currentGame, shot);
        
        const opponentIndex = currentSide === 0 ? 1 : 0;
        const opponentBoard = currentGame.players[opponentIndex].board;
        
        const hasHits = opponentBoard.cells.some(row => row.some(cell => cell === 'hit'));
        
        if (hasHits && !foundHit) {
          foundHit = true;
        }
        
        if (foundHit && currentGame.phase === 'playing') {
          if (currentGame.currentPlayerIndex === currentSide) {
            const nextShot = getNextShot(currentGame, currentSide);
            
            let isAdjacentToHit = false;
            for (let r = 0; r < opponentBoard.size; r++) {
              for (let c = 0; c < opponentBoard.size; c++) {
                if (opponentBoard.cells[r][c] === 'hit') {
                  const isAdjacent = 
                    (nextShot.row === r && Math.abs(nextShot.col - c) === 1) ||
                    (nextShot.col === c && Math.abs(nextShot.row - r) === 1);
                  if (isAdjacent) {
                    isAdjacentToHit = true;
                    break;
                  }
                }
              }
              if (isAdjacentToHit) break;
            }
            
            const hasAvailableTargets = opponentBoard.cells.some((row, r) =>
              row.some((cell, c) => {
                if (cell !== 'empty' && cell !== 'ship') return false;
                
                const neighbors = [
                  { row: r - 1, col: c },
                  { row: r + 1, col: c },
                  { row: r, col: c - 1 },
                  { row: r, col: c + 1 },
                ];
                
                return neighbors.some(n => 
                  n.row >= 0 && n.row < opponentBoard.size &&
                  n.col >= 0 && n.col < opponentBoard.size &&
                  opponentBoard.cells[n.row][n.col] === 'hit'
                );
              })
            );
            
            if (hasAvailableTargets) {
              expect(isAdjacentToHit).toBe(true);
            }
            
            testedTargeting = true;
          }
        }
      }
    });

    it('should work throughout an entire game', () => {
      const game = startGame(createNewGame());
      let currentGame = game;
      let turnCount = 0;
      const maxTurns = 200;

      while (currentGame.phase === 'playing' && turnCount < maxTurns) {
        const shot = getNextShot(currentGame, currentGame.currentPlayerIndex);
        
        const opponentIndex = currentGame.currentPlayerIndex === 0 ? 1 : 0;
        const opponentBoard = currentGame.players[opponentIndex].board;
        const cellState = opponentBoard.cells[shot.row][shot.col];
        
        expect(cellState).not.toBe('hit');
        expect(cellState).not.toBe('miss');
        
        currentGame = playTurn(currentGame, shot);
        turnCount++;
      }

      expect(turnCount).toBeGreaterThan(0);
    });

    it('should only target orthogonal neighbors, not diagonals', () => {
      const game = startGame(createNewGame());
      
      const gameWithHit = playTurn(game, { row: 5, col: 5 });
      
      if (gameWithHit.players[1].board.cells[5][5] === 'hit') {
        let testGame = gameWithHit;
        
        if (testGame.currentPlayerIndex !== 0) {
          const dummyShot = getNextShot(testGame, 1);
          testGame = playTurn(testGame, dummyShot);
        }
        
        for (let i = 0; i < 10; i++) {
          if (testGame.phase !== 'playing') break;
          
          const shot = getNextShot(testGame, 0);
          
          const isDiagonal = 
            (shot.row === 4 && shot.col === 4) ||
            (shot.row === 4 && shot.col === 6) ||
            (shot.row === 6 && shot.col === 4) ||
            (shot.row === 6 && shot.col === 6);
          
          if (isDiagonal) {
            const opponentBoard = testGame.players[1].board;
            const hasOrthogonalTargets = 
              (opponentBoard.cells[4][5] !== 'hit' && opponentBoard.cells[4][5] !== 'miss') ||
              (opponentBoard.cells[6][5] !== 'hit' && opponentBoard.cells[6][5] !== 'miss') ||
              (opponentBoard.cells[5][4] !== 'hit' && opponentBoard.cells[5][4] !== 'miss') ||
              (opponentBoard.cells[5][6] !== 'hit' && opponentBoard.cells[5][6] !== 'miss');
            
            expect(hasOrthogonalTargets).toBe(false);
          }
          
          testGame = playTurn(testGame, shot);
          
          if (testGame.currentPlayerIndex !== 0) {
            const dummyShot = getNextShot(testGame, 1);
            testGame = playTurn(testGame, dummyShot);
          }
        }
      }
    });
  });
});
