// Keyboard and mouse, gathered in one place for the whole heist.

export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pressed = new Set();   // keys hit since last frame, consumed by readPress
    this.mouse = { x: 640, y: 400, inside: false };
    this.click = null;          // {x, y} of a left click since last frame
    this.canvas = canvas;
    this.scale = 1;

    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      this.keys.add(k);
      this.pressed.add(k);
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => this.keys.clear());

    canvas.addEventListener('mousemove', (e) => this.trackMouse(e));
    canvas.addEventListener('mousedown', (e) => {
      this.trackMouse(e);
      if (e.button === 0) this.click = { x: this.mouse.x, y: this.mouse.y };
    });
  }

  trackMouse(e) {
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - r.left) / r.width) * 1280;
    this.mouse.y = ((e.clientY - r.top) / r.height) * 720;
    this.mouse.inside = true;
  }

  down(...ks) { return ks.some((k) => this.keys.has(k)); }
  readPress(k) { const had = this.pressed.has(k); if (had) this.pressed.delete(k); return had; }
  readClick() { const c = this.click; this.click = null; return c; }
  endFrame() { this.pressed.clear(); this.click = null; }
}
