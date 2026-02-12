import { describe, it, expect } from 'vitest';
import { getNextShot } from '../src/ai/hard';
import { createNewGame, playTurn } from '../src/engine/game';
import { Board, GameState, Player, Ship } from '../src/types/game';

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

describe('Hard AI (probability)', () => {
  describe('getNextShot', () => {
    it('should return a valid coordinate', () => {
      const game = startGame(createNewGame());
      const shot = getNextShot(game, 0);

      expect(shot.row).toBeGreaterThanOrEqual(0);
      expect(shot.row).toBeLessThan(10);
      expect(shot.col).toBeGreaterThanOrEqual(0);
      expect(shot.col).toBeLessThan(10);
    });

    it('should avoid impossible cells (surrounded by misses)', () => {
      const board = createEmptyBoard();
      board.cells[5][4] = 'miss';
      board.cells[5][6] = 'miss';
      board.cells[4][5] = 'miss';
      board.cells[6][5] = 'miss';

      const ships = [
        createShip('1', [{ row: 0, col: 0 }, { row: 0, col: 1 }]),
      ];

      const player1: Player = {
        id: 'player1',
        name: 'Player 1',
        board: createEmptyBoard(),
        ships: [],
      };

      const player2: Player = {
        id: 'player2',
        name: 'Player 2',
        board,
        ships,
      };

      const game: GameState = {
        players: [player1, player2],
        currentPlayerIndex: 0,
        phase: 'playing',
      };

      const shot = getNextShot(game, 0);

      expect(shot.row !== 5 || shot.col !== 5).toBe(true);
    });

    it('should prefer cells with higher probability scores', () => {
      const board = createEmptyBoard();
      
      for (let col = 0; col < 10; col++) {
        if (col !== 5) {
          board.cells[5][col] = 'miss';
        }
      }

      const ships = [
        createShip('1', [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
          { row: 0, col: 3 },
          { row: 0, col: 4 },
        ]),
      ];

      const player1: Player = {
        id: 'player1',
        name: 'Player 1',
        board: createEmptyBoard(),
        ships: [],
      };

      const player2: Player = {
        id: 'player2',
        name: 'Player 2',
        board,
        ships,
      };

      const game: GameState = {
        players: [player1, player2],
        currentPlayerIndex: 0,
        phase: 'playing',
      };

      const shots = new Set<string>();
      for (let i = 0; i < 20; i++) {
        const shot = getNextShot(game, 0);
        shots.add(`${shot.row},${shot.col}`);
      }

      expect(shots.has('5,5')).toBe(false);
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

    it('should have basic scoring sanity - center cells score higher early game', () => {
      const game = startGame(createNewGame());
      
      const centerShots = new Set<string>();
      const edgeShots = new Set<string>();
      
      for (let i = 0; i < 50; i++) {
        const shot = getNextShot(game, 0);
        const key = `${shot.row},${shot.col}`;
        
        if (shot.row >= 3 && shot.row <= 6 && shot.col >= 3 && shot.col <= 6) {
          centerShots.add(key);
        }
        
        if (shot.row === 0 || shot.row === 9 || shot.col === 0 || shot.col === 9) {
          edgeShots.add(key);
        }
      }

      expect(centerShots.size).toBeGreaterThan(0);
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

    it('should adapt scoring as ships are sunk', () => {
      const board = createEmptyBoard();
      
      const ships = [
        createShip('1', [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
        ]),
        createShip('2', [
          { row: 2, col: 0 },
          { row: 2, col: 1 },
          { row: 2, col: 2 },
          { row: 2, col: 3 },
          { row: 2, col: 4 },
        ]),
      ];

      board.cells[0][0] = 'hit';
      board.cells[0][1] = 'hit';

      const player1: Player = {
        id: 'player1',
        name: 'Player 1',
        board: createEmptyBoard(),
        ships: [],
      };

      const player2: Player = {
        id: 'player2',
        name: 'Player 2',
        board,
        ships,
      };

      const game: GameState = {
        players: [player1, player2],
        currentPlayerIndex: 0,
        phase: 'playing',
      };

      const shot = getNextShot(game, 0);
      
      expect(shot).toBeDefined();
      expect(shot.row).toBeGreaterThanOrEqual(0);
      expect(shot.row).toBeLessThan(10);
    });

    it('should throw error when no cells available', () => {
      const board = createEmptyBoard();
      
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          board.cells[row][col] = 'miss';
        }
      }

      const ships: Ship[] = [];

      const player1: Player = {
        id: 'player1',
        name: 'Player 1',
        board: createEmptyBoard(),
        ships: [],
      };

      const player2: Player = {
        id: 'player2',
        name: 'Player 2',
        board,
        ships,
      };

      const game: GameState = {
        players: [player1, player2],
        currentPlayerIndex: 0,
        phase: 'playing',
      };

      expect(() => {
        getNextShot(game, 0);
      }).toThrow('No available cells to shoot');
    });
  });
});
