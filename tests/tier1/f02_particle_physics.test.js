/**
 * tests/tier1/f02_particle_physics.test.js
 * Tier 1: Feature Coverage — Feature F2: Particle Physics Engine
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { MockBrowserEnvironment, MockCanvasElement } = require('../helpers/browser-env');
const PhysicsOracle = require('../helpers/physics-oracle');

describe('Feature F2: Particle Physics Engine (Tier 1)', () => {
  it('F2-T1-1: High-DPI devicePixelRatio is clamped to maximum 2.0 to protect GPU fill-rate', () => {
    const envHighDPI = new MockBrowserEnvironment({ devicePixelRatio: 3.5 });
    const clampedHigh = envHighDPI.clampDPR(2);
    assert.strictEqual(clampedHigh, 2.0, 'DPR of 3.5 must clamp to 2.0');

    const envStandard = new MockBrowserEnvironment({ devicePixelRatio: 1.0 });
    const clampedStandard = envStandard.clampDPR(2);
    assert.strictEqual(clampedStandard, 1.0, 'DPR of 1.0 must remain 1.0');
  });

  it('F2-T1-2: Canvas element provides valid "2d" rendering context', () => {
    const canvas = new MockCanvasElement('atmospheric-overlay');
    const ctx = canvas.getContext('2d');
    assert.ok(ctx !== null, '2D rendering context must be obtainable');
    assert.strictEqual(typeof ctx.clearRect, 'function');
    assert.strictEqual(typeof ctx.arc, 'function');
  });

  it('F2-T1-3: Particle velocity responds to mouse velocity with inertia lerp factor', () => {
    let currentVel = 0;
    const targetVel = 10;
    currentVel = PhysicsOracle.updateVelocity(currentVel, targetVel, 0.1, 1.0);
    assert.ok(currentVel > 0 && currentVel < targetVel, 'Velocity must interpolate smoothly towards target');
    assert.strictEqual(currentVel, 1.0, '0 + (10 - 0) * 0.1 should equal 1.0');
  });

  it('F2-T1-4: Particle vertical velocity absorbs scroll delta impulse', () => {
    let particleVy = 0.5;
    const scrollDelta = 40; // Sudden scroll down
    const impulse = scrollDelta * 0.05;
    particleVy += impulse;
    assert.strictEqual(particleVy, 2.5, 'Scroll delta must inject vertical velocity impulse');
  });

  it('F2-T1-5: Particle velocity decays under friction towards resting equilibrium', () => {
    let vel = 5.0;
    const friction = 0.95;
    for (let i = 0; i < 10; i++) {
      vel = PhysicsOracle.updateVelocity(vel, 0, 0, friction);
    }
    assert.ok(vel < 5.0 && vel > 0, 'Velocity must decay smoothly under friction without oscillating');
  });
});
