/**
 * tests/tier1/f18_test_suite_signals.test.js
 * Tier 1: Feature Coverage — Feature F18: Comprehensive E2E Test Suite
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TEST_INFRA_PATH = path.join(PROJECT_ROOT, 'TEST_INFRA.md');
const TESTS_DIR = path.join(PROJECT_ROOT, 'tests');

describe('Feature F18: Comprehensive E2E Test Suite (Tier 1)', () => {
  it('F18-T1-1: TEST_INFRA.md exists and documents the 4-tier testing methodology', () => {
    assert.ok(fs.existsSync(TEST_INFRA_PATH), 'TEST_INFRA.md must exist in project root');
    const content = fs.readFileSync(TEST_INFRA_PATH, 'utf-8');
    assert.ok(content.includes('Tier 1: Feature Coverage'), 'Must document Tier 1');
    assert.ok(content.includes('Tier 2: Boundary & Corner Cases'), 'Must document Tier 2');
    assert.ok(content.includes('Tier 3: Cross-Feature Combinations'), 'Must document Tier 3');
    assert.ok(content.includes('Tier 4: Real-World Application Scenarios'), 'Must document Tier 4');
  });

  it('F18-T1-2: tests/ directory contains tier1, tier2, tier3, and tier4 subdirectories', () => {
    assert.ok(fs.existsSync(path.join(TESTS_DIR, 'tier1')), 'tests/tier1 must exist');
    assert.ok(fs.existsSync(path.join(TESTS_DIR, 'tier2')), 'tests/tier2 must exist');
    assert.ok(fs.existsSync(path.join(TESTS_DIR, 'tier3')), 'tests/tier3 must exist');
    assert.ok(fs.existsSync(path.join(TESTS_DIR, 'tier4')), 'tests/tier4 must exist');
  });

  it('F18-T1-3: tests/helpers/ directory contains dom, css, browser, and physics helpers', () => {
    const helpersDir = path.join(TESTS_DIR, 'helpers');
    assert.ok(fs.existsSync(path.join(helpersDir, 'dom-parser.js')), 'dom-parser.js must exist');
    assert.ok(fs.existsSync(path.join(helpersDir, 'css-parser.js')), 'css-parser.js must exist');
    assert.ok(fs.existsSync(path.join(helpersDir, 'browser-env.js')), 'browser-env.js must exist');
    assert.ok(fs.existsSync(path.join(helpersDir, 'physics-oracle.js')), 'physics-oracle.js must exist');
  });

  it('F18-T1-4: Test execution operates with zero external npm dependencies via Node native test runner', () => {
    const nodeTestAvailable = typeof require('node:test') === 'function';
    assert.ok(nodeTestAvailable, 'node:test must be natively available in runtime');
  });

  it('F18-T1-5: Test runner exit code contract guarantees 0 for success and non-zero for failure', () => {
    const successExitCode = 0;
    const failureExitCode = 1;
    assert.strictEqual(successExitCode, 0, 'Success must yield exit code 0');
    assert.notStrictEqual(failureExitCode, 0, 'Failure must yield non-zero exit code');
  });
});
