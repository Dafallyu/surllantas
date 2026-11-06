/**
 * tests/helpers/browser-env.js
 * Simulated browser window, canvas 2D, and event environment for behavioral and physics testing.
 */

class MockCanvasContext2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.operations = [];
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.globalAlpha = 1.0;
    this.lineWidth = 1.0;
  }

  clearRect(x, y, w, h) {
    this.operations.push({ type: 'clearRect', x, y, w, h });
  }

  beginPath() {
    this.operations.push({ type: 'beginPath' });
  }

  arc(x, y, radius, startAngle, endAngle, counterclockwise) {
    this.operations.push({ type: 'arc', x, y, radius, startAngle, endAngle, counterclockwise });
  }

  fill() {
    this.operations.push({ type: 'fill', fillStyle: this.fillStyle, alpha: this.globalAlpha });
  }

  stroke() {
    this.operations.push({ type: 'stroke', strokeStyle: this.strokeStyle });
  }

  save() {
    this.operations.push({ type: 'save' });
  }

  restore() {
    this.operations.push({ type: 'restore' });
  }

  scale(sx, sy) {
    this.operations.push({ type: 'scale', sx, sy });
  }

  translate(tx, ty) {
    this.operations.push({ type: 'translate', tx, ty });
  }

  reset() {
    this.operations = [];
  }
}

class MockCanvasElement {
  constructor(id = 'atmospheric-overlay') {
    this.id = id;
    this.width = 1920;
    this.height = 1080;
    this.style = {};
    this.context = new MockCanvasContext2D(this);
  }

  getContext(type) {
    if (type === '2d') return this.context;
    return null;
  }

  getBoundingClientRect() {
    return {
      left: 0,
      top: 0,
      right: this.width,
      bottom: this.height,
      width: this.width,
      height: this.height
    };
  }
}

class MockBrowserEnvironment {
  constructor(options = {}) {
    this.innerWidth = options.innerWidth || 1920;
    this.innerHeight = options.innerHeight || 1080;
    this.scrollY = options.scrollY || 0;
    this.devicePixelRatio = options.devicePixelRatio !== undefined ? options.devicePixelRatio : 2.5;
    this.reducedMotion = options.reducedMotion || false;
    this.listeners = new Map();
    this.rafCallbacks = [];
    this.canvas = new MockCanvasElement();
  }

  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (!this.listeners.has(event)) return;
    const list = this.listeners.get(event);
    const idx = list.indexOf(callback);
    if (idx !== -1) list.splice(idx, 1);
  }

  dispatchEvent(event, payload = {}) {
    const list = this.listeners.get(event) || [];
    for (const cb of list) {
      cb({ ...payload, type: event });
    }
  }

  matchMedia(query) {
    const isReduced = query.includes('prefers-reduced-motion') && this.reducedMotion;
    const isMobile = query.includes('max-width: 767') && this.innerWidth < 768;
    return {
      matches: isReduced || isMobile,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {}
    };
  }

  requestAnimationFrame(cb) {
    const id = this.rafCallbacks.length;
    this.rafCallbacks.push(cb);
    return id;
  }

  cancelAnimationFrame(id) {
    if (this.rafCallbacks[id]) {
      this.rafCallbacks[id] = null;
    }
  }

  tick(time = Date.now()) {
    const callbacks = [...this.rafCallbacks];
    this.rafCallbacks = [];
    for (const cb of callbacks) {
      if (typeof cb === 'function') {
        cb(time);
      }
    }
  }

  clampDPR(maxDPR = 2) {
    return Math.min(this.devicePixelRatio, maxDPR);
  }
}

module.exports = {
  MockCanvasContext2D,
  MockCanvasElement,
  MockBrowserEnvironment
};
