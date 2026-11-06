# DISPATCH — Worker M2: 4-Phase Progressive Scroll Animation Engine (Features F5 to F12)

**Timestamp**: 2026-11-04T20:30:00Z  
**Role**: `teamwork_worker`  
**Milestone**: Milestone 2 — 4-Phase Progressive Scroll Animation Engine (R2: Features F5 to F12)  
**Assigned Agent Directory**: `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_worker_m2`  
**Original Request Document**: `d:\Proyectos\SurLlantas\.agents\teamwork\ORIGINAL_REQUEST.md` (READ THIS FIRST)  
**Project Scope Document**: `d:\Proyectos\SurLlantas\PROJECT.md`  

---

## MANDATORY INTEGRITY WARNING
> DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

---

## 1. Objective
Implement the complete 4-Phase Progressive Scroll Animation Engine for the SurLlantas web portal, seamlessly integrated into `web/index.html`, `web/assets/css/styles.css`, and `web/assets/js/main.js`, with updated CSP in `web/vercel.json`, and optimized transparent RGBA WebP tire assets.

All 80 Milestone 2 tests must pass:
```powershell
node tests/runner.js --milestone=M2
```
And total automated test suite must achieve 205/205 passing tests (`node tests/runner.js`).

---

## 2. Input Artifacts (Exhaustive Blueprints from M2 Explorers)
Read and follow the blueprints in:
1. `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m2_1\handoff.md` (GSAP CDN, CSP, pinned stage architecture, Phase 1 typographic awakening `blur(14px) -> blur(0px)`)
2. `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m2_2\handoff.md` (Roadone HD55 dual-WebP perspective morph, contact shadow affine matrix deformation, Python asset unmatting)
3. `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m2_3\handoff.md` (Design tokens `#0B0F17`, `#0066FF`, `#D32F2F`, 3 SVG telemetry hotspots, dark glassmorphic cards `rgba(11,15,23,0.82)` with `blur(16px)`, Phase 4 WhatsApp quote CTA landing dock, and complete reduced motion fallback)

---

## 3. Files You Exclusively Own
- `web/vercel.json`: Update line 35 `script-src` to include `https://cdnjs.cloudflare.com https://cdn.jsdelivr.net;`
- `web/index.html`: Lines 157 through 876.
  - **CRITICAL INVIOLABLE CONSTRAINT**: NEVER modify or truncate lines 1 to 156 of `<head>`. They contain production SEO meta, OpenGraph tags, JSON-LD schemas, and Vercel Analytics scripts.
  - Keep literal `class="hero"` on `<section class="hero">` (checked by `f01_canvas_overlay.test.js`). Wrap with `<div class="cinematic-hero-stage" id="heroStage">`.
  - Add GSAP 3.12.5 and ScrollTrigger scripts at the bottom of `<body>` before `assets/js/main.js`.
  - Add pinned viewport, typography container, tire stage (`#cinematicTireStage`), contact shadow (`#tireContactShadow`), 3D perspective wrapper (`#tire3DWrapper`), dual-WebP images (`#tireImgFrente`, `#tireImg45`), and 3 SVG telemetry hotspots (`#hotspot-tread`, `#hotspot-casing`, `#hotspot-efficiency`) with glassmorphic cards.
- `web/assets/css/styles.css`: Declare `:root` tokens (`--color-automotive-dark: #0B0F17;`, `--color-electric-blue: #0066FF;`, `--color-brand-red: #D32F2F;`), 350vh virtual track, pinned viewport, 3D perspective, matrix contact shadow styles, glassmorphic cards (`blur(16px)`), and comprehensive `@media (prefers-reduced-motion: reduce)` fallback.
- `web/assets/js/main.js`: Implement `initCinematicScrollEngine()` with master GSAP timeline, Phase 1 typographic awakening, Phase 2 dual-WebP cross-fade and shadow matrix interpolation, Phase 3 telemetry controller, Phase 4 quote pre-fill and docking, and reduced-motion guard. Expose `window.cinematicTimeline`.
- `web/assets/img/productos/roadone-hd55-frente.webp` & `web/assets/img/productos/roadone-hd55-45.webp`: Run the Python unmatting script provided in `teamwork_explorer_m2_2/handoff.md` to remove white background and baked shadow, generating transparent RGBA WebP (<110 KB).

---

## 4. Verification Requirements
Worker must run:
1. `node tests/runner.js --milestone=M2` -> ALL 80 tests must pass.
2. `node tests/runner.js` -> ALL 205 tests must pass.
3. Verify lines 1-156 of `web/index.html` are intact.

Write `handoff.md` in `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_worker_m2\` when done with commands, logs, and layout verification.

## 2026-11-04T20:40:26Z
[Message from b5141fb4-5e94-47ba-a788-f4766d27cbcb]:
Checking in on progress as safety timer elapsed. Noted progress.md was visited at 20:36:00Z.
Action: Please provide a brief update on your current step and estimated completion.
