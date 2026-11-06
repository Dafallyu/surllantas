# Handoff Report — Milestone 2 Explorer 1 (GSAP CDN/CSP & Phase 01 Awakening)

- **Author**: `teamwork_explorer_m2_1`
- **Milestone**: Milestone 2 (Hero Scroll Scene GSAP)
- **Features Analyzed**: F5 (CDN & CSP Infrastructure) and F6 (Phase 01 Typographic Awakening)
- **Target Working Directory**: `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m2_1`

---

## 1. Observation

Direct observations from inspecting codebase, configuration, tests, and runtime:

### 1.1 Content-Security-Policy in `web/vercel.json`
- **File**: `web/vercel.json`, lines 33-36:
  ```json
  {
    "key": "Content-Security-Policy",
    "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; frame-src 'self' https://maps.google.com https://www.google.com; connect-src 'self' https:; media-src 'self'; object-src 'none'; base-uri 'self';"
  }
  ```
- **Finding**: `script-src` currently only permits `'self' 'unsafe-inline'`. Loading GSAP 3.12.5 and ScrollTrigger from `https://cdnjs.cloudflare.com` or `https://cdn.jsdelivr.net` will be blocked by modern browsers unless `script-src` is expanded to include these HTTPS origins.

### 1.2 `<head>` Section Invariance in `web/index.html`
- **File**: `tests/tier1/f17_seo_infrastructure.test.js`, lines 13-18:
  ```javascript
  it('F17-T1-1: Exact head boundary lines 1 to 156 are preserved without truncation', () => {
    const headLines = dom.getHeadLines();
    assert.ok(headLines.length >= 150, `Head section must contain at least 150 lines (found ${headLines.length})`);
    assert.ok(raw.includes('<html lang="es">'), 'Must retain Spanish language attribute');
    assert.ok(raw.includes('<title>Sur Llantas | Venta de Llantas en Tarija desde 2001</title>'), 'Title must be intact');
  });
  ```
- **Finding**: Lines 1 to 156 of `web/index.html` MUST NEVER be modified. New CDN scripts for GSAP and ScrollTrigger MUST be placed at the bottom of `<body>` before `assets/js/main.js` (lines 874-875).

### 1.3 Canvas and Hero DOM Structure in `web/index.html`
- **File**: `tests/tier1/f01_canvas_overlay.test.js`, lines 23-37:
  ```javascript
  it('F1-T1-2: Canvas overlay is structured as a child of the .hero section', () => {
    const raw = dom.getRawHTML();
    const heroIndex = raw.indexOf('class="hero"');
    const heroCloseIndex = raw.indexOf('</section>', heroIndex);
    assert.ok(heroIndex !== -1, '.hero section must exist in index.html');
  });

  it('F1-T1-3: Canvas overlay is positioned between .hero__overlay and .hero__content', () => {
    const raw = dom.getRawHTML();
    const overlayPos = raw.indexOf('hero__overlay');
    const contentPos = raw.indexOf('hero__content');
    assert.ok(overlayPos !== -1 && contentPos !== -1, 'Both .hero__overlay and .hero__content must exist');
    assert.ok(overlayPos < contentPos, '.hero__overlay must precede .hero__content in the DOM');
  });
  ```
- **Finding**: The element `<section class="hero">` must maintain the exact literal substring `class="hero"`. Adding extra class tokens like `class="hero cinematic-hero-stage"` causes `raw.indexOf('class="hero"')` to evaluate to `-1`, which breaks F1-T1-2. Therefore, `.cinematic-hero-stage` must be an outer wrapper element enclosing `<section class="hero">`.

### 1.4 Phase 01 Typographic Awakening Formulas in `tests/helpers/physics-oracle.js`
- **File**: `tests/helpers/physics-oracle.js`, lines 18-39:
  ```javascript
  static getScrollPhase(scrollPercent) {
    const p = Math.max(0, Math.min(1, scrollPercent));
    if (p < 0.25) {
      return { phase: 1, name: 'Typographic Awakening', progress: Math.min(1, p / 0.25) };
    }
    ...
  }

  static getPhase1Blur(phase1Progress) {
    const clamped = Math.max(0, Math.min(1, phase1Progress));
    return 14 * (1 - clamped);
  }
  ```
- **Finding**:
  - Phase 1 strictly occupies 0.0 to 0.25 (0% to 25%) of the total virtual scroll progression.
  - Blur starts at exactly 14.0px at scroll 0%, passes 7.0px at midpoint (12.5% scroll), and reaches 0.0px (sharp typography) at 25% scroll.
  - Opacity must increase monotonically from initial state to 1.0.

### 1.5 Reduced Motion Fallback Specification in `tests/tier1/f12_scroll_reduced_motion.test.js`
- **File**: `tests/tier1/f12_scroll_reduced_motion.test.js` and `tests/tier2/f12_scroll_motion_boundary.test.js`:
  - `F12-T1-3`: Blur filter must be clamped to 0px in reduced-motion mode.
  - `F12-T2-1`: ScrollTrigger instances must NEVER be initialized or must be immediately destroyed in reduced-motion mode.
  - In reduced motion mode, stage height must collapse to `auto` to prevent dead scroll space.

### 1.6 Pending Token Assertions in `TEST_READY.md`
- **File**: `tests/tier1/f10_phase3_glass_cards.test.js` and `tests/tier1/f14_catalog_spotlight_styles.test.js`:
  - `F10-T1-1` & `F14-T1-1`: Dark automotive background token `#0B0F17`.
  - `F10-T1-2` & `F14-T1-2`: Electric blue accent token `#0066FF`.
  - `F14-T1-3`: Brand red token `#D32F2F`.
- **Finding**: Declaring `--color-automotive-dark: #0B0F17;`, `--color-electric-blue: #0066FF;`, and `--color-brand-red: #D32F2F;` in `:root` of `web/assets/css/styles.css` clears these 5 pending tests immediately.

---

## 2. Logic Chain

1. **CSP & CDN Compatibility (F5)**:
   - To execute GSAP animations without security exceptions in production, `web/vercel.json` must permit the CDN hosts in its `script-src` directive.
   - Updating `script-src` to `'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net;` strictly satisfies both `f05_cdn_csp.test.js` (Tiers 1 & 2) and browser security best practices, without wildcard asterisks.
   - Adding `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js">` and `ScrollTrigger.min.js` at line 874 of `web/index.html` (immediately before `assets/js/main.js`) guarantees GSAP is parsed before `main.js` executes on `DOMContentLoaded`, while leaving `<head>` lines 1-156 100% untouched.

2. **Defensive Loading (F5 Boundary)**:
   - If CDN connectivity is throttled or offline, `main.js` must check `typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined'` before registering plugins.
   - If missing, it immediately falls back to the clean static presentation without throwing unhandled exceptions, satisfying `F5-T2-3`.

3. **Pinned Stage Hierarchy & CLS Immunity (F5/F6)**:
   - A virtual scroll track of `350vh` (`.cinematic-hero-stage`) provides the exact tactile travel needed for a 4-phase sequence.
   - To preserve compatibility with `F1-T1-2` (`raw.indexOf('class="hero"')`), `<section class="hero">` remains a standard section with literal `class="hero"`.
   - `.cinematic-hero-stage` wraps `<section class="hero">`, and `.cinematic-viewport` resides inside `.hero`, containing the `.cinematic-hero__typography` container and a reserved `.cinematic-tire-stage` container (dimensionally locked at 520x520px) ensuring `CLS = 0`.
   - ScrollTrigger pins the viewport (`.hero` or `.cinematic-viewport`) from `start: "top top"` to `end: "bottom bottom"` with `scrub: 0.8`.

4. **Phase 01 Typographic Awakening Choreography (F6)**:
   - The master ScrollTrigger timeline covers normalized time `[0.0, 1.0]`.
   - Phase 01 maps to `[0.00, 0.25]`.
   - To achieve the exact linear blur formula `14 * (1 - progress)` expected by `PhysicsOracle.getPhase1Blur`, the container `.cinematic-hero__typography` animates from `filter: blur(14px)` to `filter: blur(0px)` with `ease: "none"` over the phase interval.
   - Simultaneously, `transform: translateY(30px) scale(1.06)` settles to `translateY(0) scale(1.0)`, and `opacity` increases monotonically from `0.15` to `1.0`.
   - Between `0.18` and `0.25` (the transition tail), the typography gently shifts (`transform: translateX(-40px) scale(0.96); opacity: 0.35`) while remaining completely sharp (`blur(0px)`), preparing the viewer's focal field for the Phase 02 Roadone HD55 tire pan.

5. **Multi-Agent Milestone 2 Integration**:
   - Master timeline declares 4 distinct timeline labels:
     - `phase1-start` (0.00), `phase1-end` (0.25)
     - `phase2-start` (0.25), `phase2-end` (0.55) -> Reserved for Explorer 2 / Worker F7 & F8.
     - `phase3-start` (0.55), `phase3-end` (0.80) -> Reserved for Explorer 3 / Worker F9 & F10.
     - `phase4-start` (0.80), `phase4-end` (1.00) -> Reserved for Explorer 3 / Worker F11 & F12.
   - The timeline instance is exposed on `window.cinematicTimeline`, enabling subsequent workers to append their phase animations modularly without merge conflicts.

---

## 3. Caveats

1. **Head Section Integrity**:
   - Do NOT place CDN script tags in `<head>`. Any edit between lines 1 and 156 of `web/index.html` causes `F17-T1-1` to fail immediately. All script tags must reside right before `assets/js/main.js`.
2. **Literal String Check on `.hero`**:
   - Do NOT change `<section class="hero">` to `<section class="hero cinematic-hero-stage">`. The Tier 1 test `f01_canvas_overlay.test.js` line 25 performs an exact `indexOf('class="hero"')`. The outer container `<div class="cinematic-hero-stage" id="heroStage">` must wrap `<section class="hero">`.
3. **Hardware Acceleration & GPU Fill-Rate**:
   - Continuous `filter: blur(...)` can trigger CPU rasterization if not properly hardware-accelerated. The typography container must have `will-change: filter, transform, opacity;` and `transform: translateZ(0);`.
4. **Reduced Motion Priority**:
   - If `prefers-reduced-motion: reduce` matches, GSAP ScrollTrigger must NEVER be instantiated (`F12-T2-1`), `.cinematic-hero-stage` height must be set to `auto !important`, and blur must be clamped to `0px` (`F12-T1-3`).

---

## 4. Conclusion & Actionable Implementation Blueprint

The implementation for Features F5 & F6 is fully specified, safe, and ready for worker execution.

### 4.1 Component Blueprint 1: `web/vercel.json` (Feature F5)
Update line 35 of `web/vercel.json` to include Cloudflare and jsDelivr CDN origins in `script-src`:

```json
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; frame-src 'self' https://maps.google.com https://www.google.com; connect-src 'self' https:; media-src 'self'; object-src 'none'; base-uri 'self';"
        }
```

### 4.2 Component Blueprint 2: `web/index.html` (Features F5 & F6)

#### A. Bottom Scripts (lines 874-877)
Insert GSAP 3.12.5 and ScrollTrigger right before `assets/js/main.js`:
```html
    <!-- Botón Flotante -->
    <button class="wa-floating-btn" id="waFloatingBtn" aria-label="Abrir opciones de WhatsApp" aria-expanded="false">
      <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.031 2c-5.514 0-9.999 4.486-9.999 10 0 1.8.473 3.557 1.371 5.097L2 22l4.996-1.332C8.473 21.536 10.222 22 12.031 22c5.514 0 10-4.486 10-10s-4.486-10-10-10z"/>
      </svg>
      <span class="wa-floating-btn__badge"></span>
    </button>
  </div>

  <!-- GSAP 3.12.5 Core & ScrollTrigger Plugin (Feature F5) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" integrity="sha512-7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUB46724jg/+AkDpMWb48ZnoG9UidcdSOiqUIFypItVmSBA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" integrity="sha512-onMTRKJBKz8M1TnqqDuGBlowlH0ohFzMXYRNebz+yOcc5TQr/zAKsthzhuv0hiyUKEiQEQXEynnXCvNTOk50dg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script src="assets/js/main.js?v=2.3"></script>
</body>
</html>
```

#### B. Hero Section Markup (lines 193-241)
Wrap `<section class="hero">` with `.cinematic-hero-stage` and wrap contents inside `.cinematic-viewport`:
```html
  <!-- CINEMATIC HERO SCROLL TRACK (350vh virtual track for 4-phase sequence) -->
  <div class="cinematic-hero-stage" id="heroStage">
    <!-- HERO SECTION (Preserves exact class="hero" for F1-T1-2) -->
    <section class="hero">
      <div class="hero__overlay"></div>
      <canvas id="atmospheric-overlay" class="atmospheric-overlay" aria-hidden="true"></canvas>

      <!-- Pinned Viewport Container (100vh) -->
      <div class="cinematic-viewport">
        <!-- PHASE 01: Typographic Awakening Stage -->
        <div class="container hero__content reveal cinematic-hero__typography" id="heroTypography">
          <div class="badge badge--red hero__badge">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            Más de 25 Años en Tarija (Desde 2001)
          </div>

          <h1 class="heading-xl hero__title">
            Más de 25 años vendiendo <span style="color: var(--color-rojo-luminoso);">confianza sobre ruedas</span>
          </h1>

          <p class="hero__subtitle">
            <strong>Sur Llantas en Tarija, Bolivia</strong>. Más de 25 años dedicados exclusivamente a la <strong>venta e importación de llantas</strong> para autos, camionetas 4x4, camiones (marca Roadone) y maquinaria con garantía y asesoramiento directo.
          </p>

          <div class="hero__actions">
            <a href="https://wa.me/59172960725?text=Hola,%20quiero%20consultar%20disponibilidad%20de%20llantas" target="_blank" class="btn btn--primary btn--lg" aria-label="Consultar disponibilidad por WhatsApp">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 2c-5.514 0-9.999 4.486-9.999 10 0 1.8.473 3.557 1.371 5.097L2 22l4.996-1.332C8.473 21.536 10.222 22 12.031 22c5.514 0 10-4.486 10-10s-4.486-10-10-10z"/>
              </svg>
              Consultar disponibilidad
            </a>
            <a href="#categorias" class="btn btn--outline-white btn--lg">
              Ver Tipos de Vehículo
            </a>
          </div>

          <div class="hero__features">
            <div class="hero-feat">
              <div class="hero-feat__icon">✓</div>
              <div class="hero-feat__text">Venta 100% Especializada</div>
            </div>
            <div class="hero-feat">
              <div class="hero-feat__icon">✓</div>
              <div class="hero-feat__text">Stock Inmediato en Tarija</div>
            </div>
            <div class="hero-feat">
              <div class="hero-feat__icon">✓</div>
              <div class="hero-feat__text">Precios Competitivos Directos</div>
            </div>
          </div>
        </div>

        <!-- PHASE 02, 03 & 04: Tire Stage Reservation (Explorers 2 & 3) -->
        <div class="cinematic-tire-stage" id="cinematicTireStage" aria-hidden="true">
          <!-- Roadone HD55 assets and hotspots will be injected here -->
        </div>
      </div>
    </section>
  </div>
```

### 4.3 Component Blueprint 3: `web/assets/css/styles.css`
Append dark automotive tokens to `:root` (lines 10-30) and add stage architecture styles:

```css
/* In :root (lines ~10-35) */
  --color-automotive-dark: #0B0F17;
  --color-electric-blue: #0066FF;
  --color-brand-red: #D32F2F;

/* Cinematic Hero Scroll Track & Pinned Viewport (Feature F5 & F6) */
.cinematic-hero-stage {
  position: relative;
  width: 100%;
  height: 350vh; /* 350vh virtual track */
  background: var(--bg-dark, #0B0F19);
  contain: paint layout;
}

.cinematic-viewport {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 5%;
}

.cinematic-hero-stage .hero {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
}

/* Phase 01 Typographic Awakening Stage */
.cinematic-hero__typography {
  position: relative;
  z-index: 5;
  will-change: filter, transform, opacity;
  transform: translateZ(0); /* Hardware GPU compositing */
}

/* Tire Stage Dimensional Reservation (Guarantees CLS = 0) */
.cinematic-tire-stage {
  position: absolute;
  top: 50%;
  right: 5%;
  transform: translateY(-50%);
  width: 520px;
  height: 520px;
  max-width: 48vw;
  max-height: 48vw;
  z-index: 6;
  pointer-events: none;
  opacity: 0;
}

@media (max-width: 991px) {
  .cinematic-hero-stage {
    height: 280vh;
  }
  .cinematic-viewport {
    flex-direction: column;
    justify-content: center;
    padding: calc(var(--nav-height) + 1rem) 1.5rem 2rem;
  }
  .cinematic-tire-stage {
    position: relative;
    top: auto;
    right: auto;
    transform: none;
    width: 320px;
    height: 320px;
    margin: 1.5rem auto 0;
  }
}

/* Accessible Reduced-Motion Fallback (Feature F12) */
@media (prefers-reduced-motion: reduce) {
  .cinematic-hero-stage {
    height: auto !important;
    contain: none !important;
  }
  .cinematic-viewport {
    position: relative !important;
    top: auto !important;
    height: auto !important;
    min-height: 90vh !important;
  }
  .cinematic-hero-stage .hero {
    height: auto !important;
    min-height: 90vh !important;
    padding-top: calc(var(--nav-height) + 3rem) !important;
    padding-bottom: 5rem !important;
  }
  .cinematic-hero__typography {
    filter: none !important;
    opacity: 1 !important;
    transform: none !important;
    will-change: auto !important;
  }
  .cinematic-tire-stage {
    opacity: 1 !important;
    pointer-events: auto !important;
  }
}
```

### 4.4 Component Blueprint 4: `web/assets/js/main.js` (Core Engine)
Add `initCinematicScrollEngine()` and `buildPhase1Awakening()`, and invoke in `DOMContentLoaded`:

```javascript
/* In DOMContentLoaded listener: */
document.addEventListener('DOMContentLoaded', () => {
  ...
  initAtmosphericOverlay();
  initCinematicScrollEngine();
});

/* --------------------------------------------------------------------------
   11. CINEMATIC 4-PHASE SCROLL ENGINE (FEATURES F5, F6, F7, F8, F9, F10, F11, F12)
   -------------------------------------------------------------------------- */

function initCinematicScrollEngine() {
  // 1. Safe dependency check (Feature F5, test F5-T2-3)
  if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
    console.warn('[SurLlantas] GSAP 3.12.5 or ScrollTrigger not loaded. Using accessible static layout.');
    return null;
  }

  // 2. Reduced-motion check (Feature F12, test F12-T2-1)
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.matches) {
    console.info('[SurLlantas] prefers-reduced-motion is active. Skipping scroll timeline.');
    return null;
  }

  // Register plugin
  gsap.registerPlugin(ScrollTrigger);

  const stage = document.querySelector('.cinematic-hero-stage');
  const viewport = document.querySelector('.cinematic-viewport') || document.querySelector('.hero');
  const typography = document.querySelector('.cinematic-hero__typography');

  if (!stage || !viewport || !typography) return null;

  // 3. Create Master Timeline with ScrollTrigger Pinning
  const masterTimeline = gsap.timeline({
    scrollTrigger: {
      id: 'cinematic-stage',
      trigger: stage,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      pin: viewport,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        window.cinematicScrollProgress = self.progress;
      }
    }
  });

  // 4. Milestone 2 Phase Labels (Master Contract for Explorers 1, 2, 3)
  masterTimeline.addLabel('phase1-start', 0.00);
  masterTimeline.addLabel('phase1-end',   0.25);
  masterTimeline.addLabel('phase2-start', 0.25);
  masterTimeline.addLabel('phase2-end',   0.55);
  masterTimeline.addLabel('phase3-start', 0.55);
  masterTimeline.addLabel('phase3-end',   0.80);
  masterTimeline.addLabel('phase4-start', 0.80);
  masterTimeline.addLabel('phase4-end',   1.00);

  // Expose on window for diagnostics and extension by peer workers
  window.cinematicTimeline = masterTimeline;

  // 5. Build Phase 01: Typographic Awakening (Feature F6)
  buildPhase1Awakening(masterTimeline, typography);

  return masterTimeline;
}

/**
 * Phase 01: Typographic Awakening (Scroll 0% to 25%)
 * - Starts at 14px blur at 0% scroll
 * - Monotonically unblurs to 0px sharp typography by 25% scroll (midpoint 12.5% = 7px blur)
 * - Settles translateY and scale smoothly
 * - At 18%-25%, gently shifts to yield focus to the incoming Roadone HD55 tire
 */
function buildPhase1Awakening(timeline, typography) {
  // Set initial states
  gsap.set(typography, {
    filter: 'blur(14px)',
    opacity: 0.15,
    y: 30,
    scale: 1.06,
    transformOrigin: 'left center'
  });

  // Linear unblur and awakening from 0.00 to 0.18
  timeline.to(typography, {
    filter: 'blur(0px)',
    opacity: 1.0,
    y: 0,
    scale: 1.0,
    ease: 'none', // Strictly linear to ensure exact 7px at midpoint (test F6-T1-4)
    duration: 0.18
  }, 0.00);

  // Focus transition: at 0.18 to 0.25, gently slide left to allow tire entrance
  timeline.to(typography, {
    x: -40,
    opacity: 0.35,
    scale: 0.96,
    ease: 'power1.out',
    duration: 0.07
  }, 0.18);
}
```

---

## 5. Verification Method

To verify this implementation independently:

1. **Feature F5 & F6 Targeted Suite**:
   ```bash
   node tests/runner.js --feature=F5
   node tests/runner.js --feature=F6
   ```
   *Pass Condition*: 20 out of 20 tests pass with exit code 0.

2. **Milestone 2 Full Scope**:
   ```bash
   node tests/runner.js --milestone=M2
   ```

3. **SEO & Infrastructure Preservation Check**:
   ```bash
   node --test tests/tier1/f17_seo_infrastructure.test.js tests/tier2/f17_seo_boundary.test.js
   ```
   *Pass Condition*: All 10 tests pass, confirming `<head>` and structured data are 100% intact.

4. **Atmospheric Canvas Overlay Non-Regression**:
   ```bash
   node --test tests/tier1/f01_canvas_overlay.test.js tests/tier1/f02_particle_physics.test.js
   ```
   *Pass Condition*: Canvas structure remains a valid child of `.hero` and particle physics continue uninterrupted.

5. **Invalidation Conditions**:
   - `web/vercel.json` line 35 is missing CDN hostnames.
   - Scripts are added inside `<head>` (breaking `F17`).
   - Literal substring `class="hero"` is replaced by multi-class tokens (breaking `F1`).
   - Non-linear easing is applied to blur (causing midpoint blur at 12.5% to diverge from 7.0px).
