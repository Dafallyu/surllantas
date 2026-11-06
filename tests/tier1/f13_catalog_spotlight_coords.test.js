/**
 * tests/tier1/f13_catalog_spotlight_coords.test.js
 * Tier 1: Feature Coverage — Feature F13: Catalog Spotlight Cursor Tracking
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const DOMParserHelper = require('../helpers/dom-parser');
const PhysicsOracle = require('../helpers/physics-oracle');

describe('Feature F13: Catalog Spotlight Cursor Tracking (Tier 1)', () => {
  const dom = DOMParserHelper.getIndexHTML();

  it('F13-T1-1: Catalog section contains .category-card elements in DOM', () => {
    const cards = dom.getElementsByClassName('category-card');
    assert.ok(cards.length >= 4, 'Catalog grid must contain at least 4 category cards');
  });

  it('F13-T1-2: Spotlight coordinates calculate correctly relative to card bounding box', () => {
    const cardRect = { left: 100, top: 200, width: 300, height: 400 };
    const clientX = 150;
    const clientY = 320;

    const coords = PhysicsOracle.calculateSpotlightCoords(clientX, clientY, cardRect);
    assert.strictEqual(coords.mouseX, 50, 'mouseX must be clientX - left');
    assert.strictEqual(coords.mouseY, 120, 'mouseY must be clientY - top');
    assert.strictEqual(coords.isInside, true);
  });

  it('F13-T1-3: CSS custom variables --mouse-x and --mouse-y are formatted with pixel units', () => {
    const cardRect = { left: 0, top: 0, width: 200, height: 200 };
    const coords = PhysicsOracle.calculateSpotlightCoords(88, 142, cardRect);
    assert.strictEqual(coords.cssVarX, '88px');
    assert.strictEqual(coords.cssVarY, '142px');
  });

  it('F13-T1-4: Cursor coordinates outside card bounds are detected as out of bounds', () => {
    const cardRect = { left: 100, top: 100, width: 200, height: 200 };
    const coords = PhysicsOracle.calculateSpotlightCoords(50, 50, cardRect);
    assert.strictEqual(coords.isInside, false, 'Cursor with clientX < left must be outside');
  });

  it('F13-T1-5: Multiple cards track their independent coordinate frames without cross-talk', () => {
    const cardA = { left: 0, top: 0, width: 200, height: 200 };
    const cardB = { left: 300, top: 0, width: 200, height: 200 };

    const coordsA = PhysicsOracle.calculateSpotlightCoords(50, 50, cardA);
    const coordsB = PhysicsOracle.calculateSpotlightCoords(50, 50, cardB);

    assert.strictEqual(coordsA.isInside, true);
    assert.strictEqual(coordsB.isInside, false, 'Card B must not register hover from Card A position');
  });
});
