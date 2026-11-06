# DISPATCH — Milestone 3 Explorer 1: Spotlight Cursor Tracking (Feature F13)

**Timestamp**: 2026-11-04T21:16:00Z  
**Role**: `teamwork_explorer`  
**Milestone**: Milestone 3 — Catalog Cards with Spotlight Glow (Feature F13)  
**Assigned Directory**: `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m3_1`  
**Original Request Document**: `d:\Proyectos\SurLlantas\.agents\teamwork\ORIGINAL_REQUEST.md` (READ FIRST)  
**Project Scope Document**: `d:\Proyectos\SurLlantas\PROJECT.md`  

---

## 1. Objective
Investigate and design the cursor-tracking JavaScript implementation for Feature F13:
1. Examine `web/index.html` lines 476–565 containing the 4 `.category-card` elements in `#categorias`.
2. Examine `tests/tier1/f13_catalog_spotlight_coords.test.js` and `tests/tier2/f13_spotlight_coords_boundary.test.js`.
3. Design `initCatalogSpotlightGlow()` in `web/assets/js/main.js`:
   - `pointermove` event listener updating `--mouse-x` and `--mouse-y` with integer pixel coordinates (`clientX - rect.left`, `clientY - rect.top`).
   - Smooth `pointerleave` coordinate reset.
   - Independent coordinate frames across all cards without cross-talk.
   - Non-blocking composite-only style updates.

---

## 2. Output Requirements
Write `handoff.md` in `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m3_1\` with:
- Concrete JavaScript blueprint for `initCatalogSpotlightGlow()`.
- Verification methods and test evidence.
Notify orchestrator via `send_message`.


## 2026-11-04T21:16:30Z
Read your dispatch instructions in d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m3_1\DISPATCH.md.
Read d:\Proyectos\SurLlantas\.agents\teamwork\ORIGINAL_REQUEST.md.
Read d:\Proyectos\SurLlantas\PROJECT.md.

Investigate and design cursor-tracking JavaScript implementation for Feature F13:
- Inspect `web/index.html` lines 476–565 for `.category-card` elements.
- Inspect `tests/tier1/f13_catalog_spotlight_coords.test.js` and `tests/tier2/f13_spotlight_coords_boundary.test.js`.
- Design `initCatalogSpotlightGlow()` in `web/assets/js/main.js`:
  * Updates `--mouse-x` and `--mouse-y` with integer pixel coordinates (`clientX - rect.left`, `clientY - rect.top`).
  * Smooth `pointerleave` coordinate reset.
  * Independent coordinate frames across all cards without cross-talk.
  * Non-blocking composite-only style updates.

Write comprehensive handoff.md in `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m3_1\` and notify orchestrator via send_message.


## 2026-11-04T21:22:20Z
**Context**: Milestone 3 Cursor Tracking Exploration (Feature F13)
**Content**: Checking in on progress as safety timer elapsed.
**Action**: Please report status and estimated time to deliver handoff.md.
