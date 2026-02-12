/**
 * Represents a coordinate on the game board
 */
export type Coord = {
  row: number;
  col: number;
};

/**
 * Ship orientation on the board
 */
export type Orientation = 'horizontal' | 'vertical';

/**
 * Represents a ship in the game
 */
export type Ship = {
  id: string;
  name: string;
  length: number;
  coords: Coord[];
  hits: boolean[];
};

/**
 * State of a cell on the board
 */
export type CellState = 'empty' | 'ship' | 'hit' | 'miss';

/**
 * Game board representation
 */
export type Board = {
  size: number;
  cells: CellState[][];
};

/**
 * Player in the game
 */
export type Player = {
  id: string;
  name: string;
  board: Board;
  ships: Ship[];
};

/**
 * Overall game state
 */
export type GameState = {
  players: [Player, Player];
  currentPlayerIndex: 0 | 1;
  phase: 'setup' | 'playing' | 'finished';
  winner?: string;
  lastMove?: {
    byPlayerId: string;
    coord: Coord;
    outcome: 'hit' | 'miss' | 'sunk';
    sunkShipName?: string;
  };
};
