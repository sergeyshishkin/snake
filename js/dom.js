// ============================================================
// [FILE: dom.js]
// Назначение: единый объект со ссылками на DOM-элементы
// Правится: при добавлении/переименовании элементов в index.html
// Зависит: ни от чего (выполняется при импорте)
// Экспортирует: $
// ============================================================

export const $ = {
  canvas:      document.getElementById('gameCanvas'),
  container:   document.getElementById('canvasContainer'),

  bestScore:   document.getElementById('bestScore'),
  score:       document.getElementById('scoreDisplay'),

  timerBox:    document.getElementById('timerBox'),
  timeLeft:    document.getElementById('timeLeft'),
  resetButton: document.getElementById('resetButton'),

  startHint:   document.getElementById('startHint'),

  cookieBanner: document.getElementById('cookieBanner'),
  cookieAccept: document.getElementById('cookieAccept'),

  dpad:        document.getElementById('dpad'),
  bottomRight: document.getElementById('bottomRight'),
};


// ----------------------------------------------------------
// Проверка на старте: все ли элементы на месте.
// Если чего-то нет — предупреждение в консоль сразу,
// а не при попытке обращения.
// ----------------------------------------------------------
if (typeof console !== 'undefined') {
  for (const [name, el] of Object.entries($)) {
    if (!el) {
      console.warn(`[dom.js] Элемент "${name}" не найден в DOM`);
    }
  }
}