import { IncomingMessage, ServerResponse } from 'node:http';

export type HttpRouteHandler<R = unknown, B = unknown> = (req: Request<B>, res: ServerResponse<IncomingMessage>, gm: GameManager) => Promise<R | ErrorResponse>;

export interface Request<B = unknown> extends IncomingMessage {
  body: B | null;
}

export interface ErrorResponse {
  error: string;
  statusCode?: number;
}

export interface CreateGameResponse {
  gameId: string;
}