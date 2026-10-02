import { getRemainingMs } from './player-limits.js';

export function createUI() {
  const scoreSpan = document.getElementById('scoreDisplay');
  const timerBox = document.getElementById('timerBox');
  const timeLeftSpan = document.getElementById('timeLeft');
  const startHint = document.getElementById('startHint');

  let timerInterval = null;

  function updateTimer() {
    const ms = getRemainingMs();
    const sec = Math.ceil(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    timeLeftSpan.textContent = `${m}:${String(s).padStart(2, '0')}`;

    timerBox.classList.remove('warning', 'danger');
    if (ms <= 30000) timerBox.classList.add('danger');
    else if (ms <= 60000) timerBox.classList.add('warning');
  }

  function startTimer(onTick) {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      onTick();
      updateTimer();
    }, 1000);
    updateTimer();
  }

  function showStart() {
    startHint.style.display = 'block';
    startHint.classList.remove('limit-hint');
    startHint.innerHTML = `▶ タップでスタート<br><small>TAP TO START</small>`;
  }

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

  function hideHint() { startHint.style.display = 'none'; }
  function setScore(n) { scoreSpan.textContent = n; }

  return { updateTimer, startTimer, showStart, showLimit, hideHint, setScore };
}