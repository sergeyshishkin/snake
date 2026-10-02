// ============================================================
// [FILE: renderers/food.js]
// Назначение: отрисовка еды (суши-нигири) на canvas
// Правится: при изменении эффектов (свечение, пульсация, блики)
// Зависит: assets/sushi.js (данные слоёв)
// Экспортирует: drawSushi
// ============================================================

import {
  SUSHI_LAYERS,
  ROE_HIGHLIGHTS,
  SUSHI_VIEWBOX_SIZE,
} from '../assets/sushi.js';


// ============================================================
// [BLOCK: draw-sushi]
// Главная функция. Рисует суши в клетке с центром (cx, cy)
// и заданным размером size.
//
// @param {CanvasRenderingContext2D} ctx — контекст канваса
// @param {number} cx — центр клетки по X (в пикселях)
// @param {number} cy — центр клетки по Y (в пикселях)
// @param {number} size — размер клетки (квадрат)
// @param {Object} [options] — опции отрисовки
// @param {boolean} [options.includeGrass=true]  — рисовать листья
// @param {boolean} [options.includeHighlights=true] — рисовать блики
// @param {number}  [options.glow=12]     — сила свечения икры
// @param {number}  [options.time=0]      — время (мс) для пульсации
// @param {string}  [options.roeColor]    — переопределить цвет икры
// ============================================================
export function drawSushi(ctx, cx, cy, size, options = {}) {
  const scale = size / SUSHI_VIEWBOX_SIZE;

  const includeGrass      = options.includeGrass      ?? true;
  const includeHighlights = options.includeHighlights ?? true;
  const glow              = options.glow              ?? 12;
  const time              = options.time              ?? 0;

  // Пульсация свечения — лёгкое «дыхание» от 0.85 до 1.0
  const pulse = 0.85 + 0.15 * Math.sin(time / 300);

  ctx.save();

  // Сдвигаем начало координат в левый-верхний угол клетки,
  // затем масштабируем так, чтобы вся фигура заняла size × size
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(scale, scale);


  // ----------------------------------------------------------
  // [SUB-BLOCK: base-layers]
  // Нори + её блики. Рисуются всегда.
  // ----------------------------------------------------------
  ctx.fillStyle = SUSHI_LAYERS.nori.fill;
  ctx.fill(SUSHI_LAYERS.nori.path);

  ctx.fillStyle = SUSHI_LAYERS.nori_highlight_left.fill;
  ctx.fill(SUSHI_LAYERS.nori_highlight_left.path);

  ctx.fillStyle = SUSHI_LAYERS.nori_highlight_right.fill;
  ctx.fill(SUSHI_LAYERS.nori_highlight_right.path);


  // ----------------------------------------------------------
  // [SUB-BLOCK: grass-layers]
  // Декоративные листья по краям. Отключаются через options.
  // ----------------------------------------------------------
  if (includeGrass) {
    ctx.fillStyle = SUSHI_LAYERS.grass_back.fill;
    ctx.fill(SUSHI_LAYERS.grass_back.path);

    ctx.fillStyle = SUSHI_LAYERS.grass_front.fill;
    ctx.fill(SUSHI_LAYERS.grass_front.path);
  }


  // ----------------------------------------------------------
  // [SUB-BLOCK: roe-layer]
  // Икра — главный элемент. С пульсирующим свечением.
  // Цвет можно переопределить через options.roeColor.
  // ----------------------------------------------------------
  ctx.save();
  ctx.shadowColor = '#ff8c00';
  ctx.shadowBlur  = glow * pulse;
  ctx.fillStyle   = options.roeColor ?? SUSHI_LAYERS.roe.fill;
  ctx.fill(SUSHI_LAYERS.roe.path);
  ctx.restore();


  // ----------------------------------------------------------
  // [SUB-BLOCK: roe-highlights]
  // Блики на икре. Рисуются двумя слоями:
  //   1) мягкий полупрозрачный круг радиуса r
  //   2) маленькая яркая точка в верхнем-левом углу круга
  // Это даёт ощущение глянцевой поверхности.
  // ----------------------------------------------------------
  if (includeHighlights) {
    ctx.save();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur  = 0;

    // Мягкий слой
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (const h of ROE_HIGHLIGHTS) {
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Яркая точка
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    for (const h of ROE_HIGHLIGHTS) {
      ctx.beginPath();
      ctx.arc(h.x - 1, h.y - 1, h.r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  ctx.restore();
}