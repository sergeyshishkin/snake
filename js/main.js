// ============================================================
// [FILE: main.js]
// Назначение: точка входа, склейка всех модулей
// Зависит: state.js, dom.js, config.js, player-limits.js,
//          game.js, ui.js, cookie.js, controls/*
// ============================================================

import {
  initPlayer,
  isLimitReached,
  flushSession,
  getBestScore,
  updateBestScore,
} from './player-limits.js';
import { state, updateState, resetGameState } from './state.js';
import { $ } from './dom.js';
import { createGame }       from './game.js';
import { createUI }         from './ui.js';
import { createCookieGate } from './cookie.js';
import { createDpad }       from './controls/dpad.js';
import { createKeyboard }   from './controls/keyboard.js';
import { createSwipe }      from './controls/swipe.js';


// ============================================================
// [BLOCK: init]
// ============================================================
initPlayer();

// Загружаем best score в state сразу
state.bestScore = getBestScore();

const ui = createUI();
const game = createGame($.canvas, {
  onScore: score => updateState({ score }, ui),

  onStart: () => updateState({
    hintVisible: false,
    panelMode: 'timer',
  }, ui),

  onGameOver: ({ win, score }) => {
    const isNewRecord = updateBestScore(score);
    updateState({
      gameActive: false,
      gameOver: true,
      win,
      panelMode: 'reset',
      ...(isNewRecord ? { bestScore: score } : {}),
    }, ui);
  },

  onLimit: () => updateState({
    limitReached: true,
    hintVisible: true,
    hintKind: 'limit',
    panelMode: 'timer',
  }, ui),
});


// ============================================================
// [BLOCK: canvas-resize]
// ============================================================
let resizeRaf = null;

function syncCanvasSize() {
  const container = $.canvas.parentElement;
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const w = Math.round(rect.width);
  const h = Math.round(rect.height);

  if (w <= 0 || h <= 0) return;

  if ($.canvas.width !== w || $.canvas.height !== h) {
    $.canvas.width  = w;
    $.canvas.height = h;
    game.resize(w, h);
    game.render();
  }
}

function scheduleResize() {
  if (resizeRaf) return;
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = null;
    syncCanvasSize();
  });
}

const resizeObserver = new ResizeObserver(scheduleResize);
resizeObserver.observe($.canvas.parentElement);

syncCanvasSize();
requestAnimationFrame(syncCanvasSize);
setTimeout(syncCanvasSize, 100);


// ============================================================
// [BLOCK: input-handlers]
// ============================================================
function handleDirection(dir) {
  if (!state.gameUnlocked) return;
  if (state.limitReached) return;

  if (!state.gameStarted || state.gameOver) {
    if (state.gameActive) flushSession();
    resetGameState();
    ui.render();
    game.init();
    return;
  }
  game.setDirection(dir);
}

function handleAction() {
  if (!state.gameUnlocked) return;
  if (state.limitReached) {
    updateState({ hintVisible: true, hintKind: 'limit' }, ui);
    return;
  }
  if (!state.gameStarted || state.gameOver) {
    if (state.gameActive) flushSession();
    resetGameState();
    ui.render();
    game.init();
  }
}

function handleTap() {
  if (!state.gameUnlocked) return;
  if (state.limitReached) {
    updateState({ hintVisible: true, hintKind: 'limit' }, ui);
    return;
  }
  if (!state.gameStarted || state.gameOver) {
    if (state.gameActive) flushSession();
    resetGameState();
    ui.render();
    game.init();
  }
}


// ============================================================
// [BLOCK: controls]
// ============================================================
const dpad = createDpad(document.body, {
  onDirection: handleDirection,
});

const keyboard = createKeyboard({
  onDirection: handleDirection,
  onAction:    handleAction,
});

const swipe = createSwipe($.canvas, {
  onDirection: dir => {
    if (!state.gameUnlocked) return;
    if (state.limitReached) return;
    if (!state.gameStarted || state.gameOver) return;
    game.setDirection(dir);
  },
  onTap: handleTap,
});


// ============================================================
// [BLOCK: reset-button]
// ============================================================
$.resetButton.addEventListener('click', e => {
  e.stopPropagation();
  if (!state.gameUnlocked) return;
  if (state.limitReached) {
    updateState({ hintVisible: true, hintKind: 'limit' }, ui);
    return;
  }
  if (state.gameActive) flushSession();
  resetGameState();
  ui.render();
  game.init();
});


// ============================================================
// [BLOCK: tap-on-canvas]
// ============================================================
$.canvas.addEventListener('click', e => {
  e.preventDefault();
  handleTap();
});


// ============================================================
// [BLOCK: unlock-game]
// ============================================================
function unlockGame() {
  if (state.gameUnlocked) return;

  updateState({
    gameUnlocked: true,
    cookiesAccepted: true,
  }, ui);

  dpad.enable();
  keyboard.enable();
  swipe.enable();

  if (isLimitReached()) {
    updateState({
      limitReached: true,
      hintVisible: true,
      hintKind: 'limit',
    }, ui);
  } else {
    game.showPreview();
    updateState({
      hintVisible: true,
      hintKind: 'start',
      gameStarted: false,
      gameActive: false,
      gameOver: false,
      panelMode: 'timer',
    }, ui);
  }

  ui.startTimer(() => game.tickSessionTick());
  ui.updateTimer();
}


// ============================================================
// [BLOCK: cookie-gate]
// ============================================================
const cookieGate = createCookieGate({
  onAccept: unlockGame,
});

cookieGate.init();


// ============================================================
// [BLOCK: lifecycle]
// ============================================================
window.addEventListener('beforeunload', () => {
  if (state.gameActive) flushSession();
});

window.addEventListener('pagehide', () => {
  if (state.gameActive) flushSession();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.gameActive) {
    game.flushSessionNow();
    game.render();
  }
});


// ============================================================
// [BLOCK: periodic-day-check]
// ============================================================
setInterval(() => {
  if (!state.gameUnlocked) return;

  if (!state.gameActive && !state.gameStarted && isLimitReached()) {
    updateState({
      limitReached: true,
      hintVisible: true,
      hintKind: 'limit',
    }, ui);
  }
  ui.updateTimer();
}, 30000);


// ============================================================
// [BLOCK: context-menu-block]
// ============================================================
$.canvas.addEventListener('contextmenu', e => e.preventDefault());


// ============================================================
// [BLOCK: debug-reset]
// ============================================================
(function debugResetLimit() {
  const isDev =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.protocol === 'file:';

  if (!isDev) return;

  const params = new URLSearchParams(location.search);
  if (params.get('resetLimit') === '1') {
    try { localStorage.removeItem('sushi_snake_player_v1'); } catch (e) {}

    params.delete('resetLimit');
    const newUrl = location.pathname + (params.toString() ? '?' + params : '');
    history.replaceState({}, '', newUrl);

    console.log('%c🍣 Лимит сброшен (dev)',
      'color:#ff6b1a;font-weight:bold;font-size:14px');

    location.reload();
  }
})();