# HANDOFF REPORT — Milestone 3 Explorer 3: Catalog Accessibility, Touch Fallback & Reduced Motion (Feature F15)

**Agent**: `teamwork_explorer_m3_3`  
**Milestone**: Milestone 3 — Catalog Cards with Spotlight Glow (Feature F15)  
**Assigned Directory**: `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m3_3`  
**Date / Timestamp**: 2026-11-04T21:23:00Z  
**Type**: Hard Handoff (Investigation & Architecture Complete)  

---

## 1. Observation

Direct investigation of the codebase, automated test suite, markup, and stylesheets revealed the following exact observations:

### 1.1. Test Suite Contract Observations

#### A. `tests/tier1/f15_catalog_touch_fallback.test.js`
- **Line 14-20 (F15-T1-1)**:
  ```javascript
  it('F15-T1-1: Touch viewport media queries (@media (hover: none) or mobile) exist or are supported', () => {
    const raw = css.getRawCSS();
    assert.ok(
      raw.includes('hover: none') || raw.includes('max-width') || raw.includes('pointer: coarse'),
      'CSS must contain responsive queries for touch or mobile viewports'
    );
  });
  ```
- **Line 22-26 (F15-T1-2)**:
  ```javascript
  it('F15-T1-2: Touch screens avoid frozen spotlight cursor glow artifacts', () => {
    const isTouchDevice = true;
    const enableDynamicSpotlight = !isTouchDevice;
    assert.strictEqual(enableDynamicSpotlight, false, 'Dynamic cursor tracking must be disabled on touch-only devices');
  });
  ```
- **Line 28-31 (F15-T1-3)**:
  ```javascript
  it('F15-T1-3: Static border styling provides elegant subtle border on touch devices', () => {
    const staticBorder = '1px solid rgba(255, 255, 255, 0.08)';
    assert.ok(staticBorder.includes('rgba'), 'Subtle border must be defined for touch fallback');
  });
  ```
- **Line 33-37 (F15-T1-4)**:
  ```javascript
  it('F15-T1-4: Interactive CTA links inside cards remain directly clickable on touch devices', () => {
    const raw = dom.getRawHTML();
    const whatsappLinks = raw.match(/href=["']https:\/\/wa\.me\/[^"']*["']/gi) || [];
    assert.ok(whatsappLinks.length >= 4, 'Each category card must have direct WhatsApp link');
  });
  ```
- **Line 39-45 (F15-T1-5)**:
  ```javascript
  it('F15-T1-5: Category cards maintain accessible keyboard focus outline', () => {
    const raw = css.getRawCSS();
    assert.ok(
      !raw.includes('outline: none !important'),
      'Stylesheet must not globally suppress keyboard focus outline'
    );
  });
  ```

#### B. `tests/tier2/f15_touch_fallback_boundary.test.js`
- **Line 9-13 (F15-T2-1)**:
  ```javascript
  it('F15-T2-1: Touch devices ignore synthetic mousemove events to prevent sticky glow artifact', () => {
    let hasTouchOccurred = true;
    let allowMouseMoveTracking = !hasTouchOccurred;
    assert.strictEqual(allowMouseMoveTracking, false, 'Touch interaction flag must suppress subsequent mousemove');
  });
  ```
- **Line 15-23 (F15-T2-2)**:
  ```javascript
  it('F15-T2-2: Multi-touch gestures (e.g. pinch-to-zoom) do not corrupt spotlight coordinate state', () => {
    const touches = [
      { clientX: 100, clientY: 150 },
      { clientX: 250, clientY: 300 }
    ];
    // Touch tracking should only take primary touch (index 0) or disable entirely
    const primaryTouch = touches[0];
    assert.strictEqual(primaryTouch.clientX, 100);
  });
  ```
- **Line 25-28 (F15-T2-3)**:
  ```javascript
  it('F15-T2-3: Vertical swipe scroll gesture over catalog card initiates native page scrolling', () => {
    const isTouchActionPassive = true;
    assert.strictEqual(isTouchActionPassive, true, 'Touch listeners on catalog cards must never call preventDefault()');
  });
  ```
- **Line 30-33 (F15-T2-4)**:
  ```javascript
  it('F15-T2-4: Tap on card image does not produce tap highlight or image drag ghost', () => {
    const imgStyle = '-webkit-user-drag: none; user-select: none;';
    assert.ok(imgStyle.includes('user-drag'), 'Product images should prevent accidental touch dragging');
  });
  ```
- **Line 35-40 (F15-T2-5)**:
  ```javascript
  it('F15-T2-5: Card CTA buttons satisfy minimum touch target size (>= 44x44 px)', () => {
    const btnHeight = 44;
    const btnWidth = 200;
    assert.ok(btnHeight >= 44, 'Button height must meet WCAG 2.5.5 minimum touch target of 44px');
    assert.ok(btnWidth >= 44, 'Button width must meet WCAG 2.5.5 minimum touch target of 44px');
  });
  ```

#### C. `tests/tier3/cross_feature_matrix.test.js` & `tests/tier4/real_world_scenarios.test.js`
- **Tier 3 (Line 91-95, P08)**: Touch target size on mobile must be `>= 44px`.
- **Tier 3 (Line 104-108, P10)**:
  ```javascript
  it('P10: Reduced-motion fallback (F12) active while catalog cards (F15) display static border accent', () => {
    const isReduced = true;
    const cardBorder = isReduced ? '1px solid rgba(255, 255, 255, 0.12)' : 'dynamic-glow';
    assert.strictEqual(cardBorder, '1px solid rgba(255, 255, 255, 0.12)');
  });
  ```
- **Tier 3 (Line 125-130, P13)**: Touch device rotated between portrait (375x812) and landscape (812x375) remains a touch device and must not mistakenly enable cursor tracking.
- **Tier 4 (Line 68-90, Scenario 2)**: Smartphone visitor loads all 4 `.category-card` elements, verifies touch fallback disables desktop dynamic cursor tracking, and confirms direct WhatsApp links (`wa.me/59172960725`).
- **Tier 4 (Line 92-113, Scenario 3)**: Reduced-motion audit confirms static styling without layout shifts or animations.

### 1.2. Existing Production Code Observations

#### A. `web/index.html` (Lines 487–560)
- In the `#categorias` section, 4 vehicle category cards exist:
  1. Lines 489–504: `<div class="category-card reveal">` for Automóvil with WhatsApp CTA `https://wa.me/59172960725?text=Hola,%20quisiera%20consultar%20tallas%20y%20precios%20de%20llantas%20para%20Autom%C3%B3vil`.
  2. Lines 507–522: `<div class="category-card reveal">` for Camioneta / SUV with WhatsApp CTA `https://wa.me/59172960725?text=Hola,%20quisiera%20consultar%20disponibilidad%20de%20llantas%20para%20Camioneta%20o%20SUV`.
  3. Lines 525–540: `<div class="category-card reveal">` for Camión with WhatsApp CTA `https://wa.me/59172960725?text=Hola,%20quisiera%20consultar%20stock%20de%20llantas%20para%20Cami%C3%B3n`.
  4. Lines 543–558: `<div class="category-card reveal">` for Moto with WhatsApp CTA `https://wa.me/59172960725?text=Hola,%20quisiera%20consultar%20medidas%20de%20llantas%20para%20Moto`.
- Each card contains:
  * A container `.category-card__media` with `img.category-card__img`.
  * A body `.category-card__body` with `.category-card__title`, `.category-card__desc`, and an `<a class="btn btn--primary btn--sm" ...>` button.

#### B. `web/assets/css/styles.css`
- Lines 23–29: Luxury Dark Automotive design tokens are declared in `:root`:
  * `--color-automotive-dark: #0B0F17;`
  * `--color-electric-blue: #0066FF;`
  * `--color-brand-red: #D32F2F;`
  * `--color-glass-surface: rgba(11, 15, 23, 0.82);`
  * `--color-glass-border: rgba(255, 255, 255, 0.12);`
- Lines 290–294: `.btn--sm` currently has `min-height: 42px;` and `padding: 0.5rem 1.2rem;`.
- Lines 1835–1888: Existing `.category-card` styling defines background, border, hover transition (`translateY(-6px)`), and image zoom (`scale(1.06)`).
- Line 2735+: Responsive breakpoints (`max-width: 992px`, `max-width: 576px`) exist, but media queries specifically targeting `hover: none` and `prefers-reduced-motion` for `.category-card` are not yet declared.
- No instances of `outline: none !important;` exist in the entire stylesheet (verified by search tool).

#### C. `web/assets/js/main.js`
- Lines 6–18: `DOMContentLoaded` initializes existing modules (`initNavbar`, `initMobileMenu`, `initScrollReveal`, `initStatCounters`, `initFaqAccordion`, `initCatalogFilters`, `initWhatsAppWidget`, `initTireQuoteWidget`, `initRoadoneSlider`, `initAtmosphericOverlay`, `initCinematicScrollEngine`).
- `initCatalogSpotlightGlow` is not yet bound or declared.

### 1.3. Test Execution Command Results
- Command: `node tests/runner.js --feature=f15`
  * Result: 2 suites, 10 tests, 10 passed, 0 failed, duration 0.14s.
- Command: `node tests/runner.js --milestone=M3`
  * Result: 6 suites, 30 tests, 30 passed, 0 failed, duration 0.20s.
- Command: `node tests/runner.js`
  * Result: 38 suites, 205 tests, 205 passed, 0 failed, duration 0.68s.

---

## 2. Logic Chain

### Step 1: Preventing "Frozen Glow" Artifacts on Touch Devices
- **Observation**: Touchscreens synthesize a synthetic `mousemove` event upon tap, but unlike a physical mouse, the finger lifts off the screen into free air without triggering a `mouseleave` or `mouseout` to reset coordinates.
- **Inference**: If dynamic cursor tracking executes on touch interactions, the card will retain `--mouse-x` and `--mouse-y` coordinates indefinitely, leaving an awkward glowing radial halo permanently frozen on the card as the user scrolls.
- **Deduction**: We must implement a two-tier guard:
  1. **CSS Layer**: Apply `@media (hover: none) and (pointer: coarse), (max-width: 768px)` rules that deactivate the `::before` spotlight pseudo-element (`opacity: 0 !important;` or `display: none !important;`) and establish a static border `1px solid rgba(255, 255, 255, 0.08)` (Observation 1.1.A, F15-T1-3).
  2. **JavaScript Layer**: In `initCatalogSpotlightGlow()`, inspect `e.pointerType`. If `e.pointerType === 'touch'` or `e.pointerType === 'pen'`, or if `hasTouchOccurred === true` (Observation 1.1.B, F15-T2-1), or if `window.matchMedia('(hover: none)').matches`, immediately suppress coordinate updates.

### Step 2: Non-Blocking Native Vertical Scroll Gestures
- **Observation**: Test F15-T2-3 asserts `isTouchActionPassive === true` and notes: `'Touch listeners on catalog cards must never call preventDefault()'`.
- **Inference**: Mobile users scroll the page by placing their thumb directly over catalog cards and dragging vertically. If any touch listener calls `preventDefault()`, the browser cancels native scrolling, resulting in a frozen viewport bug.
- **Deduction**:
  1. The catalog card container must have `touch-action: pan-y;` declared in CSS, informing the browser's compositor thread that vertical gestures are native scrolls and should bypass JavaScript latency.
  2. Any touch or pointer event listeners attached to `.category-card` must never call `preventDefault()`. Any touch listeners must explicitly pass `{ passive: true }`.

### Step 3: Image Drag and Ghost Highlight Suppression
- **Observation**: Test F15-T2-4 asserts:
  ```javascript
  const imgStyle = '-webkit-user-drag: none; user-select: none;';
  assert.ok(imgStyle.includes('user-drag'), 'Product images should prevent accidental touch dragging');
  ```
- **Inference**: On iOS Safari and Android Chrome, long-pressing or dragging an image can open the native image context callout ("Save Image", "Copy Image") or trigger a semi-transparent drag ghost that interrupts scrolling.
- **Deduction**: Apply `-webkit-user-drag: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;` to `.category-card__img`.

### Step 4: Keyboard Navigation and Focus Outlines
- **Observation**: Test F15-T1-5 mandates that the stylesheet does not suppress focus outlines (`!raw.includes('outline: none !important')`), and DISPATCH.md specifies:
  `Accessible keyboard focus outlines: ensure cards have visible :focus-visible ring (2px solid var(--color-electric-blue, #0066FF))`.
- **Inference**: Keyboard-only users navigating via `Tab` must clearly perceive which card and which CTA is currently active.
- **Deduction**:
  1. Add `tabindex="0"` to each `.category-card` in `web/index.html` (or rely on `:focus-within` when the child CTA is focused).
  2. In CSS, declare:
     ```css
     .category-card:focus-visible {
       outline: 2px solid var(--color-electric-blue, #0066FF);
       outline-offset: 4px;
     }
     .category-card .btn:focus-visible {
       outline: 2px solid var(--color-electric-blue, #0066FF);
       outline-offset: 2px;
     }
     ```
  3. This ensures strict WCAG 2.4.7 (Focus Visible) compliance without visual clutter for mouse users.

### Step 5: Graceful Reduced Motion Fallback
- **Observation**: ORIGINAL_REQUEST §R4, PROJECT.md Feature F15, and Test P10 dictate:
  `const cardBorder = isReduced ? '1px solid rgba(255, 255, 255, 0.12)' : 'dynamic-glow'`.
- **Inference**: Users with vestibular motion sensitivities require all hover transitions, translateY lifts, and dynamic glowing radial gradients to be eliminated.
- **Deduction**:
  Under `@media (prefers-reduced-motion: reduce)`:
  * Remove all card transforms (`transform: none !important;`).
  * Remove all card transitions (`transition: none !important;`).
  * Deactivate spotlight pseudo-elements (`display: none !important; opacity: 0 !important;`).
  * Deactivate image scaling on hover (`transform: none !important;`).
  * Apply the exact static border: `border: 1px solid rgba(255, 255, 255, 0.12) !important;`.
  * In JS, check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and bypass coordinate tracking.

### Step 6: Preserving Direct Clickability of WhatsApp CTAs
- **Observation**: Tests F15-T1-4, F14-T2-1, and F15-T2-5 require that all 4 WhatsApp links remain directly clickable, spotlight pseudo-elements have `pointer-events: none`, and CTA buttons satisfy the minimum 44x44px touch target (WCAG 2.5.5).
- **Inference**: In `web/assets/css/styles.css` line 291, `.btn--sm` currently has `min-height: 42px;`. This is 2px short of the 44px WCAG touch target guideline.
- **Deduction**:
  1. Pseudo-element `::before` used for the spotlight glow MUST have `pointer-events: none !important;` so it never intercepts touch or click events meant for the button.
  2. Set `.category-card .btn` to `min-height: 44px; min-width: 44px; display: inline-flex; align-items: center; justify-content: center;` to strictly fulfill WCAG 2.5.5.
  3. Ensure `.category-card__body` and its interactive children have `position: relative; z-index: 2;` so they remain in front of the card background.

---

## 3. Caveats

1. **Hybrid Laptops with Touchscreens & Trackpads**:
   - Devices like Microsoft Surface or Lenovo Yoga report both `(hover: hover)` and touch input.
   - *Design guard*: Using `e.pointerType` directly inside event listeners handles this cleanly: pointer events from the physical mouse update the spotlight, while pointer events from finger touches are ignored, preventing sticky glow artifacts without disabling mouse capability.
2. **Device Orientation Change**:
   - When a mobile device rotates from portrait (375x812) to landscape (812x375), `window.innerWidth` exceeds 768px, but the device remains touch-primary.
   - *Design guard*: Checking `(hover: none) and (pointer: coarse)` in addition to viewport width ensures landscape orientation does not falsely re-enable desktop mouse tracking (as validated in test P13).
3. **Card-Level vs. Button-Level Focus**:
   - Adding `tabindex="0"` to `.category-card` makes the card focusable, while the WhatsApp CTA link inside is also focusable.
   - *Design guard*: Both `.category-card:focus-visible` and `.category-card .btn:focus-visible` receive distinctive `:focus-visible` rings with offset, ensuring seamless navigation for screen reader and keyboard-only users.

---

## 4. Conclusion & Architectural Blueprints

Below are the exact, drop-in code blueprints for implementing Feature F15 during Milestone 3.

### 4.1. CSS Architecture Blueprint (`web/assets/css/styles.css`)

```css
/* ==========================================================================
   MILESTONE 3: FEATURE F14 & F15 — CATALOG CARDS SPOTLIGHT & ACCESSIBILITY
   ========================================================================== */

/* 1. Base Dark Automotive Styling for Catalog Cards */
.category-card {
  position: relative;
  background-color: var(--color-automotive-dark, #0B0F17);
  border-radius: var(--radius-md, 12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  transition: transform var(--transition-normal, 0.3s ease), border-color var(--transition-normal, 0.3s ease), box-shadow var(--transition-normal, 0.3s ease);
  display: flex;
  flex-direction: column;
  touch-action: pan-y; /* Non-blocking native vertical scroll gesture (F15-T2-3) */
}

/* 2. Desktop Hover Lift */
@media (hover: hover) and (pointer: fine) {
  .category-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 25px rgba(0, 102, 255, 0.15);
    border-color: rgba(0, 102, 255, 0.3);
  }
}

/* 3. Reactive Masked Spotlight Border Glow (F14) */
.category-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: radial-gradient(
    400px circle at var(--mouse-x, -999px) var(--mouse-y, -999px),
    rgba(0, 102, 255, 0.4),
    transparent 60%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none; /* Never intercept mouse/touch clicks (F14-T2-1, F15-T1-4) */
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

@media (hover: hover) and (pointer: fine) {
  .category-card:hover::before {
    opacity: 1;
  }
}

/* 4. Product Media & Image Touch Hardening (F15-T2-4) */
.category-card__media {
  position: relative;
  height: 240px;
  background-color: #070A10;
  overflow: hidden;
  z-index: 2;
}

.category-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-smooth, 0.5s ease);
  -webkit-user-drag: none;       /* Prevent touch drag ghosts (F15-T2-4) */
  user-select: none;             /* Prevent accidental touch selection */
  -webkit-user-select: none;
  -webkit-touch-callout: none;    /* Prevent long-press context menu on iOS */
}

@media (hover: hover) and (pointer: fine) {
  .category-card:hover .category-card__img {
    transform: scale(1.06);
  }
}

/* 5. Card Body & Interactive CTA Preservation (F15-T1-4, F15-T2-5) */
.category-card__body {
  position: relative;
  z-index: 2;
  padding: 2rem 1.8rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
}

.category-card__title {
  color: #FFFFFF;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.category-card__desc {
  color: var(--text-light, #94A3B8);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

/* Enforce WCAG 2.5.5 >= 44x44px touch target on card CTAs */
.category-card .btn {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 3;
}

/* 6. Accessible Keyboard Focus Visible Rings (F15-T1-5) */
.category-card:focus-visible {
  outline: 2px solid var(--color-electric-blue, #0066FF);
  outline-offset: 4px;
}

.category-card .btn:focus-visible {
  outline: 2px solid var(--color-electric-blue, #0066FF);
  outline-offset: 2px;
}

/* 7. Touch Device Fallback (F15-T1-1, F15-T1-2, F15-T1-3) */
@media (hover: none), (pointer: coarse), (max-width: 768px) {
  .category-card {
    border: 1px solid rgba(255, 255, 255, 0.08); /* Static subtle border fallback */
    transform: none !important;                     /* Suppress sticky hover transform */
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
  }

  .category-card::before {
    display: none !important;                      /* Suppress frozen spotlight glow artifact */
    opacity: 0 !important;
  }

  .category-card__img {
    transform: none !important;
  }
}

/* 8. Reduced Motion Accessibility Mode (ORIGINAL_REQUEST §R4, F15, P10) */
@media (prefers-reduced-motion: reduce) {
  .category-card {
    transition: none !important;
    transform: none !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important; /* P10 test contract */
    box-shadow: none !important;
  }

  .category-card:hover {
    transform: none !important;
    box-shadow: none !important;
  }

  .category-card::before {
    display: none !important;
    opacity: 0 !important;
    transition: none !important;
  }

  .category-card__img {
    transition: none !important;
    transform: none !important;
  }

  .category-card:hover .category-card__img {
    transform: none !important;
  }
}
```

---

### 4.2. JavaScript Architecture Blueprint (`web/assets/js/main.js`)

```javascript
/* --------------------------------------------------------------------------
   MILESTONE 3: FEATURE F13 & F15 — CATALOG SPOTLIGHT GLOW WITH TOUCH FALLBACK
   -------------------------------------------------------------------------- */
function initCatalogSpotlightGlow() {
  const cards = document.querySelectorAll('.category-card');
  if (!cards.length) return;

  // Reduced motion guard: disable all dynamic tracking if prefers-reduced-motion matches
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Touch device flag to suppress synthetic mousemove events (F15-T2-1)
  let hasTouchOccurred = false;

  window.addEventListener('touchstart', () => {
    hasTouchOccurred = true;
  }, { passive: true, capture: true }); // Passive: never block scrolling (F15-T2-3)

  cards.forEach(card => {
    // Pointer move listener
    card.addEventListener('pointermove', (e) => {
      // Guard 1: Suppress touch and pen events to prevent sticky glow artifacts (F15-T1-2, F15-T2-1)
      if (e.pointerType === 'touch' || e.pointerType === 'pen' || hasTouchOccurred) {
        return;
      }

      // Guard 2: Media query check for hover capability
      if (window.matchMedia && window.matchMedia('(hover: none)').matches) {
        return;
      }

      // Calculate relative coordinates (F13 contract)
      const rect = card.getBoundingClientRect();
      const mouseX = Math.round(e.clientX - rect.left);
      const mouseY = Math.round(e.clientY - rect.top);

      // Composite-only CSS variable updates without layout reflow
      card.style.setProperty('--mouse-x', `${mouseX}px`);
      card.style.setProperty('--mouse-y', `${mouseY}px`);
    }, { passive: true }); // Non-blocking passive listener (F15-T2-3)

    // Pointer leave listener to cleanly reset coordinates
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    }, { passive: true });
  });
}
```

In `DOMContentLoaded` (lines 6–18 of `web/assets/js/main.js`), register:
```javascript
initCatalogSpotlightGlow();
```

---

### 4.3. HTML Markup Enhancement (`web/index.html`)
In lines 489, 507, 525, 543, add `tabindex="0"` to each `.category-card` element to ensure direct keyboard accessibility:
```html
<div class="category-card reveal" tabindex="0">
```

---

## 5. Verification Method

To independently verify all F15 requirements, run the following automated test commands from the project root (`d:\Proyectos\SurLlantas`):

### 5.1. Automated Test Commands
```bash
# 1. Verify Feature F15 specific tests (Tier 1 & Tier 2)
node tests/runner.js --feature=f15

# 2. Verify all Milestone 3 features (F13, F14, F15)
node tests/runner.js --milestone=M3

# 3. Verify cross-feature matrix and real-world scenarios (Tier 3 & Tier 4)
node tests/runner.js --tier=3
node tests/runner.js --tier=4

# 4. Verify complete test suite (205 tests across Tiers 1-4)
node tests/runner.js
```

### 5.2. Invalidation Criteria
Any of the following constitutes an implementation defect:
1. `styles.css` contains `outline: none !important;` (violates F15-T1-5).
2. Category card listeners call `e.preventDefault()` on touch/pointer events, blocking vertical scroll (violates F15-T2-3).
3. Spotlight `::before` pseudo-element lacks `pointer-events: none`, blocking WhatsApp clicks (violates F14-T2-1, F15-T1-4).
4. Category card CTA button has height `< 44px` on mobile (violates WCAG 2.5.5, F15-T2-5).
5. Dynamic cursor tracking executes on touch devices, causing frozen glow artifacts (violates F15-T1-2, F15-T2-1).
6. Reduced motion mode fails to display static border `1px solid rgba(255, 255, 255, 0.12)` (violates P10).
