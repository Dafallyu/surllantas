# DISPATCH LOG

## 2026-11-04T14:12:26Z
Execute the cinematic transformation of the SurLlantas web portal (web/index.html) with an atmospheric canvas, scroll-driven interactive animation engine, telemetry scanning hotspots, interactive catalog cards with spotlight glow, and performance SLA compliance.

Working directory: d:\Proyectos\SurLlantas
Integrity mode: development

## Requirements

### R1. Atmospheric Hero Canvas Overlay
Implement `<canvas id='atmospheric-overlay'>` in the hero section rendering dust and asphalt particles with 60 FPS inertial response to mouse movement and scrolling. On mobile viewports (<768px), automatically reduce particle density to maintain 60 FPS. If `prefers-reduced-motion` is active, disable particle animations.

### R2. 4-Phase Progressive Scroll Animation Engine
Implement a scroll-linked animation engine (using GSAP and ScrollTrigger loaded via public CDN) across four sequential scroll phases:
- Phase 01 (0%-25%): Cinematic awakening featuring inverse blur and smooth typographic entrance.
- Phase 02 (25%-55%): Camera pan to the Roadone HD55 tire, perspective morphing interpolating smoothly between `web/assets/img/productos/roadone-hd55-frente.webp` and `roadone-hd55-45.webp`, with mathematical matrix deformation of the contact shadow.
- Phase 03 (55%-80%): Telemetry and scanning mode with 3 interactive SVG hotspots anchored to the tire ("Banda de rodadura 16.5mm", "Carcasa de acero 4 capas", "Eficiencia de rodadura") opening glassmorphic descriptive cards with dark shadcn tokens.
- Phase 04 (80%-100%): Seamless landing of the tire into the express WhatsApp quote CTA.
When `prefers-reduced-motion` is active, replace scroll-tied camera/perspective transformations with clean, accessible static states.

### R3. Catalog Cards with Spotlight Glow
Upgrade catalog cards with reactive radial gradient 'Spotlight Glow' borders guided by coordinates (`--mouse-x`, `--mouse-y`) and luxury dark automotive shadcn tokens (#0B0F17, electric blue #0066FF, red #D32F2F).

### R4. Performance, Accessibility, and Infrastructure Preservation SLA
Ensure sustained 60 FPS GPU-accelerated rendering, LCP < 1.4s, and CLS = 0. Support `prefers-reduced-motion` across all interactive and animated components. Strictly preserve existing SEO meta tags, OpenGraph metadata, JSON-LD structured data schemas, and Vercel Analytics scripts without breakage or regressions.

## Acceptance Criteria

### Hero Canvas & Particles
- [ ] `<canvas id='atmospheric-overlay'>` is present in the hero section of `web/index.html` and executes particle physics at 60 FPS.
- [ ] Particles react with inertia to mouse movement and scroll events on desktop.
- [ ] Particle count is throttled on mobile viewports (<768px) and inactive when `prefers-reduced-motion` matches.

### Scroll Animation Engine (Phases 1-4)
- [ ] GSAP and ScrollTrigger load successfully from public CDN in `web/index.html`.
- [ ] Phase 01: Viewport scroll 0%-25% transitions blur and typography smoothly without layout shifts.
- [ ] Phase 02: Viewport scroll 25%-55% pans to Roadone HD55 and morphs perspective between `roadone-hd55-frente.webp` and `roadone-hd55-45.webp` with matrix contact shadow deformation.
- [ ] Phase 03: Viewport scroll 55%-80% displays 3 interactive SVG telemetry hotspots anchored to the tire, toggling glassmorphic data cards with dark tokens.
- [ ] Phase 04: Viewport scroll 80%-100% lands the tire into the WhatsApp quote CTA without visual snapping.

### Catalog Spotlight Glow
- [ ] Catalog cards update radial gradient position dynamically following `--mouse-x` and `--mouse-y` cursor coordinates on hover.
- [ ] Visual styling conforms to palette tokens: #0B0F17, #0066FF, #D32F2F.

### SLA & Regression Prevention
- [ ] Browser performance audit verifies LCP < 1.4s and CLS = 0.
- [ ] All animations gracefully fall back to static layouts when `prefers-reduced-motion: reduce` is enabled.
- [ ] Existing SEO tags, OpenGraph tags, JSON-LD scripts, and Vercel Analytics integration in `web/index.html` remain intact and functional.
