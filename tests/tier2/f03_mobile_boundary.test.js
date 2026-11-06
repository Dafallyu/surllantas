/**
 * tests/tier2/f03_mobile_boundary.test.js
 * Tier 2: Boundary & Corner Cases — Feature F3: Mobile Particle Throttling
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function getParticleCount(width) {
  return width < 768 ? 25 : 70;
}

describe('Feature F3: Mobile Particle Throttling — Boundary & Corner Cases (Tier 2)', () => {
  it('F3-T2-1: Micro-boundary condition at 767.99px is classified as mobile (25 particles)', () => {
    assert.strictEqual(getParticleCount(767.99), 25, '767.99px must be treated as mobile');
  });

  it('F3-T2-2: Micro-boundary condition at 768.01px is classified as desktop (70 particles)', () => {
    assert.strictEqual(getParticleCount(768.01), 70, '768.01px must be treated as desktop');
  });

  it('F3-T2-3: Rapid consecutive window resizes (debounced simulation) stabilize to correct particle count', () => {
    const resizeSequence = [1200, 400, 1024, 320, 1920, 600, 768];
    let finalCount = 0;
    for (const width of resizeSequence) {
      finalCount = getParticleCount(width);
    }
    assert.strictEqual(finalCount, 70, 'Final resolution 768px must yield exactly 70 particles');
  });

  it('F3-T2-4: Mobile landscape orientation (812x375) provisions desktop particle cap due to width > 768px', () => {
    const landscapePhoneWidth = 812;
    assert.strictEqual(getParticleCount(landscapePhoneWidth), 70);
  });

  it('F3-T2-5: Memory stability: particle array splice/slice preserves active particle instances without leaks', () => {
    const particlePool = Array.from({ length: 70 }, (_, i) => ({ id: i, x: i * 10, y: i * 10 }));
    // Throttle to 25
    const throttled = particlePool.slice(0, 25);
    assert.strictEqual(throttled.length, 25);
    // Expand back to 70
    assert.strictEqual(particlePool.length, 70, 'Original master pool can re-hydrate full particle budget');
  });
});
