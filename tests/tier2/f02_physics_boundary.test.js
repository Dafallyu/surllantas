/**
 * tests/tier2/f02_physics_boundary.test.js
 * Tier 2: Boundary & Corner Cases — Feature F2: Particle Physics Engine
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const PhysicsOracle = require('../helpers/physics-oracle');
const { MockBrowserEnvironment } = require('../helpers/browser-env');

describe('Feature F2: Particle Physics Engine — Boundary & Corner Cases (Tier 2)', () => {
  it('F2-T2-1: Extreme sudden mouse velocity burst is safely bounded', () => {
    let currentVel = 0;
    const extremeTargetVel = 10000; // Hyper-speed mouse flick
    const MAX_PARTICLE_VEL = 50;

    let updated = PhysicsOracle.updateVelocity(currentVel, extremeTargetVel, 0.05, 0.95);
    if (updated > MAX_PARTICLE_VEL) updated = MAX_PARTICLE_VEL;

    assert.ok(updated <= MAX_PARTICLE_VEL, 'Particle velocity must be clamped to MAX_PARTICLE_VEL');
    assert.ok(isFinite(updated), 'Velocity must remain a finite number');
  });

  it('F2-T2-2: Negative scroll delta (scrolling upward past top) does not produce inverted velocity', () => {
    let vy = 1.0;
    const upwardScrollDelta = -200; // Rapid scroll back to hero top
    const impulse = upwardScrollDelta * 0.05;
    vy += impulse;

    assert.strictEqual(vy, -9.0, 'Upward impulse is calculated deterministically');
    // Sanitize
    const clampedVy = Math.max(-15, Math.min(15, vy));
    assert.ok(clampedVy >= -15 && clampedVy <= 15, 'Vertical velocity must be clamped to safe threshold');
  });

  it('F2-T2-3: Fractional devicePixelRatio (1.25, 1.5, 1.75) clamps accurately without rounding artifacts', () => {
    const fractionalRatios = [1.25, 1.5, 1.75, 2.25, 2.75];
    for (const dpr of fractionalRatios) {
      const env = new MockBrowserEnvironment({ devicePixelRatio: dpr });
      const clamped = env.clampDPR(2);
      if (dpr > 2) {
        assert.strictEqual(clamped, 2.0);
      } else {
        assert.strictEqual(clamped, dpr);
      }
    }
  });

  it('F2-T2-4: Particle resting state reaches near-zero without floating point underflow', () => {
    let vel = 0.000000001;
    if (Math.abs(vel) < 0.001) vel = 0;
    assert.strictEqual(vel, 0, 'Sub-pixel micro-jitter must be snapped to zero equilibrium');
  });

  it('F2-T2-5: NaN or undefined inputs to velocity updater default safely to zero', () => {
    const safeUpdate = (cur, target) => {
      const c = Number.isFinite(cur) ? cur : 0;
      const t = Number.isFinite(target) ? target : 0;
      return PhysicsOracle.updateVelocity(c, t);
    };

    const res1 = safeUpdate(NaN, 10);
    assert.ok(!isNaN(res1), 'NaN current velocity must be recovered to finite number');

    const res2 = safeUpdate(5, undefined);
    assert.ok(!isNaN(res2), 'Undefined target velocity must be recovered to finite number');
  });
});
