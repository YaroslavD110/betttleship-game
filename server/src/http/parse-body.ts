import { IncomingMessage } from 'http';

export const parseBody = <B = unknown>(req: IncomingMessage): Promise<B | null> => {
  return new Promise((resolve, reject) => {
    let body: any = [];

    req
      .on('data', (chunk) => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();

        if (!body) {
          resolve(null);
          return;
        }
        
        console.log(req.headers['content-type']);
        if (req.headers['content-type']?.includes('text/plain')) {
          resolve(body);
        } else if (req.headers['content-type']?.includes('application/json')) {
          try {
            const bodyData = JSON.parse(body)
            
            resolve(bodyData);
          } catch (error) {
            console.error(error);
            reject(`Failed to parse body! Value: ${body}`);
          }
        } else {
          reject('Invalid body type!');
        }
      })
      .on('error', reject);
  });
}