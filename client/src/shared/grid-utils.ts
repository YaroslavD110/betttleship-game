import { GRID_COL_KEYS, GRID_ROW_KEYS } from './constants';
import { CellData, ShipCellData, ShipData } from './types';

export const getGridData = () => {
  const cells = new Array<CellData[]>();

  for (let rowIndex = 0; rowIndex < GRID_ROW_KEYS.length; rowIndex++) {
    if (!Array.isArray(cells[rowIndex])) {
      cells.push([]);
    }

    for (let colIndex = 0; colIndex < GRID_COL_KEYS.length; colIndex++) {
      cells[rowIndex].push({
        code: GRID_COL_KEYS[colIndex] + GRID_ROW_KEYS[rowIndex],
        rowIndex,
        colIndex
      });
    }
  }

  return cells;
};

export const getShipDataForCell = (ships: ShipData[], cellData: CellData): ShipCellData | null => {
  for (const shipData of ships) {
    const cellShipData = shipData.find((targetShipCell) => targetShipCell.code === cellData.code);
    if (cellShipData) {
      return cellShipData;
    }
  }

  return null;
}