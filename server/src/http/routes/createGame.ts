import { GameManager } from '../../game/game-manager';
import { CreateGameResponse, HttpRouteHandler } from '../types';

interface Body {
  clientId: string;
}

export const createGameHandler: HttpRouteHandler<CreateGameResponse, Body> = async (req, res, gm: GameManager) => {
  if (!req.body?.clientId) {
    return {
      error: 'clientId field is empty',
      statusCode: 400
    };
  }

  const id = gm.genereateGameId();

  gm.createGame(id, [req.body?.clientId]);

  return { gameId: id };
};