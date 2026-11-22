// The brass strip and the overlays: the alarm dial, the tool belt, the
// objective line, the level plaque, and every curtain the night drops —
// title, busted, getaway, the perfect crime.

import { W, H, HUD_H, PAL, TUNING as T, TOOLS } from './config.js';

const KEY_LABEL = { q: 'Q', e: 'E', s: 'S' };

export function drawHud(ctx, game) {
  drawBrassStrip(ctx, game);
  drawAlarmDial(ctx, game);
  drawToolBelt(ctx, game);
  drawObjective(ctx, game);
  drawHints(ctx, game);
  if (game.state === 'title') drawTitle(ctx, game);
  if (game.state === 'busted') drawBusted(ctx, game);
  if (game.state === 'getaway') drawGetaway(ctx, game);
  if (game.state === 'won') drawWon(ctx, game);
}

function drawBrassStrip(ctx, game) {
  ctx.fillStyle = '#10131c';
  ctx.fillRect(0, 0, W, HUD_H);
  ctx.fillStyle = PAL.gold;
  ctx.fillRect(0, HUD_H - 2, W, 2);
  ctx.fillStyle = 'rgba(212,168,67,0.25)';
  ctx.fillRect(0, HUD_H - 5, W, 1);
  // plaque: numeral + room name
  ctx.fillStyle = PAL.gold;
  ctx.font = 'bold 26px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(game.def.numeral, 24, 40);
  ctx.fillStyle = PAL.ivory;
  ctx.font = '600 17px Georgia, serif';
  ctx.fillText('· ' + game.def.name.toUpperCase(), 56, 40);
  // timer
  const t = Math.floor(game.time);
  const mm = String(Math.floor(t / 60)).padStart(2, '0');
  const ss = String(t % 60).padStart(2, '0');
  ctx.fillStyle = PAL.ivoryDim;
  ctx.font = '500 15px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(mm + ':' + ss, W - 24, 40);
  ctx.textAlign = 'left';
}

function drawAlarmDial(ctx, game) {
  const cx = W - 210, cy = HUD_H / 2, r = 20;
  const v = game.alarm.value / T.alarmLockdown;
  ctx.fillStyle = '#0b0d13';
  ctx.beginPath(); ctx.arc(cx, cy, r + 6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PAL.goldDim;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r + 6, 0, Math.PI * 2); ctx.stroke();
  // danger arc, from the left around to the needle
  const from = Math.PI * 0.75, to = Math.PI * 2.25;
  const needle = from + (to - from) * v;
  ctx.strokeStyle = v > 0.7 ? PAL.red : v > 0.4 ? '#ff9d45' : PAL.gold;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, r - 2, from, needle); ctx.stroke();
  // needle
  ctx.strokeStyle = PAL.ivory;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(needle) * r, cy + Math.sin(needle) * r);
  ctx.stroke();
  ctx.fillStyle = PAL.ivoryDim;
  ctx.font = '600 10px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('ALARM', cx, cy + 4);
  ctx.fillText(String(Math.round(game.alarm.value)), cx, cy + r - 2);
  ctx.textAlign = 'left';
}

function drawToolBelt(ctx, game) {
  const belt = game.player.belt;
  let x = W - 150;
  ctx.font = '600 13px Georgia, serif';
  for (const tool of TOOLS) {
    const n = belt[tool.key];
    const has = n > 0;
    ctx.fillStyle = has ? PAL.gold : 'rgba(212,168,67,0.3)';
    ctx.beginPath(); ctx.arc(x + 12, HUD_H / 2, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = has ? '#10131c' : 'rgba(16,19,28,0.8)';
    ctx.textAlign = 'center';
    ctx.fillText(KEY_LABEL[tool.key], x + 12, HUD_H / 2 + 5);
    ctx.fillStyle = has ? PAL.ivory : 'rgba(242,234,216,0.3)';
    ctx.font = 'bold 14px Georgia, serif';
    ctx.fillText(String(n), x + 12, HUD_H / 2 - 12);
    ctx.font = '600 13px Georgia, serif';
    ctx.textAlign = 'left';
    x += 44;
  }
}

function drawObjective(ctx, game) {
  const carrying = game.player.carrying;
  ctx.textAlign = 'center';
  ctx.fillStyle = carrying ? PAL.sapphire : PAL.ivoryDim;
  ctx.font = 'italic 500 15px Georgia, serif';
  ctx.fillText(game.objectiveText(), W / 2, 27);
  if (carrying) {
    ctx.fillStyle = PAL.sapphire;
    ctx.font = '600 13px Georgia, serif';
    ctx.fillText('\u2726 the Celestial Sapphire rides in your pocket', W / 2, 47);
  } else {
    ctx.fillStyle = PAL.goldDim;
    ctx.font = '500 12px Georgia, serif';
    ctx.fillText('click the glowing pedestal to lift it', W / 2, 47);
  }
  ctx.textAlign = 'left';
}

function drawHints(ctx, game) {
  if (game.state !== 'playing' || game.hintT <= 0) return;
  const a = Math.min(1, game.hintT / 2);
  ctx.fillStyle = `rgba(242,234,216,${0.75 * a})`;
  ctx.font = '500 13px Georgia, serif';
  ctx.fillText('WASD move · SHIFT sneak · Q throw decoy (aim with mouse) · E kill a camera · S smoke · F pick a lock · CLICK grab, vent, escape', 24, H - 18);
}

function decoFrame(ctx, inset) {
  ctx.strokeStyle = PAL.gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
  ctx.lineWidth = 1;
  ctx.strokeRect(inset + 7, inset + 7, W - (inset + 7) * 2, H - (inset + 7) * 2);
  // deco corner sunbursts
  for (const [cx, cy] of [[inset, inset], [W - inset, inset], [inset, H - inset], [W - inset, H - inset]]) {
    ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.stroke();
  }
}

function curtain(ctx, alpha) {
  ctx.fillStyle = `rgba(7,9,14,${alpha})`;
  ctx.fillRect(0, 0, W, H);
}

function drawTitle(ctx, game) {
  curtain(ctx, 0.82);
  decoFrame(ctx, 26);
  // crescent moon
  ctx.fillStyle = 'rgba(232,194,90,0.9)';
  ctx.beginPath(); ctx.arc(W / 2, 150, 44, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0b0d13';
  ctx.beginPath(); ctx.arc(W / 2 - 18, 142, 38, 0, Math.PI * 2); ctx.fill();
  ctx.textAlign = 'center';
  ctx.fillStyle = PAL.gold;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('MOONLIGHT & MARBLE', W / 2, 268);
  ctx.fillStyle = PAL.ivory;
  ctx.font = 'italic 500 22px Georgia, serif';
  ctx.fillText('one night, one sapphire, three rooms of the Marlowe Museum', W / 2, 312);
  ctx.fillStyle = PAL.ivoryDim;
  ctx.font = '500 16px Georgia, serif';
  const lines = [
    'You are the Magpie. Lift the Celestial Sapphire and vanish.',
    '',
    'WASD move · SHIFT sneak · Q decoy (aim with the mouse) · E EMP a camera',
    'S smoke bomb · F hold to pick a lock · CLICK to grab, crawl vents, escape',
    '',
    'Watch the wardens\u2019 cones. Stay in the dark patches. Do not be seen.',
  ];
  lines.forEach((line, i) => ctx.fillText(line, W / 2, 372 + i * 26));
  const blink = Math.sin(game.clock * 3) > -0.2;
  if (blink) {
    ctx.fillStyle = PAL.gold;
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText('— press any key to slip inside —', W / 2, 620);
  }
  ctx.textAlign = 'left';
}

function drawBusted(ctx, game) {
  curtain(ctx, Math.min(0.78, game.overlayT));
  decoFrame(ctx, 26);
  ctx.textAlign = 'center';
  ctx.save();
  ctx.translate(W / 2, H / 2 - 60);
  ctx.rotate(-0.06);
  ctx.strokeStyle = PAL.red;
  ctx.lineWidth = 5;
  ctx.strokeRect(-190, -52, 380, 104);
  ctx.fillStyle = PAL.red;
  ctx.font = 'bold 74px Georgia, serif';
  ctx.fillText('BUSTED', 0, 22);
  ctx.restore();
  ctx.fillStyle = PAL.ivory;
  ctx.font = 'italic 500 20px Georgia, serif';
  ctx.fillText(game.bustReason, W / 2, H / 2 + 40);
  ctx.fillStyle = PAL.ivoryDim;
  ctx.font = '500 16px Georgia, serif';
  ctx.fillText('press any key to slip back in through the same door', W / 2, H / 2 + 84);
  ctx.textAlign = 'left';
}

function drawGetaway(ctx, game) {
  curtain(ctx, Math.min(0.7, game.overlayT * 1.4));
  decoFrame(ctx, 26);
  ctx.textAlign = 'center';
  ctx.fillStyle = PAL.green;
  ctx.font = 'bold 58px Georgia, serif';
  ctx.fillText('GETAWAY!', W / 2, H / 2 - 40);
  const t = Math.floor(game.time);
  ctx.fillStyle = PAL.ivory;
  ctx.font = 'italic 500 20px Georgia, serif';
  ctx.fillText(`the ${game.def.numeral} job took ${Math.floor(t / 60)}m ${t % 60}s`, W / 2, H / 2 + 16);
  ctx.fillStyle = PAL.ivoryDim;
  ctx.font = '500 16px Georgia, serif';
  const stealth = game.seenCount === 0 ? 'never seen — a ghost of a thief' : `seen ${game.seenCount} time${game.seenCount > 1 ? 's' : ''} on the way out`;
  ctx.fillText(stealth, W / 2, H / 2 + 52);
  ctx.textAlign = 'left';
}

function drawWon(ctx, game) {
  curtain(ctx, Math.min(0.85, game.overlayT));
  decoFrame(ctx, 26);
  ctx.textAlign = 'center';
  ctx.fillStyle = PAL.sapphire;
  ctx.beginPath();
  ctx.moveTo(W / 2, 168); ctx.lineTo(W / 2 + 26, 214); ctx.lineTo(W / 2, 258); ctx.lineTo(W / 2 - 26, 214);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#e8f7ff';
  ctx.stroke();
  ctx.fillStyle = PAL.gold;
  ctx.font = 'bold 54px Georgia, serif';
  ctx.fillText('THE PERFECT CRIME', W / 2, 330);
  ctx.fillStyle = PAL.ivory;
  ctx.font = 'italic 500 22px Georgia, serif';
  ctx.fillText('the Celestial Sapphire is gone, and so are you', W / 2, 380);
  const t = Math.floor(game.totalTime);
  ctx.fillStyle = PAL.ivoryDim;
  ctx.font = '500 18px Georgia, serif';
  ctx.fillText(`three rooms, ${Math.floor(t / 60)}m ${t % 60}s, seen ${game.totalSeen} time${game.totalSeen === 1 ? '' : 's'} — press any key for one more night`, W / 2, 432);
  ctx.textAlign = 'left';
}
