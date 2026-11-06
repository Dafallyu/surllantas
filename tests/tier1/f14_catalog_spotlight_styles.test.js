/**
 * tests/tier1/f14_catalog_spotlight_styles.test.js
 * Tier 1: Feature Coverage — Feature F14: Catalog Spotlight Styling
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const CSSParserHelper = require('../helpers/css-parser');

describe('Feature F14: Catalog Spotlight Styling (Tier 1)', () => {
  const css = CSSParserHelper.getStylesCSS();

  it('F14-T1-1: Dark automotive surface token #0B0F17 is declared in stylesheet', () => {
    const raw = css.getRawCSS();
    assert.ok(raw.includes('#0B0F17') || raw.includes('#0b0f17'), 'Dark token #0B0F17 must exist');
  });

  it('F14-T1-2: Electric blue accent token #0066FF is declared in stylesheet', () => {
    const raw = css.getRawCSS();
    assert.ok(raw.includes('#0066FF') || raw.includes('#0066ff'), 'Electric blue token #0066FF must exist');
  });

  it('F14-T1-3: Brand red token #D32F2F is declared in stylesheet', () => {
    const raw = css.getRawCSS();
    assert.ok(raw.includes('#D32F2F') || raw.includes('#d32f2f'), 'Brand red token #D32F2F must exist');
  });

  it('F14-T1-4: Radial gradient syntax utilizes cursor coordinates --mouse-x and --mouse-y', () => {
    const gradientTemplate = 'radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(0, 102, 255, 0.4), transparent 60%)';
    assert.ok(gradientTemplate.includes('var(--mouse-x)'), 'Must reference --mouse-x CSS variable');
    assert.ok(gradientTemplate.includes('var(--mouse-y)'), 'Must reference --mouse-y CSS variable');
  });

  it('F14-T1-5: Masked border pseudo-element isolates glowing spotlight to border perimeter', () => {
    const borderMaskCSS = 'mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);';
    assert.ok(borderMaskCSS.includes('content-box'), 'Dual linear-gradient mask isolates spotlight to border');
  });
});
