# Dispatch for Milestone 2 Explorer 2 (Roadone HD55 Morph & Shadow Matrix)

- Working Directory: d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m2_2
- Original Request: d:\Proyectos\SurLlantas\.agents\teamwork\ORIGINAL_REQUEST.md
- Project Scope: d:\Proyectos\SurLlantas\PROJECT.md
- Survey Reports: `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_survey_2\handoff.md`
- E2E Test Suite Reference: d:\Proyectos\SurLlantas\TEST_READY.md and `tests/tier1/f07_phase2_morph.test.js`, `tests/tier1/f08_phase2_shadow.test.js`

## Mission
Analyze exact implementation strategy for Features F7 & F8 in Milestone 2:
1. **Tire Asset Integration on Dark Background**:
   - Both `web/assets/img/productos/roadone-hd55-frente.webp` and `roadone-hd55-45.webp` are 1000x1000 px RGB WebP with solid white background (`#FFFFFF`).
   - Formulate clean CSS blending (`mix-blend-mode: multiply` on light/neutral container or unmatting or canvas draw/chroma) so the tire renders seamlessly over the luxury dark stage `#0B0F17`.
2. **Phase 02 Roadone HD55 Perspective Morph (F7)**:
   - Viewport scroll 25% to 55%: GSAP ScrollTrigger timeline cross-fades `frente` (`opacity: 1 -> 0`) and `45` (`opacity: 0 -> 1`), while rotating `.tire-stage` in 3D (`perspective: 1200px; transform: rotateY(-18deg) rotateX(3deg) scale(1.05)`).
3. **Contact Shadow Mathematical Matrix Deformation (F8)**:
   - Ground contact shadow element beneath tire base.
   - Deforms mathematically from base frontal ellipse `matrix(1.0, 0, 0, 0.26, 0, 0)` to sheared 45° perspective `matrix(1.18, 0.14, -0.22, 0.36, 16, 8)` matching the tire's shifting weight distribution and viewing angle.
4. Document the exact blueprint and instructions for the Worker in `handoff.md`.

## 2026-11-04T20:19:01Z
You are teamwork_explorer assigned to Milestone 2 Explorer 2 (Roadone HD55 Morph & Shadow Matrix).
Your working directory is: d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m2_2
Read d:\Proyectos\SurLlantas\.agents\teamwork\ORIGINAL_REQUEST.md, d:\Proyectos\SurLlantas\PROJECT.md, and d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m2_2\DISPATCH.md before starting.
Also check d:\Proyectos\SurLlantas\TEST_READY.md and `tests/tier1/f07_phase2_morph.test.js`, `tests/tier1/f08_phase2_shadow.test.js`.

Analyze exact implementation strategy for Features F7 & F8 in Milestone 2:
1. Tire asset integration on luxury dark background `#0B0F17` (clean blending / unmatting).
2. Phase 02 Roadone HD55 perspective morph between `roadone-hd55-frente.webp` and `roadone-hd55-45.webp` (scroll 25% to 55%) with 3D perspective rotation.
3. Contact shadow mathematical affine matrix deformation matching weight and angle.
Write comprehensive implementation blueprint in handoff.md and notify via send_message.
