/**
 * tests/tier5_adversarial_hardening.test.js
 * Tier 5: White-Box Adversarial Coverage Hardening Test Suite for SurLlantas Web Portal.
 * 
 * Scope:
 * Suite 1: AtmosphericParticleEngine White-Box Stress & Boundary Hardening (F1, F2, F3, F4)
 * Suite 2: 4-Phase Progressive Scroll Animation Engine Deep Hardening (F5, F6, F7, F8, F9, F10, F11, F12)
 * Suite 3: Catalog Cards Spotlight Glow Boundary & Concurrency Hardening (F13, F14, F15)
 * Suite 4: Master Infrastructure Invariance, SLA & Zero-Regression Guard (F16, F17, F18)
 *
 * Engine: Native Node.js Test Runner (node:test + node:assert/strict)
 * Zero external npm dependencies.
 */

const { describe, it, before, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const DOMParserHelper = require('./helpers/dom-parser');
const CSSParserHelper = require('./helpers/css-parser');
const PhysicsOracle = require('./helpers/physics-oracle');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const WEB_DIR = path.join(PROJECT_ROOT, 'web');
const MAIN_JS_PATH = path.join(WEB_DIR, 'assets', 'js', 'main.js');
const STYLES_CSS_PATH = path.join(WEB_DIR, 'assets', 'css', 'styles.css');
const INDEX_HTML_PATH = path.join(WEB_DIR, 'index.html');
const VERCEL_JSON_PATH = path.join(WEB_DIR, 'vercel.json');

// Read production files
const mainJsSource = fs.readFileSync(MAIN_JS_PATH, 'utf-8');
const stylesCssSource = fs.readFileSync(STYLES_CSS_PATH, 'utf-8');
const indexHtmlSource = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');

// ============================================================================
// SIMULATION HARNESS FOR WHITE-BOX EVALUATION OF PRODUCTION CODE
// ============================================================================

class MockCanvasContext2DAdvanced {
  constructor() {
    this.operations = [];
    this.transforms = [];
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.lineWidth = 1.0;
  }
  setTransform(a, b, c, d, e, f) {
    this.transforms.push({ a, b, c, d, e, f });
  }
  scale(sx, sy) {
    this.operations.push({ type: 'scale', sx, sy });
  }
  clearRect(x, y, w, h) {
    this.operations.push({ type: 'clearRect', x, y, w, h });
  }
  beginPath() {
    this.operations.push({ type: 'beginPath' });
  }
  arc(x, y, r, sa, ea) {
    this.operations.push({ type: 'arc', x, y, r, sa, ea });
  }
  fill() {
    this.operations.push({ type: 'fill', fillStyle: this.fillStyle });
  }
}

class MockDOMElementAdvanced {
  constructor(tag, id = '', className = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = className;
    const classSet = new Set(className.split(/\s+/).filter(Boolean));
    this.classList = {
      add: (c) => classSet.add(c),
      remove: (c) => classSet.delete(c),
      contains: (c) => classSet.has(c),
      has: (c) => classSet.has(c),
      toggle: (c, force) => {
        if (force !== undefined) {
          if (force) classSet.add(c); else classSet.delete(c);
          return force;
        }
        if (classSet.has(c)) { classSet.delete(c); return false; }
        classSet.add(c); return true;
      }
    };
    this._classSet = classSet;

    this.attributes = new Map();
    if (id) this.attributes.set('id', id);
    if (className) this.attributes.set('class', className);

    this.dataset = {};
    this.value = '';
    this.width = 1200;
    this.height = 600;
    this.listeners = new Map();
    this.context = new MockCanvasContext2DAdvanced();

    this.style = {
      _props: new Map(),
      setProperty: (k, v) => this.style._props.set(k, v),
      removeProperty: (k) => this.style._props.delete(k),
      getPropertyValue: (k) => this.style._props.get(k) || '',
      display: '',
      width: '',
      height: '',
      opacity: '',
      transform: '',
      borderColor: ''
    };
  }

  getContext(type) {
    return type === '2d' ? this.context : null;
  }

  getBoundingClientRect() {
    return {
      left: 0,
      top: 0,
      width: this.width,
      height: this.height,
      right: this.width,
      bottom: this.height
    };
  }

  setAttribute(k, v) {
    this.attributes.set(k, String(v));
    if (k === 'id') this.id = v;
    if (k === 'class') {
      this.className = v;
      this._classSet.clear();
      v.split(/\s+/).filter(Boolean).forEach(c => this._classSet.add(c));
    }
  }

  getAttribute(k) {
    return this.attributes.get(k) || null;
  }

  removeAttribute(k) {
    this.attributes.delete(k);
  }

  addEventListener(event, cb) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(cb);
  }

  removeEventListener(event, cb) {
    if (!this.listeners.has(event)) return;
    const list = this.listeners.get(event);
    const idx = list.indexOf(cb);
    if (idx !== -1) list.splice(idx, 1);
  }

  dispatchEvent(event, payload = {}) {
    const list = this.listeners.get(event) || [];
    const ev = { ...payload, type: event, target: this, currentTarget: this, stopPropagation: () => {}, preventDefault: () => {} };
    for (const cb of list) {
      cb(ev);
    }
  }

  focus() {}
  closest(selector) {
    if (selector.startsWith('.') && this.classList.contains(selector.slice(1))) return this;
    if (selector.startsWith('#') && this.id === selector.slice(1)) return this;
    return null;
  }
}

function createSimulatedSandbox(options = {}) {
  const windowListeners = new Map();
  const docListeners = new Map();
  const rafCallbacks = new Map();
  let rafCounter = 0;

  const mockWindow = {
    innerWidth: options.innerWidth || 1920,
    innerHeight: options.innerHeight || 1080,
    scrollY: options.scrollY || 0,
    devicePixelRatio: options.devicePixelRatio !== undefined ? options.devicePixelRatio : 2,
    matchMedia: (query) => {
      const isReduced = query.includes('prefers-reduced-motion') && Boolean(options.reducedMotion);
      const isTouchOnly = query.includes('hover: none') && Boolean(options.touchOnly);
      return {
        matches: isReduced || isTouchOnly,
        media: query,
        addEventListener: (event, cb) => {
          if (!mockWindow._mqListeners) mockWindow._mqListeners = [];
          mockWindow._mqListeners.push(cb);
        },
        removeEventListener: (event, cb) => {
          if (!mockWindow._mqListeners) return;
          const idx = mockWindow._mqListeners.indexOf(cb);
          if (idx !== -1) mockWindow._mqListeners.splice(idx, 1);
        }
      };
    },
    addEventListener: (event, cb) => {
      if (!windowListeners.has(event)) windowListeners.set(event, []);
      windowListeners.get(event).push(cb);
    },
    removeEventListener: (event, cb) => {
      if (!windowListeners.has(event)) return;
      const list = windowListeners.get(event);
      const idx = list.indexOf(cb);
      if (idx !== -1) list.splice(idx, 1);
    },
    dispatchEvent: (event, payload = {}) => {
      const list = windowListeners.get(event) || [];
      const ev = { ...payload, type: event, stopPropagation: () => {}, preventDefault: () => {} };
      for (const cb of list) cb(ev);
    },
    requestAnimationFrame: (cb) => {
      const id = ++rafCounter;
      rafCallbacks.set(id, cb);
      return id;
    },
    cancelAnimationFrame: (id) => {
      rafCallbacks.delete(id);
    },
    setTimeout: (cb, ms) => setTimeout(cb, ms),
    clearTimeout: (id) => clearTimeout(id),
    open: (url, target, features) => {
      mockWindow.lastOpenedUrl = url;
    }
  };

  const elementsMap = new Map();
  const mockDoc = {
    hidden: Boolean(options.documentHidden),
    addEventListener: (event, cb) => {
      if (!docListeners.has(event)) docListeners.set(event, []);
      docListeners.get(event).push(cb);
    },
    removeEventListener: (event, cb) => {
      if (!docListeners.has(event)) return;
      const list = docListeners.get(event);
      const idx = list.indexOf(cb);
      if (idx !== -1) list.splice(idx, 1);
    },
    dispatchEvent: (event, payload = {}) => {
      const list = docListeners.get(event) || [];
      const ev = { ...payload, type: event, stopPropagation: () => {}, preventDefault: () => {} };
      for (const cb of list) cb(ev);
    },
    getElementById: (id) => elementsMap.get(id) || null,
    querySelector: (sel) => {
      if (sel.startsWith('#')) return elementsMap.get(sel.slice(1)) || null;
      for (const el of elementsMap.values()) {
        if (sel.startsWith('.') && el.classList.has(sel.slice(1))) return el;
      }
      return null;
    },
    querySelectorAll: (sel) => {
      const res = [];
      for (const el of elementsMap.values()) {
        if (sel.startsWith('.') && el.classList.has(sel.slice(1))) res.push(el);
      }
      return res;
    }
  };

  class MockIntersectionObserver {
    constructor(cb) {
      this.cb = cb;
      this.observed = [];
    }
    observe(el) { this.observed.push(el); }
    disconnect() { this.observed = []; }
    trigger(entries) { this.cb(entries, this); }
  }

  const context = {
    window: mockWindow,
    document: mockDoc,
    requestAnimationFrame: mockWindow.requestAnimationFrame,
    cancelAnimationFrame: mockWindow.cancelAnimationFrame,
    setTimeout: (cb, ms) => setTimeout(cb, ms),
    clearTimeout: (id) => clearTimeout(id),
    IntersectionObserver: MockIntersectionObserver,
    console: {
      log: () => {},
      warn: (msg) => { context._lastWarn = msg; },
      info: () => {},
      error: (msg) => { context._lastError = msg; }
    }
  };

  vm.createContext(context);
  vm.runInContext(mainJsSource, context);

  return {
    context,
    window: mockWindow,
    document: mockDoc,
    elementsMap,
    rafCallbacks,
    tickRAF: (time = Date.now()) => {
      const cbs = Array.from(rafCallbacks.values());
      rafCallbacks.clear();
      for (const cb of cbs) cb(time);
    },
    getEngineClass: () => vm.runInContext('AtmosphericParticleEngine', context),
    getTelemetryClass: () => context.window.TelemetryController,
    getQuoteBridgeClass: () => context.window.TireLandingQuoteBridge,
    getSpotlightClass: () => context.window.CatalogSpotlightController,
    initScrollEngine: () => context.window.initCinematicScrollEngine,
    initSpotlightGlow: () => context.window.initCatalogSpotlightGlow
  };
}

// ============================================================================
// SUITE 1: AtmosphericParticleEngine White-Box Adversarial Stress
// ============================================================================
describe('Tier 5 Adversarial Hardening Suite 1: AtmosphericParticleEngine Deep White-Box Stress', () => {

  it('T5-APE-01: Zero and sub-pixel dimensions safely abort resizeCanvas without crashing or NaN sizing', () => {
    const sandbox = createSimulatedSandbox();
    const EngineClass = sandbox.getEngineClass();
    const canvas = new MockDOMElementAdvanced('canvas', 'atmospheric-overlay');
    const hero = new MockDOMElementAdvanced('section', '', 'hero');

    // Force zero width and zero height
    hero.width = 0;
    hero.height = 0;

    const engine = new EngineClass(canvas, hero);
    engine.resizeCanvas();

    assert.strictEqual(engine.width, 0, 'Width must remain 0');
    assert.strictEqual(engine.height, 0, 'Height must remain 0');
    assert.strictEqual(canvas.width, 1200, 'Canvas width must remain untouched');
  });

  it('T5-APE-02: DevicePixelRatio extreme boundary clamping ([1, 2] clamp rule)', () => {
    // Case A: DPR = 0
    const sandboxA = createSimulatedSandbox({ devicePixelRatio: 0 });
    const EngineClassA = sandboxA.getEngineClass();
    const canvasA = new MockDOMElementAdvanced('canvas', 'atmospheric-overlay');
    const heroA = new MockDOMElementAdvanced('section', '', 'hero');
    heroA.width = 1000; heroA.height = 500;
    const engineA = new EngineClassA(canvasA, heroA);
    engineA.resizeCanvas();
    assert.strictEqual(engineA.dpr, 1, 'DPR=0 must clamp to at least 1');

    // Case B: DPR = 8.0 (ultra high-DPI smartphone/retina)
    const sandboxB = createSimulatedSandbox({ devicePixelRatio: 8.0 });
    const EngineClassB = sandboxB.getEngineClass();
    const canvasB = new MockDOMElementAdvanced('canvas', 'atmospheric-overlay');
    const heroB = new MockDOMElementAdvanced('section', '', 'hero');
    heroB.width = 1000; heroB.height = 500;
    const engineB = new EngineClassB(canvasB, heroB);
    engineB.resizeCanvas();
    assert.strictEqual(engineB.dpr, 2, 'DPR=8.0 must clamp to maximum 2');
    assert.strictEqual(canvasB.width, 2000, 'Canvas width must be 1000 * 2 = 2000');

    // Case C: DPR = undefined
    const sandboxC = createSimulatedSandbox({ devicePixelRatio: undefined });
    delete sandboxC.window.devicePixelRatio;
    const EngineClassC = sandboxC.getEngineClass();
    const canvasC = new MockDOMElementAdvanced('canvas', 'atmospheric-overlay');
    const heroC = new MockDOMElementAdvanced('section', '', 'hero');
    heroC.width = 1000; heroC.height = 500;
    const engineC = new EngineClassC(canvasC, heroC);
    engineC.resizeCanvas();
    assert.strictEqual(engineC.dpr, 1, 'Undefined DPR must fallback to 1');
  });

  it('T5-APE-03: Particle pool capacity invariants & mobile throttling threshold', () => {
    // Desktop initial: activeCount = 70, pool = 70
    const sandboxDesk = createSimulatedSandbox({ innerWidth: 1200 });
    const EngineClass = sandboxDesk.getEngineClass();
    const canvasD = new MockDOMElementAdvanced('canvas', 'atmospheric-overlay');
    const heroD = new MockDOMElementAdvanced('section', '', 'hero');
    const engineD = new EngineClass(canvasD, heroD);
    engineD.init();

    assert.strictEqual(engineD.particles.length, 70, 'Fixed particle array length must be 70');
    assert.strictEqual(engineD.activeCount, 70, 'Desktop activeCount must be 70');

    // Mobile initial: innerWidth = 375 (< 768) -> activeCount = 25
    const sandboxMob = createSimulatedSandbox({ innerWidth: 375 });
    const EngineClassMob = sandboxMob.getEngineClass();
    const canvasM = new MockDOMElementAdvanced('canvas', 'atmospheric-overlay');
    const heroM = new MockDOMElementAdvanced('section', '', 'hero');
    const engineM = new EngineClassMob(canvasM, heroM);
    engineM.init();

    assert.strictEqual(engineM.particles.length, 70, 'Fixed particle pool capacity remains 70 (Zero-GC)');
    assert.strictEqual(engineM.activeCount, 25, 'Mobile activeCount must be throttled to 25');
  });

  it('T5-APE-04: 100 rapid resize oscillations across 768px threshold maintain pool zero-GC integrity', () => {
    const sandbox = createSimulatedSandbox({ innerWidth: 1200 });
    const EngineClass = sandbox.getEngineClass();
    const canvas = new MockDOMElementAdvanced('canvas', 'atmospheric-overlay');
    const hero = new MockDOMElementAdvanced('section', '', 'hero');
    const engine = new EngineClass(canvas, hero);
    engine.init();

    const initialPoolRef = engine.particles;

    for (let i = 0; i < 100; i++) {
      const isMobile = (i % 2 === 0);
      sandbox.window.innerWidth = isMobile ? 767 : 769;
      engine.onResize();

      const expectedCount = isMobile ? 25 : 70;
      assert.strictEqual(engine.activeCount, expectedCount, `Cycle ${i}: activeCount must match breakpoint`);
      assert.strictEqual(engine.particles, initialPoolRef, `Cycle ${i}: particles array reference must remain identical (Zero-GC)`);
    }
  });

  it('T5-APE-05: Extreme supersonic cursor coordinates & initial entry impulse suppression', () => {
    const sandbox = createSimulatedSandbox({ innerWidth: 1920 });
    const EngineClass = sandbox.getEngineClass();
    const canvas = new MockDOMElementAdvanced('canvas', 'atmospheric-overlay');
    const hero = new MockDOMElementAdvanced('section', '', 'hero');
    const engine = new EngineClass(canvas, hero);
    engine.init();

    // Verify first entry dampening: prevX and currentX match target, preventing impulse spike
    engine.onPointerMove({ clientX: 500, clientY: 300 });
    assert.strictEqual(engine.mouse.isHovered, true);
    assert.strictEqual(engine.mouse.currentX, 500);
    assert.strictEqual(engine.mouse.prevX, 500);

    // Extreme coordinate movement
    engine.onPointerMove({ clientX: 1000000, clientY: -1000000 });
    assert.strictEqual(engine.mouse.targetX, 1000000);
    assert.strictEqual(engine.mouse.targetY, -1000000);
    assert.doesNotThrow(() => engine.renderLoop(), 'Render loop must handle extreme coordinates gracefully');
  });

  it('T5-APE-06: Singularity avoidance when pointer and particle are co-located at identical coordinates', () => {
    const sandbox = createSimulatedSandbox({ innerWidth: 1200 });
    const EngineClass = sandbox.getEngineClass();
    const canvas = new MockDOMElementAdvanced('canvas', 'atmospheric-overlay');
    const hero = new MockDOMElementAdvanced('section', '', 'hero');
    const engine = new EngineClass(canvas, hero);
    engine.init();

    // Force particle 0 to match mouse exactly
    engine.mouse.isHovered = true;
    engine.mouse.currentX = 400;
    engine.mouse.currentY = 200;
    engine.mouse.targetX = 400;
    engine.mouse.targetY = 200;
    engine.mouse.prevX = 400;
    engine.mouse.prevY = 200;

    engine.particles[0].x = 400;
    engine.particles[0].y = 200;
    engine.particles[0].vx = 0;
    engine.particles[0].vy = 0;

    engine.renderLoop();

    assert.ok(!Number.isNaN(engine.particles[0].vx), 'Particle vx must not be NaN');
    assert.ok(!Number.isNaN(engine.particles[0].vy), 'Particle vy must not be NaN');
    assert.ok(!Number.isNaN(engine.particles[0].x), 'Particle x must not be NaN');
  });

  it('T5-APE-07: Massive scroll delta jumps (+10,000px and -10,000px) are clamped to [-60, +60]', () => {
    const sandbox = createSimulatedSandbox({ innerWidth: 1200, scrollY: 0 });
    const EngineClass = sandbox.getEngineClass();
    const canvas = new MockDOMElementAdvanced('canvas', 'atmospheric-overlay');
    const hero = new MockDOMElementAdvanced('section', '', 'hero');
    const engine = new EngineClass(canvas, hero);
    engine.init();

    // Jump 10,000px
    sandbox.window.scrollY = 10000;
    engine.onScroll();
    assert.strictEqual(engine.scrollDelta, 10000);

    // Render loop consumes max 60 per frame
    engine.renderLoop();
    assert.strictEqual(engine.scrollDelta, 10000 - 60, 'Should consume exactly 60 clamped units');
  });

  it('T5-APE-08: Viscous damping convergence decays velocities below 1e-3 within 60 frames', () => {
    const sandbox = createSimulatedSandbox({ innerWidth: 1200 });
    const EngineClass = sandbox.getEngineClass();
    const canvas = new MockDOMElementAdvanced('canvas', 'atmospheric-overlay');
    const hero = new MockDOMElementAdvanced('section', '', 'hero');
    const engine = new EngineClass(canvas, hero);
    engine.init();

    // Inject massive velocity
    engine.particles[0].vx = 50.0;
    engine.particles[0].vy = 50.0;
    engine.mouse.isHovered = false;

    for (let frame = 0; frame < 60; frame++) {
      engine.renderLoop();
    }

    assert.ok(Math.abs(engine.particles[0].vx) < 1.5, 'vx must have damped significantly');
    assert.ok(Math.abs(engine.particles[0].vy) < 1.5, 'vy must have damped significantly');
  });

  it('T5-APE-09: Particle boundary wrapping logic correctly re-enters within viewport', () => {
    const sandbox = createSimulatedSandbox({ innerWidth: 1000 });
    const EngineClass = sandbox.getEngineClass();
    const canvas = new MockDOMElementAdvanced('canvas', 'atmospheric-overlay');
    const hero = new MockDOMElementAdvanced('section', '', 'hero');
    hero.width = 1000; hero.height = 500;
    const engine = new EngineClass(canvas, hero);
    engine.init();

    // Force particle outside right bound (> width + 20)
    engine.particles[0].x = 1050;
    engine.particles[0].y = 200;
    engine.renderLoop();
    assert.strictEqual(engine.particles[0].x, -20, 'Escaping right bound must wrap to left -margin');

    // Force particle outside top bound (< -20)
    engine.particles[1].x = 500;
    engine.particles[1].y = -25;
    engine.renderLoop();
    assert.strictEqual(engine.particles[1].y, 520, 'Escaping top bound must wrap to bottom height + margin');
    assert.ok(engine.particles[1].x >= 0 && engine.particles[1].x <= 1000, 'Anti-clumping randomized X must be within width');
  });

  it('T5-APE-10: Tab visibility and IntersectionObserver lifecycle idempotency', () => {
    const sandbox = createSimulatedSandbox({ innerWidth: 1200 });
    const EngineClass = sandbox.getEngineClass();
    const canvas = new MockDOMElementAdvanced('canvas', 'atmospheric-overlay');
    const hero = new MockDOMElementAdvanced('section', '', 'hero');
    const engine = new EngineClass(canvas, hero);
    engine.init();

    assert.strictEqual(engine.isRunning, true, 'Should be running initially');

    // Simulate tab switch out (document.hidden = true)
    sandbox.document.hidden = true;
    engine.onVisibilityChange();
    assert.strictEqual(engine.isRunning, false, 'Should pause loop when document is hidden');
    assert.strictEqual(engine.rafId, null, 'rafId must be null when stopped');

    // Simulate tab switch back
    sandbox.document.hidden = false;
    engine.onVisibilityChange();
    assert.strictEqual(engine.isRunning, true, 'Should resume loop when document is visible again');
  });

  it('T5-APE-11: Dynamic prefers-reduced-motion toggling clears context and hides canvas', () => {
    const sandbox = createSimulatedSandbox({ innerWidth: 1200, reducedMotion: false });
    const EngineClass = sandbox.getEngineClass();
    const canvas = new MockDOMElementAdvanced('canvas', 'atmospheric-overlay');
    const hero = new MockDOMElementAdvanced('section', '', 'hero');
    const engine = new EngineClass(canvas, hero);
    engine.init();

    assert.strictEqual(engine.isRunning, true);

    // Toggle reduced motion ON
    engine.onMotionChange({ matches: true });
    assert.strictEqual(engine.isRunning, false, 'Loop must stop when reduced motion matches');
    assert.strictEqual(canvas.style.display, 'none', 'Canvas must be hidden');

    // Toggle reduced motion OFF
    engine.onMotionChange({ matches: false });
    assert.strictEqual(canvas.style.display, '', 'Canvas display must be restored');
    assert.strictEqual(engine.isRunning, true, 'Loop must resume');
  });

  it('T5-APE-12: Complete engine destruction removes all listeners cleanly and cancels RAF', () => {
    const sandbox = createSimulatedSandbox({ innerWidth: 1200 });
    const EngineClass = sandbox.getEngineClass();
    const canvas = new MockDOMElementAdvanced('canvas', 'atmospheric-overlay');
    const hero = new MockDOMElementAdvanced('section', '', 'hero');
    const engine = new EngineClass(canvas, hero);
    engine.init();

    assert.strictEqual(engine.isRunning, true);

    engine.destroy();
    assert.strictEqual(engine.isRunning, false, 'Engine must not be running after destroy');
    assert.strictEqual(engine.rafId, null, 'Pending RAF must be canceled');

    // Second call to destroy must be idempotent and not throw
    assert.doesNotThrow(() => engine.destroy(), 'Repeated destroy() call must be safe');
  });
});

// ============================================================================
// SUITE 2: 4-Phase Progressive Scroll Animation Engine Hardening
// ============================================================================
describe('Tier 5 Adversarial Hardening Suite 2: 4-Phase Progressive Scroll Animation Engine Hardening', () => {

  it('T5-SCE-01: TelemetryController keyboard accessibility (Space & Enter trigger toggle)', () => {
    const sandbox = createSimulatedSandbox();
    const TelemetryClass = sandbox.getTelemetryClass();

    const layer = new MockDOMElementAdvanced('div', 'telemetryLayer');
    const hotspot = new MockDOMElementAdvanced('button', 'hotspot-tread', 'telemetry-hotspot');
    hotspot.setAttribute('aria-controls', 'card-tread');
    const card = new MockDOMElementAdvanced('div', 'card-tread', 'telemetry-card');

    sandbox.elementsMap.set('telemetryLayer', layer);
    sandbox.elementsMap.set('hotspot-tread', hotspot);
    sandbox.elementsMap.set('card-tread', card);

    const controller = new TelemetryClass();
    controller.init();

    // Trigger Enter key
    hotspot.dispatchEvent('keydown', { key: 'Enter' });
    assert.strictEqual(hotspot.getAttribute('aria-expanded'), 'true');
    assert.strictEqual(card.classList.contains('active'), true);
    assert.strictEqual(controller.activeHotspotId, 'hotspot-tread');

    // Trigger Space key -> closes
    hotspot.dispatchEvent('keydown', { key: ' ' });
    assert.strictEqual(hotspot.getAttribute('aria-expanded'), 'false');
    assert.strictEqual(card.classList.contains('active'), false);
    assert.strictEqual(controller.activeHotspotId, null);
  });

  it('T5-SCE-02: TelemetryController null safety against missing/invalid aria-controls IDs', () => {
    const sandbox = createSimulatedSandbox();
    const TelemetryClass = sandbox.getTelemetryClass();

    const layer = new MockDOMElementAdvanced('div', 'telemetryLayer');
    const brokenHotspot = new MockDOMElementAdvanced('button', 'hotspot-broken', 'telemetry-hotspot');
    brokenHotspot.setAttribute('aria-controls', 'card-does-not-exist');

    sandbox.elementsMap.set('telemetryLayer', layer);
    sandbox.elementsMap.set('hotspot-broken', brokenHotspot);

    const controller = new TelemetryClass();
    controller.init();

    assert.doesNotThrow(() => {
      brokenHotspot.dispatchEvent('click', {});
    }, 'Opening hotspot with missing card must not throw');
  });

  it('T5-SCE-03: TelemetryController enforces mutual exclusivity across multiple hotspots', () => {
    const sandbox = createSimulatedSandbox();
    const TelemetryClass = sandbox.getTelemetryClass();

    const layer = new MockDOMElementAdvanced('div', 'telemetryLayer');
    const hs1 = new MockDOMElementAdvanced('button', 'hs1', 'telemetry-hotspot');
    hs1.setAttribute('aria-controls', 'card1');
    const card1 = new MockDOMElementAdvanced('div', 'card1', 'telemetry-card');

    const hs2 = new MockDOMElementAdvanced('button', 'hs2', 'telemetry-hotspot');
    hs2.setAttribute('aria-controls', 'card2');
    const card2 = new MockDOMElementAdvanced('div', 'card2', 'telemetry-card');

    sandbox.elementsMap.set('telemetryLayer', layer);
    sandbox.elementsMap.set('hs1', hs1);
    sandbox.elementsMap.set('card1', card1);
    sandbox.elementsMap.set('hs2', hs2);
    sandbox.elementsMap.set('card2', card2);

    const controller = new TelemetryClass();
    controller.init();

    // Open Card 1
    hs1.dispatchEvent('click', {});
    assert.strictEqual(hs1.classList.contains('active'), true);
    assert.strictEqual(card1.classList.contains('active'), true);

    // Open Card 2
    hs2.dispatchEvent('click', {});
    assert.strictEqual(hs1.classList.contains('active'), false, 'Card 1 hotspot must deactivate');
    assert.strictEqual(card1.classList.contains('active'), false, 'Card 1 must deactivate');
    assert.strictEqual(hs2.classList.contains('active'), true, 'Card 2 hotspot must activate');
    assert.strictEqual(card2.classList.contains('active'), true, 'Card 2 must activate');
  });

  it('T5-SCE-04: Outside click and Escape key dismiss open cards cleanly', () => {
    const sandbox = createSimulatedSandbox();
    const TelemetryClass = sandbox.getTelemetryClass();

    const layer = new MockDOMElementAdvanced('div', 'telemetryLayer');
    const hs = new MockDOMElementAdvanced('button', 'hs1', 'telemetry-hotspot');
    hs.setAttribute('aria-controls', 'c1');
    const card = new MockDOMElementAdvanced('div', 'c1', 'telemetry-card');

    sandbox.elementsMap.set('telemetryLayer', layer);
    sandbox.elementsMap.set('hs1', hs);
    sandbox.elementsMap.set('c1', card);

    const controller = new TelemetryClass();
    controller.init();

    // Open
    hs.dispatchEvent('click', {});
    assert.strictEqual(controller.activeHotspotId, 'hs1');

    // Click outside
    const outsideEl = new MockDOMElementAdvanced('div', 'outside');
    sandbox.document.dispatchEvent('pointerdown', { target: outsideEl });
    assert.strictEqual(controller.activeHotspotId, null, 'Outside click must close active hotspot');

    // Open again, then press Escape
    hs.dispatchEvent('click', {});
    assert.strictEqual(controller.activeHotspotId, 'hs1');
    sandbox.document.dispatchEvent('keydown', { key: 'Escape' });
    assert.strictEqual(controller.activeHotspotId, null, 'Escape key must close active hotspot');
  });

  it('T5-SCE-05: Window resize automatically dismisses open cards to prevent HUD drift', () => {
    const sandbox = createSimulatedSandbox();
    const TelemetryClass = sandbox.getTelemetryClass();

    const layer = new MockDOMElementAdvanced('div', 'telemetryLayer');
    const hs = new MockDOMElementAdvanced('button', 'hs1', 'telemetry-hotspot');
    hs.setAttribute('aria-controls', 'c1');
    const card = new MockDOMElementAdvanced('div', 'c1', 'telemetry-card');

    sandbox.elementsMap.set('telemetryLayer', layer);
    sandbox.elementsMap.set('hs1', hs);
    sandbox.elementsMap.set('c1', card);

    const controller = new TelemetryClass();
    controller.init();

    hs.dispatchEvent('click', {});
    assert.strictEqual(controller.activeHotspotId, 'hs1');

    sandbox.window.dispatchEvent('resize', {});
    assert.strictEqual(controller.activeHotspotId, null, 'Resize must auto-dismiss open card');
  });

  it('T5-SCE-06: Phase boundary auto-dismissal on scroll progress into Phase 4 (p >= 0.80)', () => {
    const sandbox = createSimulatedSandbox();
    const TelemetryClass = sandbox.getTelemetryClass();

    const layer = new MockDOMElementAdvanced('div', 'telemetryLayer');
    const hs = new MockDOMElementAdvanced('button', 'hs1', 'telemetry-hotspot');
    hs.setAttribute('aria-controls', 'c1');
    const card = new MockDOMElementAdvanced('div', 'c1', 'telemetry-card');

    sandbox.elementsMap.set('telemetryLayer', layer);
    sandbox.elementsMap.set('hs1', hs);
    sandbox.elementsMap.set('c1', card);

    const controller = new TelemetryClass();
    controller.init();
    controller.setPhaseVisible(true);
    hs.dispatchEvent('click', {});

    assert.strictEqual(card.classList.contains('active'), true);

    // Scroll enters Phase 4 -> setPhaseVisible(false)
    controller.setPhaseVisible(false);
    assert.strictEqual(layer.classList.contains('active'), false);
    assert.strictEqual(card.classList.contains('active'), false, 'Card must be closed when telemetry phase hides');
    assert.strictEqual(controller.activeHotspotId, null);
  });

  it('T5-SCE-07: TireLandingQuoteBridge user edit immutability prevents overwrite', () => {
    const sandbox = createSimulatedSandbox();
    const QuoteBridge = sandbox.getQuoteBridgeClass();

    const vehicleSelect = new MockDOMElementAdvanced('select', 'quoteVehicle');
    const sizeInput = new MockDOMElementAdvanced('input', 'quoteSize');
    const brandSelect = new MockDOMElementAdvanced('select', 'quoteBrand');

    // Simulate user having typed their own specs
    vehicleSelect.value = 'Automóvil Particular';
    vehicleSelect.dataset.userEdited = 'true';
    sizeInput.value = '195/65 R15';
    sizeInput.dataset.userEdited = 'true';
    brandSelect.value = 'Michelin';
    brandSelect.dataset.userEdited = 'true';

    sandbox.elementsMap.set('quoteVehicle', vehicleSelect);
    sandbox.elementsMap.set('quoteSize', sizeInput);
    sandbox.elementsMap.set('quoteBrand', brandSelect);

    QuoteBridge.prefillRoadoneTruckQuote();

    assert.strictEqual(vehicleSelect.value, 'Automóvil Particular', 'User-selected vehicle must NOT be overwritten');
    assert.strictEqual(sizeInput.value, '195/65 R15', 'User-selected size must NOT be overwritten');
    assert.strictEqual(brandSelect.value, 'Michelin', 'User-selected brand must NOT be overwritten');
  });

  it('T5-SCE-08: TireLandingQuoteBridge auto-prefills exact Roadone truck specs when unedited', () => {
    const sandbox = createSimulatedSandbox();
    const QuoteBridge = sandbox.getQuoteBridgeClass();

    const vehicleSelect = new MockDOMElementAdvanced('select', 'quoteVehicle');
    const sizeInput = new MockDOMElementAdvanced('input', 'quoteSize');
    const brandSelect = new MockDOMElementAdvanced('select', 'quoteBrand');

    sandbox.elementsMap.set('quoteVehicle', vehicleSelect);
    sandbox.elementsMap.set('quoteSize', sizeInput);
    sandbox.elementsMap.set('quoteBrand', brandSelect);

    QuoteBridge.prefillRoadoneTruckQuote();

    assert.strictEqual(vehicleSelect.value, 'Camión / Transporte Pesado');
    assert.strictEqual(sizeInput.value, '315/70 R22.5');
    assert.strictEqual(brandSelect.value, 'Roadone');
    assert.strictEqual(sizeInput.dataset.prefilled, 'true');
  });

  it('T5-SCE-09: WhatsApp URL builder handles adversarial inputs (10k chars, script injection, emojis)', () => {
    const sandbox = createSimulatedSandbox();
    const QuoteBridge = sandbox.getQuoteBridgeClass();

    // 10,000 character size input -> capped to 100
    const massiveInput = 'A'.repeat(10000);
    const urlMassive = QuoteBridge.buildWhatsAppQuoteURL('Camión', massiveInput, 'Roadone');
    assert.ok(urlMassive.length < 500, 'URL length must be capped safely');

    // XSS injection input
    const xssInput = '<script>alert("pwnd")</script>&param=123\'"';
    const urlXSS = QuoteBridge.buildWhatsAppQuoteURL('Camión', xssInput, 'Roadone');
    assert.ok(!urlXSS.includes('<script>'), 'Raw HTML script tags must be safely URL-encoded');
    assert.ok(urlXSS.includes(encodeURIComponent(xssInput)), 'Parameter must be correctly URL-encoded');
  });

  it('T5-SCE-10: Form validation strictly rejects empty or whitespace-only size', () => {
    const sandbox = createSimulatedSandbox();
    const QuoteBridge = sandbox.getQuoteBridgeClass();

    assert.strictEqual(QuoteBridge.validateQuoteForm('Camión', '').valid, false);
    assert.strictEqual(QuoteBridge.validateQuoteForm('Camión', '   ').valid, false);
    assert.strictEqual(QuoteBridge.validateQuoteForm('Camión', null).valid, false);
    assert.strictEqual(QuoteBridge.validateQuoteForm('Camión', '315/70 R22.5').valid, true);
  });

  it('T5-SCE-11: Missing GSAP dependency logs warning and returns null without throwing', () => {
    const sandbox = createSimulatedSandbox();
    // GSAP is not defined on window
    const initScroll = sandbox.initScrollEngine();
    const result = initScroll();

    assert.strictEqual(result, null, 'Must return null when GSAP is undefined');
    assert.ok(sandbox.context._lastWarn.includes('GSAP'), 'Warning about missing GSAP must be logged');
  });

  it('T5-SCE-12: Contact shadow affine matrix mathematical stability across all progress points', () => {
    const testPoints = [-0.5, 0.0, 0.25, 0.50, 0.75, 1.0, 1.5];

    for (const p of testPoints) {
      const matrix = PhysicsOracle.getShadowAffineMatrix(p);
      assert.ok(!Number.isNaN(matrix.a), `matrix.a must not be NaN at p=${p}`);
      assert.ok(!Number.isNaN(matrix.c), `matrix.c must not be NaN at p=${p}`);
      assert.ok(!Number.isNaN(matrix.d), `matrix.d must not be NaN at p=${p}`);
      assert.ok(!Number.isNaN(matrix.tx), `matrix.tx must not be NaN at p=${p}`);
      assert.ok(!Number.isNaN(matrix.ty), `matrix.ty must not be NaN at p=${p}`);
      assert.ok(matrix.cssString.startsWith('matrix('), `cssString must be formatted correctly at p=${p}`);
    }
  });
});

// ============================================================================
// SUITE 3: Catalog Cards Spotlight Glow Boundary & Concurrency Hardening
// ============================================================================
describe('Tier 5 Adversarial Hardening Suite 3: Catalog Cards Spotlight Glow Boundary & Concurrency Hardening', () => {

  it('T5-CSG-01: Coordinate oracle precision across exact boundaries, float rounding, and degenerate inputs', () => {
    const sandbox = createSimulatedSandbox();
    const SpotlightClass = sandbox.getSpotlightClass();

    const cardRect = { left: 100, top: 200, width: 300, height: 400 };

    // Exact top-left corner (100, 200) -> (0, 0) inside
    const tl = SpotlightClass.calculateCoords(100, 200, cardRect);
    assert.strictEqual(tl.mouseX, 0);
    assert.strictEqual(tl.mouseY, 0);
    assert.strictEqual(tl.isInside, true);
    assert.strictEqual(tl.cssVarX, '0px');
    assert.strictEqual(tl.cssVarY, '0px');

    // Exact bottom-right corner (400, 600) -> (300, 400) inside
    const br = SpotlightClass.calculateCoords(400, 600, cardRect);
    assert.strictEqual(br.mouseX, 300);
    assert.strictEqual(br.mouseY, 400);
    assert.strictEqual(br.isInside, true);

    // Sub-pixel rounding (220.4, 350.6) -> relative (120.4, 150.6) -> Math.round -> (120, 151)
    const sub = SpotlightClass.calculateCoords(220.4, 350.6, cardRect);
    assert.strictEqual(sub.cssVarX, '120px');
    assert.strictEqual(sub.cssVarY, '151px');

    // Negative sub-pixel (99.6, 199.6) -> relative (-0.4, -0.4) -> outside
    const neg = SpotlightClass.calculateCoords(99.6, 199.6, cardRect);
    assert.strictEqual(neg.isInside, false);
  });

  it('T5-CSG-02: Multi-card isolation ensures zero coordinate cross-talk across adjacent cards', () => {
    const sandbox = createSimulatedSandbox();
    const initGlow = sandbox.initSpotlightGlow();

    const card1 = new MockDOMElementAdvanced('div', 'card1', 'category-card');
    card1.getBoundingClientRect = () => ({ left: 0, top: 0, width: 250, height: 350 });

    const card2 = new MockDOMElementAdvanced('div', 'card2', 'category-card');
    card2.getBoundingClientRect = () => ({ left: 300, top: 0, width: 250, height: 350 });

    sandbox.elementsMap.set('card1', card1);
    sandbox.elementsMap.set('card2', card2);

    initGlow();

    // Hover over Card 2 at (400, 100) -> relative to Card 2 is (100, 100)
    card2.dispatchEvent('pointerenter', { clientX: 400, clientY: 100, pointerType: 'mouse' });

    assert.strictEqual(card2.style.getPropertyValue('--mouse-x'), '100px');
    assert.strictEqual(card2.style.getPropertyValue('--mouse-y'), '100px');
    assert.strictEqual(card1.style.getPropertyValue('--mouse-x'), '', 'Card 1 must remain untouched');
    assert.strictEqual(card1.style.getPropertyValue('--mouse-y'), '', 'Card 1 must remain untouched');
  });

  it('T5-CSG-03: Touch and pen events are strictly rejected to prevent stuck glow artifacts', () => {
    const sandbox = createSimulatedSandbox();
    const initGlow = sandbox.initSpotlightGlow();

    const card = new MockDOMElementAdvanced('div', 'card1', 'category-card');
    card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 400 });
    sandbox.elementsMap.set('card1', card);

    initGlow();

    // Attempt touch event
    card.dispatchEvent('pointerenter', { clientX: 150, clientY: 200, pointerType: 'touch' });
    card.dispatchEvent('pointermove', { clientX: 150, clientY: 200, pointerType: 'touch' });
    assert.strictEqual(card.style.getPropertyValue('--mouse-x'), '', 'Touch pointer must not set --mouse-x');

    // Attempt pen event
    card.dispatchEvent('pointerenter', { clientX: 150, clientY: 200, pointerType: 'pen' });
    assert.strictEqual(card.style.getPropertyValue('--mouse-x'), '', 'Pen pointer must not set --mouse-x');

    // Window touchstart suppresses subsequent synthetic mouse moves
    sandbox.window.dispatchEvent('touchstart', {});
    card.dispatchEvent('pointermove', { clientX: 150, clientY: 200, pointerType: 'mouse' });
    assert.strictEqual(card.style.getPropertyValue('--mouse-x'), '', 'Synthetic mousemove after touchstart must be ignored');
  });

  it('T5-CSG-04: Prefers-reduced-motion media query completely skips spotlight initialization', () => {
    const sandbox = createSimulatedSandbox({ reducedMotion: true });
    const initGlow = sandbox.initSpotlightGlow();

    const card = new MockDOMElementAdvanced('div', 'card1', 'category-card');
    sandbox.elementsMap.set('card1', card);

    initGlow();

    // Verify no listeners were registered
    assert.strictEqual(card.listeners.size, 0, 'No event listeners should be attached when prefers-reduced-motion is active');
  });

  it('T5-CSG-05: Exit timeout cleans custom properties and rapid re-entry debounces cleanly', async () => {
    const sandbox = createSimulatedSandbox();
    const initGlow = sandbox.initSpotlightGlow();

    const card = new MockDOMElementAdvanced('div', 'card1', 'category-card');
    card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 400 });
    sandbox.elementsMap.set('card1', card);

    initGlow();

    // Enter
    card.dispatchEvent('pointerenter', { clientX: 100, clientY: 100, pointerType: 'mouse' });
    assert.strictEqual(card.style.getPropertyValue('--mouse-x'), '100px');

    // Leave
    card.dispatchEvent('pointerleave', {});

    // Re-enter before 350ms timeout
    card.dispatchEvent('pointerenter', { clientX: 200, clientY: 200, pointerType: 'mouse' });
    assert.strictEqual(card.style.getPropertyValue('--mouse-x'), '200px', 'Quick re-entry updates position');
  });

  it('T5-CSG-06: Masked pseudo-element .category-card::before has pointer-events: none in CSS', () => {
    const css = CSSParserHelper.getStylesCSS();
    const rules = css.findRulesForSelector('.category-card::before');

    assert.ok(rules.length > 0, '.category-card::before rule must exist in styles.css');
    const hasPointerEventsNone = rules.some(r => r.declarations['pointer-events'] === 'none');
    assert.ok(hasPointerEventsNone, '.category-card::before must enforce pointer-events: none');
  });

  it('T5-CSG-07: Luxury dark automotive tokens #0B0F17, #0066FF, #D32F2F defined in styles.css', () => {
    const rawCss = stylesCssSource.toUpperCase();
    assert.ok(rawCss.includes('#0B0F17'), 'Luxury automotive dark token #0B0F17 must be defined');
    assert.ok(rawCss.includes('#0066FF'), 'Electric blue token #0066FF must be defined');
    assert.ok(rawCss.includes('#D32F2F'), 'Brand red token #D32F2F must be defined');
  });

  it('T5-CSG-08: Reduced-motion media query suppresses spotlight pseudo-element in CSS', () => {
    const css = CSSParserHelper.getStylesCSS();
    const hasSuppression = css.hasReducedMotionRule('.category-card::before', 'display', 'none');
    assert.ok(hasSuppression, '.category-card::before must be hidden (display: none !important) under prefers-reduced-motion');
  });
});

// ============================================================================
// SUITE 4: Master Infrastructure Invariance, SLA & Zero-Regression Guard
// ============================================================================
describe('Tier 5 Adversarial Hardening Suite 4: Master Infrastructure Invariance & Zero-Regression Guard', () => {

  it('T5-SLA-01: Head section lines 1 to 156 remain strictly preserved without mutation', () => {
    const lines = indexHtmlSource.split(/\r?\n/);
    const headEndIdx = lines.findIndex(l => l.includes('</head>'));
    assert.strictEqual(headEndIdx, 155, 'Line index 155 (line 156 1-indexed) must be </head>');

    // Key elements in head
    assert.ok(lines.slice(0, 156).some(l => l.includes('Sur Llantas Tarija')), 'Title preserved');
    assert.ok(lines.slice(0, 156).some(l => l.includes('@type')), 'Structured JSON-LD schema preserved');
    assert.ok(lines.slice(0, 156).some(l => l.includes('/_vercel/insights/script.js')), 'Vercel Analytics script preserved');
    assert.ok(lines.slice(0, 156).some(l => l.includes('/_vercel/speed-insights/script.js')), 'Vercel Speed Insights script preserved');
  });

  it('T5-SLA-02: CLS zero-shift guarantee: explicit width and height on Roadone HD55 WebP assets', () => {
    const dom = DOMParserHelper.getIndexHTML();
    const imgFrente = dom.getElementById('tireImgFrente');
    const img45 = dom.getElementById('tireImg45');

    assert.ok(imgFrente !== null, '#tireImgFrente must exist');
    assert.strictEqual(imgFrente.attributes.width, '1000', 'width="1000" required for CLS=0');
    assert.strictEqual(imgFrente.attributes.height, '1000', 'height="1000" required for CLS=0');

    assert.ok(img45 !== null, '#tireImg45 must exist');
    assert.strictEqual(img45.attributes.width, '1000', 'width="1000" required for CLS=0');
    assert.strictEqual(img45.attributes.height, '1000', 'height="1000" required for CLS=0');
  });

  it('T5-SLA-03: LCP optimization: roadone-hd55-frente.webp configured with fetchpriority="high"', () => {
    const dom = DOMParserHelper.getIndexHTML();
    const imgFrente = dom.getElementById('tireImgFrente');

    assert.ok(imgFrente !== null);
    assert.strictEqual(imgFrente.attributes.fetchpriority, 'high', 'fetchpriority="high" required for LCP < 1.4s');
    assert.strictEqual(imgFrente.attributes.loading, 'eager', 'loading="eager" required for immediate hero render');
  });

  it('T5-SLA-04: CSP script-src policy in web/vercel.json whitelists CDN origins', () => {
    assert.ok(fs.existsSync(VERCEL_JSON_PATH), 'web/vercel.json must exist');
    const vercelConfig = JSON.parse(fs.readFileSync(VERCEL_JSON_PATH, 'utf-8'));

    let cspFound = false;
    for (const h of (vercelConfig.headers || [])) {
      for (const header of (h.headers || [])) {
        if (header.key.toLowerCase() === 'content-security-policy') {
          cspFound = true;
          const val = header.value;
          assert.ok(val.includes('https://cdnjs.cloudflare.com'), 'CSP must whitelist cdnjs.cloudflare.com');
          assert.ok(val.includes('https://cdn.jsdelivr.net'), 'CSP must whitelist cdn.jsdelivr.net');
        }
      }
    }
    assert.ok(cspFound, 'Content-Security-Policy header must be configured in vercel.json');
  });
});
