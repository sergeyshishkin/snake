// ============================================================
// [FILE: ui.js]
// Назначение: связь игровой логики с DOM-элементами
// Правится: при изменении текстов подсказок, элементов UI
// Зависит: player-limits.js (getRemainingMs)
// Экспортирует: createUI
// ============================================================

import { getRemainingMs } from './player-limits.js';


// ============================================================
// [BLOCK: create-ui]
// Фабрика UI-контроллера. Кэширует DOM-элементы,
// предоставляет методы для обновления интерфейса.
// ============================================================
export function createUI() {

  // ----------------------------------------------------------
  // Кэш DOM-элементов. Ищем один раз при создании.
  // ----------------------------------------------------------
  const scoreSpan    = document.getElementById('scoreDisplay');
  const timerBox     = document.getElementById('timerBox');
  const timeLeftSpan = document.getElementById('timeLeft');
  const startHint    = document.getElementById('startHint');
  const resetButton  = document.getElementById('resetButton');

  let timerInterval = null;


  // ==========================================================
  // [BLOCK: score]
  // Обновление счёта
  // ==========================================================
  function setScore(n) {
    scoreSpan.textContent = n;
  }


  // ==========================================================
  // [BLOCK: timer]
  // Отображение остатка времени + смена цвета плашки
  // Пороги: warning ≤ 60 сек, danger ≤ 30 сек
  // ==========================================================
  function updateTimer() {
    const ms = getRemainingMs();
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;

    timeLeftSpan.textContent = `${min}:${String(sec).padStart(2, '0')}`;

    timerBox.classList.remove('warning', 'danger');
    if (ms <= 30000) {
      timerBox.classList.add('danger');
    } else if (ms <= 60000) {
      timerBox.classList.add('warning');
    }
  }


  // ==========================================================
  // [BLOCK: timer-loop]
  // Запуск периодического обновления таймера.
  // Раз в секунду:
  //   1. вызывает onTick — для накопления сессии в player-limits
  //   2. пересчитывает остаток и обновляет DOM
  // ==========================================================
  function startTimer(onTick) {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      onTick();
      updateTimer();
    }, 1000);

    updateTimer(); // сразу отрисовать актуальное значение
  }


  // ==========================================================
  // [BLOCK: start-hint]
  // Стартовая подсказка поверх канваса.
  // Показывается до первого старта партии.
  // ==========================================================
  function showStart() {
    startHint.style.display = 'block';
    startHint.classList.remove('limit-hint');
    startHint.innerHTML =
      '▶ タップでスタート<br>' +
      '<small>TAP TO START</small>';
  }

  function hideHint() {
    startHint.style.display = 'none';
  }


  // ==========================================================
  // [BLOCK: limit-hint]
  // Экран «время вышло».
  // Показывается, когда дневной лимит достигнут.
  // ==========================================================
  function showLimit() {
    startHint.style.display = 'block';
    startHint.classList.add('limit-hint');
    startHint.innerHTML = `
      <span class="big">⛔ 時間切れ</span>
      <span class="big" style="font-size:1em;">TIME LIMIT REACHED</span>
      <small>今日のプレイ時間は終了しました</small>
      <small style="font-size:0.5em;opacity:0.8;">Come back tomorrow!</small>
    `;
  }


  // ==========================================================
  // [BLOCK: reset-button]
  // Кнопка рестарта появляется только при проигрыше/победе.
  // Управляется классом .hidden (объявлен в base.css).
  // ==========================================================
  function showReset() {
    resetButton.classList.remove('hidden');
  }

  function hideReset() {
    resetButton.classList.add('hidden');
  }


  // ==========================================================
  // [BLOCK: public-api]
  // ==========================================================
  return {
    setScore,
    updateTimer,
    startTimer,
    showStart,
    showLimit,
    hideHint,
    showReset,
    hideReset,
  };
}