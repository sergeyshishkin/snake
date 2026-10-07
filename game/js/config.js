// ============================================================
// [FILE: game/js/config.js]
// ============================================================

export const config = {
  // Игровое поле
  GRID_SIZE: 14,

  // Режим цикла: 'interval' | 'raf' | 'manual'
  LOOP_MODE: 'interval',

  // Лимит на игрока
  DAILY_PLAY_LIMIT_MINUTES: 2,

  // Ключ хранения игрока (уникальный для каждой игры!)
  STORAGE_KEY: 'mono_snake',

  // Защита от «зависшей» вкладки
  SESSION_FLUSH_TIMEOUT_MS: 60000,

  TICK_INTERVAL_MS: 170,          // стартовый интервал
  TICK_MIN_MS: 80,                // минимальный (максимальная скорость)
  TICK_STEP_MS: 3,                // на сколько уменьшать за каждое очко
};

// Set false for production
export const DEBUG_DISABLE_LIMIT = true;