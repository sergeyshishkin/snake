// ============================================================
// [FILE: controls/dpad.js]
// Назначение: обработка нажатий на кнопки направления (▲▼◀▶)
// Правится: при изменении поведения кнопок, добавлении haptics
// Зависит: ни от чего (получает колбэк извне)
// Экспортирует: createDpad
// ============================================================


// ============================================================
// [BLOCK: create-dpad]
// Подписывается на все элементы .dpad-btn внутри контейнера.
// Возвращает объект с методами enable/disable/destroy.
//
// @param {HTMLElement} root — контейнер (обычно .bottom-row или document)
// @param {Object} callbacks
// @param {Function} callbacks.onDirection(dir) — 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
// @param {Function} [callbacks.onAnyPress]    — опциональный, для отладки/аналитики
// ============================================================
export function createDpad(root, callbacks) {

  const onDirection = callbacks.onDirection;
  const onAnyPress  = callbacks.onAnyPress ?? (() => {});

  // Все кнопки с data-dir внутри root
  const buttons = root.querySelectorAll('.dpad-btn');

  // Флаг: включён ли контроллер. По умолчанию — нет.
  // main.js включает его только после закрытия cookie-баннера.
  let enabled = false;

  // Сохраняем слушатели для последующего снятия в destroy()
  const listeners = [];


  // ==========================================================
  // [BLOCK: handle-press]
  // Единая точка входа. Вызывается на pointerdown / touchstart.
  // ==========================================================
  function handlePress(btn) {
    if (!enabled) return;

    const dir = btn.dataset.dir;
    if (!dir) return;

    btn.classList.add('pressed');
    onAnyPress(dir);
    onDirection(dir);
  }


  // ==========================================================
  // [BLOCK: handle-release]
  // Снятие визуального состояния кнопки.
  // ==========================================================
  function handleRelease(btn) {
    btn.classList.remove('pressed');
  }


  // ==========================================================
  // [BLOCK: bind-button]
  // Навешиваем слушатели на одну кнопку.
  // Используем Pointer Events, если они есть.
  // Иначе — fallback на touchstart/touchend + mousedown/mouseup.
  // ==========================================================
  function bindButton(btn) {

    // ------------------------------------------------------
    // Современный путь: Pointer Events
    // (покрывает мышь, touch, стилус — всё в одном API)
    // ------------------------------------------------------
    if (window.PointerEvent) {

      const onDown = e => {
        e.preventDefault();
        e.stopPropagation();
        handlePress(btn);
      };
      const onUp = e => {
        e.preventDefault();
        handleRelease(btn);
      };
      const onCancel = () => handleRelease(btn);

      btn.addEventListener('pointerdown', onDown);
      btn.addEventListener('pointerup', onUp);
      btn.addEventListener('pointercancel', onCancel);
      btn.addEventListener('pointerleave', onCancel);

      // Для destroy()
      listeners.push(
        () => btn.removeEventListener('pointerdown', onDown),
        () => btn.removeEventListener('pointerup', onUp),
        () => btn.removeEventListener('pointercancel', onCancel),
        () => btn.removeEventListener('pointerleave', onCancel),
      );

      return;
    }

    // ------------------------------------------------------
    // Fallback: старые браузеры (iOS < 13, Android < 5)
    // Раздельные обработчики для touch и mouse.
    // ------------------------------------------------------
    const onTouchStart = e => {
      e.preventDefault();
      handlePress(btn);
    };
    const onTouchEnd = e => {
      e.preventDefault();
      handleRelease(btn);
    };
    const onMouseDown = e => {
      e.preventDefault();
      handlePress(btn);
    };
    const onMouseUp = () => handleRelease(btn);

    btn.addEventListener('touchstart', onTouchStart, { passive: false });
    btn.addEventListener('touchend',   onTouchEnd,   { passive: false });
    btn.addEventListener('touchcancel', onTouchEnd,  { passive: false });
    btn.addEventListener('mousedown',  onMouseDown);
    btn.addEventListener('mouseup',    onMouseUp);
    btn.addEventListener('mouseleave', onMouseUp);

    listeners.push(
      () => btn.removeEventListener('touchstart', onTouchStart),
      () => btn.removeEventListener('touchend', onTouchEnd),
      () => btn.removeEventListener('touchcancel', onTouchEnd),
      () => btn.removeEventListener('mousedown', onMouseDown),
      () => btn.removeEventListener('mouseup', onMouseUp),
      () => btn.removeEventListener('mouseleave', onMouseUp),
    );
  }


  // ==========================================================
  // [BLOCK: bind-all]
  // Навешиваем на все кнопки сразу
  // ==========================================================
  buttons.forEach(bindButton);


  // ==========================================================
  // [BLOCK: context-menu-block]
  // Блокируем контекстное меню по долгому тапу
  // (иначе на Android всплывает «Открыть в новой вкладке»)
  // ==========================================================
  function preventContextMenu(e) {
    e.preventDefault();
  }
  root.addEventListener('contextmenu', preventContextMenu);
  listeners.push(() => root.removeEventListener('contextmenu', preventContextMenu));


  // ==========================================================
  // [BLOCK: public-api]
  // ==========================================================
  return {
    enable()  { enabled = true; },
    disable() { enabled = false; },
    isEnabled: () => enabled,

    // Полное снятие слушателей — на случай пересоздания контроллера
    destroy() {
      listeners.forEach(off => off());
      listeners.length = 0;
    },
  };
}