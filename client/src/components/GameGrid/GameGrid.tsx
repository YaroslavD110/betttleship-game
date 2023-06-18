import React from 'react';

import styles from './GameGrid.module.css';

import { Cell } from '../Cell/Cell';

import { GRID_ROW_KEYS, GRID_COL_KEYS, GridMode, SHIP_LABEL_BY_SIZE } from '../../shared/constants';
import { CellData, ShipData } from '../../shared/types';
import { getShipDataForCell } from '../../shared/grid-utils';

interface Props {
  mode: GridMode;
  cells: CellData[][];
  ships: ShipData[];
  hitMap?: Record<string, CellData>;
  onCellClick?: (cellData: CellData, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export const GameGrid = (props: Props) => {
  const { cells, hitMap, ships, onCellClick } = props;

  const getShipsDetails = (): string[] => {
    const shipsDetails: Record<number, { count: number, label: string }> = {};

    for (const ship of ships) {
      const shipSize = ship[0].size;
      if (!shipsDetails[shipSize]) {
        shipsDetails[shipSize] = {
          count: 1,
          label: SHIP_LABEL_BY_SIZE[shipSize] || 'Unknown'
        };
      } else {
        shipsDetails[shipSize] = {
          ...shipsDetails[shipSize],
          count: shipsDetails[shipSize].count + 1
        };
      }
    }

    return Object.values(shipsDetails).map((info) => `${info.count} - ${info.label}`);
  };

  const isCellHitted = (cellData: CellData): boolean => {
    return !!hitMap?.[cellData.code];
  }

  return (
    <div className={styles.grid}>
      <div className={styles.row}>
        <div className={styles.spacerCell} />
        {GRID_COL_KEYS.map((letter, index) => <div key={letter + index} className={styles.headerCell}>{letter}</div>)}
      </div>
      {cells.map((rowCells, rowIndex) => (
        <div key={'R' + rowIndex} className={styles.row}>
          <div className={styles.headerCell}>{GRID_ROW_KEYS[rowIndex]}</div>
          {rowCells.map((cellData) => (
            <Cell
              {...cellData}
              key={cellData.code}
              isHitted={isCellHitted(cellData)}
              mode={props.mode}
              shipData={getShipDataForCell(ships, cellData)}
              onClick={(event) => typeof onCellClick === 'function' && onCellClick(cellData, event)}
            />
          ))}
        </div>
      ))}
      {ships.length > 0 && (
        <div className={styles.shipDetailsWrap}>
          <h3 className={styles.shipDetailsTitle}>
            {props.mode === GridMode.OWN ? 'SHIPYARD' : 'GRAVEYARD'}
          </h3>
          <div className={styles.shipDetailsContent}>
            {getShipsDetails().map((text, index) => <span key={index}>{text}</span>)}
          </div>
        </div>
      )}
    </div>
  );
};