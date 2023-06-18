import WebSocket from 'ws';

import { WSMessageType } from './constants';

export type Tuple<R, E> = [R, null] | [null, E];

export interface WSClient {
  id: string;
  socket: WebSocket;
}

// WQS Messages
export interface WSBaseMessage {
  type: WSMessageType;
  error?: string;
}

// WS Request message tupes
export interface WSGameConnectRequestMessage extends WSBaseMessage {
  type: WSMessageType.GAME_CONNECT;
  clientId: string;
  gameId: string;
}

// WS Response mesages types
export interface WSConnectMessage extends WSBaseMessage {
  type: WSMessageType.WS_CONNECT;
  clientId: string;
}

export interface WSGameConnectResponeMessage extends WSBaseMessage {
  type: WSMessageType.GAME_CONNECT;
  gameId: string;
  participantIds: string[];
}
