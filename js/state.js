// ============================================================
// [FILE: state.js]
// Назначение: единый объект состояния приложения
// Правится: при добавлении новых полей состояния
// Зависит: ни от чего
// Экспортирует: state, updateState, resetGameState
// ============================================================

// ----------------------------------------------------------
// Единый объект состояния. Все модули читают/меняют его.
// Никто не трогает DOM напрямую — только через ui.render().
// ----------------------------------------------------------
export const state = {
  // --- Игровое состояние ---
  score: 0,
  bestScore: 0,
  gameActive: false,
  gameStarted: false,
  gameOver: false,
  win: false,
  limitReached: false,

  // --- UI-состояние ---
  hintVisible: true,
  hintKind: 'start',   // 'start' | 'limit'
  panelMode: 'timer',  // 'timer' | 'reset'

  // --- Системное ---
  gameUnlocked: false,
  cookiesAccepted: false,
};


// ----------------------------------------------------------
// Универсальное обновление состояния с последующим render().
// Использование:
//   updateState({ score: 5 });
//   updateState({ gameOver: true, panelMode: 'reset' });
// ----------------------------------------------------------
export function updateState(patch, ui) {
  Object.assign(state, patch);
  if (ui && typeof ui.render === 'function') {
    ui.render();
  }
}


// ----------------------------------------------------------
// Сброс игровой части состояния перед новой партией.
// UI-состояние (panelMode, hintVisible) НЕ сбрасывается —
// им управляют явно.
// ----------------------------------------------------------
export function resetGameState() {
  state.score = 0;
  state.gameActive = true;
  state.gameStarted = true;
  state.gameOver = false;
  state.win = false;
  state.limitReached = false;
  state.panelMode = 'timer';
  state.hintVisible = false;
}