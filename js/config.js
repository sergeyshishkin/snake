// ============================================================
// [FILE: config.js]
// ============================================================

export const CONFIG = {
  DAILY_PLAY_LIMIT_MINUTES: 5,
  GRID_SIZE: 14,
  TICK_INTERVAL_MS: 150,
  STORAGE_KEY: 'sushi_snake_player_v1',
  SESSION_FLUSH_TIMEOUT_MS: 60000,
};

export const DIRS = {
  UP:    { x:  0, y: -1 },
  DOWN:  { x:  0, y:  1 },
  LEFT:  { x: -1, y:  0 },
  RIGHT: { x:  1, y:  0 },
};

export const DEBUG_DISABLE_LIMIT = true;