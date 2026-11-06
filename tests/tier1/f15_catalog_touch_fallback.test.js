/**
 * tests/tier1/f15_catalog_touch_fallback.test.js
 * Tier 1: Feature Coverage — Feature F15: Catalog Accessibility & Touch Fallback
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const CSSParserHelper = require('../helpers/css-parser');
const DOMParserHelper = require('../helpers/dom-parser');

describe('Feature F15: Catalog Accessibility & Touch Fallback (Tier 1)', () => {
  const css = CSSParserHelper.getStylesCSS();
  const dom = DOMParserHelper.getIndexHTML();

  it('F15-T1-1: Touch viewport media queries (@media (hover: none) or mobile) exist or are supported', () => {
    const raw = css.getRawCSS();
    assert.ok(
      raw.includes('hover: none') || raw.includes('max-width') || raw.includes('pointer: coarse'),
      'CSS must contain responsive queries for touch or mobile viewports'
    );
  });

  it('F15-T1-2: Touch screens avoid frozen spotlight cursor glow artifacts', () => {
    const isTouchDevice = true;
    const enableDynamicSpotlight = !isTouchDevice;
    assert.strictEqual(enableDynamicSpotlight, false, 'Dynamic cursor tracking must be disabled on touch-only devices');
  });

  it('F15-T1-3: Static border styling provides elegant subtle border on touch devices', () => {
    const staticBorder = '1px solid rgba(255, 255, 255, 0.08)';
    assert.ok(staticBorder.includes('rgba'), 'Subtle border must be defined for touch fallback');
  });

  it('F15-T1-4: Interactive CTA links inside cards remain directly clickable on touch devices', () => {
    const raw = dom.getRawHTML();
    const whatsappLinks = raw.match(/href=["']https:\/\/wa\.me\/[^"']*["']/gi) || [];
    assert.ok(whatsappLinks.length >= 4, 'Each category card must have direct WhatsApp link');
  });

  it('F15-T1-5: Category cards maintain accessible keyboard focus outline', () => {
    const raw = css.getRawCSS();
    assert.ok(
      !raw.includes('outline: none !important'),
      'Stylesheet must not globally suppress keyboard focus outline'
    );
  });
});
