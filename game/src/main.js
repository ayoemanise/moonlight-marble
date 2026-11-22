// Bootstrap: a 1280×720 logical canvas, the input, the game, and the loop
// that steps the night forward. No build step, no engine, no network —
// just ES modules a desktop Chrome loads from a static server.

import { W, H } from './config.js';
import { Input } from './input.js';
import { Game } from './game.js';
import { drawGame } from './render.js';
import { drawHud } from './hud.js';
import { unlockAudio } from './audio.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

function fitCanvas() {
  const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  canvas.style.width = Math.floor(W * scale) + 'px';
  canvas.style.height = Math.floor(H * scale) + 'px';
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

const input = new Input(canvas);
const game = new Game(input);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.update(dt);
  drawGame(ctx, game);
  drawHud(ctx, game);
  if (status) status.textContent = game.state === 'playing'
    ? `${game.def.name}: ${game.objectiveText()} alarm ${Math.round(game.alarm.value)} of 100`
    : '';
  input.endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.addEventListener('keydown', unlockAudio, { once: true });
window.addEventListener('mousedown', unlockAudio, { once: true });
