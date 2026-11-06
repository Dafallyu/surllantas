# Milestone 2 Adversarial Challenge Report — Challenger 2

**Author**: `teamwork_challenger_m2_2` (Empirical Challenger: critic, specialist)  
**Milestone**: Milestone 2 Gate Adversarial Verification (Features F5 through F12)  
**Working Directory**: `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_challenger_m2_2`  
**Date**: 2026-11-04T20:59:00Z  
**Verdict**: **REQUEST_CHANGES** (1 Critical Blocking Defect, 1 High Resilience Defect)

---

## 1. Observation

### 1.1 In-Browser Failure: Corrupted Subresource Integrity (SRI) Hash on GSAP CDN
During a live headless Chromium session via Playwright navigating to `http://localhost:5500/index.html`:
- Verbatim Browser Console Output:
  ```text
  [error] Failed to find a valid digest in the 'integrity' attribute for resource 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js' with computed SHA-512 integrity '7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUBWm67zeAfFC+HrdoE2GanKeocly/VxeLvIqwvCdk7qScg=='. The resource has been blocked.
  [warning] [SurLlantas] GSAP 3.12.5 or ScrollTrigger not loaded. Using accessible static layout.
  ```
- File & Line: `web/index.html`, line 1043:
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" integrity="sha512-7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUB46724jg/+AkDpMWb48ZnoG9UidcdSOiqUIFypItVmSBA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  ```
- Digest Comparison:
  - Declared: `sha512-7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUB46724jg/+AkDpMWb48ZnoG9UidcdSOiqUIFypItVmSBA==`
  - Computed: `sha512-7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUBWm67zeAfFC+HrdoE2GanKeocly/VxeLvIqwvCdk7qScg==`
- Direct Impact: Because `gsap.min.js` is blocked by the browser, `window.gsap` evaluates to `undefined`. `initCinematicScrollEngine()` in `web/assets/js/main.js` line 1052 immediately bails out (`return null;`), disabling the entire Milestone 2 scroll choreography in all modern production browsers enforcing SRI.

### 1.2 ScrollTrigger Re-entrancy & Missing Reduced-Motion Cleanup
Empirical inspection of `web/assets/js/main.js` (lines 1050–1221) and live browser execution:
- Verbatim code in `initCinematicScrollEngine()`:
  ```javascript
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.matches) {
    console.info('[SurLlantas] prefers-reduced-motion is active. Skipping scroll timeline.');
    return null;
  }
  ```
- Defect Observations:
  1. No event listener is registered on `motionQuery` (e.g. `motionQuery.addEventListener('change', ...)`). If the user or OS toggles reduced motion after initial load, the engine never responds.
  2. If `initCinematicScrollEngine()` is called multiple times (e.g., when motion preference changes from reduce back to no-preference), it fails to kill previous instances.
  3. Live browser verification test result:
     ```json
     {
       "beforeStCount": 1,
       "afterStCount": 2,
       "allStIds": ["cinematic-stage", "cinematic-stage"]
     }
     ```
     A duplicate `ScrollTrigger` instance with identical `id: "cinematic-stage"` is attached to the same DOM stage, causing duplicate pinning and memory leaks.

### 1.3 Empirical 5,000 Rapid Scroll Events Performance & Memory Stress
Direct execution of `node --expose-gc .agents/teamwork/teamwork_challenger_m2_2/test_m2_adversarial_perf.js`:
- Telemetry Output:
  ```text
  Executed 5,000 scroll events in 3.00 ms.
  Mean frame time : 0.0005 ms
  P50 frame time  : 0.0003 ms
  P95 frame time  : 0.0010 ms
  P99 frame time  : 0.0016 ms
  Max frame time  : 0.0588 ms
  Heap Delta (post-GC): 92.39 KB
  [PASS] 5,000 Scroll Events Performance & Memory
  ```
- In-browser live execution: 5,000 continuous scrubs evaluated in 32.90ms, mean time 0.0064ms (vastly under 16.6ms 60 FPS budget), heap delta 0.00 KB.

### 1.4 High-Frequency Viewport Resize (500 Cycles) & Layout Shifts
Direct execution across 10 viewport widths (375px to 1920px):
- Telemetry Output:
  ```text
  Total Resizes: 500
  Total Duration: 6.30 ms
  Collapse Violations: 0
  CLS Score: 0.0
  Layout Shift Entries: 0
  Desktop Stage Rect: 520x520 px
  Mobile Stage Rect: 320x320 px
  Quote Dock min-height: 450px
  [PASS] 500 Window Resizes CLS Resilience
  ```

### 1.5 WebP Asset Verification (Resolution & Byte Size Bounds)
Binary parsing of RIFF/WEBP VP8X chunk headers:
- `web/assets/img/productos/roadone-hd55-frente.webp`:
  - Size: 104,242 bytes (101.80 KB) — within [51,200 B, 112,640 B]
  - Resolution: 1000 x 1000 px, 1:1 aspect ratio
  - Format: VP8X extended with Alpha Transparency bit set (`hasAlpha: true`)
- `web/assets/img/productos/roadone-hd55-45.webp`:
  - Size: 84,544 bytes (82.56 KB) — within [51,200 B, 112,640 B]
  - Resolution: 1000 x 1000 px, 1:1 aspect ratio
  - Format: VP8X extended with Alpha Transparency bit set (`hasAlpha: true`)

---

## 2. Logic Chain

1. **SRI Integrity Failure Blocks GSAP (Observation 1.1)**:
   - When a `<script>` tag specifies an `integrity` attribute, modern browsers verify the downloaded bytes against the declared cryptographic hash.
   - Line 1043 of `web/index.html` declared `sha512-7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUB46724jg/+AkDpMWb48ZnoG9UidcdSOiqUIFypItVmSBA==`.
   - The actual Cloudflare CDNJS SHA-512 digest for GSAP 3.12.5 is `sha512-7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUBWm67zeAfFC+HrdoE2GanKeocly/VxeLvIqwvCdk7qScg==`.
   - Because the hash differs, the browser completely blocks `gsap.min.js`.
   - In `web/assets/js/main.js`, `initCinematicScrollEngine()` line 1052 guards: `if (typeof window.gsap === 'undefined' ...) return null;`.
   - Therefore, the GSAP scroll engine never initializes in any production browser.

2. **Trigger Accumulation on Re-entry (Observation 1.2)**:
   - `initCinematicScrollEngine()` lacks re-entrancy protection. It does not call `ScrollTrigger.getById('cinematic-stage')?.kill()` or `window.cinematicTimeline?.kill()` before creating a new timeline.
   - When toggling media queries or calling `initCinematicScrollEngine()` again, a new `ScrollTrigger` is registered alongside the existing one, producing duplicate scroll listeners and pinned spacers.
   - Furthermore, unlike `AtmosphericParticleEngine` which registers `motionQuery.addEventListener('change', ...)`, `initCinematicScrollEngine()` lacks a change listener.

3. **Performance & SLA Resilience (Observations 1.3, 1.4, 1.5)**:
   - When GSAP is loaded with the valid hash, the mathematical execution is extremely fast (mean scroll frame time 0.0005ms in Node, 0.0064ms in browser, 0.00 KB retained memory leak).
   - Layout resilience across 500 rapid resize events produces CLS = 0 and zero dimension collapses.
   - The WebP assets meet all size and resolution criteria.

---

## 3. Caveats

- **No Caveats**: All 5 challenge dimensions were executed empirically in both an isolated Node.js V8 harness (`--expose-gc`) and a live headless Chromium session via Playwright against `http://localhost:5500`.

---

## 4. Conclusion & Recommended Action

**Verdict**: **REQUEST_CHANGES**

The work product CANNOT be approved for Milestone 2 completion until the following two fixes are made by the implementer worker:

1. **Fix Critical Blocking SRI Hash in `web/index.html` (Line 1043)**:
   - Replace corrupted integrity hash:
     ```html
     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" integrity="sha512-7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUBWm67zeAfFC+HrdoE2GanKeocly/VxeLvIqwvCdk7qScg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
     ```
2. **Add Re-entrancy Protection & Motion Listener in `web/assets/js/main.js`**:
   - In `initCinematicScrollEngine()`:
     - Check and kill any existing timeline and trigger:
       ```javascript
       if (window.cinematicTimeline) {
         window.cinematicTimeline.kill();
         window.cinematicTimeline = null;
       }
       const existingSt = ScrollTrigger.getById('cinematic-stage');
       if (existingSt) {
         existingSt.kill();
       }
       ```
     - Add dynamic `motionQuery.addEventListener('change', ...)` handler to cleanly kill/recreate the timeline when OS preferences change.

---

## 5. Verification Method

To independently verify the defects and reproduce the findings:

1. **Run the Adversarial Performance Harness**:
   ```powershell
   node --expose-gc .agents/teamwork/teamwork_challenger_m2_2/test_m2_adversarial_perf.js
   ```
   *Expected output*: 5 PASSED, 2 FAILED (SRI digest mismatch and ScrollTrigger trigger cleanup).

2. **Verify in Headless Browser Console**:
   ```powershell
   # With local server running on 5500:
   # Navigate to http://localhost:5500/index.html and check console errors
   ```
   *Observed*: `Failed to find a valid digest in the 'integrity' attribute for resource '...gsap.min.js'`.

3. **Verify WebP Assets**:
   ```powershell
   node -e "
     const fs = require('fs');
     console.log('frente:', fs.statSync('web/assets/img/productos/roadone-hd55-frente.webp').size);
     console.log('45:', fs.statSync('web/assets/img/productos/roadone-hd55-45.webp').size);
   "
   ```

4. **Invalidation Conditions**:
   - `web/index.html` line 1043 updated with valid SHA-512 hash `sha512-7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUBWm67zeAfFC+HrdoE2GanKeocly/VxeLvIqwvCdk7qScg==`.
   - `initCinematicScrollEngine()` cleans up existing ScrollTrigger instances before recreation.
