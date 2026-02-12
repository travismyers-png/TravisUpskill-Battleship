import { describe, it, expect } from 'vitest';
import { attack } from '../src/engine/attack';
import { placeShip } from '../src/engine/placement';
import { Board, Ship } from '../src/types/game';

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

describe('Attack mechanics', () => {
  describe('attack', () => {
    it('should register a hit on a ship', () => {
      const board = createEmptyBoard();
      const boardWithShip = placeShip(board, { row: 0, col: 0 }, 3, 'horizontal');
      const ships = [createShip('1', [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ])];

      const result = attack(boardWithShip, ships, { row: 0, col: 0 });

      expect(result.outcome).toBe('hit');
      expect(result.board.cells[0][0]).toBe('hit');
    });

    it('should register a miss on empty cell', () => {
      const board = createEmptyBoard();
      const boardWithShip = placeShip(board, { row: 0, col: 0 }, 3, 'horizontal');
      const ships = [createShip('1', [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ])];

      const result = attack(boardWithShip, ships, { row: 5, col: 5 });

      expect(result.outcome).toBe('miss');
      expect(result.board.cells[5][5]).toBe('miss');
    });

    it('should detect a sunk ship', () => {
      const board = createEmptyBoard();
      const boardWithShip = placeShip(board, { row: 0, col: 0 }, 2, 'horizontal');
      const ships = [createShip('1', [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
      ])];

      const result1 = attack(boardWithShip, ships, { row: 0, col: 0 });
      expect(result1.outcome).toBe('hit');

      const result2 = attack(result1.board, ships, { row: 0, col: 1 });
      expect(result2.outcome).toBe('sunk');
      expect(result2.sunkShip).toBeDefined();
      expect(result2.sunkShip?.id).toBe('1');
    });

    it('should reject repeat attack on hit cell', () => {
      const board = createEmptyBoard();
      const boardWithShip = placeShip(board, { row: 0, col: 0 }, 3, 'horizontal');
      const ships = [createShip('1', [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ])];

      const result1 = attack(boardWithShip, ships, { row: 0, col: 0 });
      expect(result1.outcome).toBe('hit');

      const result2 = attack(result1.board, ships, { row: 0, col: 0 });
      expect(result2.outcome).toBe('invalid');
    });

    it('should reject repeat attack on miss cell', () => {
      const board = createEmptyBoard();
      const ships: Ship[] = [];

      const result1 = attack(board, ships, { row: 5, col: 5 });
      expect(result1.outcome).toBe('miss');

      const result2 = attack(result1.board, ships, { row: 5, col: 5 });
      expect(result2.outcome).toBe('invalid');
    });

    it('should reject out of bounds attack', () => {
      const board = createEmptyBoard();
      const ships: Ship[] = [];

      const result = attack(board, ships, { row: 10, col: 10 });
      expect(result.outcome).toBe('invalid');
    });

    it('should not mutate original board', () => {
      const board = createEmptyBoard();
      const boardWithShip = placeShip(board, { row: 0, col: 0 }, 3, 'horizontal');
      const ships = [createShip('1', [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ])];

      const result = attack(boardWithShip, ships, { row: 0, col: 0 });

      expect(boardWithShip.cells[0][0]).toBe('ship');
      expect(result.board.cells[0][0]).toBe('hit');
    });

    it('should handle multiple ships and sink only the hit one', () => {
      const board = createEmptyBoard();
      let currentBoard = placeShip(board, { row: 0, col: 0 }, 2, 'horizontal');
      currentBoard = placeShip(currentBoard, { row: 2, col: 0 }, 2, 'horizontal');

      const ships = [
        createShip('1', [{ row: 0, col: 0 }, { row: 0, col: 1 }]),
        createShip('2', [{ row: 2, col: 0 }, { row: 2, col: 1 }]),
      ];

      const result1 = attack(currentBoard, ships, { row: 0, col: 0 });
      expect(result1.outcome).toBe('hit');

      const result2 = attack(result1.board, ships, { row: 0, col: 1 });
      expect(result2.outcome).toBe('sunk');
      expect(result2.sunkShip?.id).toBe('1');

      const result3 = attack(result2.board, ships, { row: 2, col: 0 });
      expect(result3.outcome).toBe('hit');
    });
  });
});
