/**
 * tests/tier1/f07_phase2_morph.test.js
 * Tier 1: Feature Coverage — Feature F7: Phase 02 Roadone HD55 Perspective Morph
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const PhysicsOracle = require('../helpers/physics-oracle');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const FRENTE_PATH = path.join(PROJECT_ROOT, 'web', 'assets', 'img', 'productos', 'roadone-hd55-frente.webp');
const ANGLE45_PATH = path.join(PROJECT_ROOT, 'web', 'assets', 'img', 'productos', 'roadone-hd55-45.webp');

describe('Feature F7: Phase 02 Roadone HD55 Perspective Morph (Tier 1)', () => {
  it('F7-T1-1: Phase 2 scroll interval occupies 25% to 55% scroll progression', () => {
    const start = PhysicsOracle.getScrollPhase(0.25);
    assert.strictEqual(start.phase, 2);
    assert.strictEqual(start.progress, 0.0);

    const end = PhysicsOracle.getScrollPhase(0.5499);
    assert.strictEqual(end.phase, 2);
    assert.strictEqual(Math.round(end.progress * 100) / 100, 1.0);
  });

  it('F7-T1-2: Frontal product image roadone-hd55-frente.webp exists with valid size', () => {
    assert.ok(fs.existsSync(FRENTE_PATH), 'roadone-hd55-frente.webp must exist');
    const stats = fs.statSync(FRENTE_PATH);
    assert.ok(stats.size > 50000, 'Frontal tire asset must be >50KB high-res WebP');
  });

  it('F7-T1-3: 45-degree product image roadone-hd55-45.webp exists with valid size', () => {
    assert.ok(fs.existsSync(ANGLE45_PATH), 'roadone-hd55-45.webp must exist');
    const stats = fs.statSync(ANGLE45_PATH);
    assert.ok(stats.size > 50000, '45-degree tire asset must be >50KB high-res WebP');
  });

  it('F7-T1-4: Cross-fade opacities transition inversely between frente and 45', () => {
    const atStart = PhysicsOracle.getPhase2Opacities(0.0);
    assert.strictEqual(atStart.frenteOpacity, 1.0, 'Frente opacity must be 1.0 at Phase 2 start');
    assert.strictEqual(atStart.angle45Opacity, 0.0, '45 opacity must be 0.0 at Phase 2 start');

    const atEnd = PhysicsOracle.getPhase2Opacities(1.0);
    assert.strictEqual(atEnd.frenteOpacity, 0.0, 'Frente opacity must be 0.0 at Phase 2 end');
    assert.strictEqual(atEnd.angle45Opacity, 1.0, '45 opacity must be 1.0 at Phase 2 end');
  });

  it('F7-T1-5: Sum of cross-fade opacities remains consistently normalized across transition', () => {
    for (let p = 0; p <= 1.0; p += 0.25) {
      const op = PhysicsOracle.getPhase2Opacities(p);
      const sum = op.frenteOpacity + op.angle45Opacity;
      assert.strictEqual(Math.round(sum * 100) / 100, 1.0, 'Opacities sum must equal 1.0');
    }
  });
});
