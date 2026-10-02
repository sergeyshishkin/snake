// ============================================================
// [FILE: game.js]
// ============================================================

import { CONFIG, DIRS } from './config.js';
import { drawSushi } from './renderers/food.js';
import { drawSnake } from './renderers/snake.js';
import {
  isLimitReached,
  startSession,
  endSession,
  tickSession,
} from './player-limits.js';


export function createGame(canvas, callbacks) {

  const ctx = canvas.getContext('2d');
  const GRID = CONFIG.GRID_SIZE;

  let cellW = canvas.width  / GRID;
  let cellH = canvas.height / GRID;

  let snake = [];
  let food = null;
  let currentDir = 'RIGHT';
  let nextDir = 'RIGHT';
  let score = 0;

  let active = false;
  let over = false;
  let started = false;
  let win = false;
  let limitHit = false;

  let interval = null;


  function resize(w, h) {
    canvas.width  = w;
    canvas.height = h;
    cellW = w / GRID;
    cellH = h / GRID;
  }


  function init() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }

    if (isLimitReached()) {
      callbacks.onLimit();
      return;
    }

    snake = [
      { x: 7, y: 7 },
      { x: 6, y: 7 },
      { x: 5, y: 7 },
    ];
    currentDir = 'RIGHT';
    nextDir = 'RIGHT';
    score = 0;

    over = false;
    win = false;
    active = true;
    started = true;
    limitHit = false;

    callbacks.onScore(0);
    callbacks.onStart();

    generateFood();
    render();

    startSession();
    interval = setInterval(tick, CONFIG.TICK_INTERVAL_MS);
  }


  function tick() {
    if (!active) return;

    if (isLimitReached()) {
      end('limit');
      return;
    }

    const cannotReverse =
      (currentDir === 'UP'    && nextDir === 'DOWN')  ||
      (currentDir === 'DOWN'  && nextDir === 'UP')    ||
      (currentDir === 'LEFT'  && nextDir === 'RIGHT') ||
      (currentDir === 'RIGHT' && nextDir === 'LEFT');
    if (!cannotReverse) currentDir = nextDir;

    const move = DIRS[currentDir];
    const head = snake[0];
    const newHead = {
      x: head.x + move.x,
      y: head.y + move.y,
    };

    if (newHead.x < 0 || newHead.x >= GRID ||
        newHead.y < 0 || newHead.y >= GRID) {
      end('wall');
      return;
    }

    const willEat = (newHead.x === food.x && newHead.y === food.y);

    const bodyToCheck = willEat ? snake : snake.slice(0, -1);
    const selfCollision = bodyToCheck.some(
      s => s.x === newHead.x && s.y === newHead.y
    );
    if (selfCollision) {
      end('self');
      return;
    }

    snake.unshift(newHead);

    if (willEat) {
      score++;
      callbacks.onScore(score);

      if (snake.length === GRID * GRID) {
        win = true;
        end('win');
        return;
      }

      generateFood();
    } else {
      snake.pop();
    }

    render();
  }


  function end(reason) {
    if (!active && reason !== 'limit') return;

    active = false;
    over = true;

    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    endSession();
    render();

    if (reason === 'limit') {
      limitHit = true;
      callbacks.onLimit();
    } else {
      callbacks.onGameOver({ win, score });
    }
  }


  function generateFood() {
    const occupied = new Set(snake.map(c => `${c.x},${c.y}`));
    const free = [];

    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        if (!occupied.has(`${x},${y}`)) free.push({ x, y });
      }
    }

    if (free.length === 0) return;

    food = free[Math.floor(Math.random() * free.length)];
  }


  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0e1a1b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellW, 0);
      ctx.lineTo(i * cellW, canvas.height);
      ctx.strokeStyle = '#2a3a2a';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellH);
      ctx.lineTo(canvas.width, i * cellH);
      ctx.strokeStyle = '#2a3a2a';
      ctx.stroke();
    }

    if (food && snake.length > 0) {
      const foodSize = Math.min(cellW, cellH);
      const cx = food.x * cellW + cellW / 2;
      const cy = food.y * cellH + cellH / 2;

      drawSushi(ctx, cx, cy, foodSize, {
        includeGrass: true,
        includeHighlights: true,
        glow: 14,
        time: performance.now(),
      });
    }

    drawSnake(ctx, snake, cellW, cellH);

    if (!active && over && !limitHit && snake.length > 0) {
      drawGameOver(ctx, canvas, win);
    }
  }


  function drawGameOver(ctx, canvas, isWin) {
    ctx.save();

    ctx.font = 'bold 46px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = 'black';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 6;
    ctx.shadowOffsetY = 6;

    ctx.fillStyle = '#ffcc33';
    ctx.strokeStyle = '#aa2222';
    ctx.lineWidth = 6;

    const text = isWin ? '完全勝利' : 'ゲームオーバー';
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = '24px "Courier New", monospace';
    ctx.fillStyle = '#ffe9b0';
    ctx.shadowBlur = 10;
    ctx.fillText('タップでリスタート', canvas.width / 2, canvas.height / 2 + 80);

    ctx.restore();
  }


  function showPreview() {
    snake = [
      { x: 7, y: 7 },
      { x: 6, y: 7 },
      { x: 5, y: 7 },
    ];
    food = { x: 9, y: 7 };

    active = false;
    over = false;
    started = false;
    win = false;
    limitHit = false;
    score = 0;

    callbacks.onScore(0);
    render();
  }


  return {
    init,
    render,
    resize,
    showPreview,

    setDirection: dir => { nextDir = dir; },

    isActive:   () => active,
    isStarted:  () => started,
    isOver:     () => over,
    isLimitHit: () => limitHit,
    getScore:   () => score,
    getSnake:   () => snake,

    tickSessionTick: () => {
      if (active && started && !limitHit) tickSession();
    },

    flushSessionNow: () => {
      if (active) endSession();
    },
  };
}