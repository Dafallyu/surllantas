# Task Assignment: Milestone 3 Implementation Worker (Catalog Cards Spotlight Glow - Features F13, F14, F15)

## Objective
Implement Milestone 3: Catalog Cards with Spotlight Glow in `web/assets/css/styles.css`, `web/assets/js/main.js`, and `web/index.html`.
Fulfill all requirements for:
- Feature F13: Cursor coordinates tracking (`--mouse-x`, `--mouse-y`) with rAF batching and smooth fade-out.
- Feature F14: Luxury dark automotive cards (`#0B0F17`, `#0066FF`, `#D32F2F`), masked perimeter border spotlight glow using dual linear gradients, and high contrast typography.
- Feature F15: Mobile touch fallback, `@media (hover: none)` / `@media (pointer: coarse)` / `@media (prefers-reduced-motion: reduce)`, WCAG 2.4.7 focus-visible rings, WCAG 2.5.5 touch target size (>=44px), and native non-blocking scrolling (`touch-action: pan-y`).

## Strict Constraints
1. **DO NOT CHEAT**:
   > DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
2. **Head Section Invariance**: Lines 1–156 of `web/index.html` are strictly inviolable. DO NOT alter them.
3. **Owned Files**:
   - `web/assets/css/styles.css`
   - `web/assets/js/main.js`
   - `web/index.html` (only below line 480 for `.category-card` markup)

## Input Specifications & Blueprints
Read the explorer handoff reports:
- `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m3_1\handoff.md` (JavaScript Cursor Tracking Blueprint)
- `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m3_2\handoff.md` (CSS Masked Border & Token Blueprint)
- `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m3_3\handoff.md` (Touch Fallback & Accessibility Blueprint)
- `d:\Proyectos\SurLlantas\.agents\teamwork\ORIGINAL_REQUEST.md`
- `d:\Proyectos\SurLlantas\PROJECT.md`

## Verification Requirements
Worker must run:
1. `node tests/runner.js --milestone=M3` (All 30 M3 tests must pass)
2. `node tests/runner.js` (All 205 tests across Tiers 1-4 must pass)
3. Document exact commands and passing outputs in `handoff.md`.


## 2026-11-04T21:25:16Z
[Message from orchestrator b5141fb4-5e94-47ba-a788-f4766d27cbcb]
You are teamwork_worker assigned to implement Milestone 3 (Catalog Cards with Spotlight Glow — Features F13, F14, F15) for the SurLlantas web portal.
Working directory: d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_worker_m3
Strict Invariance: Lines 1–156 of web/index.html MUST remain untouched and byte-identical.
Owned Files:
1. web/assets/css/styles.css
2. web/assets/js/main.js
3. web/index.html (tabindex="0" on 4 .category-card elements)
Verification:
node tests/runner.js --milestone=M3 (30 tests)
node tests/runner.js (205 tests)
