import { CONFIG, DIRS } from './config.js';
import { drawSushi } from './renderers/food.js';
import { drawSnake } from './renderers/snake.js';
import {
  isLimitReached, startSession, endSession, tickSession
} from './player-limits.js';

export function createGame(canvas, callbacks) {
  const ctx = canvas.getContext('2d');
  const GRID = CONFIG.GRID_SIZE;
  const CELL = canvas.width / GRID;

  let snake, food, currentDir, nextDir, score;
  let active, over, win, started, limitHit;
  let interval = null;

  function init() {
    if (interval) { clearInterval(interval); interval = null; }
    if (isLimitReached()) { callbacks.onLimit(); return; }

    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
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
    if (isLimitReached()) { end('limit'); return; }

    const cannotReverse =
      (currentDir === 'UP' && nextDir === 'DOWN') ||
      (currentDir === 'DOWN' && nextDir === 'UP') ||
      (currentDir === 'LEFT' && nextDir === 'RIGHT') ||
      (currentDir === 'RIGHT' && nextDir === 'LEFT');
    if (!cannotReverse) currentDir = nextDir;

    const move = DIRS[currentDir];
    const head = snake[0];
    const newHead = { x: head.x + move.x, y: head.y + move.y };

    if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID) {
      end('wall'); return;
    }

    const willEat = newHead.x === food.x && newHead.y === food.y;
    const body = willEat ? snake : snake.slice(0, -1);
    if (body.some(s => s.x === newHead.x && s.y === newHead.y)) { end('self'); return; }

    snake.unshift(newHead);
    if (willEat) {
      score++;
      callbacks.onScore(score);
      if (snake.length === GRID * GRID) { win = true; end('win'); return; }
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
    if (interval) { clearInterval(interval); interval = null; }
    endSession();
    render();
    if (reason === 'limit') { limitHit = true; callbacks.onLimit(); }
    else callbacks.onGameOver({ win, score });
  }

  function generateFood() {
    const occupied = new Set(snake.map(c => `${c.x},${c.y}`));
    const free = [];
    for (let y = 0; y < GRID; y++)
      for (let x = 0; x < GRID; x++)
        if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    if (free.length === 0) return;
    food = free[Math.floor(Math.random() * free.length)];
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0e1a1b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, canvas.height);
      ctx.strokeStyle = '#2a3a2a'; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL); ctx.lineTo(canvas.width, i * CELL);
      ctx.strokeStyle = '#2a3a2a'; ctx.stroke();
    }

    const now = performance.now();

    if (food && snake.length > 0) {
      drawSushi(ctx, food.x * CELL + CELL/2, food.y * CELL + CELL/2, CELL, {
        includeGrass: true, includeHighlights: true, glow: 14, time: now,
      });
    }

    drawSnake(ctx, snake, CELL);

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
    ctx.shadowOffsetX = 6; ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#ffcc33';
    ctx.strokeStyle = '#aa2222';
    ctx.lineWidth = 6;
    const text = isWin ? '完全勝利' : 'ゲームオーバー';
    ctx.strokeText(text, canvas.width/2, canvas.height/2 - 20);
    ctx.fillText(text, canvas.width/2, canvas.height/2 - 20);
    ctx.font = '24px "Courier New", monospace';
    ctx.fillStyle = '#ffe9b0';
    ctx.shadowBlur = 10;
    ctx.fillText('タップでリスタート', canvas.width/2, canvas.height/2 + 80);
    ctx.restore();
  }

  function showPreview() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    food = { x: 13, y: 10 };
    active = false; over = false; started = false; limitHit = false;
    score = 0;
    callbacks.onScore(0);
    render();
  }

  return {
    init, render, showPreview,
    setDirection: d => { nextDir = d; },
    isActive: () => active,
    isStarted: () => started,
    isOver: () => over,
    isLimitHit: () => limitHit,
    tickSessionTick: () => { if (active && started && !limitHit) tickSession(); },
    flushSessionNow: () => { if (active) endSession(); },
    getScore: () => score,
    getSnake: () => snake,
  };
}