# Handoff Report — Milestone 2 Explorer 3
## Features F9, F10, F11, F12: SVG Telemetry Hotspots, Dark Glassmorphic Cards, Landing CTA Docking & Reduced Motion Fallback

- **Agent**: `teamwork_explorer_m2_3`
- **Milestone**: Milestone 2 (Hero Scroll Scene GSAP Choreography)
- **Scope**: Features F9 (Phase 03 SVG Hotspots), F10 (Phase 03 Dark Glassmorphic Cards), F11 (Phase 04 Landing into WhatsApp CTA), F12 (Reduced Motion Fallback)
- **Date**: 2026-11-04
- **Working Directory**: `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m2_3`

---

## 1. Observation

### 1.1 Existing Codebase & DOM Elements
- **`web/index.html` (Lines 193–240)**:
  - `<section class="hero">` hosts `<canvas id="atmospheric-overlay">` (completed in M1) and `.hero__content` with typography, badges, and primary action buttons.
  - The hero section ends at line 240, immediately followed by `<section class="section-quote-bar">` at line 243.
- **`web/index.html` (Lines 242–305)**:
  - Contains `.section-quote-bar` with `.quote-bar-card` and form `<form id="tireQuoteForm" class="quote-bar-form" novalidate>`.
  - Form fields include:
    - `select#quoteVehicle` (Options: `Automóvil`, `Camioneta / 4x4`, `Camión / Transporte Pesado`, `Motocicleta`)
    - `input#quoteSize` (Placeholder: `"Ej: 205/55 R16 o 295/80 R22.5"`, required)
    - `select#quoteBrand` (Options: `Cualquier marca recomendada`, `Roadone`, `Goodyear`, `Bridgestone`, `Dunlop`, `Roadcruza`, `Condor`, `Triangle`)
    - `button[type="submit"].btn--quote-submit` (Contains SVG WhatsApp icon and `<span>Consultar Stock</span>`)
- **`web/assets/css/styles.css` (Lines 10–70)**:
  - Current `:root` defines `--bg-dark: #0B0F19;`, `--bg-dark-deep: #070A10;`, `--color-rojo: #DC2626;`, `--color-amarillo: #F5B301;`.
  - **Missing Tokens**: Hex `#0B0F17` (Dark Automotive) and `#0066FF` (Electric Blue) are not declared in `styles.css`.
- **`web/assets/js/main.js` (Lines 237–280)**:
  - `initTireQuoteWidget()` handles form submission to target WhatsApp `+591 72960725`.
- **`tests/runner.js` Execution Baseline**:
  - Out of 205 tests across 38 files, **200 PASS** and **5 FAIL**.
  - The 2 failing tests in Milestone 2 are strictly:
    - `F10-T1-1`: `AssertionError: Color token #0B0F17 must be defined in stylesheet`
    - `F10-T1-2`: `AssertionError: Accent token #0066FF must be defined in stylesheet`
  - (The remaining 3 failures belong to Milestone 3: `F14-T1-1`, `F14-T1-2`, `F14-T1-3`).

### 1.2 Automated Test Specifications & Contracts
Direct inspection of `tests/tier1/` and `tests/tier2/` establishes exact contractual rules:
1. **F9 (SVG Hotspots)**:
   - `F9-T1-1`: Scroll progression spans 55% to 80% (`0.55 <= scrollProgress < 0.80`).
   - `F9-T1-2` & `F9-T1-3/4/5`: Exactly 3 hotspots with spec names:
     - 1. `"Banda de rodadura 16.5mm"` (Crown tread depth)
     - 2. `"Carcasa de acero 4 capas"` (Sidewall steel belt)
     - 3. `"Eficiencia de rodadura"` (Contact patch rolling resistance)
   - `F9-T2-1` & `F9-T2-2`: Hotspots are inactive below 55% scroll and transition to docking past 80%.
   - `F9-T2-3`: Rapid click spamming toggles state deterministically (`isOpen = !isOpen`).
   - `F9-T2-4`: Keyboard activation via `Enter` (code 13) or `Space` (code 32) triggers hotspot.
   - `F9-T2-5`: Anchor coordinates remain bounded within normalized `[0, 100]%` coordinate space:
     - Tread: `x: 35, y: 25` (top-left)
     - Casing: `x: 65, y: 55` (mid-right)
     - Efficiency: `x: 50, y: 80` (bottom-center)
2. **F10 (Dark Glassmorphic Cards)**:
   - `F10-T1-1`: Dark automotive background token `#0B0F17` in stylesheet.
   - `F10-T1-2`: Accent electric blue token `#0066FF` in stylesheet.
   - `F10-T1-3`: Cards specify `backdrop-filter: blur(16px)` and `-webkit-backdrop-filter: blur(16px)`.
   - `F10-T1-4`: High-contrast text on dark surface satisfies WCAG AAA (contrast ratio 18.1:1 >= 7.0:1).
   - `F10-T1-5`: Cards support toggle dismissal state via `aria-expanded` and `.active` class.
   - `F10-T2-1`: Opening a second hotspot card closes the previously active card (accordion model).
   - `F10-T2-2`: Pressing `Escape` key dismisses active card.
   - `F10-T2-3`: Clicking outside card boundary dismisses active card.
   - `F10-T2-4`: Fallback opacity for non-`backdrop-filter` browsers: `rgba(11, 15, 23, 0.95)`.
   - `F10-T2-5`: Card max-width does not cause horizontal scrollbar on mobile (`max-width: min(320px, calc(100vw - 32px))`).
   - `P04` (`tests/tier3/cross_feature_matrix.test.js`): Auto-dismiss card when scrolling into Phase 4 (scroll >= 80%).
   - `P11`: Auto-dismiss or reposition card on window resize.
3. **F11 (Phase 04 Landing into WhatsApp CTA)**:
   - `F11-T1-1`: Scroll progression spans 80% to 100% (`0.80 <= scrollProgress <= 1.00`).
   - `F11-T1-2`: Landing anchor section `.section-quote-bar` exists in `index.html`.
   - `F11-T1-3`: Form `#tireQuoteForm` has `quoteVehicle`, `quoteSize`, `quoteBrand`.
   - `F11-T1-4`: WhatsApp URL builder targets `https://wa.me/59172960725` pre-populated with:
     - Vehicle: `"Camión / Transporte Pesado"`
     - Medida: `"315/70 R22.5"`
     - Marca: `"Roadone HD55"`
   - `F11-T2-1`: Scroll past 100% clamps landing dock to 1.0 without visual snapping.
   - `F11-T2-2`: Form validation catches empty required size field and blocks submission.
   - `F11-T2-3`: Special characters in size input (e.g. `295/80 R22.5 (16PR) & 152/148M`) are cleanly encoded (`%26`).
   - `F11-T2-4`: Long size string is sanitized/bounded to max length 100.
   - `F11-T2-5`: Landing dock container dimensions are explicitly reserved (`CLS = 0`).
4. **F12 (Reduced Motion Fallback)**:
   - `F12-T1-1`: Stylesheet contains `@media (prefers-reduced-motion: reduce)` block disabling pinning.
   - `F12-T1-2`: Product imagery presented without 3D camera distortion (`perspective: none; transform: none`).
   - `F12-T1-3`: Inverse blur filter clamped to 0px (`filter: none`).
   - `F12-T1-4`: Telemetry specs remain visible in document flow in an accessible static grid.
   - `F12-T1-5`: Cumulative layout shift remains zero (`CLS = 0`).
   - `F12-T2-1`: GSAP ScrollTrigger instances are NEVER initialized (or killed) when reduced motion matches.
   - `F12-T2-2`: Window resize in reduced motion mode does NOT re-trigger pinning.
   - `F12-T2-3`: Linear native document scroll flows without delays or scroll hijacking.
   - `F12-T2-4`: Fallback tire stage layout maintains 1:1 aspect ratio across viewports.
   - `F12-T2-5`: Interactive quote CTA remains visible and focusable in DOM.
   - `P19`: Tab navigation order is preserved: `nav -> hero CTA -> hotspot 1 -> hotspot 2 -> hotspot 3 -> quote vehicle -> quote size -> quote submit`.

---

## 2. Logic Chain

1. **Tokens & Theme Consistency**:
   - The test runner fails on `F10-T1-1` and `F10-T1-2` because `--color-automotive-dark: #0B0F17;` and `--color-electric-blue: #0066FF;` are absent from `styles.css`.
   - Defining `--color-automotive-dark: #0B0F17;`, `--color-electric-blue: #0066FF;`, and `--color-brand-red: #D32F2F;` in `:root` of `web/assets/css/styles.css` resolves both failing assertions immediately and satisfies Milestone 3 prerequisites.
2. **Phase 03 Hotspot Layer Placement**:
   - The hotspots must appear anchored directly over the Roadone HD55 tire in Phase 3 (scroll 55% to 80%).
   - Placing `.telemetry-layer` inside the pinned `.tire-stage` container ensures the hotspots move in lockstep with the tire's coordinate system without parallax drift.
   - Anchoring them at percentage coordinates `(35%, 25%)`, `(65%, 55%)`, and `(50%, 80%)` positions them over the upper tread crown, sidewall, and contact patch respectively.
3. **Glassmorphic Card Architecture**:
   - Applying `background: rgba(11, 15, 23, 0.82)`, `backdrop-filter: blur(16px)`, and `border: 1px solid rgba(255, 255, 255, 0.12)` satisfies the dark automotive shadcn specification.
   - Providing `@supports not (backdrop-filter: blur(16px)) { background: rgba(11, 15, 23, 0.95); }` guarantees legibility on legacy browsers.
   - Providing `max-width: min(320px, calc(100vw - 32px))` prevents horizontal viewport blowout on small mobile screens (360px viewport).
4. **State Machine & Focus Management**:
   - Clicking any hotspot toggles its `aria-expanded` and opens its card.
   - Opening a card closes any other open card (`activeHotspotId = id`).
   - Listeners on `Escape`, outside clicks, scroll past 80%, and window resize dismiss the active card.
   - Buttons maintain 44x44px minimum touch targets and respond to `Enter` and `Space`.
5. **Phase 04 Landing & Quote Bridge**:
   - In Phase 4 (scroll 80% to 100%), the GSAP timeline tweens the tire from center stage to dock beside `.quote-bar-card`.
   - The docking container `.quote-tire-dock` possesses fixed CSS dimensions (`min-height: 420px; aspect-ratio: 1 / 1;`), guaranteeing `CLS = 0`.
   - When docking completes, the quote form is pre-targeted with Roadone HD55 commercial specs (`Camión / Transporte Pesado`, `315/70 R22.5`, `Roadone HD55`).
   - Submission triggers the standardized WhatsApp inquiry payload to `+591 72960725`.
6. **Reduced Motion Accessibility**:
   - When `matchMedia('(prefers-reduced-motion: reduce)').matches` is true:
     - GSAP ScrollTrigger pinning and scrub timelines are completely bypassed.
     - `.cinematic-hero-stage` collapses from 350vh to static `height: auto`.
     - Blur is clamped to 0px, 3D perspective is `none`.
     - The 3 telemetry cards render statically as an accessible 3-column feature grid right beneath the static Roadone HD55 tire, allowing all visitors to read the technical specs without scrolling or animation.
     - Native document scroll proceeds unimpeded directly into `.section-quote-bar`.

---

## 3. Caveats

1. **Co-location with Explorer 1 & 2**:
   - Explorer 1 designs `.cinematic-hero-stage` (350vh virtual track, 100vh pinned `.cinematic-viewport`) and Phase 1 typography.
   - Explorer 2 designs `.tire-stage` (perspective morph between `roadone-hd55-frente.webp` and `roadone-hd55-45.webp`, contact shadow matrix).
   - Our Phase 3 `.telemetry-layer` mounts as a sibling inside `.tire-stage` or `.cinematic-viewport`. Our blueprint provides clear, unambiguous DOM insertion markers so the Worker can merge them seamlessly.
2. **Head Invariance**:
   - Lines 1–156 of `web/index.html` (SEO, OpenGraph, JSON-LD, Vercel Analytics) must NOT be edited. All DOM additions occur strictly inside `<main id="main-content">` and script tags before `</body>`.

---

## 4. Conclusion & Complete Implementation Blueprint

The Worker implementing Features F9, F10, F11, and F12 must execute the following concrete changes:

### Blueprint Part 1: Design Tokens in `web/assets/css/styles.css`
Add the luxury automotive dark tokens to `:root` at line 10 of `web/assets/css/styles.css`:
```css
/* --------------------------------------------------------------------------
   LUXURY AUTOMOTIVE DARK TOKENS (SURLANTAS TELEMETRY & SPOTLIGHT)
   -------------------------------------------------------------------------- */
:root {
  --color-automotive-dark: #0B0F17;
  --color-electric-blue: #0066FF;
  --color-brand-red: #D32F2F;
  --color-glass-surface: rgba(11, 15, 23, 0.82);
  --color-glass-border: rgba(255, 255, 255, 0.12);
  --color-glass-fallback: rgba(11, 15, 23, 0.95);
  ...
```

### Blueprint Part 2: DOM Markup in `web/index.html`

Inside `.cinematic-viewport` (inside `.tire-stage`), add the Telemetry Hotspots Layer:
```html
<!-- Phase 03: Telemetry Hotspots Layer (Scroll 55% - 80%) -->
<div class="telemetry-layer" id="telemetryLayer" aria-label="Telemetría e inspección técnica Roadone HD55">
  
  <!-- Hotspot 1: Banda de rodadura 16.5mm (Top-Left) -->
  <div class="telemetry-hotspot-wrapper" style="left: 35%; top: 25%;">
    <button 
      type="button" 
      class="telemetry-hotspot" 
      id="hotspot-tread" 
      data-hotspot="tread"
      aria-label="Inspeccionar: Banda de rodadura 16.5mm" 
      aria-expanded="false" 
      aria-controls="card-tread"
    >
      <svg class="telemetry-hotspot__svg" viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
        <circle class="hotspot-ring hotspot-ring--outer" cx="22" cy="22" r="18" />
        <circle class="hotspot-ring hotspot-ring--mid" cx="22" cy="22" r="11" />
        <circle class="hotspot-core" cx="22" cy="22" r="5" />
        <line class="hotspot-tick" x1="22" y1="4" x2="22" y2="8" />
        <line class="hotspot-tick" x1="22" y1="36" x2="22" y2="40" />
        <line class="hotspot-tick" x1="4" y1="22" x2="8" y2="22" />
        <line class="hotspot-tick" x1="36" y1="22" x2="40" y2="22" />
      </svg>
      <span class="telemetry-hotspot__beacon"></span>
      <span class="telemetry-hotspot__label">Banda 16.5mm</span>
    </button>

    <div class="telemetry-card" id="card-tread" role="region" aria-label="Detalles de Banda de rodadura">
      <button type="button" class="telemetry-card__close" aria-label="Cerrar telemetría de banda">&times;</button>
      <div class="telemetry-card__badge">BANDA DE RODADURA</div>
      <h3 class="telemetry-card__title">Banda de rodadura 16.5mm</h3>
      <div class="telemetry-card__metric">
        <span class="telemetry-card__metric-val">+35,000 km</span>
        <span class="telemetry-card__metric-lbl">Vida Útil Estimada</span>
      </div>
      <p class="telemetry-card__desc">
        Profundidad superior de 16.5mm con sipes tridimensionales y canales de evacuación rápida que maximizan el kilometraje y evitan el desgaste irregular.
      </p>
    </div>
  </div>

  <!-- Hotspot 2: Carcasa de acero 4 capas (Mid-Right) -->
  <div class="telemetry-hotspot-wrapper" style="left: 65%; top: 55%;">
    <button 
      type="button" 
      class="telemetry-hotspot" 
      id="hotspot-casing" 
      data-hotspot="casing"
      aria-label="Inspeccionar: Carcasa de acero 4 capas" 
      aria-expanded="false" 
      aria-controls="card-casing"
    >
      <svg class="telemetry-hotspot__svg" viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
        <circle class="hotspot-ring hotspot-ring--outer" cx="22" cy="22" r="18" />
        <circle class="hotspot-ring hotspot-ring--mid" cx="22" cy="22" r="11" />
        <circle class="hotspot-core" cx="22" cy="22" r="5" />
        <line class="hotspot-tick" x1="22" y1="4" x2="22" y2="8" />
        <line class="hotspot-tick" x1="22" y1="36" x2="22" y2="40" />
        <line class="hotspot-tick" x1="4" y1="22" x2="8" y2="22" />
        <line class="hotspot-tick" x1="36" y1="22" x2="40" y2="22" />
      </svg>
      <span class="telemetry-hotspot__beacon"></span>
      <span class="telemetry-hotspot__label">Carcasa 4 Capas</span>
    </button>

    <div class="telemetry-card" id="card-casing" role="region" aria-label="Detalles de Carcasa de acero">
      <button type="button" class="telemetry-card__close" aria-label="Cerrar telemetría de carcasa">&times;</button>
      <div class="telemetry-card__badge">ESTRUCTURA Y CARCASA</div>
      <h3 class="telemetry-card__title">Carcasa de acero 4 capas</h3>
      <div class="telemetry-card__metric">
        <span class="telemetry-card__metric-val">4×</span>
        <span class="telemetry-card__metric-lbl">Protección Antipinchazos</span>
      </div>
      <p class="telemetry-card__desc">
        Cinturones de acero de alta tensión que blindan la banda contra impactos y cortes en caminos difíciles, apta para múltiples reencauches certificados.
      </p>
    </div>
  </div>

  <!-- Hotspot 3: Eficiencia de rodadura (Bottom-Center) -->
  <div class="telemetry-hotspot-wrapper" style="left: 50%; top: 80%;">
    <button 
      type="button" 
      class="telemetry-hotspot" 
      id="hotspot-efficiency" 
      data-hotspot="efficiency"
      aria-label="Inspeccionar: Eficiencia de rodadura" 
      aria-expanded="false" 
      aria-controls="card-efficiency"
    >
      <svg class="telemetry-hotspot__svg" viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
        <circle class="hotspot-ring hotspot-ring--outer" cx="22" cy="22" r="18" />
        <circle class="hotspot-ring hotspot-ring--mid" cx="22" cy="22" r="11" />
        <circle class="hotspot-core" cx="22" cy="22" r="5" />
        <line class="hotspot-tick" x1="22" y1="4" x2="22" y2="8" />
        <line class="hotspot-tick" x1="22" y1="36" x2="22" y2="40" />
        <line class="hotspot-tick" x1="4" y1="22" x2="8" y2="22" />
        <line class="hotspot-tick" x1="36" y1="22" x2="40" y2="22" />
      </svg>
      <span class="telemetry-hotspot__beacon"></span>
      <span class="telemetry-hotspot__label">Eficiencia Diésel</span>
    </button>

    <div class="telemetry-card" id="card-efficiency" role="region" aria-label="Detalles de Eficiencia de rodadura">
      <button type="button" class="telemetry-card__close" aria-label="Cerrar telemetría de eficiencia">&times;</button>
      <div class="telemetry-card__badge">EFICIENCIA ENERGÉTICA</div>
      <h3 class="telemetry-card__title">Eficiencia de rodadura</h3>
      <div class="telemetry-card__metric">
        <span class="telemetry-card__metric-val">-4.5%</span>
        <span class="telemetry-card__metric-lbl">Consumo Diésel</span>
      </div>
      <p class="telemetry-card__desc">
        Compuesto avanzado de baja resistencia al rodamiento que reduce la pérdida de energía por fricción, optimizando el rendimiento de combustible en flotas.
      </p>
    </div>
  </div>

</div>
```

In `.section-quote-bar`, add the dimension-reserved docking bay (line 245):
```html
<section class="section-quote-bar" aria-label="Cotizador rápido de llantas por medida">
  <div class="container">
    <div class="quote-bar-container">
      <!-- Reserved docking bay for Phase 4 tire landing (guarantees CLS = 0) -->
      <div class="quote-tire-dock" id="quoteTireDock" aria-hidden="true"></div>
      
      <div class="quote-bar-card reveal">
        ... (form #tireQuoteForm)
      </div>
    </div>
  </div>
</section>
```

### Blueprint Part 3: CSS Styles in `web/assets/css/styles.css`

```css
/* --------------------------------------------------------------------------
   PHASE 03: SVG TELEMETRY HOTSPOTS & DARK SHADCN GLASS CARDS (F9 & F10)
   -------------------------------------------------------------------------- */
.telemetry-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 20;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.4s ease, visibility 0.4s ease;
}

.telemetry-layer.active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.telemetry-hotspot-wrapper {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  z-index: 22;
}

.telemetry-hotspot {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  min-width: 44px;
  min-height: 44px;
  outline: none;
  border-radius: 9999px;
  touch-action: manipulation;
}

.telemetry-hotspot:focus-visible {
  outline: 2px solid var(--color-electric-blue);
  outline-offset: 4px;
}

.telemetry-hotspot__svg {
  display: block;
  width: 36px;
  height: 36px;
  filter: drop-shadow(0 0 8px rgba(0, 102, 255, 0.8));
}

.hotspot-ring {
  fill: none;
  stroke: var(--color-electric-blue);
  stroke-width: 1.5;
  transform-origin: center;
}

.hotspot-ring--outer {
  stroke-dasharray: 4 3;
  animation: hudRadarSpin 8s linear infinite;
}

.hotspot-ring--mid {
  stroke-width: 1;
  opacity: 0.7;
}

.hotspot-core {
  fill: var(--color-electric-blue);
  animation: hudCorePulse 2s ease-in-out infinite;
}

.hotspot-tick {
  stroke: var(--color-electric-blue);
  stroke-width: 1.5;
}

.telemetry-hotspot__beacon {
  position: absolute;
  left: 24px;
  top: 24px;
  width: 30px;
  height: 30px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1.5px solid var(--color-electric-blue);
  animation: hudPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  pointer-events: none;
}

.telemetry-hotspot__label {
  font-family: var(--font-heading);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #FFFFFF;
  background: rgba(11, 15, 23, 0.85);
  border: 1px solid rgba(0, 102, 255, 0.4);
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  white-space: nowrap;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  transition: border-color var(--transition-fast), color var(--transition-fast);
}

.telemetry-hotspot:hover .telemetry-hotspot__label,
.telemetry-hotspot[aria-expanded="true"] .telemetry-hotspot__label {
  border-color: var(--color-electric-blue);
  color: #FFFFFF;
  background: rgba(0, 102, 255, 0.25);
}

@keyframes hudRadarSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes hudCorePulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.75; }
}

@keyframes hudPing {
  0% { transform: translate(-50%, -50%) scale(0.6); opacity: 1; }
  80%, 100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
}

/* Glassmorphic Telemetry Cards */
.telemetry-card {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  width: 290px;
  max-width: min(320px, calc(100vw - 32px));
  background: rgba(11, 15, 23, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-md);
  box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.7), 0 0 20px -2px rgba(0, 102, 255, 0.25);
  padding: 1.25rem 1.35rem;
  color: #FFFFFF;
  z-index: 25;
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px) scale(0.97);
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.25s;
  pointer-events: none;
}

/* Adjust card positioning so it doesn't overflow viewport */
#card-tread {
  left: 0;
}
#card-casing {
  right: 0;
  left: auto;
}
#card-efficiency {
  bottom: calc(100% + 12px);
  top: auto;
  left: 50%;
  transform: translateX(-50%) translateY(-8px) scale(0.97);
}

.telemetry-card.active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0) scale(1);
}
#card-efficiency.active {
  transform: translateX(-50%) translateY(0) scale(1);
}

@supports not ((backdrop-filter: blur(16px)) or (-webkit-backdrop-filter: blur(16px))) {
  .telemetry-card {
    background: rgba(11, 15, 23, 0.95);
  }
}

.telemetry-card__close {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  transition: color 0.15s, background-color 0.15s;
}

.telemetry-card__close:hover,
.telemetry-card__close:focus-visible {
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.12);
}

.telemetry-card__badge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-electric-blue);
  background: rgba(0, 102, 255, 0.12);
  border: 1px solid rgba(0, 102, 255, 0.35);
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  margin-bottom: 0.5rem;
}

.telemetry-card__title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #FFFFFF;
  margin-bottom: 0.4rem;
  letter-spacing: -0.01em;
}

.telemetry-card__metric {
  display: flex;
  flex-direction: column;
  background: rgba(0, 102, 255, 0.08);
  border-left: 3px solid var(--color-electric-blue);
  padding: 0.45rem 0.75rem;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin: 0.65rem 0;
}

.telemetry-card__metric-val {
  font-size: 1.3rem;
  font-weight: 900;
  color: #FFFFFF;
  line-height: 1.2;
}

.telemetry-card__metric-lbl {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  text-transform: uppercase;
}

.telemetry-card__desc {
  font-size: 0.82rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

/* Phase 04 Landing Dock Container */
.quote-tire-dock {
  min-height: 420px;
  position: relative;
  display: none; /* Active when landing occurs */
}

/* --------------------------------------------------------------------------
   FEATURE F12: PREFERS-REDUCED-MOTION COMPLETE ACCESSIBLE STATIC FALLBACK
   -------------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  /* 1. Eliminate pinned virtual stage and restore standard auto height */
  .cinematic-hero-stage {
    height: auto !important;
    min-height: unset !important;
    overflow: visible !important;
    position: static !important;
  }

  .cinematic-viewport {
    position: relative !important;
    height: auto !important;
    min-height: unset !important;
    transform: none !important;
    top: auto !important;
    left: auto !important;
    width: 100% !important;
  }

  /* 2. Disable blur filter on typography and backgrounds */
  .cinematic-hero-stage *,
  .hero__title,
  .hero__content {
    filter: none !important;
    -webkit-filter: none !important;
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }

  /* 3. Remove 3D perspective distortion on tire imagery */
  .tire-stage,
  .tire-visual,
  .tire-img {
    perspective: none !important;
    transform: none !important;
  }

  /* 4. Display Roadone HD55 frontal image statically at 1:1 ratio */
  .tire-img--frente {
    opacity: 1 !important;
    display: block !important;
    max-width: 480px !important;
    margin: 0 auto !important;
  }
  .tire-img--45 {
    display: none !important;
  }
  .tire-contact-shadow {
    transform: matrix(1, 0, 0, 0.26, 0, 0) !important;
  }

  /* 5. Telemetry Hotspots in Static Accessible Grid */
  .telemetry-hotspot {
    display: none !important;
  }
  .telemetry-layer {
    position: static !important;
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
    display: grid !important;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)) !important;
    gap: 1.25rem !important;
    margin: 2.5rem 0 !important;
    padding: 0 1.5rem !important;
    max-width: var(--container-max, 1280px) !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
  .telemetry-hotspot-wrapper {
    position: static !important;
    transform: none !important;
  }
  .telemetry-card {
    position: static !important;
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
    pointer-events: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5) !important;
  }
  .telemetry-card__close {
    display: none !important;
  }

  /* 6. Quote bar remains reachable and focusable in natural DOM order */
  .section-quote-bar {
    position: relative !important;
    z-index: 10 !important;
    margin-top: 2rem !important;
  }
}
```

### Blueprint Part 4: JavaScript State Machine & Controllers in `web/assets/js/main.js`

```javascript
/* --------------------------------------------------------------------------
   TELEMETRY HOTSPOTS & GLASS CARDS CONTROLLER (FEATURES F9 & F10)
   -------------------------------------------------------------------------- */
class TelemetryController {
  constructor() {
    this.layer = document.getElementById('telemetryLayer');
    this.hotspots = document.querySelectorAll('.telemetry-hotspot');
    this.cards = document.querySelectorAll('.telemetry-card');
    this.activeHotspotId = null;

    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init() {
    if (!this.layer || !this.hotspots.length) return;

    this.hotspots.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleHotspot(btn.id);
      });

      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Space') {
          e.preventDefault();
          e.stopPropagation();
          this.toggleHotspot(btn.id);
        }
      });
    });

    // Close buttons inside cards
    const closeButtons = document.querySelectorAll('.telemetry-card__close');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeAll();
      });
    });

    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('pointerdown', this.handleOutsideClick);
    window.addEventListener('resize', this.handleResize, { passive: true });
  }

  toggleHotspot(id) {
    if (this.activeHotspotId === id) {
      this.closeAll();
    } else {
      this.openHotspot(id);
    }
  }

  openHotspot(id) {
    this.closeAll();
    const btn = document.getElementById(id);
    if (!btn) return;

    const cardId = btn.getAttribute('aria-controls');
    const card = document.getElementById(cardId);

    btn.setAttribute('aria-expanded', 'true');
    btn.classList.add('active');
    if (card) {
      card.classList.add('active');
    }
    this.activeHotspotId = id;
  }

  closeAll() {
    this.hotspots.forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('active');
    });
    this.cards.forEach(card => card.classList.remove('active'));
    this.activeHotspotId = null;
  }

  handleKeydown(e) {
    if (e.key === 'Escape' && this.activeHotspotId) {
      this.closeAll();
    }
  }

  handleOutsideClick(e) {
    if (!this.activeHotspotId) return;
    const clickedInside = e.target.closest('.telemetry-hotspot') || e.target.closest('.telemetry-card');
    if (!clickedInside) {
      this.closeAll();
    }
  }

  handleResize() {
    if (this.activeHotspotId) {
      this.closeAll();
    }
  }

  setPhaseVisible(isVisible) {
    if (!this.layer) return;
    if (isVisible) {
      this.layer.classList.add('active');
    } else {
      this.layer.classList.remove('active');
      this.closeAll();
    }
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('pointerdown', this.handleOutsideClick);
    window.removeEventListener('resize', this.handleResize);
  }
}

/* --------------------------------------------------------------------------
   PHASE 04 LANDING INTO WHATSAPP CTA CONTROLLER (FEATURE F11)
   -------------------------------------------------------------------------- */
class TireLandingQuoteBridge {
  static prefillRoadoneTruckQuote() {
    const vehicleSelect = document.getElementById('quoteVehicle');
    const sizeInput = document.getElementById('quoteSize');
    const brandSelect = document.getElementById('quoteBrand');

    if (vehicleSelect) vehicleSelect.value = 'Camión / Transporte Pesado';
    if (sizeInput) sizeInput.value = '315/70 R22.5';
    if (brandSelect) brandSelect.value = 'Roadone';
  }

  static buildWhatsAppQuoteURL(vehicle, size, brand, phone = '59172960725') {
    const safeVehicle = (vehicle || 'Camión / Transporte Pesado').trim();
    const safeSize = (size || '315/70 R22.5').trim().substring(0, 100);
    const safeBrand = (brand || 'Roadone HD55').trim();

    const text = `Hola, quisiera consultar disponibilidad y precio para ${safeVehicle}, medida ${safeSize}, marca ${safeBrand}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  static validateQuoteForm(vehicle, size) {
    if (!vehicle || !size || size.trim() === '') {
      return { valid: false, error: 'Medida requerida' };
    }
    return { valid: true };
  }
}
```

### Blueprint Part 5: GSAP ScrollTrigger Integration Hook
In the master GSAP scroll timeline initialized in `initHeroScrollEngine()`:
```javascript
function initHeroScrollEngine() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) {
    // F12-T2-1: NEVER create ScrollTrigger pinning instances
    return;
  }

  const telemetry = new TelemetryController();
  telemetry.init();

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#cinematicStage',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      pin: '#cinematicViewport',
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress;

        // Phase 3 Telemetry Visibility (0.55 <= p < 0.80)
        if (p >= 0.55 && p < 0.80) {
          telemetry.setPhaseVisible(true);
        } else {
          telemetry.setPhaseVisible(false); // Auto-dismisses cards on enter Phase 4 (P04)
        }

        // Phase 4 Docking Completion Pre-fill (p >= 0.90)
        if (p >= 0.90) {
          TireLandingQuoteBridge.prefillRoadoneTruckQuote();
        }
      }
    }
  });

  // Phase 1 (0.00 -> 0.25): Typographic Awakening
  // Phase 2 (0.25 -> 0.55): Perspective Morph & Shadow Matrix
  // Phase 3 (0.55 -> 0.80): Telemetry Hotspot Scale-in
  tl.fromTo('#telemetryLayer', { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.55);

  // Phase 4 (0.80 -> 1.00): Tire Landing into Quote Bar Dock
  tl.to('#telemetryLayer', { opacity: 0, duration: 0.04 }, 0.80);
  tl.to('#tireStage', {
    y: '40vh',
    scale: 0.72,
    ease: 'power2.inOut',
    duration: 0.20
  }, 0.80);
}
```

---

## 5. Verification Method

To verify these implementations against the E2E test suite:

1. **Verify Token Existence**:
   ```powershell
   node tests/runner.js --feature=F10
   ```
   *Expected result*: All 10 tests for F10 pass immediately once `#0B0F17` and `#0066FF` are added to `styles.css`.

2. **Verify All Milestone 2 Features (F5 to F12)**:
   ```powershell
   node tests/runner.js --milestone=M2
   ```
   *Expected result*: **80 passed / 80 tests** (100% PASS).

3. **Verify Reduced Motion Fallback Suite**:
   ```powershell
   node tests/runner.js --feature=F12
   ```
   *Expected result*: **10 passed / 10 tests** (5 Tier 1 + 5 Tier 2).

4. **Verify Hotspots and Landing CTA**:
   ```powershell
   node tests/runner.js --feature=F9
   node tests/runner.js --feature=F11
   ```
   *Expected result*: **20 passed / 20 tests** (10 for F9, 10 for F11).

5. **Verify Cross-Feature Pairwise Matrix & User Scenarios**:
   ```powershell
   node --test tests/tier3/cross_feature_matrix.test.js
   node --test tests/tier4/real_world_scenarios.test.js
   ```
   *Expected result*: **25 passed / 25 tests** (20 Tier 3 + 5 Tier 4).
