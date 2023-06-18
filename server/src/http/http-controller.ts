import { IncomingMessage, Server, ServerResponse } from 'node:http';

import { HttpMethod } from './constants';
import { ErrorResponse, HttpRouteHandler, Request } from './types';
import { homeRouteHandler } from './routes/home';
import { GameManager } from '../game/game-manager';
import { createGameHandler } from './routes/createGame';
import { parseBody } from './parse-body';

export class HttpServer {
  private readonly controllersMap: Record<string, HttpRouteHandler<any, any>> = {
    [`${HttpMethod.GET}:/`]: homeRouteHandler,
    [`${HttpMethod.POST}:/game/create`]: createGameHandler
  };

  constructor(
    private readonly server: Server<typeof IncomingMessage, typeof ServerResponse>,
    private readonly gm: GameManager
  ) {}
  
  private getRouteHandler(method: string | undefined, path: string | undefined): HttpRouteHandler | null {
    return this.controllersMap[`${method?.toUpperCase()}:${path}`] || null;
  }
  
  public async handleRequest(req: IncomingMessage, res: ServerResponse<IncomingMessage>): Promise<void> {
    const handler = this.getRouteHandler(req.method, req.url);
  
    console.log(`${new Date().toJSON()} New incomming request ${req.method} to ${req.url}`);
  
    // Set common headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === HttpMethod.OPTIONS) {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (!handler) {
      res.statusCode = 404;
      res.statusMessage = 'Not Found!';
      res.end();
  
      return;
    }
  
    try {
      const reqestObject = req as Request;

      reqestObject.body = await parseBody(req);

      const result = await handler(reqestObject, res, this.gm);
  
      if (typeof result === 'string') {
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(result);
      } else if (typeof result === 'object' && (result as ErrorResponse).error) {
        const json = JSON.stringify(result);
  
        res.statusCode = (result as ErrorResponse).statusCode || 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(json);
      } else if (typeof result === 'object') {
        const json = JSON.stringify(result);
  
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(json);
      }
    } catch (error) {
      console.error(error);
  
      res.statusCode = 500;
      res.statusMessage = 'Internal Error!';
      res.end();
    }
  }
}