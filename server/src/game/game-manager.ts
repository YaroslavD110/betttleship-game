import { randomBytes } from 'node:crypto';

import { Tuple } from '../ws/types';

export interface GameData {
  id: string;
  playersData: Record<string, PlayerData>;
}

interface PlayerData {
  id: string;
  ships: string[][];
  destroyedShips: string[][];
  hits: string[];
}

type UpdatePlayerDataArg = Pick<PlayerData, 'id'> & Partial<Omit<PlayerData, 'id'>>;

export interface GameActionError {
  error?: string;
}

export class GameManager {
  private readonly MAX_PARTICIPANTS_IN_GAME = 2;

  private readonly games = new Map<string, GameData>();

  public genereateGameId(): string {
    const id = randomBytes(3).toString('hex');

    if (this.games.has(id)) {
      return this.genereateGameId();
    }

    return id;
  }

  public createGame(gameId: string, gameParticipantsIds: string[]): void {
    this.games.set(gameId, {
      id: gameId,
      playersData: gameParticipantsIds.reduce<Record<string, PlayerData>>((data, participantId) => {
        data[participantId] = this.getDefaultPlayerData(participantId)

        return data;
      }, {})
    });
  }

  public getParticipantGame(participantId: string): GameData | null {
    for (const game of this.games.values()) {
      if (game.playersData[participantId]) {
        return game;
      }
    }

    return null;
  }

  public joinGame(gameId: string, participantId: string): Tuple<GameData, GameActionError> {
    const game = this.games.get(gameId);
    if (!game) {
      return [null, { error: 'Game not found!' }];
    }

    if (Object.values(game.playersData).length >= this.MAX_PARTICIPANTS_IN_GAME) {
      return [null, { error: 'Game has been already full' }];
    }

    const newGameData: GameData = {
      ...game,
      playersData: {
        ...game.playersData,
        [participantId]: this.getDefaultPlayerData(participantId)
      }
    }

    this.games.set(gameId, newGameData);

    return [newGameData, null];
  }

  public handleParticipantLeave(participantId: string): void {
    const participantGame = this.getParticipantGame(participantId);

    if (!participantGame) {
      console.error(`Not found game for ${participantId} participant to handle game leave!`);
      return;
    }

    this.games.delete(participantGame.id);
  }

  public updatePlayerData(gameId: string, data: UpdatePlayerDataArg): Tuple<PlayerData[], GameActionError> {
    const game = this.games.get(gameId);
    if (!game) {
      return [null, { error: 'Game not found!' }];
    }

    if (Object.values(game.playersData).length < this.MAX_PARTICIPANTS_IN_GAME) {
      return [null, { error: 'Game not ready!' }];
    }

    if (data.ships) {
      game.playersData[data.id].ships = data.ships;
    }

    if (data.hits) {
      game.playersData[data.id].hits = data.hits;
      
      // TODO: Calc damage
    }

    this.games.set(gameId, game);

    return [Object.values(game.playersData), null];
  }

  private getDefaultPlayerData(playerId: string): PlayerData {
    return {
      id: playerId,
      ships: [],
      destroyedShips: [],
      hits: []
    };
  }
}