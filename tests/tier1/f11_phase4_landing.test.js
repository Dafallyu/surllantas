/**
 * tests/tier1/f11_phase4_landing.test.js
 * Tier 1: Feature Coverage — Feature F11: Phase 04 Tire Landing into WhatsApp CTA
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const DOMParserHelper = require('../helpers/dom-parser');
const PhysicsOracle = require('../helpers/physics-oracle');

describe('Feature F11: Phase 04 Tire Landing into WhatsApp CTA (Tier 1)', () => {
  const dom = DOMParserHelper.getIndexHTML();

  it('F11-T1-1: Phase 4 scroll interval occupies 80% to 100% scroll progression', () => {
    const start = PhysicsOracle.getScrollPhase(0.80);
    assert.strictEqual(start.phase, 4);
    assert.strictEqual(start.progress, 0.0);

    const end = PhysicsOracle.getScrollPhase(1.00);
    assert.strictEqual(end.phase, 4);
    assert.strictEqual(end.progress, 1.0);
  });

  it('F11-T1-2: Landing anchor section .section-quote-bar exists in index.html', () => {
    const quoteBar = dom.getElementsByClassName('section-quote-bar');
    assert.ok(quoteBar.length > 0, '.section-quote-bar must exist as landing anchor');
  });

  it('F11-T1-3: Quote form with id="tireQuoteForm" exists with required input elements', () => {
    const form = dom.getElementById('tireQuoteForm');
    assert.ok(form !== null, '#tireQuoteForm must be present');
    const raw = dom.getRawHTML();
    assert.ok(raw.includes('id="quoteVehicle"'), 'quoteVehicle select must exist');
    assert.ok(raw.includes('id="quoteSize"'), 'quoteSize input must exist');
    assert.ok(raw.includes('id="quoteBrand"'), 'quoteBrand select must exist');
  });

  it('F11-T1-4: WhatsApp quote URL builder formats pre-populated Roadone HD55 truck inquiry', () => {
    const vehicle = 'Camión / Transporte Pesado';
    const size = '315/70 R22.5';
    const brand = 'Roadone HD55';
    const url = PhysicsOracle.buildWhatsAppQuoteURL(vehicle, size, brand);

    assert.ok(url.startsWith('https://wa.me/59172960725'), 'Target WhatsApp number must be 59172960725');
    assert.ok(url.includes(encodeURIComponent('Camión / Transporte Pesado')), 'Vehicle must be encoded');
    assert.ok(url.includes(encodeURIComponent('315/70 R22.5')), 'Size must be encoded');
    assert.ok(url.includes(encodeURIComponent('Roadone HD55')), 'Brand must be encoded');
  });

  it('F11-T1-5: Submit button inside quote form contains WhatsApp icon and CTA text', () => {
    const raw = dom.getRawHTML();
    const btnMatch = raw.match(/<button[^>]*class=["'][^"']*btn--quote-submit[^"']*["'][^>]*>([\s\S]*?)<\/button>/i);
    assert.ok(btnMatch !== null, 'Submit button with .btn--quote-submit must exist');
    assert.ok(btnMatch[1].includes('svg'), 'Submit button must include SVG icon');
    assert.ok(btnMatch[1].includes('Consultar Stock'), 'Submit button must have accessible CTA text');
  });
});
