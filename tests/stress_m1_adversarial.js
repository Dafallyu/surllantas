/**
 * tests/stress_m1_adversarial.js
 * Adversarial Empirical Stress Test Suite for Milestone 1: AtmosphericParticleEngine
 * 
 * Tests:
 * 1. Hypersonic cursor displacement & teleportation
 * 2. Massive scroll deltas (+/- 50,000px)
 * 3. Extreme canvas dimensions (0x0, 1x1, 10x10, 8000x4000)
 * 4. Non-finite / malformed event inputs (NaN, Infinity, undefined)
 * 5. Rapid lifecycle transitions (visibility, observer, reduced-motion)
 * 6. Zero-GC pool stability & particle invariants over 5,000 frames
 */

const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');

// Load main.js and extract AtmosphericParticleEngine class
const mainJsPath = path.resolve(__dirname, '../web/assets/js/main.js');
const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

const engineClassMatch = mainJsContent.match(/class AtmosphericParticleEngine\s*\{[\s\S]*?\n\}/);
if (!engineClassMatch) {
  console.error('FATAL: Could not extract AtmosphericParticleEngine class from main.js');
  process.exit(1);
}

// Environment Mock Builder
function createMockEnv(initialOpts = {}) {
  let listeners = {};
  let rafIdCounter = 1;
  let activeRafCallbacks = new Map();
  let mediaListeners = [];

  const canvasStyle = { display: '' };
  const mockCtx = {
    clearRect: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    setTransform: () => {},
    scale: () => {},
    fillStyle: ''
  };

  const canvas = {
    id: 'atmospheric-overlay',
    width: initialOpts.width || 1200,
    height: initialOpts.height || 600,
    style: canvasStyle,
    getContext: (type) => (type === '2d' ? mockCtx : null),
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      right: canvas.width,
      bottom: canvas.height,
      width: canvas.width,
      height: canvas.height
    })
  };

  const hero = {
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      right: canvas.width,
      bottom: canvas.height,
      width: canvas.width,
      height: canvas.height
    })
  };

  let isReducedMotion = !!initialOpts.reducedMotion;
  const motionQuery = {
    matches: isReducedMotion,
    addEventListener: (type, cb) => mediaListeners.push(cb),
    removeEventListener: (type, cb) => {
      mediaListeners = mediaListeners.filter(l => l !== cb);
    }
  };

  let observerCallback = null;
  class MockIntersectionObserver {
    constructor(cb) {
      observerCallback = cb;
    }
    observe() {}
    disconnect() {
      observerCallback = null;
    }
  }

  // Global environment setup
  const globalScope = {
    window: {
      innerWidth: initialOpts.width || 1200,
      innerHeight: initialOpts.height || 600,
      scrollY: initialOpts.scrollY || 0,
      devicePixelRatio: initialOpts.dpr !== undefined ? initialOpts.dpr : 1,
      matchMedia: () => motionQuery,
      addEventListener: (type, cb) => {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(cb);
      },
      removeEventListener: (type, cb) => {
        if (!listeners[type]) return;
        listeners[type] = listeners[type].filter(l => l !== cb);
      }
    },
    document: {
      hidden: !!initialOpts.hidden,
      addEventListener: (type, cb) => {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(cb);
      },
      removeEventListener: (type, cb) => {
        if (!listeners[type]) return;
        listeners[type] = listeners[type].filter(l => l !== cb);
      }
    },
    IntersectionObserver: MockIntersectionObserver,
    requestAnimationFrame: (cb) => {
      const id = rafIdCounter++;
      activeRafCallbacks.set(id, cb);
      return id;
    },
    cancelAnimationFrame: (id) => {
      activeRafCallbacks.delete(id);
    }
  };

  // Compile AtmosphericParticleEngine in isolated sandbox
  const factory = new Function(
    'window',
    'document',
    'IntersectionObserver',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    `${engineClassMatch[0]}; return AtmosphericParticleEngine;`
  );

  const EngineClass = factory(
    globalScope.window,
    globalScope.document,
    globalScope.IntersectionObserver,
    globalScope.requestAnimationFrame,
    globalScope.cancelAnimationFrame
  );

  return {
    EngineClass,
    canvas,
    hero,
    globalScope,
    listeners,
    motionQuery,
    setReducedMotion: (val) => {
      motionQuery.matches = val;
      mediaListeners.forEach(l => l({ matches: val }));
    },
    triggerObserver: (isIntersecting) => {
      if (observerCallback) {
        observerCallback([{ isIntersecting }]);
      }
    },
    triggerVisibility: (hidden) => {
      globalScope.document.hidden = hidden;
      (listeners['visibilitychange'] || []).forEach(cb => cb());
    },
    triggerPointerMove: (e) => {
      (listeners['pointermove'] || []).forEach(cb => cb(e));
    },
    triggerPointerLeave: () => {
      (listeners['pointerleave'] || []).forEach(cb => cb());
    },
    triggerScroll: (newScrollY) => {
      globalScope.window.scrollY = newScrollY;
      (listeners['scroll'] || []).forEach(cb => cb());
    },
    triggerResize: (newWidth, newHeight) => {
      globalScope.window.innerWidth = newWidth;
      globalScope.window.innerHeight = newHeight;
      canvas.width = newWidth;
      canvas.height = newHeight;
      (listeners['resize'] || []).forEach(cb => cb());
    },
    flushRaf: (count = 1) => {
      for (let i = 0; i < count; i++) {
        if (activeRafCallbacks.size === 0) break;
        const currentEntries = Array.from(activeRafCallbacks.entries());
        activeRafCallbacks.clear();
        for (const [id, cb] of currentEntries) {
          cb();
        }
      }
    },
    getActiveRafCount: () => activeRafCallbacks.size
  };
}

// Test Runner
const results = [];
function test(name, fn) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    results.push({ name, passed: false, error: err });
    console.error(`  ✖ [FAIL] ${name}\n    ${err.stack || err.message}`);
  }
}

console.log('================================================================');
console.log('  ADVERSARIAL EMPIRICAL STRESS SUITE: AtmosphericParticleEngine');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: Hypersonic Cursor & Spatial Jump Stress
// -----------------------------------------------------------------------------
console.log('▶ Suite 1: Hypersonic Cursor & Spatial Jump Stress');

test('S1.1: Hypersonic cursor teleportation (+50,000px) does not induce runaway velocity explosion or NaN', () => {
  const env = createMockEnv({ width: 1440, height: 900 });
  const engine = new env.EngineClass(env.canvas, env.hero);
  engine.init();
  env.flushRaf(5);

  // Initial hover at center
  env.triggerPointerMove({ clientX: 720, clientY: 450 });
  env.flushRaf(5);

  // Hypersonic teleportation to distant space (+50,000px)
  env.triggerPointerMove({ clientX: 50000, clientY: 50000 });
  env.flushRaf(1);

  // Check all particles: finite numbers, no NaN, no runaway divergence
  for (let i = 0; i < engine.activeCount; i++) {
    const p = engine.particles[i];
    assert.ok(Number.isFinite(p.vx), `Particle ${i} vx is non-finite: ${p.vx}`);
    assert.ok(Number.isFinite(p.vy), `Particle ${i} vy is non-finite: ${p.vy}`);
    assert.ok(Number.isFinite(p.x), `Particle ${i} x is non-finite: ${p.x}`);
    assert.ok(Number.isFinite(p.y), `Particle ${i} y is non-finite: ${p.y}`);
  }

  // Teleport to negative extreme (-50,000px)
  env.triggerPointerMove({ clientX: -50000, clientY: -50000 });
  env.flushRaf(1);

  for (let i = 0; i < engine.activeCount; i++) {
    const p = engine.particles[i];
    assert.ok(Number.isFinite(p.vx), `Particle ${i} vx is non-finite: ${p.vx}`);
    assert.ok(Number.isFinite(p.vy), `Particle ${i} vy is non-finite: ${p.vy}`);
    assert.ok(Number.isFinite(p.x), `Particle ${i} x is non-finite: ${p.x}`);
    assert.ok(Number.isFinite(p.y), `Particle ${i} y is non-finite: ${p.y}`);
  }

  // Allow 100 frames (~1.6s) for viscous damping (0.94^100 ~= 0.002) to decay velocities back to equilibrium
  env.triggerPointerLeave();
  env.flushRaf(100);

  for (let i = 0; i < engine.activeCount; i++) {
    const p = engine.particles[i];
    assert.ok(Math.abs(p.vx) < 0.5, `Particle ${i} vx failed to damp to ambient: ${p.vx}`);
    assert.ok(Math.abs(p.vy) < 0.5, `Particle ${i} vy failed to damp to ambient: ${p.vy}`);
  }

  engine.destroy();
});

test('S1.2: 1,000 rapid cursor position changes smoothly dissipate under viscous damping', () => {
  const env = createMockEnv({ width: 1440, height: 900 });
  const engine = new env.EngineClass(env.canvas, env.hero);
  engine.init();

  for (let step = 0; step < 1000; step++) {
    const x = Math.sin(step) * 1000 + 720;
    const y = Math.cos(step) * 800 + 450;
    env.triggerPointerMove({ clientX: x, clientY: y });
    env.flushRaf(1);
  }

  // Cease movement and let settle for 60 frames
  env.triggerPointerLeave();
  env.flushRaf(60);

  // All particles must return to ambient speeds
  for (let i = 0; i < engine.activeCount; i++) {
    const p = engine.particles[i];
    assert.ok(Number.isFinite(p.x), `p.x is NaN: ${p.x}`);
    assert.ok(Number.isFinite(p.y), `p.y is NaN: ${p.y}`);
    assert.ok(Math.abs(p.vx) < 0.5, `p.vx failed to damp to ambient: ${p.vx}`);
    assert.ok(Math.abs(p.vy) < 0.5, `p.vy failed to damp to ambient: ${p.vy}`);
  }
  engine.destroy();
});

// -----------------------------------------------------------------------------
// Suite 2: Extreme Scroll Delta Stress
// -----------------------------------------------------------------------------
console.log('\n▶ Suite 2: Extreme Scroll Delta Stress');

test('S2.1: Massive scroll delta (+/- 50,000px) is clamped per frame without vertical runaway', () => {
  const env = createMockEnv({ width: 1440, height: 900, scrollY: 0 });
  const engine = new env.EngineClass(env.canvas, env.hero);
  engine.init();
  env.flushRaf(2);

  // Instant scroll jump of 50,000px
  env.triggerScroll(50000);
  assert.strictEqual(engine.scrollDelta, 50000);

  // One frame tick: appliedScroll should be clamped to 60
  env.flushRaf(1);
  assert.strictEqual(engine.scrollDelta, 50000 - 60);

  // Check particle vertical velocities: max impulse applied per frame <= 60 * 0.035 * 1.0 = 2.1
  for (let i = 0; i < engine.activeCount; i++) {
    const p = engine.particles[i];
    assert.ok(Number.isFinite(p.vy), `Particle ${i} vy is NaN`);
    assert.ok(Math.abs(p.vy) <= 3.0, `Particle ${i} vy spike exceeded clamp threshold: ${p.vy}`);
  }

  // Instant negative scroll jump of -100,000px
  env.triggerScroll(-50000); // delta = -100,000
  env.flushRaf(1);

  for (let i = 0; i < engine.activeCount; i++) {
    const p = engine.particles[i];
    assert.ok(Number.isFinite(p.vy), `Particle ${i} vy is NaN`);
    assert.ok(Math.abs(p.vy) <= 3.0, `Particle ${i} vy spike exceeded clamp threshold: ${p.vy}`);
  }
  engine.destroy();
});

test('S2.2: Continuous scroll completely drains accumulated delta without memory/state leak', () => {
  const env = createMockEnv({ width: 1440, height: 900, scrollY: 0 });
  const engine = new env.EngineClass(env.canvas, env.hero);
  engine.init();

  env.triggerScroll(6000);
  // Drain 6000px: 100 frames at 60/frame, then 30 frames of 0.5x exponential decay
  env.flushRaf(130);

  assert.ok(Math.abs(engine.scrollDelta) < 0.001, `scrollDelta failed to drain: ${engine.scrollDelta}`);
  engine.destroy();
});

// -----------------------------------------------------------------------------
// Suite 3: Extreme Canvas Dimensions & Boundary Coordinates
// -----------------------------------------------------------------------------
console.log('\n▶ Suite 3: Extreme Canvas Dimensions & Boundary Coordinates');

test('S3.1: Canvas resize to 0x0 is handled safely without division by zero or NaN', () => {
  const env = createMockEnv({ width: 1440, height: 900 });
  const engine = new env.EngineClass(env.canvas, env.hero);
  engine.init();
  env.flushRaf(5);

  // Resize to 0x0
  env.triggerResize(0, 0);
  env.flushRaf(10);

  for (let i = 0; i < engine.activeCount; i++) {
    const p = engine.particles[i];
    assert.ok(Number.isFinite(p.x), `Particle ${i} x is non-finite at 0x0: ${p.x}`);
    assert.ok(Number.isFinite(p.y), `Particle ${i} y is non-finite at 0x0: ${p.y}`);
  }
  engine.destroy();
});

test('S3.2: Canvas resize to micro dimensions (10x10) wraps particles correctly within boundary margins', () => {
  const env = createMockEnv({ width: 1440, height: 900 });
  const engine = new env.EngineClass(env.canvas, env.hero);
  engine.init();

  env.triggerResize(10, 10);
  env.flushRaf(100);

  const margin = 20;
  for (let i = 0; i < engine.activeCount; i++) {
    const p = engine.particles[i];
    assert.ok(Number.isFinite(p.x), `Particle ${i} x is NaN`);
    assert.ok(Number.isFinite(p.y), `Particle ${i} y is NaN`);
    assert.ok(p.x >= -margin - 5 && p.x <= 10 + margin + 5, `Particle x escaped boundary: ${p.x}`);
    assert.ok(p.y >= -margin - 5 && p.y <= 10 + margin + 5, `Particle y escaped boundary: ${p.y}`);
  }
  engine.destroy();
});

test('S3.3: Massive 8000x4000 canvas maintains bounded DPR scaling and particle distribution', () => {
  const env = createMockEnv({ width: 8000, height: 4000, dpr: 3.5 });
  const engine = new env.EngineClass(env.canvas, env.hero);
  engine.init();

  assert.strictEqual(engine.dpr, 2, 'DPR must be clamped to 2 even on 3.5x displays');
  assert.strictEqual(env.canvas.width, 16000);
  assert.strictEqual(env.canvas.height, 8000);

  env.flushRaf(10);
  for (let i = 0; i < engine.activeCount; i++) {
    const p = engine.particles[i];
    assert.ok(Number.isFinite(p.x));
    assert.ok(Number.isFinite(p.y));
  }
  engine.destroy();
});

// -----------------------------------------------------------------------------
// Suite 4: Non-Finite / Malformed Event Fuzzing
// -----------------------------------------------------------------------------
console.log('\n▶ Suite 4: Non-Finite / Malformed Event Fuzzing');

test('S4.1: PointerMove with NaN/undefined/Infinity does not corrupt particle coordinates', () => {
  const env = createMockEnv({ width: 1440, height: 900 });
  const engine = new env.EngineClass(env.canvas, env.hero);
  engine.init();
  env.flushRaf(5);

  // Fuzzing inputs
  const fuzzedEvents = [
    { clientX: NaN, clientY: 200 },
    { clientX: 300, clientY: NaN },
    { clientX: Infinity, clientY: -Infinity },
    { clientX: undefined, clientY: undefined },
    { clientX: null, clientY: null },
    { clientX: 'invalid', clientY: {} },
    {}
  ];

  for (const ev of fuzzedEvents) {
    env.triggerPointerMove(ev);
    env.flushRaf(3);
  }

  // Verify particle state
  for (let i = 0; i < engine.activeCount; i++) {
    const p = engine.particles[i];
    assert.ok(Number.isFinite(p.x), `Particle ${i} x became NaN after fuzzing: ${p.x}`);
    assert.ok(Number.isFinite(p.y), `Particle ${i} y became NaN after fuzzing: ${p.y}`);
    assert.ok(Number.isFinite(p.vx), `Particle ${i} vx became NaN after fuzzing: ${p.vx}`);
    assert.ok(Number.isFinite(p.vy), `Particle ${i} vy became NaN after fuzzing: ${p.vy}`);
  }

  // Recovery: send valid pointer leave and pointer move
  env.triggerPointerLeave();
  env.flushRaf(5);
  env.triggerPointerMove({ clientX: 500, clientY: 400 });
  env.flushRaf(5);

  assert.ok(Number.isFinite(engine.mouse.currentX), 'Mouse currentX must recover to finite number');
  assert.ok(Number.isFinite(engine.mouse.currentY), 'Mouse currentY must recover to finite number');
  engine.destroy();
});

test('S4.2: Window scroll with NaN does not induce NaN contamination in scrollDelta or particle velocities', () => {
  const env = createMockEnv({ width: 1440, height: 900, scrollY: 100 });
  const engine = new env.EngineClass(env.canvas, env.hero);
  engine.init();

  env.triggerScroll(NaN);
  env.flushRaf(5);

  for (let i = 0; i < engine.activeCount; i++) {
    const p = engine.particles[i];
    assert.ok(Number.isFinite(p.y), `Particle ${i} y became NaN after NaN scroll: ${p.y}`);
    assert.ok(Number.isFinite(p.vy), `Particle ${i} vy became NaN after NaN scroll: ${p.vy}`);
  }
  engine.destroy();
});

// -----------------------------------------------------------------------------
// Suite 5: Rapid Lifecycle Transitions & Observer Jitter
// -----------------------------------------------------------------------------
console.log('\n▶ Suite 5: Rapid Lifecycle Transitions & Observer Jitter');

test('S5.1: Rapid visibility toggling (200x) maintains exactly single RAF and prevents loop leaks', () => {
  const env = createMockEnv({ width: 1440, height: 900 });
  const engine = new env.EngineClass(env.canvas, env.hero);
  engine.init();

  assert.strictEqual(env.getActiveRafCount(), 1, 'Initial state must have exactly 1 active RAF callback');

  // Toggle visibility rapidly
  for (let i = 0; i < 200; i++) {
    env.triggerVisibility(i % 2 === 0);
  }

  // If document.hidden is true, active RAF count must be 0
  env.triggerVisibility(true);
  assert.strictEqual(env.getActiveRafCount(), 0, 'Hidden tab must cancel RAF');
  assert.strictEqual(engine.isRunning, false);

  // Restore visibility
  env.triggerVisibility(false);
  assert.strictEqual(env.getActiveRafCount(), 1, 'Restored visibility must request exactly 1 RAF');
  assert.strictEqual(engine.isRunning, true);

  engine.destroy();
  assert.strictEqual(env.getActiveRafCount(), 0, 'Destroy must cancel RAF');
});

test('S5.2: Rapid IntersectionObserver toggling (200x) stops/resumes ticker cleanly', () => {
  const env = createMockEnv({ width: 1440, height: 900 });
  const engine = new env.EngineClass(env.canvas, env.hero);
  engine.init();

  for (let i = 0; i < 200; i++) {
    env.triggerObserver(i % 2 === 0);
  }

  // When scrolled away
  env.triggerObserver(false);
  assert.strictEqual(engine.isRunning, false);
  assert.strictEqual(env.getActiveRafCount(), 0);

  // When scrolled into view
  env.triggerObserver(true);
  assert.strictEqual(engine.isRunning, true);
  assert.strictEqual(env.getActiveRafCount(), 1);

  engine.destroy();
});

test('S5.3: Rapid reduced-motion changes deactivates loop, hides canvas, and recovers without double ticking', () => {
  const env = createMockEnv({ width: 1440, height: 900 });
  const engine = new env.EngineClass(env.canvas, env.hero);
  engine.init();

  for (let i = 0; i < 100; i++) {
    env.setReducedMotion(i % 2 === 0);
  }

  // Enable reduced motion
  env.setReducedMotion(true);
  assert.strictEqual(engine.isRunning, false);
  assert.strictEqual(env.canvas.style.display, 'none');
  assert.strictEqual(env.getActiveRafCount(), 0);

  // Disable reduced motion
  env.setReducedMotion(false);
  assert.strictEqual(engine.isRunning, true);
  assert.strictEqual(env.canvas.style.display, '');
  assert.strictEqual(env.getActiveRafCount(), 1);

  engine.destroy();
});

// -----------------------------------------------------------------------------
// Suite 6: Particle Pool Zero-GC & Invariants over 5,000 frames
// -----------------------------------------------------------------------------
console.log('\n▶ Suite 6: Particle Pool Zero-GC & Invariants over 5,000 frames');

test('S6.1: 5,000 continuous simulation frames maintain 100% finite coordinates, zero GC allocations, and correct pool throttling', () => {
  const env = createMockEnv({ width: 1440, height: 900 });
  const engine = new env.EngineClass(env.canvas, env.hero);
  engine.init();

  const initialParticleRefs = [...engine.particles];
  assert.strictEqual(initialParticleRefs.length, 70);

  let mouseX = 720;
  let mouseY = 450;
  let scroll = 0;

  for (let frame = 0; frame < 5000; frame++) {
    // Dynamic viewport resize oscillation
    if (frame === 1000) {
      env.triggerResize(390, 844); // Mobile
      assert.strictEqual(engine.activeCount, 25);
    } else if (frame === 2500) {
      env.triggerResize(1920, 1080); // Desktop
      assert.strictEqual(engine.activeCount, 70);
    }

    // Dynamic mouse oscillation
    if (frame % 5 === 0) {
      mouseX += (Math.random() - 0.5) * 80;
      mouseY += (Math.random() - 0.5) * 60;
      env.triggerPointerMove({ clientX: mouseX, clientY: mouseY });
    }

    // Dynamic scroll oscillation
    if (frame % 30 === 0) {
      scroll += (Math.random() - 0.5) * 200;
      env.triggerScroll(scroll);
    }

    env.flushRaf(1);

    // Verify particle reference identity (zero object recreation in pool)
    for (let i = 0; i < 70; i++) {
      assert.strictEqual(engine.particles[i], initialParticleRefs[i], `Particle object ${i} was re-allocated!`);
    }
  }

  // Verify all particles post-simulation
  for (let i = 0; i < engine.activeCount; i++) {
    const p = engine.particles[i];
    assert.ok(Number.isFinite(p.x), `p[${i}].x is non-finite: ${p.x}`);
    assert.ok(Number.isFinite(p.y), `p[${i}].y is non-finite: ${p.y}`);
    assert.ok(Number.isFinite(p.vx), `p[${i}].vx is non-finite: ${p.vx}`);
    assert.ok(Number.isFinite(p.vy), `p[${i}].vy is non-finite: ${p.vy}`);
    assert.ok(p.z >= 0.30 && p.z <= 1.00, `p[${i}].z out of range: ${p.z}`);
    assert.ok(p.radius > 0, `p[${i}].radius invalid: ${p.radius}`);
    assert.ok(p.style.startsWith('rgba('), `p[${i}].style invalid: ${p.style}`);
  }

  engine.destroy();
});

console.log('\n================================================================');
console.log('                 ADVERSARIAL STRESS TEST SUMMARY');
console.log('================================================================');
const total = results.length;
const passed = results.filter(r => r.passed).length;
const failed = total - passed;
console.log(`Total Scenarios Executed : ${total}`);
console.log(`Passed Scenarios         : ${passed}`);
console.log(`Failed Scenarios         : ${failed}`);
console.log(`Status                   : ${failed === 0 ? 'ALL ADVERSARIAL STRESS TESTS PASSED' : 'FAILURES DETECTED'}`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
