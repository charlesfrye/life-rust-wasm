import { Universe, Cell } from "life";
import { memory } from "life/life_bg";

const CELL_SIZE = 1; // px
// const GRID_COLOR = "rgba(66, 06, 144, 0.5)";
const DEAD_COLOR = "rgba(4, 32, 105, 0.75)";
const GRID_COLOR = DEAD_COLOR;
const ALIVE_COLOR = "#B00B69";

let universe = Universe.new(256, 512);
const width = universe.width();
const height = universe.height();

const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');

let animationId = null;

const renderLoop = () => {
  drawGrid();
  drawCells();

  universe.tick();

  animationId = requestAnimationFrame(renderLoop);
};

const isPaused = () => {
  return animationId === null;
}

const playPauseButton = document.getElementById("play-pause");

const play = () => {
  playPauseButton.textContent = "⏸"
  renderLoop();
}

const pause = () => {
  playPauseButton.textContent = "▶"
  cancelAnimationFrame(animationId);
  animationId = null;
}

playPauseButton.addEventListener("click", event => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});

const randomizeButton = document.getElementById("randomize");

const randomize = () => {
  universe = Universe.rand(height, width);
}

randomizeButton.addEventListener("click", event => {
  randomize()
  play();
});

const killButton = document.getElementById("kill");

const kill = () => {
  universe.set_width(universe.width())
}

killButton.addEventListener("click", event => {
  kill();
  play();
  pause();
});

canvas.addEventListener("click", event => {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop /  (CELL_SIZE + 1)), height - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)),  width - 1);

  universe.toggle_cell(row, col);

  drawGrid();
  drawCells();
});

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // vertical lines
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
}

const getIndex = (row, column) => {
  return row * width + column;
};

const drawCells = () => {
  const cellsPtrs = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtrs, width * height);

  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = cells[idx] === Cell.Dead
        ? DEAD_COLOR // cool way of writing ternary!
        : ALIVE_COLOR;

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
}

drawGrid();
drawCells();
play();
