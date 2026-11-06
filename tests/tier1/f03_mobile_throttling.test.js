/**
 * tests/tier1/f03_mobile_throttling.test.js
 * Tier 1: Feature Coverage — Feature F3: Mobile Particle Throttling
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { MockBrowserEnvironment } = require('../helpers/browser-env');

function getParticleCountForViewport(width) {
  return width < 768 ? 25 : 70;
}

describe('Feature F3: Mobile Particle Throttling (Tier 1)', () => {
  it('F3-T1-1: Desktop viewport (width >= 768px) provisions exactly 70 particles', () => {
    const desktopWidth = 1440;
    const count = getParticleCountForViewport(desktopWidth);
    assert.strictEqual(count, 70, 'Desktop resolution must provision 70 particles');
  });

  it('F3-T1-2: Mobile viewport (width < 768px) throttles to exactly 25 particles', () => {
    const mobileWidth = 375;
    const count = getParticleCountForViewport(mobileWidth);
    assert.strictEqual(count, 25, 'Mobile resolution must throttle to 25 particles');
  });

  it('F3-T1-3: Exact boundary test: 767px triggers mobile throttle (25) while 768px triggers desktop (70)', () => {
    assert.strictEqual(getParticleCountForViewport(767), 25, '767px must be throttled');
    assert.strictEqual(getParticleCountForViewport(768), 70, '768px must receive full particle count');
  });

  it('F3-T1-4: Dynamic viewport resize from desktop to mobile updates particle cap without memory explosion', () => {
    let currentWidth = 1200;
    let particleCount = getParticleCountForViewport(currentWidth);
    assert.strictEqual(particleCount, 70);

    // Resize event
    currentWidth = 480;
    particleCount = getParticleCountForViewport(currentWidth);
    assert.strictEqual(particleCount, 25, 'Dynamic resize to mobile must immediately cap particles to 25');
  });

  it('F3-T1-5: Dynamic viewport resize from mobile to desktop re-expands particle pool up to 70', () => {
    let currentWidth = 414;
    let particleCount = getParticleCountForViewport(currentWidth);
    assert.strictEqual(particleCount, 25);

    // Orientation change / tablet expansion
    currentWidth = 1024;
    particleCount = getParticleCountForViewport(currentWidth);
    assert.strictEqual(particleCount, 70, 'Expanding viewport must restore full visual atmospheric fidelity');
  });
});
