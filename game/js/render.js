// ============================================================
// [FILE: game/js/render.js]
// ============================================================

import { config } from './config.js';


export function createRenderer(canvas) {

  const ctx = canvas.getContext('2d');

  let cellW = canvas.width  / config.GRID_SIZE;
  let cellH = canvas.height / config.GRID_SIZE;
  let gridSize = config.GRID_SIZE;

  const BG        = '#0f0f0f';
  const GRID      = '#1a1a1a';
  const SNAKE     = '#d0d0d0';
  const SNAKE_HEAD = '#ffffff';
  const FOOD      = '#888888';


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
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellW, 0);
      ctx.lineTo(i * cellW, canvas.height);
      ctx.strokeStyle = GRID;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellH);
      ctx.lineTo(canvas.width, i * cellH);
      ctx.strokeStyle = GRID;
      ctx.stroke();
    }

    if (food) {
      const pad = Math.min(cellW, cellH) * 0.15;
      ctx.fillStyle = FOOD;
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

      ctx.fillStyle = (i === 0) ? SNAKE_HEAD : SNAKE;

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

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(isWin ? 'WIN' : 'GAME OVER',
                 canvas.width / 2, canvas.height / 2);

    ctx.font = '18px monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText('tap to restart',
                 canvas.width / 2, canvas.height / 2 + 50);

    ctx.restore();
  }


  return {
    render,
    resize,
  };
}