import React from 'react';
import { toast } from 'react-toastify';

import { WSGameConnectResponeMessage, WSGameSetupResponseMessage } from '@ws/types';

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
    } else if (game.state === GameState.SETUP) {
      return <><strong>Almost there!</strong><br /> We are waiting for your opponent to configure his board.</>;
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

  useListenType<WSGameSetupResponseMessage>(WSMessageType.GAME_SETUP, (message) => {
    if (message.error) {
      toast.error(message.error);
      return;
    }

    if (message.readyParticipantsIds.length === 2) {
      game.changeGameState(GameState.STARTED);
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