// The alarm meter: the museum's nerves. Every second a warden or a camera
// holds the Magpie in its eye, the needle climbs; unseen, it breathes back
// down. At full it is lockdown — the night ends with the handcuffs.

import { TUNING as T } from './config.js';
import { sfx } from './audio.js';

export class Alarm {
  constructor() {
    this.value = 0;
    this.tickClock = 0;
    this.lockedDown = false;
  }

  add(amount) {
    if (this.lockedDown) return;
    const before = this.value;
    this.value = Math.min(T.alarmLockdown, this.value + amount);
    if (before < 40 && this.value >= 40) sfx.alarmTick();
    if (before < 70 && this.value >= 70) sfx.alarmTick();
    this.tickClock += amount;
    if (this.tickClock > 8) { this.tickClock = 0; sfx.alarmTick(); }
  }

  breathe(dt) {
    if (this.lockedDown) return;
    this.value = Math.max(0, this.value - T.alarmDecay * dt);
  }

  tripLockdown() {
    this.value = T.alarmLockdown;
    this.lockedDown = true;
    sfx.lockdown();
  }
}
