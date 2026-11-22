// The Magpie: the thief the player steers. Movement, quiet and loud, the
// dark patches that hide them, and the three tricks of the trade — the
// clatter decoy thrown where the mouse points, the EMP tick that blacks out
// the nearest camera, the smoke bomb that shrouds the feet.

import { TUNING as T } from './config.js';
import { slidePoint, dist, clamp } from './geom.js';
import { sfx } from './audio.js';

export class Player {
  constructor() {
    this.reset(90, 130);
  }

  reset(x, y) {
    this.x = x; this.y = y;
    this.sneak = false;
    this.facing = 0;
    this.stepClock = 0;
    this.carrying = false;      // has the sapphire been lifted?
    this.belt = { decoy: 0, emp: 0, smoke: 0 };
    this.ventCool = 0;
    this.picking = null;        // {door, t} while F is held on a locked door
    this.trail = [];
  }

  giveTools(counts) { this.belt = { ...counts }; }

  // How visible the Magpie is to a watcher at (wx, wy): 0 invisible to 1
  // fully lit. Dark patches and sneaking both dim them.
  visibility(world) {
    const hidden = world.inShadow(this.x, this.y) ? 0.28 : 1;
    return hidden * (this.sneak ? 0.82 : 1);
  }

  noiseRadius() { return this.sneak ? T.noiseSneak : T.noiseWalk; }

  useTool(kind, world, mouse) {
    if (this.belt[kind] <= 0) return false;
    if (kind === 'decoy') {
      const ang = Math.atan2(mouse.y - this.y, mouse.x - this.x);
      const range = Math.min(T.decoyRange, dist(this.x, this.y, mouse.x, mouse.y));
      world.decoys.push({
        x: this.x, y: this.y,
        sx: this.x, sy: this.y,
        tx: this.x + Math.cos(ang) * range,
        ty: this.y + Math.sin(ang) * range,
        t: 0, landed: false,
      });
      this.belt.decoy--;
      sfx.throwCoin();
      return true;
    }
    if (kind === 'emp') {
      let best = null, bd = T.empR;
      for (const cam of world.cameras) {
        if (cam.disabled > 0) continue;
        const d = dist(this.x, this.y, cam.x, cam.y);
        if (d < bd) { bd = d; best = cam; }
      }
      if (!best) return false;
      best.disabled = T.empTtl;
      this.belt.emp--;
      sfx.emp();
      return true;
    }
    if (kind === 'smoke') {
      world.smokes.push({ x: this.x, y: this.y, r: 12, ttl: T.smokeTtl });
      this.belt.smoke--;
      sfx.smoke();
      return true;
    }
    return false;
  }

  update(dt, world, input) {
    this.sneak = input.down('shift');
    let dx = 0, dy = 0;
    if (input.down('w', 'arrowup')) dy -= 1;
    if (input.down('s', 'arrowdown')) dy += 1;
    if (input.down('a', 'arrowleft')) dx -= 1;
    if (input.down('d', 'arrowright')) dx += 1;
    const speed = (this.sneak ? T.sneak : T.walk) * (this.carrying ? 0.94 : 1);
    if (dx || dy) {
      const len = Math.hypot(dx, dy) || 1;
      const mx = (dx / len) * speed * dt;
      const my = (dy / len) * speed * dt;
      [this.x, this.y] = slidePoint(this.x, this.y, mx, my, world.solids);
      this.facing = Math.atan2(dy, dx);
      this.stepClock += dt * (this.sneak ? 2.4 : 3.6);
      if (this.stepClock >= 1) {
        this.stepClock = 0;
        sfx.step(this.sneak);
        world.noise(this.x, this.y, this.noiseRadius());
      }
    }
    this.ventCool = Math.max(0, this.ventCool - dt);
    this.trail.unshift({ x: this.x, y: this.y, a: 0.5 });
    if (this.trail.length > 10) this.trail.pop();
    for (const p of this.trail) p.a *= 0.86;
  }
}
