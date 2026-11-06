# Dispatch for Milestone 1 Worker

- Working Directory: d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_worker_m1
- Original Request: d:\Proyectos\SurLlantas\.agents\teamwork\ORIGINAL_REQUEST.md
- Project Scope: d:\Proyectos\SurLlantas\PROJECT.md
- Explorer Blueprints:
  - d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m1_1\handoff.md
  - d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m1_2\handoff.md
  - d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m1_3\handoff.md

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Milestone 1 Objectives (Features F1, F2, F3, F4)
1. **DOM (`web/index.html`)**:
   Insert `<canvas id="atmospheric-overlay" class="atmospheric-overlay" aria-hidden="true"></canvas>` directly between `<div class="hero__overlay"></div>` and `<div class="container hero__content reveal">` in `.hero`.
   Strictly preserve all 156 lines of `<head>` and existing markup!
2. **CSS (`web/assets/css/styles.css`)**:
   Add styles for `#atmospheric-overlay`:
   - `position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; will-change: transform;`
   - `@media (prefers-reduced-motion: reduce) { #atmospheric-overlay { display: none !important; } }`
3. **JavaScript (`web/assets/js/main.js`)**:
   Implement `AtmosphericParticleEngine` following the exact mathematical and zero-GC architecture from Explorer 2 and Explorer 3 reports:
   - High-DPI scaling with `Math.min(window.devicePixelRatio || 1, 2)`.
   - Dual particle types: 70% micro-dust (amber `#F5B301` / slate `#94A3B8`) and 30% asphalt sparks (electric blue `#0066FF` / red `#DC2626`).
   - Pseudo-3D depth factor $z \in [0.3, 1.0]$.
   - Mouse velocity smoothing with factor 0.08, influence radius $R=140\text{px}$, dual force composition (radial push $0.6$ + wake $0.04$), viscous damping $0.94$.
   - Window scroll delta tracking applying upward parallax impulse $-0.035 \times \Delta\text{scroll} \times z$.
   - Boundary wrap with anti-clumping random X.
   - Dynamic mobile throttling (<768px: 25 particles, desktop: 70 particles) without GC thrashing.
   - `IntersectionObserver` on `.hero` with `document.visibilityState`: pauses RAF when scrolled out of view, resumes when entering.
   - `prefers-reduced-motion: reduce` detection skipping RAF and hiding canvas.
4. **Verification**:
   Execute build and test verification commands in `web/` and record exact outputs and evidence in `handoff.md`.

## 2026-11-04T19:55:57Z
You are teamwork_worker assigned to Milestone 1 (M1: Atmospheric Hero Canvas Overlay).
Your working directory is: d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_worker_m1
Read d:\Proyectos\SurLlantas\.agents\teamwork\ORIGINAL_REQUEST.md, d:\Proyectos\SurLlantas\PROJECT.md, and d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_worker_m1\DISPATCH.md before starting.

Read the detailed blueprints from the M1 Explorers:
- d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m1_1\handoff.md
- d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m1_2\handoff.md
- d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m1_3\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Exclusively Owned Files:
- web/index.html (insert canvas in hero, preserve all 156 lines in head!)
- web/assets/css/styles.css (add #atmospheric-overlay styles and reduced motion media query)
- web/assets/js/main.js (implement AtmosphericParticleEngine and initAtmosphericOverlay)

Implement all requirements for Features F1, F2, F3, F4.
Run build/verification tests to confirm DOM insertion, styles, particle physics, throttling, and reduced-motion behavior.
Record all commands, results, and evidence in handoff.md in your working directory.
Report completion via send_message when done.
