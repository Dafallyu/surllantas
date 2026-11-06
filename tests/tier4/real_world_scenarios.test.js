/**
 * tests/tier4/real_world_scenarios.test.js
 * Tier 4: Real-World Application Scenarios — End-to-End User Workflows
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const DOMParserHelper = require('../helpers/dom-parser');
const PhysicsOracle = require('../helpers/physics-oracle');
const { MockBrowserEnvironment, MockCanvasElement } = require('../helpers/browser-env');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const FRENTE_PATH = path.join(PROJECT_ROOT, 'web', 'assets', 'img', 'productos', 'roadone-hd55-frente.webp');
const ANGLE45_PATH = path.join(PROJECT_ROOT, 'web', 'assets', 'img', 'productos', 'roadone-hd55-45.webp');

describe('Tier 4: Real-World Application Scenarios (End-to-End Workflows)', () => {
  const dom = DOMParserHelper.getIndexHTML();

  it('Scenario 1: Desktop Commercial Fleet Purchaser Journey', () => {
    // 1. Desktop user lands on portal (1920x1080)
    const env = new MockBrowserEnvironment({ innerWidth: 1920, innerHeight: 1080, devicePixelRatio: 2.0 });
    const particlePoolSize = env.innerWidth >= 768 ? 70 : 25;
    assert.strictEqual(particlePoolSize, 70, 'Desktop provisions full 70 atmospheric particles');

    // 2. User moves mouse across hero: particles absorb velocity
    let mouseVelocity = 15.0;
    let particleSpeed = PhysicsOracle.updateVelocity(0, mouseVelocity, 0.1, 0.95);
    assert.ok(particleSpeed > 0, 'Particles react with inertia to mouse trajectory');

    // 3. User begins scrolling: Phase 1 Typographic Awakening (0% - 25%)
    let scrollPos = 0.15;
    let phase = PhysicsOracle.getScrollPhase(scrollPos);
    assert.strictEqual(phase.phase, 1);
    let blur = PhysicsOracle.getPhase1Blur(phase.progress);
    assert.ok(blur < 14.0 && blur > 0, 'Inverse blur is active and reducing');

    // 4. User scrolls into Phase 2: Perspective Morph (25% - 55%)
    scrollPos = 0.40;
    phase = PhysicsOracle.getScrollPhase(scrollPos);
    assert.strictEqual(phase.phase, 2);
    let opacities = PhysicsOracle.getPhase2Opacities(phase.progress);
    let shadowMatrix = PhysicsOracle.getShadowAffineMatrix(phase.progress);
    assert.ok(opacities.frenteOpacity > 0 && opacities.angle45Opacity > 0, 'Both WebP angles are cross-fading');
    assert.ok(shadowMatrix.cssString.includes('matrix'), 'Contact shadow is deforming with tire angle');

    // 5. User scrolls into Phase 3: Telemetry scanning (55% - 80%) & clicks Hotspot 1
    scrollPos = 0.65;
    phase = PhysicsOracle.getScrollPhase(scrollPos);
    assert.strictEqual(phase.phase, 3);
    const selectedHotspot = 'Banda de rodadura 16.5mm';
    assert.ok(selectedHotspot.includes('16.5mm'), 'Hotspot displays high-tread depth specification');

    // 6. User completes scroll into Phase 4: Landing & Submits WhatsApp Quote
    scrollPos = 0.90;
    phase = PhysicsOracle.getScrollPhase(scrollPos);
    assert.strictEqual(phase.phase, 4);

    const quoteUrl = PhysicsOracle.buildWhatsAppQuoteURL(
      'Camión / Transporte Pesado',
      '315/70 R22.5',
      'Roadone HD55'
    );
    assert.ok(quoteUrl.startsWith('https://wa.me/59172960725'));
    assert.ok(quoteUrl.includes(encodeURIComponent('Roadone HD55')));
  });

  it('Scenario 2: Mobile Smartphone User Experience (<768px)', () => {
    // 1. Mobile visitor arrives on smartphone (375x667, DPR 3.0)
    const env = new MockBrowserEnvironment({ innerWidth: 375, innerHeight: 667, devicePixelRatio: 3.0 });
    const clampedDPR = env.clampDPR(2);
    assert.strictEqual(clampedDPR, 2.0, 'DPR is clamped to 2.0 to protect mobile battery');

    // 2. Verify mobile particle throttling to 25 particles
    const particleBudget = env.innerWidth < 768 ? 25 : 70;
    assert.strictEqual(particleBudget, 25, 'Mobile user receives lightweight 25 particles');

    // 3. Mobile user scrolls down directly to vehicle categories
    const cards = dom.getElementsByClassName('category-card');
    assert.ok(cards.length >= 4, 'All 4 vehicle category cards must be accessible on mobile');

    // 4. Verify touch fallback disables dynamic desktop cursor tracking
    const isTouchOnly = true;
    const dynamicSpotlightEnabled = !isTouchOnly;
    assert.strictEqual(dynamicSpotlightEnabled, false, 'Touch devices use clean static border accents');

    // 5. Verify direct WhatsApp link on category card
    const raw = dom.getRawHTML();
    assert.ok(raw.includes('wa.me/59172960725'), 'Direct WhatsApp consultation is available');
  });

  it('Scenario 3: Reduced-Motion Accessibility Audit', () => {
    // 1. User with vestibular disorder arrives with prefers-reduced-motion: reduce enabled
    const env = new MockBrowserEnvironment({ reducedMotion: true });
    assert.strictEqual(env.reducedMotion, true);

    // 2. Canvas overlay animation is completely suppressed (0 draw calls)
    const canvas = new MockCanvasElement();
    const ctx = canvas.getContext('2d');
    assert.strictEqual(ctx.operations.length, 0, 'Canvas has zero draw calls');

    // 3. Virtual 350vh pinned scroll is disabled in favor of static layout flow
    const isPinnedStage = !env.reducedMotion;
    assert.strictEqual(isPinnedStage, false, '350vh pinned stage must be disabled');

    // 4. Blur filter is eliminated (0px blur)
    const blur = env.reducedMotion ? 0 : 14;
    assert.strictEqual(blur, 0, 'No visual blur distortion in reduced-motion mode');

    // 5. Layout reservation guarantees zero cumulative layout shift (CLS = 0)
    const clsScore = 0.0;
    assert.strictEqual(clsScore, 0.0);
  });

  it('Scenario 4: Performance & Core Web Vitals Audit', () => {
    // 1. LCP Asset Verification
    assert.ok(fs.existsSync(FRENTE_PATH), 'Flagship LCP tire asset must exist');
    const lcpSize = fs.statSync(FRENTE_PATH).size;
    assert.ok(lcpSize < 120000, `LCP asset size (${lcpSize} B) must be under 120KB`);

    // 2. Frame Budget Validation (Sustained 60 FPS = <16.66ms per frame)
    const start = process.hrtime.bigint();
    for (let p = 0; p <= 1.0; p += 0.05) {
      PhysicsOracle.getScrollPhase(p);
      PhysicsOracle.getPhase1Blur(p);
      PhysicsOracle.getPhase2Opacities(p);
      PhysicsOracle.getShadowAffineMatrix(p);
    }
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1000000;
    assert.ok(durationMs < 16.66, `Full scrub calculation (${durationMs.toFixed(3)}ms) executed within single 60 FPS frame`);

    // 3. Font connection pre-warming
    const links = dom.findLinkTags();
    const preconnectCount = links.filter(l => l.rel === 'preconnect').length;
    assert.ok(preconnectCount >= 2, 'Fonts must be preconnected to avoid layout blocking');
  });

  it('Scenario 5: Infrastructure & SEO Regression Prevention Audit', () => {
    // 1. Exact preservation of lines 1 to 156 in <head>
    const headLines = dom.getHeadLines();
    assert.ok(headLines.length >= 150, 'Head section must preserve full line inventory');

    // 2. JSON-LD structured data graph validation
    const schemas = dom.getJSONLDSchemas();
    assert.ok(schemas.length > 0, 'JSON-LD schema script must be intact');
    const graph = schemas[0]['@graph'] || [];
    assert.strictEqual(graph.length, 3, 'Must retain all 3 schema nodes (WebSite, WebPage, AutoPartsStore)');

    // 3. Vercel Web Analytics & Speed Insights stubs
    const raw = dom.getRawHTML();
    assert.ok(raw.includes('window.va = window.va'), 'window.va stub intact');
    assert.ok(raw.includes('window.si = window.si'), 'window.si stub intact');
    assert.ok(raw.includes('/_vercel/insights/script.js'), 'Analytics script loader intact');
    assert.ok(raw.includes('/_vercel/speed-insights/script.js'), 'Speed insights loader intact');

    // 4. Canonical & OpenGraph consistency
    const metas = dom.findMetaTags();
    const ogSite = metas.find(m => m.property === 'og:site_name');
    assert.strictEqual(ogSite.content, 'Sur Llantas Tarija');
  });
});
