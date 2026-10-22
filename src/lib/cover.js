// Procedural poster covers for projects: architecture graph + big type.
// The same drawing feeds DOM <canvas> elements and WebGL textures.

export const SCHEMES = [
  { bg: '#2b3125', bg2: '#3d4636', ink: '#ecdfcc', accent: '#d6493a', onAccent: '#ecdfcc' },
  { bg: '#ecdfcc', bg2: '#e2d3bd', ink: '#181c14', accent: '#d6493a', onAccent: '#ecdfcc' },
  { bg: '#11130f', bg2: '#22261d', ink: '#ecdfcc', accent: '#d6493a', onAccent: '#ecdfcc' },
];

export const schemeFor = (index) => SCHEMES[index % SCHEMES.length];

function setFont(ctx, weight, size, spacingEm = 0) {
  ctx.font = `${weight} ${size}px Satoshi, Arial, Helvetica, sans-serif`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${(spacingEm * size).toFixed(2)}px`;
}

function fitFont(ctx, text, weight, maxSize, maxWidth, spacingEm = 0) {
  setFont(ctx, weight, maxSize, spacingEm);
  const w = ctx.measureText(text).width;
  const size = w > maxWidth ? maxSize * (maxWidth / w) : maxSize;
  setFont(ctx, weight, size, spacingEm);
  return size;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function arrow(ctx, x, y, dir, size) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - dir * size, y - size * 0.6);
  ctx.lineTo(x - dir * size, y + size * 0.6);
  ctx.closePath();
  ctx.fill();
}

function drawGraph(ctx, arch, box, c, unit) {
  if (!arch?.nodes?.length) return;
  const nodes = arch.nodes;
  const maxX = Math.max(...nodes.map((n) => n.x));
  const maxY = Math.max(...nodes.map((n) => n.y));
  const minY = Math.min(...nodes.map((n) => n.y));
  const cols = maxX + 1;
  const rows = maxY - minY + 1;
  const cellW = box.w / cols;
  const cellH = Math.min(box.h / rows, unit * 0.14);
  const offY = box.y + (box.h - cellH * rows) / 2;
  const nw = Math.min(cellW * 0.8, unit * 0.2);
  const nh = Math.min(cellH * 0.62, unit * 0.068);
  const pos = {};
  for (const n of nodes) {
    pos[n.id] = {
      cx: box.x + cellW * (n.x + 0.5),
      cy: offY + cellH * (n.y - minY + 0.5),
      n,
    };
  }

  // Edges first, so nodes sit on top.
  ctx.lineWidth = Math.max(1, unit * 0.0028);
  ctx.strokeStyle = c.ink;
  ctx.fillStyle = c.ink;
  ctx.globalAlpha = 0.55;
  for (const [from, to] of arch.edges || []) {
    const a = pos[from];
    const b = pos[to];
    if (!a || !b) continue;
    ctx.beginPath();
    if (b.cx > a.cx + 1) {
      const x1 = a.cx + nw / 2;
      const x2 = b.cx - nw / 2;
      const mx = (x1 + x2) / 2;
      ctx.moveTo(x1, a.cy);
      ctx.lineTo(mx, a.cy);
      ctx.lineTo(mx, b.cy);
      ctx.lineTo(x2 - unit * 0.004, b.cy);
      ctx.stroke();
      arrow(ctx, x2, b.cy, 1, unit * 0.011);
    } else if (b.cx < a.cx - 1) {
      // Back edge (e.g. replay): loop under the nodes.
      const y = Math.max(a.cy, b.cy) + nh * 0.9;
      ctx.setLineDash([unit * 0.008, unit * 0.007]);
      ctx.moveTo(a.cx, a.cy + nh / 2);
      ctx.lineTo(a.cx, y);
      ctx.lineTo(b.cx, y);
      ctx.lineTo(b.cx, b.cy + nh / 2 + unit * 0.004);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.save();
      ctx.translate(b.cx, b.cy + nh / 2);
      ctx.rotate(-Math.PI / 2);
      arrow(ctx, 0, 0, 1, unit * 0.011);
      ctx.restore();
    } else {
      const dir = b.cy > a.cy ? 1 : -1;
      const y1 = a.cy + (dir * nh) / 2;
      const y2 = b.cy - (dir * nh) / 2;
      ctx.moveTo(a.cx, y1);
      ctx.lineTo(a.cx, y2 - dir * unit * 0.004);
      ctx.stroke();
      ctx.save();
      ctx.translate(a.cx, y2);
      ctx.rotate((dir * Math.PI) / 2);
      arrow(ctx, 0, 0, 1, unit * 0.011);
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;

  for (const { cx, cy, n } of Object.values(pos)) {
    const x = cx - nw / 2;
    const y = cy - nh / 2;
    const kind = n.kind || 'service';
    const radius = kind === 'store' ? nh / 2 : unit * 0.006;
    ctx.lineWidth = Math.max(1, unit * 0.0032);
    ctx.setLineDash(kind === 'client' ? [unit * 0.009, unit * 0.006] : []);
    roundRect(ctx, x, y, nw, nh, radius);
    if (kind === 'broker') {
      ctx.fillStyle = c.accent;
      ctx.fill();
    } else {
      ctx.fillStyle = c.bg;
      ctx.fill();
      if (kind === 'external') {
        ctx.globalAlpha = 0.14;
        ctx.fillStyle = c.ink;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = c.ink;
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.fillStyle = kind === 'broker' ? c.onAccent : c.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    fitFont(ctx, n.label.toUpperCase(), 800, nh * 0.36, nw * 0.84, 0.02);
    ctx.fillText(n.label.toUpperCase(), cx, cy + nh * 0.03);
  }
}

/**
 * Draws a project poster into ctx at (0,0,w,h).
 * Layout scales with the shorter dimension so it reads at any aspect ratio.
 */
export function drawCover(ctx, w, h, project, index = 0) {
  const c = schemeFor(index);
  const unit = Math.min(w, h * 1.4);
  const pad = unit * 0.055;

  // Background with a soft gradient bloom.
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w * 0.72, h * 0.3, 0, w * 0.72, h * 0.3, Math.max(w, h) * 0.75);
  g.addColorStop(0, c.bg2);
  g.addColorStop(1, c.bg);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Top row.
  const topY = pad + unit * 0.012;
  ctx.fillStyle = c.ink;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  setFont(ctx, 900, unit * 0.026, 0.12);
  const num = String(index + 1).padStart(2, '0');
  ctx.fillStyle = c.accent;
  ctx.fillRect(pad, topY - unit * 0.009, unit * 0.018, unit * 0.018);
  ctx.fillStyle = c.ink;
  ctx.fillText(num, pad + unit * 0.032, topY);
  setFont(ctx, 700, unit * 0.022, 0.14);
  ctx.globalAlpha = 0.75;
  ctx.fillText((project.kicker || '').toUpperCase(), pad + unit * 0.085, topY);
  ctx.textAlign = 'right';
  ctx.fillText(project.year || '', w - pad, topY);
  ctx.globalAlpha = 0.2;
  ctx.fillRect(pad, topY + unit * 0.03, w - pad * 2, Math.max(1, unit * 0.0016));
  ctx.globalAlpha = 1;

  // Name, fitted to width, anchored at the bottom.
  const stackSize = unit * 0.021;
  const stackY = h - pad - stackSize * 0.5;
  const name = (project.name || '').toUpperCase();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const nameSize = fitFont(ctx, name, 900, unit * 0.16, w - pad * 2, -0.045);
  const nameBase = stackY - stackSize * 1.6;
  ctx.fillStyle = c.ink;
  ctx.fillText(name, pad - nameSize * 0.04, nameBase);

  // Stack line.
  ctx.textBaseline = 'middle';
  setFont(ctx, 700, stackSize, 0.1);
  ctx.globalAlpha = 0.6;
  let stack = (project.stack || []).slice(0, 6).join('  ·  ').toUpperCase();
  while (ctx.measureText(stack).width > w - pad * 2 && stack.includes('  ·  ')) {
    stack = stack.slice(0, stack.lastIndexOf('  ·  '));
  }
  ctx.fillText(stack, pad, stackY);
  ctx.globalAlpha = 1;

  // Architecture graph in the middle band.
  const graphTop = topY + unit * 0.08;
  const graphBottom = nameBase - nameSize * 0.95;
  drawGraph(ctx, project.architecture, { x: pad, y: graphTop, w: w - pad * 2, h: Math.max(0, graphBottom - graphTop) }, c, unit);
}

export function createCoverCanvas(project, index, w = 1200, h = 900) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  drawCover(canvas.getContext('2d'), w, h, project, index);
  return canvas;
}
