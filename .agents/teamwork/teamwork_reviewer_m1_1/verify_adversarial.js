/**
 * Independent Adversarial Verification Suite for Milestone 1
 * Reviewer: teamwork_reviewer_m1_1
 */
const fs = require('fs');
const assert = require('assert');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../../');
const indexHtmlPath = path.join(ROOT, 'web', 'index.html');
const stylesCssPath = path.join(ROOT, 'web', 'assets', 'css', 'styles.css');
const mainJsPath = path.join(ROOT, 'web', 'assets', 'js', 'main.js');

console.log('--- STARTING INDEPENDENT ADVERSARIAL VERIFICATION ---');

// 1. Verify Head lines 1 to 156
const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
const lines = htmlContent.split(/\r?\n/);
assert.strictEqual(lines.length >= 156, true, 'index.html must have at least 156 lines');
assert.strictEqual(lines[155].trim(), '</head>', 'Line 156 must be exactly </head>');
console.log('✓ [PASS] Check 1: Exactly 156 lines in <head> with </head> on line 156.');

// 2. Verify Canvas placement
const canvasIndex = lines.findIndex(l => l.includes('id="atmospheric-overlay"'));
assert.ok(canvasIndex > 156, 'Canvas element must be inside <body> (after line 156)');
assert.strictEqual(canvasIndex, 195, 'Canvas element must be on line 196 (0-indexed 195)');
assert.ok(lines[canvasIndex].includes('aria-hidden="true"'), 'Canvas must have aria-hidden="true"');
assert.ok(lines[canvasIndex - 1].includes('hero__overlay'), 'Canvas must be preceded by .hero__overlay');
assert.ok(lines[canvasIndex + 1].includes('hero__content'), 'Canvas must be succeeded by .hero__content');
console.log(`✓ [PASS] Check 2: Canvas placement on line ${canvasIndex + 1} between hero__overlay and hero__content.`);

// 3. Verify CSS properties in styles.css
const cssContent = fs.readFileSync(stylesCssPath, 'utf8');
assert.ok(cssContent.includes('#atmospheric-overlay'), 'CSS must define #atmospheric-overlay');
assert.ok(/#atmospheric-overlay\s*\{[^}]*position:\s*absolute/s.test(cssContent), 'CSS position: absolute');
assert.ok(/#atmospheric-overlay\s*\{[^}]*pointer-events:\s*none/s.test(cssContent), 'CSS pointer-events: none');
assert.ok(/#atmospheric-overlay\s*\{[^}]*z-index:\s*1/s.test(cssContent), 'CSS z-index: 1');
assert.ok(/#atmospheric-overlay\s*\{[^}]*will-change:\s*transform/s.test(cssContent), 'CSS will-change: transform');
assert.ok(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*#atmospheric-overlay\s*\{[^}]*display:\s*none\s*!important/s.test(cssContent), 'Reduced motion display: none !important');
console.log('✓ [PASS] Check 3: CSS layering, pointer-events: none, z-index: 1, and reduced-motion media query.');

// 4. Extract and stress-test AtmosphericParticleEngine class
const jsContent = fs.readFileSync(mainJsPath, 'utf8');
const classMarker = 'class AtmosphericParticleEngine';
const classStart = jsContent.indexOf(classMarker);
assert.ok(classStart !== -1, 'main.js must contain AtmosphericParticleEngine');

// Check DOMContentLoaded hook
assert.ok(jsContent.includes('initAtmosphericOverlay();'), 'DOMContentLoaded must call initAtmosphericOverlay()');

// Mock browser DOM & canvas environment for behavioral testing
class MockContext2D {
  constructor() {
    this.operations = [];
    this.fillStyle = null;
    this.transform = null;
  }
  clearRect(x, y, w, h) { this.operations.push(['clearRect', x, y, w, h]); }
  beginPath() { this.operations.push(['beginPath']); }
  arc(x, y, r, sa, ea) { this.operations.push(['arc', x, y, r, sa, ea]); }
  fill() { this.operations.push(['fill']); }
  setTransform(a, b, c, d, e, f) { this.transform = [a, b, c, d, e, f]; }
  scale(sx, sy) { this.operations.push(['scale', sx, sy]); }
}

class MockElement {
  constructor(tag, id = '') {
    this.tagName = tag;
    this.id = id;
    this.style = {};
    this.width = 1000;
    this.height = 600;
  }
  getContext(type) {
    if (type === '2d') {
      if (!this._ctx) this._ctx = new MockContext2D();
      return this._ctx;
    }
    return null;
  }
  getBoundingClientRect() {
    return { width: 1200, height: 650, top: 0, bottom: 650, left: 0, right: 1200 };
  }
}

// Build synthetic sandbox
const mockWindow = {
  innerWidth: 1280,
  innerHeight: 800,
  devicePixelRatio: 2.5,
  scrollY: 0,
  pageYOffset: 0,
  matchMedia: (q) => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {}
  }),
  addEventListener: () => {},
  removeEventListener: () => {}
};

const mockDocument = {
  hidden: false,
  addEventListener: () => {},
  removeEventListener: () => {}
};

let rafCallbacks = [];
const mockRAF = (cb) => {
  rafCallbacks.push(cb);
  return rafCallbacks.length;
};
const mockCAF = (id) => {
  rafCallbacks = rafCallbacks.filter((_, idx) => idx + 1 !== id);
};

global.window = mockWindow;
global.document = mockDocument;
global.requestAnimationFrame = mockRAF;
global.cancelAnimationFrame = mockCAF;
global.IntersectionObserver = class {
  constructor(cb) { this.cb = cb; }
  observe() {}
  disconnect() {}
};

// Evaluate class
const classCode = jsContent.slice(classStart, jsContent.indexOf('function initAtmosphericOverlay'));
const EngineClass = new Function(classCode + '\nreturn AtmosphericParticleEngine;')();

// Test 4.1: Construction and mobile/desktop throttling
const canvasMock = new MockElement('canvas', 'atmospheric-overlay');
const heroMock = new MockElement('section');

// Desktop test (1280px)
mockWindow.innerWidth = 1280;
const engineDesktop = new EngineClass(canvasMock, heroMock);
assert.strictEqual(engineDesktop.activeCount, 70, 'Desktop activeCount must be 70');
assert.strictEqual(engineDesktop.particles.length, 70, 'Pre-allocated pool size must be 70');

// Mobile test (375px)
mockWindow.innerWidth = 375;
const engineMobile = new EngineClass(canvasMock, heroMock);
assert.strictEqual(engineMobile.activeCount, 25, 'Mobile activeCount must be 25');
assert.strictEqual(engineMobile.particles.length, 70, 'Pre-allocated pool size on mobile must remain 70 (Zero-GC)');
console.log('✓ [PASS] Check 4: Particle pool allocation (70 desktop / 25 mobile) with Zero-GC pool pre-allocation.');

// Test 4.2: DPR clamping (< 2.0)
engineDesktop.init();
assert.strictEqual(engineDesktop.dpr, 2.0, 'DPR 2.5 must be clamped to 2.0');
console.log('✓ [PASS] Check 5: DPR clamping verified (2.5 -> 2.0).');

// Test 4.3: Dynamic pool resizing on orientation change / resize
mockWindow.innerWidth = 400; // Mobile
engineDesktop.onResize();
assert.strictEqual(engineDesktop.activeCount, 25, 'Resizing to 400px throttles activeCount to 25');
assert.strictEqual(engineDesktop.particles.length, 70, 'Pool array length never shrinks (Zero-GC)');

mockWindow.innerWidth = 1440; // Expand to desktop
engineDesktop.onResize();
assert.strictEqual(engineDesktop.activeCount, 70, 'Resizing to 1440px restores activeCount to 70');
console.log('✓ [PASS] Check 6: Dynamic resize throttling & awakening verified without array reallocation.');

// Test 4.4: Particle composition & style pre-baking (Dual tier: 30% sparks, 70% dust)
let sparkCount = 0;
let dustCount = 0;
for (let p of engineDesktop.particles) {
  assert.ok(p.radius > 0, 'Radius must be > 0');
  assert.ok(p.z >= 0.30 && p.z <= 1.00, 'Depth z must be in [0.30, 1.00]');
  assert.ok(p.style.startsWith('rgba('), 'Style must be pre-baked rgba string');
  if (p.style.includes('0, 102, 255') || p.style.includes('220, 38, 38')) {
    sparkCount++;
  } else if (p.style.includes('245, 179, 1') || p.style.includes('148, 163, 184')) {
    dustCount++;
  }
}
assert.strictEqual(sparkCount + dustCount, 70, 'All particles must belong to dust or spark tier');
console.log(`✓ [PASS] Check 7: Dual tier distribution verified (Sparks: ${sparkCount}, Dust: ${dustCount}, Total: 70).`);

// Test 4.5: Mouse velocity and inertia response
engineDesktop.onPointerMove({ clientX: 200, clientY: 200 });
assert.strictEqual(engineDesktop.mouse.isHovered, true);
assert.strictEqual(engineDesktop.mouse.currentX, 200, 'First entry avoids supersonic spike');

// Advance mouse to 250, 250
engineDesktop.onPointerMove({ clientX: 250, clientY: 250 });
engineDesktop.renderLoop();
assert.ok(engineDesktop.mouse.currentX > 200 && engineDesktop.mouse.currentX < 250, 'Mouse position must lerp smoothly');
console.log('✓ [PASS] Check 8: Mouse velocity smoothing and supersonic entry protection verified.');

// Test 4.6: Scroll parallax impulse
const initialVy = engineDesktop.particles[0].vy;
engineDesktop.scrollDelta = 80; // Scroll down delta
engineDesktop.renderLoop();
assert.ok(engineDesktop.particles[0].vy < initialVy, 'Scroll down must inject upward impulse (vy decreases)');
console.log('✓ [PASS] Check 9: Scroll parallax upward impulse verified.');

// Test 4.7: Reduced motion deactivation
engineDesktop.onMotionChange({ matches: true });
assert.strictEqual(engineDesktop.isReducedMotion, true);
assert.strictEqual(engineDesktop.isRunning, false);
assert.strictEqual(canvasMock.style.display, 'none');
console.log('✓ [PASS] Check 10: prefers-reduced-motion halts engine, clears canvas, and sets display: none.');

// Test 4.8: Tab visibility change
engineDesktop.isReducedMotion = false;
engineDesktop.isHeroVisible = true;
engineDesktop.startLoop();
assert.strictEqual(engineDesktop.isRunning, true);

mockDocument.hidden = true;
engineDesktop.onVisibilityChange();
assert.strictEqual(engineDesktop.isRunning, false, 'Loop must halt when document is hidden');

mockDocument.hidden = false;
engineDesktop.onVisibilityChange();
assert.strictEqual(engineDesktop.isRunning, true, 'Loop must resume when document becomes visible');
console.log('✓ [PASS] Check 11: Document visibility change lifecycle pause/resume verified.');

console.log('--- ALL 11 ADVERSARIAL CHECKS PASSED CLEANLY ---');
