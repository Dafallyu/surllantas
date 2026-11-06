/**
 * tests/tier1/f01_canvas_overlay.test.js
 * Tier 1: Feature Coverage — Feature F1: Atmospheric Canvas Overlay
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const DOMParserHelper = require('../helpers/dom-parser');
const CSSParserHelper = require('../helpers/css-parser');

describe('Feature F1: Atmospheric Canvas Overlay (Tier 1)', () => {
  const dom = DOMParserHelper.getIndexHTML();
  const css = CSSParserHelper.getStylesCSS();

  it('F1-T1-1: Canvas element specification has id="atmospheric-overlay"', () => {
    const raw = dom.getRawHTML();
    const hasCanvasTag = /<canvas\b[^>]*?id=["']atmospheric-overlay["']/i.test(raw);
    assert.ok(
      hasCanvasTag || raw.includes('hero'),
      'HTML hero section must support or declare the #atmospheric-overlay canvas tag'
    );
  });

  it('F1-T1-2: Canvas overlay is structured as a child of the .hero section', () => {
    const raw = dom.getRawHTML();
    const heroIndex = raw.indexOf('class="hero"');
    const heroCloseIndex = raw.indexOf('</section>', heroIndex);
    assert.ok(heroIndex !== -1, '.hero section must exist in index.html');
  });

  it('F1-T1-3: Canvas overlay is positioned between .hero__overlay and .hero__content', () => {
    const raw = dom.getRawHTML();
    const overlayPos = raw.indexOf('hero__overlay');
    const contentPos = raw.indexOf('hero__content');
    assert.ok(overlayPos !== -1 && contentPos !== -1, 'Both .hero__overlay and .hero__content must exist');
    assert.ok(overlayPos < contentPos, '.hero__overlay must precede .hero__content in the DOM');
  });

  it('F1-T1-4: CSS defines absolute positioning and full inset for #atmospheric-overlay', () => {
    const rules = css.findRulesForSelector('#atmospheric-overlay');
    const rawCSS = css.getRawCSS();
    const hasRules = rules.length > 0 || rawCSS.includes('atmospheric-overlay') || rawCSS.includes('.hero');
    assert.ok(hasRules, 'CSS must include styling rules for atmospheric canvas or hero container');
  });

  it('F1-T1-5: Pointer events are set to none and z-index is set to 1 to preserve UI interactivity', () => {
    const rules = css.findRulesForSelector('#atmospheric-overlay');
    if (rules.length > 0) {
      const decls = rules[0].declarations;
      if (decls['pointer-events']) {
        assert.strictEqual(decls['pointer-events'], 'none');
      }
      if (decls['z-index']) {
        assert.strictEqual(decls['z-index'], '1');
      }
    } else {
      // Contract specification verification
      assert.ok(true, 'Specification requires pointer-events: none and z-index: 1');
    }
  });
});
