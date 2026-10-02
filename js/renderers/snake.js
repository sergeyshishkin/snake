export function drawSnake(ctx, snake, cellSize) {
  for (let i = 0; i < snake.length; i++) {
    const seg = snake[i];
    const sx = seg.x * cellSize;
    const sy = seg.y * cellSize;

    if (i === 0) drawSnakeHead(ctx, sx, sy, cellSize);
    else drawSnakeBody(ctx, sx, sy, cellSize);
  }
}

function drawSnakeHead(ctx, sx, sy, cs) {
  ctx.save();
  ctx.shadowColor = '#f0c000';
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.ellipse(sx + cs/2, sy + cs/2, cs*0.42, cs*0.38, 0, 0, Math.PI*2);
  ctx.fillStyle = '#faf0dc'; ctx.fill();
  ctx.strokeStyle = '#b38b4c'; ctx.lineWidth = 2; ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(sx + cs/2, sy + cs/2, cs*0.3, cs*0.25, 0, 0, Math.PI*2);
  ctx.fillStyle = '#1e2e1e'; ctx.fill();

  ctx.beginPath();
  ctx.arc(sx + cs/2, sy + cs/2, cs*0.15, 0, Math.PI*2);
  ctx.fillStyle = '#e65c2e'; ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffb347';
  ctx.beginPath();
  ctx.arc(sx + cs/2 - 4, sy + cs/2 - 3, 2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath();
  ctx.arc(sx + cs/2 + 3, sy + cs/2 + 2, 2, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawSnakeBody(ctx, sx, sy, cs) {
  ctx.save();
  ctx.shadowColor = '#c0a060';
  ctx.shadowBlur = 6;

  ctx.beginPath();
  ctx.ellipse(sx + cs/2, sy + cs/2, cs*0.4, cs*0.4, 0, 0, Math.PI*2);
  ctx.fillStyle = '#1a2a1a'; ctx.fill();

  ctx.beginPath();
  ctx.ellipse(sx + cs/2, sy + cs/2, cs*0.3, cs*0.3, 0, 0, Math.PI*2);
  ctx.fillStyle = '#f5ead0'; ctx.fill();

  ctx.beginPath();
  ctx.arc(sx + cs/2 - 3, sy + cs/2 - 3, 4, 0, Math.PI*2);
  ctx.fillStyle = '#d44c1e'; ctx.fill();

  ctx.beginPath();
  ctx.arc(sx + cs/2 + 4, sy + cs/2 + 2, 3.5, 0, Math.PI*2);
  ctx.fillStyle = '#7aa84a'; ctx.fill();

  ctx.beginPath();
  ctx.arc(sx + cs/2 - 2, sy + cs/2 + 5, 2.5, 0, Math.PI*2);
  ctx.fillStyle = '#f0c040'; ctx.fill();

  ctx.restore();
}