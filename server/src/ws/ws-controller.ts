import { IncomingMessage, Server, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import WebSocket, { WebSocketServer } from 'ws';

import { WSBaseMessage, WSClient, WSConnectMessage, WSGameConnectRequestMessage, WSGameConnectResponeMessage, WSGameSetupRequestMessage, WSGameSetupResponseMessage } from './types';
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
      console.log(`Participant with id ${client.id} was connected!`);
    });
  }

  public handleDisconnect(event: WebSocket.CloseEvent, client: WSClient): void {
    this.clients.delete(client.id);
    this.gm.handleParticipantLeave(client.id);
    console.log(`Participant with id ${client.id} was disconnected!`);
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

        case WSMessageType.GAME_SETUP: {
          this.handleGameSetupRequest(client, message as WSGameSetupRequestMessage);
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

    const resMessage: WSGameConnectResponeMessage = {
      type: message.type,
      gameId: joinResult.id,
      participantIds: Object.keys(joinResult.playersData)
    };

    this.broadcastToIds(Object.keys(joinResult.playersData), resMessage);
  }

  private handleGameSetupRequest(client: WSClient, message: WSGameSetupRequestMessage): void {
    const [playersData, updateError] = this.gm.updatePlayerData(message.gameId, {
      id: message.clientId,
      ships: message.ships
    });

    if (updateError?.error || !playersData) {
      client.socket.send(JSON.stringify({ type: message.type, error: updateError.error }));
      return;
    }

    const resMessage: WSGameSetupResponseMessage = {
      type: message.type,
      readyParticipantsIds: playersData.filter(p => p.ships.length > 0).map((p) => p.id)
    };

    this.broadcastToIds(playersData.map((p) => p.id), resMessage);
  }

  private broadcastToIds(targetIds: string[], mesage: WSBaseMessage): void {
    const targets = targetIds.map(id => this.clients.get(id));

    targets.forEach(client => {
      client?.socket.send(JSON.stringify(mesage));
    });
  }
}