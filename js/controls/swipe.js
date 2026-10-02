// ============================================================
// [FILE: controls/swipe.js]
// Назначение: свайпы по канвасу — альтернатива d-pad и клавиатуре
// Правится: при изменении чувствительности, порогов
// Зависит: ни от чего (получает колбэки извне)
// Экспортирует: createSwipe
// ============================================================


// ============================================================
// [BLOCK: constants]
// Пороги для распознавания свайпа
// ============================================================

// Минимальное расстояние (в пикселях), чтобы считать жест свайпом.
// Меньше — это тап, а не свайп.
const MIN_SWIPE_DISTANCE = 20;


// ============================================================
// [BLOCK: create-swipe]
// Подписывается на touch-события канваса.
// Возвращает объект с методами enable/disable/destroy.
//
// @param {HTMLElement} target — обычно canvas
// @param {Object} callbacks
// @param {Function} callbacks.onDirection(dir) — 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
// @param {Function} [callbacks.onTap]         — тап без движения
// ============================================================
export function createSwipe(target, callbacks) {

  const onDirection = callbacks.onDirection;
  const onTap       = callbacks.onTap ?? (() => {});

  // Флаг активности. По умолчанию — выключено.
  let enabled = false;

  // ----------------------------------------------------------
  // Состояние текущего жеста
  // ----------------------------------------------------------
  let startX = 0;
  let startY = 0;
  let startTime = 0;


  // ==========================================================
  // [BLOCK: handle-touchstart]
  // Запоминаем точку старта и время.
  // preventDefault — чтобы не запустить скролл/зум.
  // ==========================================================
  function handleTouchStart(e) {
    e.preventDefault();

    if (!enabled) return;
    if (e.touches.length === 0) return;

    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    startTime = Date.now();
  }


  // ==========================================================
  // [BLOCK: handle-touchend]
  // Считаем разницу, определяем направление или тап.
  // ==========================================================
  function handleTouchEnd(e) {
    e.preventDefault();

    if (!enabled) return;
    if (e.changedTouches.length === 0) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const maxDelta = Math.max(absDx, absDy);

    // ------------------------------------------------------
    // Слишком маленькое смещение — считаем тапом
    // ------------------------------------------------------
    if (maxDelta < MIN_SWIPE_DISTANCE) {
      onTap();
      return;
    }

    // ------------------------------------------------------
    // Определяем доминирующую ось
    // ------------------------------------------------------
    let dir;
    if (absDx > absDy) {
      dir = dx > 0 ? 'RIGHT' : 'LEFT';
    } else {
      dir = dy > 0 ? 'DOWN' : 'UP';
    }

    onDirection(dir);
  }


  // ==========================================================
  // [BLOCK: handle-touchcancel]
  // Жест прерван (звонок, уведомление и т.п.) — сбрасываем.
  // ==========================================================
  function handleTouchCancel(e) {
    e.preventDefault();
    startX = 0;
    startY = 0;
  }


  // ==========================================================
  // [BLOCK: handle-touchmove]
  // Полностью блокируем скролл во время жеста по канвасу.
  // ==========================================================
  function handleTouchMove(e) {
    e.preventDefault();
  }


  // ==========================================================
  // [BLOCK: bind]
  // Навешиваем все слушатели. Все — с { passive: false },
  // потому что мы вызываем preventDefault.
  // ==========================================================
  target.addEventListener('touchstart',  handleTouchStart,  { passive: false });
  target.addEventListener('touchend',    handleTouchEnd,    { passive: false });
  target.addEventListener('touchcancel', handleTouchCancel, { passive: false });
  target.addEventListener('touchmove',   handleTouchMove,   { passive: false });


  // ==========================================================
  // [BLOCK: public-api]
  // ==========================================================
  return {
    enable()  { enabled = true; },
    disable() { enabled = false; },
    isEnabled: () => enabled,

    destroy() {
      target.removeEventListener('touchstart',  handleTouchStart);
      target.removeEventListener('touchend',    handleTouchEnd);
      target.removeEventListener('touchcancel', handleTouchCancel);
      target.removeEventListener('touchmove',   handleTouchMove);
    },
  };
}