// The four stills of the night: with ?shot=<name> the game arranges itself
// into a scene a moment in — the cover of the west gallery, a warden about
// to look, a chase under smoke, and the vault wing. Everything on screen is
// the game's own render; only the clock's starting point is staged.

const PAUSE_AFTER = 1.1; // seconds the scene runs before it is considered ready

export function setupShot(game, name) {
  const scenes = {
    gallery: () => sceneGallery(game),
    suspect: () => sceneSuspect(game),
    alert: () => sceneAlert(game),
    vault: () => sceneVault(game),
  };
  const run = scenes[name];
  if (!run) return;
  game.loadLevel(0);
  run();
  game.shotReadyAt = PAUSE_AFTER;
}

function sceneGallery(game) {
  const p = game.player;
  p.x = 480; p.y = 560;
  p.sneak = true;
  p.facing = -0.5;
  game.guards[0].x = 700; game.guards[0].y = 300;
  game.guards[0].facing = Math.PI * 0.75;
  game.guards[1].x = 130; game.guards[1].y = 470;
  game.guards[1].facing = -Math.PI / 2;
  game.cameras[0].phase = 0.4;
  game.alarm.value = 18;
  game.time = 42;
}

function sceneSuspect(game) {
  const p = game.player;
  p.x = 655; p.y = 330;
  p.sneak = true;
  const g = game.guards[0];
  g.x = 760; g.y = 420;
  g.facing = -Math.PI * 0.66;
  g.state = 'suspect';
  g.icon = 1;
  g.suspicion = 0.55;
  g.wait = 0.7;
  g.lastSeen = { x: 640, y: 330 };
  g.flash = 0.4;
  game.cameras[0].phase = 1.8;
  game.alarm.value = 31;
  game.time = 63;
}

function sceneAlert(game) {
  const p = game.player;
  p.x = 300; p.y = 430;
  p.facing = 1.2;
  p.sneak = false;
  p.carrying = true;
  const g = game.guards[0];
  g.x = 420; g.y = 500;
  g.facing = -1.1;
  g.state = 'alert';
  g.icon = 2;
  g.suspicion = 1.4;
  g.lastSeen = { x: 330, y: 440 };
  g.lostFor = 0.4;
  g.flash = 0.9;
  game.guards[1].x = 180; game.guards[1].y = 300;
  game.guards[1].state = 'suspect';
  game.guards[1].icon = 1;
  game.guards[1].lastSeen = { x: 260, y: 380 };
  game.decoys.push({ x: 560, y: 520, sx: 560, sy: 520, tx: 560, ty: 520, t: 1, landed: true, rest: 3 });
  game.smokes.push({ x: 360, y: 470, r: 70, ttl: 4 });
  game.alarm.value = 74;
  game.heistMode = true;
  game.loot.taken = true;
  game.seenCount = 1;
  game.time = 91;
}

function sceneVault(game) {
  game.loadLevel(1);
  const p = game.player;
  p.x = 840; p.y = 360;
  p.sneak = true;
  p.facing = 1.4;
  game.guards[0].x = 700; game.guards[0].y = 330;
  game.guards[0].facing = Math.PI * 0.8;
  game.guards[1].x = 1050; game.guards[1].y = 560;
  game.guards[1].facing = -0.9;
  game.guards[2].x = 1010; game.guards[2].y = 300;
  game.guards[2].facing = Math.PI / 2;
  game.cameras[1].phase = 2.2;
  game.alarm.value = 44;
  game.time = 120;
}
