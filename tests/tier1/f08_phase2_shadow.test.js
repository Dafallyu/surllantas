/**
 * tests/tier1/f08_phase2_shadow.test.js
 * Tier 1: Feature Coverage — Feature F8: Phase 02 Contact Shadow Matrix Deformation
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const PhysicsOracle = require('../helpers/physics-oracle');

describe('Feature F8: Phase 02 Contact Shadow Matrix Deformation (Tier 1)', () => {
  it('F8-T1-1: Affine matrix at Phase 2 start (0.0) exhibits zero shear skewing', () => {
    const matrix = PhysicsOracle.getShadowAffineMatrix(0.0);
    assert.strictEqual(matrix.c, 0, 'Skew X must be 0 at start');
    assert.strictEqual(matrix.tx, 0, 'Translation X must be 0 at start');
  });

  it('F8-T1-2: Affine matrix at Phase 2 completion (1.0) achieves full perspective deformation', () => {
    const matrix = PhysicsOracle.getShadowAffineMatrix(1.0);
    assert.ok(matrix.c < 0, 'Skew X must be negative for 45-degree isometric projection');
    assert.ok(matrix.tx > 0, 'Translation X must shift contact center rightward');
  });

  it('F8-T1-3: Matrix cssString matches standard CSS transform matrix(a, b, c, d, tx, ty) syntax', () => {
    const matrix = PhysicsOracle.getShadowAffineMatrix(0.5);
    const cssRegex = /^matrix\(\s*[-0-9.]+\s*,\s*[-0-9.]+\s*,\s*[-0-9.]+\s*,\s*[-0-9.]+\s*,\s*[-0-9.]+\s*,\s*[-0-9.]+\s*\)$/;
    assert.ok(cssRegex.test(matrix.cssString), 'CSS transform string must conform to matrix specification');
  });

  it('F8-T1-4: Determinant of affine transformation remains positive (non-inverted shadow geometry)', () => {
    for (let p = 0; p <= 1.0; p += 0.25) {
      const m = PhysicsOracle.getShadowAffineMatrix(p);
      const det = m.a * m.d - m.b * m.c;
      assert.ok(det > 0.5, 'Affine matrix determinant must remain positive to prevent reflection flip');
    }
  });

  it('F8-T1-5: Vertical scale factor contracts smoothly as tire perspective angles forward', () => {
    const start = PhysicsOracle.getShadowAffineMatrix(0.0);
    const end = PhysicsOracle.getShadowAffineMatrix(1.0);
    assert.ok(end.d < start.d, 'Vertical dimension must compress to simulate perspective foreshortening');
  });
});
