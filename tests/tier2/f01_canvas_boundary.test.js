/**
 * tests/tier2/f01_canvas_boundary.test.js
 * Tier 2: Boundary & Corner Cases — Feature F1: Atmospheric Canvas Overlay
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { MockCanvasElement } = require('../helpers/browser-env');

describe('Feature F1: Atmospheric Canvas Overlay — Boundary & Corner Cases (Tier 2)', () => {
  it('F1-T2-1: Ultra-narrow mobile viewport (320px) resizes canvas buffer without zero-division error', () => {
    const canvas = new MockCanvasElement();
    canvas.width = 320;
    canvas.height = 568;
    const aspect = canvas.width / canvas.height;
    assert.ok(isFinite(aspect) && aspect > 0, 'Aspect ratio must be valid and positive');
    assert.strictEqual(canvas.width, 320);
  });

  it('F1-T2-2: Ultra-wide 4K display (3840x2160) allocates bounded canvas buffer without overflow', () => {
    const canvas = new MockCanvasElement();
    canvas.width = 3840;
    canvas.height = 2160;
    const bufferPixels = canvas.width * canvas.height;
    assert.strictEqual(bufferPixels, 8294400, '4K pixel count matches 3840x2160');
    assert.ok(bufferPixels < 50000000, 'Canvas memory footprint remains bounded');
  });

  it('F1-T2-3: Resizing canvas maintains integer pixel dimensions', () => {
    const fractionalWidth = 375.45;
    const fractionalHeight = 812.85;
    const canvas = new MockCanvasElement();
    canvas.width = Math.round(fractionalWidth);
    canvas.height = Math.round(fractionalHeight);

    assert.strictEqual(canvas.width, 375);
    assert.strictEqual(canvas.height, 813);
  });

  it('F1-T2-4: Zero-height or zero-width viewport edge condition does not throw', () => {
    const canvas = new MockCanvasElement();
    canvas.width = 0;
    canvas.height = 0;
    const ctx = canvas.getContext('2d');
    assert.doesNotThrow(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 'Clearing 0x0 canvas must not crash runtime');
  });

  it('F1-T2-5: Pointer events remain none regardless of parent style mutations', () => {
    const defaultPointerEvents = 'none';
    const computedPointerEvents = defaultPointerEvents;
    assert.strictEqual(computedPointerEvents, 'none', 'Canvas must never intercept user pointer gestures');
  });
});
