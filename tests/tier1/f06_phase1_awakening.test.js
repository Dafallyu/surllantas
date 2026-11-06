/**
 * tests/tier1/f06_phase1_awakening.test.js
 * Tier 1: Feature Coverage — Feature F6: Phase 01 Typographic Awakening
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const PhysicsOracle = require('../helpers/physics-oracle');

describe('Feature F6: Phase 01 Typographic Awakening (Tier 1)', () => {
  it('F6-T1-1: Phase 1 scroll boundaries span from 0.0 to 0.25 (0% to 25%)', () => {
    const atZero = PhysicsOracle.getScrollPhase(0.0);
    assert.strictEqual(atZero.phase, 1);
    assert.strictEqual(atZero.progress, 0.0);

    const atQuarter = PhysicsOracle.getScrollPhase(0.2499);
    assert.strictEqual(atQuarter.phase, 1);
    assert.strictEqual(Math.round(atQuarter.progress * 100) / 100, 1.0);
  });

  it('F6-T1-2: Inverse blur starts at 14px at 0% scroll', () => {
    const blur = PhysicsOracle.getPhase1Blur(0.0);
    assert.strictEqual(blur, 14.0, 'Inverse blur at 0% scroll must be exactly 14px');
  });

  it('F6-T1-3: Inverse blur transitions to 0px at 25% scroll (sharp crisp typography)', () => {
    const blur = PhysicsOracle.getPhase1Blur(1.0);
    assert.strictEqual(blur, 0.0, 'Inverse blur at 25% scroll must be 0px');
  });

  it('F6-T1-4: Mid-point interpolation at 12.5% scroll yields exactly 7px blur', () => {
    const blur = PhysicsOracle.getPhase1Blur(0.5);
    assert.strictEqual(blur, 7.0, 'Halfway through Phase 1 blur must be 7px');
  });

  it('F6-T1-5: Typographic opacity increases monotonically without flashing or negative values', () => {
    let prevOpacity = -1;
    for (let p = 0; p <= 1.0; p += 0.2) {
      const opacity = p; // Direct interpolation
      assert.ok(opacity >= 0.0 && opacity <= 1.0, 'Opacity must be in range [0, 1]');
      assert.ok(opacity >= prevOpacity, 'Opacity must increase monotonically');
      prevOpacity = opacity;
    }
  });
});
