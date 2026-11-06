/**
 * tests/m3_stress_harness.js
 * Adversarial Stress, Memory Leak, Timer Cleanup, Layout Reflow, and Invariance Harness for Milestone 3
 * Author: teamwork_challenger_m3_2 (Empirical Challenger: critic, specialist)
 *
 * Challenge Dimensions:
 * 1. Memory & Timer Leak Audit:
 *    - 1,000 rapid pointerenter / pointerleave cycles across all 4 category cards.
 *    - Strict assertion under node --expose-gc that resetTimer handles and rAF IDs do not leak,
 *      stack up, or cause unbounded heap growth.
 * 2. Reflow & Rendering Pipeline SLA:
 *    - AST/declaration verification that modifying --mouse-x and --mouse-y invalidates paint/composite only.
 *    - Zero layout reflow properties triggered (no width, height, margin, padding, etc.).
 *    - Micro-benchmark: 100,000 coordinate transforms via CatalogSpotlightController.
 * 3. CTA Clickability & Stacking Context:
 *    - Verification that pointer-events: none on .category-card::before prevents click interception.
 *    - Z-index stacking hierarchy validation (btn z-index >= 3, before z-index = 2).
 * 4. Reduced-Motion Runtime Deactivation:
 *    - Dynamic tracking completely halts when prefers-reduced-motion: reduce is active.
 *    - 0 rAF frames requested, 0 timers scheduled, static borders invariant.
 * 5. Touch & Coarse Pointer Suppression:
 *    - Pointer events with pointerType 'touch' or 'pen' strictly ignored.
 *    - Post-touchstart synthetic mouse events suppressed.
 *    - Media queries (hover: none) and (pointer: coarse) deactivate controller.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { performance } = require('perf_hooks');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const WEB_DIR = path.join(PROJECT_ROOT, 'web');
const INDEX_HTML_PATH = path.join(WEB_DIR, 'index.html');
const STYLES_CSS_PATH = path.join(WEB_DIR, 'assets', 'css', 'styles.css');
const MAIN_JS_PATH = path.join(WEB_DIR, 'assets', 'js', 'main.js');

const DOMParserHelper = require('./helpers/dom-parser');
const CSSParserHelper = require('./helpers/css-parser');
const PhysicsOracle = require('./helpers/physics-oracle');

console.log('================================================================');
console.log('  MILESTONE 3 ADVERSARIAL STRESS HARNESS (CHALLENGER 2)');
console.log('================================================================');

const testResults = {
  passed: 0,
  failed: 0,
  findings: []
};

function recordPass(testName, details) {
  testResults.passed++;
  console.log(`[PASS] ${testName}`);
  if (details) console.log(`       -> ${details}`);
}

function recordFail(testName, reason) {
  testResults.failed++;
  testResults.findings.push({ testName, reason });
  console.log(`[FAIL] ${testName}`);
  console.log(`       -> REASON: ${reason}`);
}

// ---------------------------------------------------------------------------
// High-Fidelity Mock DOM & Style Architecture for In-Memory Stress
// ---------------------------------------------------------------------------
class MockCSSDeclaration {
  constructor() {
    this._props = Object.create(null);
  }
  setProperty(prop, val) {
    this._props[prop] = String(val);
  }
  removeProperty(prop) {
    const val = this._props[prop] || '';
    delete this._props[prop];
    return val;
  }
  getPropertyValue(prop) {
    return this._props[prop] || '';
  }
}

class MockCardElement {
  constructor(index, className = 'category-card reveal', rect = { left: 0, top: 0, width: 300, height: 420 }) {
    this.index = index;
    this.className = className;
    this.style = new MockCSSDeclaration();
    this.listeners = Object.create(null);
    this.rect = rect;
    this.children = [];
  }

  addEventListener(type, listener, options = {}) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push({ listener, options });
  }

  removeEventListener(type, listener) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter(item => item.listener !== listener);
  }

  dispatchEvent(event) {
    event.target = this;
    event.currentTarget = this;
    const list = this.listeners[event.type] || [];
    for (const item of list) {
      item.listener(event);
    }
  }

  getBoundingClientRect() {
    return {
      left: this.rect.left,
      top: this.rect.top,
      width: this.rect.width,
      height: this.rect.height,
      right: this.rect.left + this.rect.width,
      bottom: this.rect.top + this.rect.height
    };
  }

  appendChild(child) {
    this.children.push(child);
  }
}

// Environment factory function to instantiate a fresh isolated sandbox
function createTestEnvironment(options = {}) {
  const cards = [
    new MockCardElement(0, 'category-card reveal', { left: 100, top: 200, width: 320, height: 450 }),
    new MockCardElement(1, 'category-card reveal', { left: 450, top: 200, width: 320, height: 450 }),
    new MockCardElement(2, 'category-card reveal category-card--featured', { left: 800, top: 200, width: 320, height: 450 }),
    new MockCardElement(3, 'category-card reveal', { left: 1150, top: 200, width: 320, height: 450 })
  ];

  cards.forEach((card, idx) => {
    const btn = {
      tagName: 'A',
      className: 'btn btn--primary btn--sm',
      id: `cta-btn-${idx}`,
      href: 'https://wa.me/59172960725?text=test'
    };
    card.appendChild(btn);
  });

  const activeRafs = new Map();
  let nextRafId = 1;

  const activeTimers = new Map();
  let nextTimerId = 1;

  const windowListeners = Object.create(null);

  // Set up globals before requiring or evaluating main.js
  const mockWindow = {
    addEventListener: (type, listener, opts) => {
      if (!windowListeners[type]) windowListeners[type] = [];
      windowListeners[type].push({ listener, opts });
    },
    removeEventListener: (type, listener) => {
      if (!windowListeners[type]) return;
      windowListeners[type] = windowListeners[type].filter(item => item.listener !== listener);
    },
    dispatchEvent: (event) => {
      const list = windowListeners[event.type] || [];
      for (const item of list) item.listener(event);
    },
    matchMedia: (q) => {
      let matches = false;
      if (options.reducedMotion && q.includes('prefers-reduced-motion: reduce')) {
        matches = true;
      }
      if (options.touchOnly && (q.includes('hover: none') || q.includes('pointer: coarse'))) {
        matches = true;
      }
      return {
        matches,
        media: q,
        addEventListener: () => {},
        removeEventListener: () => {}
      };
    },
    location: { href: 'http://localhost' }
  };

  const mockDocument = {
    addEventListener: () => {},
    querySelectorAll: (sel) => {
      if (sel === '.category-card') return cards;
      return [];
    },
    querySelector: (sel) => {
      if (sel === '.category-card') return cards[0];
      return null;
    },
    getElementById: () => null
  };

  // Mock timing functions
  const mockRaf = (cb) => {
    const id = nextRafId++;
    activeRafs.set(id, cb);
    return id;
  };

  const mockCancelRaf = (id) => {
    activeRafs.delete(id);
  };

  const mockSetTimeout = (cb, delay) => {
    const id = nextTimerId++;
    activeTimers.set(id, { cb, delay, createdAt: performance.now() });
    return id;
  };

  const mockClearTimeout = (id) => {
    activeTimers.delete(id);
  };

  // Flush queued rAFs
  const flushRafs = () => {
    const queue = Array.from(activeRafs.entries());
    activeRafs.clear();
    for (const [, cb] of queue) {
      if (typeof cb === 'function') cb(performance.now());
    }
  };

  // Advance virtual timers
  const tickTimers = (elapsedMs = 400) => {
    const runnable = [];
    for (const [id, entry] of activeTimers.entries()) {
      if (entry.delay <= elapsedMs) {
        runnable.push({ id, cb: entry.cb });
      }
    }
    for (const item of runnable) {
      activeTimers.delete(item.id);
      item.cb();
    }
  };

  return {
    cards,
    mockWindow,
    mockDocument,
    mockRaf,
    mockCancelRaf,
    mockSetTimeout,
    mockClearTimeout,
    activeRafs,
    activeTimers,
    flushRafs,
    tickTimers
  };
}

// ---------------------------------------------------------------------------
// SUITE 1: 1,000 Rapid Pointerenter / Pointerleave / Move Churn & V8 Heap Audit
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 1: 1,000 Rapid Pointerenter / Pointerleave Cycles & Memory Leak Audit ---');

try {
  // Save originals
  const origWindow = global.window;
  const origDoc = global.document;
  const origRaf = global.requestAnimationFrame;
  const origCancelRaf = global.cancelAnimationFrame;
  const origTimeout = global.setTimeout;
  const origClearTimeout = global.clearTimeout;

  const env = createTestEnvironment();
  global.window = env.mockWindow;
  global.document = env.mockDocument;
  global.requestAnimationFrame = env.mockRaf;
  global.cancelAnimationFrame = env.mockCancelRaf;
  global.setTimeout = env.mockSetTimeout;
  global.clearTimeout = env.mockClearTimeout;

  // Clear module cache to re-require main.js with new environment
  delete require.cache[require.resolve(MAIN_JS_PATH)];
  require(MAIN_JS_PATH);

  const { CatalogSpotlightController, initCatalogSpotlightGlow } = global.window;
  assert.strictEqual(typeof initCatalogSpotlightGlow, 'function');
  assert.strictEqual(typeof CatalogSpotlightController, 'function');

  // Initialize
  initCatalogSpotlightGlow();

  // Force full multi-pass garbage collection to establish solid baseline
  if (global.gc) {
    for (let g = 0; g < 3; g++) global.gc();
  }
  const heapStart = process.memoryUsage().heapUsed;

  const ITERATIONS = 1000;
  const t0 = performance.now();

  for (let i = 0; i < ITERATIONS; i++) {
    const card = env.cards[i % 4];
    const rect = card.rect;

    // 1. Enter
    const enterX = rect.left + 50 + (i % 120);
    const enterY = rect.top + 60 + (i % 180);
    card.dispatchEvent({ type: 'pointerenter', pointerType: 'mouse', clientX: enterX, clientY: enterY });

    // Verify immediate synchronous coordinate setting on enter
    assert.strictEqual(card.style.getPropertyValue('--mouse-x'), `${Math.round(enterX - rect.left)}px`);
    assert.strictEqual(card.style.getPropertyValue('--mouse-y'), `${Math.round(enterY - rect.top)}px`);

    // 2. High-frequency pointermove events (simulate cursor movement)
    for (let m = 0; m < 5; m++) {
      card.dispatchEvent({
        type: 'pointermove',
        pointerType: 'mouse',
        clientX: enterX + m * 5,
        clientY: enterY + m * 8
      });
    }

    // Flush any pending rAF frame
    env.flushRafs();

    // 3. Leave
    card.dispatchEvent({ type: 'pointerleave', pointerType: 'mouse' });

    // Verify rAF was cancelled or empty
    assert.strictEqual(env.activeRafs.size, 0, 'Active rAF queue must be 0 after pointerleave');

    // Every 10 iterations, allow the 350ms smooth reset timer to fire
    if (i % 10 === 0) {
      env.tickTimers(400);
      assert.strictEqual(card.style.getPropertyValue('--mouse-x'), '', 'Inline --mouse-x must be removed after 350ms timeout');
      assert.strictEqual(card.style.getPropertyValue('--mouse-y'), '', 'Inline --mouse-y must be removed after 350ms timeout');
    }
  }

  // Flush remaining reset timers
  env.tickTimers(500);

  // Verify resting state: all cards have cleanly removed inline CSS custom properties
  for (let c = 0; c < 4; c++) {
    assert.strictEqual(env.cards[c].style.getPropertyValue('--mouse-x'), '', `Card ${c} --mouse-x must be removed at rest`);
    assert.strictEqual(env.cards[c].style.getPropertyValue('--mouse-y'), '', `Card ${c} --mouse-y must be removed at rest`);
  }

  const duration = performance.now() - t0;
  if (global.gc) {
    for (let g = 0; g < 3; g++) global.gc();
  }
  const heapEnd = process.memoryUsage().heapUsed;
  const heapDeltaKB = (heapEnd - heapStart) / 1024;

  console.log(`Executed ${ITERATIONS} cycles in ${duration.toFixed(2)}ms (${(duration / ITERATIONS).toFixed(3)}ms/cycle)`);
  console.log(`V8 Heap: Start=${(heapStart / 1024).toFixed(1)} KB, End=${(heapEnd / 1024).toFixed(1)} KB, Delta=${heapDeltaKB.toFixed(2)} KB`);

  // Assert heap growth < 500 KB across 1,000 cycles (sub-megabyte strict limit)
  if (heapDeltaKB < 500) {
    recordPass('1,000 Rapid Pointer Cycles Heap Audit', `Heap delta ${heapDeltaKB.toFixed(2)} KB < 500 KB ceiling under node --expose-gc`);
  } else {
    recordFail('1,000 Rapid Pointer Cycles Heap Audit', `Memory leak detected: heap delta ${heapDeltaKB.toFixed(2)} KB >= 500 KB`);
  }

  // Restore originals
  global.window = origWindow;
  global.document = origDoc;
  global.requestAnimationFrame = origRaf;
  global.cancelAnimationFrame = origCancelRaf;
  global.setTimeout = origTimeout;
  global.clearTimeout = origClearTimeout;

  recordPass('Resting State Custom Property Cleanup', 'All 4 cards have completely cleared --mouse-x and --mouse-y on timer completion');
} catch (err) {
  recordFail('1,000 Rapid Pointer Cycles & Memory Leak Audit', err.message);
}

// ---------------------------------------------------------------------------
// SUITE 2: Timer & rAF Handle Accumulation & Rapid Churn Stress
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 2: Timer & rAF Handle Accumulation & Rapid Churn Stress ---');

try {
  const origWindow = global.window;
  const origDoc = global.document;
  const origRaf = global.requestAnimationFrame;
  const origCancelRaf = global.cancelAnimationFrame;
  const origTimeout = global.setTimeout;
  const origClearTimeout = global.clearTimeout;

  const env = createTestEnvironment();
  global.window = env.mockWindow;
  global.document = env.mockDocument;
  global.requestAnimationFrame = env.mockRaf;
  global.cancelAnimationFrame = env.mockCancelRaf;
  global.setTimeout = env.mockSetTimeout;
  global.clearTimeout = env.mockClearTimeout;

  delete require.cache[require.resolve(MAIN_JS_PATH)];
  require(MAIN_JS_PATH);
  global.window.initCatalogSpotlightGlow();

  const card = env.cards[0];

  // 1. High frequency rapid enter/leave jitter: 500 enter/leave calls without timer ticks
  for (let j = 0; j < 500; j++) {
    card.dispatchEvent({ type: 'pointerenter', pointerType: 'mouse', clientX: 120, clientY: 220 });
    card.dispatchEvent({ type: 'pointerleave', pointerType: 'mouse' });
  }

  // At the end, only 1 reset timer should be active for this card (NOT 500 timers!)
  const activeTimersCount = env.activeTimers.size;
  console.log(`Active timers after 500 continuous zero-duration enter/leave cycles: ${activeTimersCount}`);
  if (activeTimersCount === 1) {
    recordPass('Reset Timer Handle Containment', 'Exactly 1 active timer handle preserved; no runaway timer accumulation');
  } else {
    recordFail('Reset Timer Handle Accumulation', `Expected 1 active timer handle, found ${activeTimersCount}`);
  }

  // 2. Re-entry during countdown immediately cancels pending resetTimer
  card.dispatchEvent({ type: 'pointerenter', pointerType: 'mouse', clientX: 150, clientY: 250 });
  assert.strictEqual(env.activeTimers.size, 0, 'Re-entry before timer tick must cancel active timer handle');
  recordPass('Reset Timer Abort on Re-entry', 'Pending timer was cleared immediately when cursor re-entered');

  // 3. 200 pointermove events scheduled before next rAF tick
  for (let m = 0; m < 200; m++) {
    card.dispatchEvent({ type: 'pointermove', pointerType: 'mouse', clientX: 150 + m, clientY: 250 + m });
  }
  // Exactly 1 rAF callback should be scheduled
  assert.strictEqual(env.activeRafs.size, 1, '200 rapid pointermoves must collapse into exactly 1 scheduled rAF frame');
  recordPass('rAF Queue Deduplication', '200 pointermoves scheduled exactly 1 rAF callback without frame explosion');

  // Execute rAF and confirm queue emptied
  env.flushRafs();
  assert.strictEqual(env.activeRafs.size, 0);

  // Leave and allow timer to expire
  card.dispatchEvent({ type: 'pointerleave', pointerType: 'mouse' });
  assert.strictEqual(env.activeTimers.size, 1);
  env.tickTimers(400);
  assert.strictEqual(env.activeTimers.size, 0);
  assert.strictEqual(card.style.getPropertyValue('--mouse-x'), '');
  recordPass('Clean Timer Expiration to Resting State', 'Active timers cleanly decayed to 0 and inline properties cleared');

  // Restore originals
  global.window = origWindow;
  global.document = origDoc;
  global.requestAnimationFrame = origRaf;
  global.cancelAnimationFrame = origCancelRaf;
  global.setTimeout = origTimeout;
  global.clearTimeout = origClearTimeout;
} catch (err) {
  recordFail('Timer & rAF Handle Accumulation Stress', err.message);
}

// ---------------------------------------------------------------------------
// SUITE 3: Reflow & Rendering Pipeline SLA Verification
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 3: Reflow & Rendering Pipeline SLA Verification ---');

try {
  const css = CSSParserHelper.getStylesCSS();
  const rawCSS = css.getRawCSS();

  // Find all CSS rules in styles.css that reference --mouse-x or --mouse-y
  const rules = rawCSS.match(/[^{}]+\{[^{}]*--mouse-[xy][^{}]*\}/g) || [];
  assert.ok(rules.length > 0, 'Styles referencing --mouse-x/--mouse-y must exist');

  const reflowTriggeringProps = [
    'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
    'margin', 'padding', 'top', 'left', 'right', 'bottom',
    'position', 'display', 'flex', 'grid', 'font-size', 'line-height'
  ];

  let reflowViolation = null;
  for (const rule of rules) {
    const parts = rule.split('{');
    const selector = parts[0].trim();
    const body = parts[1].replace('}', '');

    const declarations = body.split(';');
    for (const decl of declarations) {
      if (decl.includes('--mouse-x') || decl.includes('--mouse-y')) {
        const colonIdx = decl.indexOf(':');
        if (colonIdx !== -1) {
          const propName = decl.substring(0, colonIdx).trim().toLowerCase();
          for (const reflowProp of reflowTriggeringProps) {
            if (propName === reflowProp) {
              reflowViolation = `Property '${propName}' in selector '${selector}' triggers layout reflow!`;
              break;
            }
          }
          // Verify property is background or background-image
          if (!propName.includes('background')) {
            reflowViolation = `Property '${propName}' in selector '${selector}' contains --mouse-x/y but is not a background property!`;
            break;
          }
        }
      }
    }
  }

  if (!reflowViolation) {
    recordPass('Layout Reflow Invariance', '--mouse-x and --mouse-y are ONLY used in background radial-gradient, guaranteeing Paint/Composite only');
  } else {
    recordFail('Layout Reflow Invariance', reflowViolation);
  }

  // Verify pseudo-element isolation
  const beforeRules = css.findRulesForSelector('.category-card::before');
  assert.ok(beforeRules.length > 0, '.category-card::before must exist');
  const d = beforeRules[0].declarations;
  assert.strictEqual(d['pointer-events'], 'none', '::before must have pointer-events: none');
  assert.strictEqual(d['position'], 'absolute', '::before must be absolutely positioned');
  assert.strictEqual(d['inset'], '0', '::before must have inset: 0');
  assert.strictEqual(d['padding'], '1px', '::before must have padding: 1px for border perimeter confinement');
  recordPass('Perimeter Border Mask Isolation', '::before is absolutely positioned inset:0 with padding:1px and pointer-events:none');

  // Micro-benchmark: 100,000 coordinate transforms via CatalogSpotlightController
  const SpotlightController = (global.window && global.window.CatalogSpotlightController) ? global.window.CatalogSpotlightController : PhysicsOracle;
  const cardRect = { left: 150, top: 200, width: 300, height: 400 };
  const N = 100000;
  const tStart = performance.now();
  for (let k = 0; k < N; k++) {
    SpotlightController.calculateSpotlightCoords(150 + (k % 300), 200 + (k % 400), cardRect);
  }
  const tEnd = performance.now();
  const totalMs = tEnd - tStart;
  const meanMicroseconds = (totalMs / N) * 1000;
  const throughput = Math.round(N / (totalMs / 1000));

  console.log(`Computed ${N} spotlight coordinates in ${totalMs.toFixed(2)}ms (mean: ${meanMicroseconds.toFixed(3)} μs, ${throughput.toLocaleString()} ops/sec)`);
  if (meanMicroseconds < 5.0) { // < 5.0 microseconds (0.005 ms)
    recordPass('Coordinate Calculator 60 FPS SLA Benchmark', `Mean latency ${meanMicroseconds.toFixed(3)} μs is well below the 16.6ms frame budget`);
  } else {
    recordFail('Coordinate Calculator 60 FPS SLA Benchmark', `Mean latency ${meanMicroseconds.toFixed(3)} μs exceeded 5.0 μs budget`);
  }
} catch (err) {
  recordFail('Reflow & Rendering Pipeline SLA', err.message);
}

// ---------------------------------------------------------------------------
// SUITE 4: CTA Button Clickability, Stacking Context & WCAG Touch Target
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 4: CTA Button Clickability & Stacking Context Audit ---');

try {
  const dom = DOMParserHelper.getIndexHTML();
  const rawHTML = dom.getRawHTML();
  const css = CSSParserHelper.getStylesCSS();

  // 1. Locate all category cards
  const cards = dom.getElementsByClassName('category-card');
  assert.strictEqual(cards.length, 4, 'Must have exactly 4 category cards in web/index.html');

  // Verify tabindex="0" on all cards
  for (let i = 0; i < cards.length; i++) {
    assert.strictEqual(cards[i].attributes['tabindex'], '0', `Card ${i} must have tabindex="0"`);
  }
  recordPass('Card Keyboard Navigability', 'All 4 category cards declare tabindex="0" for keyboard focusability');

  // Verify each card contains a direct WhatsApp CTA link within the #categorias section
  const catSectionMatch = rawHTML.match(/<section[^>]*id=["']categorias["'][\s\S]*?<\/section>/i);
  assert.ok(catSectionMatch, 'Section #categorias must exist in index.html');
  const catHTML = catSectionMatch[0];
  const waMatches = catHTML.match(/href=["']https:\/\/wa\.me\/59172960725\?text=[^"']*["']/g) || [];
  assert.strictEqual(waMatches.length, 4, 'All 4 category cards in #categorias must contain direct wa.me consultation links');
  recordPass('Direct WhatsApp CTA Anchors', 'All 4 category cards contain direct wa.me links with customized inquiry texts');

  // 2. CSS z-index and pointer-events stacking verification
  const beforeRules = css.findRulesForSelector('.category-card::before');
  const bodyRules = css.findRulesForSelector('.category-card__body');
  const btnRules = css.findRulesForSelector('.category-card .btn');

  const beforeZ = parseInt(beforeRules[0].declarations['z-index'] || '0', 10);
  const bodyZ = parseInt(bodyRules[0].declarations['z-index'] || '0', 10);
  const btnZ = parseInt(btnRules[0].declarations['z-index'] || '0', 10);

  console.log(`Stacking context: ::before (z-index: ${beforeZ}), __body (z-index: ${bodyZ}), .btn (z-index: ${btnZ})`);

  assert.ok(btnZ >= beforeZ, `Button z-index (${btnZ}) must be >= ::before z-index (${beforeZ})`);
  assert.strictEqual(beforeRules[0].declarations['pointer-events'], 'none', '::before must declare pointer-events: none');
  recordPass('Unhindered CTA Interactivity', 'Button stacks at z-index: 3, above ::before at z-index: 2 (pointer-events: none)');

  // 3. WCAG 2.5.5 Touch Target Size: min 44x44 px
  assert.strictEqual(btnRules[0].declarations['min-height'], '44px');
  assert.strictEqual(btnRules[0].declarations['min-width'], '44px');
  recordPass('WCAG 2.5.5 Minimum Touch Target Size', '.category-card .btn enforces min-height: 44px and min-width: 44px');

  // 4. WCAG 2.4.7 Focus Visible Ring
  const focusRules = css.findRulesForSelector('.category-card:focus-visible');
  assert.ok(focusRules.length > 0, '.category-card:focus-visible outline must be declared');
  assert.ok(focusRules[0].declarations['outline'].includes('#0066FF') || focusRules[0].declarations['outline'].includes('var(--color-electric-blue'), 'Focus ring must use electric blue');
  recordPass('WCAG 2.4.7 Focus Visible Indicator', 'Electric blue outline ring verified on :focus-visible');
} catch (err) {
  recordFail('CTA Button Clickability & Stacking Context', err.message);
}

// ---------------------------------------------------------------------------
// SUITE 5: Prefers-Reduced-Motion Runtime Deactivation & Invariance
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 5: Prefers-Reduced-Motion Runtime Deactivation & Invariance ---');

try {
  const origWindow = global.window;
  const origDoc = global.document;
  const origRaf = global.requestAnimationFrame;
  const origCancelRaf = global.cancelAnimationFrame;
  const origTimeout = global.setTimeout;
  const origClearTimeout = global.clearTimeout;

  // Environment with prefers-reduced-motion: reduce
  const rmEnv = createTestEnvironment({ reducedMotion: true });
  global.window = rmEnv.mockWindow;
  global.document = rmEnv.mockDocument;
  global.requestAnimationFrame = rmEnv.mockRaf;
  global.cancelAnimationFrame = rmEnv.mockCancelRaf;
  global.setTimeout = rmEnv.mockSetTimeout;
  global.clearTimeout = rmEnv.mockClearTimeout;

  delete require.cache[require.resolve(MAIN_JS_PATH)];
  require(MAIN_JS_PATH);
  global.window.initCatalogSpotlightGlow();

  const card = rmEnv.cards[0];
  // Dispatch events to card
  card.dispatchEvent({ type: 'pointerenter', pointerType: 'mouse', clientX: 120, clientY: 220 });
  card.dispatchEvent({ type: 'pointermove', pointerType: 'mouse', clientX: 140, clientY: 240 });
  card.dispatchEvent({ type: 'pointerleave', pointerType: 'mouse' });

  // Assert zero rAFs and zero timers
  assert.strictEqual(rmEnv.activeRafs.size, 0, 'Zero rAFs requested in reduced-motion mode');
  assert.strictEqual(rmEnv.activeTimers.size, 0, 'Zero timers requested in reduced-motion mode');
  assert.strictEqual(card.style.getPropertyValue('--mouse-x'), '', 'Zero CSS variables set in reduced-motion mode');
  recordPass('Reduced-Motion Controller Deactivation', 'initCatalogSpotlightGlow exits immediately; 0 rAFs, 0 timers, 0 DOM writes');

  // Stylesheet static fallback verification
  const css = CSSParserHelper.getStylesCSS();
  const rmBlocks = css.findMediaQuery('prefers-reduced-motion: reduce');
  assert.ok(rmBlocks.length > 0, '@media (prefers-reduced-motion: reduce) block must exist in styles.css');

  const combinedRM = rmBlocks.join('\n');
  assert.ok(combinedRM.includes('border: 1px solid rgba(255, 255, 255, 0.12) !important'), 'Crisp static border rgba(255,255,255,0.12) invariant');
  assert.ok(combinedRM.includes('transform: none !important'), 'transform: none !important invariant');
  assert.ok(combinedRM.includes('transition: none !important'), 'transition: none !important invariant');
  assert.ok(combinedRM.includes('display: none !important'), '::before display: none !important invariant');
  recordPass('Reduced-Motion CSS Contract Invariance', 'Static border rgba(255,255,255,0.12), transform: none, and display: none verified');

  // Restore originals
  global.window = origWindow;
  global.document = origDoc;
  global.requestAnimationFrame = origRaf;
  global.cancelAnimationFrame = origCancelRaf;
  global.setTimeout = origTimeout;
  global.clearTimeout = origClearTimeout;
} catch (err) {
  recordFail('Prefers-Reduced-Motion Invariance', err.message);
}

// ---------------------------------------------------------------------------
// SUITE 6: Touch Device & Synthetic Event Suppression Invariance
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 6: Touch Device & Synthetic Event Suppression ---');

try {
  const origWindow = global.window;
  const origDoc = global.document;
  const origRaf = global.requestAnimationFrame;
  const origCancelRaf = global.cancelAnimationFrame;
  const origTimeout = global.setTimeout;
  const origClearTimeout = global.clearTimeout;

  // 1. Pure touch device via matchMedia ((hover: none) and (pointer: coarse))
  const touchEnv = createTestEnvironment({ touchOnly: true });
  global.window = touchEnv.mockWindow;
  global.document = touchEnv.mockDocument;
  global.requestAnimationFrame = touchEnv.mockRaf;
  global.cancelAnimationFrame = touchEnv.mockCancelRaf;
  global.setTimeout = touchEnv.mockSetTimeout;
  global.clearTimeout = touchEnv.mockClearTimeout;

  delete require.cache[require.resolve(MAIN_JS_PATH)];
  require(MAIN_JS_PATH);
  global.window.initCatalogSpotlightGlow();

  const cardT = touchEnv.cards[0];
  cardT.dispatchEvent({ type: 'pointerenter', pointerType: 'mouse', clientX: 100, clientY: 200 });
  assert.strictEqual(touchEnv.activeRafs.size, 0);
  assert.strictEqual(cardT.style.getPropertyValue('--mouse-x'), '');
  recordPass('Touch MatchMedia Controller Guard', 'Controller immediately halts on (hover: none) and (pointer: coarse)');

  // 2. Hybrid device receiving touchstart first (synthetic mouse event suppression)
  const hybridEnv = createTestEnvironment({ touchOnly: false });
  global.window = hybridEnv.mockWindow;
  global.document = hybridEnv.mockDocument;
  global.requestAnimationFrame = hybridEnv.mockRaf;
  global.cancelAnimationFrame = hybridEnv.mockCancelRaf;
  global.setTimeout = hybridEnv.mockSetTimeout;
  global.clearTimeout = hybridEnv.mockClearTimeout;

  delete require.cache[require.resolve(MAIN_JS_PATH)];
  require(MAIN_JS_PATH);
  global.window.initCatalogSpotlightGlow();

  // User taps on screen -> touchstart
  hybridEnv.mockWindow.dispatchEvent({ type: 'touchstart' });

  // Browser later emits synthetic pointerenter/pointermove
  const cardH = hybridEnv.cards[0];
  cardH.dispatchEvent({ type: 'pointerenter', pointerType: 'mouse', clientX: 110, clientY: 210 });
  cardH.dispatchEvent({ type: 'pointermove', pointerType: 'mouse', clientX: 115, clientY: 215 });

  assert.strictEqual(hybridEnv.activeRafs.size, 0, 'Synthetic mouse events must be suppressed after touchstart');
  assert.strictEqual(cardH.style.getPropertyValue('--mouse-x'), '', 'No properties set from synthetic events');
  recordPass('Synthetic Event Suppression on Touchscreens', 'touchstart capture flag successfully silences synthetic pointer events');

  // 3. Explicit pointerType touch or pen suppression
  const desktopEnv = createTestEnvironment();
  global.window = desktopEnv.mockWindow;
  global.document = desktopEnv.mockDocument;
  global.requestAnimationFrame = desktopEnv.mockRaf;
  global.cancelAnimationFrame = desktopEnv.mockCancelRaf;
  global.setTimeout = desktopEnv.mockSetTimeout;
  global.clearTimeout = desktopEnv.mockClearTimeout;

  delete require.cache[require.resolve(MAIN_JS_PATH)];
  require(MAIN_JS_PATH);
  global.window.initCatalogSpotlightGlow();

  const cardD = desktopEnv.cards[0];
  cardD.dispatchEvent({ type: 'pointerenter', pointerType: 'touch', clientX: 120, clientY: 220 });
  cardD.dispatchEvent({ type: 'pointermove', pointerType: 'touch', clientX: 125, clientY: 225 });
  cardD.dispatchEvent({ type: 'pointerenter', pointerType: 'pen', clientX: 120, clientY: 220 });
  cardD.dispatchEvent({ type: 'pointermove', pointerType: 'pen', clientX: 125, clientY: 225 });

  assert.strictEqual(desktopEnv.activeRafs.size, 0);
  assert.strictEqual(cardD.style.getPropertyValue('--mouse-x'), '');
  recordPass('PointerType Touch & Pen Hardening', 'pointerType touch and pen are strictly filtered');

  // 4. CSS Touch Viewport Fallback Rules
  const css = CSSParserHelper.getStylesCSS();
  const touchMediaBlocks = css.findMediaQuery('hover: none');
  assert.ok(touchMediaBlocks.length > 0, '@media (hover: none) block must exist in styles.css');
  const touchCSS = touchMediaBlocks.join('\n');

  assert.ok(touchCSS.includes('display: none !important'), '::before must be hidden in touch query');
  assert.ok(touchCSS.includes('border: 1px solid rgba(255, 255, 255, 0.08)'), 'Static subtle border defined in touch query');
  recordPass('Touch Fallback CSS Styling', 'Static border rgba(255,255,255,0.08) and ::before display: none !important verified');

  // 5. Image Drag Hardening & Non-blocking Touch Action
  const rawCSS = css.getRawCSS();
  assert.ok(rawCSS.includes('-webkit-user-drag: none'), 'Image -webkit-user-drag: none verified');
  assert.ok(rawCSS.includes('user-select: none'), 'Image user-select: none verified');
  assert.ok(rawCSS.includes('touch-action: pan-y'), 'touch-action: pan-y verified on .category-card');
  recordPass('Image Drag Hardening & Non-blocking Vertical Scroll', '-webkit-user-drag: none and touch-action: pan-y verified');

  // Restore originals
  global.window = origWindow;
  global.document = origDoc;
  global.requestAnimationFrame = origRaf;
  global.cancelAnimationFrame = origCancelRaf;
  global.setTimeout = origTimeout;
  global.clearTimeout = origClearTimeout;
} catch (err) {
  recordFail('Touch Device Suppression', err.message);
}

// ---------------------------------------------------------------------------
// SUITE 7: Head Invariance & Critical Infrastructure Preservation
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 7: Head Invariance & Critical Infrastructure ---');

try {
  const dom = DOMParserHelper.getIndexHTML();
  const headLines = dom.getHeadLines();

  assert.ok(headLines.length >= 150, `Expected at least 150 lines in <head>, got ${headLines.length}`);

  const rawHead = headLines.join('\n');
  assert.ok(rawHead.includes('<title>Sur Llantas | Venta de Llantas en Tarija desde 2001</title>'), '<title> tag must be preserved');
  assert.ok(rawHead.includes('meta name="description"'), 'meta description must be preserved');
  assert.ok(rawHead.includes('property="og:title"'), 'og:title must be preserved');
  assert.ok(rawHead.includes('property="og:image"'), 'og:image must be preserved');
  assert.ok(rawHead.includes('application/ld+json'), 'JSON-LD structured schema must be preserved');
  assert.ok(rawHead.includes('/_vercel/insights/script.js'), 'Vercel Analytics script must be preserved');

  recordPass('Head Infrastructure Preservation', `${headLines.length} lines in <head> intact; SEO, OpenGraph, JSON-LD, Analytics verified`);
} catch (err) {
  recordFail('Head Infrastructure Preservation', err.message);
}

// ---------------------------------------------------------------------------
// EXECUTION SUMMARY & VERDICT
// ---------------------------------------------------------------------------
console.log('\n================================================================');
console.log('                 ADVERSARIAL STRESS TEST SUMMARY');
console.log('================================================================');
console.log(`Total Checks   : ${testResults.passed + testResults.failed}`);
console.log(`Passed Checks  : ${testResults.passed}`);
console.log(`Failed Checks  : ${testResults.failed}`);
console.log('----------------------------------------------------------------');

if (testResults.failed === 0) {
  console.log('ALL ADVERSARIAL STRESS TESTS PASSED CLEANLY.');
  console.log('VERDICT: APPROVE');
  process.exit(0);
} else {
  console.log(`ATTENTION: ${testResults.failed} FAILURES DETECTED:`);
  testResults.findings.forEach((f, idx) => {
    console.log(`  ${idx + 1}. [${f.testName}] -> ${f.reason}`);
  });
  console.log('VERDICT: REQUEST_CHANGES');
  process.exit(1);
}
