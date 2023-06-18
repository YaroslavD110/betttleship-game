import { createServer } from 'node:http';

import { HttpServer } from './http/http-controller';
import { WSServer } from './ws/ws-controller';
import { GameManager } from './game/game-manager';

const server = createServer();

const gameManager = new GameManager();
const ws = new WSServer(server, gameManager);
const httpServer = new HttpServer(server, gameManager)

server.addListener('request', (req, res) => httpServer.handleRequest(req, res));

server.listen(8080);
ws.listen();

console.log('Server is running on the port 8080!');