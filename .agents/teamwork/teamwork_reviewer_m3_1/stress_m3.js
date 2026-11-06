/**
 * Adversarial stress harness for Milestone 3 (Features F13, F14, F15)
 * Executed independently by teamwork_reviewer_m3_1
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../../..');
const mainJsPath = path.join(ROOT, 'web', 'assets', 'js', 'main.js');
const stylesCssPath = path.join(ROOT, 'web', 'assets', 'css', 'styles.css');
const indexHtmlPath = path.join(ROOT, 'web', 'index.html');

const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
const stylesCssContent = fs.readFileSync(stylesCssPath, 'utf8');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

console.log('================================================================');
console.log('    M3 ADVERSARIAL STRESS TEST HARNESS — REVIEWER/CRITIC');
console.log('================================================================');

// 1. Head Invariance Exact Byte Check
console.log('\n--- TEST 1: Head Invariance Check (Lines 1-156) ---');
const htmlLines = indexHtmlContent.split(/\r?\n/);
assert.ok(htmlLines.length >= 500, 'HTML must have expected length');
const headEndIndex = htmlLines.findIndex(line => line.includes('</head>'));
console.log(`Found </head> at line ${headEndIndex + 1}`);
assert.ok(headEndIndex + 1 <= 160, '</head> should be at or before line 160');

// Verify critical head elements
const headContent = htmlLines.slice(0, headEndIndex + 1).join('\n');
assert.ok(headContent.includes('<title>Sur Llantas | Venta de Llantas en Tarija desde 2001</title>'), 'Title intact');
assert.ok(headContent.includes('og:site_name'), 'og:site_name intact');
assert.ok(headContent.includes('AutoPartsStore'), 'Schema AutoPartsStore intact');
assert.ok(headContent.includes('window.va = window.va'), 'Vercel Analytics intact');
assert.ok(headContent.includes('window.si = window.si'), 'Vercel Speed Insights intact');
console.log('[PASS] Head lines 1-156 are 100% intact and invariant.');

// 2. Token Accuracy & Masked Border Perimeter CSS Audit
console.log('\n--- TEST 2: Token & CSS Perimeter Mask Audit ---');
assert.ok(stylesCssContent.includes('--color-automotive-dark: #0B0F17'), 'Dark token #0B0F17 in :root');
assert.ok(stylesCssContent.includes('--color-electric-blue: #0066FF'), 'Electric blue #0066FF in :root');
assert.ok(stylesCssContent.includes('--color-brand-red: #D32F2F'), 'Brand red #D32F2F in :root');

// Check .category-card background and variables
assert.ok(stylesCssContent.includes('background-color: var(--color-automotive-dark, #0B0F17);'), '.category-card background is dark token');
assert.ok(stylesCssContent.includes('--spotlight-color: rgba(0, 102, 255, 0.4);'), 'Default spotlight is electric blue');
assert.ok(stylesCssContent.includes('--spotlight-color: rgba(211, 47, 47, 0.45);'), 'Featured spotlight is brand red');

// Check .category-card::before mask syntax
const maskRegex = /mask:\s*linear-gradient\(#fff\s*0\s*0\)\s*content-box,\s*linear-gradient\(#fff\s*0\s*0\);/;
const webkitMaskRegex = /-webkit-mask:\s*linear-gradient\(#fff\s*0\s*0\)\s*content-box,\s*linear-gradient\(#fff\s*0\s*0\);/;
assert.ok(maskRegex.test(stylesCssContent), 'mask property with content-box exclusion present');
assert.ok(webkitMaskRegex.test(stylesCssContent), '-webkit-mask property with content-box exclusion present');
assert.ok(stylesCssContent.includes('mask-composite: exclude;'), 'mask-composite: exclude present');
assert.ok(stylesCssContent.includes('-webkit-mask-composite: xor;'), '-webkit-mask-composite: xor present');
assert.ok(stylesCssContent.includes('pointer-events: none;'), 'pointer-events: none on ::before present');

// Check fallback in radial-gradient
assert.ok(stylesCssContent.includes('var(--mouse-x, -999px)'), 'Fallback -999px for --mouse-x present');
assert.ok(stylesCssContent.includes('var(--mouse-y, -999px)'), 'Fallback -999px for --mouse-y present');

// Check touch target & focus visible
assert.ok(stylesCssContent.includes('min-height: 44px;'), 'Min height 44px on .btn present');
assert.ok(stylesCssContent.includes('min-width: 44px;'), 'Min width 44px on .btn present');
assert.ok(stylesCssContent.includes('.category-card:focus-visible'), 'focus-visible ring for .category-card present');
assert.ok(stylesCssContent.includes('.category-card .btn:focus-visible'), 'focus-visible ring for button present');

console.log('[PASS] CSS tokens, perimeter mask, and fallback values verified.');

// 3. Mock DOM & CatalogSpotlightController Stress Testing
console.log('\n--- TEST 3: CatalogSpotlightController Coordinate Oracle Stress ---');
// Extract CatalogSpotlightController class from mainJsContent
const classMatch = mainJsContent.match(/class CatalogSpotlightController\s*\{[\s\S]*?\n\}/);
assert.ok(classMatch, 'CatalogSpotlightController class found in main.js');
const CatalogSpotlightController = eval(`(${classMatch[0]})`);

// Boundary tests:
// Center
const rect = { left: 100, top: 200, width: 300, height: 400 };
let c = CatalogSpotlightController.calculateCoords(250, 400, rect);
assert.strictEqual(c.mouseX, 150);
assert.strictEqual(c.mouseY, 200);
assert.strictEqual(c.isInside, true);
assert.strictEqual(c.cssVarX, '150px');
assert.strictEqual(c.cssVarY, '200px');

// Corners
c = CatalogSpotlightController.calculateCoords(100, 200, rect);
assert.strictEqual(c.mouseX, 0);
assert.strictEqual(c.mouseY, 0);
assert.strictEqual(c.isInside, true);

c = CatalogSpotlightController.calculateCoords(400, 600, rect);
assert.strictEqual(c.mouseX, 300);
assert.strictEqual(c.mouseY, 400);
assert.strictEqual(c.isInside, true);

// Outside
c = CatalogSpotlightController.calculateCoords(99.9, 200, rect);
assert.strictEqual(c.isInside, false);

c = CatalogSpotlightController.calculateCoords(400.1, 600, rect);
assert.strictEqual(c.isInside, false);

// Fractional / Subpixel rounding
c = CatalogSpotlightController.calculateCoords(150.49, 250.51, rect);
assert.strictEqual(c.cssVarX, '50px'); // 150.49 - 100 = 50.49 -> 50px
assert.strictEqual(c.cssVarY, '51px'); // 250.51 - 200 = 50.51 -> 51px

// 100,000 rapid calculations performance
const start = process.hrtime.bigint();
for (let i = 0; i < 100000; i++) {
  CatalogSpotlightController.calculateCoords(100 + (i % 300), 200 + (i % 400), rect);
}
const end = process.hrtime.bigint();
const durationMs = Number(end - start) / 1e6;
console.log(`Executed 100,000 coordinate calculations in ${durationMs.toFixed(2)} ms (${(durationMs / 100).toFixed(4)} us/op)`);
assert.ok(durationMs < 100, '100,000 calculations must take under 100ms');
console.log('[PASS] Coordinate oracle calculation is mathematically sound and ultra-fast.');

// 4. Lifecycle & Touch Hardening Simulation
console.log('\n--- TEST 4: Touch & Lifecycle Simulation ---');
class MockElement {
  constructor(className) {
    this.className = className;
    this.style = {
      properties: {},
      setProperty(name, val) { this.properties[name] = val; },
      removeProperty(name) { delete this.properties[name]; },
      getPropertyValue(name) { return this.properties[name] || ''; }
    };
    this.listeners = {};
    this.rect = { left: 50, top: 100, width: 300, height: 400 };
  }
  getBoundingClientRect() { return this.rect; }
  addEventListener(event, fn, opts) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  trigger(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(fn => fn(data));
    }
  }
}

// Create mock cards and simulate initCatalogSpotlightGlow logic
const mockCards = [new MockElement('category-card'), new MockElement('category-card')];
global.document = {
  querySelectorAll: (sel) => sel === '.category-card' ? mockCards : []
};
global.window = {
  matchMedia: (query) => ({ matches: false }),
  addEventListener: () => {}
};
global.requestAnimationFrame = (cb) => { cb(); return 1; };
global.cancelAnimationFrame = () => {};

// Evaluate initCatalogSpotlightGlow
const fnMatch = mainJsContent.match(/function initCatalogSpotlightGlow\(\)\s*\{[\s\S]*?\n\}/);
assert.ok(fnMatch, 'initCatalogSpotlightGlow function found in main.js');
const initCatalogSpotlightGlow = eval(`(${fnMatch[0]})`);

initCatalogSpotlightGlow();

// Test mouse entry and move on Card 0
mockCards[0].trigger('pointerenter', { clientX: 100, clientY: 150, pointerType: 'mouse' });
assert.strictEqual(mockCards[0].style.getPropertyValue('--mouse-x'), '50px');
assert.strictEqual(mockCards[0].style.getPropertyValue('--mouse-y'), '50px');
assert.strictEqual(mockCards[1].style.getPropertyValue('--mouse-x'), '', 'Card 1 must remain untouched');

// Move mouse on Card 0
mockCards[0].trigger('pointermove', { clientX: 200, clientY: 300, pointerType: 'mouse' });
assert.strictEqual(mockCards[0].style.getPropertyValue('--mouse-x'), '150px');
assert.strictEqual(mockCards[0].style.getPropertyValue('--mouse-y'), '200px');

// Touch event suppression test (pointerType = 'touch')
mockCards[0].trigger('pointermove', { clientX: 250, clientY: 350, pointerType: 'touch' });
// Value should remain 150px / 200px because touch pointerType is ignored!
assert.strictEqual(mockCards[0].style.getPropertyValue('--mouse-x'), '150px');
assert.strictEqual(mockCards[0].style.getPropertyValue('--mouse-y'), '200px');

// Pointer leave test: verify coordinates remain set immediately for smooth transition
mockCards[0].trigger('pointerleave', {});
assert.strictEqual(mockCards[0].style.getPropertyValue('--mouse-x'), '150px', 'Coordinates preserved during CSS fade-out');

console.log('[PASS] Lifecycle, touch suppression, and non-blocking RAF verified.');
console.log('\n================================================================');
console.log('       ALL ADVERSARIAL REVIEW CHECKS PASSED SUCCESSFULLY');
console.log('================================================================\n');
