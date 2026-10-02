import { createGame } from './game.js';
import { createUI } from './ui.js';
import { initPlayer, isLimitReached, flushSession } from './player-limits.js';

const canvas = document.getElementById('gameCanvas');
const ui = createUI();

initPlayer();

const game = createGame(canvas, {
  onScore: n => ui.setScore(n),
  onStart: () => ui.hideHint(),
  onGameOver: () => {},
  onLimit: () => ui.showLimit(),
});

// ---------- Клавиатура ----------
window.addEventListener('keydown', e => {
  const k = e.key;
  if (k.startsWith('Arrow') || k === ' ' || k === 'r' || k === 'R') e.preventDefault();

  if (game.isLimitHit()) return;

  if (!game.isStarted() || game.isOver()) {
    if (k === ' ' || k === 'Enter' || k === 'r' || k === 'R') game.init();
    return;
  }

  switch (k) {
    case 'ArrowUp':    game.setDirection('UP'); break;
    case 'ArrowDown':  game.setDirection('DOWN'); break;
    case 'ArrowLeft':  game.setDirection('LEFT'); break;
    case 'ArrowRight': game.setDirection('RIGHT'); break;
  }
});

// ---------- Touch ----------
let tx = 0, ty = 0;
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const t = e.touches[0];
  tx = t.clientX; ty = t.clientY;
}, { passive: false });

canvas.addEventListener('touchend', e => {
  e.preventDefault();
  if (game.isLimitHit()) return;
  if (!game.isStarted() || game.isOver()) { game.init(); return; }
  const dx = e.changedTouches[0].clientX - tx;
  const dy = e.changedTouches[0].clientY - ty;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
  if (Math.abs(dx) > Math.abs(dy)) game.setDirection(dx > 0 ? 'RIGHT' : 'LEFT');
  else game.setDirection(dy > 0 ? 'DOWN' : 'UP');
}, { passive: false });

canvas.addEventListener('touchcancel', e => e.preventDefault(), { passive: false });

canvas.addEventListener('click', e => {
  e.preventDefault();
  if (game.isLimitHit()) return;
  if (!game.isStarted() || game.isOver()) game.init();
});

// ---------- Reset ----------
document.getElementById('resetButton').addEventListener('click', e => {
  e.stopPropagation();
  if (game.isLimitHit()) { ui.showLimit(); return; }
  if (game.isActive()) flushSession();
  game.init();
});

// ---------- Lifecycle ----------
window.addEventListener('beforeunload', () => { flushSession(); });
window.addEventListener('pagehide', () => { flushSession(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.isActive()) {
    game.flushSessionNow();
    game.render();
  }
});

// ---------- Старт ----------
if (isLimitReached()) {
  ui.showLimit();
} else {
  game.showPreview();
  ui.showStart();
}

ui.startTimer(() => game.tickSessionTick());
ui.updateTimer();

// Периодическая проверка смены дня
setInterval(() => {
  if (!game.isActive() && !game.isStarted() && isLimitReached()) ui.showLimit();
  ui.updateTimer();
}, 30000);