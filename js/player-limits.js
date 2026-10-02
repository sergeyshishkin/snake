// ============================================================
// [FILE: player-limits.js]
// Назначение: анонимная идентификация игрока + дневной лимит
// Правится: при изменении логики лимитов (редко)
// Зависит: config.js (CONFIG, DEBUG_DISABLE_LIMIT)
// Экспортирует: initPlayer, getRemainingMs, isLimitReached,
//               startSession, endSession, tickSession, flushSession
// ============================================================

import { CONFIG, DEBUG_DISABLE_LIMIT } from './config.js';

const DAILY_LIMIT_MS = CONFIG.DAILY_PLAY_LIMIT_MINUTES * 60 * 1000;

// ----------------------------------------------------------
// Внутреннее состояние модуля.
// Игрок загружается один раз при initPlayer().
// ----------------------------------------------------------
let player = null;         // объект игрока из localStorage
let sessionStart = null;   // Date.now() старта текущей сессии
let cachedToday = null;    // текущий день (YYYY-MM-DD), для сброса
let lastTick = null;       // для tickSession — прошлый момент


// ============================================================
// [BLOCK: helpers]
// Вспомогательные утилиты
// ============================================================

/**
 * Генерация UUID v4 без внешних библиотек.
 * Используется как анонимный ID игрока.
 */
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Ключ текущего дня в формате YYYY-MM-DD.
 * Используется для сброса лимита при смене суток.
 */
function todayKey() {
  const d = new Date();
  return d.getFullYear() + '-' +
         String(d.getMonth() + 1).padStart(2, '0') + '-' +
         String(d.getDate()).padStart(2, '0');
}

/**
 * Сохраняет игрока в localStorage.
 * Тихо игнорирует ошибки (например, приватный режим).
 */
function save() {
  if (!player) return;
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(player));
  } catch (e) {
    // приватный режим или переполнение — не падаем
  }
}

/**
 * Проверяет, не сменился ли день.
 * При смене — обнуляет usedMs и сохраняет.
 * @returns {boolean} true, если день сменился
 */
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


// ============================================================
// [BLOCK: init-player]
// Загрузка или создание игрока.
// Вызывается один раз при старте приложения.
// ============================================================
export function initPlayer() {
  let p = null;

  // Пытаемся загрузить из localStorage
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (raw) p = JSON.parse(raw);
  } catch (e) {
    // повреждённые данные — создадим заново
  }

  // Валидация: если нет ID — считаем данные негодными
  if (!p || typeof p !== 'object' || !p.id) {
    p = {
      id: uuidv4(),
      createdAt: Date.now(),
      usedMs: 0,
      lastDate: todayKey(),
      totalGames: 0,
      totalPlayMs: 0,
    };
  }

  // Сброс лимита при смене дня
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


// ============================================================
// [BLOCK: query-limits]
// Проверка остатка времени
// ============================================================

/**
 * Сколько миллисекунд осталось на сегодня.
 * Всегда возвращает число ≥ 0.
 * При DEBUG_DISABLE_LIMIT — всегда полный лимит.
 */
export function getRemainingMs() {
  if (DEBUG_DISABLE_LIMIT) return DAILY_LIMIT_MS;
  if (!player) return DAILY_LIMIT_MS;
  refreshDay();
  return Math.max(0, DAILY_LIMIT_MS - player.usedMs);
}

/**
 * Достигнут ли дневной лимит.
 * При DEBUG_DISABLE_LIMIT — всегда false.
 */
export function isLimitReached() {
  if (DEBUG_DISABLE_LIMIT) return false;
  return getRemainingMs() <= 0;
}


// ============================================================
// [BLOCK: session]
// Учёт времени активной игры.
//
// Жизненный цикл:
//   1. startSession()  — игрок начал партию
//   2. tickSession()   — вызывается раз в секунду во время игры
//   3. endSession()    — партия закончилась (проигрыш/победа)
//                        или игрок закрыл вкладку
//
// flushSession() — принудительное завершение при закрытии страницы.
// ============================================================

/**
 * Начало новой игровой сессии.
 * Фиксирует момент старта и увеличивает счётчик партий.
 */
export function startSession() {
  if (!player) return;
  sessionStart = Date.now();
  player.totalGames++;
  save();
}

/**
 * Завершение текущей сессии.
 * Добавляет прошедшее время к usedMs игрока.
 */
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

/**
 * Тик во время активной игры.
 * Вызывается раз в секунду из UI-таймера.
 * Накапливает время с последнего вызова.
 */
export function tickSession() {
  if (!player || !sessionStart) {
    lastTick = null;
    return;
  }

  const now = Date.now();

  if (lastTick !== null) {
    const delta = now - lastTick;
    // Защита от отрицательных значений и огромных скачков
    // (например, если вкладка была «усыплена» системой)
    if (delta > 0 && delta < 10000) {
      player.usedMs += delta;
      player.totalPlayMs += delta;
      save();
    }
  }

  lastTick = now;
}

/**
 * Принудительное сохранение при закрытии страницы.
 * Отличается от endSession тем, что:
 *   — не доверяет большим интервалам (защита от «зависшей» вкладки)
 *   — не сбрасывает sessionStart (на случай, если страница восстановится)
 */
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


// ============================================================
// [BLOCK: debug]
// Публичный доступ к состоянию игрока — для отладки.
// Не используется в проде.
// ============================================================
export function getPlayerStats() {
  if (!player) return null;
  return {
    id: player.id,
    usedMs: player.usedMs,
    remainingMs: getRemainingMs(),
    limitMs: DAILY_LIMIT_MS,
    totalGames: player.totalGames,
    totalPlayMs: player.totalPlayMs,
  };
}