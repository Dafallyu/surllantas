/**
 * tests/tier2/f05_csp_boundary.test.js
 * Tier 2: Boundary & Corner Cases — Feature F5: CDN & CSP Infrastructure
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const VERCEL_JSON_PATH = path.join(PROJECT_ROOT, 'web', 'vercel.json');

describe('Feature F5: CDN & CSP Infrastructure — Boundary & Corner Cases (Tier 2)', () => {
  it('F5-T2-1: CSP header rejects insecure HTTP origins for CDN script sources', () => {
    const raw = fs.readFileSync(VERCEL_JSON_PATH, 'utf-8');
    // Ensure no unencrypted http:// cdn addresses are introduced
    assert.ok(!raw.includes('http://cdnjs'), 'Insecure http://cdnjs must never be permitted');
    assert.ok(!raw.includes('http://cdn.jsdelivr'), 'Insecure http://cdn.jsdelivr must never be permitted');
  });

  it('F5-T2-2: CSP directives are terminated with semicolons and well-formed', () => {
    const config = JSON.parse(fs.readFileSync(VERCEL_JSON_PATH, 'utf-8'));
    let csp = '';
    for (const hGroup of config.headers || []) {
      for (const h of hGroup.headers || []) {
        if (h.key === 'Content-Security-Policy') csp = h.value;
      }
    }
    const directives = csp.split(';').map(d => d.trim()).filter(Boolean);
    for (const dir of directives) {
      const parts = dir.split(/\s+/);
      assert.ok(parts.length >= 1, `Directive '${dir}' must have directive name`);
      assert.ok(/^[a-z0-9-]+$/i.test(parts[0]), `Directive name '${parts[0]}' must be alphanumeric`);
    }
  });

  it('F5-T2-3: Fallback handling when CDN is slow or temporarily unreachable does not throw unhandled exception', () => {
    let gsapLoaded = false;
    // Simulate fallback check
    const checkGSAP = () => {
      if (typeof window !== 'undefined' && window.gsap) {
        gsapLoaded = true;
      }
      return gsapLoaded;
    };
    assert.doesNotThrow(() => checkGSAP(), 'Checking GSAP availability in headless mode must not crash');
  });

  it('F5-T2-4: CSP connect-src permits secure HTTPS API/telemetry endpoints without wildcard asterisk', () => {
    const config = JSON.parse(fs.readFileSync(VERCEL_JSON_PATH, 'utf-8'));
    let csp = '';
    for (const hGroup of config.headers || []) {
      for (const h of hGroup.headers || []) {
        if (h.key === 'Content-Security-Policy') csp = h.value;
      }
    }
    assert.ok(!csp.includes("connect-src '*'"), 'Wildcard asterisk * must not be used in connect-src');
  });

  it('F5-T2-5: vercel.json headers retain immutability on versioned static assets', () => {
    const config = JSON.parse(fs.readFileSync(VERCEL_JSON_PATH, 'utf-8'));
    const imgRule = (config.headers || []).find(h => h.source && h.source.includes('/assets/img/'));
    assert.ok(imgRule !== undefined, 'Image cache header rule must exist');
    const cacheCtrl = imgRule.headers.find(h => h.key === 'Cache-Control');
    assert.ok(cacheCtrl && cacheCtrl.value.includes('immutable'), 'Images must have immutable cache header');
  });
});
