import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { CreateGameResponse } from '@http/types';
import { WSGameConnectRequestMessage, WSGameConnectResponeMessage } from '@ws/types';

import styles from './HomeScreen.module.css';
import { Button } from '../Button/Button';
import { Game } from '../../shared/types';
import { useHttp } from '../../shared/hooks/use-http';
import { GameState, HttpMethod, WSMessageType } from '../../shared/constants';
import { useListenType } from '../../shared/hooks/use-listen-type';

interface Props {
  game: Game;
}

export const HomeScreen = (props: Props) => {
  const { game } = props;

  const [createGame, createGameResponse] = useHttp<CreateGameResponse>({ method: HttpMethod.POST, path: 'game/create' });
  const [inputValue, setInputValue] = useState('');

  const hadleCreateClick = () => {
    if (game.clientId) {
      createGame({ clientId: game.clientId });
    }
  };

  const hadleConnectClick = () => {
    if (!game.clientId) {
      toast.error('Unable connect to server :(');
    }

    if (!inputValue || inputValue.length !== 6) {
      toast.error('Invalid game code!');
    }

    game.sendMessage({
      type: WSMessageType.GAME_CONNECT,
      clientId: game.clientId,
      gameId: inputValue
    } as WSGameConnectRequestMessage);
  };

  useEffect(() => {
    if (createGameResponse?.gameId) {
      game.setGameId(createGameResponse.gameId);
      game.changeGameState(GameState.CREATED);
      game.toggleWaitingScreen(true);
    }
  }, [createGameResponse]);

  useListenType<WSGameConnectResponeMessage>(WSMessageType.GAME_CONNECT, (message) => {
    if (message.error) {
      toast.error(message.error);
      return;
    }

    game.changeGameState(GameState.SETUP);
    game.toggleWaitingScreen(false);
  }, game.lastMessage);

  return (
    <div className={styles.wrap}>
      <div className={styles.content}>
        <h1 className={styles.title}>Let`s start our game!</h1>
        <input
          className={styles.input}
          type="text"
          placeholder='Game code'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <div className={styles.btnWrap}>
          <Button
            text='Create'
            mode='secondary'
            onClick={hadleCreateClick}
          />
          <Button
            text='Connect'
            onClick={hadleConnectClick}
          />
        </div>
      </div>
    </div>
  );
};