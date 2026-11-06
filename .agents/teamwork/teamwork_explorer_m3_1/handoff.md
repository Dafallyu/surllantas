# Handoff Report — Feature F13: Catalog Spotlight Cursor Tracking Design

**Author**: `teamwork_explorer_m3_1`  
**Milestone**: Milestone 3 — Catalog Cards with Spotlight Glow (Feature F13)  
**Date**: 2026-11-04T21:25:00Z  
**Target File**: `web/assets/js/main.js`  
**Type**: Hard Handoff (Investigation & Architecture Design Complete)

---

## 1. Observation

### 1.1 DOM Structure (`web/index.html` lines 476–565)
In `web/index.html`, lines 476–565 define the `#categorias` section containing a `.grid-4` container with exactly four `.category-card` elements:
- Line 489: `<div class="category-card reveal">` (Automóvil)
- Line 507: `<div class="category-card reveal">` (Camioneta / SUV)
- Line 525: `<div class="category-card reveal">` (Camión)
- Line 543: `<div class="category-card reveal">` (Moto)

Each card has `.category-card__media` with an image and `.category-card__body` with a title, description, and WhatsApp consultation CTA button.

### 1.2 Test Contracts (`tests/tier1/f13_catalog_spotlight_coords.test.js` & `tests/tier2/f13_spotlight_coords_boundary.test.js`)
- `tests/tier1/f13_catalog_spotlight_coords.test.js`:
  * `F13-T1-1` (lines 13–16): Asserts `dom.getElementsByClassName('category-card').length >= 4`.
  * `F13-T1-2` (lines 18–27): Given `cardRect = { left: 100, top: 200, width: 300, height: 400 }` and `clientX = 150, clientY = 320`, verifies `mouseX = 50`, `mouseY = 120`, and `isInside = true`.
  * `F13-T1-3` (lines 29–34): Given `clientX = 88, clientY = 142`, verifies `cssVarX === '88px'` and `cssVarY === '142px'`.
  * `F13-T1-4` (lines 36–40): Given `clientX < left`, verifies `isInside === false`.
  * `F13-T1-5` (lines 42–51): Given two distinct cards `cardA` (left: 0) and `cardB` (left: 300), verifies that coordinates are independent and Card B does not register hover from Card A's position (zero cross-talk).
- `tests/tier2/f13_spotlight_coords_boundary.test.js`:
  * `F13-T2-1` (lines 12–17): Top-left corner `(200, 150)` on `cardRect = { left: 200, top: 150 }` yields `mouseX = 0, mouseY = 0, isInside = true`.
  * `F13-T2-2` (lines 19–24): Bottom-right corner `(520, 570)` on `cardRect = { left: 200, top: 150, width: 320, height: 420 }` yields `mouseX = 320, mouseY = 420, isInside = true`.
  * `F13-T2-3` (lines 26–30): Negative coordinates `(-50, -50)` yields `isInside = false` with `mouseX < 0 && mouseY < 0`.
  * `F13-T2-4` (lines 32–36): Fractional sub-pixel coordinates `(250.678, 200.345)` relative to `(200, 150)` yield `cssVarX === '51px'` and `cssVarY === '50px'` via `Math.round()`.
  * `F13-T2-5` (lines 38–46): Rapid diagonal swipe calculations remain monotonic without `NaN`.

### 1.3 Canonical Oracle Math (`tests/helpers/physics-oracle.js` lines 78–89)
```javascript
static calculateSpotlightCoords(clientX, clientY, cardBoundingBox) {
  const mouseX = clientX - cardBoundingBox.left;
  const mouseY = clientY - cardBoundingBox.top;
  const isInside = mouseX >= 0 && mouseX <= cardBoundingBox.width && mouseY >= 0 && mouseY <= cardBoundingBox.height;
  return {
    mouseX,
    mouseY,
    isInside,
    cssVarX: `${Math.round(mouseX)}px`,
    cssVarY: `${Math.round(mouseY)}px`
  };
}
```

### 1.4 Integration Dependencies with F14 and F15
- `tests/tier2/f14_spotlight_styles_boundary.test.js`:
  * `F14-T2-3` (lines 26–30): Updating `--mouse-x` and `--mouse-y` via inline styles modifies paint/composite properties only, triggering zero layout recalculations (reflow).
  * `F14-T2-5` (lines 37–40): Spotlight glow fades out smoothly on `mouseleave` with `transition: opacity 0.3s ease`.
- `tests/tier1/f15_catalog_touch_fallback.test.js` & `tests/tier2/f15_touch_fallback_boundary.test.js`:
  * `F15-T1-2`: Dynamic cursor tracking must be disabled on touch-only devices.
  * `F15-T2-1`: Touch devices must ignore synthetic `mousemove`/`pointermove` events to prevent sticky glow artifacts.
  * `F15-T2-3`: Touch action on cards must be passive (`{ passive: true }`) so vertical swipe gestures initiate native page scrolling.

### 1.5 Architecture Pattern in `web/assets/js/main.js`
- Lines 6–18: Initialization functions are invoked inside `document.addEventListener('DOMContentLoaded', ...)`.
- Lines 1257–1261: Classes and controllers are exposed on `window` for diagnostics and test harness extraction:
  ```javascript
  if (typeof window !== 'undefined') {
    window.TelemetryController = TelemetryController;
    window.TireLandingQuoteBridge = TireLandingQuoteBridge;
    window.initCinematicScrollEngine = initCinematicScrollEngine;
  }
  ```

---

## 2. Logic Chain

1. **DOM Selection**: `document.querySelectorAll('.category-card')` correctly matches all 4 vehicle category cards in `#categorias` observed in Observation 1.1. If the NodeList is empty, the function returns early.
2. **Device Capability & Reduced Motion Guards**:
   - As established in Observation 1.4 (`F15-T1-2`, `F15-T2-1`), touch-only devices must not execute dynamic cursor tracking. Querying `window.matchMedia('(hover: none) and (pointer: coarse)').matches` and validating `e.pointerType !== 'touch'` ensures touch devices use the static border fallback without stuck glow artifacts.
   - Checking `window.matchMedia('(prefers-reduced-motion: reduce)').matches` ensures compliance with R4 SLA.
3. **Coordinate Frame Isolation (No Cross-Talk)**:
   - To satisfy `F13-T1-5` (Observation 1.2), state variables (`rafId`, `latestClientX`, `latestClientY`, `isInside`, `resetTimer`) must be instantiated within each card's `forEach` iteration closure.
   - Setting `--mouse-x` and `--mouse-y` directly on `card.style.setProperty(...)` scopes the CSS variables to that card's local style declaration block without propagating to siblings.
4. **Coordinate Math & Precision**:
   - Calling `card.getBoundingClientRect()` computes viewport-relative card bounds.
   - `clientX - rect.left` and `clientY - rect.top` are viewport-invariant, correctly operating whether the user is stationary or scrolling dynamically (matching Tier 3 Test P05).
   - Passing through `Math.round()` cleanly formats sub-pixel coordinates to integer pixel strings (`'88px'`, `'51px'`, `'50px'`) matching Observation 1.2 (`F13-T1-3`, `F13-T2-4`) and canonical oracle math (Observation 1.3).
5. **Non-Blocking Composite Updates via `requestAnimationFrame`**:
   - To satisfy `F14-T2-3` and the 60 FPS SLA, pointer events must not perform write-then-read layout thrashing. Pointer move events store latest cursor positions and request an animation frame if one is not already queued (`rafId`).
   - Listeners are attached with `{ passive: true }` to guarantee uninhibited scroll performance (Observation 1.4 `F15-T2-3`).
   - A defensive check `typeof requestAnimationFrame !== 'undefined'` ensures graceful synchronous fallback in headless/Node test environments.
6. **Smooth `pointerleave` Reset**:
   - To satisfy `F14-T2-5` (Observation 1.4), abruptly yanking `--mouse-x` and `--mouse-y` to `-9999px` or removing them immediately would cause the spotlight to teleport while still visible during the CSS `opacity 0.3s ease` fade-out.
   - Therefore, on `pointerleave`, any pending `rafId` is cancelled, and coordinates are preserved at the cursor exit point. A 350ms timeout then cleans up the inline styles (`removeProperty('--mouse-x')`, `removeProperty('--mouse-y')`) once the CSS fade-out has fully completed.
   - If the cursor re-enters before the timer fires, the cleanup timer is cleared immediately on `pointerenter`.

---

## 3. Implementation Blueprint for Implementer (`teamwork_worker_m3`)

### Proposed Code for `web/assets/js/main.js`

#### A. Place at Section 12 (after line 1254 in `web/assets/js/main.js`):

```javascript
/* --------------------------------------------------------------------------
   12. CATALOG CARDS SPOTLIGHT GLOW (FEATURES F13, F14, F15)
   -------------------------------------------------------------------------- */

/**
 * Pure coordinate calculator matching PhysicsOracle specification.
 */
class CatalogSpotlightController {
  static calculateCoords(clientX, clientY, cardRect) {
    const mouseX = clientX - cardRect.left;
    const mouseY = clientY - cardRect.top;
    const isInside = mouseX >= 0 && mouseX <= cardRect.width && mouseY >= 0 && mouseY <= cardRect.height;
    return {
      mouseX,
      mouseY,
      isInside,
      cssVarX: `${Math.round(mouseX)}px`,
      cssVarY: `${Math.round(mouseY)}px`
    };
  }
}

/**
 * Initializes reactive cursor tracking on catalog cards (.category-card).
 * Updates CSS custom properties --mouse-x and --mouse-y with integer pixel
 * coordinates relative to the card's bounding box.
 * 
 * Performance & Architecture:
 * - Batched via requestAnimationFrame to avoid layout thrashing.
 * - Non-blocking passive pointer listeners.
 * - Independent coordinate frames per card without cross-talk.
 * - Ignores touch inputs to prevent stuck/frozen glow artifacts.
 * - Smooth fade-out reset on pointerleave (retaining exit coordinates until CSS fade completes).
 */
function initCatalogSpotlightGlow() {
  const cards = document.querySelectorAll('.category-card');
  if (!cards.length) return;

  // Reduced motion guard
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    // Touch-only guard: disable dynamic cursor tracking on pure touch devices (F15)
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      return;
    }
  }

  cards.forEach(card => {
    let rafId = null;
    let latestClientX = 0;
    let latestClientY = 0;
    let isInside = false;
    let resetTimer = null;

    const updateCoordinates = () => {
      rafId = null;
      if (!isInside) return;

      const rect = card.getBoundingClientRect();
      const coords = CatalogSpotlightController.calculateCoords(latestClientX, latestClientY, rect);

      card.style.setProperty('--mouse-x', coords.cssVarX);
      card.style.setProperty('--mouse-y', coords.cssVarY);
    };

    const onPointerMove = (e) => {
      // Ignore touch inputs to avoid stuck glow on touchscreens (F15)
      if (e.pointerType === 'touch') return;

      latestClientX = e.clientX;
      latestClientY = e.clientY;

      if (!rafId) {
        if (typeof requestAnimationFrame !== 'undefined') {
          rafId = requestAnimationFrame(updateCoordinates);
        } else {
          updateCoordinates();
        }
      }
    };

    const onPointerEnter = (e) => {
      if (e.pointerType === 'touch') return;
      isInside = true;
      if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
      }
      latestClientX = e.clientX;
      latestClientY = e.clientY;
      updateCoordinates();
    };

    const onPointerLeave = () => {
      isInside = false;
      if (rafId) {
        if (typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(rafId);
        }
        rafId = null;
      }
      // Smooth reset: keep coordinates during CSS opacity transition (0.3s ease),
      // then cleanly remove inline custom properties after fade-out completes.
      resetTimer = setTimeout(() => {
        if (!isInside) {
          card.style.removeProperty('--mouse-x');
          card.style.removeProperty('--mouse-y');
        }
      }, 350);
    };

    card.addEventListener('pointerenter', onPointerEnter, { passive: true });
    card.addEventListener('pointermove', onPointerMove, { passive: true });
    card.addEventListener('pointerleave', onPointerLeave, { passive: true });
  });
}
```

#### B. Update `DOMContentLoaded` in `web/assets/js/main.js` (lines 6–18):
Add `initCatalogSpotlightGlow();` to the initialization pipeline:
```javascript
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initStatCounters();
  initFaqAccordion();
  initCatalogFilters();
  initWhatsAppWidget();
  initTireQuoteWidget();
  initRoadoneSlider();
  initAtmosphericOverlay();
  initCinematicScrollEngine();
  initCatalogSpotlightGlow();
});
```

#### C. Expose Globals on `window` (lines 1257–1261):
```javascript
// Expose globals for testing and diagnostics
if (typeof window !== 'undefined') {
  window.TelemetryController = TelemetryController;
  window.TireLandingQuoteBridge = TireLandingQuoteBridge;
  window.initCinematicScrollEngine = initCinematicScrollEngine;
  window.CatalogSpotlightController = CatalogSpotlightController;
  window.initCatalogSpotlightGlow = initCatalogSpotlightGlow;
}
```

---

## 4. Caveats

1. **CSS Coordinate Binding**: Feature F13 handles JavaScript cursor coordinate tracking and custom property setting (`--mouse-x`, `--mouse-y`). Visual presentation (radial gradient syntax, dark tokens `#0B0F17`, `#0066FF`, `#D32F2F`, and masked border) is covered under Feature F14 (investigated by Explorer 2). Both features integrate seamlessly via `--mouse-x` and `--mouse-y`.
2. **Touch-Screen Hybrid Devices**: Devices that report `pointer: coarse` but also have a fine mouse/trackpad will allow mouse tracking due to `e.pointerType !== 'touch'` filtering. Pure touch viewports without hover are cleanly bypassed via media query.
3. **No Caveats on Math or Test Contracts**: Calculations directly match `PhysicsOracle.calculateSpotlightCoords`.

---

## 5. Conclusion

- The cursor-tracking architecture for Feature F13 is fully designed, verified against the test contracts in `tests/tier1/f13_catalog_spotlight_coords.test.js` and `tests/tier2/f13_spotlight_coords_boundary.test.js`, and ready for implementation.
- It guarantees:
  1. Accurate integer pixel coordinates (`clientX - rect.left`, `clientY - rect.top`) formatted with `px`.
  2. Complete coordinate frame isolation across all 4 `.category-card` elements in `#categorias`.
  3. Non-blocking composite-only 60 FPS style updates batched via `requestAnimationFrame` with `{ passive: true }` pointer listeners.
  4. Smooth `pointerleave` coordinate reset that preserves exit coordinates during the 300ms CSS fade-out before cleanly resetting.
  5. Clean bypass on touch devices and reduced-motion viewports.

---

## 6. Verification Method

### 6.1 Automated Test Execution
Run the full Milestone 3 test suite and master test runner:
```powershell
node tests/runner.js --milestone=M3
node tests/runner.js
```

### 6.2 Unit Test Verification
Verify individual tier 1 and tier 2 test suites:
```powershell
node --test tests/tier1/f13_catalog_spotlight_coords.test.js
node --test tests/tier2/f13_spotlight_coords_boundary.test.js
```

### 6.3 Invalidation Conditions
The design is invalidated if:
1. `--mouse-x` or `--mouse-y` are formatted without `'px'` or with unrounded sub-pixels.
2. Modifying cursor position on one card modifies or leaks coordinates to sibling cards.
3. Rapid swiping produces `NaN` or unhandled exceptions.
4. Pointer tracking intercepts clicks on CTA buttons or blocks native page scrolling on touch screens.
5. Exit from a card causes an immediate visual jump of the spotlight glow before opacity fade-out completes.
