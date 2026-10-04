// ============================================================
// [FILE: game/js/config.js]
// ============================================================

export const config = {
  // Игровое поле
  GRID_SIZE: 15,

  // Скорость игры
  TICK_INTERVAL_MS: 150,

  // Режим цикла: 'interval' | 'raf' | 'manual'
  LOOP_MODE: 'interval',

  // Лимит на игрока
  DAILY_PLAY_LIMIT_MINUTES: 5,

  // Ключ хранения игрока (уникальный для каждой игры!)
  STORAGE_KEY: 'mono_snake',

  // Защита от «зависшей» вкладки
  SESSION_FLUSH_TIMEOUT_MS: 60000,
};

// Set false for production
export const DEBUG_DISABLE_LIMIT = true;