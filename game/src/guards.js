// The wardens: patrol beats, sweeping vision cones, and the three moods —
// calm amber, suspicious orange, alert red. They hear noise, they chase
// what they see, and they give up when the night swallows you again.

import { TUNING as T } from './config.js';
import { dist, angleTo, turnToward, losBlocked, slidePoint, pointInRect } from './geom.js';
import { sfx } from './audio.js';

const STATE = { PATROL: 'patrol', SUSPECT: 'suspect', ALERT: 'alert', SEARCH: 'search' };

export class Guard {
  constructor(def, world) {
    this.path = def.path;
    this.speed = def.speed;
    this.rover = !!def.rover;
    this.wp = 0;
    this.x = def.path[0][0];
    this.y = def.path[0][1];
    this.facing = angleTo(this.x, this.y, def.path[1][0], def.path[1][1]);
    this.state = STATE.PATROL;
    this.suspicion = 0;
    this.lastSeen = null;
    this.lostFor = 0;
    this.wait = 0;
    this.pauseClock = 0;
    this.icon = 0;      // 0 none, 1 "?", 2 "!"
    this.flash = 0;
  }

  halfAngle() {
    return this.state === STATE.ALERT ? T.guardHalfAlert
      : this.state === STATE.SUSPECT ? T.guardHalfSus
      : T.guardHalfCalm;
  }

  coneColor() {
    return this.state === STATE.ALERT ? 'red'
      : this.state === STATE.SUSPECT ? 'orange'
      : 'amber';
  }

  // Does this warden see the Magpie right now? Returns visibility 0..1.
  sees(player, world) {
    const d = dist(this.x, this.y, player.x, player.y);
    if (d > T.guardRange) return 0;
    const vis = player.visibility(world);
    if (vis <= 0.05) return 0;
    const a = angleTo(this.x, this.y, player.x, player.y);
    let off = Math.abs(a - this.facing);
    while (off > Math.PI) off = Math.PI * 2 - off;
    if (off > this.halfAngle()) return 0;
    if (losBlocked(this.x, this.y, player.x, player.y, world.solids)) return 0;
    if (world.smokeBetween(this.x, this.y, player.x, player.y)) return 0;
    const closeness = 1.25 - d / T.guardRange;
    return vis * Math.max(0.15, closeness);
  }

  // A clatter or a footstep within reach pulls the warden's head.
  hear(x, y, radius, world) {
    if (this.state === STATE.ALERT) return;
    const d = dist(this.x, this.y, x, y);
    if (d > radius * 1.6) return;
    if (losBlocked(this.x, this.y, x, y, world.solids) && d > radius * 0.6) return;
    this.suspicion = Math.max(this.suspicion, 0.45);
    this.lastSeen = { x, y };
    if (this.state !== STATE.SUSPECT) sfx.suspect();
    this.state = STATE.SUSPECT;
    this.wait = 0;
    this.flash = 0.5;
  }

  chaseBoost() { return this.rover ? 1.25 : 1; }

  update(dt, player, world) {
    this.world = world;
    this.flash = Math.max(0, this.flash - dt);
    const seen = this.sees(player, world);
    const boost = world.heistMode ? T.heistGuardBoost : 1;

    if (seen > 0) {
      this.suspicion += dt * T.suspicionGain * (0.5 + seen) * boost;
      this.lastSeen = { x: player.x, y: player.y };
      this.lostFor = 0;
    } else {
      this.suspicion = Math.max(0, this.suspicion - dt * 0.3);
    }

    switch (this.state) {
      case STATE.PATROL: {
        if (this.suspicion >= T.suspectAt) { this.enterSuspect(); break; }
        if (this.suspicion >= T.alertAt) { this.enterAlert(); break; }
        this.walkBeat(dt, boost);
        break;
      }
      case STATE.SUSPECT: {
        this.wait += dt;
        if (this.lastSeen) this.facing = turnToward(this.facing, angleTo(this.x, this.y, this.lastSeen.x, this.lastSeen.y), dt * 2.2);
        if (this.suspicion >= T.alertAt) { this.enterAlert(); break; }
        if (this.wait > 1.6) {
          // creep toward the thing that caught the eye
          if (this.lastSeen) this.stepToward(this.lastSeen.x, this.lastSeen.y, dt, this.speed * 0.55 * boost, world);
          if (this.wait > 4.2 && this.suspicion < T.suspectAt) { this.state = STATE.PATROL; this.icon = 0; }
        }
        break;
      }
      case STATE.ALERT: {
        this.icon = 2;
        if (seen > 0) {
          this.lostFor = 0;
          this.stepToward(player.x, player.y, dt, T.guardChase * this.chaseBoost() * boost, world);

          if (dist(this.x, this.y, player.x, player.y) < T.catchR) world.game.busted('The warden\u2019s hand closed on your shoulder.');
        } else {
          this.lostFor += dt;
          if (this.lastSeen) this.stepToward(this.lastSeen.x, this.lastSeen.y, dt, T.guardChase * 0.8 * boost, world);
          if (this.lostFor > T.loseInterest) {
            this.state = STATE.SEARCH;
            this.wait = 0;
            this.icon = 1;
          }
        }
        break;
      }
      case STATE.SEARCH: {
        this.wait += dt;
        this.facing += dt * 1.8 * (Math.sin(this.wait * 2.4) > 0 ? 1 : -1);
        if (this.suspicion >= T.alertAt) { this.enterAlert(); break; }
        if (this.wait > 3.2) { this.state = STATE.PATROL; this.icon = 0; }
        break;
      }
    }
  }

  enterSuspect() {
    if (this.state !== STATE.SUSPECT) { sfx.suspect(); this.flash = 0.5; }
    this.state = STATE.SUSPECT;
    this.wait = 0;
    this.icon = 1;
  }

  enterAlert() {
    if (this.state !== STATE.ALERT) { sfx.alert(); this.flash = 1; }
    this.state = STATE.ALERT;
    this.icon = 2;
    this.lostFor = 0;
  }

  walkBeat(dt, boost) {
    const [tx, ty] = this.path[this.wp];
    const d = dist(this.x, this.y, tx, ty);
    if (d < 8) {
      this.pauseClock += dt;
      if (this.pauseClock > 0.7) {
        this.pauseClock = 0;
        this.wp = (this.wp + 1) % this.path.length;
      }
      return;
    }
    this.stepToward(tx, ty, dt, this.speed * boost, this.world);
  }

  stepToward(tx, ty, dt, speed, world) {
    const a = angleTo(this.x, this.y, tx, ty);
    this.facing = turnToward(this.facing, a, dt * 4.5);
    const mx = Math.cos(this.facing) * speed * dt;
    const my = Math.sin(this.facing) * speed * dt;
    [this.x, this.y] = slidePoint(this.x, this.y, mx, my, world.solids);
  }
}

// The chase cry is sounded in enterAlert; the world stays with the guard
// from its first update, so its beat-walk can find the walls.
