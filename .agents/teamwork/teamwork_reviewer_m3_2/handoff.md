# Review & Adversarial Challenge Report — Milestone 3: Catalog Cards with Spotlight Glow (Features F13, F14, F15)

**Agent**: `teamwork_reviewer_m3_2`  
**Roles**: reviewer, critic  
**Assigned Directory**: `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_reviewer_m3_2`  
**Target Milestone**: Milestone 3 — Features F13 (Cursor Tracking), F14 (Spotlight Styling), F15 (Touch Fallback & Accessibility)  
**Date**: 2026-11-04T21:43:00Z  
**Verdict**: **APPROVE**  

---

## 1. Observation

### 1.1 Direct Source Code Inspections

1. **`web/assets/js/main.js`**:
   - **`CatalogSpotlightController` (lines 1264–1281)**:
     ```javascript
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

       static calculateSpotlightCoords(clientX, clientY, cardRect) {
         return this.calculateCoords(clientX, clientY, cardRect);
       }
     }
     ```
     Observation: Pure mathematical calculation subtracting bounding box coordinates, determining `isInside`, and rounding integers with `px` suffix. No hardcoded or dummy returns.
   - **`initCatalogSpotlightGlow` (lines 1295–1397)**:
     * Non-blocking passive event listeners: `pointerenter`, `pointermove`, `pointerleave` attached with `{ passive: true }`.
     * rAF batching: `onPointerMove` records `latestClientX` / `latestClientY` and schedules single `requestAnimationFrame(updateCoordinates)`, preventing layout thrashing.
     * Per-card state isolation: `rafId`, `latestClientX`, `latestClientY`, `isInside`, and `resetTimer` scoped within `cards.forEach(card => ...)`, guaranteeing zero cross-talk across cards.
     * Touch suppression: Ignores `e.pointerType === 'touch'`, `e.pointerType === 'pen'`, and captures global `touchstart` via `hasTouchOccurred = true`.
     * Smooth 350ms exit reset: On `pointerleave`, preserves coordinates while CSS `opacity 0.3s ease` fades out the spotlight, then cleanly removes `--mouse-x` and `--mouse-y` via `setTimeout(..., 350)`. Re-entry via `pointerenter` clears `resetTimer` immediately without flicker.
     * Reduced-motion & coarse-pointer guards: Aborts initialization if `window.matchMedia('(prefers-reduced-motion: reduce)').matches` or `window.matchMedia('(hover: none) and (pointer: coarse)').matches`.
   - **Module Registration (lines 13–17 & 1400–1406)**:
     * `initCatalogSpotlightGlow()` registered in `DOMContentLoaded`.
     * `CatalogSpotlightController` and `initCatalogSpotlightGlow` exported to `window`.

2. **`web/assets/css/styles.css`**:
   - **Luxury Dark Tokens (lines 23–26 & 1835–1848)**:
     ```css
     .category-card {
       position: relative;
       background-color: var(--color-automotive-dark, #0B0F17);
       color: var(--text-white, #FFFFFF);
       border-radius: var(--radius-md, 12px);
       border: 1px solid rgba(255, 255, 255, 0.08);
       overflow: hidden;
       box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
       transition: transform var(--transition-normal, 0.3s ease), box-shadow var(--transition-normal, 0.3s ease);
       display: flex;
       flex-direction: column;
       touch-action: pan-y;
       --spotlight-color: rgba(0, 102, 255, 0.4);
     }
     ```
   - **Featured Brand Red Accent Variant (lines 1858–1870)**:
     ```css
     .category-card--featured,
     .category-card[data-featured="true"],
     .category-card.featured {
       --spotlight-color: rgba(211, 47, 47, 0.45);
     }
     ```
   - **Masked Perimeter Border Glow (lines 1872–1898)**:
     ```css
     .category-card::before {
       content: '';
       position: absolute;
       inset: 0;
       pointer-events: none;
       border-radius: inherit;
       padding: 1px;
       background: radial-gradient(
         400px circle at var(--mouse-x, -999px) var(--mouse-y, -999px),
         var(--spotlight-color, rgba(0, 102, 255, 0.4)),
         transparent 60%
       );
       -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
       -webkit-mask-composite: xor;
       mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
       mask-composite: exclude;
       opacity: 0;
       transition: opacity 0.3s ease;
       z-index: 2;
     }
     @media (hover: hover) and (pointer: fine) {
       .category-card:hover::before { opacity: 1; }
     }
     ```
   - **Image Touch Hardening (lines 1909–1918)**:
     `-webkit-user-drag: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;`
   - **WCAG 2.5.5 Touch Target Compliance (lines 1954–1962)**:
     `.category-card .btn { min-height: 44px; min-width: 44px; display: inline-flex; align-items: center; justify-content: center; position: relative; z-index: 3; }`
   - **WCAG 2.4.7 Visible Focus Outlines (lines 1965–1973)**:
     `.category-card:focus-visible { outline: 2px solid var(--color-electric-blue, #0066FF); outline-offset: 4px; }`  
     `.category-card .btn:focus-visible { outline: 2px solid var(--color-electric-blue, #0066FF); outline-offset: 2px; }`
   - **Touch Fallback (lines 1976–1991)**:
     `@media (hover: none), (pointer: coarse), (max-width: 768px)` enforces static subtle border `1px solid rgba(255, 255, 255, 0.08)`, `transform: none !important;`, and `display: none !important` on `::before`.
   - **Reduced Motion Fallback (lines 1994–2020)**:
     `@media (prefers-reduced-motion: reduce)` enforces static border `1px solid rgba(255, 255, 255, 0.12) !important`, `box-shadow: none !important;`, and `transition: none !important;`.

3. **`web/index.html`**:
   - Lines 489, 507, 525, 543: All 4 category cards (`.category-card.reveal`) possess `tabindex="0"`.
   - Line 525: Camión card includes `category-card--featured` and `data-featured="true"`.
   - Head section invariance: Lines 1–192 are 100% byte-identical to original code (zero diff hunks, SEO tags, JSON-LD, and Vercel Analytics intact).

### 1.2 Test Execution Telemetry

1. **Targeted Milestone 3 Runner (`node tests/runner.js --milestone=M3`)**:
   ```
   ================================================================
          SURLYTIC E2E AUTOMATED TEST RUNNER — SURLANTAS
   ================================================================
   Discovered 6 test suite file(s).
   Filter Scope: Tier=[all], Milestone=[M3], Feature=[ALL]
   ----------------------------------------------------------------
   ================================================================
                         TEST EXECUTION SUMMARY
   ================================================================
   Total Files Executed : 6
   Total Test Cases     : 30
   Passed Test Cases    : 30
   Failed Test Cases    : 0
   Execution Duration   : 0.19s
   Exit Status Code     : 0
   ----------------------------------------------------------------
   RESULT: [SUCCESS] All targeted test cases PASSED cleanly.
   ================================================================
   ```

2. **Full Regression Suite (`node tests/runner.js`)**:
   ```
   ================================================================
          SURLYTIC E2E AUTOMATED TEST RUNNER — SURLANTAS
   ================================================================
   Discovered 38 test suite file(s).
   Filter Scope: Tier=[all], Milestone=[ALL], Feature=[ALL]
   ----------------------------------------------------------------
   ================================================================
                         TEST EXECUTION SUMMARY
   ================================================================
   Total Files Executed : 38
   Total Test Cases     : 205
   Passed Test Cases    : 205
   Failed Test Cases    : 0
   Execution Duration   : 0.72s
   Exit Status Code     : 0
   ----------------------------------------------------------------
   RESULT: [SUCCESS] All targeted test cases PASSED cleanly.
   ================================================================
   ```

3. **Dedicated Milestone 3 Adversarial Stress Harness (`node --expose-gc tests/test_m3_adversarial_perf.js`)**:
   ```
   ===============================================================
      MILESTONE 3 ADVERSARIAL STRESS & INTEGRITY HARNESS
   ===============================================================
   --- SUITE 1: Coordinate Invariant & Oracle Match ---
   [PASS] 396 discrete coordinate calculations matched PhysicsOracle exactly
   [PASS] Corner cases (negative coordinates and sub-pixel rounding) verified

   --- SUITE 2: rAF Batching Under High Event Pressure ---
   [PASS] rAF batching collapsed 2,000 pointermove events into 1 single update

   --- SUITE 3: V8 Heap Stability (10,000 enter/move/leave cycles) ---
   Heap delta after 10,000 cycles: -266.88 KB
   [PASS] Zero memory leak verified under 10,000 event cycles

   --- SUITE 4: Touch Suppression & Synthetic Event Hardening ---
   [PASS] Touch suppression blocks touch, pen, and post-touch synthetic mouse events

   --- SUITE 5: Exit Reset Timing & Re-entry Cancellation ---
   [PASS] Exit reset smoothly waits 350ms and cancels cleanly upon re-entry

   --- SUITE 6: CSS Conformance & Token Verification ---
   [PASS] All CSS tokens, pseudo-element masking, and WCAG styles verified

   --- SUITE 7: HTML Markup & SEO Invariance Audit ---
   [PASS] HTML markup, tabindex, and complete head section verified

   ===============================================================
      ALL MILESTONE 3 ADVERSARIAL STRESS TESTS PASSED CLEANLY
      VERDICT: APPROVE
   ===============================================================
   ```

4. **Prior Milestone Stress Harnesses**:
   - `node --expose-gc tests/m1_stress_harness.js` -> `VERDICT: APPROVE`
   - `node --expose-gc tests/test_m2_adversarial_perf.js` -> `VERDICT: APPROVE`

---

## 2. Logic Chain

1. **Integrity & Authenticity Audit (Observation 1.1)**:
   - Evaluated `web/assets/js/main.js` and `web/assets/css/styles.css` for integrity violations.
   - Finding: No hardcoded test responses or facade stubs exist. `CatalogSpotlightController.calculateCoords` calculates coordinates from dynamic mouse and bounding rect properties (`clientX - cardRect.left`). `initCatalogSpotlightGlow` binds authentic DOM event listeners, computes real geometry, and updates styles via rAF.
   - Conclusion: Zero integrity violations. Implementation is genuine and authentic.

2. **rAF Batching & Zero Layout Thrashing (Observations 1.1 & 1.2 Suite 2)**:
   - High-frequency mouse movements can fire 100+ events per second. Updating DOM custom properties synchronously on each event would cause unnecessary style re-calculations.
   - The implementation records `latestClientX` / `latestClientY` and queues a single `requestAnimationFrame(updateCoordinates)`.
   - Empirically verified in Suite 2: 2,000 rapid pointermove events generated exactly 1 queued rAF callback and 1 style write. Updating `--mouse-x` and `--mouse-y` custom properties impacts only the composite/paint phase without layout reflow, maintaining the 60 FPS SLA.

3. **Touch Suppression & Gesture Isolation (Observations 1.1 & 1.2 Suite 4)**:
   - Tapping on a touchscreen often triggers synthetic mousemove events in mobile browsers, which would leave a frozen, disembodied glow halo over the tapped card.
   - Hardening via multiple defensive layers (`hasTouchOccurred` flag from `touchstart`, explicit check for `e.pointerType === 'touch' || e.pointerType === 'pen'`, and `@media (hover: none) and (pointer: coarse)`) completely prevents glow activation on touch devices.
   - Specifying `touch-action: pan-y;` on `.category-card` guarantees native vertical thumb swiping without intercepting page scroll.

4. **Perimeter Border Masking & Pointer Events (Observation 1.1)**:
   - Traditional card gradients wash out product imagery and body text with surface glare.
   - Dual linear-gradient masking (`content-box` and `border-box` with `mask-composite: exclude` / `-webkit-mask-composite: xor`) isolates the radial spotlight strictly to the 1px perimeter border.
   - Setting `pointer-events: none;` on `.category-card::before` guarantees that user clicks seamlessly pass through to child interactive CTA buttons (`wa.me` links), maintaining direct conversion flow.

5. **Smooth Transition Timing & Re-entry Safety (Observations 1.1 & 1.2 Suite 5)**:
   - Immediate removal of `--mouse-x` and `--mouse-y` on `pointerleave` would cause the spotlight gradient to snap to `(0, 0)` or `(-999px, -999px)` while the CSS opacity transition is fading out.
   - Scoping a 350ms exit timeout allows the 300ms CSS opacity fade-out (`transition: opacity 0.3s ease;`) to complete gracefully in place before removing inline properties.
   - Rapid re-entry (`pointerenter`) cancels the timeout via `clearTimeout`, restoring immediate tracking without visual flicker.

6. **Accessibility & Core Invariance (Observations 1.1 & 1.2 Suite 6 & 7)**:
   - Keyboard navigability: Adding `tabindex="0"` on cards and styling `:focus-visible` with `outline: 2px solid #0066FF; outline-offset: 4px;` ensures full compliance with WCAG 2.4.7 without visual outline intrusion during mouse clicks.
   - Touch Target: Styling `.category-card .btn` with `min-height: 44px; min-width: 44px;` satisfies WCAG 2.5.5 touch target size requirements.
   - Reduced Motion: Applying `@media (prefers-reduced-motion: reduce)` removes all transforms and transitions, rendering a static border `1px solid rgba(255, 255, 255, 0.12) !important`, fulfilling requirement P10.
   - Zero Regressions: Lines 1–192 of `web/index.html` were verified byte-identical, preserving all SEO meta tags, OpenGraph tags, JSON-LD schemas, and Vercel Analytics scripts.

---

## 3. Caveats

- **Hybrid Touch/Mouse Devices**: On laptops featuring both touchscreens and physical mice (e.g., Microsoft Surface), touching the screen activates `hasTouchOccurred = true`, which deliberately suppresses subsequent mouse hover glow to protect against touch artifacts until page refresh. This is compliant with specification requirement `F15-T2-1` and is an intentional trade-off prioritizing touch cleanliness over hybrid switching.
- **No other caveats**: All 30 tests in Milestone 3, all 205 tests across the full suite (Tiers 1–4), and the dedicated adversarial stress harness passed cleanly with 0 failures and zero retained memory leaks.

---

## 4. Conclusion

Milestone 3 (Catalog Cards with Spotlight Glow — Features F13, F14, F15) represents high-quality, genuine, and robust engineering. The implementation adheres strictly to the luxury dark automotive design system, GPU-accelerated rAF performance constraints, WCAG 2.4.7 / 2.5.5 accessibility standards, and touch suppression specifications.

**Final Verdict: APPROVE**

---

## 5. Verification Method

To independently reproduce the complete verification:

1. **Targeted Milestone 3 Verification**:
   ```powershell
   node tests/runner.js --milestone=M3
   ```
   *Expected*: 6 test files, 30 test cases, 30 passed, 0 failed.

2. **Full Regression Verification**:
   ```powershell
   node tests/runner.js
   ```
   *Expected*: 38 test files, 205 test cases, 205 passed, 0 failed.

3. **Feature-Level Scoping**:
   ```powershell
   node tests/runner.js --feature=F13
   node tests/runner.js --feature=F14
   node tests/runner.js --feature=F15
   ```
   *Expected*: 10/10 passed for each feature.

4. **Empirical Adversarial Stress Suite**:
   ```powershell
   node --expose-gc tests/test_m3_adversarial_perf.js
   ```
   *Expected*: All 7 suites passed cleanly; `VERDICT: APPROVE`.

5. **Head Invariance Verification**:
   ```powershell
   git diff -U0 web/index.html
   ```
   *Expected*: No diff hunks between lines 1 and 192.
