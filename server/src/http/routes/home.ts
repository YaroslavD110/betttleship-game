import { HttpRouteHandler } from '../types';

export const homeRouteHandler: HttpRouteHandler<string> = async () => {
  return 'Hello, World!';
}
