// ============================================================
// [FILE: renderers/snake.js]
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


function drawHead(ctx, sx, sy, cw, ch) {
  ctx.save();

  ctx.shadowColor = '#f0c000';
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.ellipse(
    sx + cw / 2,
    sy + ch / 2,
    cw * 0.42,
    ch * 0.38,
    0, 0, Math.PI * 2
  );
  ctx.fillStyle = '#faf0dc';
  ctx.fill();
  ctx.strokeStyle = '#b38b4c';
  ctx.lineWidth = 2;
  ctx.stroke();

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

  ctx.beginPath();
  ctx.arc(
    sx + cw / 2,
    sy + ch / 2,
    Math.min(cw, ch) * 0.15,
    0, Math.PI * 2
  );
  ctx.fillStyle = '#e65c2e';
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffb347';
  ctx.beginPath();
  ctx.arc(sx + cw / 2 - 4, sy + ch / 2 - 3, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sx + cw / 2 + 3, sy + ch / 2 + 2, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}


function drawBody(ctx, sx, sy, cw, ch) {
  ctx.save();

  ctx.shadowColor = '#c0a060';
  ctx.shadowBlur = 6;

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

  ctx.beginPath();
  ctx.arc(sx + cw / 2 - 3, sy + ch / 2 - 3, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#d44c1e';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(sx + cw / 2 + 4, sy + ch / 2 + 2, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#7aa84a';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(sx + cw / 2 - 2, sy + ch / 2 + 5, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#f0c040';
  ctx.fill();

  ctx.restore();
}