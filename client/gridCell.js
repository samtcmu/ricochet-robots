// Possible values for a cell.
export const EMPTY_CELL = 0;
export const INACCESSABLE_CELL = 1;
export const ROBOT_CELL = 2;

// Side of the Wall.
export const UP = 0;
export const DOWN = 1;
export const RIGHT = 2;
export const LEFT = 3;

// Color of target.
export const GREEN_TARGET = 0;
export const RED_TARGET = 1;
export const BLUE_TARGET = 2;
export const YELLOW_TARGET = 3;
export const WILD_TARGET = 4;

// Shape of target.
export const CRICLE_TARGET = 0;
export const TRIANGLE_TARGET = 1;
export const SQUARE_TARGET = 2;
export const HEXAGON_TARGET = 3;
export const VORTEX_TARGET = 4;

// The class will define the properties of a cell in the grid.
export class GridCell {
  constructor() {
    this.value = EMPTY_CELL;
    // The target is unique. It has a color and a shape. //
    // Set to null
    this.target = undefined;
    //
    this.walls = [];
  }

  // getCellValue function will return the value in cell.
  // returns an object
  getCellValue() {
    return this.value;
  }

  // setCellValue function will set the value in the cell.
  setCellValue(value) {
    this.value = value;
  }

  // getTargetOnCell function will return the target on the cell.
  getTargetOnCell() {
    return this.target;
  }
  // setTargetOnCell function will set a target in the cell.
  setTargetOnCell(color, shape) {
    this.target = {};
    this.target.color = color;
    this.target.shape = shape;
  }

  // setWallOnCell function will set walls on the cell given the side of the well.
  setWallOnCell(side) {
    this.walls.push(side);
  }

  getWalls() {
    return this.walls;
  }
}
