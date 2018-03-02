const LEFT = -1;
const RIGHT = 1;

let grid, busy, score;

const scoreSpan = document.getElementById('score');
const resultDiv = document.getElementById('result');
document.body.addEventListener('keydown', keyPressed);

function start() {
  grid = blankGrid();
  busy = false;
  score = 0;

  resultDiv.style.display = 'none';

  addNumber(grid);
  addNumber(grid);
  redraw(grid);
}

function blankGrid() {
  return new Array(4).fill().map(() => new Array(4).fill(0));
}

function addNumber(grid) {
  let state = check_grid(grid);

  if (state.won) {
    setResult('You Won!', 'hsl(120, 50%, 70%)', 'hsl(120, 50%, 20%)');
    return;
  }

  if (state.zeros > 0) {
    let done = false;

    while (!done) {
      const r = randomInt(0, 3);
      const c = randomInt(0, 3);

      if (grid[r][c] === 0) {
        grid[r][c] = Math.random() > 0.9 ? 4 : 2;
        done = true;
      }
    }

    state = check_grid(grid);
  }

  if (state.zeros === 0 && state.lost) {
    setResult('Try again', 'hsl(0, 70%, 30%)', 'hsl(0, 70%, 80%)');
  }
}

function check_grid(grid) {
  let zeros = 0;    // Count of empty cells
  let won = false;  // Assume we haven't won
  let lost = true;  // Assume no matching neighbours

  for (let r = 0; r < 4; ++r) {
    for (let c = 0; c < 4; ++c) {
      const value = grid[r][c];

      if (value === 0) zeros++;
      else if (value === 2048) {
        won = true;
        break;
      }

      if (lost && neighbours(grid, r, c).includes(value)) {
        lost = false;
      }
    }
  }

  return { zeros, won, lost };
}

// Check the neighbours in the four cardinal directions
function neighbours(grid, r, c) {
  const neighbours = [];

  if (c > 0) neighbours.push(grid[r][c - 1]);
  if (c < 3) neighbours.push(grid[r][c + 1]);

  if (r > 0) neighbours.push(grid[r - 1][c]);
  if (r < 3) neighbours.push(grid[r + 1][c]);

  return neighbours;
}

function slideRight(grid) {
  const slidGrid = new Array(4);

  const closeUp = prev => {
    const row = [0, 0, 0, 0];
    const full = prev.filter(cell => cell !== 0);
    const len = full.length;

    for (let c = 4 - len; c < 4; ++c) {
      row[c] = full[c - (4 - len)];
    }

    return row;
  };

  // For each row:
  //  close it up at the right-hand end
  //  Colaesce any adjacent numbers, make the left one 0
  //  Close up to the right again
  for (let r = 0; r < 4; ++r) {
    slidGrid[r] = closeUp(grid[r]);

    for (let c = 3; c > 0; --c) {
      if (slidGrid[r][c] === slidGrid[r][c - 1]) {
        slidGrid[r][c] *= 2;
        score += slidGrid[r][c];
        slidGrid[r][c - 1] = 0;
      }
    }

    slidGrid[r] = closeUp(slidGrid[r]);
  }

  return slidGrid;
}

// Rotate the grid to the right or left, this allows
// slide right to act in any direction
function rotate(grid, dir = RIGHT) {
  const rotGrid = blankGrid();

  for (let r = 0; r < 4; ++r) {
    for (let c = 0; c < 4; ++c) {
      const value = grid[r][c];

      if (dir === RIGHT) rotGrid[c][4 - (r + 1)] = value;
      else rotGrid[4 - (c + 1)][r] = value;
    }
  }

  return rotGrid;
}

// Miror the grid left to right, much faster than rotating
// twice.
// Mirroring and rotating twice do NOT make the same grid, 
// but the difference is immaterial in this case.
function mirror(grid) {
  const mGrid = blankGrid();

  for (let r = 0; r < 4; ++r) {
    for (let c = 0; c < 4; ++c) {
      mGrid[r][3 - c] = grid[r][c];
    }
  }

  return mGrid;
}

function redraw(grid) {
  const sizes = [64, 64, 54, 42];

  for (let r = 0; r < 4; ++r) {
    for (let c = 0; c < 4; ++c) {
      const value = grid[r][c];
      const cell = document.getElementById(`${r}-${c}`);

      if (value !== 0) {
        const log = Math.log(value) / Math.log(2);  // log base 2 of the content
        const valueStr = value.toString();

        cell.textContent = valueStr;
        cell.style.fontSize = sizes[valueStr.length - 1] + 'px';
        cell.style.background = `hsl(${160 + log * 6}, 77%, ${36 + log * 5}%)`;
      } else {
        cell.textContent = '';
        cell.style.background = 'none';
      }
    }
  }

  scoreSpan.textContent = score.toString();
}

function keyPressed(event) {
  let moved = true;

  // If we are in the middle of the pause before inserting a new number,
  // or the same is finished, ignore the keyboard
  if (busy) return;

  switch (event.code) {
    case 'ArrowDown':
      // Rotate down direction to the right
      grid = rotate(slideRight(rotate(grid, LEFT)), RIGHT);
      break;

    case 'ArrowLeft':
      // Mirror the grid, so slide goes left effectively
      grid = mirror(slideRight(mirror(grid)));
      break;

    case 'ArrowUp':
      // Rotate up direction to the right
      grid = rotate(slideRight(rotate(grid, RIGHT)), LEFT);
      break;

    case 'ArrowRight':
      // Simple slide right
      grid = slideRight(grid);
      break;

    default:
      moved = false;
      break;
  }

  if (moved) {
    busy = true;    // We're busy (waiting) 
    redraw(grid);
    setTimeout(() => {
      addNumber(grid);
      redraw(grid);
      busy = false;   // Finished insert and re-render
    }, 600);
  }
}

function setResult(text, bg, fg) {
  busy = true;

  resultDiv.querySelector('span').textContent = text;
  resultDiv.style.background = bg;
  resultDiv.style.color = fg;
  resultDiv.style.display = 'block';
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

start();