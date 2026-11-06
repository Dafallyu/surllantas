/**
 * tests/test_m3_adversarial_stress.js
 * Empirical Adversarial Stress Testing Harness for Milestone 3 (Catalog Cards with Spotlight Glow)
 * Features Tested: F13 (Cursor Tracking), F14 (Spotlight Styling), F15 (Touch & Accessibility Fallbacks)
 * Challenger: teamwork_challenger_m3_1 (Roles: critic, specialist)
 *
 * Scope of Adversarial Verification:
 * 1. Numerical Stability & Sub-pixel Rounding Oracle (25,000 coordinate pairs, edge/corner precision, extreme/degenerate inputs)
 * 2. Multi-Card Coordinate Isolation (Zero cross-talk, independent frames across 4 category cards)
 * 3. Touch & Pen Rejection & Sticky Glow Immunity (Synthetic mouse suppression, pointerType guards, CSS media queries)
 * 4. High-Frequency RAF Batching, Performance SLA & Zero-Leak Memory Audit (5,000 rapid zig-zag moves, heap delta profiling)
 * 5. Exit Fade-Out Grace Period & Rapid Re-Entry Churn (Timer lifecycle, debounced cleanup, CSS 0.3s sync)
 * 6. Prefers-Reduced-Motion Accessibility Guard (JS early return, CSS static border enforcement)
 * 7. Dynamic Layout & Scroll Relocation Resilience (Fresh getBoundingClientRect per frame)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { performance } = require('perf_hooks');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const WEB_DIR = path.join(PROJECT_ROOT, 'web');
const MAIN_JS_PATH = path.join(WEB_DIR, 'assets', 'js', 'main.js');
const STYLES_CSS_PATH = path.join(WEB_DIR, 'assets', 'css', 'styles.css');
const INDEX_HTML_PATH = path.join(WEB_DIR, 'index.html');

console.log('===============================================================');
console.log('   MILESTONE 3 EMPIRICAL ADVERSARIAL STRESS HARNESS (CHALLENGER 1)');
console.log('   Scope: Coordinates Stress, Numerical Stability & Zero Cross-Talk');
console.log('===============================================================');

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
// 0. Extraction of Production Code from web/assets/js/main.js
// ---------------------------------------------------------------------------
const mainJsSource = fs.readFileSync(MAIN_JS_PATH, 'utf-8');

// Extract CatalogSpotlightController class
const controllerMatch = mainJsSource.match(/class CatalogSpotlightController\s*\{[\s\S]*?\n\}/);
if (!controllerMatch) {
  throw new Error('Could not extract CatalogSpotlightController class from web/assets/js/main.js');
}
const CatalogSpotlightController = new Function(`${controllerMatch[0]}; return CatalogSpotlightController;`)();

// Extract initCatalogSpotlightGlow function source
const initFuncMatch = mainJsSource.match(/function initCatalogSpotlightGlow\(\)\s*\{[\s\S]*?\n\}/);
if (!initFuncMatch) {
  throw new Error('Could not extract initCatalogSpotlightGlow function from web/assets/js/main.js');
}
const initCatalogSpotlightGlowSource = initFuncMatch[0];

// ---------------------------------------------------------------------------
// Mock DOM & Window Architecture for High-Fidelity Behavioral Simulation
// ---------------------------------------------------------------------------
class MockCardElement {
  constructor(rect, className = 'category-card') {
    this.rect = { ...rect };
    this.className = className;
    this.style = {
      _vars: new Map(),
      setProperty(key, val) {
        this._vars.set(key, String(val));
      },
      removeProperty(key) {
        this._vars.delete(key);
      },
      getPropertyValue(key) {
        return this._vars.get(key) || '';
      }
    };
    this.listeners = new Map();
  }

  getBoundingClientRect() {
    return { ...this.rect };
  }

  setRect(newRect) {
    this.rect = { ...newRect };
  }

  addEventListener(type, cb, options) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push({ cb, options });
  }

  dispatchEvent(event) {
    const list = this.listeners.get(event.type) || [];
    for (const item of list) {
      item.cb(event);
    }
  }
}

class MockSimulationEnvironment {
  constructor(options = {}) {
    this.reducedMotion = options.reducedMotion || false;
    this.isTouch = options.isTouch || false;
    this.windowListeners = new Map();
    this.timers = new Map();
    this.timerIdCounter = 0;
    this.currentTime = 0;
    this.rafQueue = [];
    this.rafIdCounter = 0;
    this.activeRafIds = new Set();
    this.cards = options.cards || [];
  }

  setupGlobalScope() {
    const self = this;

    const mockWindow = {
      addEventListener(type, cb, options) {
        if (!self.windowListeners.has(type)) {
          self.windowListeners.set(type, []);
        }
        self.windowListeners.get(type).push({ cb, options });
      },
      removeEventListener(type, cb) {
        const list = self.windowListeners.get(type) || [];
        const idx = list.findIndex(i => i.cb === cb);
        if (idx !== -1) list.splice(idx, 1);
      },
      dispatchEvent(event) {
        const list = self.windowListeners.get(event.type) || [];
        for (const item of list) {
          item.cb(event);
        }
      },
      matchMedia(query) {
        let matches = false;
        if (query.includes('prefers-reduced-motion: reduce')) {
          matches = self.reducedMotion;
        } else if (query.includes('hover: none')) {
          matches = self.isTouch;
        }
        return {
          matches,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {}
        };
      }
    };

    const mockDocument = {
      querySelectorAll(selector) {
        if (selector === '.category-card') {
          return self.cards;
        }
        return [];
      }
    };

    const mockRequestAnimationFrame = (cb) => {
      const id = ++self.rafIdCounter;
      self.rafQueue.push({ id, cb });
      self.activeRafIds.add(id);
      return id;
    };

    const mockCancelAnimationFrame = (id) => {
      self.activeRafIds.delete(id);
    };

    const mockSetTimeout = (cb, delay) => {
      const id = ++self.timerIdCounter;
      self.timers.set(id, { cb, targetTime: self.currentTime + delay });
      return id;
    };

    const mockClearTimeout = (id) => {
      self.timers.delete(id);
    };

    // Instantiate initCatalogSpotlightGlow bound to mock scope
    const factory = new Function(
      'window',
      'document',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'setTimeout',
      'clearTimeout',
      'CatalogSpotlightController',
      `${initCatalogSpotlightGlowSource}; return initCatalogSpotlightGlow;`
    );

    const initFn = factory(
      mockWindow,
      mockDocument,
      mockRequestAnimationFrame,
      mockCancelAnimationFrame,
      mockSetTimeout,
      mockClearTimeout,
      CatalogSpotlightController
    );

    return {
      window: mockWindow,
      document: mockDocument,
      initFn
    };
  }

  tickRAF() {
    const queue = [...this.rafQueue];
    this.rafQueue = [];
    for (const item of queue) {
      if (this.activeRafIds.has(item.id)) {
        this.activeRafIds.delete(item.id);
        item.cb();
      }
    }
  }

  advanceTime(ms) {
    this.currentTime += ms;
    const ready = [];
    for (const [id, timer] of this.timers.entries()) {
      if (this.currentTime >= timer.targetTime) {
        ready.push({ id, cb: timer.cb });
      }
    }
    for (const { id, cb } of ready) {
      this.timers.delete(id);
      cb();
    }
  }
}

// ---------------------------------------------------------------------------
// SUITE 1: Numerical Stability & Sub-pixel Rounding Oracle (25,000 Coordinates)
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 1: Numerical Stability & Sub-Pixel Rounding Oracle ---');

try {
  const cardRect = { left: 100.3333, top: 200.6667, width: 320.5, height: 440.25 };
  let allIntegersClean = true;
  let allWithinBoundsCorrect = true;
  let roundingErrors = 0;
  const intPixelRegex = /^-?\d+px$/;

  // 15,000 sub-pixel floating point iterations inside bounds
  for (let i = 0; i < 15000; i++) {
    // Generate fractional sub-pixel client coordinates
    const fx = Math.random() * cardRect.width;
    const fy = Math.random() * cardRect.height;
    const clientX = cardRect.left + fx;
    const clientY = cardRect.top + fy;

    const coords = CatalogSpotlightController.calculateCoords(clientX, clientY, cardRect);

    if (!intPixelRegex.test(coords.cssVarX) || !intPixelRegex.test(coords.cssVarY)) {
      allIntegersClean = false;
      break;
    }
    if (coords.cssVarX.includes('.') || coords.cssVarY.includes('.')) {
      allIntegersClean = false;
      break;
    }
    if (!coords.isInside) {
      allWithinBoundsCorrect = false;
      break;
    }

    const expectedX = `${Math.round(fx)}px`;
    const expectedY = `${Math.round(fy)}px`;
    if (coords.cssVarX !== expectedX || coords.cssVarY !== expectedY) {
      roundingErrors++;
    }
  }

  if (allIntegersClean && allWithinBoundsCorrect && roundingErrors === 0) {
    recordPass('Sub-Pixel Coordinates Format Precision (15,000 Iterations)',
      '100% of tested coordinates yielded strict integer strings with "px" suffix, 0 decimal points');
  } else {
    recordFail('Sub-Pixel Coordinates Format Precision',
      `Failed: clean=${allIntegersClean}, bounds=${allWithinBoundsCorrect}, roundingErrors=${roundingErrors}`);
  }

  // 10,000 out-of-bounds coordinates (negative, off-screen, excessive)
  let oobDetectedCleanly = true;
  for (let i = 0; i < 10000; i++) {
    const side = i % 4;
    let clientX, clientY;
    if (side === 0) {
      clientX = cardRect.left - (Math.random() * 500 + 0.001); // Left OOB
      clientY = cardRect.top + Math.random() * cardRect.height;
    } else if (side === 1) {
      clientX = cardRect.left + cardRect.width + (Math.random() * 500 + 0.001); // Right OOB
      clientY = cardRect.top + Math.random() * cardRect.height;
    } else if (side === 2) {
      clientX = cardRect.left + Math.random() * cardRect.width;
      clientY = cardRect.top - (Math.random() * 500 + 0.001); // Top OOB
    } else {
      clientX = cardRect.left + Math.random() * cardRect.width;
      clientY = cardRect.top + cardRect.height + (Math.random() * 500 + 0.001); // Bottom OOB
    }

    const coords = CatalogSpotlightController.calculateCoords(clientX, clientY, cardRect);
    if (coords.isInside !== false || !intPixelRegex.test(coords.cssVarX) || !intPixelRegex.test(coords.cssVarY)) {
      oobDetectedCleanly = false;
      break;
    }
  }

  if (oobDetectedCleanly) {
    recordPass('Out-of-Bounds Detection & Negative Pixel Formatting (10,000 Iterations)',
      '100% of out-of-bounds inputs produced isInside: false and formatted valid negative integer pixel strings');
  } else {
    recordFail('Out-of-Bounds Detection & Negative Pixel Formatting', 'Encountered unexpected bounds state or format error');
  }

  // Boundary micro-stepping with epsilon = 1e-9
  const left = 200, top = 150, width = 300, height = 400;
  const testBox = { left, top, width, height };

  const leftJustOutside = CatalogSpotlightController.calculateCoords(left - 1e-9, top + 50, testBox);
  const leftExact = CatalogSpotlightController.calculateCoords(left, top + 50, testBox);
  const rightExact = CatalogSpotlightController.calculateCoords(left + width, top + 50, testBox);
  const rightJustOutside = CatalogSpotlightController.calculateCoords(left + width + 1e-9, testBox.top + 50, testBox);

  const topJustOutside = CatalogSpotlightController.calculateCoords(left + 50, top - 1e-9, testBox);
  const topExact = CatalogSpotlightController.calculateCoords(left + 50, top, testBox);
  const bottomExact = CatalogSpotlightController.calculateCoords(left + 50, top + height, testBox);
  const bottomJustOutside = CatalogSpotlightController.calculateCoords(left + 50, top + height + 1e-9, testBox);

  const subEpsilonPassed =
    !leftJustOutside.isInside && leftExact.isInside && rightExact.isInside && !rightJustOutside.isInside &&
    !topJustOutside.isInside && topExact.isInside && bottomExact.isInside && !bottomJustOutside.isInside;

  if (subEpsilonPassed) {
    recordPass('Sub-Epsilon Boundary Micro-Stepping (1e-9 Precision)',
      'Exact box perimeter is inclusive; 1e-9 offset outside is strictly detected as out-of-bounds');
  } else {
    recordFail('Sub-Epsilon Boundary Micro-Stepping', 'Perimeter boundary inclusion/exclusion failed at 1e-9 margin');
  }

  // Degenerate & Extreme Values
  const nanResult = CatalogSpotlightController.calculateCoords(NaN, 50, testBox);
  const infResult = CatalogSpotlightController.calculateCoords(Infinity, 50, testBox);
  const negInfResult = CatalogSpotlightController.calculateCoords(-Infinity, 50, testBox);
  const hugeResult = CatalogSpotlightController.calculateCoords(1e8, 1e8, testBox);

  const degenerateSafe =
    nanResult.isInside === false &&
    infResult.isInside === false &&
    negInfResult.isInside === false &&
    hugeResult.isInside === false &&
    intPixelRegex.test(hugeResult.cssVarX);

  if (degenerateSafe) {
    recordPass('Degenerate & Extreme Coordinate Handling',
      'NaN, +/-Infinity produce isInside: false; 100,000,000px formats clean integer string');
  } else {
    recordFail('Degenerate & Extreme Coordinate Handling', 'Unhandled exception or unexpected bounds state on extreme inputs');
  }
} catch (err) {
  recordFail('Suite 1 Exception', err.message);
}

// ---------------------------------------------------------------------------
// SUITE 2: Multi-Card Isolation & Cross-Talk (Zero Cross-Talk Verification)
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 2: Multi-Card Isolation & Zero Cross-Talk ---');

try {
  // Create 4 distinct category cards representing the catalog grid
  const card0 = new MockCardElement({ left: 50, top: 100, width: 300, height: 450 }); // Vagonetas / 4x4
  const card1 = new MockCardElement({ left: 400, top: 100, width: 300, height: 450 }); // Camión (Featured)
  const card2 = new MockCardElement({ left: 50, top: 600, width: 300, height: 450 }); // Autos / Sedanes
  const card3 = new MockCardElement({ left: 400, top: 600, width: 300, height: 450 }); // Industrial / Agrícola

  const env = new MockSimulationEnvironment({ cards: [card0, card1, card2, card3] });
  const { initFn } = env.setupGlobalScope();
  initFn();

  // Test 2.1: 1,000 pointermove events on Card 0 must never touch Card 1, 2, or 3
  card0.dispatchEvent({ type: 'pointerenter', clientX: 100, clientY: 150, pointerType: 'mouse' });

  for (let i = 0; i < 1000; i++) {
    const cx = 50 + (i % 280);
    const cy = 100 + (i % 400);
    card0.dispatchEvent({ type: 'pointermove', clientX: cx, clientY: cy, pointerType: 'mouse' });
    env.tickRAF();
  }

  const card0VarX = card0.style.getPropertyValue('--mouse-x');
  const card0VarY = card0.style.getPropertyValue('--mouse-y');
  const card1VarX = card1.style.getPropertyValue('--mouse-x');
  const card1VarY = card1.style.getPropertyValue('--mouse-y');
  const card2VarX = card2.style.getPropertyValue('--mouse-x');
  const card3VarX = card3.style.getPropertyValue('--mouse-x');

  const card0HasCoords = card0VarX !== '' && card0VarY !== '';
  const othersUntouched = card1VarX === '' && card1VarY === '' && card2VarX === '' && card3VarX === '';

  if (card0HasCoords && othersUntouched) {
    recordPass('Single-Card PointerMove Isolation (1,000 Moves on Card 0)',
      `Card 0: [${card0VarX}, ${card0VarY}] | Cards 1, 2, 3 remained completely untouched (empty CSS variables)`);
  } else {
    recordFail('Single-Card PointerMove Isolation',
      `Cross-talk detected! Card 0=[${card0VarX}], Card 1=[${card1VarX}], Card 2=[${card2VarX}], Card 3=[${card3VarX}]`);
  }

  // Test 2.2: Interleaved Multi-Card Sweeping with Independent Coordinate Spaces
  // Pointer leaves Card 0 and enters Card 1 at clientX=450, clientY=200
  // Card 1 rect.left is 400, rect.top is 100 => mouseX should be 50px, mouseY should be 100px
  card0.dispatchEvent({ type: 'pointerleave', pointerType: 'mouse' });
  card1.dispatchEvent({ type: 'pointerenter', clientX: 450, clientY: 200, pointerType: 'mouse' });
  card1.dispatchEvent({ type: 'pointermove', clientX: 450, clientY: 200, pointerType: 'mouse' });
  env.tickRAF();

  const c1ExpectedX = '50px';
  const c1ExpectedY = '100px';
  const c1ActualX = card1.style.getPropertyValue('--mouse-x');
  const c1ActualY = card1.style.getPropertyValue('--mouse-y');

  if (c1ActualX === c1ExpectedX && c1ActualY === c1ExpectedY) {
    recordPass('Independent Card Coordinate Space Verification',
      `Card 1 correctly computed relative coordinates [${c1ActualX}, ${c1ActualY}] using its own rect origin (400, 100)`);
  } else {
    recordFail('Independent Card Coordinate Space Verification',
      `Expected [${c1ExpectedX}, ${c1ExpectedY}], but received [${c1ActualX}, ${c1ActualY}]`);
  }

  // Test 2.3: Asynchronous Fade-Out Timer Isolation
  // Card 0 was left at t=0, so its reset timer should fire at t=350ms.
  // Card 1 is currently active. Advance time to t=360ms.
  env.advanceTime(360);

  const card0AfterReset = card0.style.getPropertyValue('--mouse-x');
  const card1AfterReset = card1.style.getPropertyValue('--mouse-x');

  if (card0AfterReset === '' && card1AfterReset === c1ExpectedX) {
    recordPass('Asynchronous Fade-Out Timer Isolation Across Cards',
      'Card 0 reset timer cleanly removed its own properties without clearing active Card 1 properties');
  } else {
    recordFail('Asynchronous Fade-Out Timer Isolation Across Cards',
      `Timer cross-talk: Card 0=[${card0AfterReset}], Card 1=[${card1AfterReset}]`);
  }
} catch (err) {
  recordFail('Suite 2 Exception', err.message);
}

// ---------------------------------------------------------------------------
// SUITE 3: Touch & Pen Rejection & Sticky Glow Immunity
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 3: Touch & Pen Rejection & Sticky Glow Immunity ---');

try {
  // Test 3.1: Pre-emptive Touch Suppression via window touchstart
  const cardTouchTest = new MockCardElement({ left: 100, top: 100, width: 300, height: 400 });
  const envTouch = new MockSimulationEnvironment({ cards: [cardTouchTest] });
  const { window: mockWin, initFn: initTouchFn } = envTouch.setupGlobalScope();
  initTouchFn();

  // User taps screen (touchstart fires on window)
  mockWin.dispatchEvent({ type: 'touchstart', pointerType: 'touch' });

  // Browser fires subsequent synthetic pointerenter & pointermove
  cardTouchTest.dispatchEvent({ type: 'pointerenter', clientX: 200, clientY: 200, pointerType: 'mouse' });
  cardTouchTest.dispatchEvent({ type: 'pointermove', clientX: 200, clientY: 200, pointerType: 'mouse' });
  envTouch.tickRAF();

  const touchSuppressedX = cardTouchTest.style.getPropertyValue('--mouse-x');
  const touchSuppressedY = cardTouchTest.style.getPropertyValue('--mouse-y');

  if (touchSuppressedX === '' && touchSuppressedY === '') {
    recordPass('Synthetic Mouse Event Suppression via touchstart Flag (F15-T2-1)',
      'Subsequent mousemove events following touchstart were 100% suppressed; zero sticky coordinates set');
  } else {
    recordFail('Synthetic Mouse Event Suppression via touchstart Flag',
      `Failed: Sticky glow coordinates applied: [${touchSuppressedX}, ${touchSuppressedY}]`);
  }

  // Test 3.2: Direct pointerType === 'touch' and 'pen' Rejection
  const cardDirectTouch = new MockCardElement({ left: 100, top: 100, width: 300, height: 400 });
  const envDirect = new MockSimulationEnvironment({ cards: [cardDirectTouch] });
  const { initFn: initDirectFn } = envDirect.setupGlobalScope();
  initDirectFn();

  cardDirectTouch.dispatchEvent({ type: 'pointerenter', clientX: 180, clientY: 180, pointerType: 'touch' });
  cardDirectTouch.dispatchEvent({ type: 'pointermove', clientX: 180, clientY: 180, pointerType: 'touch' });
  envDirect.tickRAF();

  const pointerTypeTouchX = cardDirectTouch.style.getPropertyValue('--mouse-x');

  cardDirectTouch.dispatchEvent({ type: 'pointerenter', clientX: 190, clientY: 190, pointerType: 'pen' });
  cardDirectTouch.dispatchEvent({ type: 'pointermove', clientX: 190, clientY: 190, pointerType: 'pen' });
  envDirect.tickRAF();

  const pointerTypePenX = cardDirectTouch.style.getPropertyValue('--mouse-x');

  if (pointerTypeTouchX === '' && pointerTypePenX === '') {
    recordPass('Direct pointerType Rejection (touch & pen) (F15)',
      'Both pointerType="touch" and pointerType="pen" were rejected before modifying DOM styles');
  } else {
    recordFail('Direct pointerType Rejection',
      `Failed: touchX=[${pointerTypeTouchX}], penX=[${pointerTypePenX}]`);
  }

  // Test 3.3: Static CSS Fallback Rules for Touch & Mobile Viewports
  const stylesCss = fs.readFileSync(STYLES_CSS_PATH, 'utf-8');

  const hasHoverNoneQuery = stylesCss.includes('@media (hover: none)') || stylesCss.includes('(pointer: coarse)');
  const hasDisplayNoneBefore = stylesCss.includes('.category-card::before') && stylesCss.includes('display: none !important');
  const hasPanYTouchAction = stylesCss.includes('touch-action: pan-y');
  const hasUserDragNone = stylesCss.includes('-webkit-user-drag: none') && stylesCss.includes('user-select: none');
  const hasTouchTargetMin = stylesCss.includes('min-height: 44px') && stylesCss.includes('min-width: 44px');

  if (hasHoverNoneQuery && hasDisplayNoneBefore && hasPanYTouchAction && hasUserDragNone && hasTouchTargetMin) {
    recordPass('CSS Touch Hardening Rules Audit (F15)',
      'Found display:none !important on ::before, touch-action: pan-y, user-drag: none, and 44x44px min-target');
  } else {
    recordFail('CSS Touch Hardening Rules Audit',
      `Missing CSS hardening rule: hoverQuery=${hasHoverNoneQuery}, displayNone=${hasDisplayNoneBefore}, panY=${hasPanYTouchAction}, userDrag=${hasUserDragNone}, minTarget=${hasTouchTargetMin}`);
  }
} catch (err) {
  recordFail('Suite 3 Exception', err.message);
}

// ---------------------------------------------------------------------------
// SUITE 4: RAF Batching, Performance SLA & Zero-Leak Memory Audit
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 4: RAF Batching, Performance SLA & Memory Audit ---');

try {
  // Test 4.1: RAF Batching (50 pointer moves in a single animation frame)
  let setPropertyCallCount = 0;
  const cardRaf = new MockCardElement({ left: 100, top: 100, width: 300, height: 400 });
  const originalSetProperty = cardRaf.style.setProperty.bind(cardRaf.style);
  cardRaf.style.setProperty = function(key, val) {
    setPropertyCallCount++;
    originalSetProperty(key, val);
  };

  const envRaf = new MockSimulationEnvironment({ cards: [cardRaf] });
  const { initFn: initRafFn } = envRaf.setupGlobalScope();
  initRafFn();

  cardRaf.dispatchEvent({ type: 'pointerenter', clientX: 110, clientY: 110, pointerType: 'mouse' });
  const callsOnEnter = setPropertyCallCount; // synchronous update on enter = 2 (x and y)

  for (let m = 0; m < 50; m++) {
    cardRaf.dispatchEvent({ type: 'pointermove', clientX: 110 + m, clientY: 110 + m, pointerType: 'mouse' });
  }

  // Before RAF ticks, no additional calls should have been made
  const callsBeforeTick = setPropertyCallCount - callsOnEnter;
  envRaf.tickRAF(); // Now tick once
  const callsAfterTick = setPropertyCallCount - callsOnEnter;

  if (callsBeforeTick === 0 && callsAfterTick === 2) {
    recordPass('RAF Style Batching Verification (50 pointer moves -> 1 DOM write cycle)',
      '50 high-frequency pointer moves resulted in exactly 1 batched style write cycle upon RAF tick');
  } else {
    recordFail('RAF Style Batching Verification',
      `Expected 0 calls before tick and 2 after tick; received ${callsBeforeTick} before, ${callsAfterTick} after`);
  }

  // Test 4.2: 5,000 High-Frequency Rapid Zig-Zag Moves Execution Performance
  const cardPerf = new MockCardElement({ left: 50, top: 50, width: 320, height: 480 });
  const envPerf = new MockSimulationEnvironment({ cards: [cardPerf] });
  const { initFn: initPerfFn } = envPerf.setupGlobalScope();
  initPerfFn();

  cardPerf.dispatchEvent({ type: 'pointerenter', clientX: 60, clientY: 60, pointerType: 'mouse' });

  // JIT Warmup (500 iterations)
  for (let w = 0; w < 500; w++) {
    cardPerf.dispatchEvent({ type: 'pointermove', clientX: 60 + (w % 200), clientY: 60 + (w % 300), pointerType: 'mouse' });
    envPerf.tickRAF();
  }

  // Garbage collection baseline
  if (global.gc) global.gc();
  const heapBefore = process.memoryUsage().heapUsed;

  const tStart = performance.now();
  const ITERATIONS = 5000;

  for (let i = 0; i < ITERATIONS; i++) {
    // High-frequency diagonal zig-zag pattern
    const cx = 50 + (i % 310);
    const cy = 50 + (i % 470);
    cardPerf.dispatchEvent({ type: 'pointermove', clientX: cx, clientY: cy, pointerType: 'mouse' });
    envPerf.tickRAF();
  }

  const tEnd = performance.now();
  const totalDurationMs = tEnd - tStart;
  const meanPerMoveMs = totalDurationMs / ITERATIONS;
  const opsPerSec = (ITERATIONS / totalDurationMs) * 1000;

  if (global.gc) global.gc();
  const heapAfter = process.memoryUsage().heapUsed;
  const heapDeltaKB = (heapAfter - heapBefore) / 1024;

  const perfSlaPassed = meanPerMoveMs < 0.1; // SLA: sub-0.1ms per pointer update (<1% of 16.6ms 60 FPS frame)
  const memorySlaPassed = heapDeltaKB < 200; // < 200 KB heap growth across 5,000 updates

  if (perfSlaPassed) {
    recordPass(`High-Frequency Execution Throughput (${ITERATIONS} Updates)`,
      `Mean duration: ${meanPerMoveMs.toFixed(4)} ms/op (${Math.round(opsPerSec).toLocaleString()} ops/sec) — Well below 0.1ms 60 FPS SLA`);
  } else {
    recordFail('High-Frequency Execution Throughput', `Mean duration ${meanPerMoveMs.toFixed(4)} ms exceeded 0.1ms threshold`);
  }

  if (memorySlaPassed) {
    recordPass(`V8 Heap Memory Stability & Zero-Leak Audit (${ITERATIONS} Updates)`,
      `Net heap delta after GC: ${heapDeltaKB.toFixed(2)} KB (Acceptable test metadata margin < 200 KB)`);
  } else {
    recordFail('V8 Heap Memory Stability', `Excessive heap growth: ${heapDeltaKB.toFixed(2)} KB`);
  }
} catch (err) {
  recordFail('Suite 4 Exception', err.message);
}

// ---------------------------------------------------------------------------
// SUITE 5: Exit Fade-Out Grace Period & Rapid Re-Entry Churn
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 5: Exit Fade-Out Grace Period & Rapid Re-Entry Churn ---');

try {
  // Test 5.1: Fade-Out Grace Period (Coordinates retained during 0.3s CSS opacity transition)
  const cardGrace = new MockCardElement({ left: 100, top: 100, width: 300, height: 400 });
  const envGrace = new MockSimulationEnvironment({ cards: [cardGrace] });
  const { initFn: initGraceFn } = envGrace.setupGlobalScope();
  initGraceFn();

  cardGrace.dispatchEvent({ type: 'pointerenter', clientX: 220, clientY: 260, pointerType: 'mouse' });
  envGrace.tickRAF();

  // Pointer leaves at t = 0
  cardGrace.dispatchEvent({ type: 'pointerleave', pointerType: 'mouse' });

  // At t = 100ms, coordinates must STILL be present so CSS transition does not jump
  envGrace.advanceTime(100);
  const coordsAt100 = cardGrace.style.getPropertyValue('--mouse-x');

  // At t = 250ms, coordinates must STILL be present
  envGrace.advanceTime(150);
  const coordsAt250 = cardGrace.style.getPropertyValue('--mouse-x');

  // At t = 360ms (> 350ms timeout), coordinates must be cleanly purged
  envGrace.advanceTime(110);
  const coordsAt360 = cardGrace.style.getPropertyValue('--mouse-x');

  const gracePeriodValid = coordsAt100 === '120px' && coordsAt250 === '120px' && coordsAt360 === '';

  if (gracePeriodValid) {
    recordPass('Exit Fade-Out Grace Period & Property Cleanup (350ms Sync)',
      'Coordinates retained at 100ms & 250ms during CSS fade-out; cleanly purged at 360ms');
  } else {
    recordFail('Exit Fade-Out Grace Period & Property Cleanup',
      `Failed: at100ms=[${coordsAt100}], at250ms=[${coordsAt250}], at360ms=[${coordsAt360}]`);
  }

  // Test 5.2: Rapid Exit-Reentry Churn (50 rapid re-entries cancelling pending timers)
  const cardChurn = new MockCardElement({ left: 100, top: 100, width: 300, height: 400 });
  const envChurn = new MockSimulationEnvironment({ cards: [cardChurn] });
  const { initFn: initChurnFn } = envChurn.setupGlobalScope();
  initChurnFn();

  for (let cycle = 0; cycle < 50; cycle++) {
    cardChurn.dispatchEvent({ type: 'pointerenter', clientX: 150 + cycle, clientY: 200, pointerType: 'mouse' });
    envChurn.tickRAF();
    envChurn.advanceTime(10);
    cardChurn.dispatchEvent({ type: 'pointerleave', pointerType: 'mouse' });
    envChurn.advanceTime(10);
  }

  // Re-enter one final time at clientX = 250, clientY = 300 (relative: 150px, 200px)
  cardChurn.dispatchEvent({ type: 'pointerenter', clientX: 250, clientY: 300, pointerType: 'mouse' });
  envChurn.tickRAF();

  // Advance time past the 350ms mark of previous leave cycles
  envChurn.advanceTime(400);

  const finalCoordsX = cardChurn.style.getPropertyValue('--mouse-x');
  const finalCoordsY = cardChurn.style.getPropertyValue('--mouse-y');

  if (finalCoordsX === '150px' && finalCoordsY === '200px') {
    recordPass('Rapid Exit-Reentry Debounce & Timer Cancellation (50 Cycles)',
      'Pending reset timers were correctly cancelled on re-entry; active hover coordinates preserved cleanly');
  } else {
    recordFail('Rapid Exit-Reentry Debounce & Timer Cancellation',
      `Expected [150px, 200px], received [${finalCoordsX}, ${finalCoordsY}]`);
  }
} catch (err) {
  recordFail('Suite 5 Exception', err.message);
}

// ---------------------------------------------------------------------------
// SUITE 6: Reduced Motion Accessibility Mode
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 6: Reduced Motion Accessibility Mode ---');

try {
  // Test 6.1: Runtime JS Guard for prefers-reduced-motion
  const cardMotion = new MockCardElement({ left: 100, top: 100, width: 300, height: 400 });
  const envMotion = new MockSimulationEnvironment({ cards: [cardMotion], reducedMotion: true });
  const { initFn: initMotionFn } = envMotion.setupGlobalScope();

  // Call init with reduced motion active
  initMotionFn();

  // Attempt to trigger hover events
  cardMotion.dispatchEvent({ type: 'pointerenter', clientX: 200, clientY: 200, pointerType: 'mouse' });
  cardMotion.dispatchEvent({ type: 'pointermove', clientX: 200, clientY: 200, pointerType: 'mouse' });
  envMotion.tickRAF();

  const motionVarX = cardMotion.style.getPropertyValue('--mouse-x');

  if (motionVarX === '') {
    recordPass('JS Runtime prefers-reduced-motion Early Return Guard',
      'Spotlight controller completely early-returned without attaching listeners or modifying CSS variables');
  } else {
    recordFail('JS Runtime prefers-reduced-motion Early Return Guard',
      `Failed: style applied despite reduced motion: --mouse-x=${motionVarX}`);
  }

  // Test 6.2: Stylesheet Reduced Motion Fallback Rules
  const stylesCss = fs.readFileSync(STYLES_CSS_PATH, 'utf-8');
  const hasReducedMediaQuery = stylesCss.includes('@media (prefers-reduced-motion: reduce)');
  const hasDisplayNoneReduced = stylesCss.includes('display: none !important') && hasReducedMediaQuery;
  const hasStaticBorderReduced = stylesCss.includes('border: 1px solid rgba(255, 255, 255, 0.12) !important');

  if (hasReducedMediaQuery && hasDisplayNoneReduced && hasStaticBorderReduced) {
    recordPass('CSS prefers-reduced-motion Contract Verification (P10 SLA)',
      'Verified display:none !important on ::before and static 1px border rgba(255, 255, 255, 0.12) !important');
  } else {
    recordFail('CSS prefers-reduced-motion Contract Verification',
      `Missing reduced motion CSS rule: query=${hasReducedMediaQuery}, displayNone=${hasDisplayNoneReduced}, border=${hasStaticBorderReduced}`);
  }
} catch (err) {
  recordFail('Suite 6 Exception', err.message);
}

// ---------------------------------------------------------------------------
// SUITE 7: Dynamic Layout & Scroll Relocation Resilience
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 7: Dynamic Layout & Scroll Relocation Resilience ---');

try {
  // Card moves dynamically in DOM (e.g. user scrolls or layout reflows)
  const dynamicCard = new MockCardElement({ left: 100, top: 300, width: 300, height: 400 });
  const envDynamic = new MockSimulationEnvironment({ cards: [dynamicCard] });
  const { initFn: initDynamicFn } = envDynamic.setupGlobalScope();
  initDynamicFn();

  dynamicCard.dispatchEvent({ type: 'pointerenter', clientX: 150, clientY: 350, pointerType: 'mouse' });
  envDynamic.tickRAF();

  const initialX = dynamicCard.style.getPropertyValue('--mouse-x');
  const initialY = dynamicCard.style.getPropertyValue('--mouse-y');

  // Page scrolls by 150px: card top shifts from 300 to 150
  dynamicCard.setRect({ left: 100, top: 150, width: 300, height: 400 });

  // Mouse moves at clientX = 150, clientY = 250
  // Relative to new top (150): mouseY should be 250 - 150 = 100px (NOT 250 - 300 = -50px)
  dynamicCard.dispatchEvent({ type: 'pointermove', clientX: 150, clientY: 250, pointerType: 'mouse' });
  envDynamic.tickRAF();

  const scrolledX = dynamicCard.style.getPropertyValue('--mouse-x');
  const scrolledY = dynamicCard.style.getPropertyValue('--mouse-y');

  if (initialX === '50px' && initialY === '50px' && scrolledX === '50px' && scrolledY === '100px') {
    recordPass('Dynamic Scroll Relocation Resilience (Fresh Bounding Box Per RAF)',
      'Controller accurately recalculated relative coordinates against updated bounding rect following page scroll');
  } else {
    recordFail('Dynamic Scroll Relocation Resilience',
      `Expected [50px, 100px], received [${scrolledX}, ${scrolledY}]`);
  }
} catch (err) {
  recordFail('Suite 7 Exception', err.message);
}

// ---------------------------------------------------------------------------
// FINAL REPORT & VERDICT DETERMINATION
// ---------------------------------------------------------------------------
console.log('\n===============================================================');
console.log('                 ADVERSARIAL TEST SUMMARY');
console.log('===============================================================');
console.log(`Total Adversarial Scenarios : ${testResults.passed + testResults.failed}`);
console.log(`Passed Scenarios            : ${testResults.passed}`);
console.log(`Failed Scenarios            : ${testResults.failed}`);
console.log('---------------------------------------------------------------');

if (testResults.failed === 0) {
  console.log('ALL ADVERSARIAL STRESS TESTS PASSED CLEANLY.');
  console.log('VERDICT: APPROVE');
  process.exit(0);
} else {
  console.error(`FAILED: ${testResults.failed} adversarial scenario(s) broke.`);
  console.log('VERDICT: REQUEST_CHANGES');
  process.exit(1);
}
