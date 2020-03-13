// import GridCell from './gridCell';
// Possible colors for robots.
const GREEN_ROBOT = 0;
const RED_ROBOT = 1;
const BLUE_ROBOT = 2;
const YELLOW_ROBOT = 3;

// The class will define the Ricochet Grid
class RicochetGrid {
  constructor(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.robots = [
      { color: GREEN_ROBOT, row: undefined, column: undefined },
      { color: RED_ROBOT, row: undefined, column: undefined },
      { color: BLUE_ROBOT, row: undefined, column: undefined },
      { color: YELLOW_ROBOT, row: undefined, column: undefined },
    ];

    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      let row = [];
      for (let c = 0; c < this.columns; ++c) {
        // push a new grid cell into each column
        row.push(new GridCell());
      }
      this.grid.push(row);
    }
  }

  // getValue function will return the value in the cell at the input coordinate
  getValue(row, column) {
    return this.grid[row][column].getCellValue();
  }

  // setValue function will set the property of the cell.
  setValue(row, column, value) {
    this.grid[row][column].setCellValue(value);
  }

  // setTarget function will set the target in the cell.
  setTarget(row, column, color, shape) {
    this.grid[row][column].setTargetOnCell(color, shape);
  }

  // setWall function will set the wall(s) in the cell.
  setWall(row, column, side) {
    this.grid[row][column].setWallOnCell(side);
  }

  // getRobotPosition function will generate a random number used for row and column of robot.
  getRobotPosition(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  // robotPosition function will set the row and column for the input color of robot.
  robotPostion(color) {
    for (let i = 0; i < this.robots.length; i++) {
      if (this.robots[i].color === color) {
        let robotRow = this.getRobotPosition(this.rows);
        let robotColumn = this.getRobotPosition(this.columns);
        if (this.getValue(robotRow, robotColumn) === EMPTY_CELL) {
          this.robots[i].row = this.getRobotPosition(this.rows);
          this.robots[i].column = this.getRobotPosition(this.columns);
        } else {
          this.robotPostion(color);
        }
      }
    }
  }
}

// export default RicochetGrid;