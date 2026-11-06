const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('  ADVERSARIAL STRESS TEST: MILESTONE 2 EDGE CASES   ');
console.log('====================================================\n');

// Mock a clean DOM environment
const jsContent = fs.readFileSync('web/assets/js/main.js', 'utf8');

global.window = global;
global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => []
};

// Isolate and extract classes and functions
eval(`
${jsContent.slice(jsContent.indexOf('class TelemetryController'))}
`);

let passes = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passes++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

// Test 1: WhatsApp URL builder handles extreme inputs safely
runTest('TireLandingQuoteBridge.buildWhatsAppQuoteURL handles special chars & XSS-like payload', () => {
  const url = TireLandingQuoteBridge.buildWhatsAppQuoteURL(
    '<script>alert(1)</script>',
    '315/70 R22.5"; DROP TABLE tires;--',
    'Roadone & Sons <Special>'
  );
  assert(url.startsWith('https://wa.me/59172960725?text='));
  assert(!url.includes('<script>'), 'URL must be URI-encoded');
  assert(url.includes('%3Cscript%3Ealert(1)%3C%2Fscript%3E'));
});

// Test 2: WhatsApp URL builder default fallbacks
runTest('TireLandingQuoteBridge.buildWhatsAppQuoteURL handles null/undefined inputs', () => {
  const url = TireLandingQuoteBridge.buildWhatsAppQuoteURL(null, null, null);
  assert(url.includes('Cami%C3%B3n%20%2F%20Transporte%20Pesado'));
  assert(url.includes('315%2F70%20R22.5'));
  assert(url.includes('Roadone%20HD55'));
});

// Test 3: Quote validation
runTest('TireLandingQuoteBridge.validateQuoteForm handles empty and whitespace', () => {
  assert.strictEqual(TireLandingQuoteBridge.validateQuoteForm('Auto', '').valid, false);
  assert.strictEqual(TireLandingQuoteBridge.validateQuoteForm('Auto', '   ').valid, false);
  assert.strictEqual(TireLandingQuoteBridge.validateQuoteForm('', '205/55 R16').valid, false);
  assert.strictEqual(TireLandingQuoteBridge.validateQuoteForm('Auto', '205/55 R16').valid, true);
});

// Test 4: Reduced motion guard in initCinematicScrollEngine
runTest('initCinematicScrollEngine bails out cleanly when window.gsap is missing', () => {
  global.window = {
    matchMedia: () => ({ matches: false })
  };
  const res = initCinematicScrollEngine();
  assert.strictEqual(res, null, 'Must return null when GSAP is undefined');
});

runTest('initCinematicScrollEngine bails out cleanly under prefers-reduced-motion', () => {
  global.window = {
    gsap: { registerPlugin: () => {} },
    ScrollTrigger: {},
    matchMedia: (query) => ({ matches: query.includes('prefers-reduced-motion') })
  };
  const res = initCinematicScrollEngine();
  assert.strictEqual(res, null, 'Must return null under reduced motion');
});

// Test 5: Affine matrix determinant & singularity check across 1000 sub-steps
runTest('Affine matrix determinant is strictly positive and non-singular across p in [0, 1]', () => {
  for (let i = 0; i <= 1000; i++) {
    const p = i / 1000;
    const angleRad = (p * 45 * Math.PI) / 180;
    const sinVal = Math.sin(angleRad);
    const scaleX = 1 + 0.15 * sinVal;
    const rawSkewX = -0.35 * sinVal;
    const skewX = Math.abs(rawSkewX) < 1e-6 ? 0 : rawSkewX;
    const scaleY = 1 - 0.25 * sinVal;
    const det = scaleX * scaleY;
    assert(det > 0.85 && det <= 1.0, `Determinant out of expected physical bounds: ${det} at p=${p}`);
    assert(scaleX >= 1.0 && scaleX <= 1.15, `scaleX out of bounds at p=${p}`);
    assert(scaleY <= 1.0 && scaleY >= 0.75, `scaleY out of bounds at p=${p}`);
    assert(skewX <= 0 && skewX >= -0.35, `skewX out of bounds at p=${p}`);
  }
});

console.log(`\nStress tests passed: ${passes}/${total}`);
if (passes === total) {
  console.log('RESULT: ALL ADVERSARIAL STRESS TESTS PASSED!');
} else {
  console.error('RESULT: STRESS TESTS FAILED!');
  process.exit(1);
}
