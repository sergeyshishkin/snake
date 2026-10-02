// ============================================================
// [FILE: controls/keyboard.js]
// Назначение: обработка клавиатуры — стрелки, Space, R, Enter
// Правится: при добавлении горячих клавиш
// Зависит: ни от чего (получает колбэки извне)
// Экспортирует: createKeyboard
// ============================================================


// ============================================================
// [BLOCK: keys-map]
// Соответствие клавиш направлениям.
// Используется для быстрого поиска без switch.
// ============================================================
const ARROW_TO_DIR = {
  ArrowUp:    'UP',
  ArrowDown:  'DOWN',
  ArrowLeft:  'LEFT',
  ArrowRight: 'RIGHT',
};

// Клавиши «старт / рестарт»
const ACTION_KEYS = new Set([
  ' ',
  'Enter',
  'r',
  'R',
  'к',  // русская раскладка
  'К',
]);


// ============================================================
// [BLOCK: create-keyboard]
// Подписывается на keydown окна.
// Возвращает объект с методами enable/disable/destroy.
//
// @param {Object} callbacks
// @param {Function} callbacks.onDirection(dir) — 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
// @param {Function} callbacks.onAction()       — Space / Enter / R
// ============================================================
export function createKeyboard(callbacks) {

  const onDirection = callbacks.onDirection;
  const onAction    = callbacks.onAction;

  // Флаг активности. По умолчанию выключено — включает main.js
  // после закрытия cookie-баннера.
  let enabled = false;


  // ==========================================================
  // [BLOCK: handle-keydown]
  // Единый обработчик. Порядок:
  //   1. preventDefault для наших клавиш (иначе страница скроллится)
  //   2. проверка enabled
  //   3. определение действия
  // ==========================================================
  function handleKeydown(e) {

    const key = e.key;

    // ------------------------------------------------------
    // Отключаем скролл страницы по стрелкам и Space.
    // Делаем это ДО проверки enabled, чтобы поведение
    // было предсказуемым даже до старта игры.
    // ------------------------------------------------------
    if (key.startsWith('Arrow') || key === ' ') {
      e.preventDefault();
    }

    if (!enabled) return;

    // ------------------------------------------------------
    // Действия (старт / рестарт)
    // ------------------------------------------------------
    if (ACTION_KEYS.has(key)) {
      // PreventDefault для Enter и R — на случай, если
      // фокус на кнопке, чтобы не сработало её «нажатие»
      if (key === 'Enter' || key === 'r' || key === 'R') {
        e.preventDefault();
      }
      onAction();
      return;
    }

    // ------------------------------------------------------
    // Направления
    // ------------------------------------------------------
    const dir = ARROW_TO_DIR[key];
    if (dir) {
      onDirection(dir);
    }
  }


  // ==========================================================
  // [BLOCK: bind]
  // Навешиваем слушатель на window.
  // Именно window, а не document, чтобы ловить клавиши
  // независимо от того, где фокус.
  // ==========================================================
  window.addEventListener('keydown', handleKeydown);


  // ==========================================================
  // [BLOCK: public-api]
  // ==========================================================
  return {
    enable()  { enabled = true; },
    disable() { enabled = false; },
    isEnabled: () => enabled,

    destroy() {
      window.removeEventListener('keydown', handleKeydown);
    },
  };
}