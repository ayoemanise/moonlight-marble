// The heist itself: one room at a time, the state machine around it, and
// the rules of the night — grab the sapphire, stay out of every cone, reach
// the getaway. Title, busted, getaway and the perfect-crime curtain all
// live here.

import { TUNING as T } from './config.js';
import { LEVELS } from './levels.js';
import { Guard } from './guards.js';
import { CameraRig } from './cameras.js';
import { Alarm } from './alarm.js';
import { Player } from './player.js';
import { dist, pointInRect, inShadow, smokeBlocks } from './geom.js';
import { sfx, unlockAudio } from './audio.js';

export class Game {
  constructor(input) {
    this.input = input;
    this.state = 'title';
    this.levelIndex = 0;
    this.totalSeen = 0;
    this.totalTime = 0;
    this.shotParam = new URLSearchParams(location.search).get('shot');
    this.clock = 0;
    this.overlayT = 0;
    if (this.shotParam) this.applyShot(this.shotParam);
  }

  loadLevel(i) {
    const def = LEVELS[i];
    this.levelIndex = i;
    this.def = def;
    this.walls = def.walls.map((w) => ({ ...w }));
    this.plinths = def.plinths.map((p) => ({ ...p }));
    this.doors = def.doors.map((d) => ({ ...d }));
    this.shadows = def.shadows.map((s) => ({ ...s }));
    this.vents = def.vents.map((v) => ({ a: { ...v.a }, b: { ...v.b } }));
    this.alarm = new Alarm();
    this.time = 0;
    this.heistMode = false;
    this.seenCount = 0;
    this.smokes = [];
    this.decoys = [];
    this.hintT = 9;
    this.player = new Player();
    this.player.reset(def.start.x, def.start.y);
    this.player.giveTools(def.tools);
    this.guards = def.guards.map((g) => new Guard(g, this));
    this.cameras = def.cameras.map((c) => new CameraRig(c));
    this.loot = { ...def.loot, taken: false };
    this.exit = { ...def.exit };
    this.rebuildSolids();
    this.state = 'playing';
    this.overlayT = 0;
  }

  rebuildSolids() {
    this.solids = [...this.walls, ...this.plinths, ...this.doors.filter((d) => d.locked)];
  }

  inShadow(x, y) { return inShadow(x, y, this.shadows); }
  smokeBetween(ax, ay, bx, by) { return smokeBlocks(ax, ay, bx, by, this.smokes); }

  noise(x, y, r) {
    for (const g of this.guards) g.hear(x, y, r, this);
  }

  busted(reason) {
    if (this.state !== 'playing') return;
    this.state = 'busted';
    this.bustReason = reason;
    this.overlayT = 0;
    sfx.busted();
  }

  getaway() {
    if (this.state !== 'playing') return;
    this.state = 'getaway';
    this.overlayT = 0;
    this.totalTime += this.time;
    sfx.getaway();
  }

  // Everything the player can reach out and do, on click or on a held key.
  handleInteractions(dt) {
    const p = this.player;
    const input = this.input;

    // tools on their keys
    for (const [key, kind] of [['q', 'decoy'], ['e', 'emp'], ['s', 'smoke']]) {
      if (input.readPress(key)) p.useTool(kind, this, input.mouse);
    }

    // holding F beside a locked door picks it
    if (input.down('f')) {
      const door = this.nearestLockedDoor();
      if (door) {
        if (!p.picking || p.picking.door !== door) p.picking = { door, t: 0 };
        p.picking.t += dt;
        if (p.picking.t % 0.18 < dt) sfx.picking();
        if (p.picking.t >= T.pickTime) {
          door.locked = false;
          p.picking = null;
          this.rebuildSolids();
          sfx.unlock();
          this.noise(door.x, door.y, T.pickNoise);
        }
      } else p.picking = null;
    } else p.picking = null;

    const click = input.readClick();
    if (!click) return;
    unlockAudio();

    if (!p.carrying && dist(p.x, p.y, this.loot.x, this.loot.y) < T.lootR) {
      p.carrying = true;
      this.loot.taken = true;
      this.heistMode = true;
      this.grabTime = this.time;
      sfx.pickup();
      return;
    }
    if (p.ventCool <= 0) {
      for (const v of this.vents) {
        for (const end of [v.a, v.b]) {
          if (dist(p.x, p.y, end.x, end.y) < T.ventR) {
            const other = end === v.a ? v.b : v.a;
            p.x = other.x; p.y = other.y;
            p.ventCool = 0.9;
            p.trail.length = 0;
            sfx.vent();
            return;
          }
        }
      }
    }
    if (p.carrying && dist(p.x, p.y, this.exit.x, this.exit.y) < T.exitR) this.getaway();
  }

  nearestLockedDoor() {
    let best = null, bd = 52;
    for (const d of this.doors) {
      if (!d.locked) continue;
      const dd = dist(this.player.x, this.player.y, d.x + d.w / 2, d.y + d.h / 2);
      if (dd < bd) { bd = dd; best = d; }
    }
    return best;
  }

  update(dt) {
    this.clock += dt;
    this.overlayT += dt;
    this.hintT = Math.max(0, (this.hintT ?? 0) - dt);
    const input = this.input;
    unlockAudio();

    if (this.state === 'title') {
      if (input.pressed.size || input.readClick()) this.loadLevel(0);
      return;
    }
    if (this.state === 'busted') {
      if (this.overlayT > 1 && (input.pressed.size || input.readClick())) this.loadLevel(this.levelIndex);
      return;
    }
    if (this.state === 'getaway') {
      if (this.overlayT > 2.6) {
        if (this.levelIndex + 1 < LEVELS.length) this.loadLevel(this.levelIndex + 1);
        else { this.state = 'won'; this.overlayT = 0; sfx.fanfare(); }
      }
      return;
    }
    if (this.state === 'won') {
      if (this.overlayT > 2 && (input.pressed.size || input.readClick())) { this.totalSeen = 0; this.totalTime = 0; this.loadLevel(0); }
      return;
    }

    // playing
    this.time += dt;
    this.player.update(dt, this, input);
    this.handleInteractions(dt);

    for (const g of this.guards) {
      const wasCalm = g.state !== 'alert';
      g.update(dt, this.player, this);
      if (wasCalm && g.state === 'alert') this.seenCount++;
    }
    for (const c of this.cameras) c.update(dt, this.player, this);

    // decoys fly, land, and rattle
    for (const d of this.decoys) {
      if (!d.landed) {
        d.t += dt / 0.45;
        if (d.t >= 1) {
          d.t = 1; d.landed = true; d.rest = 4;
          d.x = d.tx; d.y = d.ty;
          sfx.clatter();
          this.noise(d.x, d.y, T.decoyNoise);
        } else {
          d.x = d.sx + (d.tx - d.sx) * d.t;
          d.y = d.sy + (d.ty - d.sy) * d.t;
        }
      } else d.rest -= dt;
    }
    this.decoys = this.decoys.filter((d) => !d.landed || d.rest > 0);

    // smoke billows and thins
    for (const s of this.smokes) {
      s.ttl -= dt;
      s.r = Math.min(T.smokeR, s.r + dt * 160);
    }
    this.smokes = this.smokes.filter((s) => s.ttl > 0);

    // alarm: climb while held in an eye, breathe when dark
    if (!this.alarm.lockedDown) {
      const watched = this.guards.some((g) => g.sees(this.player, this) > 0);
      if (watched) this.alarm.add(dt * T.guardAlarm * (this.heistMode ? T.heistAlarmBoost : 1));
      else this.alarm.breathe(dt);
      if (this.alarm.value >= T.alarmLockdown) this.busted('The alarm hit lockdown and the brass doors came down.');
    }

    // the exit only opens for a thief with the sapphire
    if (this.player.carrying && dist(this.player.x, this.player.y, this.exit.x, this.exit.y) < T.exitR) this.getaway();
    if (this.player.carrying) this.totalSeen = Math.max(this.totalSeen, this.seenCount);
  }

  objectiveText() {
    if (!this.loot.taken) return this.def.intro;
    return 'Get to the ' + this.exit.label + '.';
  }

  // Where a ?shot= URL asks the night to stand still (see shots.js).
  applyShot(name) {
    import('./shots.js').then((m) => m.setupShot(this, name));
  }
}
