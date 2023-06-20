import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';

import { WSConnectMessage } from '@ws/types';

import { GameSetup } from '../GameSetup/GameSetup';
import { WaitingScreen } from '../WaitingScreen/WaitingScreen';
import { HomeScreen } from '../HomeScreen/HomeScreen';
import { Game, ShipData, WSMessage, WSPayload } from '../../shared/types';
import { GameState, WSMessageType } from '../../shared/constants';
import { GameBoard } from '../GameBoard/GameBoard';
import { useListenType } from '../../shared/hooks/use-listen-type';

import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [showWaitingScreen, setWaitingScreenStatus] = useState(false);
  const [gameShips, setGameShips] = useState<ShipData[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.PENDING);
  const [wsState, setWsState] = useState<number>(WebSocket.CLOSED);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const webSockerRef = useRef<WebSocket>();

  const sendMessage = (payload: WSPayload) => {
    if (!webSockerRef.current || wsState !== WebSocket.OPEN) {
      console.error('Unable to send message!');
      return;
    }

    webSockerRef.current.send(JSON.stringify(payload));
  };

  const changeGameState = (state: GameState) => {
    setGameState(state);
  };

  useEffect(() => {
    if (webSockerRef.current) {
      return;
    }

    setWsState(WebSocket.CONNECTING);

    webSockerRef.current = new WebSocket('ws://localhost:8080');

    webSockerRef.current.addEventListener('message', (event) => {
      if (typeof event.data === 'string') {
        try {
          const payload = JSON.parse(event.data);

          setLastMessage(payload);
        } catch (error) {
          console.error(`Failed to parse WS message: ${event.data}`, error);
        }
      }
    });

    webSockerRef.current.addEventListener('open', () => {
      setWsState(WebSocket.OPEN);
    });

    webSockerRef.current.addEventListener('close', () => {
      setWsState(WebSocket.CLOSED);
    });
  }, []);

  useEffect(() => {
    console.log('WS STATE: ', wsState);
  }, [wsState]);

  useEffect(() => {
    console.log('NEW MESSAGE: ', lastMessage);
  }, [lastMessage]);

  useListenType<WSConnectMessage>(WSMessageType.WS_CONNECT, (message) => {
    setClientId(message.clientId);
  }, lastMessage);

  const game: Game = {
    sendMessage,
    changeGameState,
    setGameId,
    toggleWaitingScreen: setWaitingScreenStatus,
    id: gameId,
    state: gameState,
    lastMessage,
    clientId
  };

  if (showWaitingScreen) {
    return (
      <div className="App">
        <WaitingScreen game={game} />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="App">
      {showWaitingScreen && <WaitingScreen game={game} />}

      {gameState === GameState.PENDING && <HomeScreen game={game} />}
      {gameState === GameState.SETUP && <GameSetup game={game} setGameShips={setGameShips} />}
      {gameState === GameState.STARTED && <GameBoard game={game} gameShips={gameShips} />}

      <ToastContainer />
    </div>
  );
}

export default App;
