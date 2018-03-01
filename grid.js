let grid = blankGrid();

const LEFT = -1;
const RIGHT = 1;

let busy = false;

function blankGrid() {
  return new Array(4).fill().map(() => new Array(4).fill(0));
}

function addNumber(grid) {
  const state = check_grid(grid);
  console.log(state);

  if (state.won) {
    console.log('You won');
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
  }
  else if (state.lost) {
    console.log('You lost');
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

      if (value === 2048) {
        won = true;
        break;
      }

      if (lost && neighbours(grid, r, c).includes(value)) {
        lost = false;
      }
    }
  }

  return {
    zeros, won, lost
  };
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

  for (let r = 0; r < 4; ++r) {
    slidGrid[r] = closeUp(grid[r]);

    for (let c = 3; c > 0; --c) {
      if (slidGrid[r][c] === slidGrid[r][c - 1]) {
        slidGrid[r][c] *= 2;
        slidGrid[r][c - 1] = 0;
      }
    }

    slidGrid[r] = closeUp(slidGrid[r]);
  }

  return slidGrid;
}

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
        const log = Math.log(value) / Math.log(2);
        const valueStr = value.toString();

        cell.textContent = valueStr;
        cell.style.fontSize = sizes[valueStr.length - 1] + 'px';
        cell.style.background = `hsl(${176 + log * 5}, 77%, ${36 + log * 6}%)`;
      } else {
        cell.textContent = '';
        cell.style.background = 'none';
      }
    }
  }
}

function keyPressed(event) {
  let moved = true;

  if (busy) return;

  switch (event.code) {
    case 'ArrowDown':
      grid = rotate(slideRight(rotate(grid, LEFT)), RIGHT);
      break;

    case 'ArrowLeft':
      grid = mirror(slideRight(mirror(grid)));
      break;

    case 'ArrowUp':
      grid = rotate(slideRight(rotate(grid, RIGHT)), LEFT);
      break;

    case 'ArrowRight':
      grid = slideRight(grid);
      break;

    default:
      moved = false;
      break;
  }

  if (moved) {
    busy = true;
    redraw(grid);
    setTimeout(() => {
      addNumber(grid);
      redraw(grid);
      busy = false;
    }, 600);
  }
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

addNumber(grid);
addNumber(grid);
redraw(grid);
document.body.addEventListener('keydown', keyPressed);
