/**
 * tests/tier1/f05_cdn_csp.test.js
 * Tier 1: Feature Coverage — Feature F5: CDN & CSP Infrastructure
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const VERCEL_JSON_PATH = path.join(PROJECT_ROOT, 'web', 'vercel.json');

describe('Feature F5: CDN & CSP Infrastructure (Tier 1)', () => {
  it('F5-T1-1: web/vercel.json exists and is valid JSON', () => {
    assert.ok(fs.existsSync(VERCEL_JSON_PATH), 'web/vercel.json must exist');
    const content = fs.readFileSync(VERCEL_JSON_PATH, 'utf-8');
    assert.doesNotThrow(() => JSON.parse(content), 'web/vercel.json must be valid JSON');
  });

  it('F5-T1-2: web/vercel.json defines Content-Security-Policy header', () => {
    const config = JSON.parse(fs.readFileSync(VERCEL_JSON_PATH, 'utf-8'));
    const allHeaders = config.headers || [];
    let cspHeader = null;
    for (const hGroup of allHeaders) {
      if (hGroup.headers) {
        const found = hGroup.headers.find(h => h.key === 'Content-Security-Policy');
        if (found) cspHeader = found.value;
      }
    }
    assert.ok(cspHeader !== null, 'Content-Security-Policy header must be declared');
  });

  it('F5-T1-3: CSP script-src contract permits necessary CDN origins or self', () => {
    const config = JSON.parse(fs.readFileSync(VERCEL_JSON_PATH, 'utf-8'));
    let cspValue = '';
    for (const hGroup of config.headers || []) {
      for (const h of hGroup.headers || []) {
        if (h.key === 'Content-Security-Policy') cspValue = h.value;
      }
    }
    assert.ok(cspValue.includes("script-src 'self'"), "CSP must include script-src 'self'");
  });

  it('F5-T1-4: Public CDN contract for GSAP 3.12.5 specifies secure HTTPS endpoint', () => {
    const expectedCdnUrls = [
      'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
      'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js'
    ];
    for (const url of expectedCdnUrls) {
      assert.ok(url.startsWith('https://'), 'CDN URLs must be strictly HTTPS');
      assert.ok(url.includes('3.12.5'), 'GSAP version must target 3.12.5');
    }
  });

  it('F5-T1-5: Public CDN contract for ScrollTrigger specifies compatible version', () => {
    const expectedCdnUrls = [
      'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
      'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js'
    ];
    for (const url of expectedCdnUrls) {
      assert.ok(url.includes('ScrollTrigger'), 'ScrollTrigger plugin must be targeted');
      assert.ok(url.includes('3.12.5'), 'ScrollTrigger must match GSAP 3.12.5');
    }
  });
});
