import { randomBytes } from 'node:crypto';
import { Tuple } from '../ws/types';

export interface GameData {
  id: string;
  participantsIds: string[];
}

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
      participantsIds: gameParticipantsIds
    });
  }

  public getParticipantGame(participantId: string): GameData | null {
    for (const game of this.games.values()) {
      if (game.participantsIds.includes(participantId)) {
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

    if (game.participantsIds.length >= this.MAX_PARTICIPANTS_IN_GAME) {
      return [null, { error: 'Game has been already full' }];
    }

    const newGameData: GameData = {
      ...game,
      participantsIds: [
        ...game.participantsIds,
        participantId
      ]
    }

    this.games.set(gameId, newGameData);

    return [newGameData, null];
  }

  public handleParticipantLeft(participantId: string): void {
    const participantGame = this.getParticipantGame(participantId);

    if (!participantGame) {
      return;
    }

    if (participantGame.participantsIds.length === 1) {
      this.games.delete(participantGame.id);
    } else {
      this.games.set(
        participantGame.id,
        { ...participantGame, participantsIds: participantGame.participantsIds.filter(id => id !== participantId) }
      );
    }
  }
}