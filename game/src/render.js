// Everything the night looks like: charcoal marble under moonlight, brass
// walls, sweeping cones, the sapphire's glow. Drawn from the world alone,
// so every screenshot is a true render of the game's own code.

import { W, H, FLOOR_TOP, PAL, TUNING as T } from './config.js';
import { clamp } from './geom.js';

const grainCanvas = makeGrain();

function makeGrain() {
  const c = document.createElement('canvas');
  c.width = 160; c.height = 160;
  const g = c.getContext('2d');
  const img = g.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 118 + Math.random() * 74;
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v;
    img.data[i + 3] = 26;
  }
  g.putImageData(img, 0, 0);
  return c;
}

export function drawGame(ctx, game) {
  ctx.fillStyle = PAL.bg;
  ctx.fillRect(0, 0, W, H);
  drawFloor(ctx, game);
  drawShadows(ctx, game);
  drawVents(ctx, game);
  drawExit(ctx, game);
  drawLoot(ctx, game);
  drawDoors(ctx, game);
  for (const s of game.smokes) drawSmoke(ctx, s);
  drawPlinths(ctx, game);
  for (const c of game.cameras) drawCameraCone(ctx, c, game);
  for (const g of game.guards) drawGuardCone(ctx, g, game);
  drawWalls(ctx, game);
  for (const g of game.guards) drawGuard(ctx, g);
  for (const c of game.cameras) drawCameraBox(ctx, c);
  for (const d of game.decoys) drawDecoy(ctx, d);
  drawPlayer(ctx, game);
  drawGrainAndVignette(ctx, game);
}

function drawFloor(ctx, game) {
  ctx.fillStyle = PAL.floorA;
  ctx.fillRect(0, FLOOR_TOP, W, H - FLOOR_TOP);
  // marble tiles, two sizes of banding
  ctx.strokeStyle = PAL.tileLine;
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, FLOOR_TOP); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = FLOOR_TOP; y <= H; y += 64) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(120,132,160,0.16)';
  for (let y = FLOOR_TOP + 192; y < H; y += 192) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  // moonlight through the high windows
  const pools = game.levelIndex === 2
    ? [[640, 390, 240], [180, 200, 190], [1080, 520, 200]]
    : [[320, 240, 200], [980, 300, 220], [640, 560, 190]];
  for (const [px, py, r] of pools) {
    const g = ctx.createRadialGradient(px, py, 10, px, py, r);
    g.addColorStop(0, PAL.moonPool);
    g.addColorStop(1, 'rgba(122,150,214,0)');
    ctx.fillStyle = g;
    ctx.fillRect(px - r, py - r, r * 2, r * 2);
  }
}

function drawShadows(ctx, game) {
  ctx.fillStyle = PAL.shadow;
  for (const s of game.shadows) ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.strokeStyle = 'rgba(6,8,14,0.9)';
  for (const s of game.shadows) ctx.strokeRect(s.x + 0.5, s.y + 0.5, s.w - 1, s.h - 1);
}

function drawVents(ctx, game) {
  for (const v of game.vents) {
    for (const e of [v.a, v.b]) drawGrate(ctx, e.x, e.y);
  }
}

function drawGrate(ctx, x, y) {
  ctx.save();
  ctx.translate(x - 20, y - 14);
  ctx.fillStyle = '#1a1d28';
  ctx.fillRect(0, 0, 40, 28);
  ctx.strokeStyle = PAL.goldDim;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, 38, 26);
  ctx.strokeStyle = '#0e1017';
  for (let i = 6; i < 26; i += 5) {
    ctx.beginPath(); ctx.moveTo(4, i); ctx.lineTo(36, i); ctx.stroke();
  }
  ctx.restore();
}

function drawExit(ctx, game) {
  const armed = game.loot.taken;
  const { x, y } = game.exit;
  const pulse = armed ? 0.5 + 0.5 * Math.sin(game.clock * 5) : 0;
  const g = ctx.createRadialGradient(x, y, 4, x, y, 56);
  g.addColorStop(0, armed ? `rgba(105,217,126,${0.5 + pulse * 0.3})` : 'rgba(105,217,126,0.10)');
  g.addColorStop(1, 'rgba(105,217,126,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 56, y - 56, 112, 112);
  ctx.strokeStyle = armed ? PAL.green : 'rgba(105,217,126,0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 26, y - 20, 52, 40);
  ctx.fillStyle = armed ? PAL.green : PAL.ivoryDim;
  ctx.font = '600 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(armed ? 'GETAWAY' : 'SEALED', x, y + 4);
  ctx.textAlign = 'left';
}

function drawLoot(ctx, game) {
  if (game.loot.taken) return;
  const { x, y } = game.loot;
  const pulse = 0.6 + 0.4 * Math.sin(game.clock * 2.4);
  // pedestal
  ctx.fillStyle = '#20242f';
  ctx.fillRect(x - 22, y - 4, 44, 26);
  ctx.strokeStyle = PAL.goldDim;
  ctx.strokeRect(x - 22, y - 4, 44, 26);
  ctx.fillStyle = '#262b38';
  ctx.fillRect(x - 16, y - 14, 32, 10);
  // the Celestial Sapphire
  const g = ctx.createRadialGradient(x, y - 24, 2, x, y - 24, 46);
  g.addColorStop(0, `rgba(143,220,255,${0.55 * pulse + 0.2})`);
  g.addColorStop(1, 'rgba(143,220,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 46, y - 70, 92, 92);
  ctx.save();
  ctx.translate(x, y - 24);
  ctx.rotate(Math.sin(game.clock * 1.3) * 0.25);
  ctx.fillStyle = PAL.sapphire;
  ctx.beginPath();
  ctx.moveTo(0, -11); ctx.lineTo(8, 0); ctx.lineTo(0, 12); ctx.lineTo(-8, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#e8f7ff';
  ctx.stroke();
  ctx.restore();
}

function drawDoors(ctx, game) {
  for (const d of game.doors) {
    if (d.locked) {
      ctx.fillStyle = '#3a3320';
      ctx.fillRect(d.x, d.y, d.w, d.h);
      ctx.strokeStyle = PAL.gold;
      ctx.strokeRect(d.x + 1, d.y + 1, d.w - 2, d.h - 2);
      const cx = d.x + d.w / 2, cy = d.y + d.h / 2;
      ctx.fillStyle = PAL.gold;
      ctx.beginPath(); ctx.arc(cx, cy, 3.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx - 1.2, cy, 2.4, 6);
    } else {
      ctx.fillStyle = 'rgba(58,51,32,0.35)';
      ctx.fillRect(d.x, d.y, d.w, d.h);
    }
  }
}

function drawPlinths(ctx, game) {
  for (const p of game.plinths) {
    ctx.fillStyle = '#232837';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = 'rgba(212,168,67,0.5)';
    ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
    ctx.fillStyle = '#2c3242';
    ctx.fillRect(p.x + 5, p.y - 8, p.w - 10, 8);
    const cx = p.x + p.w / 2;
    if (p.kind === 'pillar') {
      ctx.fillStyle = '#313848';
      ctx.fillRect(cx - 8, p.y - 34, 16, 26);
      ctx.fillRect(cx - 11, p.y - 40, 22, 7);
    } else {
      ctx.fillStyle = '#3a4152';
      ctx.beginPath();
      ctx.ellipse(cx, p.y - 16, 9, p.kind === 'vase' ? 15 : 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a5468';
      ctx.fillRect(cx - 3, p.y - 30, 6, 6);
    }
  }
}

function drawWalls(ctx, game) {
  for (const w of game.walls) {
    ctx.fillStyle = PAL.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = PAL.wallEdge;
    ctx.fillRect(w.x, w.y, w.w, 2);
    ctx.fillStyle = PAL.wallDark;
    ctx.fillRect(w.x, w.y + w.h - 3, w.w, 3);
  }
}

function conePath(ctx, x, y, ang, half, range) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, ang - half, ang + half);
  ctx.closePath();
}

function drawGuardCone(ctx, g, game) {
  const color = g.coneColor();
  const range = T.guardRange * (g.state === 'alert' ? 1.06 : 1);
  const grad = ctx.createRadialGradient(g.x, g.y, 12, g.x, g.y, range);
  grad.addColorStop(0, `rgba(${PAL[color]},0.34)`);
  grad.addColorStop(1, `rgba(${PAL[color]},0)`);
  ctx.fillStyle = grad;
  conePath(ctx, g.x, g.y, g.facing, g.halfAngle(), range);
  ctx.fill();
  ctx.strokeStyle = `rgba(${PAL[color]},0.55)`;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  if (g.flash > 0) {
    ctx.fillStyle = `rgba(${PAL[color]},${g.flash * 0.35})`;
    conePath(ctx, g.x, g.y, g.facing, g.halfAngle(), range);
    ctx.fill();
  }
}

function drawGuard(ctx, g) {
  ctx.save();
  ctx.translate(g.x, g.y);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(2, 6, 12, 6, 0, 0, Math.PI * 2); ctx.fill();
  // greatcoat
  ctx.fillStyle = g.state === 'alert' ? '#7d2c36' : '#3d4356';
  ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2c3140';
  ctx.beginPath(); ctx.arc(0, 0, 12, g.facing - 1.1, g.facing + 1.1); ctx.closePath(); ctx.fill();
  // torch hand
  const hx = Math.cos(g.facing) * 14, hy = Math.sin(g.facing) * 14;
  ctx.fillStyle = PAL.gold;
  ctx.beginPath(); ctx.arc(hx, hy, 3.4, 0, Math.PI * 2); ctx.fill();
  // helmet
  ctx.fillStyle = '#20242f';
  ctx.beginPath(); ctx.arc(0, 0, 7.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PAL.goldDim;
  ctx.stroke();
  ctx.restore();
  // state icon
  if (g.icon) {
    ctx.font = 'bold 20px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = g.state === 'alert' ? PAL.red : '#ffcf7d';
    ctx.fillText(g.icon === 2 ? '!' : '?', g.x, g.y - 22 + Math.sin(game.clock * 6) * 2);
    ctx.textAlign = 'left';
  }
}

function drawCameraCone(ctx, c, game) {
  const dead = c.disabled > 0;
  const a = c.angle(game.time ?? game.clock);
  const alpha = dead ? 0.05 : 0.22 + c.spotted * 0.3;
  const grad = ctx.createRadialGradient(c.x, c.y, 8, c.x, c.y, T.camRange);
  grad.addColorStop(0, `rgba(88,213,255,${alpha})`);
  grad.addColorStop(1, 'rgba(88,213,255,0)');
  ctx.fillStyle = grad;
  conePath(ctx, c.x, c.y, a, T.camHalf, T.camRange);
  ctx.fill();
  ctx.strokeStyle = `rgba(88,213,255,${dead ? 0.15 : 0.5})`;
  ctx.setLineDash(dead ? [4, 6] : []);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawCameraBox(ctx, c) {
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.angle(game.time ?? game.clock));
  ctx.fillStyle = c.disabled > 0 ? '#4a3d20' : '#2b3040';
  ctx.fillRect(-7, -6, 18, 12);
  ctx.strokeStyle = PAL.goldDim;
  ctx.strokeRect(-7, -6, 18, 12);
  ctx.fillStyle = c.disabled > 0 ? '#8a4030' : PAL.cyan;
  ctx.beginPath(); ctx.arc(11, 0, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  if (c.disabled > 0) {
    ctx.strokeStyle = 'rgba(255,120,60,0.8)';
    ctx.beginPath();
    ctx.moveTo(c.x - 5, c.y - 5); ctx.lineTo(c.x + 6, c.y + 4);
    ctx.moveTo(c.x + 5, c.y - 6); ctx.lineTo(c.x - 4, c.y + 5);
    ctx.stroke();
  }
}

function drawDecoy(ctx, d) {
  ctx.fillStyle = '#e8c25a';
  ctx.beginPath(); ctx.arc(d.x, d.y, 5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8a6a20';
  ctx.stroke();
  if (!d.landed) {
    ctx.strokeStyle = 'rgba(232,194,90,0.5)';
    ctx.beginPath(); ctx.arc(d.x, d.y, 8 + Math.sin(d.t * 9) * 3, 0, Math.PI * 2); ctx.stroke();
  }
}

function drawSmoke(ctx, s) {
  const fade = clamp(s.ttl / 1.2, 0, 1);
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * 2 * (i / 7) + s.r;
    const rr = s.r * (0.55 + 0.2 * ((i % 3) / 2));
    const x = s.x + Math.cos(a) * s.r * 0.35;
    const y = s.y + Math.sin(a) * s.r * 0.35;
    const g = ctx.createRadialGradient(x, y, 2, x, y, rr);
    g.addColorStop(0, `${PAL.smoke}${0.5 * fade})`);
    g.addColorStop(1, `${PAL.smoke}0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
  }
}

function drawPlayer(ctx, game) {
  const p = game.player;
  for (const t of p.trail) {
    ctx.fillStyle = `rgba(242,234,216,${t.a * 0.14})`;
    ctx.beginPath(); ctx.arc(t.x, t.y, 7, 0, Math.PI * 2); ctx.fill();
  }
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.ellipse(2, 7, 11, 5, 0, 0, Math.PI * 2); ctx.fill();
  // catsuit
  ctx.fillStyle = p.sneak ? '#c9bfa4' : PAL.ivory;
  ctx.beginPath(); ctx.arc(0, 0, 10.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(10,12,18,0.8)';
  ctx.stroke();
  // black beret, tilted to the facing
  const bx = Math.cos(p.facing) * 4, by = Math.sin(p.facing) * 4;
  ctx.fillStyle = '#10131c';
  ctx.beginPath(); ctx.arc(bx, by, 6.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PAL.gold;
  ctx.beginPath(); ctx.arc(bx, by - 4.6, 1.6, 0, Math.PI * 2); ctx.fill();
  if (p.carrying) {
    const g = ctx.createRadialGradient(0, -14, 1, 0, -14, 26);
    g.addColorStop(0, 'rgba(143,220,255,0.8)');
    g.addColorStop(1, 'rgba(143,220,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-26, -40, 52, 52);
    ctx.fillStyle = PAL.sapphire;
    ctx.beginPath(); ctx.arc(0, -16, 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // lockpicking progress
  if (p.picking) {
    const t = clamp(p.picking.t / T.pickTime, 0, 1);
    ctx.strokeStyle = PAL.gold;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y - 22, 12, -Math.PI / 2, -Math.PI / 2 + t * Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
  }
}

function drawGrainAndVignette(ctx, game) {
  ctx.save();
  ctx.globalAlpha = 0.5;
  const ox = (game.clock * 61) % 160, oy = (game.clock * 47) % 160;
  for (let x = -ox; x < W; x += 160) {
    for (let y = -oy; y < H; y += 160) ctx.drawImage(grainCanvas, x, y);
  }
  ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 0.86);
  v.addColorStop(0, 'rgba(4,6,11,0)');
  v.addColorStop(1, 'rgba(4,6,11,0.5)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}
