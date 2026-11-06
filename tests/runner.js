#!/usr/bin/env node
/**
 * tests/runner.js
 * Master Automated E2E Test Suite Runner for SurLlantas Web Portal.
 *
 * Usage:
 *   node tests/runner.js                     # Run full test suite (Tiers 1-4)
 *   node tests/runner.js --tier=1           # Run Tier 1 Feature Coverage
 *   node tests/runner.js --tier=2           # Run Tier 2 Boundary Cases
 *   node tests/runner.js --tier=3           # Run Tier 3 Cross-Feature Matrix
 *   node tests/runner.js --tier=4           # Run Tier 4 Real-World Scenarios
 *   node tests/runner.js --milestone=M1     # Run Milestone 1 tests (F1-F4)
 *   node tests/runner.js --milestone=M2     # Run Milestone 2 tests (F5-F12)
 *   node tests/runner.js --milestone=M3     # Run Milestone 3 tests (F13-F15)
 *   node tests/runner.js --milestone=M4     # Run Milestone 4 tests (F16-F17)
 *   node tests/runner.js --feature=F1       # Run tests for specific feature
 *   node tests/runner.js --summary          # Show compact status table
 */

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const TESTS_DIR = __dirname;
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Milestone to Feature Mapping
const MILESTONE_MAP = {
  M1: ['f01', 'f02', 'f03', 'f04'],
  M2: ['f05', 'f06', 'f07', 'f08', 'f09', 'f10', 'f11', 'f12'],
  M3: ['f13', 'f14', 'f15'],
  M4: ['f16', 'f17'],
  E2E: ['f18']
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    tier: 'all',
    milestone: null,
    feature: null,
    summary: false,
    verbose: false
  };

  for (const arg of args) {
    if (arg.startsWith('--tier=')) {
      options.tier = arg.split('=')[1];
    } else if (arg.startsWith('--milestone=')) {
      options.milestone = arg.split('=')[1].toUpperCase();
    } else if (arg.startsWith('--feature=')) {
      options.feature = arg.split('=')[1].toLowerCase();
    } else if (arg === '--summary') {
      options.summary = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    }
  }

  return options;
}

function discoverTestFiles(options) {
  const files = [];

  const addTierFiles = (tierDir, prefix = null) => {
    const fullDir = path.join(TESTS_DIR, tierDir);
    if (!fs.existsSync(fullDir)) return;
    const entries = fs.readdirSync(fullDir).filter(f => f.endsWith('.test.js'));
    for (const file of entries) {
      if (prefix && !file.startsWith(prefix)) continue;
      files.push(path.join(fullDir, file));
    }
  };

  // Filter by Feature
  if (options.feature) {
    let fNum = options.feature.replace(/^f/, '');
    if (fNum.length === 1) fNum = '0' + fNum;
    const prefix = 'f' + fNum;
    addTierFiles('tier1', prefix);
    addTierFiles('tier2', prefix);
    return files;
  }

  // Filter by Milestone
  if (options.milestone && MILESTONE_MAP[options.milestone]) {
    const prefixes = MILESTONE_MAP[options.milestone];
    for (const pfx of prefixes) {
      addTierFiles('tier1', pfx);
      addTierFiles('tier2', pfx);
    }
    return files;
  }

  // Filter by Tier
  if (options.tier === '1') {
    addTierFiles('tier1');
  } else if (options.tier === '2') {
    addTierFiles('tier2');
  } else if (options.tier === '3') {
    addTierFiles('tier3');
  } else if (options.tier === '4') {
    addTierFiles('tier4');
  } else if (options.tier === '5') {
    const t5File = path.join(TESTS_DIR, 'tier5_adversarial_hardening.test.js');
    if (fs.existsSync(t5File)) files.push(t5File);
  } else if (options.tier === '6') {
    const t6File = path.join(TESTS_DIR, 'tier6_strict_ui_invariants.test.js');
    if (fs.existsSync(t6File)) files.push(t6File);
  } else {
    // All tiers: Tier 1 to Tier 6
    addTierFiles('tier1');
    addTierFiles('tier2');
    addTierFiles('tier3');
    addTierFiles('tier4');
    const t5File = path.join(TESTS_DIR, 'tier5_adversarial_hardening.test.js');
    if (fs.existsSync(t5File)) files.push(t5File);
    const t6File = path.join(TESTS_DIR, 'tier6_strict_ui_invariants.test.js');
    if (fs.existsSync(t6File)) files.push(t6File);
  }

  return files;
}

function runTests() {
  const options = parseArgs();
  const testFiles = discoverTestFiles(options);

  console.log('================================================================');
  console.log('       SURLYTIC E2E AUTOMATED TEST RUNNER — SURLANTAS');
  console.log('================================================================');
  console.log(`Discovered ${testFiles.length} test suite file(s).`);
  console.log(`Filter Scope: Tier=[${options.tier}], Milestone=[${options.milestone || 'ALL'}], Feature=[${options.feature || 'ALL'}]`);
  console.log('----------------------------------------------------------------\n');

  if (testFiles.length === 0) {
    console.error('Error: No test files matched the specified filter.');
    process.exit(1);
  }

  const startTime = Date.now();
  const relativeFiles = testFiles.map(f => path.relative(PROJECT_ROOT, f));

  // Spawn node --test with selected files
  const child = spawnSync(process.execPath, ['--test', ...relativeFiles], {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    stdio: 'pipe'
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const stdout = child.stdout || '';
  const stderr = child.stderr || '';

  // Parse results from node:test output
  const passMatches = stdout.match(/✔/g) || [];
  const failMatches = stdout.match(/✖/g) || [];

  // Extract totals from footer
  const testsTotalMatch = stdout.match(/ℹ tests\s+(\d+)/);
  const passTotalMatch = stdout.match(/ℹ pass\s+(\d+)/);
  const failTotalMatch = stdout.match(/ℹ fail\s+(\d+)/);

  const totalTests = testsTotalMatch ? parseInt(testsTotalMatch[1], 10) : (passMatches.length + failMatches.length);
  const totalPass = passTotalMatch ? parseInt(passTotalMatch[1], 10) : passMatches.length;
  const totalFail = failTotalMatch ? parseInt(failTotalMatch[1], 10) : failMatches.length;

  if (options.verbose || child.status !== 0) {
    console.log(stdout);
    if (stderr) console.error(stderr);
  }

  console.log('\n================================================================');
  console.log('                      TEST EXECUTION SUMMARY');
  console.log('================================================================');
  console.log(`Total Files Executed : ${testFiles.length}`);
  console.log(`Total Test Cases     : ${totalTests}`);
  console.log(`Passed Test Cases    : ${totalPass}`);
  console.log(`Failed Test Cases    : ${totalFail}`);
  console.log(`Execution Duration   : ${duration}s`);
  console.log(`Exit Status Code     : ${child.status}`);
  console.log('----------------------------------------------------------------');

  if (child.status === 0 && totalFail === 0) {
    console.log('RESULT: [SUCCESS] All targeted test cases PASSED cleanly.');
    console.log('================================================================\n');
    process.exit(0);
  } else {
    console.log('RESULT: [ATTENTION] Some tests failed (Expected for pending milestones).');
    console.log('================================================================\n');
    process.exit(child.status || 1);
  }
}

runTests();
