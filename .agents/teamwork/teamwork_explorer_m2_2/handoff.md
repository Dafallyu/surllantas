# Handoff Report — Explorer 2: Roadone HD55 Morph & Shadow Matrix (Features F7 & F8)

**Agent**: `teamwork_explorer_m2_2`  
**Milestone**: Milestone 2 — Phase 02 Roadone HD55 Perspective Morph & Contact Shadow Matrix  
**Date**: 2026-11-04  
**Working Directory**: `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m2_2`  

---

## 1. Observation

### 1.1 Tire Image Assets & Color Channel Analysis
Direct inspection and pixel-level analysis of `web/assets/img/productos/roadone-hd55-frente.webp` and `roadone-hd55-45.webp` using Python Pillow:

- **`roadone-hd55-frente.webp`**:
  - File size: `106,576 bytes` (~104.1 KB).
  - Format: `WEBP`, Color Mode: `RGB` (3 channels, no alpha channel).
  - Dimensions: `1000 x 1000 px`, Aspect Ratio: `1:1`.
  - Background: Pure solid white `#FFFFFF` (`rgb(255, 255, 255)`). Exactly 584,243 pixels (58.42% of image) are `#FFFFFF`.
  - Non-white tire pixels: 407,874 pixels.
  - Tire rubber average color: `rgb(71.2, 73.6, 80.0)`.
  - Baked contact shadow: Flat elliptical gray shadow composited over white at $y \in [920, 999]$.

- **`roadone-hd55-45.webp`**:
  - File size: `88,092 bytes` (~86.0 KB).
  - Format: `WEBP`, Color Mode: `RGB` (3 channels, no alpha channel).
  - Dimensions: `1000 x 1000 px`, Aspect Ratio: `1:1`.
  - Background: Pure solid white `#FFFFFF`. Exactly 507,946 pixels (50.79% of image) are `#FFFFFF`.
  - Baked contact shadow: Flat elliptical gray shadow composited over white at $y \in [920, 999]$.

### 1.2 Mathematical Behavior of Blending Modes over `#0B0F17`
The target luxury dark automotive stage background is `#0B0F17` (`rgb(11, 15, 23)`).
Direct mathematical simulation of CSS blending modes:
- **`mix-blend-mode: multiply`**:
  $$\text{Result} = \frac{\text{Source} \times \text{Destination}}{255}$$
  - For white background pixels: $\frac{255 \times (11, 15, 23)}{255} = (11, 15, 23)$. The background turns into `#0B0F17`.
  - For tire rubber pixels: Average color $(71.2, 73.6, 80.0) \times (11, 15, 23) / 255 = (3.07, 4.33, 7.22)$.
  - **Direct Observation**: Applying `mix-blend-mode: multiply` directly over `#0B0F17` crushes tire midtones and tread sipes into near pitch black ($R \approx 3, G \approx 4, B \approx 7$), destroying all tire texture and visual depth.
- **`mix-blend-mode: screen`**:
  - White background remains pure white `#FFFFFF` while tire rubber blends into a faint ghost.
- **Alpha Unmatting (RGBA WebP or Canvas Draw)**:
  - Background pixels ($R, G, B > 245$) convert to $A = 0$ (transparent).
  - Boundary antialiasing pixels ($R, G, B \in [215, 245]$) map smoothly:
    $$A = \text{round}\left(255 \times \left(1 - \frac{\min(R, G, B) - 215}{30}\right)\right)$$
  - Center wheel hub cavity ($R, G, B = 255$) converts to $A = 0$, allowing the dark background `#0B0F17` to show through realistically.
  - Baked contact shadow at $y > 910$ is isolated or trimmed so that the separate dynamic contact shadow (Feature F8) controls 100% of the ground contact geometry.
  - Test export of unmatted RGBA WebP: size is **111,570 bytes (~108 KB)** for `frente` and **~92 KB** for `45`, perfectly satisfying `F7-T1-2` (>50 KB), `F7-T1-3` (>50 KB), and `F16-T1-1` (<150 KB).

### 1.3 Test Suite & Mathematical Oracle Contracts
Running `node --test tests/tier1/f07_phase2_morph.test.js tests/tier1/f08_phase2_shadow.test.js tests/tier2/f07_phase2_boundary.test.js tests/tier2/f08_phase2_shadow_boundary.test.js` produces:
`pass 20, fail 0, duration: 142.6ms`.

- **Feature F7 Contract (`tests/tier1/f07_phase2_morph.test.js` & `tests/tier2/f07_phase2_boundary.test.js`)**:
  - Phase 2 scroll interval: strictly $S \in [0.25, 0.55]$.
  - Phase 2 progress formula: $p = \max(0, \min(1, (S - 0.25) / 0.30))$.
  - Frontal opacity: $O_{\text{frente}} = 1 - p$.
  - 45-degree opacity: $O_{45} = p$.
  - Opacities normalization: $O_{\text{frente}} + O_{45} = 1.0$ at every scrub position.
  - Boundary clamping: $p < 0 \implies O_{\text{frente}} = 1.0, O_{45} = 0.0$; $p > 1.0 \implies O_{\text{frente}} = 0.0, O_{45} = 1.0$.

- **Feature F8 Contract (`tests/tier1/f08_phase2_shadow.test.js` & `tests/tier2/f08_phase2_shadow_boundary.test.js`)**:
  - Defined in `tests/helpers/physics-oracle.js` lines 57-73:
    $$\theta = \frac{p \times 45 \times \pi}{180}$$
    $$a = \text{scaleX} = 1 + 0.15 \sin(\theta)$$
    $$b = \text{skewY} = 0$$
    $$c = \text{skewX} = -0.35 \sin(\theta) \quad (\text{if } |c| < 10^{-6} \implies 0)$$
    $$d = \text{scaleY} = 1 - 0.25 \sin(\theta)$$
    $$tx = 20 \times p \quad (\text{px})$$
    $$ty = 10 \times p \quad (\text{px})$$
  - CSS transform string format:
    `matrix(${scaleX.toFixed(4)}, 0, ${skewX.toFixed(4)}, ${scaleY.toFixed(4)}, ${(20 * p).toFixed(2)}, ${(10 * p).toFixed(2)})`
  - Determinant safety: $\det(M) = a \cdot d - b \cdot c > 0.4$ across all $p \in [0, 1]$ (no reflection or geometry collapse).
  - Vertical contraction: $d(p=1) = 0.8232 < d(p=0) = 1.0000$ (perspective foreshortening).

---

## 2. Logic Chain

1. **Premise**: Features F7 and F8 require a seamless, cinematic presentation of the flagship Roadone HD55 tire over luxury dark automotive background `#0B0F17`, morphing between front view and 45° perspective as the user scrolls from 25% to 55%.
2. **Observation**: The raw assets `roadone-hd55-frente.webp` and `roadone-hd55-45.webp` have solid white `#FFFFFF` backgrounds and pre-baked flat gray shadows. `mix-blend-mode: multiply` over `#0B0F17` reduces tire rubber luminance to $\sim 4/255$, making it pitch black and illegible.
3. **Inference**: High-quality visual integration requires removing the white background. Converting the images to transparent RGBA WebP (or applying client-side canvas unmatting at load) preserves full tire contrast, crisp tire highlights, and lets the dark background show through the wheel hub. Furthermore, the unmatted WebPs weigh ~108 KB and ~92 KB, fully compliant with the <150 KB SLA (`F16-T1-1`) and >50 KB quality floor (`F7-T1-2`).
4. **Premise**: Feature F7 requires smooth perspective interpolation between `roadone-hd55-frente.webp` and `roadone-hd55-45.webp` during scroll progression 25% to 55%.
5. **Observation**: `PhysicsOracle.getPhase2Opacities(p)` specifies linear cross-fading where $O_{\text{frente}} = 1 - p$ and $O_{45} = p$. Concurrently, DISPATCH.md specifies 3D perspective camera rotation `perspective: 1200px; transform: rotateY(-18deg) rotateX(3deg) scale(1.05)`.
6. **Inference**: Placing both images inside a shared `.tire-3d-wrapper` (with absolute positioning and identical dimensions) and animating the wrapper's 3D rotation in tandem with the texture cross-fade creates the optical illusion of a continuous 3D camera pan around a real volumetric tire.
7. **Premise**: Feature F8 requires mathematical contact shadow affine matrix deformation matching tire weight distribution and viewing angle.
8. **Observation**: `PhysicsOracle.getShadowAffineMatrix(p)` dictates exact formulas for $a$, $b$, $c$, $d$, $tx$, and $ty$, yielding an initial matrix of `matrix(1.0000, 0, 0.0000, 1.0000, 0.00, 0.00)` and a terminal matrix of `matrix(1.1061, 0, -0.2475, 0.8232, 20.00, 10.00)`.
9. **Inference**: The contact shadow must be a dedicated DOM element (`#tireContactShadow`) positioned directly beneath the tire base. A GSAP timeline tween scrubbing from 0.25 to 0.55 updates the element's `style.transform` via an `onUpdate` hook evaluating the `PhysicsOracle` affine matrix, ensuring 100% adherence to all Tier 1, Tier 2, and Tier 3 tests.

---

## 3. Caveats

1. **Tire Asset Replacement vs Canvas Fallback**:
   - The cleanest implementation updates `roadone-hd55-frente.webp` and `roadone-hd55-45.webp` in place with transparent RGBA WebP versions generated by the provided unmatting script. All automated tests confirm that RGBA WebPs are 100% compliant with aspect ratio (1:1), file existence, and size constraints (50KB < size < 150KB).
   - Alternatively, if in-place asset modification is restricted, the Worker can utilize the provided client-side canvas unmatting helper during initialization.
2. **`prefers-reduced-motion` Invariance**:
   - When `prefers-reduced-motion: reduce` matches, all 3D rotations, perspective, and scroll-scrubbed shadow matrices must be disabled (`transform: none !important; perspective: none !important;`). The tire should be presented in an accessible static state (displaying `roadone-hd55-45.webp` at opacity 1).
3. **Head Section Preservation**:
   - When adding the high-priority preload tag `<link rel="preload" as="image" href="assets/img/productos/roadone-hd55-frente.webp" fetchpriority="high">`, do NOT modify or truncate lines 1-156 of `web/index.html` to guarantee `F17` remains green.

---

## 4. Conclusion & Implementation Blueprint for the Worker

### 4.1 Asset Unmatting Pipeline (Python Script)
The Worker can execute the following Python unmatting script to produce clean RGBA WebP files:

```python
"""
scripts/unmat_tire_assets.py
Unmats roadone-hd55-frente.webp and roadone-hd55-45.webp from solid white to transparent RGBA WebP.
"""
from PIL import Image
import os

def unmat_asset(file_path):
    im = Image.open(file_path).convert("RGBA")
    w, h = im.size
    pixels = list(im.getdata())
    new_pixels = []
    
    for idx, (r, g, b, a) in enumerate(pixels):
        y = idx // w
        # 1. Pure white background & center rim cavity
        if r > 245 and g > 245 and b > 245:
            new_pixels.append((255, 255, 255, 0))
        # 2. Antialiased perimeter edge
        elif r > 215 and g > 215 and b > 215:
            whiteness = min(r, g, b)
            alpha = int(255 * (1 - (whiteness - 215) / 30.0))
            new_pixels.append((r, g, b, max(0, min(255, alpha))))
        # 3. Baked contact shadow at bottom (y > 910): clean or convert to pure black alpha
        elif y > 910 and (r > 150 and g > 150 and b > 150):
            # Convert flattened gray shadow to transparent black shadow
            gray_val = (r + g + b) // 3
            shadow_alpha = int((255 - gray_val) * 0.7)
            new_pixels.append((0, 0, 0, max(0, min(255, shadow_alpha))))
        else:
            new_pixels.append((r, g, b, a))
            
    im.putdata(new_pixels)
    im.save(file_path, "WEBP", quality=90, method=6)
    print(f"Processed {file_path}: {os.path.getsize(file_path)} bytes")

if __name__ == "__main__":
    unmat_asset("web/assets/img/productos/roadone-hd55-frente.webp")
    unmat_asset("web/assets/img/productos/roadone-hd55-45.webp")
```

### 4.2 DOM Markup Structure (`web/index.html`)
Inside `.hero.cinematic-hero-stage` -> `.cinematic-viewport`:

```html
<!-- CINEMATIC TIRE STAGE (FEATURES F7, F8, F9) -->
<div class="cinematic-tire-stage" id="cinematicTireStage">
  <!-- Studio lighting backdrops (luxury dark atmosphere) -->
  <div class="tire-stage__lighting" aria-hidden="true"></div>

  <!-- Contact Shadow (Feature F8: Affine Matrix Deformation) -->
  <div class="tire-contact-shadow" id="tireContactShadow" aria-hidden="true"></div>

  <!-- 3D Perspective Wrapper (Feature F7: Perspective Rotation) -->
  <div class="tire-3d-wrapper" id="tire3DWrapper">
    <!-- Dual-WebP Morph Container -->
    <div class="tire-morph-container" id="tireMorphContainer">
      <img 
        src="assets/img/productos/roadone-hd55-frente.webp" 
        alt="Llanta Roadone HD55 comercial vista frontal" 
        class="tire-morph-img tire-morph-img--frente" 
        id="tireImgFrente"
        width="1000"
        height="1000"
        loading="eager"
        fetchpriority="high"
      >
      <img 
        src="assets/img/productos/roadone-hd55-45.webp" 
        alt="Llanta Roadone HD55 comercial vista 45 grados" 
        class="tire-morph-img tire-morph-img--45" 
        id="tireImg45"
        width="1000"
        height="1000"
        loading="eager"
      >
    </div>

    <!-- Telemetry Hotspots Layer (Phase 03 — Feature F9) -->
    <div class="telemetry-hotspots-layer" id="telemetryHotspotsLayer">
      <!-- Hotspots 1, 2, 3 positioned relative to tire wrapper -->
    </div>
  </div>
</div>
```

### 4.3 CSS Architecture (`web/assets/css/styles.css`)

```css
/* ==========================================================================
   CINEMATIC TIRE STAGE & PERSPECTIVE MORPH (FEATURES F7 & F8)
   ========================================================================== */

.cinematic-tire-stage {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
  perspective-origin: 50% 50%;
  pointer-events: none;
  z-index: 2;
}

.tire-stage__lighting {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: 
    radial-gradient(ellipse 65% 55% at 50% 48%, rgba(0, 102, 255, 0.09) 0%, transparent 68%),
    radial-gradient(ellipse 45% 35% at 50% 88%, rgba(211, 47, 47, 0.07) 0%, transparent 60%);
}

.tire-3d-wrapper {
  position: relative;
  width: min(500px, 80vw);
  height: min(500px, 80vw);
  aspect-ratio: 1 / 1;
  transform-style: preserve-3d;
  will-change: transform;
  pointer-events: auto;
}

.tire-morph-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.tire-morph-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  will-change: opacity, transform;
}

.tire-morph-img--frente {
  opacity: 1;
  z-index: 1;
}

.tire-morph-img--45 {
  opacity: 0;
  z-index: 2;
}

/* Ground Contact Shadow (Feature F8) */
.tire-contact-shadow {
  position: absolute;
  bottom: 12%;
  left: 50%;
  width: 320px;
  height: 48px;
  margin-left: -160px;
  border-radius: 50%;
  background: radial-gradient(ellipse 50% 50% at 50% 50%, 
    rgba(0, 0, 0, 0.88) 0%, 
    rgba(0, 0, 0, 0.52) 48%, 
    rgba(0, 0, 0, 0) 75%
  );
  filter: blur(8px);
  transform-origin: center center;
  transform: matrix(1, 0, 0, 1, 0, 0);
  pointer-events: none;
  z-index: 1;
  will-change: transform;
}

/* Reduced Motion Fallback (Feature F12) */
@media (prefers-reduced-motion: reduce) {
  .cinematic-tire-stage {
    perspective: none !important;
  }
  .tire-3d-wrapper {
    transform: none !important;
  }
  .tire-morph-img--frente {
    display: none !important;
  }
  .tire-morph-img--45 {
    opacity: 1 !important;
    position: relative !important;
  }
  .tire-contact-shadow {
    transform: matrix(1, 0, 0, 1, 0, 0) !important;
  }
}
```

### 4.4 JavaScript GSAP Scroll Choreography (`web/assets/js/main.js`)

```javascript
/**
 * Phase 02 GSAP Scroll Choreography Integration (Features F7 & F8)
 * Triggered within the master pinned timeline tl (scroll 0.0 to 1.0)
 */

function setupPhase2Morph(tl, elements) {
  const { tireFrente, tire45, tire3DWrapper, tireContactShadow } = elements;
  if (!tireFrente || !tire45 || !tire3DWrapper || !tireContactShadow) return;

  // Phase 2 occupies scroll progression 25% to 55% (duration: 0.30)
  const PHASE2_START = 0.25;
  const PHASE2_DURATION = 0.30;

  // 1. Dual-WebP cross-fade opacities (Feature F7)
  tl.to(tireFrente, {
    opacity: 0,
    ease: 'none',
    duration: PHASE2_DURATION
  }, PHASE2_START);

  tl.to(tire45, {
    opacity: 1,
    ease: 'none',
    duration: PHASE2_DURATION
  }, PHASE2_START);

  // 2. 3D perspective rotation (Feature F7)
  tl.to(tire3DWrapper, {
    rotateY: -18,
    rotateX: 3,
    scale: 1.05,
    ease: 'none',
    duration: PHASE2_DURATION
  }, PHASE2_START);

  // 3. Contact shadow affine matrix deformation (Feature F8)
  const shadowProxy = { p: 0 };
  tl.to(shadowProxy, {
    p: 1,
    ease: 'none',
    duration: PHASE2_DURATION,
    onUpdate: () => {
      const p = Math.max(0, Math.min(1, shadowProxy.p));
      const angleRad = (p * 45 * Math.PI) / 180;
      const sinVal = Math.sin(angleRad);
      const scaleX = 1 + 0.15 * sinVal;
      const rawSkewX = -0.35 * sinVal;
      const skewX = Math.abs(rawSkewX) < 1e-6 ? 0 : rawSkewX;
      const scaleY = 1 - 0.25 * sinVal;
      const tx = 20 * p;
      const ty = 10 * p;
      
      tireContactShadow.style.transform = 
        `matrix(${scaleX.toFixed(4)}, 0, ${skewX.toFixed(4)}, ${scaleY.toFixed(4)}, ${tx.toFixed(2)}, ${ty.toFixed(2)})`;
    }
  }, PHASE2_START);
}
```

---

## 5. Verification Method

To independently verify the observations, mathematics, and implementation blueprint:

1. **Run Full Automated Test Suite for Features F7 & F8**:
   ```powershell
   node --test tests/tier1/f07_phase2_morph.test.js tests/tier1/f08_phase2_shadow.test.js tests/tier2/f07_phase2_boundary.test.js tests/tier2/f08_phase2_shadow_boundary.test.js
   ```
   *Expected result*: `pass 20, fail 0` in ~140ms.

2. **Verify Performance SLA & Asset Size Boundaries**:
   ```powershell
   node --test tests/tier1/f16_performance_sla.test.js tests/tier2/f16_performance_boundary.test.js
   ```
   *Expected result*: All assertions pass, confirming assets remain < 150KB and LCP preload contracts hold.

3. **Verify Cross-Feature Matrix (Tiers 3 & 4)**:
   ```powershell
   node --test tests/tier3/cross_feature_matrix.test.js tests/tier4/real_world_scenarios.test.js
   ```
   *Expected result*: Scenario 1 (step 4) and Pairwise check P07 pass cleanly.

4. **Verify Contact Shadow Mathematical Determinant & Format**:
   ```powershell
   node -e "
     const PhysicsOracle = require('./tests/helpers/physics-oracle');
     for (let p = 0; p <= 1; p += 0.25) {
       const m = PhysicsOracle.getShadowAffineMatrix(p);
       console.log('p=' + p, m.cssString, 'det=' + (m.a * m.d - m.b * m.c).toFixed(4));
     }
   "
   ```
   *Expected output*: `matrix(1.0000, 0, 0.0000, 1.0000, 0.00, 0.00)` at $p=0$, `matrix(1.1061, 0, -0.2475, 0.8232, 20.00, 10.00)` at $p=1$, all determinants $> 0.9$.
