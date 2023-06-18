export const GRID_ROW_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
export const GRID_COL_KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export const SHIP_LABEL_BY_SIZE: Record<number, string> = {
  1: 'Cruiser (1)',
  2: 'Destroyer (2)',
  3: 'Battleship (3)',
  4: 'Aircraft Carrier (4)'
};

export enum Direction {
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL'
}

export enum Position {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export enum GridMode {
  ENEMY = 'ENEMY',
  OWN = 'OWN'
}

export enum GameState {
  PENDING = 'PENDING', // Game not started
  CREATED = 'CREATED', // Game was created by one of the players, waiting for second one
  SETUP = 'SETUP', // Both players connected to the game, setuping their boards
  STARTED = 'STARTED' // Player's boards are setuped, game has been started
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST'
}

export enum WSMessageType {
  WS_CONNECT = 'WS_CONNECT',
  GAME_CONNECT = 'GAME_CONNECT',
  GAME_SETUP = 'GAME_SETUP',
  GAME_ACTION = 'GAME_ACTION'
}