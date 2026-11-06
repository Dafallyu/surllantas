# Project: SurLlantas Web Portal Cinematic Transformation

## Architecture
SurLlantas (`web/index.html`) is a high-performance commercial tire catalog portal deployed on Vercel. The cinematic transformation upgrades the experience with GPU-accelerated atmospheric visual effects, a 4-phase scroll-driven camera choreography of the flagship Roadone HD55 commercial tire, interactive telemetry HUD hotspots, and catalog cards with dynamic cursor spotlight glow borders, all while maintaining strict 60 FPS rendering, LCP < 1.4s, CLS = 0, and zero SEO/analytics regressions.

### Component Boundaries & Data Flow
1. **Atmospheric Canvas (`#atmospheric-overlay`)** [COMPLETED in M1]:
   - Resides in `.hero` (z-index: 1, below text content z-index: 2).
   - High-DPI DPR-clamped (<=2) 2D canvas running inertial dust & asphalt spark physics.
   - Responds to mouse velocity lerp and window scroll velocity delta.
   - Throttled dynamically on mobile (<768px: 25 particles, desktop: 70 particles).
   - Pauses completely via `IntersectionObserver` when scrolled out of view.
   - Completely disabled if `prefers-reduced-motion` is active.

2. **Scroll Choreography Stage (`.cinematic-hero-stage`)** [Milestone 2]:
   - Pinned 350vh virtual scroll sequence managed by GSAP 3.12.5 and ScrollTrigger.
   - Pinned viewport (100vh) hosts typographic awakening, tire stage, and telemetry layer.
   - Phase 01 (0%-25%): Inverse blur (`blur(14px) -> blur(0px)`) and typography entrance.
   - Phase 02 (25%-55%): Camera pan to Roadone HD55, dual-WebP perspective cross-fade (`frente` and `45`), 3D transform, and contact shadow affine matrix deformation.
   - Phase 03 (55%-80%): 3 interactive SVG telemetry hotspots opening glassmorphic cards with dark shadcn tokens.
   - Phase 04 (80%-100%): Seamless landing into `.section-quote-bar` / `#tireQuoteForm`.
   - Accessible static fallback when `prefers-reduced-motion: reduce`.

3. **Catalog Cards Spotlight (`.category-card`)** [Milestone 3]:
   - Interactive automotive catalog cards with dark tokens (`#0B0F17`, `#0066FF`, `#D32F2F`).
   - JavaScript mousemove listener updates `--mouse-x` and `--mouse-y` relative coordinates.
   - CSS masked pseudo-element renders reactive radial gradient spotlight border.

4. **Preserved Infrastructure & SLA**:
   - Full preservation of 156 lines in `<head>`: title, meta SEO, OpenGraph tags, JSON-LD `@graph` schema, and Vercel Analytics scripts.
   - Preloaded `roadone-hd55-frente.webp` with `fetchpriority="high"` guaranteeing LCP < 1.4s.
   - Dimension locking on tire stages and docking bays guaranteeing CLS = 0.
   - CSP update in `web/vercel.json` allowing CDN scripts (`https://cdnjs.cloudflare.com https://cdn.jsdelivr.net`).

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Atmospheric Canvas Overlay | `<canvas id='atmospheric-overlay'>` in `.hero` | M1 | ORIGINAL_REQUEST §R1 |
| F2 | Particle Physics Engine | 60 FPS inertial response to mouse velocity and scroll delta | M1 | ORIGINAL_REQUEST §R1 |
| F3 | Mobile Particle Throttling | Auto-throttle to 25 particles on viewports <768px | M1 | ORIGINAL_REQUEST §R1 |
| F4 | Particle Reduced Motion | Complete deactivation and display:none when prefers-reduced-motion matches | M1 | ORIGINAL_REQUEST §R1 |
| F5 | CDN & CSP Infrastructure | Load GSAP 3.12.5 & ScrollTrigger via CDN; update vercel.json CSP script-src | M2 | ORIGINAL_REQUEST §R2 |
| F6 | Phase 01 Typographic Awakening | 0%-25% scroll: inverse blur (`blur(14px) -> blur(0px)`) & typography entrance | M2 | ORIGINAL_REQUEST §R2 |
| F7 | Phase 02 Roadone HD55 Perspective Morph | 25%-55% scroll: camera pan, dual-WebP cross-fade (frente & 45), 3D perspective | M2 | ORIGINAL_REQUEST §R2 |
| F8 | Phase 02 Contact Shadow Matrix Deformation | Affine matrix deformation of contact shadow matching tire perspective angle | M2 | ORIGINAL_REQUEST §R2 |
| F9 | Phase 03 SVG Telemetry Hotspots | 55%-80% scroll: 3 interactive SVG hotspots anchored to tire features | M2 | ORIGINAL_REQUEST §R2 |
| F10 | Phase 03 Glassmorphic Telemetry Cards | Dark shadcn glass cards (blur 16px, #0B0F17, #0066FF accent) with metrics | M2 | ORIGINAL_REQUEST §R2 |
| F11 | Phase 04 Tire Landing into WhatsApp CTA | 80%-100% scroll: seamless dock into quote bar / #tireQuoteForm | M2 | ORIGINAL_REQUEST §R2 |
| F12 | Scroll Engine Reduced Motion Fallback | Static accessible layout without camera distortion or pinning when reduced motion | M2 | ORIGINAL_REQUEST §R2 |
| F13 | Catalog Spotlight Cursor Tracking | Dynamically update `--mouse-x` and `--mouse-y` coordinates on card hover | M3 | ORIGINAL_REQUEST §R3 |
| F14 | Catalog Spotlight Styling | Radial gradient border glow with luxury dark tokens (#0B0F17, #0066FF, #D32F2F) | M3 | ORIGINAL_REQUEST §R3 |
| F15 | Catalog Accessibility & Touch Fallback | Clean static accent styling for touch viewports and reduced-motion mode | M3 | ORIGINAL_REQUEST §R3 |
| F16 | Performance SLA Compliance | Sustained 60 FPS GPU rendering, LCP < 1.4s (preload), CLS = 0 | M4 | ORIGINAL_REQUEST §R4 |
| F17 | Infrastructure & SEO Preservation | Zero regressions to all 156 lines in `<head>`, JSON-LD schemas, Vercel scripts | M4 | ORIGINAL_REQUEST §R4 |
| F18 | Comprehensive E2E Test Suite | 4-tier automated test suite covering all features with TEST_READY.md signal | E2E_TRACK | ORIGINAL_REQUEST §Acceptance Criteria |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M-E2E | E2E Testing Track | Design test infra, 4-tier automated suite (T1-T4), publish TEST_READY.md | none | DONE (TEST_READY.md published, 205 tests) |
| M1 | Atmospheric Hero Canvas Overlay | Features F1, F2, F3, F4 (Canvas, physics, mobile throttle, reduced motion) | none | DONE (Passed gate: 40/40 tests, 2 Reviewers, 2 Challengers, Auditor Clean) |
| M2 | 4-Phase Progressive Scroll Animation Engine | Features F5, F6, F7, F8, F9, F10, F11, F12 (GSAP, 4 phases, hotspots, landing) | M1 | DONE (Passed gate: 80/80 M2 tests, 205/205 total tests, Reviewers APPROVE, Challengers APPROVE, Auditor CLEAN) |
| M3 | Catalog Cards with Spotlight Glow | Features F13, F14, F15 (Spotlight glow, tokens #0B0F17, #0066FF, #D32F2F) | none | DONE (Passed gate: 30/30 M3 tests, 205/205 total tests, Reviewers APPROVE, Challengers APPROVE, Auditor CLEAN) |
| M4 | Final Milestone: 100% E2E Pass & Adversarial Hardening | Features F16, F17; Phase 1: Pass 100% Tiers 1-4; Phase 2: Tier 5 Adversarial | M1, M2, M3, M-E2E | DONE (Passed gate: 205/205 E2E tests, 36/36 Tier 5 tests, 241/241 total tests, 60 FPS, LCP 92ms, lines 1-156 byte-identical) |

---

## Interface Contracts

### Atmospheric Canvas (`#atmospheric-overlay`) ↔ DOM
- **Canvas Selector**: `#atmospheric-overlay`
- **Location**: Direct child of `.hero`, positioned between `.hero__overlay` and `.hero__content`.
- **CSS Contract**:
  - `position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;`
  - Reduced motion: `@media (prefers-reduced-motion: reduce) { #atmospheric-overlay { display: none !important; } }`
- **JS Lifecycle Contract**:
  - Window resize: throttles particle count dynamically (`desktop: 70`, `mobile: 25`).
  - `IntersectionObserver`: pauses animation when `!entry.isIntersecting`.

### Scroll Stage ↔ Express WhatsApp Quote Bar
- **Landing Anchor**: `.section-quote-bar` / `#tireQuoteForm`
- **Quote Data Injection**:
  - Vehicle: `Camión / Transporte Pesado`
  - Medida: `315/70 R22.5`
  - Marca: `Roadone HD55`
- **Visual Dock Contract**:
  - Fixed dimensional reservation preventing CLS (`CLS = 0`).
  - Scroll unpinning transitions smoothly without scroll jumping or snapping.

### Catalog Cards ↔ Spotlight Glow Controller
- **Card Selector**: `.category-card`
- **CSS Variables Contract**:
  - `--mouse-x`: pixel X coordinate relative to card bounding box.
  - `--mouse-y`: pixel Y coordinate relative to card bounding box.
- **Tokens Contract**:
  - Primary Dark Surface: `--color-automotive-dark: #0B0F17`
  - Accent Electric Blue: `--color-electric-blue: #0066FF`
  - Accent Brand Red: `--color-brand-red: #D32F2F`

---

## Code Layout
- `web/index.html`: Main HTML entry point (Hero canvas, scroll stage markup, telemetry hotspots, catalog cards, head preloads).
- `web/assets/css/styles.css`: Visual styling, dark shadcn tokens, canvas positioning, glassmorphic cards, spotlight borders, reduced motion media queries.
- `web/assets/js/main.js`: Core client scripts (AtmosphericParticleEngine, scroll controller, spotlight coordinates).
- `web/vercel.json`: Security headers, cache rules, CSP `script-src` allowing CDN origins.
- `web/assets/img/productos/`: Product assets (`roadone-hd55-frente.webp`, `roadone-hd55-45.webp`).
- `tests/`: Automated test suite, runners, browser scripts for E2E validation.
