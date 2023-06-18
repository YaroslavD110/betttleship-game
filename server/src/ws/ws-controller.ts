import { IncomingMessage, Server, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import WebSocket, { WebSocketServer } from 'ws';

import { WSBaseMessage, WSClient, WSConnectMessage, WSGameConnectRequestMessage, WSGameConnectResponeMessage } from './types';
import { GameManager } from '../game/game-manager';
import { WSMessageType } from './constants';

export class WSServer {
  private readonly ws: WebSocketServer;
  private readonly clients = new Map<string, WSClient>();
  
  constructor(
    private readonly server: Server<typeof IncomingMessage, typeof ServerResponse>,
    private readonly gm: GameManager
  ) {
    this.ws = new WebSocketServer({ server });
  }

  public listen() {
    this.ws.on('connection', (socket) => {
      const id = randomUUID();
      const message: WSConnectMessage = {
        type: WSMessageType.WS_CONNECT,
        clientId: id
      };
      const client: WSClient = {
        id,
        socket
      };

      socket.on('open', () => {
        console.log('OPEN');
      })

      socket.on('close', (event: WebSocket.CloseEvent) => {
        this.handleDisconnect(event, client);
      });

      socket.on('error', (event: WebSocket.ErrorEvent) => {
        this.handleError(event, client);
      });

      socket.on('message', (event: WebSocket.MessageEvent) => {
        this.handleMessage(event, client);
      });

      this.clients.set(id, client);
      socket.send(JSON.stringify(message));
    });
  }

  public handleDisconnect(event: WebSocket.CloseEvent, client: WSClient): void {
    this.clients.delete(client.id);
    this.gm.handleParticipantLeft(client.id);
  }

  public handleError(event: WebSocket.ErrorEvent, client: WSClient): void {
    console.error(`Error from client with id ${client.id}`, event);
  }

  public handleMessage(event: WebSocket.MessageEvent, client: WSClient): void {
    try {
      const message = JSON.parse(event.toString()) as WSBaseMessage;

      switch(message.type) {
        case WSMessageType.GAME_CONNECT: {
          this.handleGameConnectRequest(client, message as WSGameConnectRequestMessage);
          break;
        }

        default: {
          client.socket.send(JSON.stringify({
            type: message.type,
            error: 'Not Found!'
          }));
        }
      }
    } catch (error) {
      console.error(`Failed to handle WS message: ${event.data}`, error);
    }
  }

  private handleGameConnectRequest(client: WSClient, message: WSGameConnectRequestMessage): void {
    const [joinResult, joinError] = this.gm.joinGame(message.gameId, message.clientId);
    if (joinError?.error || !joinResult) {
      client.socket.send(JSON.stringify({ type: message.type, error: joinError.error }));
      return;
    }

    this.broadcastToIds(joinResult.participantsIds, {
      type: message.type,
      gameId: joinResult.id,
      participantIds: joinResult.participantsIds
    } as WSGameConnectResponeMessage);
  }

  private broadcastToIds(targetIds: string[], mesage: WSBaseMessage): void {
    const targets = targetIds.map(id => this.clients.get(id));

    targets.forEach(client => {
      client?.socket.send(JSON.stringify(mesage));
    });
  }
}