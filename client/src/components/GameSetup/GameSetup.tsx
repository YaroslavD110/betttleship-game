import React, { useEffect, useState } from 'react';

import { CellData, Game, ShipCellData, ShipData } from '../../shared/types';
import { getGridData, getShipDataForCell } from '../../shared/grid-utils';
import { GameGrid } from '../GameGrid/GameGrid';
import { Direction, GameState, GridMode, Position, WSMessageType } from '../../shared/constants';

import styles from './GameSetup.module.css';
import { Button } from '../Button/Button';

interface Props {
  game: Game;
}

export const GameSetup = (props: Props) => {
  const { game } = props;

  const [isGameReady, setGameStatus] = useState<boolean>(false);
  const [cells] = useState<CellData[][]>(getGridData);
  const [ships, setShips] = useState<ShipData[]>([]);

  const validateShipsCount = (candidateSize?: number): boolean => {
    const shipsCounter: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0
    };

    for (const ship of ships) {
      shipsCounter[ship.length] += 1;
    }

    if (candidateSize) {
      if (typeof shipsCounter[candidateSize] !== 'number') {
        return false;
      }

      shipsCounter[candidateSize] += 1

      return shipsCounter[1] <= 4 && shipsCounter[2] <= 3 && shipsCounter[3] <= 2 && shipsCounter[4] <= 1;
    }

    return shipsCounter[1] === 4 && shipsCounter[2] === 3 && shipsCounter[3] === 2 && shipsCounter[4] === 1;
  };

  const getShipDirection = (shipCells: CellData[]): Direction | null => {
    const haveSameHorizontalDirection = new Set(shipCells.map(cell => cell.rowIndex)).size === 1;
    const haveSameVerticalDirection = new Set(shipCells.map(cell => cell.colIndex)).size === 1;

    if (haveSameVerticalDirection) {
      return Direction.VERTICAL;
    } else if (haveSameHorizontalDirection) {
      return Direction.HORIZONTAL;
    } else {
      return null;
    }
  };

  const isShipDirectionInverse = (shipCells: ShipCellData[]): boolean => {
    const inverseCount = shipCells.filter(cell => cell.inverseDirection).length;
    const directCount = shipCells.length - inverseCount;

    return inverseCount > directCount;
  };

  const alignShipData = (shipCells: (ShipCellData | CellData)[]): ShipData | null => {
    if (shipCells.length === 0) {
      return null;
    }

    const direction = getShipDirection(shipCells);
    if (!direction) {
      return null;
    }

    let sortedCells: CellData[];
    if (direction === Direction.HORIZONTAL) {
      sortedCells = shipCells.sort((a, b) => a.colIndex - b.colIndex);
    } else {
      sortedCells = shipCells.sort((a, b) => a.rowIndex - b.rowIndex);
    }

    const isDirectionInverse = isShipDirectionInverse(
      shipCells.filter(cell => typeof (cell as ShipCellData).inverseDirection === 'boolean') as ShipCellData[]
    );

    return sortedCells.map((cell, index) => ({
      ...cell,
      direction,
      index: isDirectionInverse ? shipCells.length - (index + 1) : index,
      inverseDirection: isDirectionInverse,
      position: direction === Direction.HORIZONTAL
                  ? isDirectionInverse ? Position.RIGHT : Position.LEFT
                  : isDirectionInverse ? Position.DOWN : Position.UP,
      size: shipCells.length,
      isKilled: false
    }));
  };

  const getShipByCell = (shipCell: CellData): ShipData | null => {
    return ships.find(ship => ship.find(targetShipCell => targetShipCell.code === shipCell.code)) || null;
  };

  const getCloseCells = (cellData: CellData): CellData[] => {
    return [
      cells[cellData.rowIndex - 1]?.[cellData.colIndex],
      cells[cellData.rowIndex + 1]?.[cellData.colIndex],
      cells[cellData.rowIndex]?.[cellData.colIndex - 1],
      cells[cellData.rowIndex]?.[cellData.colIndex + 1]
    ].filter(Boolean);
  };

  const addNewShipForCell = (cellData: CellData) => {
    const closeCells = getCloseCells(cellData);
    const closeCellsShipData = closeCells.map(cell => getShipDataForCell(ships, cell)).filter(Boolean) as ShipCellData[];

    const resultShipSize = closeCellsShipData.reduce((acc, cur) => acc + cur.size, 1);
    if (!validateShipsCount(resultShipSize)) {
      console.error(`Ship with size ${resultShipSize} is not allowed!`);

      // TODO: Add error animation
      return;
    }

    const shipsToMerge = closeCellsShipData.map(cell => getShipByCell(cell)).filter(Boolean) as ShipData[];
    const newShip = alignShipData(shipsToMerge.reduce((acc, cur) => [...acc, ...cur], [cellData]));
    if (!newShip) {
      console.error('Ship cannot be composed!');

      // TODO: Add error animation
      return;
    }

    setShips(shipsData => {
      const filteredShipsData = shipsData.filter(
        ship => !ship.find(targetShipCell => closeCellsShipData.find(closeShipCell => closeShipCell.code === targetShipCell.code))
      );

      return [
        ...filteredShipsData,
        newShip
      ];
    });
  };

  const toggleShipDirection = (cellData: CellData) => {
    const shipData = getShipByCell(cellData) as ShipData;

    setShips(shipsData => {
      const filteredShipsData = shipsData.filter(
        ship => !ship.find(targetShipCell => targetShipCell.code === cellData.code)
      );

      const newShip = alignShipData(
        shipData.map((shipCell => ({ ...shipCell, inverseDirection: !shipCell.inverseDirection })))
      );
      
      if (!newShip) {
        return shipsData;
      }

      return [
        ...filteredShipsData,
        newShip
      ];
    });

    console.log(`Ship with size ${Object.values(shipData).length} was rotated!`);
  };

  const removeShipCell = (cellData: CellData) => {
    const shipData = getShipByCell(cellData) as ShipData;
    const cellShipData = shipData.find(targetCell => targetCell.code === cellData.code);

    if (cellShipData?.index !== 0 && cellShipData?.index !== shipData.length - 1) {
      console.error('You could remove only from edges!');
      return;
    }

    setShips(shipsData => {
      const filteredShipsData = shipsData.filter(
        ship => !ship.find(targetShipCell => targetShipCell.code === cellData.code)
      );

      const newShip = alignShipData(
        shipData.filter((cell) => cell.code !== cellData.code)
      );

      if (!newShip) {
        return filteredShipsData;
      }

      return [
        ...filteredShipsData,
        newShip
      ];
    });

    console.log(`Cell from ship with size ${Object.values(shipData).length} was removed!`);
  };

  const handleCellClick = (cellData: CellData, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();

    const isCellHasShipAlready = !!getShipDataForCell(ships, cellData);

    if (!isCellHasShipAlready) {
      addNewShipForCell(cellData);
      return;
    }

    // Handle mouse right click
    if (event.type === 'contextmenu') {
      removeShipCell(cellData);
    } else if (event.type === 'click') {
      toggleShipDirection(cellData);
    }
  };

  const handleReadyBtnClick = () => {
    game.toggleWaitingScreen(true);
    game.sendMessage({
      type: WSMessageType.GAME_SETUP,
      data: ships.map((ship) => ship.map(shipCell => shipCell.code))
    });
  };

  useEffect(() => {
    setGameStatus(validateShipsCount());
  }, [ships]);

  return (
    <div className={styles.wrap}>
      <GameGrid
        mode={GridMode.OWN}
        cells={cells}
        ships={ships}
        onCellClick={handleCellClick}
      />
      {isGameReady && <Button onClick={handleReadyBtnClick} text='READY' />}
    </div>
  )
};