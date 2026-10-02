// ============================================================
// [FILE: ui.js]
// Назначение: реактивный UI — одна функция render() читает
//             state и обновляет DOM. Никаких императивных
//             showX/hideX снаружи.
// Правится: при изменении элементов UI
// Зависит: state.js, dom.js, player-limits.js
// Экспортирует: createUI
// ============================================================

import { state } from './state.js';
import { $ } from './dom.js';
import { getRemainingMs } from './player-limits.js';


export function createUI() {

  let timerInterval = null;


  // ==========================================================
  // [BLOCK: render]
  // Единая функция обновления UI. Читает state и приводит DOM
  // в соответствие. Вызывается после каждого updateState().
  // ==========================================================
  function render() {

    // ------------------------------------------------------
    // Score и Best
    // ------------------------------------------------------
    $.score.textContent     = state.score;
    $.bestScore.textContent = state.bestScore;

    // ------------------------------------------------------
    // Timer / Restart swap в правой ячейке
    // ------------------------------------------------------
    if (state.panelMode === 'reset') {
      $.timerBox.classList.add('hidden');
      $.resetButton.classList.remove('hidden');
    } else {
      $.timerBox.classList.remove('hidden');
      $.resetButton.classList.add('hidden');
    }

    // ------------------------------------------------------
    // Start hint (или limit hint)
    // ------------------------------------------------------
    if (!state.hintVisible) {
      $.startHint.style.display = 'none';
      $.startHint.classList.remove('limit-hint');
    } else {
      $.startHint.style.display = 'block';

      if (state.hintKind === 'limit') {
        $.startHint.classList.add('limit-hint');
        $.startHint.innerHTML = `
          <span class="big">⛔ 時間切れ</span>
          <span class="big" style="font-size:1em;">TIME LIMIT REACHED</span>
          <small>今日のプレイ時間は終了しました</small>
          <small style="font-size:0.5em;opacity:0.8;">Come back tomorrow!</small>
        `;
      } else {
        $.startHint.classList.remove('limit-hint');
        $.startHint.innerHTML =
          '▶ タップでスタート<br>' +
          '<small>TAP TO START</small>';
      }
    }
  }


  // ==========================================================
  // [BLOCK: timer]
  // Таймер обновляется отдельно — он не часть основного state
  // (значение приходит из player-limits при каждом вызове).
  // ==========================================================
  function updateTimer() {
    const ms = getRemainingMs();
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;

    $.timeLeft.textContent = `${min}:${String(sec).padStart(2, '0')}`;

    $.timerBox.classList.remove('warning', 'danger');
    if (ms <= 30000) {
      $.timerBox.classList.add('danger');
    } else if (ms <= 60000) {
      $.timerBox.classList.add('warning');
    }
  }


  function startTimer(onTick) {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      onTick();
      updateTimer();
    }, 1000);
    updateTimer();
  }


  return {
    render,
    updateTimer,
    startTimer,
  };
}