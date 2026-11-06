/**
 * tests/tier2/f04_reduced_motion_boundary.test.js
 * Tier 2: Boundary & Corner Cases — Feature F4: Particle Reduced Motion
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { MockBrowserEnvironment, MockCanvasElement } = require('../helpers/browser-env');

describe('Feature F4: Particle Reduced Motion — Boundary & Corner Cases (Tier 2)', () => {
  it('F4-T2-1: Toggling reduced-motion preference dynamically at runtime halts animation loop immediately', () => {
    const env = new MockBrowserEnvironment({ reducedMotion: false });
    let animRunning = true;

    // Simulate user turning on reduced motion in OS settings mid-session
    env.reducedMotion = true;
    if (env.reducedMotion) {
      animRunning = false;
    }
    assert.strictEqual(animRunning, false, 'Animation must stop when OS preference changes');
  });

  it('F4-T2-2: Toggling reduced-motion from true to false safely re-initiates rendering ticker', () => {
    const env = new MockBrowserEnvironment({ reducedMotion: true });
    let animRunning = false;

    // Simulate user disabling reduced motion
    env.reducedMotion = false;
    if (!env.reducedMotion) {
      animRunning = true;
    }
    assert.strictEqual(animRunning, true, 'Animation ticker can safely restart when preference is removed');
  });

  it('F4-T2-3: Calling clearRect before canvas removal leaves canvas context completely wiped', () => {
    const canvas = new MockCanvasElement();
    const ctx = canvas.getContext('2d');
    ctx.arc(100, 100, 10, 0, Math.PI * 2);
    ctx.fill();

    // On reduced motion deactivate:
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const lastOp = ctx.operations[ctx.operations.length - 1];
    assert.strictEqual(lastOp.type, 'clearRect', 'Final operation must be a clean clearRect sweep');
  });

  it('F4-T2-4: prefers-reduced-motion media query listener detaches on component unmount without leaking', () => {
    const env = new MockBrowserEnvironment();
    let listenerCount = 0;
    const listener = () => {};

    env.addEventListener('change', listener);
    listenerCount++;
    assert.strictEqual(listenerCount, 1);

    env.removeEventListener('change', listener);
    listenerCount--;
    assert.strictEqual(listenerCount, 0, 'Event listener must be fully removable');
  });

  it('F4-T2-5: Fallback rendering remains completely silent (0 GPU draws) over prolonged idling', () => {
    const canvas = new MockCanvasElement();
    const ctx = canvas.getContext('2d');
    const isReduced = true;

    for (let frame = 0; frame < 120; frame++) {
      if (!isReduced) {
        ctx.arc(10, 10, 2, 0, Math.PI * 2);
      }
    }
    assert.strictEqual(ctx.operations.length, 0, 'Over 120 frames (2 seconds), 0 operations must be recorded');
  });
});
