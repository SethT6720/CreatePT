//Declare element vars
const startScreen = document.getElementById('startScreen');
const instructions = document.getElementById('instructions');
const winScreen = document.getElementById('winScreen');

const startButton = startScreen.querySelector('button');
const playAgain = winScreen.querySelector('button');

//Declare canvas object
//Most values are temporary and are dynamically set inside the setCanDims() function 
let canvas = {
  ele: document.getElementById('canvas'),
  ctx: document.getElementById('canvas').getContext('2d'),
  height: 0,
  width: 0,

  gameRect: { x: 0, y: 0, height: 0, width: 0 },
  squareSize: 0,

  inGame: false
}

/* 
Game will be a 4x4 grid of squares drawn on the canvas with one open spot
Positions will hold an array with all the squares and their position which will be filled with the populatePositions function
Each square will be represented by an object with a position and an id
Position is the position on the board and id is the number shown on the square
The goal of the game is to arrange the number in order from 1 to 15 like shown in the diagram
The following will be the 'ids' of each position on the grid
Square 16 will be the open spot
  _  _  _  _ 
 |1 |2 |3 |4 |
 |5 |6 |7 |8 |
 |9 |10|11|12|
 |13|14|15|16|
  -  -  -  -
*/

//Declare game vars
let positions = [];

//Event Listeners
startButton.addEventListener('click', () => {
  startScreen.classList.add('hide');
  canvas.ele.classList.remove('hide');
  newGame();
});

playAgain.addEventListener('click', () => {
  winScreen.classList.add('hide');
  canvas.ele.classList.remove('hide');
  newGame();
});

window.addEventListener('click', (e) => {
  if (canvas.inGame) {
    let x = e.clientX;
    let y = e.clientY;

    let square = squareClicked(x, y);
    if (square) {
      clickSquare(square.id);
    }

    if (checkWin()) {
      winScreen.classList.remove('hide');
      canvas.ele.classList.add('hide');
      canvas.inGame = false;
    }
  }
});

window.addEventListener('resize', setCanDims);

//Declare game functions

//Start a new round
function newGame() {
  populatePositions();
  setCanDims();
  canvas.inGame = true;
}

//Returns true if all squares are in the correct places
function checkWin() {
  let correct = true;
  positions.forEach((sqr) => {
    if (!sqr.correct) {
      correct = false;
    }
  });
  return correct;
}

//Draws the current board state on the canvas
function draw() {
  //Clear then Draw Grid
  canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvas.ctx.fillStyle = 'white';
  canvas.ctx.strokeStyle = 'black';

  canvas.ctx.fillRect(canvas.gameRect.x, canvas.gameRect.y, canvas.gameRect.width, canvas.gameRect.height);
  for (let i = 0; i < 4; i++) {
    for (let k = 0; k < 4; k++) {
      canvas.ctx.strokeRect(canvas.gameRect.x + (k * canvas.squareSize), canvas.gameRect.y + (i * canvas.squareSize), canvas.squareSize, canvas.squareSize);
    }
  }

  //Draw Numbers
  positions.forEach((square) => {
    if (square.id !== 'empty') {
      let x = (canvas.gameRect.x + square.col * canvas.squareSize) + (canvas.squareSize / 2);
      let y = (canvas.gameRect.y + square.row * canvas.squareSize) + (canvas.squareSize / 2);
      canvas.ctx.fillStyle = 'black';
      canvas.ctx.textAlign = 'center';
      canvas.ctx.font = `${Math.floor(canvas.squareSize / 2)}px Arial`;
      canvas.ctx.textBaseline = 'middle';

      canvas.ctx.fillText(square.id, x, y);
    }
  });
}

//Returns the square at the given coordinates, or null if none is found
function squareClicked(x, y) {
  let row = Math.floor((y - canvas.gameRect.y) / canvas.squareSize);
  let col = Math.floor((x - canvas.gameRect.x) / canvas.squareSize);

  if (row >= 0 && row <= 3 && col >= 0 && col <= 3) {
    let square = positions.find((square) => square.row === row && square.col === col);
    return square;
  }

  return null;
}

//'Clicks' the square with the give id
function clickSquare(id) {
  let canMove = checkMove(id);

  let square = positions.find((sqr) => sqr.id == id);
  let empty = positions.find((sqr) => sqr.id == 'empty');

  if (canMove) {
    let temp = square.position;
    square.position = empty.position;
    empty.position = temp;
  }

  draw();
}

//Returns true if the square with the given id can be moved
function checkMove(id) {
  let square = positions.find((sqr) => sqr.id == id);
  let empty = positions.find((sqr) => sqr.id === 'empty');

  if ((square.row == empty.row && (square.col == empty.col - 1 || square.col == empty.col + 1)) || (square.col == empty.col && (square.row == empty.row - 1 || square.row == empty.row + 1))) {
    return true;
  }

  return false;
}

//Set the dimesions of the canvas
function setCanDims() { //Set dimensions of the canvas
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  canvas.ele.height = canvas.height;
  canvas.ele.width = canvas.width;

  //Set gameRect to a centered square 75% of the height of the window
  canvas.gameRect.x = canvas.width / 2 - canvas.height * 0.375;
  canvas.gameRect.y = canvas.height / 2 - canvas.height * 0.375;
  canvas.gameRect.height = canvas.height * 0.75;
  canvas.gameRect.width = canvas.gameRect.height;

  canvas.squareSize = canvas.gameRect.height / 4;

  draw();
}

//Populates the positions array with the correct positions, then makes random moves to randomize the board
function populatePositions() {
  //Generate a solved board
  positions = [];
  for (let i = 1; i < 16; i++) {
    positions.push({
      position: i,
      id: i,
      get row() {
        return Math.floor((this.position + 3) / 4) - 1;
      },
      get col() {
        return (this.position + 3) % 4;
      },
      get correct() {
        return this.id === this.position;
      }
    });
  }
  positions.push({
    id: 'empty',
    position: 16,
    get row() {
      return Math.floor((this.position + 3) / 4) - 1;
    },
    get col() {
      return (this.position + 3) % 4;
    },
    get correct() {
      return 16 === this.position;
    }
  });
  let empty = positions[positions.length - 1];
  
  //Do random moves to shuffle the board
  for (let i = 0; i < 500; i++) {
    // 0 = up, 1 = down, 2 = left, 3 = right
    let direction = Math.floor(Math.random() * 4);
    switch (direction) {
      case 0:
        if (empty.row > 0) {
          let switchSquare = positions.find((sqr) => { return sqr.position === empty.position - 4 });
          let temp = empty.position;
          empty.position = switchSquare.position;
          switchSquare.position = temp;
          break;
        }
      case 1:
        if (empty.row < 3) {
          let switchSquare = positions.find((sqr) => { return sqr.position === empty.position + 4 });
          let temp = empty.position;
          empty.position = switchSquare.position;
          switchSquare.position = temp;
          break;
        }
      case 2:
        if (empty.col > 0) {
          let switchSquare = positions.find((sqr) => { return sqr.position === empty.position - 1 });
          let temp = empty.position;
          empty.position = switchSquare.position;
          switchSquare.position = temp;
          break;
        }
      case 3:
        if (empty.col < 3) {
          let switchSquare = positions.find((sqr) => { return sqr.position === empty.position + 1 });
          let temp = empty.position;
          empty.position = switchSquare.position;
          switchSquare.position = temp;
          break;
        }
      default:
        console.log("didn't move");
        break;
    }
  }

  //Move the empty square to the bottom right
  let rowsToMove = 3 - empty.row;
  let colsToMove = 3 - empty.col;

  for (let i = 0; i < rowsToMove; i++) {
    let switchSquare = positions.find((sqr) => { return sqr.position === empty.position + 4 });
    let temp = empty.position;
    empty.position = switchSquare.position;
    switchSquare.position = temp;
  }
  for (let i = 0; i < colsToMove; i++) {
    let switchSquare = positions.find((sqr) => { return sqr.position === empty.position + 1 });
    let temp = empty.position;
    empty.position = switchSquare.position;
    switchSquare.position = temp;
  }
}