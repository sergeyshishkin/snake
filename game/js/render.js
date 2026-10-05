// ============================================================
// [FILE: game/js/render.js]
// ============================================================

import { config } from './config.js';


export function createRenderer(canvas) {

  const ctx = canvas.getContext('2d');

  let cellW = canvas.width  / config.GRID_SIZE;
  let cellH = canvas.height / config.GRID_SIZE;
  let gridSize = config.GRID_SIZE;

  // ----------------------------------------------------------
  // Иконка еды. Загружается один раз, используется для всех клеток.
  // ----------------------------------------------------------
  const foodImage = new Image();
  foodImage.src = 'game/assets/ramen.svg';
  let foodImageReady = false;
  foodImage.onload = () => { foodImageReady = true; };

  let COLORS = readColors();



  function readColors() {
    const s = getComputedStyle(document.documentElement);
    const read = (name, fallback) => {
      const v = s.getPropertyValue(name).trim();
      return v || fallback;
    };

    return {
      grid:      read('--color-grid',       '#b9b9b9'),
      snake:     read('--color-snake',      '#949494'),
      snakeHead: read('--color-snake-head', '#d14a4a'),
      food:      read('--color-food',       '#33c4b8'),
      overlay:   read('--color-gameover-bg',     'rgba(0, 0, 0, 0.7)'),
      overText:  read('--color-gameover-text',   '#f3c6a8'),
      overHint:  read('--color-gameover-hint',   '#ffffff'),
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

    // --- Сетка ---
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

    // --- Еда ---
    if (food && foodImageReady) {
      const time = performance.now();
      const pulse = 0.83 + 0.1 * Math.sin(time / 300);
      const size = Math.min(cellW, cellH) * 0.9 * pulse;
      const cx = food.x * cellW + cellW / 2;
      const cy = food.y * cellH + cellH / 2;

      ctx.save();
      ctx.shadowColor = '#ff8c00';
      ctx.shadowBlur = 12 * pulse;
      ctx.drawImage(foodImage, cx - size / 2, cy - size / 2, size, size);
      ctx.restore();
    }

    // --- Змейка ---
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

    // --- Game Over ---
    if (over && snake.length > 0) {
      drawGameOver(ctx, canvas, win);
    }
  }

  function drawGameOver(ctx, canvas, isWin) {
    ctx.save();

    ctx.fillStyle = COLORS.overlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const title = isWin ? 'НЕВЕРОЯТНАЯ ПОБЕДА!' : 'ХОРОШАЯ ПОПЫТКА';
    const hint  = 'нажмите чтобы продолжить';

    const maxWidth = canvas.width * 0.85;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // ---------- Заголовок: подбираем размер под ширину ----------
    let titleSize = 40;
    do {
      ctx.font = `bold ${titleSize}px monospace`;
      if (ctx.measureText(title).width <= maxWidth) break;
      titleSize -= 2;
    } while (titleSize > 12);

    ctx.fillStyle = COLORS.overText;
    ctx.fillText(title, canvas.width / 2, canvas.height / 2);

    // ---------- Подсказка: подбираем размер под ширину ----------
    let hintSize = 18;
    do {
      ctx.font = `${hintSize}px monospace`;
      if (ctx.measureText(hint).width <= maxWidth) break;
      hintSize -= 1;
    } while (hintSize > 10);

    ctx.fillStyle = COLORS.overHint;
    ctx.fillText(hint, canvas.width / 2, canvas.height / 2 + 50);

    ctx.restore();
  }


  return {
    render,
    resize,
    refreshColors,
  };
}