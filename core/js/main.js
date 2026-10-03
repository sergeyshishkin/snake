// ============================================================
// [FILE: core/js/main.js]
// Точка входа. Собирает core + game.
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
import { createUI }         from './ui.js';
import { createLoop }       from './loop.js';
import { createResize }     from './resize.js';
import { createLifecycle }  from './lifecycle.js';
import { createIntro }      from './intro.js';
import { createDpad }       from './controls/dpad.js';
import { createKeyboard }   from './controls/keyboard.js';
import { createSwipe }      from './controls/swipe.js';

import { config }         from '../../game/js/config.js';
import { createRules }    from '../../game/js/rules.js';
import { createRenderer } from '../../game/js/render.js';


initPlayer();

state.bestScore = getBestScore();

const ui = createUI();
const rules = createRules();
const renderer = createRenderer($.canvas);

const game = createLoop({
  rules,
  renderer,
  config,
  callbacks: {
    onScore: score => updateState({ score }, ui),

    onStart: () => updateState({
      gameStarted: true,
      gameActive: true,
      gameOver: false,
      hintVisible: false,
      panelMode: 'timer',
    }, ui),

    onGameOver: ({ win, score }) => {
      const isNewRecord = updateBestScore(score);
      updateState({
        gameActive: false,
        gameStarted: true,
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
  },
});


createResize({
  canvas: $.canvas,
  onResize: (w, h) => {
    renderer.resize(w, h, config.GRID_SIZE);
    game.render();
  },
});


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


$.canvas.addEventListener('click', e => {
  e.preventDefault();
  handleTap();
});


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

  ui.startTimer(() => game.tickSession());
  ui.updateTimer();
}


const intro = createIntro({
  onAccept: unlockGame,
});

intro.init();


createLifecycle({
  isActive: () => state.gameActive,
  onFlush: flushSession,
  onHide: () => {
    game.flushSession();
    game.render();
  },
});


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


$.canvas.addEventListener('contextmenu', e => e.preventDefault());


(function debugResetLimit() {
  const isDev =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.protocol === 'file:';

  if (!isDev) return;

  const params = new URLSearchParams(location.search);
  if (params.get('resetLimit') === '1') {
    try { localStorage.removeItem(config.STORAGE_KEY); } catch (e) {}

    params.delete('resetLimit');
    const newUrl = location.pathname + (params.toString() ? '?' + params : '');
    history.replaceState({}, '', newUrl);

    console.log('%c🍣 Лимит сброшен (dev)',
      'color:#ff6b1a;font-weight:bold;font-size:14px');

    location.reload();
  }
})();