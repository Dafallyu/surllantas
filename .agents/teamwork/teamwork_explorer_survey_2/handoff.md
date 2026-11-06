# Handoff Report — Explorer 2: Assets, Tire Morphing & Catalog Spotlight Survey

**Agent**: `teamwork_explorer_survey_2`  
**Mission**: Survey Phase — Assets, Tire Morphing & Catalog Spotlight  
**Date**: 2026-11-04  
**Project Root**: `d:\Proyectos\SurLlantas`  
**Working Directory**: `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_survey_2`  

---

## 1. Observation

### 1.1 Tire Image Assets & Shadow Analysis
Direct inspection was conducted on `web/assets/img/productos/roadone-hd55-frente.webp` and `roadone-hd55-45.webp`, as well as filesystem searches for shadow assets across `web/assets/`.

- **`roadone-hd55-frente.webp`**:
  - **Path**: `web/assets/img/productos/roadone-hd55-frente.webp`
  - **File Size**: `106,576 bytes` (~104.1 KB)
  - **Format**: `WEBP`
  - **Color Mode**: `RGB` (3 channels, 8 bits/channel, sRGB).
  - **Dimensions & Aspect Ratio**: `1000 x 1000 px`, Aspect Ratio `1:1`.
  - **Alpha Channel**: **None** (`img.mode == 'RGB'`). Transparent alpha is **FALSE**.
  - **Background**: Solid pure white `rgb(255, 255, 255)`. Corner pixels `(0,0)`, `(999,0)`, `(0,999)`, `(999,999)` are all `(255, 255, 255)`. Exactly `584,243` pixels (58.42% of total canvas) are pure white `#FFFFFF`.
  - **Tire Bounding Box (Non-white pixels)**: `x=[254, 744]` (width = 491 px, ~49.1% canvas width), `y=[107, 999]` (height = 893 px, ~89.3% canvas height). Center X: ~499 px.
  - **Baked Contact Shadow**: Located between `y=920` and `y=999`. Approximately `9,558` neutral gray shadow pixels (`rgb(150..250, 150..250, 150..250)`) are permanently flattened into the white canvas.
  - **Visual Features**: Symmetrical frontal tread view of the Roadone HD55 commercial truck steer/all-position tire. Shows deep longitudinal groove sipes, rigid decoupling shoulder ribs, and heavy-duty casing geometry.

- **`roadone-hd55-45.webp`**:
  - **Path**: `web/assets/img/productos/roadone-hd55-45.webp`
  - **File Size**: `88,092 bytes` (~86.0 KB)
  - **Format**: `WEBP`
  - **Color Mode**: `RGB` (3 channels, 8 bits/channel, sRGB).
  - **Dimensions & Aspect Ratio**: `1000 x 1000 px`, Aspect Ratio `1:1`.
  - **Alpha Channel**: **None** (`img.mode == 'RGB'`). Transparent alpha is **FALSE**.
  - **Background**: Solid pure white `rgb(255, 255, 255)`. Corner pixels `(0,0)`, `(999,0)`, `(0,999)`, `(999,999)` are all `(255, 255, 255)`. Exactly `507,946` pixels (50.79% of total canvas) are pure white `#FFFFFF`.
  - **Tire Bounding Box (Non-white pixels)**: `x=[191, 808]` (width = 618 px, ~61.8% canvas width), `y=[100, 999]` (height = 900 px, ~90.0% canvas height). Center X: ~500 px.
  - **Baked Contact Shadow**: Located between `y=920` and `y=999`. Approximately `4,486` neutral gray shadow pixels flattened into the white canvas.
  - **Visual Features**: 3/4 (45-degree) isometric perspective showing tread block depth, shoulder transition, and bead/rim opening.

- **Shadow Assets in Filesystem**:
  - Search command for `*shadow*` and `*sombra*` across `web/` returned **0 files**.
  - Review of `web/procesar_fotos.py` (lines 145-173) confirms shadows were procedurally synthesized via Pillow `ImageDraw.ellipse` with dual Gaussian blurs (`radius=10`), composited over `(255, 255, 255)` white canvas, and converted to `RGB` before WebP export.
  - Current CSS in `web/assets/css/styles.css` (line 1064) simulates depth on dark containers using `filter: drop-shadow(0 18px 24px rgba(0, 0, 0, 0.65))` on `.roadone-card__visual`.

---

### 1.2 Catalog Section Architecture & Spotlight Coordinates Binding
Direct inspection of `web/index.html` (lines 308-393) and `web/assets/css/styles.css` (lines 787-839, 1285-1341):

- **DOM Structure & Markup**:
  - Section container: `<section id="categorias" class="section-catalog" style="padding: 6rem 0; background-color: var(--bg-surface);">`
  - Inner grid: `<div class="grid-4">` containing 4 category cards:
    1. Automóvil (`.category-card.reveal`)
    2. Camioneta / SUV (`.category-card.reveal`)
    3. Camión (`.category-card.reveal`)
    4. Moto (`.category-card.reveal`)
  - Each `.category-card` structure:
    ```html
    <div class="category-card reveal">
      <div class="category-card__media">
        <img src="..." alt="..." class="category-card__img" loading="lazy">
      </div>
      <div class="category-card__body">
        <div>
          <h3 class="heading-md category-card__title">...</h3>
          <p class="category-card__desc">...</p>
        </div>
        <div>
          <a href="https://wa.me/..." target="_blank" class="btn btn--primary btn--sm" style="width: 100%;">
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
    ```
- **Current Layout & Responsive Breakpoints**:
  - Desktop (>1023px): `display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;`
  - Tablet (641px - 1023px): `grid-template-columns: repeat(2, 1fr); gap: 1.25rem;`
  - Mobile (<=640px): `grid-template-columns: 1fr; gap: 1rem;`
- **Current Hover States**:
  - `styles.css` lines 1299-1303:
    ```css
    .category-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-md);
      border-color: var(--color-rojo);
    }
    .category-card:hover .category-card__img {
      transform: scale(1.06);
    }
    ```
  - Background is currently light: `var(--bg-primary)` (`#FFFFFF`) on section background `var(--bg-surface)` (`#F8FAFC`).
- **Spotlight Glow Integration (`--mouse-x`, `--mouse-y`)**:
  - Currently, no CSS variables for cursor coordinates exist on the cards.
  - To implement the reactive radial gradient spotlight border without layout shift or click blocking:
    1. JavaScript attaches `mousemove` and `mouseleave` listeners to each `.category-card` (or delegating container).
    2. Coordinates calculated via `rect = card.getBoundingClientRect();` -> `card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px'); card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');`.
    3. CSS creates a masked border pseudo-element (`::before`) or double-layer border with `pointer-events: none` and `background: radial-gradient(350px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), rgba(0, 102, 255, 0.7), rgba(211, 47, 47, 0.4) 30%, transparent 70%)`.
    4. When `prefers-reduced-motion: reduce` or on touch devices, spotlight radial gradient disables or falls back to a clean static accent border.

---

### 1.3 WhatsApp Quote CTA Structure & Phase 04 Tire Landing Integration
Direct inspection of `web/index.html` (lines 212-304, 743-761, 820-872) and `web/assets/js/main.js` (lines 237-279):

- **Phone Numbers**:
  - **Línea 1 (Principal - Cotizaciones & Livianos)**: `+591 72960725` (International format `59172960725`).
  - **Línea 2 (Secundaria - Flotas & Transporte Pesado)**: `+591 68687118` (International format `59168687118`).
- **Express WhatsApp Quote Bar (`section.section-quote-bar`)**:
  - Lines 242-304: Immediately follows `<section class="hero">`.
  - Form markup: `<form id="tireQuoteForm" class="quote-bar-form" novalidate>`
  - Inputs:
    - `#quoteVehicle` (Select: `Automóvil`, `Camioneta / 4x4`, `Camión / Transporte Pesado`, `Motocicleta`)
    - `#quoteSize` (Text: placeholder `"Ej: 205/55 R16 o 295/80 R22.5"`)
    - `#quoteBrand` (Select: `Cualquier marca recomendada`, `Roadone`, `Goodyear`, `Bridgestone`, `Dunlop`, `Roadcruza`, `Condor`, `Triangle`)
    - Submit Button: `button[type="submit"].btn--quote-submit`
  - JavaScript Controller (`initTireQuoteWidget()` in `main.js:240-279`):
    - Validates size input (highlights red if empty).
    - Assembles message payload:
      ```text
      Hola Sur Llantas, quiero consultar stock y disponibilidad de llantas:
      🚗 Tipo de Vehículo: [Vehicle]
      📏 Medida solicitada: [Size]
      🏷️ Marca preferida: [Brand]
      ¿Tienen stock inmediato y cuál sería el precio? Gracias.
      ```
    - Opens `https://wa.me/59172960725?text=[encoded_text]` via `window.open(..., '_blank')`.
- **Phase 04 Tire Landing Connection**:
  - The hero section ends at line 239 and the express quote bar begins at line 242.
  - Phase 04 (viewport scroll 80%-100%) requires the Roadone HD55 tire to seamlessly land into the express WhatsApp quote CTA.
  - Because Roadone HD55 is a commercial truck tire (`315/70 R22.5`), the landing transition can dock the tire directly into a visual docking bay inside or beside `.quote-bar-card`.
  - When docked, clicking the tire or the quote button triggers a pre-filled quote targeting `Camión / Transporte Pesado`, `315/70 R22.5`, `Roadone HD55`.
  - **CLS Preservation**: The docking container must maintain fixed CSS aspect-ratio / min-height so GSAP's scroll interpolation does not cause Cumulative Layout Shift (`CLS = 0`).

---

### 1.4 Color Token Architecture & CSP Infrastructure Analysis
Direct inspection of `web/assets/css/styles.css` (lines 10-70) and `web/vercel.json` (lines 1-76):

- **Existing Variables in `:root`**:
  - Dark surfaces: `--bg-dark: #0B0F19;`, `--bg-dark-deep: #070A10;`, `--bg-dark-card: #111827;`, `--color-carbon: #0F172A;`.
  - Light surfaces: `--bg-primary: #FFFFFF;`, `--bg-surface: #F8FAFC;`, `--color-blanco: #FFFFFF;`.
  - Reds: `--color-rojo: #DC2626;`, `--color-rojo-hover: #B91C1C;`, `--color-rojo-luminoso: #EF4444;`.
  - Yellows: `--color-amarillo: #F5B301;`, `--color-amarillo-light: #FFF9E6;`.
- **Target Color Tokens Evaluation**:
  - **`#0B0F17` (Luxury Dark Automotive)**: Exactly 0 occurrences currently in `styles.css`. Closest is `#0B0F19`. Should be established as primary dark background `--color-automotive-dark: #0B0F17;` and `--bg-dark: #0B0F17;`.
  - **`#0066FF` (Electric Blue)**: Exactly 0 occurrences currently in `styles.css`. Must be established as `--color-electric-blue: #0066FF;` for spotlight radial gradients, telemetry radar sweeps, and hotspot indicators.
  - **`#D32F2F` (Automotive Brand Red)**: Already specified in `web/index.html` line 43 (`<meta name="theme-color" content="#D32F2F">`), but CSS used `#DC2626`. Must be unified as `--color-brand-red: #D32F2F;`.
- **Critical Infrastructure & CSP Observation (`web/vercel.json`)**:
  - In `web/vercel.json` line 35:
    `"value": "default-src 'self'; script-src 'self' 'unsafe-inline'; ..."`
  - **CRITICAL RISK**: The existing Content-Security-Policy (CSP) headers restrict scripts to `'self' 'unsafe-inline'`. Loading GSAP and ScrollTrigger from external CDNs (e.g. `cdnjs.cloudflare.com`) in production on Vercel will be **blocked by CSP** unless:
    - Option 1: `script-src` in `web/vercel.json` is updated to include `https://cdnjs.cloudflare.com` (and `connect-src` if needed).
    - Option 2: GSAP 3.x and ScrollTrigger are placed locally in `web/assets/js/vendor/gsap.min.js` and `ScrollTrigger.min.js` (satisfying `'self'`).

---

## 2. Logic Chain

1. **Premise**: Requirement R2 demands smooth perspective morphing between `roadone-hd55-frente.webp` and `roadone-hd55-45.webp` on a dark cinematic canvas with mathematical contact shadow deformation.
2. **Observation**: Both images are strictly RGB 1000x1000 WebPs with solid white backgrounds (`rgb(255, 255, 255)` >50% pixels) and pre-baked flat elliptical shadows.
3. **Inference**: Placing these images directly over dark canvas (`#0B0F17`) will produce a harsh white square artifact unless the white background is made transparent (either via alpha unmatting to RGBA WebP, or dynamic canvas pixel thresholding/canvas draw, or CSS clipping). Furthermore, because the contact shadow is baked onto white pixels, rotating or deforming the tire matrix separately from the ground shadow requires separating the shadow from the tire body.
4. **Premise**: Requirement R3 demands catalog cards with dynamic spotlight glow borders guided by `--mouse-x` and `--mouse-y` using dark tokens `#0B0F17`, `#0066FF`, `#D32F2F`.
5. **Observation**: Currently, `.section-catalog` has a light inline background (`#F8FAFC`) and `.category-card` has a white background (`#FFFFFF`) with simple translateY hover. Neither card has mouse tracking variables.
6. **Inference**: Upgrading the catalog section requires:
   - Converting `.section-catalog` and cards to the luxury dark token hierarchy (`#0B0F17` background, white headings, muted gray text).
   - Binding `mousemove` handlers on cards to populate `--mouse-x` and `--mouse-y`.
   - Applying a masked pseudo-element border using a radial gradient with electric blue `#0066FF` and red `#D32F2F`.
7. **Premise**: Requirement R2 Phase 04 demands landing the tire into the express WhatsApp quote CTA without visual snapping, while R4 demands `CLS = 0` and preserving Vercel analytics/SEO.
8. **Observation**: `.section-quote-bar` sits immediately after the hero section, utilizing `initTireQuoteWidget()` targeting WhatsApp `+591 72960725`.
9. **Inference**: An anchored landing dock in `.section-quote-bar` with explicit reserved dimensions will allow GSAP to tween the tire into place smoothly without causing Cumulative Layout Shift. Pre-filling the form for Roadone HD55 (`315/70 R22.5`) creates a high-conversion commercial bridge.

---

## 3. Caveats

1. **Network vs CSP**: If the deployment relies strictly on external public CDNs for GSAP, `web/vercel.json` must be adjusted to permit `https://cdnjs.cloudflare.com` in `script-src`, or GSAP must be downloaded locally into `web/assets/js/vendor/`.
2. **Tire Asset Alpha Channel**: While we observed that `roadone-hd55-frente.webp` and `roadone-hd55-45.webp` lack an alpha channel in the repo, the white background is uniform `(255, 255, 255)`. If the implementation agent generates transparent RGBA WebP assets or uses a canvas chroma-key shader, the visual result will be indistinguishable from studio PNGs.
3. **Reduced Motion Accessibility**: When `prefers-reduced-motion: reduce` is active, spotlight tracking and perspective morphing must freeze to accessible static layouts to comply with WCAG 2.1 Criterion 2.3.3.

---

## 4. Conclusion

1. **Asset Readiness**:
   - `roadone-hd55-frente.webp` (1000x1000, 104 KB) and `roadone-hd55-45.webp` (1000x1000, 86 KB) are verified and present in `web/assets/img/productos/`.
   - Both assets require either transparent RGBA unmatting or canvas blending to render cleanly on `#0B0F17`.
   - The contact shadow must be rendered as a separate CSS/SVG/Canvas ground element to enable mathematical matrix deformation.
2. **Catalog Spotlight Architecture**:
   - The catalog section (`#categorias`) in `web/index.html` uses `.grid-4` with 4 `.category-card` elements.
   - Coordinate binding `--mouse-x` and `--mouse-y` can be implemented with ~15 lines of vanilla JS and a masked `::before` pseudo-element radial gradient using `#0066FF` (Electric Blue) and `#D32F2F` (Brand Red).
3. **CTA & Phase 04 Landing**:
   - The express quote bar (`#tireQuoteForm` in `.section-quote-bar`) connects to primary WhatsApp `+591 72960725`.
   - Docking the tire into `.section-quote-bar` during Phase 04 provides a cohesive transition, maintaining `CLS = 0` via a dedicated dimension-reserved dock.
4. **Token Integration & CSP**:
   - Tokens `#0B0F17`, `#0066FF`, and `#D32F2F` must be added to `:root` in `styles.css`.
   - `web/vercel.json` CSP must be updated if GSAP is loaded from public CDN.

---

## 5. Verification Method

To independently verify the observations and findings in this report, execute the following commands in the workspace root:

1. **Verify Tire Asset Format, Dimensions, and Absence of Alpha**:
   ```powershell
   python -c "from PIL import Image; [print(f, Image.open(f).mode, Image.open(f).size) for f in ['web/assets/img/productos/roadone-hd55-frente.webp', 'web/assets/img/productos/roadone-hd55-45.webp']]"
   ```
   *Expected output*: `RGB (1000, 1000)` for both files.

2. **Verify Absence of Standalone Shadow Assets**:
   ```powershell
   Get-ChildItem -Path web -Recurse -Include *shadow*, *sombra*
   ```
   *Expected output*: 0 files returned.

3. **Verify Catalog Cards and Grid Classes in HTML**:
   ```powershell
   Select-String -Path web/index.html -Pattern 'section-catalog|category-card|grid-4'
   ```
   *Expected output*: Lines 309, 319, 321, 339, 357, 375.

4. **Verify WhatsApp Phone Numbers and Links**:
   ```powershell
   Select-String -Path web/index.html -Pattern 'wa\.me/59172960725|wa\.me/59168687118'
   ```
   *Expected output*: 20 matching occurrences.

5. **Verify CSP Header in vercel.json**:
   ```powershell
   Select-String -Path web/vercel.json -Pattern 'script-src'
   ```
   *Expected output*: Line 35 containing `"script-src 'self' 'unsafe-inline';"`.
