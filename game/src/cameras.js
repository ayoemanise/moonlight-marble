// The cameras: brass boxes bolted to the walls, sweeping a cyan cone. Hold
// the Magpie in the beam and the alarm climbs on its own. An EMP tick blanks
// one for a few seconds, leaving only a spark.

import { TUNING as T } from './config.js';
import { dist, angleTo, losBlocked } from './geom.js';

export class CameraRig {
  constructor(def) {
    this.x = def.x;
    this.y = def.y;
    this.base = def.base;
    this.sweep = def.sweep;
    this.speed = def.speed;
    this.phase = Math.random() * Math.PI * 2;
    this.disabled = 0;
    this.spotted = 0;   // seen-you glow, for the render
  }

  angle(t) { return this.base + Math.sin(t * this.speed + this.phase) * this.sweep; }

  sees(player, world, t) {
    if (this.disabled > 0) return false;
    const d = dist(this.x, this.y, player.x, player.y);
    if (d > T.camRange) return false;
    if (player.visibility(world) <= 0.05) return false;
    const a = angleTo(this.x, this.y, player.x, player.y);
    let off = Math.abs(a - this.angle(world.time));
    while (off > Math.PI) off = Math.PI * 2 - off;
    if (off > T.camHalf) return false;
    if (losBlocked(this.x, this.y, player.x, player.y, world.solids)) return false;
    if (world.smokeBetween(this.x, this.y, player.x, player.y)) return false;
    return true;
  }

  update(dt, player, world) {
    if (this.disabled > 0) this.disabled -= dt;
    const seen = this.sees(player, world);
    this.spotted = seen ? Math.min(1, this.spotted + dt * 4) : Math.max(0, this.spotted - dt * 3);
    if (seen) {
      const boost = world.heistMode ? 1.35 : 1;
      world.alarm.add(dt * T.camAlarm * boost);
    }
  }
}
