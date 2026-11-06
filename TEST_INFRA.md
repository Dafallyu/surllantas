# Test Infrastructure Architecture — SurLlantas Web Portal

## 1. Overview & Mission
This document defines the automated, opaque-box End-to-End (E2E) testing infrastructure for the **SurLlantas** web portal cinematic transformation.
The test infrastructure guarantees behavioral correctness, visual and atmospheric integrity, mathematical precision, accessibility compliance, and zero SEO/infrastructure regressions across all 18 features defined in `PROJECT.md`.

---

## 2. Architecture & Design Principles

### 2.1 Test Execution Engine
- **Engine**: Node.js v24 native test runner (`node:test`) and assertion library (`node:assert/strict`).
- **Zero-Dependency Guarantee**: Runs directly on any modern Node.js environment without reliance on external npm packages that can fail during CI/CD or require permissions.
- **Opaque-Box E2E Testing**: Tests treat the implementation as a black box, validating observable behaviors:
  - Rendered DOM structure, attributes, and element hierarchies in `web/index.html`.
  - CSS custom properties, tokens, animations, and media queries in `web/assets/css/styles.css`.
  - Content Security Policy (CSP) and caching headers in `web/vercel.json`.
  - Asset presence, dimensions, formats, and high-DPI configurations in `web/assets/img/`.
  - Simulated browser interactions (canvas rendering lifecycle, inertial physics, GSAP scroll scrubbing, mouse tracking, WhatsApp URL formatting).
- **Dual Execution Modes**:
  1. **Native Discovery**: `node --test tests/**/*.test.js`
  2. **Master Orchestrator**: `node tests/runner.js` with flags `--tier=<1-4>`, `--milestone=<M1-M4>`, `--feature=<F1-F18>`, and `--summary`.

---

## 3. Directory Layout (`tests/`)

```text
tests/
├── runner.js                      # Master test suite runner & CLI orchestrator
├── helpers/
│   ├── dom-parser.js              # High-fidelity DOM & HTML structure analyzer
│   ├── css-parser.js              # CSS rules, token variables & media-query analyzer
│   ├── browser-env.js             # Simulated browser window, canvas 2D & event environment
│   └── physics-oracle.js          # Reference oracle for physics, affine matrices & coordinate math
├── tier1/                         # Tier 1: Feature Coverage (>=5 tests per feature, F1-F18)
│   ├── f01_canvas_overlay.test.js
│   ├── f02_particle_physics.test.js
│   ├── f03_mobile_throttling.test.js
│   ├── f04_reduced_motion.test.js
│   ├── f05_cdn_csp.test.js
│   ├── f06_phase1_awakening.test.js
│   ├── f07_phase2_morph.test.js
│   ├── f08_phase2_shadow.test.js
│   ├── f09_phase3_hotspots.test.js
│   ├── f10_phase3_glass_cards.test.js
│   ├── f11_phase4_landing.test.js
│   ├── f12_scroll_reduced_motion.test.js
│   ├── f13_catalog_spotlight_coords.test.js
│   ├── f14_catalog_spotlight_styles.test.js
│   ├── f15_catalog_touch_fallback.test.js
│   ├── f16_performance_sla.test.js
│   ├── f17_seo_infrastructure.test.js
│   └── f18_test_suite_signals.test.js
├── tier2/                         # Tier 2: Boundary & Corner Cases (>=5 tests per feature, F1-F18)
│   ├── f01_canvas_boundary.test.js
│   ├── f02_physics_boundary.test.js
│   ├── f03_mobile_boundary.test.js
│   ├── f04_reduced_motion_boundary.test.js
│   ├── f05_csp_boundary.test.js
│   ├── f06_phase1_boundary.test.js
│   ├── f07_phase2_boundary.test.js
│   ├── f08_phase2_shadow_boundary.test.js
│   ├── f09_hotspots_boundary.test.js
│   ├── f10_glass_cards_boundary.test.js
│   ├── f11_phase4_boundary.test.js
│   ├── f12_scroll_motion_boundary.test.js
│   ├── f13_spotlight_coords_boundary.test.js
│   ├── f14_spotlight_styles_boundary.test.js
│   ├── f15_touch_fallback_boundary.test.js
│   ├── f16_performance_boundary.test.js
│   ├── f17_seo_boundary.test.js
│   └── f18_test_signals_boundary.test.js
├── tier3/                         # Tier 3: Cross-Feature Combinations (Pairwise matrix)
│   └── cross_feature_matrix.test.js
└── tier4/                         # Tier 4: Real-World Application Scenarios (E2E workflows)
    └── real_world_scenarios.test.js
```

---

## 4. 4-Tier Test Suite Specification

### Tier 1: Feature Coverage (≥5 Tests per Feature, F1–F18)
- **F1 (Canvas Overlay)**: Element existence, `#atmospheric-overlay` ID, placement between `.hero__overlay` and `.hero__content`, absolute positioning, z-index: 1.
- **F2 (Particle Physics)**: Inertial velocity equations, mouse velocity lerp, scroll delta impulse, DPR clamping (`Math.min(devicePixelRatio, 2)`), 60 FPS tick rate.
- **F3 (Mobile Particle Throttling)**: Viewport <768px triggers 25 particles, desktop triggers 70 particles, dynamic resize recalculation, memory retention, battery-saver constraints.
- **F4 (Particle Reduced Motion)**: `@media (prefers-reduced-motion: reduce)` rules, `display: none !important`, animation cancellation, zero RAF ticks, zero canvas CPU overhead.
- **F5 (CDN & CSP Infrastructure)**: GSAP 3.12.5 script tag, ScrollTrigger script tag, `web/vercel.json` CSP `script-src` includes cdnjs & jsdelivr, script integrity/crossorigin.
- **F6 (Phase 01 Typographic Awakening)**: Pinned virtual scroll container, 0%-25% scroll range, `blur(14px)` to `blur(0px)` CSS filter transition, typography entrance, no layout shifts.
- **F7 (Phase 02 Roadone HD55 Morph)**: Dual WebP images loaded (`roadone-hd55-frente.webp` and `45.webp`), 25%-55% scroll cross-fade, 3D perspective transform, visual centering.
- **F8 (Phase 02 Contact Shadow Matrix)**: Affine matrix deformation `matrix(...)`, skew/scaling matching 45° angle, opacity attenuation, visual grounding.
- **F9 (Phase 03 SVG Hotspots)**: 3 interactive SVG hotspots, anchored features ("Banda de rodadura 16.5mm", "Carcasa de acero 4 capas", "Eficiencia de rodadura"), 55%-80% scroll activation, aria attributes.
- **F10 (Phase 03 Glassmorphic Cards)**: Backdrop filter blur 16px, background `#0B0F17`, electric blue `#0066FF` accent, metric telemetry display, close/dismiss interaction.
- **F11 (Phase 04 CTA Landing)**: 80%-100% scroll docking, target anchor `.section-quote-bar` / `#tireQuoteForm`, auto-population of `Camión / Transporte Pesado`, `315/70 R22.5`, `Roadone HD55`, WhatsApp redirect.
- **F12 (Scroll Engine Reduced Motion Fallback)**: Elimination of 350vh pinning when reduced motion matches, static presentation of tire and specs, accessible content flow.
- **F13 (Catalog Spotlight Coords)**: Mouse move listener on `.category-card`, update `--mouse-x` and `--mouse-y` inline styles, offset relative to card rect.
- **F14 (Catalog Spotlight Styling)**: Radial gradient spotlight border, dark surface `#0B0F17`, electric blue `#0066FF`, red `#D32F2F`, masked pseudo-element.
- **F15 (Catalog Touch Fallback)**: `@media (hover: none)` / touch viewports, static border styling, no stuck hover artifacts on mobile devices.
- **F16 (Performance SLA Compliance)**: LCP image preload `roadone-hd55-frente.webp` with `fetchpriority="high"`, CLS = 0 dimension locking on stages, GPU acceleration `will-change: transform`.
- **F17 (Infrastructure & SEO Preservation)**: Preservation of all 156 lines in `<head>`, OpenGraph meta tags, JSON-LD `@graph` schema nodes, Vercel Web Analytics & Speed Insights scripts.
- **F18 (Test Suite Signals)**: Automated test discovery, execution of all 4 tiers, publication of `TEST_READY.md`, clear exit code signaling.

### Tier 2: Boundary & Corner Cases (≥5 Tests per Feature, F1–F18)
- Extreme viewports (320px ultra-narrow mobile up to 3840px 4K ultrawide).
- Rapid scroll velocity bursts (infinite impulse clamping).
- Zero mouse movement vs sudden high-speed flicks.
- Resizing mid-animation across the 768px threshold.
- Scroll boundary clamp at exact 0.0%, 25.0%, 55.0%, 80.0%, 100.0%.
- Negative scroll offsets (iOS rubber-banding elasticity).
- Rapid toggling of `prefers-reduced-motion` at runtime.
- Touch events without pageX/pageY coordinates.
- Empty or malformed inputs to `#tireQuoteForm`.
- Network delay simulation on CDN scripts.

### Tier 3: Cross-Feature Combinations (Pairwise Matrix)
- Particle canvas running concurrently with Phase 1-4 scroll choreography.
- Telemetry glassmorphic card open while window resize or scroll scrub occurs.
- Catalog spotlight card hover triggered during rapid page scroll.
- Mobile viewport (<768px) combined with `prefers-reduced-motion: reduce`.
- Phase 4 quote form submission with pre-populated Roadone HD55 payload while particles run in background.
- CSP header compliance while executing GSAP and ScrollTrigger animations.

### Tier 4: Real-World End-to-End Scenarios
1. **Desktop Truck Fleet Purchaser Journey**: Arrives on desktop, hero particles react, scrolls through 4 phases, clicks Hotspot 1, inspects 16.5mm tread depth, lands into quote bar, submits WhatsApp inquiry.
2. **Mobile Smartphone User Experience**: Arrives on mobile (375x667), throttled 25 particles, scrolls smoothly past hero, taps tire category card, verifies responsive layout.
3. **Reduced-Motion Accessibility Audit**: User with `prefers-reduced-motion: reduce` navigates entire portal, verifies static hero, accessible tire display, zero layout shifts (CLS=0), zero CPU animation loops.
4. **Performance & Core Web Vitals Audit**: Validates LCP preload tag with `fetchpriority="high"`, verifies CLS dimensional reservations, validates GPU layering hints.
5. **SEO & Analytics Invariant Audit**: Validates exact `<head>` lines 1-156, checks canonical URL, OpenGraph metadata, JSON-LD `@graph` schemas, and Vercel Analytics tracking stubs.

---

## 5. Execution Commands & CLI Reference

### Run Complete Test Suite
```bash
node tests/runner.js
```

### Run by Tier
```bash
node tests/runner.js --tier=1
node tests/runner.js --tier=2
node tests/runner.js --tier=3
node tests/runner.js --tier=4
```

### Run by Milestone Scope
```bash
node tests/runner.js --milestone=M1
node tests/runner.js --milestone=M2
node tests/runner.js --milestone=M3
node tests/runner.js --milestone=M4
```

### Run Specific Feature
```bash
node tests/runner.js --feature=F1
node tests/runner.js --feature=F17
```

### Run via Native Node.js Test Runner
```bash
node --test tests/tier1/*.test.js
node --test tests/tier2/*.test.js
node --test tests/tier3/*.test.js
node --test tests/tier4/*.test.js
```

### Exit Codes
- `0`: All targeted tests PASSED.
- `1`: One or more tests FAILED (non-zero exit for CI/CD failure gating).
