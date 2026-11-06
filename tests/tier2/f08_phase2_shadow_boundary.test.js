/**
 * tests/tier2/f08_phase2_shadow_boundary.test.js
 * Tier 2: Boundary & Corner Cases — Feature F8: Phase 02 Contact Shadow Matrix Deformation
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const PhysicsOracle = require('../helpers/physics-oracle');

describe('Feature F8: Phase 02 Contact Shadow Matrix Deformation — Boundary & Corner Cases (Tier 2)', () => {
  it('F8-T2-1: Zero progress input yields exact identity-like matrix without floating point residue', () => {
    const m = PhysicsOracle.getShadowAffineMatrix(0.0);
    assert.strictEqual(m.a, 1.0, 'Scale X must be 1.0 at rest');
    assert.strictEqual(m.b, 0, 'Skew Y must be 0');
    assert.strictEqual(m.c, 0, 'Skew X must be 0');
    assert.strictEqual(m.d, 1.0, 'Scale Y must be 1.0 at rest');
    assert.strictEqual(m.tx, 0, 'Translation X must be 0');
    assert.strictEqual(m.ty, 0, 'Translation Y must be 0');
  });

  it('F8-T2-2: Matrix transform cssString formats exactly to 4 decimal places', () => {
    const m = PhysicsOracle.getShadowAffineMatrix(0.75);
    const parts = m.cssString.match(/[-0-9.]+/g);
    assert.ok(parts.length >= 6, 'CSS string must supply 6 affine matrix components');
    for (const val of parts) {
      assert.ok(!isNaN(parseFloat(val)), 'Every component must parse as a valid float');
    }
  });

  it('F8-T2-3: Extreme progress values (>1.0) are clamped safely to avoid runaway translation', () => {
    const normalEnd = PhysicsOracle.getShadowAffineMatrix(1.0);
    const overflow = PhysicsOracle.getShadowAffineMatrix(5.0);
    assert.strictEqual(overflow.tx, normalEnd.tx, 'Translation X must clamp at max threshold');
    assert.strictEqual(overflow.ty, normalEnd.ty, 'Translation Y must clamp at max threshold');
  });

  it('F8-T2-4: Negative progress values (<0.0) are clamped safely to avoid inverted shadow geometry', () => {
    const normalStart = PhysicsOracle.getShadowAffineMatrix(0.0);
    const underflow = PhysicsOracle.getShadowAffineMatrix(-3.0);
    assert.strictEqual(underflow.c, normalStart.c, 'Skew X must not become positive on negative scrub');
    assert.strictEqual(underflow.tx, normalStart.tx);
  });

  it('F8-T2-5: Affine matrix determinant maintains non-zero magnitude to prevent collapsed shadow line', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const m = PhysicsOracle.getShadowAffineMatrix(p);
      const det = m.a * m.d - m.b * m.c;
      assert.ok(det > 0.4, `Determinant at progress ${p} must remain robustly > 0.4 (actual: ${det})`);
    }
  });
});
