import { describe, it, expect } from 'vitest';
import { createNewGame, playTurn, canPlay } from '../src/engine/game';
import { getNextShot as getEasyShot } from '../src/ai/easy';
import { getNextShot as getMediumShot } from '../src/ai/medium';
import { getNextShot as getHardShot } from '../src/ai/hard';
import { GameState } from '../src/types/game';

function startGame(game: GameState): GameState {
  return { ...game, phase: 'playing' };
}

describe('AI Integration Tests', () => {
  describe('Full game vs Easy AI', () => {
    it('should complete a full game with Easy AI', () => {
      const game = startGame(createNewGame());
      let currentGame = game;
      let turnCount = 0;
      const maxTurns = 300;
      const moves: string[] = [];

      while (currentGame.phase === 'playing' && turnCount < maxTurns) {
        const currentSide = currentGame.currentPlayerIndex;
        const shot = getEasyShot(currentGame, currentSide);
        
        const opponentIndex = currentSide === 0 ? 1 : 0;
        const opponentBoard = currentGame.players[opponentIndex].board;
        const cellState = opponentBoard.cells[shot.row][shot.col];
        
        expect(cellState).not.toBe('hit');
        expect(cellState).not.toBe('miss');
        
        moves.push(`Player ${currentSide}: (${shot.row},${shot.col})`);
        
        currentGame = playTurn(currentGame, shot);
        turnCount++;
      }

      expect(currentGame.phase).toBe('finished');
      expect(currentGame.winner).toBeDefined();
      expect(['player1', 'player2']).toContain(currentGame.winner);
      expect(turnCount).toBeGreaterThan(0);
      expect(turnCount).toBeLessThan(maxTurns);
    });

    it('should ensure no invalid moves in Easy AI game', () => {
      const game = startGame(createNewGame());
      let currentGame = game;
      const maxTurns = 300;

      for (let i = 0; i < maxTurns && currentGame.phase === 'playing'; i++) {
        const currentSide = currentGame.currentPlayerIndex;
        const shot = getEasyShot(currentGame, currentSide);
        
        expect(canPlay(currentGame, shot)).toBe(true);
        
        currentGame = playTurn(currentGame, shot);
      }

      expect(currentGame.phase).toBe('finished');
    });
  });

  describe('Full game vs Medium AI', () => {
    it('should complete a full game with Medium AI', () => {
      const game = startGame(createNewGame());
      let currentGame = game;
      let turnCount = 0;
      const maxTurns = 300;

      while (currentGame.phase === 'playing' && turnCount < maxTurns) {
        const currentSide = currentGame.currentPlayerIndex;
        const shot = getMediumShot(currentGame, currentSide);
        
        const opponentIndex = currentSide === 0 ? 1 : 0;
        const opponentBoard = currentGame.players[opponentIndex].board;
        const cellState = opponentBoard.cells[shot.row][shot.col];
        
        expect(cellState).not.toBe('hit');
        expect(cellState).not.toBe('miss');
        
        currentGame = playTurn(currentGame, shot);
        turnCount++;
      }

      expect(currentGame.phase).toBe('finished');
      expect(currentGame.winner).toBeDefined();
      expect(['player1', 'player2']).toContain(currentGame.winner);
      expect(turnCount).toBeGreaterThan(0);
      expect(turnCount).toBeLessThan(maxTurns);
    });

    it('should ensure no invalid moves in Medium AI game', () => {
      const game = startGame(createNewGame());
      let currentGame = game;
      const maxTurns = 300;

      for (let i = 0; i < maxTurns && currentGame.phase === 'playing'; i++) {
        const currentSide = currentGame.currentPlayerIndex;
        const shot = getMediumShot(currentGame, currentSide);
        
        expect(canPlay(currentGame, shot)).toBe(true);
        
        currentGame = playTurn(currentGame, shot);
      }

      expect(currentGame.phase).toBe('finished');
    });
  });

  describe('Full game vs Hard AI', () => {
    it('should complete a full game with Hard AI', () => {
      const game = startGame(createNewGame());
      let currentGame = game;
      let turnCount = 0;
      const maxTurns = 300;

      while (currentGame.phase === 'playing' && turnCount < maxTurns) {
        const currentSide = currentGame.currentPlayerIndex;
        const shot = getHardShot(currentGame, currentSide);
        
        const opponentIndex = currentSide === 0 ? 1 : 0;
        const opponentBoard = currentGame.players[opponentIndex].board;
        const cellState = opponentBoard.cells[shot.row][shot.col];
        
        expect(cellState).not.toBe('hit');
        expect(cellState).not.toBe('miss');
        
        currentGame = playTurn(currentGame, shot);
        turnCount++;
      }

      expect(currentGame.phase).toBe('finished');
      expect(currentGame.winner).toBeDefined();
      expect(['player1', 'player2']).toContain(currentGame.winner);
      expect(turnCount).toBeGreaterThan(0);
      expect(turnCount).toBeLessThan(maxTurns);
    });

    it('should ensure no invalid moves in Hard AI game', () => {
      const game = startGame(createNewGame());
      let currentGame = game;
      const maxTurns = 300;

      for (let i = 0; i < maxTurns && currentGame.phase === 'playing'; i++) {
        const currentSide = currentGame.currentPlayerIndex;
        const shot = getHardShot(currentGame, currentSide);
        
        expect(canPlay(currentGame, shot)).toBe(true);
        
        currentGame = playTurn(currentGame, shot);
      }

      expect(currentGame.phase).toBe('finished');
    });
  });

  describe('Mixed AI games', () => {
    it('should complete Easy vs Medium game', () => {
      const game = startGame(createNewGame());
      let currentGame = game;
      let turnCount = 0;
      const maxTurns = 300;

      while (currentGame.phase === 'playing' && turnCount < maxTurns) {
        const currentSide = currentGame.currentPlayerIndex;
        const shot = currentSide === 0 
          ? getEasyShot(currentGame, currentSide)
          : getMediumShot(currentGame, currentSide);
        
        const opponentIndex = currentSide === 0 ? 1 : 0;
        const opponentBoard = currentGame.players[opponentIndex].board;
        const cellState = opponentBoard.cells[shot.row][shot.col];
        
        expect(cellState).not.toBe('hit');
        expect(cellState).not.toBe('miss');
        
        currentGame = playTurn(currentGame, shot);
        turnCount++;
      }

      expect(currentGame.phase).toBe('finished');
      expect(currentGame.winner).toBeDefined();
    });

    it('should complete Medium vs Hard game', () => {
      const game = startGame(createNewGame());
      let currentGame = game;
      let turnCount = 0;
      const maxTurns = 300;

      while (currentGame.phase === 'playing' && turnCount < maxTurns) {
        const currentSide = currentGame.currentPlayerIndex;
        const shot = currentSide === 0 
          ? getMediumShot(currentGame, currentSide)
          : getHardShot(currentGame, currentSide);
        
        const opponentIndex = currentSide === 0 ? 1 : 0;
        const opponentBoard = currentGame.players[opponentIndex].board;
        const cellState = opponentBoard.cells[shot.row][shot.col];
        
        expect(cellState).not.toBe('hit');
        expect(cellState).not.toBe('miss');
        
        currentGame = playTurn(currentGame, shot);
        turnCount++;
      }

      expect(currentGame.phase).toBe('finished');
      expect(currentGame.winner).toBeDefined();
    });

    it('should complete Easy vs Hard game', () => {
      const game = startGame(createNewGame());
      let currentGame = game;
      let turnCount = 0;
      const maxTurns = 300;

      while (currentGame.phase === 'playing' && turnCount < maxTurns) {
        const currentSide = currentGame.currentPlayerIndex;
        const shot = currentSide === 0 
          ? getEasyShot(currentGame, currentSide)
          : getHardShot(currentGame, currentSide);
        
        const opponentIndex = currentSide === 0 ? 1 : 0;
        const opponentBoard = currentGame.players[opponentIndex].board;
        const cellState = opponentBoard.cells[shot.row][shot.col];
        
        expect(cellState).not.toBe('hit');
        expect(cellState).not.toBe('miss');
        
        currentGame = playTurn(currentGame, shot);
        turnCount++;
      }

      expect(currentGame.phase).toBe('finished');
      expect(currentGame.winner).toBeDefined();
    });
  });

  describe('Game completion guarantees', () => {
    it('should always end with exactly one winner', () => {
      const game = startGame(createNewGame());
      let currentGame = game;
      const maxTurns = 300;

      for (let i = 0; i < maxTurns && currentGame.phase === 'playing'; i++) {
        const currentSide = currentGame.currentPlayerIndex;
        const shot = getHardShot(currentGame, currentSide);
        currentGame = playTurn(currentGame, shot);
      }

      expect(currentGame.phase).toBe('finished');
      expect(currentGame.winner).toBeDefined();
      expect(typeof currentGame.winner).toBe('string');
      expect(currentGame.winner).toMatch(/^player[12]$/);
    });

    it('should have all opponent ships sunk when game ends', () => {
      const game = startGame(createNewGame());
      let currentGame = game;
      const maxTurns = 300;

      for (let i = 0; i < maxTurns && currentGame.phase === 'playing'; i++) {
        const currentSide = currentGame.currentPlayerIndex;
        const shot = getHardShot(currentGame, currentSide);
        currentGame = playTurn(currentGame, shot);
      }

      expect(currentGame.phase).toBe('finished');
      
      const winnerIndex = currentGame.winner === 'player1' ? 0 : 1;
      const loserIndex = winnerIndex === 0 ? 1 : 0;
      const loser = currentGame.players[loserIndex];
      
      const allShipsSunk = loser.ships.every(ship =>
        ship.coords.every(coord => loser.board.cells[coord.row][coord.col] === 'hit')
      );
      
      expect(allShipsSunk).toBe(true);
    });

    it('should complete multiple games consistently', () => {
      for (let gameNum = 0; gameNum < 3; gameNum++) {
        const game = startGame(createNewGame());
        let currentGame = game;
        const maxTurns = 300;

        for (let i = 0; i < maxTurns && currentGame.phase === 'playing'; i++) {
          const currentSide = currentGame.currentPlayerIndex;
          const shot = getMediumShot(currentGame, currentSide);
          currentGame = playTurn(currentGame, shot);
        }

        expect(currentGame.phase).toBe('finished');
        expect(currentGame.winner).toBeDefined();
      }
    });
  });
});
