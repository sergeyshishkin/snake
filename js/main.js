// ============================================================
// [FILE: main.js]
// Назначение: точка входа, склейка всех модулей
// Правится: редко — при добавлении новых модулей или
//           изменении жизненного цикла приложения
// Зависит: config.js, player-limits.js, game.js, ui.js,
//          cookie.js, controls/dpad.js, controls/keyboard.js,
//          controls/swipe.js
// ============================================================

import { initPlayer, isLimitReached, flushSession } from './player-limits.js';
import { createGame }     from './game.js';
import { createUI }       from './ui.js';
import { createCookieGate } from './cookie.js';
import { createDpad }     from './controls/dpad.js';
import { createKeyboard } from './controls/keyboard.js';
import { createSwipe }    from './controls/swipe.js';


// ============================================================
// [BLOCK: dom-refs]
// Ссылки на DOM-элементы, которые нужны в main.js
// ============================================================
const canvas = document.getElementById('gameCanvas');
const dpadRoot = document.body;   // ищем .dpad-btn по всему документу


// ============================================================
// [BLOCK: init-player]
// Загрузка/создание анонимного игрока.
// Вызывается до всего остального — от него зависит лимит.
// ============================================================
initPlayer();


// ============================================================
// [BLOCK: ui]
// UI-контроллер (score, timer, hint, reset button)
// ============================================================
const ui = createUI();


// ============================================================
// [BLOCK: game]
// Создание игры. Колбэки связывают её с UI.
// ============================================================
const game = createGame(canvas, {
  onScore: n => ui.setScore(n),

  onStart: () => {
    ui.hideHint();
    ui.hideReset();
  },

  onGameOver: () => {
    // Кнопка рестарта появляется только при проигрыше/победе
    ui.showReset();
  },

  onLimit: () => {
    // При достижении лимита играть нельзя — кнопку не показываем
    ui.hideReset();
    ui.showLimit();
  },
});


// ============================================================
// [BLOCK: input-handlers]
// Универсальные обработчики для всех контроллеров.
// Вызываются из dpad/keyboard/swipe — вся игровая логика здесь.
// ============================================================

// ----------------------------------------------------------
// Смена направления или старт игры (если ещё не начата)
// ----------------------------------------------------------
function handleDirection(dir) {
  if (!gameUnlocked) return;
  if (game.isLimitHit()) return;

  // Если игра не начата или закончилась — стартуем
  if (!game.isStarted() || game.isOver()) {
    if (game.isActive()) flushSession();
    ui.hideReset();
    game.init();
    return;
  }

  // Иначе — просто меняем направление
  game.setDirection(dir);
}

// ----------------------------------------------------------
// Действие (Space / Enter / R) — старт или рестарт
// ----------------------------------------------------------
function handleAction() {
  if (!gameUnlocked) return;
  if (game.isLimitHit()) { ui.showLimit(); return; }
  if (!game.isStarted() || game.isOver()) {
    if (game.isActive()) flushSession();
    ui.hideReset();
    game.init();
  }
}

// ----------------------------------------------------------
// Тап по канвасу — старт или рестарт
// ----------------------------------------------------------
function handleTap() {
  if (!gameUnlocked) return;
  if (game.isLimitHit()) { ui.showLimit(); return; }
  if (!game.isStarted() || game.isOver()) {
    if (game.isActive()) flushSession();
    ui.hideReset();
    game.init();
  }
}


// ============================================================
// [BLOCK: controls]
// Создание трёх контроллеров. Все они получают одни и те же
// обработчики — dpad, keyboard, swipe не отличаются по логике.
// ============================================================

const dpad = createDpad(dpadRoot, {
  onDirection: handleDirection,
});

const keyboard = createKeyboard({
  onDirection: handleDirection,
  onAction:    handleAction,
});

const swipe = createSwipe(canvas, {
  onDirection: dir => {
    // Свайп не стартует игру — только меняет направление
    if (!gameUnlocked) return;
    if (game.isLimitHit()) return;
    if (!game.isStarted() || game.isOver()) return;
    game.setDirection(dir);
  },
  onTap: handleTap,
});


// ============================================================
// [BLOCK: reset-button]
// Кнопка «リセット» — появляется только при проигрыше.
// По клику завершает сессию и запускает новую партию.
// ============================================================
const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', e => {
  e.stopPropagation();

  if (!gameUnlocked) return;
  if (game.isLimitHit()) { ui.showLimit(); return; }

  if (game.isActive()) flushSession();
  ui.hideReset();
  game.init();
});


// ============================================================
// [BLOCK: tap-on-canvas]
// Клик мышью по канвасу — старт/рестарт.
// На тач-устройствах сработает тот же обработчик после touchend.
// ============================================================
canvas.addEventListener('click', e => {
  e.preventDefault();
  handleTap();
});


// ============================================================
// [BLOCK: unlock-game]
// Разблокировка игры после принятия cookies.
// Вызывается из cookie-гейта.
// ============================================================
let gameUnlocked = false;

function unlockGame() {
  if (gameUnlocked) return;
  gameUnlocked = true;

  // Включаем все контроллеры
  dpad.enable();
  keyboard.enable();
  swipe.enable();

  // Показываем стартовый экран (или лимит, если он уже достигнут)
  if (isLimitReached()) {
    ui.showLimit();
  } else {
    game.showPreview();
    ui.showStart();
  }

  // Запускаем UI-таймер. Раз в секунду он дёргает
  // game.tickSessionTick() — для накопления времени игры.
  ui.startTimer(() => game.tickSessionTick());
  ui.updateTimer();
}


// ============================================================
// [BLOCK: cookie-gate]
// Создаём cookie-гейт. Если пользователь уже соглашался —
// unlockGame() вызовется сразу при init().
// ============================================================
const cookieGate = createCookieGate({
  onAccept: unlockGame,
});

cookieGate.init();


// ============================================================
// [BLOCK: lifecycle]
// Обработчики жизненного цикла — сохранение времени при
// закрытии вкладки или её скрытии.
// ============================================================

window.addEventListener('beforeunload', () => {
  if (game.isActive()) flushSession();
});

window.addEventListener('pagehide', () => {
  if (game.isActive()) flushSession();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.isActive()) {
    // Скрытие вкладки — принудительно завершаем текущую сессию
    // и перерисовываем канвас, чтобы остановить пульсацию
    game.flushSessionNow();
    game.render();
  }
});


// ============================================================
// [BLOCK: periodic-day-check]
// Раз в 30 секунд проверяем:
//   — не сменился ли день (тогда лимит сбросится сам)
//   — не пора ли показать экран лимита
//   — обновляем UI-таймер
// ============================================================
setInterval(() => {
  if (!gameUnlocked) return;

  if (!game.isActive() && !game.isStarted() && isLimitReached()) {
    ui.showLimit();
  }
  ui.updateTimer();
}, 30000);


// ============================================================
// [BLOCK: context-menu-block]
// Блокируем контекстное меню по долгому тапу на канвасе.
// На d-pad это уже сделано внутри dpad.js.
// ============================================================
canvas.addEventListener('contextmenu', e => e.preventDefault());


// ============================================================
// [BLOCK: debug-reset]
// Отладочный сброс лимита через URL ?resetLimit=1.
// Работает только на localhost / 127.0.0.1 / file://.
// На GitHub Pages параметр молча игнорируется.
// ============================================================
(function debugResetLimit() {
  const isDev =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.protocol === 'file:';

  if (!isDev) return;

  const params = new URLSearchParams(location.search);
  if (params.get('resetLimit') === '1') {
    try {
      localStorage.removeItem('sushi_snake_player_v1');
    } catch (e) {}

    // Убираем параметр из URL, чтобы F5 не сбрасывал снова
    params.delete('resetLimit');
    const newUrl = location.pathname + (params.toString() ? '?' + params : '');
    history.replaceState({}, '', newUrl);

    console.log(
      '%c🍣 Лимит сброшен (dev)',
      'color:#ff6b1a;font-weight:bold;font-size:14px'
    );

    // Перезагружаем, чтобы игрок создался заново
    location.reload();
  }
})();