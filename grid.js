let grid = blankGrid();

const LEFT = -1;
const RIGHT = 1;

function blankGrid() {
  return new Array(4).fill().map(() => new Array(4).fill(0));
}

function addNumbers(grid) {
  for (let i = 0; i < Math.min(zeros(grid), 2); ++i) {
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
}

function zeros(grid) {
  return grid.reduce((acc, row) => {
    return acc + row.filter(col => col == 0).length;
  }, 0);
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
        cell.style.background = `hsl(176, 77%, ${99 - log * 6}%)`;
      } else {
        cell.textContent = '';
        cell.style.background = 'none';
      }
    }
  }
}

function keyPressed(event) {
  let moved = true;

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
    redraw(grid);
    setTimeout(() => {
      addNumbers(grid);
      redraw(grid);
    }, 700);
  }
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

addNumbers(grid);
redraw(grid);
document.body.addEventListener('keydown', keyPressed);
