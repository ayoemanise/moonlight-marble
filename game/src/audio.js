// Everything the night sounds like, synthesized on the spot: no files, no
// samples, only oscillators and shaped noise. The AudioContext wakes on the
// first key or click, as browsers require.

let ctx = null;
let master = null;

function wake() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.4;
  master.connect(ctx.destination);
}

export function unlockAudio() { wake(); if (ctx && ctx.state === 'suspended') ctx.resume(); }

function env(gainNode, t0, peak, attack, decay) {
  gainNode.gain.setValueAtTime(0.0001, t0);
  gainNode.gain.linearRampToValueAtTime(peak, t0 + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
}

function tone(freq, { type = 'sine', peak = 0.2, attack = 0.01, decay = 0.2, slide = 0 } = {}) {
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + attack + decay);
  env(g, t0, peak, attack, decay);
  o.connect(g).connect(master);
  o.start(t0);
  o.stop(t0 + attack + decay + 0.05);
}

function hiss({ peak = 0.15, decay = 0.3, highpass = 800 } = {}) {
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const len = Math.ceil(ctx.sampleRate * (decay + 0.1));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = highpass;
  const g = ctx.createGain();
  env(g, t0, peak, 0.008, decay);
  src.connect(f).connect(g).connect(master);
  src.start(t0);
}

export const sfx = {
  step(sneak) { tone(sneak ? 68 : 84, { type: 'triangle', peak: sneak ? 0.03 : 0.06, attack: 0.004, decay: 0.07 }); },
  clatter() { for (let i = 0; i < 5; i++) setTimeout(() => hiss({ peak: 0.2, decay: 0.08, highpass: 2400 }), i * 55); tone(1200, { type: 'square', peak: 0.06, decay: 0.05 }); },
  throwCoin() { hiss({ peak: 0.06, decay: 0.12, highpass: 3000 }); },
  suspect() { tone(520, { type: 'sine', peak: 0.08, attack: 0.02, decay: 0.25, slide: 160 }); },
  alert() { tone(300, { type: 'sawtooth', peak: 0.16, attack: 0.01, decay: 0.35, slide: -120 }); tone(452, { type: 'sawtooth', peak: 0.12, attack: 0.01, decay: 0.3, slide: -160 }); },
  alarmTick() { tone(660, { type: 'sine', peak: 0.05, decay: 0.1 }); },
  lockdown() { tone(140, { type: 'sawtooth', peak: 0.3, attack: 0.02, decay: 1.4, slide: -60 }); tone(211, { type: 'square', peak: 0.14, attack: 0.02, decay: 1.2 }); },
  pickup() { tone(880, { type: 'sine', peak: 0.14, decay: 0.25, slide: 300 }); tone(1320, { type: 'sine', peak: 0.1, attack: 0.05, decay: 0.4 }); },
  unlock() { for (let i = 0; i < 3; i++) setTimeout(() => tone(420 + i * 90, { type: 'triangle', peak: 0.08, decay: 0.08 }), i * 90); },
  picking() { hiss({ peak: 0.03, decay: 0.06, highpass: 3400 }); },
  emp() { tone(1400, { type: 'square', peak: 0.1, attack: 0.005, decay: 0.5, slide: -1100 }); hiss({ peak: 0.08, decay: 0.4, highpass: 1800 }); },
  smoke() { hiss({ peak: 0.18, decay: 0.7, highpass: 500 }); },
  vent() { tone(220, { type: 'triangle', peak: 0.1, attack: 0.02, decay: 0.3, slide: 90 }); hiss({ peak: 0.05, decay: 0.2, highpass: 900 }); },
  busted() { tone(196, { type: 'sawtooth', peak: 0.22, attack: 0.01, decay: 0.9, slide: -80 }); tone(98, { type: 'square', peak: 0.18, attack: 0.02, decay: 1.1 }); },
  getaway() { [392, 523, 659, 784].forEach((f, i) => setTimeout(() => tone(f, { type: 'triangle', peak: 0.12, decay: 0.3 }), i * 130)); },
  fanfare() { [523, 659, 784, 1046, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, { type: 'triangle', peak: 0.12, decay: 0.34 }), i * 160)); },
};
