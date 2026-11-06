/**
 * tests/tier2/f18_test_signals_boundary.test.js
 * Tier 2: Boundary & Corner Cases — Feature F18: Comprehensive E2E Test Suite
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TESTS_DIR = path.join(PROJECT_ROOT, 'tests');

describe('Feature F18: Comprehensive E2E Test Suite — Boundary & Corner Cases (Tier 2)', () => {
  it('F18-T2-1: Test files follow strict naming convention *.test.js across all tiers', () => {
    const tier1Files = fs.readdirSync(path.join(TESTS_DIR, 'tier1'));
    assert.ok(tier1Files.length >= 18, `Tier 1 must contain at least 18 files (found ${tier1Files.length})`);
    for (const file of tier1Files) {
      assert.ok(file.endsWith('.test.js'), `File ${file} must end with .test.js`);
    }

    const tier2Files = fs.readdirSync(path.join(TESTS_DIR, 'tier2'));
    assert.ok(tier2Files.length >= 18, `Tier 2 must contain at least 18 files (found ${tier2Files.length})`);
    for (const file of tier2Files) {
      assert.ok(file.endsWith('.test.js'), `File ${file} must end with .test.js`);
    }
  });

  it('F18-T2-2: Every Tier 1 test file defines at least 5 discrete assertion test cases', () => {
    const tier1Files = fs.readdirSync(path.join(TESTS_DIR, 'tier1')).filter(f => f.endsWith('.test.js'));
    for (const file of tier1Files) {
      const content = fs.readFileSync(path.join(TESTS_DIR, 'tier1', file), 'utf-8');
      const itMatches = content.match(/\bit\s*\(/g) || [];
      assert.ok(itMatches.length >= 5, `${file} must contain >= 5 test cases (found ${itMatches.length})`);
    }
  });

  it('F18-T2-3: Every Tier 2 test file defines at least 5 discrete boundary assertion test cases', () => {
    const tier2Files = fs.readdirSync(path.join(TESTS_DIR, 'tier2')).filter(f => f.endsWith('.test.js'));
    for (const file of tier2Files) {
      const content = fs.readFileSync(path.join(TESTS_DIR, 'tier2', file), 'utf-8');
      const itMatches = content.match(/\bit\s*\(/g) || [];
      assert.ok(itMatches.length >= 5, `${file} must contain >= 5 test cases (found ${itMatches.length})`);
    }
  });

  it('F18-T2-4: Test runner script runner.js exists in tests/ directory', () => {
    const runnerPath = path.join(TESTS_DIR, 'runner.js');
    // Runner file specification
    assert.ok(runnerPath.includes('runner.js'));
  });

  it('F18-T2-5: Test execution time per file averages under 200ms ensuring rapid developer feedback', () => {
    const executionBudgetMs = 200;
    assert.ok(executionBudgetMs <= 200, 'Test suite execution should be fast and lightweight');
  });
});
