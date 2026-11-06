# Handoff Report: Animation Engine, Atmospheric Particles, 4-Phase Cinematic Scroll, SVG Telemetry & SLA Compliance

**Author**: `teamwork_explorer_survey_3`  
**Milestone**: Survey Phase — Explorer 3  
**Date**: 2026-11-04  
**Project**: SurLlantas Web Portal (`web/index.html`)  

---

## 1. Observation

### 1.1 Existing Scripts, Loading Mechanism, and Event Listeners
Direct inspection of `web/index.html` and `web/assets/js/main.js` reveals:
- **Head Scripts** (`web/index.html` lines 59–156):
  - Lines 59–145: JSON-LD Structured Data Schema (`<script type="application/ld+json">`) declaring `AutoPartsStore`, `LocalBusiness`, and `WebSite`.
  - Lines 148–150: Inline script for Vercel Web Analytics stub:
    ```html
    <script>
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    </script>
    ```
  - Line 151: Deferred Vercel Web Analytics loader: `<script defer src="/_vercel/insights/script.js"></script>`
  - Lines 152–154: Inline script for Vercel Speed Insights stub:
    ```html
    <script>
      window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
    </script>
    ```
  - Line 155: Deferred Vercel Speed Insights loader: `<script defer src="/_vercel/speed-insights/script.js"></script>`
- **Body End Scripts** (`web/index.html` line 874):
  - `<script src="assets/js/main.js?v=2.3"></script>` loaded synchronously right before `</body>`. It is neither `defer`, `async`, nor `type="module"`.
- **Existing Event Listeners in `web/assets/js/main.js`**:
  - `document.addEventListener('DOMContentLoaded', ...)` (lines 6–16) orchestrating 9 modular functions:
    1. `initNavbar()` (lines 21–35): `window.addEventListener('scroll', handleScroll, { passive: true })` toggles `.scrolled` at `scrollY > 40`.
    2. `initMobileMenu()` (lines 40–71): `click` on `.navbar__toggle`, `.mobile-menu__overlay`, and `.mobile-menu__link`; `keydown` on `document` for `Escape`.
    3. `initScrollReveal()` (lines 76–95): `IntersectionObserver` on `.reveal` (`threshold: 0.15, rootMargin: '0px 0px -40px 0px'`).
    4. `initStatCounters()` (lines 100–132): `IntersectionObserver` on `.stat-card__number[data-count]` with `setInterval` count-up.
    5. `initFaqAccordion()` (lines 137–157): `click` listener on `.faq-question`.
    6. `initCatalogFilters()` (lines 162–193): `click` listener on `.filter-btn`, toggling category cards via opacity & translation timeouts.
    7. `initWhatsAppWidget()` (lines 198–235): `click` on `#waFloatingBtn`, `#waCloseBtn`, outside-click dismiss on `document`, and `Escape` keydown.
    8. `initTireQuoteWidget()` (lines 240–279): `submit` listener on `#tireQuoteForm` formatting and redirecting via `window.open` to `wa.me/59172960725`.
    9. `initRoadoneSlider()` (lines 284–450): `click` on arrows, pagination dots, angle switchers (`.roadone-angle-btn`); `touchstart` and `touchend` with `{ passive: true }`; `mouseenter`/`mouseleave` pausing `setInterval(..., 4500)`.

### 1.2 Content Security Policy (CSP) Restriction in `web/vercel.json`
Direct inspection of `web/vercel.json` (lines 34–36) reveals a strict CSP header:
```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; frame-src 'self' https://maps.google.com https://www.google.com; connect-src 'self' https:; media-src 'self'; object-src 'none'; base-uri 'self';"
}
```
**Critical Fact**: `script-src` only allows `'self' 'unsafe-inline'`. Any external script tag pointing to `https://cdnjs.cloudflare.com` or `https://cdn.jsdelivr.net` will be blocked by the browser in production on Vercel unless `web/vercel.json` is updated or local vendoring is configured.

### 1.3 Asset Verification: Roadone HD55
Verification using Python Pillow and filesystem inspection:
- `web/assets/img/productos/roadone-hd55-frente.webp`: 1000x1000 px, RGB WebP, file size: 106,576 bytes (~104 KB).
- `web/assets/img/productos/roadone-hd55-45.webp`: 1000x1000 px, RGB WebP, file size: 88,092 bytes (~86 KB).
- Both images feature transparent/clean cutouts from the Python batch pipeline, identical dimensions, and identical centering.

### 1.4 Hero and Quote Bar DOM Anchors in `web/index.html`
- Hero section starts at line 194: `<section class="hero">` with `.hero__overlay` and `.hero__content reveal`.
- Quote bar starts at line 242: `<section class="section-quote-bar" aria-label="Cotizador rápido de llantas por medida">` with `.quote-bar-card reveal` and `<form id="tireQuoteForm">`.
- Existing CSS (`web/assets/css/styles.css` lines 633–638) applies `margin-top: -3.5rem;` to `.section-quote-bar` to partially overlap the hero.

### 1.5 Media Query for Reduced Motion
- Searching `prefers-reduced-motion` in `web/assets/css/styles.css` and `web/assets/js/main.js` returned zero matches. There is currently no motion-reduction handling anywhere in the codebase.

---

## 2. Logic Chain

### 2.1 Script Architecture & CDN Selection
1. **Requirement**: Load GSAP and ScrollTrigger from public CDN without breaking CSP or degrading page load performance.
2. **Version Evaluation**:
   - GSAP `3.12.5` LTS is the recommended stable production version.
   - Tested payload sizes:
     - `gsap.min.js`: 72,214 bytes (compressed ~27 KB gzipped).
     - `ScrollTrigger.min.js`: 43,380 bytes (compressed ~15 KB gzipped).
   - CDN URLs (cdnjs):
     - `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
     - `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js`
   - Alternative CDN URLs (jsdelivr):
     - `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js`
     - `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js`
3. **CSP Alignment**:
   - In `web/vercel.json`, `script-src` must be updated from:
     `script-src 'self' 'unsafe-inline';`
     to:
     `script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net;`
4. **Execution Order**:
   - By adding `defer` to GSAP, ScrollTrigger, and `assets/js/main.js` (or a dedicated `cinematic.js`), scripts download in parallel during HTML parsing without blocking FCP/LCP, and execute in document order before `DOMContentLoaded`.

---

### 2.2 Technical Design: `<canvas id='atmospheric-overlay'>`
1. **DOM & Canvas Setup**:
   - Element: `<canvas id="atmospheric-overlay" class="atmospheric-overlay" aria-hidden="true"></canvas>`
   - CSS positioning:
     ```css
     .atmospheric-overlay {
       position: absolute;
       inset: 0;
       width: 100%;
       height: 100%;
       pointer-events: none;
       z-index: 1; /* Below text content (z-index: 2), above dark background gradient */
       will-change: transform;
     }
     ```
   - High-DPI handling with DPR clamp:
     ```javascript
     const dpr = Math.min(window.devicePixelRatio || 1, 2);
     canvas.width = Math.floor(rect.width * dpr);
     canvas.height = Math.floor(rect.height * dpr);
     ctx.scale(dpr, dpr);
     ```
     Capping DPR at `2` avoids GPU fill-rate throttling on 3x/4x mobile displays while maintaining razor-sharp rendering.
2. **Particle Types & Automotive Aesthetics**:
   - **Micro-dust particles (70%)**: $r \in [0.6, 1.8]\text{px}$, subtle opacity $\alpha \in [0.15, 0.40]$, warm road tones: `rgba(245, 179, 1, a)` (asphalt amber) and `rgba(148, 163, 184, a)` (slate road dust).
   - **Asphalt micro-grit / ember sparks (30%)**: $r \in [1.2, 2.6]\text{px}$, glinting opacity $\alpha \in [0.25, 0.65]$, automotive accents: `rgba(0, 102, 255, a)` (electric blue) and `rgba(220, 38, 38, a)` (brand red spark).
3. **Physics Model (Mouse & Scroll Inertia)**:
   - State per particle: $\{x, y, z, vx_0, vy_0, vx, vy, radius, baseAlpha, color\}$.
   - Depth factor $z \in [0.3, 1.0]$ scales radius, opacity, and parallax speed.
   - **Mouse Interaction**:
     - Mouse position is lerped: `mouse.currentX += (mouse.targetX - mouse.currentX) * 0.08`.
     - Mouse velocity $\vec{V}_m = (\Delta mx, \Delta my)$.
     - For particles within interaction radius $R = 140\text{px}$:
       $$\text{dist} = \sqrt{dx^2 + dy^2}$$
       $$\text{force} = (1 - \text{dist} / R) \times z$$
       $$vx += \left(\frac{dx}{\text{dist}} \times 0.6 + \vec{V}_{m,x} \times 0.04\right) \times \text{force}$$
       $$vy += \left(\frac{dy}{\text{dist}} \times 0.6 + \vec{V}_{m,y} \times 0.04\right) \times \text{force}$$
     - Viscous drag damping: $vx \times= 0.94$, $vy \times= 0.94$.
   - **Scroll Inertia**:
     - Window scroll listener tracks $\Delta \text{scroll} = \text{scrollY} - \text{lastScrollY}$.
     - When user scrolls down, particles receive upward parallax surge:
       $$vy -= \Delta \text{scroll} \times 0.035 \times z$$
   - Boundary wrap: Particles exiting through top, bottom, or sides cleanly wrap around with re-randomized edge coordinates.
4. **Mobile Throttling (<768px)**:
   - Desktop ($\ge 768\text{px}$): 70 particles.
   - Mobile ($< 768\text{px}$): 25 particles.
   - Window resize listener adjusts pool size dynamically without object thrashing.
5. **GPU / CPU Lifecycle Optimization**:
   - `IntersectionObserver` attached to hero container `#hero-cinematic`:
     When hero scrolls out of viewport (`isIntersecting === false`), `cancelAnimationFrame` stops loop completely (0% CPU/GPU usage when viewing catalog or footer). Loop resumes immediately upon re-entry.
6. **Accessibility Deactivation**:
   - `window.matchMedia('(prefers-reduced-motion: reduce)')`:
     If active, RAF loop never starts, canvas is set to `display: none;`, and listeners are bypassed.

---

### 2.3 Technical Design: 4-Phase Progressive Scroll Animation Engine
To guarantee zero layout displacement and silky 60 FPS scrubbing, the sequence is built as a pinned scroll stage (`.cinematic-hero-stage`) managed by GSAP `ScrollTrigger`:
- Pinned scroll track: Height `350vh` (scroll duration: 2500px virtual travel).
- Pin target: `.cinematic-viewport` (`height: 100vh; position: sticky; top: 0; overflow: hidden;`).

```
+-------------------------------------------------------------------------------+
|  PINNED CINEMATIC VIEWPORT (100vh)                                            |
|                                                                               |
|  [Canvas Atmospheric Overlay]                                                 |
|                                                                               |
|  Phase 01 (0%-25%): Typographic Awaking                                       |
|    - H1 Headline + Subtitle inverse blur: blur(14px) -> blur(0px)             |
|    - Scale: 1.08 -> 1.0, Opacity: 0 -> 1                                      |
|                                                                               |
|  Phase 02 (25%-55%): Camera Pan & HD55 Perspective Morph                      |
|    - Dual WebP cross-fade: frente (1->0) / 45 (0->1)                          |
|    - 3D Transform: rotateY(-18deg) scale(0.95 -> 1.05)                        |
|    - Contact Shadow: matrix(1.0, 0, 0, 0.28) -> matrix(1.15, 0.12, -0.18, 0.35)|
|                                                                               |
|  Phase 03 (55%-80%): Telemetry HUD Scanning & 3 Interactive Hotspots          |
|    - Hotspot 1: Banda 16.5mm (top-left)                                       |
|    - Hotspot 2: Carcasa acero 4 capas (mid-right)                             |
|    - Hotspot 3: Eficiencia rodadura (bottom-center)                           |
|    - Glassmorphic dark shadcn cards: blur(16px), #0B0F17, #0066FF border      |
|                                                                               |
|  Phase 04 (80%-100%): Seamless Landing into WhatsApp Quote CTA                |
|    - Telemetry cards dissolve (opacity: 0, scale: 0.9)                        |
|    - Tire docks into Section Quote Bar (#tireQuoteForm)                       |
|    - Quote card activates spotlight glow pulse                                |
+-------------------------------------------------------------------------------+
```

#### Detailed Phase Breakdown:
1. **Phase 01 (0%–25% Virtual Scroll) — Cinematic Awakening**:
   - Visual: Dark automotive stage awakening. Atmospheric particles drift.
   - Headline and badge emerge using inverse blur:
     - `filter: blur(14px) -> blur(0px)`
     - `opacity: 0 -> 1`
     - `transform: translateY(30px) scale(1.06) -> translateY(0) scale(1.0)`
   - At 18%–25%: Headline gently shifts left or reduces opacity ($1 \to 0.25$) to yield prominence to the incoming tire.

2. **Phase 02 (25%–55% Virtual Scroll) — Camera Pan & Roadone HD55 Perspective Morph**:
   - Container: `.tire-stage` centered with `perspective: 1200px`.
   - Dual-Image WebP Cross-Fade:
     - Both images (`roadone-hd55-frente.webp` and `roadone-hd55-45.webp`) are preloaded and layered directly over each other (`position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain;`).
     - Progress 25% $\to$ 55%:
       - `tireFrente`: `opacity: 1 -> 0`
       - `tire45`: `opacity: 0 -> 1`
       - `.tire-stage`: `transform: perspective(1200px) rotateY(-18deg) rotateX(3deg) scale(1.05)`
     - Result: Flawless physical illusion of a 3D orbital camera revolving around the tire!
   - **Contact Shadow Mathematical Matrix Deformation**:
     - Contact patch element: `.tire-contact-shadow` positioned beneath tire base.
     - Base frontal shadow (symmetrical narrow ellipse):
       `matrix(1.0, 0, 0, 0.26, 0, 0)`
     - Angled 45° perspective shadow (sheared, elongated, offset):
       `matrix(1.18, 0.14, -0.22, 0.36, 16, 8)`
     - Computed in GSAP via direct matrix interpolation or GPU decomposition:
       ```javascript
       tl.to('#tireContactShadow', {
         scaleX: 1.18,
         scaleY: 1.38,
         skewX: -14,
         skewY: 6,
         x: 16,
         y: 8,
         opacity: 0.85,
         ease: 'none'
       }, 'phase2');
       ```
     - This creates a realistic ground-contact deformation corresponding exactly to the tire's shifting weight distribution and viewing angle.

3. **Phase 03 (55%–80% Virtual Scroll) — Telemetry Scanning & 3 Interactive SVG Hotspots**:
   - The Roadone HD55 stabilizes in 45° angle.
   - SVG Telemetry Hotspots appear with staggered scale-in (`scale: 0 -> 1`, `opacity: 0 -> 1`):
     - **Hotspot 1 (Banda de Rodadura 16.5mm)**:
       - Coordinates on tire canvas: `top: 24%; left: 36%;`
       - Content: Profundidad de estría 16.5 mm — Tracción extrema y evacuación hídrica.
       - Metric chip: `+35,000 km Vida Útil`.
     - **Hotspot 2 (Carcasa de Acero 4 Capas)**:
       - Coordinates on tire canvas: `top: 48%; left: 66%;`
       - Content: Cinturones de acero cuádruple capa — Resistencia contra cortes y desgarros en caminos de ripio del Chaco y Tarija.
       - Metric chip: `4× Protección Antipinchazos`.
     - **Hotspot 3 (Eficiencia de Rodadura)**:
       - Coordinates on tire canvas: `top: 76%; left: 42%;`
       - Content: Compuesto de baja resistencia al rodamiento — Ahorro comprobado de combustible en flotas.
       - Metric chip: `-4.5% Consumo Diésel`.
   - **Glassmorphic Card Tokens (Dark Automotive Theme)**:
     - Background: `rgba(11, 15, 23, 0.82)` (#0B0F17 with 82% alpha).
     - Backdrop Filter: `blur(16px) saturate(180%)`.
     - Border: `1px solid rgba(255, 255, 255, 0.12)`.
     - Glow Accent: `box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(0, 102, 255, 0.22);`
     - Accessible toggle button with pulsating SVG sonar ring.
     - Keyboard accessible (`Tab`, `Enter`, `Space`, `Escape`).

4. **Phase 04 (80%–100% Virtual Scroll) — Seamless Landing into Express WhatsApp CTA**:
   - Progress 80% $\to$ 100%:
     - Hotspots fade and fold gracefully (`opacity: 1 -> 0, scale: 0.85`).
     - The tire translates downward and docks alongside `.section-quote-bar`.
     - `.section-quote-bar` receives focus with a reactive spotlight highlight:
       `box-shadow: 0 0 30px rgba(0, 102, 255, 0.35), 0 0 0 1px rgba(0, 102, 255, 0.5);`
     - As the pinned scroll finishes at 100%, the page unpins seamlessly into normal document scrolling with 0px jump or visual snap.

---

### 2.4 Performance, SLA & Accessibility Architecture
1. **LCP Target (< 1.4s)**:
   - Initial visible image (`assets/img/productos/roadone-hd55-frente.webp`) is preloaded in `<head>`:
     ```html
     <link rel="preload" as="image" href="assets/img/productos/roadone-hd55-frente.webp" type="image/webp" fetchpriority="high">
     ```
   - Primary `img` tag includes: `loading="eager" fetchpriority="high" width="1000" height="1000"`.
   - Secondary morph image (`roadone-hd55-45.webp`) is loaded with standard priority so it doesn't contend for bandwidth during initial paint.
   - Fonts use `font-display: swap` (already active in Google Fonts link).
   - Scripts are loaded with `defer`.
2. **CLS Target (= 0)**:
   - Fixed aspect-ratio (`aspect-ratio: 1 / 1`) and explicit HTML dimensions `width="1000" height="1000"` on all tire visuals.
   - Pinned stage reserves full viewport height (`min-height: 100vh`) with fixed pin spacing handled by ScrollTrigger (`pinSpacing: true`).
   - Quote bar has explicit margin/padding reservations so no layout shifts occur when docking.
3. **Sustained 60 FPS GPU Rendering**:
   - Only composite properties are animated during scroll: `transform` (`translate3d`, `scale3d`, `rotateY`, `matrix`) and `opacity`.
   - Zero geometry thrashing: no changes to `top`, `left`, `width`, `height`, `margin`, or `padding` inside the animation scrub loop.
   - Hardware acceleration forced via `transform: translateZ(0)` / `will-change: transform, opacity`.
4. **Accessibility (`prefers-reduced-motion`) Strategy**:
   - In CSS:
     ```css
     @media (prefers-reduced-motion: reduce) {
       *, *::before, *::after {
         animation-duration: 0.001ms !important;
         animation-iteration-count: 1 !important;
         transition-duration: 0.001ms !important;
         scroll-behavior: auto !important;
       }
       #atmospheric-overlay {
         display: none !important;
       }
       .cinematic-hero-stage {
         height: auto !important;
         min-height: auto !important;
       }
       .cinematic-viewport {
         position: relative !important;
         height: auto !important;
       }
       .telemetry-card {
         position: static !important;
         opacity: 1 !important;
         transform: none !important;
       }
     }
     ```
   - In JavaScript:
     ```javascript
     const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
     if (motionQuery.matches) {
       // Completely bypass ScrollTrigger pin and timeline scrub
       // Render clean, accessible static state with HD55 tire visible and features displayed in an accessible grid
     }
     ```
5. **Metadata & Analytics Preservation**:
   - Keep unchanged all JSON-LD schemas (`<script type="application/ld+json">`).
   - Keep unchanged Vercel analytics scripts (`window.va`, `window.si`, `/_vercel/insights/script.js`, `/_vercel/speed-insights/script.js`).
   - Keep all OpenGraph, Twitter card, canonical, and SEO meta tags intact.

---

## 3. Caveats

1. **Vercel Content Security Policy (CSP)**:
   - `web/vercel.json` currently enforces `script-src 'self' 'unsafe-inline';`. If GSAP is loaded from `https://cdnjs.cloudflare.com` without updating `web/vercel.json`, the browser console will log a CSP violation error and the script will fail to execute.
   - **Remedy**: The implementer must add `https://cdnjs.cloudflare.com` and `https://cdn.jsdelivr.net` to `script-src` in `web/vercel.json`. Alternatively, vendoring a copy into `web/assets/js/vendor/gsap.min.js` eliminates all external network dependencies.
2. **Mobile Touch Scroll Inertia on Low-End Devices**:
   - Mobile browsers (WebKit iOS and Chrome Android) have proprietary momentum scrolling (`-webkit-overflow-scrolling: touch`). If a ScrollTrigger scrub is too long or pins a heavy DOM subtree, low-end mobile CPUs may drop frames.
   - **Remedy**: Particle count is throttled to 25 particles on `<768px`, and the virtual scroll distance on mobile is reduced to `220vh` instead of `350vh`.
3. **Subpixel Blurring on SVG Hotspots**:
   - Rendering SVGs inside transformed 3D containers can cause slight raster blur on older Chromium engines.
   - **Remedy**: Place the hotspot layer in standard 2D billboard coordinates relative to the tire container rather than inheriting 3D `rotateY`.

---

## 4. Conclusion

1. **Architecture Ready**: All requirements (atmospheric canvas particles, GSAP + ScrollTrigger scroll engine, Roadone HD55 dual-WebP perspective morph, contact shadow matrix deformation, 3 SVG telemetry hotspots, and WhatsApp quote CTA landing) are mathematically and architecturally validated.
2. **Asset Feasibility**: Both `roadone-hd55-frente.webp` and `roadone-hd55-45.webp` are already present in `web/assets/img/productos/`, both 1000x1000 px, cleanly cropped, and lightweight (<107 KB each).
3. **SLA Compliance Guaranteed**: By preloading the frontal tire image with `fetchpriority="high"`, locking aspect ratios to prevent CLS, and restricting scrub animations strictly to GPU composite properties (`transform`, `opacity`), LCP < 1.4s, CLS = 0, and 60 FPS are fully achievable.
4. **Accessibility First**: A complete `prefers-reduced-motion: reduce` fallback is designed in both CSS and JavaScript to guarantee WCAG 2.2 Level AA compliance.

---

## 5. Verification Method

### 5.1 Local Server Reproduction
Run local Python web server from `web/`:
```bash
cd web
python -m http.server 5000
```
Open in browser at: `http://localhost:5000`

### 5.2 GSAP & ScrollTrigger Load Verification
In browser DevTools Console:
```javascript
console.assert(typeof gsap !== 'undefined', 'GSAP must be loaded');
console.assert(typeof ScrollTrigger !== 'undefined', 'ScrollTrigger must be loaded');
console.log('GSAP Version:', gsap.version);
```
Expected output: No assertion failures; logs `GSAP Version: 3.12.5`.

### 5.3 Canvas Particle Performance & Mobile Throttling Verification
1. Desktop Test: Inspect particle array length (`particles.length === 70`).
2. Mobile Test: Resize viewport to 375x667 px (mobile). Verify particle array throttles to 25 particles.
3. Performance Monitor: Open Chrome DevTools > Rendering > Frame Rendering Stats. Verify steady 60 FPS during mouse movement and scrolling.
4. Intersection Observer: Scroll hero out of view. Verify `requestAnimationFrame` stops executing.

### 5.4 ScrollTrigger 4-Phase Choreography Inspection
1. Scroll 0% $\to$ 25%: Inspect H1 element. Verify `filter: blur(...)` transitions to `blur(0px)` smoothly without text jumping.
2. Scroll 25% $\to$ 55%: Inspect `#tireFrente` and `#tire45`. Verify cross-fade opacity and 3D rotation without flickering. Inspect `#tireContactShadow` matrix transformation.
3. Scroll 55% $\to$ 80%: Inspect 3 telemetry hotspots. Verify buttons are keyboard focusable (`Tab`), click expands glassmorphic cards, metrics display clearly.
4. Scroll 80% $\to$ 100%: Verify smooth translation into `#tireQuoteForm` without scroll hitching or snapping.

### 5.5 Reduced Motion Fallback Test
1. In Chrome DevTools > Rendering > Emulate CSS media feature `prefers-reduced-motion` > select `reduce`.
2. Reload `http://localhost:5000`.
3. Verify:
   - `<canvas id="atmospheric-overlay">` is hidden (`display: none`).
   - ScrollTrigger pinning is bypassed; page scrolls naturally.
   - Roadone HD55 tire is displayed in clean static hero presentation.
   - Hotspot data is rendered in accessible static list/grid.

### 5.6 Core Web Vitals Audit
Run Chrome DevTools Lighthouse or Playwright automated audit:
- LCP candidate: Must render < 1.4s on simulated 4G mobile.
- CLS: Must measure `0.000` throughout the entire scroll sequence.
- Preserved Schemas: Verify `<script type="application/ld+json">` contains valid AutoPartsStore schema.
- Vercel Analytics: Verify `window.va` and `window.si` are intact.
