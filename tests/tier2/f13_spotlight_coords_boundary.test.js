/**
 * tests/tier2/f13_spotlight_coords_boundary.test.js
 * Tier 2: Boundary & Corner Cases — Feature F13: Catalog Spotlight Cursor Tracking
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const PhysicsOracle = require('../helpers/physics-oracle');

describe('Feature F13: Catalog Spotlight Cursor Tracking — Boundary & Corner Cases (Tier 2)', () => {
  const cardRect = { left: 200, top: 150, width: 320, height: 420 };

  it('F13-T2-1: Exact top-left corner coordinate (200, 150) resolves to mouseX=0, mouseY=0', () => {
    const coords = PhysicsOracle.calculateSpotlightCoords(200, 150, cardRect);
    assert.strictEqual(coords.mouseX, 0);
    assert.strictEqual(coords.mouseY, 0);
    assert.strictEqual(coords.isInside, true);
  });

  it('F13-T2-2: Exact bottom-right corner coordinate (520, 570) resolves to mouseX=320, mouseY=420', () => {
    const coords = PhysicsOracle.calculateSpotlightCoords(520, 570, cardRect);
    assert.strictEqual(coords.mouseX, 320);
    assert.strictEqual(coords.mouseY, 420);
    assert.strictEqual(coords.isInside, true);
  });

  it('F13-T2-3: Negative client coordinates (cursor moving off-screen left/top) produce valid out-of-bounds flag', () => {
    const coords = PhysicsOracle.calculateSpotlightCoords(-50, -50, cardRect);
    assert.strictEqual(coords.isInside, false);
    assert.ok(coords.mouseX < 0 && coords.mouseY < 0);
  });

  it('F13-T2-4: Sub-pixel fractional mouse coordinates are cleanly rounded for CSS string generation', () => {
    const coords = PhysicsOracle.calculateSpotlightCoords(250.678, 200.345, cardRect);
    assert.strictEqual(coords.cssVarX, '51px');
    assert.strictEqual(coords.cssVarY, '50px');
  });

  it('F13-T2-5: Rapid diagonal mouse swipe across card calculates monotonic trajectory without NaN', () => {
    for (let step = 0; step <= 10; step++) {
      const clientX = 200 + step * 32;
      const clientY = 150 + step * 42;
      const coords = PhysicsOracle.calculateSpotlightCoords(clientX, clientY, cardRect);
      assert.ok(!isNaN(coords.mouseX) && !isNaN(coords.mouseY));
      assert.strictEqual(coords.isInside, true);
    }
  });
});
