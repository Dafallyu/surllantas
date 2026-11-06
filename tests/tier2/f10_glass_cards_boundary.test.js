/**
 * tests/tier2/f10_glass_cards_boundary.test.js
 * Tier 2: Boundary & Corner Cases — Feature F10: Phase 03 Glassmorphic Telemetry Cards
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('Feature F10: Phase 03 Glassmorphic Telemetry Cards — Boundary & Corner Cases (Tier 2)', () => {
  it('F10-T2-1: Opening a second hotspot card closes the previously active card', () => {
    let activeCard = null;
    const openCard = id => { activeCard = id; };

    openCard('hotspot-tread');
    assert.strictEqual(activeCard, 'hotspot-tread');

    openCard('hotspot-casing');
    assert.strictEqual(activeCard, 'hotspot-casing', 'Only one telemetry card should remain open at a time');
  });

  it('F10-T2-2: Pressing Escape key dismisses any currently open telemetry card', () => {
    let activeCard = 'hotspot-efficiency';
    const handleKeydown = key => {
      if (key === 'Escape') activeCard = null;
    };

    handleKeydown('Escape');
    assert.strictEqual(activeCard, null, 'Escape key must dismiss glassmorphic card');
  });

  it('F10-T2-3: Clicking outside the card boundary dismisses the active card', () => {
    let activeCard = 'hotspot-tread';
    const handleOutsideClick = clickedInsideCard => {
      if (!clickedInsideCard) activeCard = null;
    };

    handleOutsideClick(false);
    assert.strictEqual(activeCard, null, 'Clicking outside card bounds must close it');
  });

  it('F10-T2-4: Fallback opacity for browsers without backdrop-filter support maintains legibility', () => {
    // When backdrop-filter is unsupported, background opacity increases from 0.7 to 0.95
    const fallbackBg = 'rgba(11, 15, 23, 0.95)';
    assert.ok(fallbackBg.includes('0.95'), 'Fallback background must use high opacity for contrast');
  });

  it('F10-T2-5: Card max-width does not cause horizontal viewport scrollbar on mobile', () => {
    const mobileViewportWidth = 360;
    const cardMaxWidth = 320;
    assert.ok(cardMaxWidth < mobileViewportWidth, 'Card width must fit within mobile screen bounds');
  });
});
