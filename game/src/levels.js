// The three rooms of the Marlowe Museum, laid out by hand.
// Each level is one room crossed in a single frame: its walls, its dark
// patches, its plinths, the wardens' beats, the cameras' posts, the vents,
// the locked doors, the sapphire and the way out.

const BORDER = (top = 64, w = 1280, h = 720) => [
  { x: 0, y: top, w, h: 14 },            // north
  { x: 0, y: h - 14, w, h: 14 },         // south
  { x: 0, y: top, w: 14, h: h - top },   // west
  { x: w - 14, y: top, w: 14, h: h - top }, // east
];

export const LEVELS = [
  {
    numeral: 'I',
    name: 'The West Gallery',
    intro: 'Slip past the wardens. The Sapphire waits in the east wing.',
    walls: [
      ...BORDER(),
      { x: 416, y: 140, w: 14, h: 230 },
      { x: 416, y: 470, w: 14, h: 180 },
      { x: 836, y: 140, w: 14, h: 220 },
      { x: 836, y: 450, w: 14, h: 200 },
    ],
    doors: [
      { x: 836, y: 368, w: 14, h: 74, locked: true, label: 'Service Door' },
    ],
    plinths: [
      { x: 250, y: 330, w: 46, h: 46, kind: 'urn' },
      { x: 600, y: 170, w: 46, h: 46, kind: 'vase' },
      { x: 600, y: 490, w: 46, h: 46, kind: 'urn' },
      { x: 960, y: 230, w: 46, h: 46, kind: 'vase' },
    ],
    shadows: [
      { x: 60, y: 600, w: 160, h: 92 },
      { x: 190, y: 96, w: 180, h: 84 },
      { x: 900, y: 560, w: 210, h: 110 },
      { x: 648, y: 296, w: 120, h: 88 },
      { x: 1090, y: 180, w: 140, h: 96 },
      { x: 460, y: 620, w: 130, h: 80 },
    ],
    vents: [
      { a: { x: 74, y: 678 }, b: { x: 1206, y: 132 } },
    ],
    guards: [
      { path: [[520, 250], [770, 250], [770, 560], [520, 560]], speed: 74 },
      { path: [[120, 210], [120, 610], [370, 610]], speed: 70 },
    ],
    cameras: [
      { x: 850, y: 160, base: Math.PI * 0.75, sweep: 0.7, speed: 0.55 },
      { x: 1252, y: 640, base: -Math.PI * 0.75, sweep: 0.8, speed: 0.42 },
    ],
    loot: { x: 1080, y: 320 },
    exit: { x: 56, y: 676, label: 'Loading Dock' },
    start: { x: 92, y: 130 },
    tools: { decoy: 2, emp: 1, smoke: 2 },
  },

  {
    numeral: 'II',
    name: 'The Vault Wing',
    intro: 'The Sapphire sits in a locked vestibule. The vents remember a way in.',
    walls: [
      ...BORDER(),
      { x: 600, y: 64, w: 14, h: 240 },
      { x: 600, y: 424, w: 14, h: 282 },
      { x: 880, y: 180, w: 14, h: 244 },
      { x: 170, y: 306, w: 226, h: 14 },
      { x: 980, y: 470, w: 14, h: 236 },
    ],
    doors: [
      { x: 600, y: 316, w: 14, h: 96, locked: true, label: 'Vestibule Gate' },
    ],
    plinths: [
      { x: 340, y: 150, w: 46, h: 46, kind: 'vase' },
      { x: 470, y: 480, w: 46, h: 46, kind: 'urn' },
      { x: 1040, y: 200, w: 46, h: 46, kind: 'urn' },
      { x: 760, y: 580, w: 46, h: 46, kind: 'vase' },
    ],
    shadows: [
      { x: 56, y: 116, w: 170, h: 104 },
      { x: 300, y: 560, w: 180, h: 110 },
      { x: 1060, y: 596, w: 170, h: 96 },
      { x: 660, y: 210, w: 140, h: 84 },
      { x: 1010, y: 90, w: 150, h: 84 },
      { x: 180, y: 380, w: 150, h: 90 },
    ],
    vents: [
      { a: { x: 74, y: 678 }, b: { x: 730, y: 116 } },
      { a: { x: 1190, y: 678 }, b: { x: 404, y: 178 } },
    ],
    guards: [
      { path: [[660, 250], [790, 250], [790, 420], [660, 420]], speed: 72 },
      { path: [[120, 210], [310, 500], [900, 640], [1150, 210]], speed: 78 },
      { path: [[1010, 150], [1010, 620], [1230, 400]], speed: 92, rover: true },
    ],
    cameras: [
      { x: 614, y: 84, base: Math.PI * 0.5, sweep: 0.8, speed: 0.5 },
      { x: 1252, y: 340, base: Math.PI, sweep: 0.9, speed: 0.44 },
      { x: 906, y: 80, base: Math.PI * 0.6, sweep: 0.6, speed: 0.6 },
    ],
    loot: { x: 1080, y: 330 },
    exit: { x: 56, y: 110, label: 'Coal Chute' },
    start: { x: 92, y: 656 },
    tools: { decoy: 1, emp: 2, smoke: 2 },
  },

  {
    numeral: 'III',
    name: 'The Rotunda Night',
    intro: 'One ring of marble, four wardens, the Sapphire in plain sight.',
    walls: [
      ...BORDER(),
      { x: 300, y: 64, w: 14, h: 176 },
      { x: 960, y: 64, w: 14, h: 150 },
      { x: 960, y: 486, w: 14, h: 220 },
    ],
    doors: [
      { x: 960, y: 234, w: 14, h: 86, locked: true, label: 'Curator\u2019s Gate' },
    ],
    plinths: [
      { x: 500, y: 240, w: 42, h: 42, kind: 'pillar' },
      { x: 760, y: 240, w: 42, h: 42, kind: 'pillar' },
      { x: 500, y: 500, w: 42, h: 42, kind: 'pillar' },
      { x: 760, y: 500, w: 42, h: 42, kind: 'pillar' },
      { x: 400, y: 380, w: 42, h: 42, kind: 'urn' },
      { x: 860, y: 380, w: 42, h: 42, kind: 'vase' },
    ],
    shadows: [
      { x: 60, y: 300, w: 150, h: 110 },
      { x: 330, y: 560, w: 180, h: 110 },
      { x: 1040, y: 300, w: 170, h: 120 },
      { x: 340, y: 100, w: 160, h: 90 },
      { x: 560, y: 620, w: 150, h: 80 },
      { x: 620, y: 120, w: 150, h: 84 },
    ],
    vents: [
      { a: { x: 74, y: 678 }, b: { x: 700, y: 112 } },
      { a: { x: 1206, y: 130 }, b: { x: 360, y: 678 } },
    ],
    guards: [
      { path: [[470, 200], [810, 200], [810, 580], [470, 580]], speed: 74 },
      { path: [[810, 580], [470, 580], [470, 200], [810, 200]], speed: 74 },
      { path: [[120, 120], [120, 640], [900, 400]], speed: 96, rover: true },
      { path: [[1100, 560], [1230, 420], [1100, 160]], speed: 84 },
    ],
    cameras: [
      { x: 314, y: 90, base: Math.PI * 0.4, sweep: 0.8, speed: 0.5 },
      { x: 1252, y: 240, base: Math.PI, sweep: 0.9, speed: 0.46 },
      { x: 700, y: 700, base: -Math.PI * 0.5, sweep: 0.9, speed: 0.55 },
    ],
    loot: { x: 640, y: 390 },
    exit: { x: 1180, y: 116, label: 'Glass Walk' },
    start: { x: 92, y: 656 },
    tools: { decoy: 2, emp: 1, smoke: 1 },
  },
];
