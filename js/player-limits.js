// ============================================================
// [FILE: player-limits.js]
// ============================================================

import { CONFIG, DEBUG_DISABLE_LIMIT } from './config.js';

const DAILY_LIMIT_MS = CONFIG.DAILY_PLAY_LIMIT_MINUTES * 60 * 1000;

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
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(player));
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
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
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


export function startSession() {
  if (!player) return;
  sessionStart = Date.now();
  player.totalGames++;
  save();
}

export function endSession() {
  if (!sessionStart || !player) return;
  const elapsed = Date.now() - sessionStart;
  if (elapsed > 0) {
    player.usedMs += elapsed;
    player.totalPlayMs += elapsed;
    save();
  }
  sessionStart = null;
}

export function tickSession() {
  if (!player || !sessionStart) {
    lastTick = null;
    return;
  }

  const now = Date.now();

  if (lastTick !== null) {
    const delta = now - lastTick;
    if (delta > 0 && delta < 10000) {
      player.usedMs += delta;
      player.totalPlayMs += delta;
      save();
    }
  }

  lastTick = now;
}

export function flushSession() {
  if (sessionStart && player) {
    const elapsed = Date.now() - sessionStart;
    if (elapsed > 0 && elapsed < CONFIG.SESSION_FLUSH_TIMEOUT_MS) {
      player.usedMs += elapsed;
      player.totalPlayMs += elapsed;
    }
    sessionStart = null;
    save();
  }
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