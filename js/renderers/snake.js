// ============================================================
// [FILE: renderers/snake.js]
// Назначение: отрисовка змейки на canvas — голова и тело
// Правится: при изменении внешнего вида змейки
// Зависит: ни от чего (только ctx)
// Экспортирует: drawSnake
// ============================================================


// ============================================================
// [BLOCK: draw-snake]
// Точка входа. Проходит по массиву сегментов и рисует каждый.
// Первый сегмент — голова, остальные — тело.
//
// Работает с прямоугольной клеткой: cellW для X, cellH для Y.
//
// @param {CanvasRenderingContext2D} ctx — контекст канваса
// @param {Array<{x:number,y:number}>} snake — массив сегментов
// @param {number} cellW — ширина клетки в пикселях
// @param {number} cellH — высота клетки в пикселях
// ============================================================
export function drawSnake(ctx, snake, cellW, cellH) {
  for (let i = 0; i < snake.length; i++) {
    const seg = snake[i];
    const sx = seg.x * cellW;
    const sy = seg.y * cellH;

    if (i === 0) {
      drawHead(ctx, sx, sy, cellW, cellH);
    } else {
      drawBody(ctx, sx, sy, cellW, cellH);
    }
  }
}


// ============================================================
// [BLOCK: draw-head]
// Голова змейки — рисовый шарик с нори и икрой.
// ============================================================
function drawHead(ctx, sx, sy, cw, ch) {
  ctx.save();

  ctx.shadowColor = '#f0c000';
  ctx.shadowBlur = 10;

  // Внешний слой: рисовая подушка
  ctx.beginPath();
  ctx.ellipse(
    sx + cw / 2,
    sy + ch / 2,
    cw * 0.42,        // rx — от ширины
    ch * 0.38,        // ry — от высоты
    0, 0, Math.PI * 2
  );
  ctx.fillStyle = '#faf0dc';
  ctx.fill();
  ctx.strokeStyle = '#b38b4c';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Нори — тёмная сердцевина
  ctx.beginPath();
  ctx.ellipse(
    sx + cw / 2,
    sy + ch / 2,
    cw * 0.3,
    ch * 0.25,
    0, 0, Math.PI * 2
  );
  ctx.fillStyle = '#1e2e1e';
  ctx.fill();

  // Икра — оранжевый центр
  ctx.beginPath();
  ctx.arc(
    sx + cw / 2,
    sy + ch / 2,
    Math.min(cw, ch) * 0.15,   // радиус берём от меньшей стороны
    0, Math.PI * 2
  );
  ctx.fillStyle = '#e65c2e';
  ctx.fill();

  ctx.shadowBlur = 0;

  // Два блика
  ctx.fillStyle = '#ffb347';
  ctx.beginPath();
  ctx.arc(sx + cw / 2 - 4, sy + ch / 2 - 3, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sx + cw / 2 + 3, sy + ch / 2 + 2, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}


// ============================================================
// [BLOCK: draw-body]
// Тело змейки — маки-ролл: нори, рис, начинка.
// ============================================================
function drawBody(ctx, sx, sy, cw, ch) {
  ctx.save();

  ctx.shadowColor = '#c0a060';
  ctx.shadowBlur = 6;

  // Внешний слой: нори
  ctx.beginPath();
  ctx.ellipse(
    sx + cw / 2,
    sy + ch / 2,
    cw * 0.4,
    ch * 0.4,
    0, 0, Math.PI * 2
  );
  ctx.fillStyle = '#1a2a1a';
  ctx.fill();

  // Слой риса
  ctx.beginPath();
  ctx.ellipse(
    sx + cw / 2,
    sy + ch / 2,
    cw * 0.3,
    ch * 0.3,
    0, 0, Math.PI * 2
  );
  ctx.fillStyle = '#f5ead0';
  ctx.fill();

  // Начинка — три точки
  // Красная
  ctx.beginPath();
  ctx.arc(sx + cw / 2 - 3, sy + ch / 2 - 3, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#d44c1e';
  ctx.fill();

  // Зелёная
  ctx.beginPath();
  ctx.arc(sx + cw / 2 + 4, sy + ch / 2 + 2, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#7aa84a';
  ctx.fill();

  // Жёлтая
  ctx.beginPath();
  ctx.arc(sx + cw / 2 - 2, sy + ch / 2 + 5, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#f0c040';
  ctx.fill();

  ctx.restore();
}