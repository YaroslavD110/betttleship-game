import { WSBaseMessage } from '@ws/types';

import { Direction, GameState, Position } from './constants';

export interface CellData {
  rowIndex: number;
  colIndex: number;
  code: string;
}

export interface ShipCellData extends CellData {
  index: number;
  isKilled: boolean;
  size: number;
  inverseDirection: boolean;
  direction: Direction;
  position: Position;
}

export type ShipData = ShipCellData[];

export interface Game {
  state: GameState;
  id: string | null;
  clientId: string | null;
  lastMessage: WSMessage | null;
  toggleWaitingScreen: (state: boolean) => void;
  sendMessage: (payload: WSPayload) => void;
  setGameId: (gameId: string | null) => void;
  changeGameState: (state: GameState) => void;
}

export interface WSPayload {
  
}

export interface WSMessage extends WSBaseMessage {}