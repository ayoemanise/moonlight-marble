// Moonlight & Marble — shared palette and tuning.
// Every number the feel of the heist depends on lives here, so the night can
// be retuned in one place.

export const W = 1280;           // logical canvas width
export const H = 720;            // logical canvas height
export const HUD_H = 64;         // top deco strip
export const FLOOR_TOP = HUD_H;  // the room begins under the brass strip

// The palette: charcoal marble, moonlight, brass, one sapphire.
export const PAL = {
  bg: '#0b0d13',
  floorA: '#181b26',
  floorB: '#14171f',
  tileLine: 'rgba(120,132,160,0.10)',
  moonPool: 'rgba(122,150,214,0.075)',
  wall: '#2a2e3d',
  wallEdge: '#d4a843',
  wallDark: '#191c26',
  shadow: 'rgba(4,6,11,0.72)',
  gold: '#d4a843',
  goldDim: '#8a7434',
  ivory: '#f2ead8',
  ivoryDim: 'rgba(242,234,216,0.55)',
  sapphire: '#8fdcff',
  cyan: '#58d5ff',
  amber: '255,190,90',   // guard cone, calm  (rgb triplet for alphas)
  orange: '255,140,60',  // guard cone, suspicious
  red: '255,72,86',      // guard cone, alert
  green: '#69d97e',
  smoke: 'rgba(190,196,214,',
};

// How the heist plays.
export const TUNING = {
  walk: 172,            // px/s
  sneak: 96,            // px/s while SHIFT is held
  noiseWalk: 95,        // radius wardens can hear a walk
  noiseSneak: 42,       // radius while sneaking
  catchR: 26,           // warden touches the Magpie
  guardRange: 215,      // vision cone length
  guardHalfCalm: 0.44,  // cone half-angle, radians
  guardHalfSus: 0.55,
  guardHalfAlert: 0.62,
  guardSpeed: 74,
  guardChase: 132,
  guardRoverSpeed: 96,
  suspectAt: 0.42,      // suspicion meter to stop and stare
  alertAt: 1.0,         // suspicion meter to chase
  suspicionGain: 0.85,  // per second, scaled by visibility and closeness
  loseInterest: 3.6,    // seconds without sight to drop the chase
  camRange: 235,
  camHalf: 0.5,
  camAlarm: 13,         // alarm per second a camera holds you
  guardAlarm: 9,        // alarm per second a warden holds you
  alarmDecay: 4.5,
  alarmLockdown: 100,
  heistGuardBoost: 1.16,   // after the sapphire is taken
  heistAlarmBoost: 1.5,
  smokeR: 72,
  smokeTtl: 5.0,
  empR: 240,
  empTtl: 7.0,
  decoyRange: 265,
  decoyNoise: 165,
  pickTime: 1.6,        // seconds of F-hold to open a locked door
  pickNoise: 70,
  ventR: 34,
  lootR: 40,
  exitR: 46,
};

// Tool belt, in the order the HUD shows them.
export const TOOLS = [
  { key: 'q', name: 'Clatter Decoy', hint: 'aim with mouse, Q to throw' },
  { key: 'e', name: 'EMP Tick', hint: 'nearest camera blinks out' },
  { key: 's', name: 'Smoke Bomb', hint: 'a shroud at your feet' },
];
