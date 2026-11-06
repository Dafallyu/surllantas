# Handoff Report — Explorer 1 (Web Structure & Hero Architecture)

## 1. Observation

### 1.1 Complete `<head>` Inventory in `web/index.html` (Lines 1 to 156)
A direct inspection of `web/index.html` lines 1 to 156 reveals the following structure and critical metadata tags:

- **HTML & Document Root**:
  - Line 1: `<!DOCTYPE html>`
  - Line 2: `<html lang="es">`
  - Line 3: `<head>`
  - Line 4: `<meta charset="UTF-8">`
  - Line 5: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

- **Core SEO Metadata**:
  - Line 6: `<title>Sur Llantas | Venta de Llantas en Tarija desde 2001</title>`
  - Line 7: `<meta name="description" content="Sur Llantas en Tarija, Bolivia. Más de 25 años dedicados exclusivamente a la venta e importación de llantas para autos, camionetas 4x4, camiones (marca Roadone) y maquinaria.">`
  - Line 8: `<meta name="keywords" content="Sur Llantas, venta de llantas Tarija, llantas Tarija Bolivia, Roadone Tarija, llantas camión tarija, tienda de llantas tarija">`

- **OpenGraph & WhatsApp / Social Preview Tags**:
  - Line 11: `<meta property="og:site_name" content="Sur Llantas Tarija">`
  - Line 12: `<meta property="og:title" content="Sur Llantas | Venta de Llantas en Tarija desde 2001">`
  - Line 13: `<meta property="og:description" content="Sur Llantas en Tarija, Bolivia. Más de 25 años dedicados exclusivamente a la venta e importación de llantas para autos, camionetas 4x4, camiones (marca Roadone) y maquinaria.">`
  - Line 14: `<meta property="og:image" content="https://surllantas.com.bo/assets/img/og-surllantas.jpg">`
  - Line 15: `<meta property="og:image:secure_url" content="https://surllantas.com.bo/assets/img/og-surllantas.jpg">`
  - Line 16: `<meta property="og:image:type" content="image/jpeg">`
  - Line 17: `<meta property="og:image:width" content="640">`
  - Line 18: `<meta property="og:image:height" content="640">`
  - Line 19: `<meta property="og:image:alt" content="Sur Llantas Tarija - Venta e Importación de Llantas">`
  - Line 20: `<meta property="og:url" content="https://surllantas.com.bo/">`
  - Line 21: `<link rel="canonical" href="https://surllantas.com.bo/">`
  - Line 22: `<meta property="og:type" content="website">`
  - Line 23: `<meta property="og:locale" content="es_BO">`

- **Twitter Card Metadata**:
  - Line 26: `<meta name="twitter:card" content="summary_large_image">`
  - Line 27: `<meta name="twitter:title" content="Sur Llantas | Venta de Llantas en Tarija desde 2001">`
  - Line 28: `<meta name="twitter:description" content="Sur Llantas en Tarija, Bolivia. Más de 25 años dedicados exclusivamente a la venta e importación de llantas para autos, camionetas 4x4, camiones (marca Roadone) y maquinaria.">`
  - Line 29: `<meta name="twitter:image" content="https://surllantas.com.bo/assets/img/og-surllantas.jpg">`

- **Search Engine Snippet Thumbnails**:
  - Line 32: `<meta name="thumbnail" content="https://surllantas.com.bo/assets/img/og-surllantas.jpg">`
  - Line 33: `<link rel="image_src" href="https://surllantas.com.bo/assets/img/og-surllantas.jpg">`

- **Favicons & Application Manifest**:
  - Line 36: `<link rel="icon" type="image/png" sizes="48x48" href="assets/img/favicon-48x48.png">`
  - Line 37: `<link rel="icon" type="image/png" sizes="96x96" href="assets/img/favicon-96x96.png">`
  - Line 38: `<link rel="icon" type="image/png" sizes="192x192" href="assets/img/favicon-192x192.png">`
  - Line 39: `<link rel="icon" type="image/png" sizes="512x512" href="assets/img/favicon-512x512.png">`
  - Line 40: `<link rel="shortcut icon" href="favicon.ico">`
  - Line 41: `<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">`
  - Line 42: `<link rel="manifest" href="site.webmanifest">`
  - Line 43: `<meta name="theme-color" content="#D32F2F">`

- **Google Web Fonts**:
  - Line 46: `<link rel="preconnect" href="https://fonts.googleapis.com">`
  - Line 47: `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
  - Line 48: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">`

- **CSS Links & Inline Styles**:
  - Line 51: `<link rel="stylesheet" href="assets/css/styles.css?v=2.3">`
  - Lines 52-56:
    ```html
    <style>
      .brand-logo-img { max-height: 54px !important; max-width: 180px !important; width: 100% !important; height: 54px !important; object-fit: contain; filter: grayscale(100%); opacity: 0.45; mix-blend-mode: multiply; }
      .brand-strip-grid { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 2.75rem 3.5rem; max-width: 1240px; margin: 0 auto; }
      .brand-logo-item { display: flex; align-items: center; justify-content: center; width: 180px; height: 56px; }
    </style>
    ```

- **JSON-LD Structured Data Schema (`@graph` with 3 schema nodes)**:
  - Lines 58-145:
    ```html
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "https://surllantas.com.bo/#website",
          "url": "https://surllantas.com.bo/",
          "name": "Sur Llantas Tarija",
          "publisher": {
            "@id": "https://surllantas.com.bo/#organization"
          }
        },
        {
          "@type": "WebPage",
          "@id": "https://surllantas.com.bo/#webpage",
          "url": "https://surllantas.com.bo/",
          "name": "Sur Llantas | Venta de Llantas en Tarija desde 2001",
          "isPartOf": {
            "@id": "https://surllantas.com.bo/#website"
          },
          "about": {
            "@id": "https://surllantas.com.bo/#organization"
          },
          "description": "Sur Llantas en Tarija, Bolivia. Más de 25 años dedicados exclusivamente a la venta e importación de llantas para autos, camionetas 4x4, camiones (marca Roadone) y maquinaria.",
          "primaryImageOfPage": {
            "@type": "ImageObject",
            "@id": "https://surllantas.com.bo/#primaryimage",
            "url": "https://surllantas.com.bo/assets/img/og-surllantas.jpg",
            "contentUrl": "https://surllantas.com.bo/assets/img/og-surllantas.jpg",
            "width": 640,
            "height": 640,
            "caption": "Sur Llantas Tarija - Logotipo e Identidad Oficial"
          }
        },
        {
          "@type": "AutoPartsStore",
          "@id": "https://surllantas.com.bo/#organization",
          "name": "Sur Llantas",
          "image": {
            "@id": "https://surllantas.com.bo/#primaryimage"
          },
          "logo": {
            "@type": "ImageObject",
            "url": "https://surllantas.com.bo/assets/img/logo-sur-llantas.png",
            "width": 600,
            "height": 180
          },
          "description": "Sur Llantas en Tarija, Bolivia. Más de 25 años dedicados exclusivamente a la venta e importación de llantas para autos, camionetas 4x4, camiones (marca Roadone) y maquinaria.",
          "url": "https://surllantas.com.bo",
          "telephone": ["+591 72960725", "+591 68687118"],
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Av. Froilán Tejerina esquina Regimiento Campos",
            "addressLocality": "Tarija",
            "addressRegion": "Tarija",
            "addressCountry": "BO"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": -21.5121685,
            "longitude": -64.7354856
          },
          "hasMap": "https://www.google.com/maps/place/Sur+Llantas/@-21.5121919,-64.7356868,21z/data=!4m6!3m5!1s0x94064932cfb70e77:0x7c5b359980b01ece!8m2!3d-21.5121685!4d-64.7354856!16s%2Fg%2F11pyr9pqn7",
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              "opens": "08:00",
              "closes": "12:40"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              "opens": "13:30",
              "closes": "20:00"
            }
          ],
          "priceRange": "$$",
          "sameAs": [
            "https://www.facebook.com/profile.php?id=100077579211868",
            "https://www.tiktok.com/@surllantas.tarija"
          ]
        }
      ]
    }
    </script>
    ```

- **Vercel Web Analytics & Speed Insights**:
  - Lines 148-155:
    ```html
    <script>
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/insights/script.js"></script>
    <script>
      window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/speed-insights/script.js"></script>
    ```
  - Line 156: `</head>`

### 1.2 Hero Section DOM & CSS Architecture
In `web/index.html` lines 193 to 239:
```html
  <!-- HERO SECTION -->
  <section class="hero">
    <div class="hero__overlay"></div>
    <div class="container hero__content reveal">
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
          ...
        </a>
        <a href="#categorias" class="btn btn--outline-white btn--lg">
          Ver Tipos de Vehículo
        </a>
      </div>

      <div class="hero__features">
        <div class="hero-feat">...</div>
        <div class="hero-feat">...</div>
        <div class="hero-feat">...</div>
      </div>
    </div>
  </section>
```

In `web/assets/css/styles.css` lines 526 to 565:
- `.hero`:
  ```css
  position: relative;
  min-height: 90vh;
  padding-top: calc(var(--nav-height) + 3rem);
  padding-bottom: 5rem;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(11, 17, 32, 0.94) 0%, rgba(15, 23, 42, 0.88) 100%),
              radial-gradient(circle at 85% 30%, rgba(211, 47, 47, 0.2) 0%, transparent 55%),
              url('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1600&auto=format&fit=crop') center/cover no-repeat;
  color: var(--text-white);
  overflow: hidden;
  ```
- `.hero__overlay` (lines 551-558):
  ```css
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(18, 18, 18, 0.92) 0%, rgba(31, 31, 31, 0.75) 100%);
  ```
- `.hero__content` (lines 560-564):
  ```css
  position: relative;
  z-index: 2;
  max-width: 820px;
  ```

### 1.3 Surrounding Layout & Global Stacking Context
- `.navbar` (line 321): `position: fixed; top: 0; left: 0; width: 100%; height: var(--nav-height); z-index: 1000;`
- `.mobile-menu` (line 463): `z-index: 999;`
- `.mobile-menu__overlay` (line 485): `z-index: 998;`
- `.wa-floating-wrapper` (line 2250): `position: fixed; z-index: 1000;`
- `.section-quote-bar` (line 633): `position: relative; z-index: 15; margin-top: -3.5rem; margin-bottom: 2rem;`
- Execution of `Select-String -Path web\*.html -Pattern "class=.*hero"` confirmed that `.hero` exists **only** in `web/index.html`. In contrast, `web/nosotros.html` (line 138) and `web/contacto.html` (line 137) use `.page-header` (defined at `styles.css:1712`).

### 1.4 Content Security Policy in `web/vercel.json` (Line 35)
Inspection of `web/vercel.json` line 35 reveals:
```json
"value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; frame-src 'self' https://maps.google.com https://www.google.com; connect-src 'self' https:; media-src 'self'; object-src 'none'; base-uri 'self';"
```
Crucially, `script-src` only contains `'self' 'unsafe-inline'`. It does **not** allow external CDN script origins such as `https://cdnjs.cloudflare.com` or `https://cdn.jsdelivr.net`.

---

## 2. Logic Chain

1. **Premise 1 (Zero-Regression Constraint)**:
   - Observation 1.1 records 156 lines in `<head>` featuring SEO descriptions, OpenGraph meta, Google Fonts, JSON-LD schema with exact business coordinates (`-21.5121685, -64.7354856`) and phone numbers, and Vercel Analytics snippets (`/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js`).
   - Any accidental deletion, reordering, or alteration of these tags would damage search rankings, social preview cards in WhatsApp, and analytics tracking on Vercel production.
   - Therefore, all 156 lines of `<head>` must remain completely preserved with zero regression.

2. **Premise 2 (Canvas Placement & Stacking Order)**:
   - In `web/index.html:194-196`, `.hero` has `position: relative; overflow: hidden;` forming an isolated stacking context.
   - Inside `.hero`, `.hero__overlay` is `position: absolute; top:0; left:0; width:100%; height:100%` (natural stacking index 0).
   - `.hero__content` has `position: relative; z-index: 2`.
   - If `<canvas id='atmospheric-overlay'>` is placed between `.hero__overlay` and `.hero__content`, assigned `position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none;`, the canvas:
     - Will render on top of the dark backdrop, allowing dust & asphalt particle visibility.
     - Will sit beneath `.hero__content` (`z-index: 2`), ensuring text sharpness and WCAG contrast.
     - `pointer-events: none` guarantees that cursor hover, clicks on the WhatsApp button (`.btn--primary`), and "Ver Tipos de Vehículo" button never register on the canvas, preventing interaction blocking.

3. **Premise 3 (Performance SLA: LCP < 1.4s & Sustained 60 FPS)**:
   - In the cinematic transformation, the Roadone HD55 tire (`web/assets/img/productos/roadone-hd55-frente.webp`, 106KB) is introduced into the hero scroll sequence.
   - Under standard browser loading, local WebP images discovered late by JavaScript or CSS trigger layout and render delays that risk exceeding the 1.4s LCP threshold.
   - Adding `<link rel="preload" as="image" href="assets/img/productos/roadone-hd55-frente.webp" type="image/webp">` to `<head>` forces the browser to fetch the asset during the initial HTML parse, ensuring immediate availability.
   - Setting explicit aspect ratio and fixed dimensional bounds prevents Cumulative Layout Shift (CLS = 0).
   - Scaling canvas resolution by `Math.min(window.devicePixelRatio, 2)` prevents 3x/4x mobile super-sampling overhead, preserving sustained 60 FPS GPU execution.

4. **Premise 4 (CSP Policy Constraint for GSAP CDN)**:
   - Requirement R2 mandates loading GSAP and ScrollTrigger via public CDN.
   - Observation 1.4 proves that `web/vercel.json` enforces `Content-Security-Policy: ... script-src 'self' 'unsafe-inline';`.
   - Loading `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js">` without updating `web/vercel.json` will result in a hard browser console error (`Refused to load the script ... because it violates the following Content Security Policy directive...`) on Vercel deployments.
   - Therefore, `web/vercel.json` must be updated to include `https://cdnjs.cloudflare.com` (or the chosen CDN) in `script-src`, or alternatively vendor the GSAP libraries locally in `web/assets/js/vendor/`.

5. **Premise 5 (Reduced Motion & Accessibility)**:
   - Observation 1.3 confirmed that `prefers-reduced-motion` media queries do not currently exist in `styles.css`.
   - To satisfy R1, R2, and R4, CSS and JS must actively detect `@media (prefers-reduced-motion: reduce)`:
     - Canvas particle simulation must invoke `cancelAnimationFrame` and set `display: none` or stop drawing.
     - ScrollTrigger camera morphing must fall back to clean static typography and standard product imagery without perspective distortion.

6. **Premise 6 (Page Isolation)**:
   - Observation 1.3 confirmed that `.hero` is only present on `index.html`. `nosotros.html` and `contacto.html` rely on `.page-header`.
   - Modifying `.hero` styles or injecting `#atmospheric-overlay` carries 0% risk of styling regressions on secondary pages.

---

## 3. Caveats

1. **Vercel Analytics Offline Behavior**:
   - The scripts `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js` will return 404 when tested on a local `python -m http.server 5000` test server. This is normal and expected; these endpoints are automatically injected only when deployed on Vercel infrastructure.
2. **Third-Party CDN vs CSP**:
   - If security rules prohibit modifying `web/vercel.json`, GSAP (`gsap.min.js` and `ScrollTrigger.min.js`) can be served locally from `web/assets/js/vendor/gsap.min.js` which inherently complies with `script-src 'self'`.
3. **Negative Margin on Quote Bar**:
   - `.section-quote-bar` has `margin-top: -3.5rem` and `z-index: 15`. Any bottom padding or pin spacer applied by GSAP ScrollTrigger to `.hero` must account for this 3.5rem overlap to prevent visual snapping during Phase 04.

---

## 4. Conclusion

### Summary Assessment
`web/index.html` has a clean, well-structured architecture that is ready for the cinematic transformation. The exact insertion point for `<canvas id='atmospheric-overlay'>` is between lines 195 and 196. All 156 lines of `<head>` are identified and marked for zero-regression preservation.

### Actionable Directives for Implementation
1. **DOM Insertion Point**:
   Insert the canvas immediately following line 195 in `web/index.html`:
   ```html
   <section class="hero">
     <div class="hero__overlay"></div>
     <canvas id="atmospheric-overlay"></canvas>
     <div class="container hero__content reveal">
   ```
2. **Canvas CSS Specification**:
   Add to `web/assets/css/styles.css`:
   ```css
   #atmospheric-overlay {
     position: absolute;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     pointer-events: none;
     z-index: 1;
   }

   @media (prefers-reduced-motion: reduce) {
     #atmospheric-overlay {
       display: none !important;
     }
   }
   ```
3. **Head Preservation & Preloading**:
   - Retain all 156 lines in `<head>` verbatim.
   - Insert `<link rel="preload" as="image" href="assets/img/productos/roadone-hd55-frente.webp" type="image/webp">` right after line 51 to safeguard LCP < 1.4s.
4. **CSP Adjustment in `web/vercel.json`**:
   Update line 35 `script-src`:
   `script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;`
5. **Script Loading Sequence**:
   Place GSAP and ScrollTrigger script tags at the bottom of `web/index.html`, immediately preceding `<script src="assets/js/main.js?v=2.3"></script>` (line 874).

---

## 5. Verification Method

To independently verify all findings and validate future changes against zero regression:

1. **Verify Head Tag Preservation**:
   Run the following PowerShell command to confirm all critical head tags remain intact:
   ```powershell
   Get-Content web/index.html | Select-String -Pattern "title|og:site_name|og:image|twitter:card|ld\+json|_vercel/insights"
   ```
   *Expected Result*: Must output matches for all 6 critical tag types without omissions.

2. **Verify Hero DOM Insertion & Stacking**:
   Run:
   ```powershell
   Get-Content web/index.html | Select-String -Pattern "atmospheric-overlay" -Context 2,2
   ```
   *Expected Result*: Must display `<canvas id="atmospheric-overlay"></canvas>` directly between `<div class="hero__overlay"></div>` and `<div class="container hero__content reveal">`.

3. **Verify CSP in `vercel.json`**:
   Run:
   ```powershell
   Get-Content web/vercel.json | Select-String -Pattern "script-src"
   ```
   *Expected Result*: Confirms whether CDN domains or local policies are aligned.

4. **Invalidation Conditions**:
   The findings in this report become invalidated if:
   - `<section class="hero">` is removed or renamed.
   - `.hero__content` z-index is reduced below 1 or changed from relative positioning.
   - Vercel Analytics scripts or JSON-LD schema blocks are truncated or deleted.
