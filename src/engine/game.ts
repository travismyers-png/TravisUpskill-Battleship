import { GameState, Player, Board, Ship, Coord, Orientation } from '../types/game';
import { placeShip, canPlaceShip } from './placement';
import { attack, AttackResult } from './attack';
import { STANDARD_SHIPS } from '../shared/ships';
import { getShipCoords } from '../shared/coords';

/**
 * Creates a new game with two players and auto-placed ships
 */
export function createNewGame(): GameState {
  const player1 = createHumanPlayer('player1', 'Player 1');
  const player2 = createPlayer('player2', 'Player 2');

  return {
    players: [player1, player2],
    currentPlayerIndex: 0,
    phase: 'setup',
  };
}

/**
 * Creates a human player with empty board and unplaced ship metadata
 */
function createHumanPlayer(id: string, name: string): Player {
  const board = createEmptyBoard(10);
  const ships: Ship[] = STANDARD_SHIPS.map((shipDef, i) => ({
    id: `${id}-ship-${i}`,
    name: shipDef.name,
    length: shipDef.length,
    coords: [],
    hits: [],
  }));

  return { id, name, board, ships };
}

/**
 * Returns the index of the first ship with no coords for the given player, or null if all placed.
 */
export function getNextUnplacedShipIndex(game: GameState, playerIndex: number): number | null {
  const ships = game.players[playerIndex].ships;
  for (let i = 0; i < ships.length; i++) {
    if (ships[i].coords.length === 0) return i;
  }
  return null;
}

/**
 * Returns true when every ship for the given player has coords.
 */
export function isSetupComplete(game: GameState, playerIndex: number): boolean {
  return getNextUnplacedShipIndex(game, playerIndex) === null;
}

/**
 * Places a ship during setup phase and returns updated game state.
 */
export function placeSetupShip(
  game: GameState,
  playerIndex: number,
  shipIndex: number,
  start: Coord,
  orientation: Orientation
): GameState {
  if (game.phase !== 'setup') {
    throw new Error('Can only place ships during setup phase');
  }

  const player = game.players[playerIndex];

  if (shipIndex < 0 || shipIndex >= player.ships.length) {
    throw new Error('Invalid ship index');
  }

  const ship = player.ships[shipIndex];

  if (ship.coords.length > 0) {
    throw new Error('Ship already placed');
  }

  const newBoard = placeShip(player.board, start, ship.length, orientation);
  const coords = getShipCoords(start, ship.length, orientation);

  const updatedShips = player.ships.map((s, i) =>
    i === shipIndex
      ? { ...s, coords, hits: Array(ship.length).fill(false) }
      : s
  );

  const updatedPlayer: Player = { ...player, board: newBoard, ships: updatedShips };
  const newPlayers = [...game.players] as [Player, Player];
  newPlayers[playerIndex] = updatedPlayer;

  return { ...game, players: newPlayers };
}

/**
 * Transitions from setup to playing phase
 */
export function startBattle(game: GameState): GameState {
  if (game.phase !== 'setup') {
    throw new Error('Game is not in setup phase');
  }

  if (!isSetupComplete(game, 0)) {
    throw new Error('Not all ships have been placed');
  }

  return {
    ...game,
    phase: 'playing',
  };
}

/**
 * Checks if a move can be played
 */
export function canPlay(game: GameState, coord: Coord): boolean {
  if (game.phase !== 'playing') {
    return false;
  }

  const opponentIndex = game.currentPlayerIndex === 0 ? 1 : 0;
  const opponentBoard = game.players[opponentIndex].board;

  if (coord.row < 0 || coord.row >= opponentBoard.size || 
      coord.col < 0 || coord.col >= opponentBoard.size) {
    return false;
  }

  const cellState = opponentBoard.cells[coord.row][coord.col];
  return cellState !== 'hit' && cellState !== 'miss';
}

/**
 * Plays a turn and returns updated game state
 */
export function playTurn(game: GameState, coord: Coord): GameState {
  if (!canPlay(game, coord)) {
    throw new Error('Invalid move');
  }

  const currentPlayerIndex = game.currentPlayerIndex;
  const opponentIndex = currentPlayerIndex === 0 ? 1 : 0;
  const opponent = game.players[opponentIndex];

  const attackResult = attack(opponent.board, opponent.ships, coord);

  const updatedOpponent: Player = {
    ...opponent,
    board: attackResult.board,
  };

  const newPlayers: [Player, Player] = currentPlayerIndex === 0
    ? [game.players[0], updatedOpponent]
    : [updatedOpponent, game.players[1]];

  const lastMove: GameState['lastMove'] = {
    byPlayerId: game.players[currentPlayerIndex].id,
    coord,
    outcome: attackResult.outcome === 'sunk' ? 'sunk' : attackResult.outcome === 'hit' ? 'hit' : 'miss',
    sunkShipName: attackResult.outcome === 'sunk' ? attackResult.sunkShip?.name : undefined,
  };

  const allShipsSunk = areAllShipsSunk(updatedOpponent.board, updatedOpponent.ships);

  if (allShipsSunk) {
    return {
      players: newPlayers,
      currentPlayerIndex: currentPlayerIndex,
      phase: 'finished',
      winner: game.players[currentPlayerIndex].id,
      lastMove,
    };
  }

  return {
    players: newPlayers,
    currentPlayerIndex: opponentIndex as 0 | 1,
    phase: 'playing',
    lastMove,
  };
}

/**
 * Creates a player with auto-placed ships
 */
function createPlayer(id: string, name: string): Player {
  const board = createEmptyBoard(10);
  const ships: Ship[] = [];

  let currentBoard = board;

  for (let i = 0; i < STANDARD_SHIPS.length; i++) {
    const shipDef = STANDARD_SHIPS[i];
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!placed && attempts < maxAttempts) {
      const row = Math.floor(Math.random() * 10);
      const col = Math.floor(Math.random() * 10);
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';

      try {
        const newBoard = placeShip(currentBoard, { row, col }, shipDef.length, orientation);
        const coords = getShipCoords({ row, col }, shipDef.length, orientation);

        ships.push({
          id: `${id}-ship-${i}`,
          name: shipDef.name,
          length: shipDef.length,
          coords,
          hits: Array(shipDef.length).fill(false),
        });

        currentBoard = newBoard;
        placed = true;
      } catch {
        attempts++;
      }
    }

    if (!placed) {
      throw new Error(`Failed to place ${shipDef.name} after ${maxAttempts} attempts`);
    }
  }

  return {
    id,
    name,
    board: currentBoard,
    ships,
  };
}

/**
 * Creates an empty board
 */
function createEmptyBoard(size: number): Board {
  return {
    size,
    cells: Array(size).fill(null).map(() => Array(size).fill('empty')),
  };
}

/**
 * Checks if all ships are sunk
 */
function areAllShipsSunk(board: Board, ships: Ship[]): boolean {
  return ships.every(ship =>
    ship.coords.every(coord => board.cells[coord.row][coord.col] === 'hit')
  );
}

/**
 * Union of all possible game actions.
 */
export type GameAction =
  | { type: 'PLACE_SHIP'; playerIndex: number; shipIndex: number; start: Coord; orientation: Orientation }
  | { type: 'START_BATTLE' }
  | { type: 'SHOT'; coord: Coord };

/**
 * Single reducer entry-point for all game state mutations.
 * Delegates to placeSetupShip / startBattle / playTurn.
 */
export function applyAction(game: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLACE_SHIP':
      return placeSetupShip(game, action.playerIndex, action.shipIndex, action.start, action.orientation);
    case 'START_BATTLE':
      return startBattle(game);
    case 'SHOT':
      return playTurn(game, action.coord);
  }
}
