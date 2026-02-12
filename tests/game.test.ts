import { describe, it, expect } from 'vitest';
import { createNewGame, canPlay, playTurn, startBattle, getNextUnplacedShipIndex, isSetupComplete, placeSetupShip } from '../src/engine/game';
import { Coord, GameState, Player } from '../src/types/game';
import { placeShip } from '../src/engine/placement';

function startGame(game: GameState): GameState {
  return { ...game, phase: 'playing' };
}

const HUMAN_PLACEMENTS: { length: number; row: number; col: number }[] = [
  { length: 5, row: 0, col: 0 },
  { length: 4, row: 2, col: 0 },
  { length: 3, row: 4, col: 0 },
  { length: 3, row: 6, col: 0 },
  { length: 2, row: 8, col: 0 },
];

function placeAllHumanShips(game: GameState): GameState {
  let board = game.players[0].board;
  const ships = game.players[0].ships.map((ship, i) => {
    const p = HUMAN_PLACEMENTS[i];
    board = placeShip(board, { row: p.row, col: p.col }, p.length, 'horizontal');
    const coords: Coord[] = [];
    for (let j = 0; j < p.length; j++) {
      coords.push({ row: p.row, col: p.col + j });
    }
    return { ...ship, coords, hits: Array(p.length).fill(false) };
  });
  const updatedPlayer: Player = { ...game.players[0], board, ships };
  const withShips: GameState = {
    ...game,
    players: [updatedPlayer, game.players[1]],
    currentPlayerIndex: 0,
  };
  return startBattle(withShips);
}

describe('Game state and turns', () => {
  describe('createNewGame', () => {
    it('should create a new game with two players', () => {
      const game = createNewGame();

      expect(game.players).toHaveLength(2);
      expect(game.players[0].id).toBe('player1');
      expect(game.players[1].id).toBe('player2');
      expect(game.currentPlayerIndex).toBe(0);
      expect(game.phase).toBe('setup');
    });

    it('should auto-place 5 standard ships for each player', () => {
      const game = createNewGame();

      expect(game.players[0].ships).toHaveLength(5);
      expect(game.players[1].ships).toHaveLength(5);

      const shipLengths = game.players[0].ships.map(s => s.length).sort();
      expect(shipLengths).toEqual([2, 3, 3, 4, 5]);
    });

    it('should place ships on the board', () => {
      const game = createNewGame();

      expect(game.phase).toBe('setup');

      const player1ShipCells = game.players[0].board.cells
        .flat()
        .filter(cell => cell === 'ship').length;
      expect(player1ShipCells).toBe(0);

      const player2ShipCells = game.players[1].board.cells
        .flat()
        .filter(cell => cell === 'ship').length;
      expect(player2ShipCells).toBe(17);
    });
  });

  describe('startBattle', () => {
    it('should transition to playing after all ships placed', () => {
      const game = createNewGame();
      expect(game.phase).toBe('setup');
      const ready = placeAllHumanShips(game);
      expect(ready.phase).toBe('playing');
    });

    it('should throw if ships not all placed', () => {
      const game = createNewGame();
      expect(() => startBattle(game)).toThrow('Not all ships have been placed');
    });

    it('should throw if game is not in setup phase', () => {
      const game = placeAllHumanShips(createNewGame());
      expect(() => startBattle(game)).toThrow('Game is not in setup phase');
    });
  });

  describe('canPlay', () => {
    it('should allow valid move', () => {
      const game = startGame(createNewGame());
      const result = canPlay(game, { row: 0, col: 0 });
      expect(result).toBe(true);
    });

    it('should reject out of bounds move', () => {
      const game = startGame(createNewGame());
      const result = canPlay(game, { row: 10, col: 10 });
      expect(result).toBe(false);
    });

    it('should reject move on already attacked cell', () => {
      const game = startGame(createNewGame());
      const afterFirstAttack = playTurn(game, { row: 0, col: 0 });
      const afterSecondAttack = playTurn(afterFirstAttack, { row: 1, col: 1 });
      const result = canPlay(afterSecondAttack, { row: 0, col: 0 });
      expect(result).toBe(false);
    });

    it('should reject move when game is finished', () => {
      const game = createNewGame();
      const finishedGame = { ...game, phase: 'finished' as const };
      const result = canPlay(finishedGame, { row: 0, col: 0 });
      expect(result).toBe(false);
    });
  });

  describe('playTurn', () => {
    it('should switch turns after a move', () => {
      const game = startGame(createNewGame());
      expect(game.currentPlayerIndex).toBe(0);

      const newGame = playTurn(game, { row: 0, col: 0 });
      expect(newGame.currentPlayerIndex).toBe(1);
    });

    it('should update opponent board after attack', () => {
      const game = startGame(createNewGame());
      const newGame = playTurn(game, { row: 0, col: 0 });

      const cell = newGame.players[1].board.cells[0][0];
      expect(cell === 'hit' || cell === 'miss').toBe(true);
    });

    it('should throw error for invalid move', () => {
      const game = startGame(createNewGame());
      expect(() => {
        playTurn(game, { row: 10, col: 10 });
      }).toThrow('Invalid move');
    });

    it('should detect winner when all ships are sunk', () => {
      const game = placeAllHumanShips(createNewGame());

      // Pre-hit all AI ship cells except the very last one
      const aiShips = game.players[1].ships;
      const allCoords: Coord[] = [];
      aiShips.forEach(ship => ship.coords.forEach(c => allCoords.push(c)));
      const lastCoord = allCoords[allCoords.length - 1];

      const modifiedCells = game.players[1].board.cells.map(row => [...row]);
      for (let i = 0; i < allCoords.length - 1; i++) {
        modifiedCells[allCoords[i].row][allCoords[i].col] = 'hit';
      }
      const modifiedBoard = { size: game.players[1].board.size, cells: modifiedCells };
      const modifiedGame: GameState = {
        ...game,
        players: [
          game.players[0],
          { ...game.players[1], board: modifiedBoard },
        ],
      };

      const result = playTurn(modifiedGame, lastCoord);
      expect(result.phase).toBe('finished');
      expect(result.winner).toBe(game.players[0].id);
    });

    it('should set lastMove with hit or miss outcome', () => {
      const game = startGame(createNewGame());
      const result = playTurn(game, { row: 0, col: 0 });

      expect(result.lastMove).toBeDefined();
      expect(result.lastMove!.byPlayerId).toBe('player1');
      expect(result.lastMove!.coord).toEqual({ row: 0, col: 0 });
      expect(['hit', 'miss', 'sunk']).toContain(result.lastMove!.outcome);
    });

    it('should set sunkShipName when outcome is sunk', () => {
      const game = placeAllHumanShips(createNewGame());

      // Find the last ship of AI and pre-hit all but its last coord
      const aiShips = game.players[1].ships;
      const targetShip = aiShips[aiShips.length - 1];
      const lastCoord = targetShip.coords[targetShip.coords.length - 1];

      const modifiedCells = game.players[1].board.cells.map(row => [...row]);
      for (let i = 0; i < targetShip.coords.length - 1; i++) {
        modifiedCells[targetShip.coords[i].row][targetShip.coords[i].col] = 'hit';
      }
      const modifiedBoard = { size: game.players[1].board.size, cells: modifiedCells };
      const modifiedGame: GameState = {
        ...game,
        players: [
          game.players[0],
          { ...game.players[1], board: modifiedBoard },
        ],
      };

      const result = playTurn(modifiedGame, lastCoord);
      expect(result.lastMove).toBeDefined();
      expect(result.lastMove!.outcome).toBe('sunk');
      expect(result.lastMove!.sunkShipName).toBe(targetShip.name);
    });

    it('should simulate a short game with winner', () => {
      const game = startGame(createNewGame());
      let currentGame = game;
      let turnCount = 0;
      const maxTurns = 200;

      while (currentGame.phase === 'playing' && turnCount < maxTurns) {
        const targetPlayerIndex = currentGame.currentPlayerIndex === 0 ? 1 : 0;
        const targetBoard = currentGame.players[targetPlayerIndex].board;

        const coord = findEmptyCell(targetBoard);
        currentGame = playTurn(currentGame, coord);
        turnCount++;
      }

      expect(currentGame.phase).toBe('finished');
      expect(currentGame.winner).toBeDefined();
      expect(['player1', 'player2']).toContain(currentGame.winner);
    });
  });
});

describe('getNextUnplacedShipIndex', () => {
  it('should return 0 for a fresh game (no ships placed)', () => {
    const game = createNewGame();
    expect(getNextUnplacedShipIndex(game, 0)).toBe(0);
  });

  it('should skip already-placed ships', () => {
    const game = createNewGame();
    // Place the first ship manually
    const p = HUMAN_PLACEMENTS[0];
    let board = game.players[0].board;
    board = placeShip(board, { row: p.row, col: p.col }, p.length, 'horizontal');
    const coords: Coord[] = [];
    for (let j = 0; j < p.length; j++) coords.push({ row: p.row, col: p.col + j });
    const ships = game.players[0].ships.map((s, i) =>
      i === 0 ? { ...s, coords, hits: Array(p.length).fill(false) } : s
    );
    const updated: GameState = {
      ...game,
      players: [{ ...game.players[0], board, ships }, game.players[1]],
    };
    expect(getNextUnplacedShipIndex(updated, 0)).toBe(1);
  });

  it('should return null when all ships are placed', () => {
    const game = createNewGame();
    const withShips = placeAllHumanShipsSetup(game);
    expect(getNextUnplacedShipIndex(withShips, 0)).toBeNull();
  });

  it('should return null for auto-placed AI player', () => {
    const game = createNewGame();
    expect(getNextUnplacedShipIndex(game, 1)).toBeNull();
  });
});

describe('isSetupComplete', () => {
  it('should return false for a fresh game', () => {
    const game = createNewGame();
    expect(isSetupComplete(game, 0)).toBe(false);
  });

  it('should return true when all ships are placed', () => {
    const game = createNewGame();
    const withShips = placeAllHumanShipsSetup(game);
    expect(isSetupComplete(withShips, 0)).toBe(true);
  });

  it('should return true for auto-placed AI player', () => {
    const game = createNewGame();
    expect(isSetupComplete(game, 1)).toBe(true);
  });
});

function placeAllHumanShipsSetup(game: GameState): GameState {
  let board = game.players[0].board;
  const ships = game.players[0].ships.map((ship, i) => {
    const p = HUMAN_PLACEMENTS[i];
    board = placeShip(board, { row: p.row, col: p.col }, p.length, 'horizontal');
    const coords: Coord[] = [];
    for (let j = 0; j < p.length; j++) coords.push({ row: p.row, col: p.col + j });
    return { ...ship, coords, hits: Array(p.length).fill(false) };
  });
  return {
    ...game,
    players: [{ ...game.players[0], board, ships }, game.players[1]],
  };
}

describe('placeSetupShip', () => {
  it('should update board and ship coords on valid placement', () => {
    const game = createNewGame();
    const result = placeSetupShip(game, 0, 0, { row: 0, col: 0 }, 'horizontal');

    // Board should have 'ship' cells for the Carrier (length 5)
    for (let c = 0; c < 5; c++) {
      expect(result.players[0].board.cells[0][c]).toBe('ship');
    }

    // Ship coords should be set
    expect(result.players[0].ships[0].coords).toHaveLength(5);
    expect(result.players[0].ships[0].coords[0]).toEqual({ row: 0, col: 0 });
    expect(result.players[0].ships[0].coords[4]).toEqual({ row: 0, col: 4 });

    // Hits array should be initialized
    expect(result.players[0].ships[0].hits).toEqual([false, false, false, false, false]);
  });

  it('should throw on invalid placement (out of bounds)', () => {
    const game = createNewGame();
    expect(() => placeSetupShip(game, 0, 0, { row: 0, col: 8 }, 'horizontal')).toThrow();
  });

  it('should throw on overlapping placement', () => {
    const game = createNewGame();
    const after1 = placeSetupShip(game, 0, 0, { row: 0, col: 0 }, 'horizontal');
    expect(() => placeSetupShip(after1, 0, 1, { row: 0, col: 0 }, 'horizontal')).toThrow();
  });

  it('should throw when placing same ship twice', () => {
    const game = createNewGame();
    const after1 = placeSetupShip(game, 0, 0, { row: 0, col: 0 }, 'horizontal');
    expect(() => placeSetupShip(after1, 0, 0, { row: 2, col: 0 }, 'horizontal')).toThrow('Ship already placed');
  });

  it('should throw when not in setup phase', () => {
    const game = createNewGame();
    const playing = { ...game, phase: 'playing' as const };
    expect(() => placeSetupShip(playing, 0, 0, { row: 0, col: 0 }, 'horizontal')).toThrow('Can only place ships during setup phase');
  });

  it('should throw for invalid ship index', () => {
    const game = createNewGame();
    expect(() => placeSetupShip(game, 0, 99, { row: 0, col: 0 }, 'horizontal')).toThrow('Invalid ship index');
    expect(() => placeSetupShip(game, 0, -1, { row: 0, col: 0 }, 'horizontal')).toThrow('Invalid ship index');
  });

  it('should not mutate original game state', () => {
    const game = createNewGame();
    const originalCells = game.players[0].board.cells[0][0];
    placeSetupShip(game, 0, 0, { row: 0, col: 0 }, 'horizontal');
    expect(game.players[0].board.cells[0][0]).toBe(originalCells);
    expect(game.players[0].ships[0].coords).toHaveLength(0);
  });
});

function findEmptyCell(board: { size: number; cells: string[][] }): Coord {
  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      if (board.cells[row][col] !== 'hit' && board.cells[row][col] !== 'miss') {
        return { row, col };
      }
    }
  }
  throw new Error('No empty cells found');
}
