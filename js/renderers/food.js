// ============================================================
// [FILE: renderers/food.js]
// ============================================================

import {
  SUSHI_LAYERS,
  ROE_HIGHLIGHTS,
  SUSHI_VIEWBOX_SIZE,
} from '../assets/sushi.js';


export function drawSushi(ctx, cx, cy, size, options = {}) {
  const scale = size / SUSHI_VIEWBOX_SIZE;

  const includeGrass      = options.includeGrass      ?? true;
  const includeHighlights = options.includeHighlights ?? true;
  const glow              = options.glow              ?? 12;
  const time              = options.time              ?? 0;

  const pulse = 0.85 + 0.15 * Math.sin(time / 300);

  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(scale, scale);

  ctx.fillStyle = SUSHI_LAYERS.nori.fill;
  ctx.fill(SUSHI_LAYERS.nori.path);

  ctx.fillStyle = SUSHI_LAYERS.nori_highlight_left.fill;
  ctx.fill(SUSHI_LAYERS.nori_highlight_left.path);

  ctx.fillStyle = SUSHI_LAYERS.nori_highlight_right.fill;
  ctx.fill(SUSHI_LAYERS.nori_highlight_right.path);

  if (includeGrass) {
    ctx.fillStyle = SUSHI_LAYERS.grass_back.fill;
    ctx.fill(SUSHI_LAYERS.grass_back.path);

    ctx.fillStyle = SUSHI_LAYERS.grass_front.fill;
    ctx.fill(SUSHI_LAYERS.grass_front.path);
  }

  ctx.save();
  ctx.shadowColor = '#ff8c00';
  ctx.shadowBlur  = glow * pulse;
  ctx.fillStyle   = options.roeColor ?? SUSHI_LAYERS.roe.fill;
  ctx.fill(SUSHI_LAYERS.roe.path);
  ctx.restore();

  if (includeHighlights) {
    ctx.save();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur  = 0;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (const h of ROE_HIGHLIGHTS) {
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      ctx.fill();
    }

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