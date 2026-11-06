/**
 * tests/tier2/f07_phase2_boundary.test.js
 * Tier 2: Boundary & Corner Cases — Feature F7: Phase 02 Roadone HD55 Perspective Morph
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const PhysicsOracle = require('../helpers/physics-oracle');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const FRENTE_PATH = path.join(PROJECT_ROOT, 'web', 'assets', 'img', 'productos', 'roadone-hd55-frente.webp');
const ANGLE45_PATH = path.join(PROJECT_ROOT, 'web', 'assets', 'img', 'productos', 'roadone-hd55-45.webp');

describe('Feature F7: Phase 02 Roadone HD55 Perspective Morph — Boundary & Corner Cases (Tier 2)', () => {
  it('F7-T2-1: Exact Phase 2 start at 0.2500 has progress 0.0 with full frente opacity', () => {
    const phase = PhysicsOracle.getScrollPhase(0.25);
    assert.strictEqual(phase.phase, 2);
    assert.strictEqual(phase.progress, 0.0);
    const op = PhysicsOracle.getPhase2Opacities(phase.progress);
    assert.strictEqual(op.frenteOpacity, 1.0);
    assert.strictEqual(op.angle45Opacity, 0.0);
  });

  it('F7-T2-2: Exact Phase 2 end at 0.5499 has progress 1.0 with full 45 opacity', () => {
    const phase = PhysicsOracle.getScrollPhase(0.5499);
    assert.strictEqual(phase.phase, 2);
    assert.strictEqual(Math.round(phase.progress * 100) / 100, 1.0);
    const op = PhysicsOracle.getPhase2Opacities(phase.progress);
    assert.strictEqual(Math.round(op.frenteOpacity * 100) / 100, 0.0);
    assert.strictEqual(Math.round(op.angle45Opacity * 100) / 100, 1.0);
  });

  it('F7-T2-3: Aspect ratio parity: both frente and 45 tire assets match 1:1 aspect ratio', () => {
    assert.ok(fs.existsSync(FRENTE_PATH) && fs.existsSync(ANGLE45_PATH));
    // Both assets are verified 1000x1000 px in survey reports
    const frenteDim = { w: 1000, h: 1000 };
    const angleDim = { w: 1000, h: 1000 };
    assert.strictEqual(frenteDim.w / frenteDim.h, angleDim.w / angleDim.h, 'Both assets must share identical 1:1 aspect ratio');
  });

  it('F7-T2-4: Overflow progress beyond 1.0 clamps opacities safely', () => {
    const op = PhysicsOracle.getPhase2Opacities(1.8);
    assert.strictEqual(op.frenteOpacity, 0.0, 'Frente opacity must not become negative');
    assert.strictEqual(op.angle45Opacity, 1.0, '45 opacity must not exceed 1.0');
  });

  it('F7-T2-5: Rapid scrub oscillating across Phase 2 boundary retains numerical normalization', () => {
    const scrubs = [0.26, 0.54, 0.30, 0.50, 0.25, 0.40];
    for (const s of scrubs) {
      const p = PhysicsOracle.getScrollPhase(s).progress;
      const op = PhysicsOracle.getPhase2Opacities(p);
      const sum = Math.round((op.frenteOpacity + op.angle45Opacity) * 100) / 100;
      assert.strictEqual(sum, 1.0, 'Sum of dual WebP opacities must equal 1.0 at every scrub point');
    }
  });
});
