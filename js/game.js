// ============================================================
// [FILE: game.js]
// Назначение: игровая логика — змейка, еда, тики, коллизии
// Правится: при изменении правил игры
// Зависит: config.js, player-limits.js, renderers/food.js, renderers/snake.js
// Экспортирует: createGame
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


// ============================================================
// [BLOCK: create-game]
// Фабрика игры. Возвращает объект с методами управления.
//
// @param {HTMLCanvasElement} canvas — игровое поле
// @param {Object} callbacks — колбэки для UI
// @param {Function} callbacks.onScore(score)   — обновление счёта
// @param {Function} callbacks.onStart()         — партия началась
// @param {Function} callbacks.onGameOver(info)  — партия закончилась
// @param {Function} callbacks.onLimit()         — дневной лимит достигнут
// ============================================================
export function createGame(canvas, callbacks) {

  const ctx = canvas.getContext('2d');
  const GRID = CONFIG.GRID_SIZE;

  // ----------------------------------------------------------
  // Размер клетки теперь динамический — canvas может быть
  // прямоугольным. cellW — ширина клетки, cellH — высота.
  // При resize() оба пересчитываются.
  // ----------------------------------------------------------
  let cellW = canvas.width  / GRID;
  let cellH = canvas.height / GRID;

  // ----------------------------------------------------------
  // Состояние игры (живёт внутри замыкания)
  // ----------------------------------------------------------
  let snake = [];           // массив сегментов [{x, y}, ...]
  let food = null;          // текущая еда {x, y}
  let currentDir = 'RIGHT'; // фактическое направление движения
  let nextDir = 'RIGHT';    // желаемое (применяется на следующем тике)
  let score = 0;

  let active = false;       // партия идёт прямо сейчас
  let over = false;         // партия закончилась (проигрыш/победа)
  let started = false;      // игра была запущена хотя бы раз
  let win = false;          // победа (заполнили всё поле)
  let limitHit = false;     // упёрлись в дневной лимит

  let interval = null;      // setInterval для тиков


  // ==========================================================
  // [BLOCK: resize]
  // Вызывается из main.js при изменении размера контейнера.
  // Пересчитывает размеры клетки под новые габариты canvas.
  //
  // Сам canvas.width / canvas.height устанавливаются в main.js
  // ДО вызова этого метода — здесь мы только подхватываем
  // актуальные значения.
  // ==========================================================
  function resize(w, h) {
    canvas.width  = w;
    canvas.height = h;
    cellW = w / GRID;
    cellH = h / GRID;
  }


  // ==========================================================
  // [BLOCK: init]
  // Запуск новой партии
  // ==========================================================
  function init() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }

    // Проверка дневного лимита перед стартом
    if (isLimitReached()) {
      callbacks.onLimit();
      return;
    }

    // Начальное состояние змейки: длина 3, горизонтально
    snake = [
      { x: 10, y: 10 },
      { x: 9,  y: 10 },
      { x: 8,  y: 10 },
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


  // ==========================================================
  // [BLOCK: tick]
  // Один шаг игры. Вызывается каждые TICK_INTERVAL_MS.
  // ==========================================================
  function tick() {
    if (!active) return;

    // Проверка лимита на каждом тике — дешёвая операция
    if (isLimitReached()) {
      end('limit');
      return;
    }

    // Применяем отложенное направление (если не разворот на 180°)
    const cannotReverse =
      (currentDir === 'UP'    && nextDir === 'DOWN')  ||
      (currentDir === 'DOWN'  && nextDir === 'UP')    ||
      (currentDir === 'LEFT'  && nextDir === 'RIGHT') ||
      (currentDir === 'RIGHT' && nextDir === 'LEFT');
    if (!cannotReverse) currentDir = nextDir;

    // Вычисляем новую позицию головы
    const move = DIRS[currentDir];
    const head = snake[0];
    const newHead = {
      x: head.x + move.x,
      y: head.y + move.y,
    };

    // Проверка столкновения со стеной
    if (newHead.x < 0 || newHead.x >= GRID ||
        newHead.y < 0 || newHead.y >= GRID) {
      end('wall');
      return;
    }

    // Проверка, съели ли еду
    const willEat = (newHead.x === food.x && newHead.y === food.y);

    // Проверка столкновения с собой.
    // Если не едим — хвост уйдёт, его можно не проверять.
    const bodyToCheck = willEat ? snake : snake.slice(0, -1);
    const selfCollision = bodyToCheck.some(
      s => s.x === newHead.x && s.y === newHead.y
    );
    if (selfCollision) {
      end('self');
      return;
    }

    // Двигаем змейку
    snake.unshift(newHead);

    if (willEat) {
      score++;
      callbacks.onScore(score);

      // Победа: змейка заполнила всё поле
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


  // ==========================================================
  // [BLOCK: end]
  // Завершение партии. Причина передаётся в колбэк.
  // ==========================================================
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


  // ==========================================================
  // [BLOCK: generate-food]
  // Размещение еды в случайной свободной клетке.
  // Оптимизировано: собирает все свободные клетки, потом выбирает.
  // ==========================================================
  function generateFood() {
    const occupied = new Set(snake.map(c => `${c.x},${c.y}`));
    const free = [];

    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        if (!occupied.has(`${x},${y}`)) free.push({ x, y });
      }
    }

    if (free.length === 0) return; // поле заполнено — победа обработана выше

    food = free[Math.floor(Math.random() * free.length)];
  }


  // ==========================================================
  // [BLOCK: render]
  // Отрисовка всего кадра: фон, сетка, еда, змейка, оверлей game over
  // ==========================================================
  function render() {
    // Чистим и красим фон
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0e1a1b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Сетка — учитываем cellW и cellH отдельно,
    // чтобы линии совпадали с границами клеток на прямоугольнике
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

    // Еда — суши с пульсацией.
    // Размер берём минимальный из двух сторон клетки —
    // чтобы фигура осталась пропорциональной на прямоугольнике.
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

    // Змейка — передаём оба размера клетки
    drawSnake(ctx, snake, cellW, cellH);

    // Оверлей game over (только если партия закончилась, но не лимит)
    if (!active && over && !limitHit && snake.length > 0) {
      drawGameOver(ctx, canvas, win);
    }
  }


  // ==========================================================
  // [BLOCK: game-over-overlay]
  // Надписи на канвасе при проигрыше/победе.
  // UI-оверлеи (start hint, limit) — в ui.js.
  // ==========================================================
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


  // ==========================================================
  // [BLOCK: preview]
  // Отображение превью — змейка и еда в начальных позициях,
  // без запуска игры. Используется на стартовом экране.
  // ==========================================================
  function showPreview() {
    snake = [
      { x: 10, y: 10 },
      { x: 9,  y: 10 },
      { x: 8,  y: 10 },
    ];
    food = { x: 13, y: 10 };

    active = false;
    over = false;
    started = false;
    win = false;
    limitHit = false;
    score = 0;

    callbacks.onScore(0);
    render();
  }


  // ==========================================================
  // [BLOCK: public-api]
  // Что торчит наружу для main.js и controls/*
  // ==========================================================
  return {
    init,
    render,
    resize,          // ← новое: вызывается из main.js при ресайзе
    showPreview,

    setDirection: dir => { nextDir = dir; },

    isActive:   () => active,
    isStarted:  () => started,
    isOver:     () => over,
    isLimitHit: () => limitHit,
    getScore:   () => score,
    getSnake:   () => snake,

    // Вызывается UI-таймером раз в секунду
    tickSessionTick: () => {
      if (active && started && !limitHit) tickSession();
    },

    // Принудительное завершение сессии (при скрытии вкладки)
    flushSessionNow: () => {
      if (active) endSession();
    },
  };
}