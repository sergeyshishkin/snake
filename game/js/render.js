// ============================================================
// [FILE: game/js/render.js]
// ============================================================

import { config } from './config.js';


export function createRenderer(canvas) {

  const ctx = canvas.getContext('2d');

  let cellW = canvas.width  / config.GRID_SIZE;
  let cellH = canvas.height / config.GRID_SIZE;
  let gridSize = config.GRID_SIZE;

  let COLORS = readColors();


  function readColors() {
    const s = getComputedStyle(document.documentElement);
    const read = (name, fallback) => {
      const v = s.getPropertyValue(name).trim();
      return v || fallback;
    };

    return {
      grid:      read('--color-grid',       '#1a1a1a'),
      snake:     read('--color-snake',      '#d0d0d0'),
      snakeHead: read('--color-snake-head', '#ffffff'),
      food:      read('--color-food',       '#888888'),
      overlay:   read('--color-gameover-bg',     'rgba(0, 0, 0, 0.7)'),
      overText:  read('--color-gameover-text',   '#ffffff'),
      overHint:  read('--color-gameover-hint',   '#888888'),
    };
  }


  function refreshColors() {
    COLORS = readColors();
  }


  function resize(w, h, grid) {
    canvas.width  = w;
    canvas.height = h;
    gridSize = grid;
    cellW = w / grid;
    cellH = h / grid;
  }


  function render(state) {
    const { snake, food, over, win } = state;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellW, 0);
      ctx.lineTo(i * cellW, canvas.height);
      ctx.strokeStyle = COLORS.grid;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellH);
      ctx.lineTo(canvas.width, i * cellH);
      ctx.strokeStyle = COLORS.grid;
      ctx.stroke();
    }

    if (food) {
      const pad = Math.min(cellW, cellH) * 0.15;
      ctx.fillStyle = COLORS.food;
      ctx.fillRect(
        food.x * cellW + pad,
        food.y * cellH + pad,
        cellW - pad * 2,
        cellH - pad * 2
      );
    }

    for (let i = 0; i < snake.length; i++) {
      const seg = snake[i];
      const pad = Math.min(cellW, cellH) * 0.08;

      ctx.fillStyle = (i === 0) ? COLORS.snakeHead : COLORS.snake;

      ctx.fillRect(
        seg.x * cellW + pad,
        seg.y * cellH + pad,
        cellW - pad * 2,
        cellH - pad * 2
      );
    }

    if (over && snake.length > 0) {
      drawGameOver(ctx, canvas, win);
    }
  }


  function drawGameOver(ctx, canvas, isWin) {
    ctx.save();

    ctx.fillStyle = COLORS.overlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLORS.overText;
    ctx.fillText(isWin ? 'WIN' : 'GAME OVER',
                 canvas.width / 2, canvas.height / 2);

    ctx.font = '18px monospace';
    ctx.fillStyle = COLORS.overHint;
    ctx.fillText('tap to restart',
                 canvas.width / 2, canvas.height / 2 + 50);

    ctx.restore();
  }


  return {
    render,
    resize,
    refreshColors,
  };
}