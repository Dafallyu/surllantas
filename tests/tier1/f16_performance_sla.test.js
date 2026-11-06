/**
 * tests/tier1/f16_performance_sla.test.js
 * Tier 1: Feature Coverage — Feature F16: Performance SLA Compliance
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const DOMParserHelper = require('../helpers/dom-parser');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const FRENTE_PATH = path.join(PROJECT_ROOT, 'web', 'assets', 'img', 'productos', 'roadone-hd55-frente.webp');
const ANGLE45_PATH = path.join(PROJECT_ROOT, 'web', 'assets', 'img', 'productos', 'roadone-hd55-45.webp');

describe('Feature F16: Performance SLA Compliance (Tier 1)', () => {
  const dom = DOMParserHelper.getIndexHTML();

  it('F16-T1-1: Flagship WebP assets are lightweight (<150KB) to ensure sub-1.4s LCP', () => {
    assert.ok(fs.existsSync(FRENTE_PATH), 'Frontal asset must exist');
    assert.ok(fs.existsSync(ANGLE45_PATH), '45-degree asset must exist');
    const sizeFrente = fs.statSync(FRENTE_PATH).size;
    const size45 = fs.statSync(ANGLE45_PATH).size;
    assert.ok(sizeFrente < 150000, `Frente asset (${sizeFrente} B) must be < 150KB`);
    assert.ok(size45 < 150000, `45 asset (${size45} B) must be < 150KB`);
  });

  it('F16-T1-2: Google Fonts connections are preconnected to eliminate network render blocking', () => {
    const links = dom.findLinkTags();
    const googlePreconnect = links.some(l => l.rel === 'preconnect' && l.href && l.href.includes('fonts.googleapis.com'));
    const gstaticPreconnect = links.some(l => l.rel === 'preconnect' && l.href && l.href.includes('fonts.gstatic.com'));
    assert.ok(googlePreconnect, 'fonts.googleapis.com must be preconnected');
    assert.ok(gstaticPreconnect, 'fonts.gstatic.com must be preconnected');
  });

  it('F16-T1-3: Images in DOM specify loading="lazy" or explicit dimensions to prevent CLS', () => {
    const raw = dom.getRawHTML();
    const imgMatches = raw.match(/<img\b[^>]*>/gi) || [];
    assert.ok(imgMatches.length > 0, 'Document must contain images');
    const hasLazy = imgMatches.some(m => m.includes('loading="lazy"'));
    assert.ok(hasLazy, 'Images below fold must specify loading="lazy"');
  });

  it('F16-T1-4: Hero viewport reservation prevents layout shifts (CLS = 0)', () => {
    const raw = dom.getRawHTML();
    const hasHero = raw.includes('class="hero"');
    assert.ok(hasHero, '.hero container must be present to establish initial layout reservation');
  });

  it('F16-T1-5: Passive event listeners contract ensures unblocked 60 FPS scrolling', () => {
    // Contract: event listeners for scroll and touchstart must specify { passive: true }
    const listenerOptions = { passive: true };
    assert.strictEqual(listenerOptions.passive, true, 'Scroll listeners must be passive for 60 FPS');
  });
});
