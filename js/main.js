import { createGame } from './game.js';
import { createUI } from './ui.js';
import { initPlayer, isLimitReached, flushSession } from './player-limits.js';

const canvas = document.getElementById('gameCanvas');
const ui = createUI();
const resetButton = document.getElementById('resetButton');

initPlayer();

function showReset() { resetButton.classList.remove('hidden'); }
function hideReset() { resetButton.classList.add('hidden'); }

const game = createGame(canvas, {
  onScore: n => ui.setScore(n),
  onStart: () => {
    ui.hideHint();
    hideReset();
  },
  onGameOver: () => {
    showReset();
  },
  onLimit: () => {
    hideReset();
    ui.showLimit();
  },
});

// ============================================================
// COOKIE-БАННЕР
// ============================================================
const COOKIE_KEY = 'sushi_snake_cookie_accepted_v1';
const cookieBanner = document.getElementById('cookieBanner');
const cookieAccept = document.getElementById('cookieAccept');

let gameUnlocked = false;

function unlockGame() {
  if (gameUnlocked) return;
  gameUnlocked = true;

  if (isLimitReached()) {
    ui.showLimit();
  } else {
    game.showPreview();
    ui.showStart();
  }
  ui.startTimer(() => game.tickSessionTick());
  ui.updateTimer();
}

function acceptCookies() {
  try { localStorage.setItem(COOKIE_KEY, '1'); } catch (e) {}
  cookieBanner.classList.add('hidden');
  setTimeout(() => { cookieBanner.style.display = 'none'; }, 350);
  unlockGame();
}

if (localStorage.getItem(COOKIE_KEY) === '1') {
  cookieBanner.style.display = 'none';
  unlockGame();
} else {
  cookieAccept.addEventListener('click', acceptCookies);
}

// ============================================================
// КНОПКИ НАПРАВЛЕНИЯ — все .dpad-btn в обеих группах
// ============================================================
const dpadButtons = document.querySelectorAll('.dpad-btn');

function handleDpad(dir) {
  if (!gameUnlocked) return;

  if (!game.isStarted() || game.isOver()) {
    if (game.isLimitHit()) { ui.showLimit(); return; }
    game.init();
    return;
  }
  game.setDirection(dir);
}

dpadButtons.forEach(btn => {
  const dir = btn.dataset.dir;

  btn.addEventListener('pointerdown', e => {
    e.preventDefault();
    e.stopPropagation();
    btn.classList.add('pressed');
    handleDpad(dir);
  });

  btn.addEventListener('pointerup', e => {
    e.preventDefault();
    btn.classList.remove('pressed');
  });

  btn.addEventListener('pointercancel', () => btn.classList.remove('pressed'));
  btn.addEventListener('pointerleave', () => btn.classList.remove('pressed'));

  if (!window.PointerEvent) {
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      btn.classList.add('pressed');
      handleDpad(dir);
    }, { passive: false });

    btn.addEventListener('touchend', e => {
      e.preventDefault();
      btn.classList.remove('pressed');
    }, { passive: false });
  }

  btn.addEventListener('contextmenu', e => e.preventDefault());
});

// ============================================================
// КЛАВИАТУРА
// ============================================================
window.addEventListener('keydown', e => {
  const k = e.key;
  if (k.startsWith('Arrow') || k === ' ' || k === 'r' || k === 'R') e.preventDefault();
  if (!gameUnlocked) return;
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

// ============================================================
// TAP ПО КАНВАСУ
// ============================================================
canvas.addEventListener('click', e => {
  e.preventDefault();
  if (!gameUnlocked) return;
  if (game.isLimitHit()) return;
  if (!game.isStarted() || game.isOver()) game.init();
});

let tx = 0, ty = 0;
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const t = e.touches[0];
  tx = t.clientX; ty = t.clientY;
}, { passive: false });

canvas.addEventListener('touchend', e => {
  e.preventDefault();
  if (!gameUnlocked) return;
  if (game.isLimitHit()) return;
  if (!game.isStarted() || game.isOver()) { game.init(); return; }
  const dx = e.changedTouches[0].clientX - tx;
  const dy = e.changedTouches[0].clientY - ty;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
  if (Math.abs(dx) > Math.abs(dy)) game.setDirection(dx > 0 ? 'RIGHT' : 'LEFT');
  else game.setDirection(dy > 0 ? 'DOWN' : 'UP');
}, { passive: false });

// ============================================================
// RESET
// ============================================================
resetButton.addEventListener('click', e => {
  e.stopPropagation();
  if (!gameUnlocked) return;
  if (game.isLimitHit()) { ui.showLimit(); return; }
  if (game.isActive()) flushSession();
  hideReset();
  game.init();
});

// ============================================================
// LIFECYCLE
// ============================================================
window.addEventListener('beforeunload', () => { flushSession(); });
window.addEventListener('pagehide', () => { flushSession(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.isActive()) {
    game.flushSessionNow();
    game.render();
  }
});

canvas.addEventListener('contextmenu', e => e.preventDefault());

// ============================================================
// ПРОВЕРКА СМЕНЫ ДНЯ
// ============================================================
setInterval(() => {
  if (gameUnlocked && !game.isActive() && !game.isStarted() && isLimitReached()) {
    ui.showLimit();
  }
  if (gameUnlocked) ui.updateTimer();
}, 30000);