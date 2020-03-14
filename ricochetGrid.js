// import GridCell from './gridCell';
// Possible colors for robots.
const GREEN_ROBOT = 0;
const RED_ROBOT = 1;
const BLUE_ROBOT = 2;
const YELLOW_ROBOT = 3;

// Move Directions
const MOVE_UP = 0;
const MOVE_DOWN = 1;
const MOVE_RIGHT = 2;
const MOVE_LEFT = 3;

// The class will define the Ricochet Grid
class RicochetGrid {
  constructor(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.robots = {};
    this.robots[GREEN_ROBOT] = {
      color: GREEN_ROBOT,
      row: undefined,
      column: undefined,
    };
    this.robots[RED_ROBOT] = {
      color: RED_ROBOT,
      row: undefined,
      column: undefined,
    };
    this.robots[BLUE_ROBOT] = {
      color: BLUE_ROBOT,
      row: undefined,
      column: undefined,
    };
    this.robots[YELLOW_ROBOT] = {
      color: YELLOW_ROBOT,
      row: undefined,
      column: undefined,
    };

    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      let row = [];
      for (let c = 0; c < this.columns; ++c) {
        // push a new grid cell into each column
        row.push(new GridCell());
      }
      this.grid.push(row);
    }

    // make center inaccessable cells
    // the inaccessableCells are the four cells in the center of the board.
    let centerPoint = Math.floor(this.rows / 2);

    this.setValue(centerPoint - 1, centerPoint - 1, INACCESSABLE_CELL);
    this.setValue(centerPoint - 1, centerPoint, INACCESSABLE_CELL);
    this.setValue(centerPoint, centerPoint - 1, INACCESSABLE_CELL);
    this.setValue(centerPoint, centerPoint, INACCESSABLE_CELL);

    // set up board walls
    // The top and bottom boarders
    for (let c = 0; c < this.columns; c++) {
      this.setWall(0, c, UP);
      this.setWall(this.rows - 1, c, DOWN);
    }

    // The left and right boarders
    for (let r = 0; r < this.rows; r++) {
      this.setWall(r, 0, LEFT);
      this.setWall(r, this.columns - 1, RIGHT);
    }

    // set up inaccessable walls
    this.setWall(centerPoint - 1, centerPoint - 1, LEFT);
    this.setWall(centerPoint - 1, centerPoint - 1, UP);

    this.setWall(centerPoint - 1, centerPoint, UP);
    this.setWall(centerPoint - 1, centerPoint, RIGHT);

    this.setWall(centerPoint, centerPoint - 1, LEFT);
    this.setWall(centerPoint, centerPoint - 1, DOWN);

    this.setValue(centerPoint, centerPoint, RIGHT);
    this.setValue(centerPoint, centerPoint, DOWN);

    // A list of targets.
    this.targets = [];

    // A list of perviousTargets
    this.previousTargets = [];

    // The current Target.
    this.currentTarget = undefined;
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
    this.targets.push({ row: row, column: column, color: color, shape: shape });
  }

  // setWall function will set the wall(s) in the cell.
  setWall(row, column, side) {
    this.grid[row][column].setWallOnCell(side);
    if (side === LEFT && column > 0) {
      this.grid[row][column - 1].setWallOnCell(RIGHT);
    } else if (side === RIGHT && column < this.columns - 1) {
      this.grid[row][column + 1].setWallOnCell(LEFT);
    } else if (side === UP && row > 0) {
      this.grid[row - 1][column].setWallOnCell(DOWN);
    } else if (side === DOWN && row < this.rows - 1) {
      this.grid[row + 1][column].setWallOnCell(UP);
    }
  }

  // getRobotPosition function will generate a random number used for row and column of robot.
  generateRandomNumber(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  // robotPosition function will set the row and column for the input color of robot. While loop. Keep generating row and column number until you find an empty cell.
  initializedRobotPositions() {
    for (let key in this.robots) {
      let row = this.generateRandomNumber(this.rows);
      let column = this.generateRandomNumber(this.columns);
      while (this.getValue(row, column) !== EMPTY_CELL) {
        row = this.generateRandomNumber(this.rows);
        column = this.generateRandomNumber(this.columns);
      }
      this.robots[key].row = row;
      this.robots[key].column = column;
      this.setValue(row, column, ROBOT_CELL);
    }
  }

  // setInteriorWalls function will set the walls on the grid. given an array of all the walls
  setWalls(walls) {
    for (let i = 0; i < walls.length; i++) {
      this.setWall(walls[i].row, walls[i].column, walls[i].side);
    }
  }

  // setTargets function will set the targets on the grid given an array of all the targets.
  setTargets(targets) {
    for (let i = 0; i < targets.length; i++) {
      this.setTarget(
        targets[i].row,
        targets[i].column,
        targets[i].color,
        targets[i].shape
      );
    }
  }

  // pickNextTarget function will return the next target.
  pickNextTarget() {
    let randomTargetIdx = this.generateRandomNumber(this.targets.length - 1);
    let currentTarget = this.targets[randomTargetIdx];
    while (this.previousTargets.includes(currentTarget)) {
      randomTargetIdx = this.generateRandomNumber(this.targets.length - 1);
      currentTarget = this.targets[randomTargetIdx];
    }
    this.currentTarget = currentTarget;
    this.previousTargets.push(currentTarget);
  }

  // getCurrentTarget function returns the currentTarget.
  getCurrentTarget() {
    return this.currentTarget;
  }

  // getWalls function will return the walls in a given cell.
  getWalls(row, column) {
    return this.grid[row][column].walls;
  }

  // movesForRobot function will return the possible directions a given robot can move.
  movesForRobot(robot) {
    let possibleMoves = [];
    for (let key in this.robots) {
      if (this.robots[key].color === robot) {
        let robot = this.robots[key];
        let row = robot.row;
        let column = robot.column;
        let robotWalls = this.grid[robot.row][robot.column].getWalls();
        if (
          !robotWalls.includes(UP) &&
          this.getValue(row - 1, column) === EMPTY_CELL
        ) {
          possibleMoves.push(MOVE_UP);
        }
        if (
          !robotWalls.includes(DOWN) &&
          this.getValue(row + 1, column) === EMPTY_CELL
        ) {
          possibleMoves.push(MOVE_DOWN);
        }
        if (
          !robotWalls.includes(LEFT) &&
          this.getValue(row, column - 1) === EMPTY_CELL
        ) {
          possibleMoves.push(MOVE_LEFT);
        }
        if (
          !robotWalls.includes(RIGHT) &&
          this.getValue(row, column + 1) === EMPTY_CELL
        ) {
          possibleMoves.push(MOVE_RIGHT);
        }
        return possibleMoves;
      }
    }
  }
}

// export default RicochetGrid;
