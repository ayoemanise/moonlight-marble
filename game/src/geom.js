// Pure geometry the wardens' eyes and the Magpie's feet agree on.

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
export const angleTo = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);

// Shortest signed turn from angle a toward angle b.
export function turnToward(a, b, maxStep) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + clamp(d, -maxStep, maxStep);
}

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// Slide a moving point out of every wall it has run into, axis by axis.
export function slidePoint(x, y, dx, dy, walls) {
  x += dx;
  for (const w of walls) {
    if (pointInRect(x, y, w)) x = dx > 0 ? w.x - 0.01 : w.x + w.w + 0.01;
  }
  y += dy;
  for (const w of walls) {
    if (pointInRect(x, y, w)) y = dy > 0 ? w.y - 0.01 : w.y + w.h + 0.01;
  }
  return [x, y];
}

// Does the straight eye-line cross any wall? Sampled, never exact.
export function losBlocked(ax, ay, bx, by, walls) {
  const d = dist(ax, ay, bx, by);
  const steps = Math.max(2, Math.ceil(d / 14));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = ax + (bx - ax) * t;
    const y = ay + (by - ay) * t;
    for (const w of walls) if (pointInRect(x, y, w)) return true;
  }
  return false;
}

// Is the eye-line fogged by a smoke shroud?
export function smokeBlocks(ax, ay, bx, by, smokes) {
  if (!smokes || !smokes.length) return false;
  const d = dist(ax, ay, bx, by);
  const steps = Math.max(2, Math.ceil(d / 18));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = ax + (bx - ax) * t;
    const y = ay + (by - ay) * t;
    for (const s of smokes) if (dist(x, y, s.x, s.y) < s.r * 0.85) return true;
  }
  return false;
}

// Is a point inside any dark patch of floor?
export function inShadow(x, y, shadows) {
  for (const s of shadows) if (pointInRect(x, y, s)) return true;
  return false;
}
