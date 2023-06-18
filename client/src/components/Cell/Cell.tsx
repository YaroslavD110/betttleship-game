import React from 'react';

import styles from './Cell.module.css';

import { CellData, ShipCellData } from '../../shared/types';
import classNames from 'classnames';
import { Direction, GridMode, Position } from '../../shared/constants';

interface Props extends CellData {
  mode: GridMode;
  isHitted: boolean;
  shipData?: ShipCellData | null;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Cell = (props: Props) => {
  const { mode, shipData, isHitted, onClick } = props;

  const showShip = shipData && (mode === GridMode.OWN || shipData.isKilled);
  const isShipBodyPart = shipData && shipData.index !== 0 && shipData.index !== shipData.size - 1;
  const isHead = shipData && shipData.index === 0;
  const isTail = shipData && shipData.index === shipData.size - 1;

  return (<div onClick={onClick} onContextMenu={onClick} className={classNames(styles.cell, {
    [styles.cellPrimary]: mode === GridMode.OWN,
    [styles.cellSecondary]: mode === GridMode.ENEMY
  })}>
    {showShip && <div className={classNames(styles.shipPart, {
      [styles.shipOneCell]: shipData.size === 1,

      [styles.shipBodyHorizontal]: isShipBodyPart && shipData.direction === Direction.HORIZONTAL,
      [styles.shipBodyVertical]: isShipBodyPart && shipData.direction === Direction.VERTICAL,
      
      [styles.shipHeadUp]: isHead && shipData.position === Position.UP && shipData.direction === Direction.VERTICAL,
      [styles.shipHeadDown]: isHead && shipData.position === Position.DOWN && shipData.direction === Direction.VERTICAL,
      [styles.shipHeadRight]: isHead && shipData.position === Position.RIGHT && shipData.direction === Direction.HORIZONTAL,
      [styles.shipHeadLeft]: isHead && shipData.position === Position.LEFT && shipData.direction === Direction.HORIZONTAL,
  
      [styles.shipTailUp]: isTail && shipData.position === Position.UP && shipData.direction === Direction.VERTICAL,
      [styles.shipTailDown]: isTail && shipData.position === Position.DOWN && shipData.direction === Direction.VERTICAL,
      [styles.shipTailRight]: isTail && shipData.position === Position.RIGHT && shipData.direction === Direction.HORIZONTAL,
      [styles.shipTailLeft]: isTail && shipData.position === Position.LEFT && shipData.direction === Direction.HORIZONTAL
    })} />}
    {isHitted && <div className={classNames(styles.hit, {
      [styles.hitMissPrimary]: !showShip && mode === GridMode.OWN,
      [styles.hitMissSecondary]: !showShip && mode === GridMode.ENEMY
    })} />}
  </div>);
}