// ============================================================
// [FILE: core/js/player-limits.js]
// ============================================================

import { config, DEBUG_DISABLE_LIMIT } from '../../game/js/config.js';

const DAILY_LIMIT_MS = config.DAILY_PLAY_LIMIT_MINUTES * 60 * 1000;

let player = null;
let sessionStart = null;
let cachedToday = null;
let lastTick = null;


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function todayKey() {
  const d = new Date();
  return d.getFullYear() + '-' +
         String(d.getMonth() + 1).padStart(2, '0') + '-' +
         String(d.getDate()).padStart(2, '0');
}

function save() {
  if (!player) return;
  try {
    localStorage.setItem(config.STORAGE_KEY, JSON.stringify(player));
  } catch (e) {}
}

function refreshDay() {
  const today = todayKey();
  if (today !== cachedToday) {
    cachedToday = today;
    player.usedMs = 0;
    player.lastDate = today;
    save();
    return true;
  }
  return false;
}


export function initPlayer() {
  let p = null;

  try {
    const raw = localStorage.getItem(config.STORAGE_KEY);
    if (raw) p = JSON.parse(raw);
  } catch (e) {}

  if (!p || typeof p !== 'object' || !p.id) {
    p = {
      id: uuidv4(),
      createdAt: Date.now(),
      usedMs: 0,
      lastDate: todayKey(),
      totalGames: 0,
      totalPlayMs: 0,
      bestScore: 0,
    };
  }

  if (typeof p.bestScore !== 'number') {
    p.bestScore = 0;
  }

  const today = todayKey();
  if (p.lastDate !== today) {
    p.usedMs = 0;
    p.lastDate = today;
  }

  player = p;
  cachedToday = today;
  save();
  return p;
}


export function getRemainingMs() {
  if (DEBUG_DISABLE_LIMIT) return DAILY_LIMIT_MS;
  if (!player) return DAILY_LIMIT_MS;
  refreshDay();
  return Math.max(0, DAILY_LIMIT_MS - player.usedMs);
}

export function isLimitReached() {
  if (DEBUG_DISABLE_LIMIT) return false;
  return getRemainingMs() <= 0;
}


export function getBestScore() {
  if (!player) return 0;
  return player.bestScore || 0;
}

export function updateBestScore(score) {
  if (!player) return false;
  if (typeof score !== 'number' || score <= 0) return false;
  if (score <= (player.bestScore || 0)) return false;

  player.bestScore = score;
  save();
  return true;
}


// ============================================================
// [BLOCK: session]
// Время считает ТОЛЬКО tickSession(). endSession() и flushSession()
// только фиксируют конец сессии, чтобы избежать двойного начисления.
// ============================================================

export function startSession() {
  if (!player) return;
  sessionStart = Date.now();
  lastTick = null;      // первый tickSession зафиксирует момент, но не прибавит
  player.totalGames++;
  save();
}


export function endSession() {
  sessionStart = null;
  lastTick = null;
  save();
}


export function tickSession() {
  if (!player || !sessionStart) {
    lastTick = null;
    return;
  }

  const now = Date.now();

  if (lastTick !== null) {
    const delta = now - lastTick;
    // Защита от «усыплённой» вкладки: пропускаем огромные дельты
    if (delta > 0 && delta < 10000) {
      player.usedMs += delta;
      player.totalPlayMs += delta;
      save();
    }
  }

  lastTick = now;
}


export function flushSession() {
  // Учитываем только время с последнего тика (до 2 сек).
  // Всё, что больше — «зависшая» вкладка, не считаем.
  if (sessionStart && player && lastTick) {
    const delta = Date.now() - lastTick;
    if (delta > 0 && delta < 2000) {
      player.usedMs += delta;
      player.totalPlayMs += delta;
    }
  }

  sessionStart = null;
  lastTick = null;
  save();
}


export function getPlayerStats() {
  if (!player) return null;
  return {
    id: player.id,
    usedMs: player.usedMs,
    remainingMs: getRemainingMs(),
    limitMs: DAILY_LIMIT_MS,
    totalGames: player.totalGames,
    totalPlayMs: player.totalPlayMs,
    bestScore: player.bestScore,
  };
}