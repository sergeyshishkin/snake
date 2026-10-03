// ============================================================
// [FILE: game/js/config.js]
// ============================================================

export const config = {
  // Игровое поле
  GRID_SIZE: 14,

  // Скорость игры
  TICK_INTERVAL_MS: 120,

  // Режим цикла: 'interval' | 'raf' | 'manual'
  LOOP_MODE: 'interval',

  // Лимит на игрока
  DAILY_PLAY_LIMIT_MINUTES: 5,

  // Ключ хранения игрока (уникальный для каждой игры!)
  STORAGE_KEY: 'mono_snake',

  // Защита от «зависшей» вкладки
  SESSION_FLUSH_TIMEOUT_MS: 60000,
};

export const DEBUG_DISABLE_LIMIT = true;