import { describe, it, expect } from 'vitest';
import { canPlaceShip, placeShip } from '../src/engine/placement';
import { Board } from '../src/types/game';

function createEmptyBoard(size: number = 10): Board {
  return {
    size,
    cells: Array(size).fill(null).map(() => Array(size).fill('empty')),
  };
}

describe('Ship placement', () => {
  describe('canPlaceShip', () => {
    it('should allow valid horizontal placement', () => {
      const board = createEmptyBoard();
      const result = canPlaceShip(board, { row: 0, col: 0 }, 3, 'horizontal');
      expect(result).toBe(true);
    });

    it('should allow valid vertical placement', () => {
      const board = createEmptyBoard();
      const result = canPlaceShip(board, { row: 0, col: 0 }, 3, 'vertical');
      expect(result).toBe(true);
    });

    it('should reject horizontal placement out of bounds', () => {
      const board = createEmptyBoard();
      const result = canPlaceShip(board, { row: 0, col: 8 }, 3, 'horizontal');
      expect(result).toBe(false);
    });

    it('should reject vertical placement out of bounds', () => {
      const board = createEmptyBoard();
      const result = canPlaceShip(board, { row: 8, col: 0 }, 3, 'vertical');
      expect(result).toBe(false);
    });

    it('should reject placement on negative coordinates', () => {
      const board = createEmptyBoard();
      const result = canPlaceShip(board, { row: -1, col: 0 }, 3, 'horizontal');
      expect(result).toBe(false);
    });

    it('should reject overlapping ships', () => {
      const board = createEmptyBoard();
      const boardWithShip = placeShip(board, { row: 0, col: 0 }, 3, 'horizontal');
      const result = canPlaceShip(boardWithShip, { row: 0, col: 2 }, 3, 'horizontal');
      expect(result).toBe(false);
    });
  });

  describe('placeShip', () => {
    it('should place ship horizontally', () => {
      const board = createEmptyBoard();
      const newBoard = placeShip(board, { row: 0, col: 0 }, 3, 'horizontal');
      
      expect(newBoard.cells[0][0]).toBe('ship');
      expect(newBoard.cells[0][1]).toBe('ship');
      expect(newBoard.cells[0][2]).toBe('ship');
      expect(newBoard.cells[0][3]).toBe('empty');
    });

    it('should place ship vertically', () => {
      const board = createEmptyBoard();
      const newBoard = placeShip(board, { row: 0, col: 0 }, 3, 'vertical');
      
      expect(newBoard.cells[0][0]).toBe('ship');
      expect(newBoard.cells[1][0]).toBe('ship');
      expect(newBoard.cells[2][0]).toBe('ship');
      expect(newBoard.cells[3][0]).toBe('empty');
    });

    it('should return new board without mutating original', () => {
      const board = createEmptyBoard();
      const newBoard = placeShip(board, { row: 0, col: 0 }, 3, 'horizontal');
      
      expect(board.cells[0][0]).toBe('empty');
      expect(newBoard.cells[0][0]).toBe('ship');
    });

    it('should throw error for invalid placement', () => {
      const board = createEmptyBoard();
      expect(() => {
        placeShip(board, { row: 0, col: 8 }, 3, 'horizontal');
      }).toThrow('Cannot place ship at this position');
    });

    it('should throw error for overlapping placement', () => {
      const board = createEmptyBoard();
      const boardWithShip = placeShip(board, { row: 0, col: 0 }, 3, 'horizontal');
      
      expect(() => {
        placeShip(boardWithShip, { row: 0, col: 2 }, 3, 'horizontal');
      }).toThrow('Cannot place ship at this position');
    });
  });
});
