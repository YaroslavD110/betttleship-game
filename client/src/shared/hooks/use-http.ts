import { useState } from 'react';
import { HttpMethod } from '../constants';

export interface HttpParams {
  path: string;
  method?: HttpMethod;
}

export const useHttp = <D = unknown>(params: HttpParams): [(payload?: string | object) => void, D | null, boolean] => {
  const { path, method = HttpMethod.GET } = params;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<D | null>(null);

  const request = (payload?: string | object) => {
    setIsLoading(true);

    fetch(`http://localhost:8080/${path}`, {
      method,
      body: payload
              ? typeof payload === 'object' ? JSON.stringify(payload) : payload
              : undefined,
      headers: new Headers({
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': payload ? 'application/json;charset=utf-8' : 'text/plain;charset=UTF-8'
      })
    })
      .then(res => res.json())
      .then(res => {
        setIsLoading(false);
        setResponse(res);
      })
      .catch(error => {
        setIsLoading(false);
        setResponse(null);
        console.error(error);
      })
  };

  return [request, response, isLoading];
};