const robotIdMap = {};
robotIdMap[GREEN_ROBOT] = 'green-robot';
robotIdMap[RED_ROBOT] = 'red-robot';
robotIdMap[BLUE_ROBOT] = 'blue-robot';
robotIdMap[YELLOW_ROBOT] = 'yellow-robot';

class RicochetRobots {
  constructor() {
    this.board = new RicochetGrid(16, 16);
    this.board.setWalls(walls);
    this.board.setTargets(targets);
    this.board.initializedRobotPositions();
    this.board.pickNextTarget();
    this.board.selectedRobotColor = undefined;

    this.currentRobots = this.deepCopyRobots(this.board.getRobots());
  }

  selectNewTarget() {
    // Deselect
    this.toggleTargetHightlight();
    this.board.pickNextTarget();
    this.toggleTargetHightlight();
    const solutionDiv = document.getElementById("solution");
    this.clearSolutionDiv(solutionDiv);

    // Save the current robots for the reset function.
    this.currentRobots = this.deepCopyRobots(this.board.getRobots());
  }

  resetRobots() {
    const robotSpans = {}

    const robots = this.board.getRobots()
    for (let key in robots) {
      let robotRowPosition = robots[key].row;
      let robotColumnPosition = robots[key].column;
      let robotColor = robots[key].color;

      // Remove the robot span and move it to the new position.
      // get the cell the contains the robot removeChild.
      let robotSpan = document.getElementById(`${robotIdMap[key]}`);
      robotSpan.parentNode.removeChild(robotSpan);
      robotSpans[robotColor] = robotSpan;
    }

    this.board.moveAllRobots(this.currentRobots);

    for (let key in this.currentRobots) {
      let row = this.currentRobots[key].row;
      let column = this.currentRobots[key].column;
      let robotColor = this.currentRobots[key].color;
      let cellSpan = document.getElementById(`${row}, ${column}`);
      cellSpan.appendChild(robotSpans[robotColor]);
    }
  }

  toggleTargetHightlight() {
    let target = this.board.getCurrentTarget();
    let targetRow = target.row;
    let targetColumn = target.column;
    let targetCell = document.getElementById(`${targetRow}, ${targetColumn}`);
    targetCell.classList.toggle('target-cell');
  }

  moveSelectedRobot(direction) {
    if (this.board.selectedRobotColor === undefined) {
      return;
    }

    // Remove the robot span and move it to the new position.
    // get the cell the contains the robot removeChild.
    let robotSpan = document.getElementById(
      `${robotIdMap[this.board.selectedRobotColor]}`
    );
    robotSpan.parentNode.removeChild(robotSpan);

    // when there is a selected robot.
    this.board.moveRobot(this.board.selectedRobotColor, direction);

    // move it to the span it belongs to.
    let robots = this.board.getRobots();
    let row = robots[this.board.selectedRobotColor].row;
    let column = robots[this.board.selectedRobotColor].column;
    let cellSpan = document.getElementById(`${row}, ${column}`);
    cellSpan.appendChild(robotSpan);
  }

  keyboardHandler(key) {
    let moveDirection = null;
    if (key === 'ArrowUp') {
      moveDirection = MOVE_UP;
    } else if (key === 'ArrowDown') {
      moveDirection = MOVE_DOWN;
    } else if (key === 'ArrowLeft') {
      moveDirection = MOVE_LEFT;
    } else if (key === 'ArrowRight') {
      moveDirection = MOVE_RIGHT;
    }
    this.moveSelectedRobot(moveDirection);
  }

  getRobotsAsString() {
    return JSON.stringify(this.board.getRobots());
  }

  deepCopyRobots(object) {
    return JSON.parse(JSON.stringify(object));
  }

  robotToString(robotId) {
    let output = "";

    if (robotId == GREEN_ROBOT) {
      output = "green robot";
    } else if (robotId == RED_ROBOT) {
      output = "red robot";
    } else if (robotId == BLUE_ROBOT) {
      output = "blue robot";
    } else if (robotId == YELLOW_ROBOT) {
      output = "yellow robot";
    }

    return output;
  }

  moveToString(move) {
    let output = "";

    if (move == UP) {
      output = "&uarr;";
    } else if (move == DOWN) {
      output = "&darr;";
    } else if (move == RIGHT) {
      output = "&rarr;";
    } else if (move == LEFT) {
      output = "&larr;";
    }

    return output;
  }

  clearSolutionDiv(solutionDiv) {
      while (solutionDiv.firstChild) {
        solutionDiv.removeChild(solutionDiv.firstChild)
      }
  }

  solveWithBfs() {
    let solution = this.bfs();
    this.drawSolution(solution);
  }

  solveWithDfs() {
    const solutionDiv = document.getElementById("solution");

    let solution = []
    for (let maxDepth = 0; maxDepth < 10; ++maxDepth) {
      const start = performance.now();
      solution = this.dfs(maxDepth);
      const end = performance.now();
      console.log(`Finished depth ${maxDepth} (${end - start} ms)`);
      if (solution !== undefined) {
        break;
      }
    }

    this.drawSolution(solution);
  }

  drawSolution(solution) {
    // Draw the path.
    if (solution !== undefined) {
      // Clear the contnts of the solution div.
      const solutionDiv = document.getElementById("solution");
      this.clearSolutionDiv(solutionDiv);
      solutionDiv.innerHTML = "Found solution: <br />";

      for (let i = 0; i < solution.length; ++i) {
        const robotColor = solution[i][0];
        const direction = solution[i][1];

        const cellSpan = document.createElement('span');
        cellSpan.classList.toggle('grid-cell');
        cellSpan.classList.toggle('empty-grid-cell');

        const robotSpan = document.createElement('span');
        robotSpan.classList.toggle('robot');
        if (robotColor === GREEN_ROBOT) {
          robotSpan.classList.toggle('green-robot');
        } else if (robotColor === RED_ROBOT) {
          robotSpan.classList.toggle('red-robot');
        } else if (robotColor === BLUE_ROBOT) {
          robotSpan.classList.toggle('blue-robot');
        } else if (robotColor === YELLOW_ROBOT) {
          robotSpan.classList.toggle('yellow-robot');
        }

        robotSpan.innerHTML = this.moveToString(direction);

        cellSpan.appendChild(robotSpan);
        solutionDiv.appendChild(cellSpan);
      }
    }
  }


  bfs() {
    let start = performance.now();
    let end = null;
    let maxDepthSoFar = 0;
    let initalRobots = this.deepCopyRobots(this.board.getRobots());
    let visited = new Set();
    let queue = [{ robots: initalRobots, depth: 0 , path: []}];
    while (queue.length > 0) {
      let currentState = queue.shift();
      let currentRobots = currentState.robots;
      let currentDepth = currentState.depth;
      visited.add(currentRobots);

      if (currentDepth > maxDepthSoFar) {
        end = performance.now();
        console.log(`Finished Depth: ${maxDepthSoFar} (${end - start} ms)`);
        maxDepthSoFar = currentDepth;
        start = end;
      }

      // This reset the robots position
      this.board.moveAllRobots(currentRobots);

      // Check if final target has been reached.
      if (this.board.reachedTarget()) {
        this.board.moveAllRobots(initalRobots);
        return currentState.path;
      }

      for (let key in currentRobots) {
        let movesForRobot = this.board.movesForRobot(currentRobots[key].color);
        for (let i = 0; i < movesForRobot.length; i++) {
          this.board.moveRobot(currentRobots[key].color, movesForRobot[i]);
          let newRobotPostions = this.deepCopyRobots(this.board.getRobots());
          this.board.moveAllRobots(currentRobots);

          if (!visited.has(newRobotPostions)) {
            let path = [...currentState.path];
            path.push([currentRobots[key].color, movesForRobot[i]]);

            queue.push({
                robots: newRobotPostions,
                depth: currentDepth + 1,
                path: path
            });
          }
        }
      }
    }

    this.board.moveAllRobots(initalRobots);
    return undefined;
  }

  dfs(maxDepth) {
    let initalRobots = this.deepCopyRobots(this.board.getRobots());
    let visited = new Set();
    let stack = [{ robots: initalRobots, depth: 0 , path: []}];
    while (stack.length > 0) {
      let currentState = stack.pop();
      let currentRobots = currentState.robots;
      let currentDepth = currentState.depth;
      visited.add(currentRobots);

      // This reset the robots position
      this.board.moveAllRobots(currentRobots);

      // If we've reached the maximum depth from the start state don't visit
      // any neighbors.
      if (currentDepth >= maxDepth) {
        // Check if final target has been reached.
        if (this.board.reachedTarget()) {
          this.board.moveAllRobots(initalRobots);
          return currentState.path;
        }
        continue;
      }

      for (let key in currentRobots) {
        let movesForRobot = this.board.movesForRobot(currentRobots[key].color);
        for (let i = 0; i < movesForRobot.length; i++) {
          this.board.moveRobot(currentRobots[key].color, movesForRobot[i]);
          let newRobotPostions = this.deepCopyRobots(this.board.getRobots());
          this.board.moveAllRobots(currentRobots);

          if (!visited.has(newRobotPostions)) {
            let path = [...currentState.path];
            path.push([currentRobots[key].color, movesForRobot[i]]);

            stack.push({
                robots: newRobotPostions,
                depth: currentDepth + 1,
                path: path
            });
          }
        }
      }
    }

    this.board.moveAllRobots(initalRobots);
    return undefined;
  }

  draw(parentNode) {
    // Draw empty cells for the board.
    for (let r = 0; r < this.board.getRows(); r++) {
      let newDiv = document.createElement('div');
      newDiv.classList.toggle('grid-row');
      for (let c = 0; c < this.board.getColumns(); c++) {
        let newSpan = document.createElement('span');
        newSpan.id = `${r}, ${c}`;

        // Draw cell.
        newSpan.classList.toggle('grid-cell');
        if (this.board.getValue(r, c) === INACCESSABLE_CELL) {
          newSpan.classList.toggle('inaccessable-grid-cell');
        } else {
          newSpan.classList.toggle('empty-grid-cell');
        }

        // Draw walls.
        let cellWalls = this.board.getWalls(r, c);
        if (cellWalls.includes(UP)) {
          newSpan.classList.toggle('top-wall');
        }
        if (cellWalls.includes(DOWN)) {
          newSpan.classList.toggle('bottom-wall');
        }
        if (cellWalls.includes(LEFT)) {
          newSpan.classList.toggle('left-wall');
        }
        if (cellWalls.includes(RIGHT)) {
          newSpan.classList.toggle('right-wall');
        }

        newDiv.appendChild(newSpan);
      }
      parentNode.appendChild(newDiv);
    }

    // Draw targets.
    let targets = this.board.getTargets();
    for (let i = 0; i < targets.length; i++) {
      let targetRow = targets[i].row;
      let targetColumn = targets[i].column;
      let targetColor = targets[i].color;
      let targetShape = targets[i].shape;

      let targetSpan = document.createElement('span');

      if (targetColor === RED_TARGET) {
        targetSpan.classList.toggle('red-target');
      } else if (targetColor === GREEN_TARGET) {
        targetSpan.classList.toggle('green-target');
      } else if (targetColor === BLUE_TARGET) {
        targetSpan.classList.toggle('blue-target');
      } else if (targetColor === YELLOW_TARGET) {
        targetSpan.classList.toggle('yellow-target');
      } else if (targetColor === WILD_TARGET) {
        targetSpan.classList.toggle('wild-target');
      }

      if (targetShape === SQUARE_TARGET) {
        targetSpan.classList.toggle('square-target');
      } else if (targetShape === CRICLE_TARGET) {
        targetSpan.classList.toggle('circle-target');
      } else if (targetShape === TRIANGLE_TARGET) {
        targetSpan.classList.toggle('triangle-target');
      } else if (targetShape === HEXAGON_TARGET) {
        targetSpan.classList.toggle('hexagon-target');
      } else if (targetShape === VORTEX_TARGET) {
        targetSpan.classList.toggle('vortex-target');
      }

      let cellSpan = document.getElementById(`${targetRow}, ${targetColumn}`);
      cellSpan.appendChild(targetSpan);
    }

    // Draw Robots
    let robots = this.board.getRobots();
    for (let key in robots) {
      let robotRowPosition = robots[key].row;
      let robotColumnPosition = robots[key].column;
      let robotColor = robots[key].color;

      let robotSpan = document.createElement('span');
      robotSpan.classList.toggle('robot');

      robotSpan.addEventListener('mouseup', event => {
        // Deselect the previously selected robot.
        if (this.board.selectedRobotColor !== undefined) {
          let robotId = robotIdMap[this.board.selectedRobotColor];
          let selectedRobotSpan = document.getElementById(robotId);
          selectedRobotSpan.classList.toggle('selected-robot');
        }

        // Select a the clicked robot.
        event.target.classList.toggle('selected-robot');
        if (event.target.id === 'green-robot') {
          this.board.selectedRobotColor = GREEN_ROBOT;
        } else if (event.target.id === 'red-robot') {
          this.board.selectedRobotColor = RED_ROBOT;
        } else if (event.target.id === 'blue-robot') {
          this.board.selectedRobotColor = BLUE_ROBOT;
        } else if (event.target.id === 'yellow-robot') {
          this.board.selectedRobotColor = YELLOW_ROBOT;
        }
      });

      if (robotColor === GREEN_ROBOT) {
        robotSpan.id = 'green-robot';
        robotSpan.classList.toggle('green-robot');
      } else if (robotColor === RED_ROBOT) {
        robotSpan.id = 'red-robot';
        robotSpan.classList.toggle('red-robot');
      } else if (robotColor === BLUE_ROBOT) {
        robotSpan.id = 'blue-robot';
        robotSpan.classList.toggle('blue-robot');
      } else if (robotColor === YELLOW_ROBOT) {
        robotSpan.id = 'yellow-robot';
        robotSpan.classList.toggle('yellow-robot');
      }

      let cellSpan = document.getElementById(
        `${robotRowPosition}, ${robotColumnPosition}`
      );
      cellSpan.appendChild(robotSpan);
    }

    // Hightlight current target cell.
    this.toggleTargetHightlight();
  }
}

let ricochetRobots = undefined;
function loadApp() {
  ricochetRobots = new RicochetRobots();
  ricochetRobots.draw(document.getElementById('grid-canvas'));
  document.addEventListener('keydown', event => {
    ricochetRobots.keyboardHandler(event.key);
  });
}
