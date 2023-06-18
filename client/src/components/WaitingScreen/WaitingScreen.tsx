import React from 'react';
import { toast } from 'react-toastify';

import { WSGameConnectResponeMessage } from '@ws/types';

import styles from './WaitingScreen.module.css';
import { Game } from '../../shared/types';
import { GameState, WSMessageType } from '../../shared/constants';
import { useListenType } from '../../shared/hooks/use-listen-type';

interface Props {
  game: Game;
}

export const WaitingScreen = (props: Props) => {
  const { game } = props;

  const getStatusMessage = () => {
    if (game.state === GameState.CREATED && game.id) {
      return `Ask you opponent enter this code: ${game.id}`;
    }
  };

  useListenType<WSGameConnectResponeMessage>(WSMessageType.GAME_CONNECT, (message) => {
    if (message.error) {
      toast.error(message.error);
      return;
    }

    if (game.state === GameState.CREATED) {
      game.changeGameState(GameState.SETUP);
      game.toggleWaitingScreen(false);
    }
  }, game.lastMessage);

  return (
    <div className={styles.all}>
      <div className={styles.container}>
        <div className={styles.top}></div>
        <div className={styles.innerOval}>
          <div className={styles.circle1}></div>
          <div className={styles.circle2}></div>
          <div className={styles.circle3}></div>
        </div>
      </div>
      <h4 className={styles.statusText}>{getStatusMessage()}</h4>
    </div>
  );
};