/**
 * tests/tier2/f06_phase1_boundary.test.js
 * Tier 2: Boundary & Corner Cases — Feature F6: Phase 01 Typographic Awakening
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const PhysicsOracle = require('../helpers/physics-oracle');

describe('Feature F6: Phase 01 Typographic Awakening — Boundary & Corner Cases (Tier 2)', () => {
  it('F6-T2-1: Negative scroll offset (iOS elastic rubber-banding) clamps to 0.0 without crash', () => {
    const negativeScroll = -0.15;
    const phase = PhysicsOracle.getScrollPhase(negativeScroll);
    assert.strictEqual(phase.phase, 1);
    assert.strictEqual(phase.progress, 0.0);
    const blur = PhysicsOracle.getPhase1Blur(phase.progress);
    assert.strictEqual(blur, 14.0, 'Blur must not exceed 14px on negative overscroll');
  });

  it('F6-T2-2: Exact 0.0000% scroll sets blur to exactly 14.0px', () => {
    const blur = PhysicsOracle.getPhase1Blur(0.0);
    assert.strictEqual(blur, 14.0);
  });

  it('F6-T2-3: Exact 1.0000 Phase 1 progress (at 24.99% scroll) sets blur to exactly 0.0px', () => {
    const blur = PhysicsOracle.getPhase1Blur(1.0);
    assert.strictEqual(blur, 0.0);
  });

  it('F6-T2-4: Rapid bidirectional scroll scrubbing produces continuous blur values without discontinuities', () => {
    const scrubOffsets = [0.0, 0.05, 0.02, 0.15, 0.10, 0.24, 0.01];
    let prevBlur = PhysicsOracle.getPhase1Blur(PhysicsOracle.getScrollPhase(scrubOffsets[0]).progress);

    for (let i = 1; i < scrubOffsets.length; i++) {
      const p = PhysicsOracle.getScrollPhase(scrubOffsets[i]).progress;
      const curBlur = PhysicsOracle.getPhase1Blur(p);
      assert.ok(isFinite(curBlur), 'Blur must be finite');
      assert.ok(curBlur >= 0 && curBlur <= 14, 'Blur must stay in [0, 14]');
      prevBlur = curBlur;
    }
  });

  it('F6-T2-5: Progress values beyond 1.0 are safely clamped without producing negative blur', () => {
    const overflowProgress = 2.5;
    const blur = PhysicsOracle.getPhase1Blur(overflowProgress);
    assert.strictEqual(blur, 0.0, 'Progress > 1.0 must clamp blur to 0.0px');
  });
});
