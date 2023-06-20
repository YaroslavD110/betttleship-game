import React, { useState } from 'react';

import styles from './GameBoard.module.css';

import { GameGrid } from '../GameGrid/GameGrid';
import { CellData, Game, ShipData } from '../../shared/types';
import { getGridData } from '../../shared/grid-utils';
import { GridMode } from '../../shared/constants';

interface Props {
  game: Game;
  gameShips: ShipData[];
}

export const GameBoard = (props: Props) => {
  const { game, gameShips } = props;

  const [cells] = useState<CellData[][]>(getGridData);
  const [hitMap, setHitMap] = useState<Record<string, CellData>>({});

  return (
    <div className={styles.wrap}>
      <div className={styles.boardSide}>
        <h2 className={styles.boardHeader}>YOUR FLEET</h2>
        <GameGrid
          mode={GridMode.OWN}
          cells={cells}
          hitMap={hitMap}
          ships={gameShips}
        />
      </div>
      <div className={styles.boardSide}>
        <h2 className={styles.boardHeader}>OPPONENT</h2>
        <GameGrid
          mode={GridMode.ENEMY}
          cells={cells}
          hitMap={hitMap}
          ships={gameShips}
        />
      </div>
    </div>
  )
};