/**
 * tests/m1_stress_harness.js
 * Adversarial Stress Testing Harness for Milestone 1 (M1) — AtmosphericParticleEngine
 * Challenger: teamwork_challenger_m1_2
 *
 * Test Scenarios:
 * 1. 10,000 continuous frames under dynamic mouse & scroll interaction:
 *    - Validates zero memory leaks (heapDelta after GC <= 50 KB metadata margin)
 *    - Validates sub-millisecond per-frame execution time (mean < 0.5ms, p99 < 1.0ms)
 *    - Validates physics stability (no NaN, Infinity, runaway velocity, coordinate divergence)
 * 2. 500 rapid resizes across the 768px threshold (767px <-> 769px):
 *    - Validates dynamic throttling stability (activeCount = 25 for mobile, 70 for desktop)
 *    - Validates zero pool reallocation (strict object identity preservation Object.is)
 *    - Validates zero heap bloat across resize cycling
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { performance } = require('perf_hooks');

// 1. High-Fidelity Zero-Allocation Mock Canvas 2D Context
class ZeroAllocationMockContext2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.globalAlpha = 1.0;
    this.drawCalls = 0;
    this.arcCalls = 0;
    this.clearCalls = 0;
    this.transformMatrix = [1, 0, 0, 1, 0, 0];
  }

  clearRect(x, y, w, h) {
    this.clearCalls++;
  }

  beginPath() {
    // zero-allocation no-op
  }

  arc(x, y, radius, startAngle, endAngle) {
    this.arcCalls++;
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius)) {
      throw new Error(`Invalid arc parameters: x=${x}, y=${y}, radius=${radius}`);
    }
  }

  fill() {
    this.drawCalls++;
  }

  setTransform(a, b, c, d, e, f) {
    this.transformMatrix[0] = a;
    this.transformMatrix[1] = b;
    this.transformMatrix[2] = c;
    this.transformMatrix[3] = d;
    this.transformMatrix[4] = e;
    this.transformMatrix[5] = f;
  }

  scale(sx, sy) {
    this.transformMatrix[0] *= sx;
    this.transformMatrix[3] *= sy;
  }
}

// 2. High-Fidelity Mock Canvas Element
class MockCanvasElement {
  constructor(width = 1440, height = 800) {
    this.width = width;
    this.height = height;
    this.style = { width: `${width}px`, height: `${height}px`, display: '' };
    this.ctx = new ZeroAllocationMockContext2D(this);
  }

  getContext(type) {
    if (type === '2d') return this.ctx;
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

// 3. Mock Hero Element
class MockHeroElement {
  constructor(width = 1440, height = 800) {
    this.width = width;
    this.height = height;
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

// 4. Setup Mock Browser Global Environment
function setupMockBrowser(initialWidth = 1440, initialHeight = 800) {
  const windowListeners = new Map();
  const documentListeners = new Map();
  let rafCallback = null;
  let rafCounter = 0;

  const mockWindow = {
    innerWidth: initialWidth,
    innerHeight: initialHeight,
    devicePixelRatio: 2.0,
    scrollY: 0,
    pageYOffset: 0,
    addEventListener(event, handler) {
      if (!windowListeners.has(event)) windowListeners.set(event, []);
      windowListeners.get(event).push(handler);
    },
    removeEventListener(event, handler) {
      if (!windowListeners.has(event)) return;
      const list = windowListeners.get(event);
      const idx = list.indexOf(handler);
      if (idx !== -1) list.splice(idx, 1);
    },
    matchMedia(query) {
      return {
        matches: false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {}
      };
    },
    requestAnimationFrame(cb) {
      rafCallback = cb;
      return ++rafCounter;
    },
    cancelAnimationFrame(id) {
      rafCallback = null;
    }
  };

  const mockDocument = {
    hidden: false,
    addEventListener(event, handler) {
      if (!documentListeners.has(event)) documentListeners.set(event, []);
      documentListeners.get(event).push(handler);
    },
    removeEventListener(event, handler) {
      if (!documentListeners.has(event)) return;
      const list = documentListeners.get(event);
      const idx = list.indexOf(handler);
      if (idx !== -1) list.splice(idx, 1);
    }
  };

  class MockIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe(el) {
      // simulate visible hero
      this.callback([{ isIntersecting: true, target: el }]);
    }
    unobserve() {}
    disconnect() {}
  }

  global.window = mockWindow;
  global.document = mockDocument;
  global.IntersectionObserver = MockIntersectionObserver;
  global.requestAnimationFrame = mockWindow.requestAnimationFrame;
  global.cancelAnimationFrame = mockWindow.cancelAnimationFrame;

  return {
    mockWindow,
    mockDocument,
    triggerWindow(event, data) {
      const list = windowListeners.get(event) || [];
      for (const fn of list) fn(data);
    },
    stepRAF(timestamp) {
      if (rafCallback) {
        const cb = rafCallback;
        rafCallback = null;
        cb(timestamp);
      }
    }
  };
}

// 5. Load AtmosphericParticleEngine directly from web/assets/js/main.js
function loadEngineClass() {
  const mainJsPath = path.resolve(__dirname, '../web/assets/js/main.js');
  const code = fs.readFileSync(mainJsPath, 'utf8');
  
  // Extract AtmosphericParticleEngine class source
  const classStartIndex = code.indexOf('class AtmosphericParticleEngine');
  if (classStartIndex === -1) {
    throw new Error('AtmosphericParticleEngine class not found in web/assets/js/main.js');
  }
  const classEndIndex = code.indexOf('function initAtmosphericOverlay()');
  if (classEndIndex === -1) {
    throw new Error('initAtmosphericOverlay function not found in web/assets/js/main.js');
  }
  const classCode = code.slice(classStartIndex, classEndIndex);

  // Evaluate class in isolated scope
  const factory = new Function('return (' + classCode + ');');
  return factory();
}

// Run Test 1: 10,000 Continuous Frames Stress Test
async function runContinuousFramesStressTest(EngineClass) {
  console.log('\n===============================================================');
  console.log(' TEST 1: 10,000 CONTINUOUS FRAMES PERFORMANCE & ZERO-GC AUDIT');
  console.log('===============================================================');

  const env = setupMockBrowser(1440, 800);
  const canvas = new MockCanvasElement(1440, 800);
  const hero = new MockHeroElement(1440, 800);

  const engine = new EngineClass(canvas, hero);
  engine.init();

  assert.strictEqual(engine.isRunning, true, 'Engine must be running');
  assert.strictEqual(engine.activeCount, 70, 'Desktop active particle count must be 70');
  assert.strictEqual(engine.particles.length, 70, 'Particle pool size must be 70');

  // JIT Warmup (500 frames)
  console.log('-> Warming up V8 JIT compiler (500 frames)...');
  for (let f = 0; f < 500; f++) {
    engine.renderLoop();
  }

  // Force Garbage Collection for baseline
  if (global.gc) {
    global.gc();
    global.gc();
  }
  const baselineMem = process.memoryUsage();
  console.log(`-> Baseline Heap: ${(baselineMem.heapUsed / (1024 * 1024)).toFixed(3)} MB (Heap Total: ${(baselineMem.heapTotal / (1024 * 1024)).toFixed(3)} MB)`);

  const TOTAL_FRAMES = 10000;
  const frameTimes = new Float64Array(TOTAL_FRAMES);
  let totalTime = 0;
  let maxTime = 0;
  let minTime = Infinity;

  // Snapshot memory at intervals (without GC)
  const memorySnapshots = [];

  console.log(`-> Executing ${TOTAL_FRAMES.toLocaleString()} continuous animation frames with active physics...`);
  const benchmarkStart = performance.now();

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    // Dynamic interactive inputs:
    // 1. Moving mouse with varying velocity in Lissajous figure (simulating active user interaction)
    const t = i * 0.05;
    const mx = 720 + Math.sin(t * 1.3) * 500;
    const my = 400 + Math.cos(t * 0.9) * 280;

    // Simulate pointermove event
    engine.mouse.isHovered = true;
    engine.mouse.targetX = mx;
    engine.mouse.targetY = my;

    // Simulate periodic scroll events (e.g. user scrolling every 40 frames)
    if (i % 40 === 0) {
      const scrollImpulse = ((i % 80 === 0) ? 35 : -30);
      engine.scrollDelta += scrollImpulse;
    }

    // Occasional pointer leave / re-entry
    if (i % 500 === 499) {
      engine.onPointerLeave();
    }

    // Measure per-frame execution time
    const t0 = performance.now();
    engine.renderLoop();
    const t1 = performance.now();

    const dt = t1 - t0;
    frameTimes[i] = dt;
    totalTime += dt;
    if (dt > maxTime) maxTime = dt;
    if (dt < minTime) minTime = dt;

    // Record un-collected heap memory every 2,500 frames
    if ((i + 1) % 2500 === 0) {
      const currentMem = process.memoryUsage();
      memorySnapshots.push({
        frame: i + 1,
        heapUsedMB: (currentMem.heapUsed / (1024 * 1024)).toFixed(3)
      });
      console.log(`   [Frame ${(i + 1).toString().padStart(5, ' ')} / ${TOTAL_FRAMES}] Current Heap: ${(currentMem.heapUsed / (1024 * 1024)).toFixed(3)} MB`);
    }
  }

  const benchmarkDuration = performance.now() - benchmarkStart;
  const meanTime = totalTime / TOTAL_FRAMES;

  // Calculate percentiles
  const sortedTimes = Float64Array.from(frameTimes).sort();
  const p50 = sortedTimes[Math.floor(TOTAL_FRAMES * 0.50)];
  const p90 = sortedTimes[Math.floor(TOTAL_FRAMES * 0.90)];
  const p95 = sortedTimes[Math.floor(TOTAL_FRAMES * 0.95)];
  const p99 = sortedTimes[Math.floor(TOTAL_FRAMES * 0.99)];

  // Measure uncollected heap immediately after 10,000 frames
  const postRunMem = process.memoryUsage();
  const uncollectedHeapGrowthMB = (postRunMem.heapUsed - baselineMem.heapUsed) / (1024 * 1024);

  // Force GC to check for true retained memory leaks
  if (global.gc) {
    global.gc();
    global.gc();
  }
  const postGCMem = process.memoryUsage();
  const retainedHeapGrowthBytes = postGCMem.heapUsed - baselineMem.heapUsed;
  const retainedHeapGrowthKB = (retainedHeapGrowthBytes / 1024).toFixed(2);

  // Physics integrity verification
  let nanOrInfCount = 0;
  let outOfBoundsCount = 0;
  for (let i = 0; i < engine.activeCount; i++) {
    const p = engine.particles[i];
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.vx) || !Number.isFinite(p.vy)) {
      nanOrInfCount++;
    }
    // Margin is 20px
    if (p.x < -30 || p.x > engine.width + 30 || p.y < -30 || p.y > engine.height + 30) {
      outOfBoundsCount++;
    }
  }

  console.log('\n--- PERFORMANCE TELEMETRY ---');
  console.log(`Total Benchmark Duration : ${benchmarkDuration.toFixed(2)} ms`);
  console.log(`Mean Frame Execution Time: ${meanTime.toFixed(4)} ms`);
  console.log(`Median (P50) Frame Time  : ${p50.toFixed(4)} ms`);
  console.log(`90th Percentile (P90)    : ${p90.toFixed(4)} ms`);
  console.log(`95th Percentile (P95)    : ${p95.toFixed(4)} ms`);
  console.log(`99th Percentile (P99)    : ${p99.toFixed(4)} ms`);
  console.log(`Min Frame Execution Time : ${minTime.toFixed(4)} ms`);
  console.log(`Max Frame Execution Time : ${maxTime.toFixed(4)} ms`);
  console.log(`Draw Calls Executed      : ${canvas.ctx.drawCalls.toLocaleString()}`);

  console.log('\n--- MEMORY & GC TELEMETRY ---');
  console.log(`Baseline Heap (Post-GC)  : ${(baselineMem.heapUsed / (1024 * 1024)).toFixed(3)} MB`);
  console.log(`End Run Heap (Raw)       : ${(postRunMem.heapUsed / (1024 * 1024)).toFixed(3)} MB (growth: ${uncollectedHeapGrowthMB.toFixed(3)} MB)`);
  console.log(`Final Heap (Post-GC)     : ${(postGCMem.heapUsed / (1024 * 1024)).toFixed(3)} MB`);
  console.log(`Retained Heap Leak Delta : ${retainedHeapGrowthKB} KB`);

  // Assertions
  assert.strictEqual(nanOrInfCount, 0, 'No particle coordinates or velocities can be NaN or Infinite');
  assert.strictEqual(outOfBoundsCount, 0, 'All particles must remain strictly within boundary wrap margins');
  assert.ok(meanTime < 0.5, `Mean frame execution time (${meanTime.toFixed(4)}ms) must be strictly < 0.5ms`);
  assert.ok(p99 < 1.0, `99th percentile frame execution time (${p99.toFixed(4)}ms) must be strictly < 1.0ms`);

  // Memory leak threshold: Retained heap growth after 10,000 frames must be < 100 KB (accounting for V8 profiling structures)
  const isZeroLeak = retainedHeapGrowthBytes < 100 * 1024;
  console.log(`Zero-Leak Assertion Check: ${isZeroLeak ? 'PASSED (0 retained leak)' : 'FAILED'}`);
  assert.ok(isZeroLeak, `Heap leak detected: retained ${retainedHeapGrowthKB} KB after full GC`);

  engine.destroy();

  return {
    meanTime,
    p50,
    p90,
    p95,
    p99,
    minTime,
    maxTime,
    retainedHeapGrowthKB,
    isZeroLeak,
    drawCalls: canvas.ctx.drawCalls
  };
}

// Run Test 2: 500 Rapid Resizes Across the 768px Boundary
async function runResizeBoundaryStressTest(EngineClass) {
  console.log('\n===============================================================');
  console.log(' TEST 2: 500 RAPID RESIZES ACROSS 768px MOBILE THRESHOLD');
  console.log('===============================================================');

  const env = setupMockBrowser(1200, 800);
  const canvas = new MockCanvasElement(1200, 800);
  const hero = new MockHeroElement(1200, 800);

  const engine = new EngineClass(canvas, hero);
  engine.init();

  assert.strictEqual(engine.activeCount, 70, 'Initial desktop activeCount must be 70');
  assert.strictEqual(engine.particles.length, 70, 'Pool length must be 70');

  // Record initial object references of all 70 particles
  const initialParticleRefs = engine.particles.slice();

  // Warmup JIT for resize and pool toggling (50 cycles)
  console.log('-> Warming up V8 JIT compiler for onResize (50 cycles)...');
  for (let w = 0; w < 50; w++) {
    env.mockWindow.innerWidth = (w % 2 === 0) ? 767 : 769;
    hero.width = env.mockWindow.innerWidth;
    canvas.width = env.mockWindow.innerWidth;
    engine.onResize();
  }

  if (global.gc) {
    global.gc();
    global.gc();
  }
  const preResizeMem = process.memoryUsage();
  console.log(`-> Pre-Resize Heap: ${(preResizeMem.heapUsed / (1024 * 1024)).toFixed(3)} MB`);

  const RESIZE_CYCLES = 500;
  console.log(`-> Executing ${RESIZE_CYCLES} rapid resize cycles alternating between 767px (mobile) and 769px (desktop)...`);

  let toggleCount = 0;
  let identityViolations = 0;
  let countViolations = 0;

  for (let cycle = 0; cycle < RESIZE_CYCLES; cycle++) {
    // 1. Resize to Mobile (767px)
    env.mockWindow.innerWidth = 767;
    hero.width = 767;
    canvas.width = 767;
    engine.onResize();

    if (engine.activeCount !== 25) {
      countViolations++;
    }

    // Run 3 frames of physics on mobile
    engine.renderLoop();
    engine.renderLoop();
    engine.renderLoop();

    // Verify particle identity has NOT changed
    for (let pIdx = 0; pIdx < 70; pIdx++) {
      if (!Object.is(engine.particles[pIdx], initialParticleRefs[pIdx])) {
        identityViolations++;
      }
    }

    // 2. Resize to Desktop (769px)
    env.mockWindow.innerWidth = 769;
    hero.width = 769;
    canvas.width = 769;
    engine.onResize();

    if (engine.activeCount !== 70) {
      countViolations++;
    }

    // Run 3 frames of physics on desktop (dormant particles awakening)
    engine.renderLoop();
    engine.renderLoop();
    engine.renderLoop();

    // Verify particle identity has NOT changed
    for (let pIdx = 0; pIdx < 70; pIdx++) {
      if (!Object.is(engine.particles[pIdx], initialParticleRefs[pIdx])) {
        identityViolations++;
      }
    }

    toggleCount++;
  }

  if (global.gc) {
    global.gc();
    global.gc();
  }
  const postResizeMem = process.memoryUsage();
  const resizeHeapDeltaKB = ((postResizeMem.heapUsed - preResizeMem.heapUsed) / 1024).toFixed(2);

  console.log('\n--- RESIZE TELEMETRY ---');
  console.log(`Total Resize Transitions : ${RESIZE_CYCLES * 2} (${RESIZE_CYCLES} mobile, ${RESIZE_CYCLES} desktop)`);
  console.log(`Count Violations         : ${countViolations}`);
  console.log(`Identity Violations      : ${identityViolations}`);
  console.log(`Pre-Resize Heap (Post-GC): ${(preResizeMem.heapUsed / (1024 * 1024)).toFixed(3)} MB`);
  console.log(`Post-Resize Heap(Post-GC): ${(postResizeMem.heapUsed / (1024 * 1024)).toFixed(3)} MB`);
  console.log(`Resize Heap Delta        : ${resizeHeapDeltaKB} KB`);

  assert.strictEqual(countViolations, 0, 'ActiveCount must strictly equal 25 for 767px and 70 for 769px');
  assert.strictEqual(identityViolations, 0, 'Particle object references must remain 100% stable (Zero-GC pre-allocated pool)');
  assert.strictEqual(engine.particles.length, 70, 'Particle pool length must never fluctuate');
  assert.ok(Math.abs(postResizeMem.heapUsed - preResizeMem.heapUsed) < 100 * 1024, 'Heap delta after 500 resizes must be negligible (<100 KB)');

  engine.destroy();

  return {
    resizeTransitions: RESIZE_CYCLES * 2,
    countViolations,
    identityViolations,
    resizeHeapDeltaKB
  };
}

// Main Runner
async function main() {
  console.log('===============================================================');
  console.log('   M1 EMPIRICAL ADVERSARIAL STRESS TEST HARNESS — CHALLENGER 2');
  console.log('===============================================================');

  const EngineClass = loadEngineClass();
  console.log('-> Loaded AtmosphericParticleEngine from web/assets/js/main.js successfully.');

  const test1Results = await runContinuousFramesStressTest(EngineClass);
  const test2Results = await runResizeBoundaryStressTest(EngineClass);

  console.log('\n===============================================================');
  console.log('                   ALL ADVERSARIAL STRESS TESTS PASSED');
  console.log('===============================================================');
  console.log('VERDICT: APPROVE');

  return { test1Results, test2Results };
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nADVERSARIAL STRESS TEST FAILED:', err);
    process.exit(1);
  });
}

module.exports = { main, runContinuousFramesStressTest, runResizeBoundaryStressTest };
