// ============================================================
// [FILE: game/js/config.js]
// ============================================================

export const config = {
  // Игровое поле
  GRID_SIZE: 14,

  // Режим цикла: 'interval' | 'raf' | 'manual'
  LOOP_MODE: 'interval',

  // Лимит на игрока
  DAILY_PLAY_LIMIT_MINUTES: 0.3,

  // Ключ хранения игрока (уникальный для каждой игры!)
  STORAGE_KEY: 'ramen_dragon',

  // Защита от «зависшей» вкладки
  SESSION_FLUSH_TIMEOUT_MS: 60000,

  TICK_INTERVAL_MS: 180,          // стартовый интервал
  TICK_MIN_MS: 100,                // минимальный (максимальная скорость)
  TICK_STEP_MS: 2,                // на сколько уменьшать за каждое очко
};

// Set false for production
export const DEBUG_DISABLE_LIMIT = false;