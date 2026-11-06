# Dispatch for Milestone 2 Explorer 1 (GSAP CDN/CSP & Phase 01 Awakening)

- Working Directory: d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m2_1
- Original Request: d:\Proyectos\SurLlantas\.agents\teamwork\ORIGINAL_REQUEST.md
- Project Scope: d:\Proyectos\SurLlantas\PROJECT.md
- E2E Test Suite Reference: d:\Proyectos\SurLlantas\TEST_READY.md and `tests/tier1/f05_cdn_csp.test.js`, `tests/tier1/f06_phase1_awakening.test.js`

## Mission
Analyze exact implementation strategy for Features F5 & F6 in Milestone 2:
1. **CDN & CSP Integration (F5)**:
   - Identify script tags for GSAP 3.12.5 and ScrollTrigger via public CDN (`cdnjs.cloudflare.com` / `cdn.jsdelivr.net`) to place in `web/index.html` right before `assets/js/main.js`.
   - Formulate exact update to `web/vercel.json` line 35 to expand `script-src` from `'self' 'unsafe-inline'` to include the CDN origins without breaking existing CSP rules.
2. **Pinned Stage Architecture (F5 & F6)**:
   - Formulate DOM container structure for `.cinematic-hero-stage` (350vh virtual scroll height) and pinned `.cinematic-viewport` (100vh sticky/fixed).
   - Ensure the hero content (H1, badge, subtitle, actions) transitions smoothly.
3. **Phase 01 Typographic Awakening (F6)**:
   - Scroll 0% to 25%: `filter: blur(14px) -> blur(0px)`, `opacity: 0 -> 1`, `transform: translateY(30px) scale(1.06) -> translateY(0) scale(1.0)` via GSAP ScrollTrigger timeline.
   - At 18%-25%: subtle shift/fade to yield focus to the incoming tire.
4. Document the exact blueprint and instructions for the Worker in `handoff.md`.

## 2026-11-04T20:18:53Z
You are teamwork_explorer assigned to Milestone 2 Explorer 1 (GSAP CDN/CSP & Phase 01 Awakening).
Your working directory is: d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m2_1
Read d:\Proyectos\SurLlantas\.agents\teamwork\ORIGINAL_REQUEST.md, d:\Proyectos\SurLlantas\PROJECT.md, and d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_explorer_m2_1\DISPATCH.md before starting.
Also check d:\Proyectos\SurLlantas\TEST_READY.md and `tests/tier1/f05_cdn_csp.test.js`, `tests/tier1/f06_phase1_awakening.test.js`.

Analyze exact implementation strategy for Features F5 & F6 in Milestone 2:
1. CDN scripts for GSAP 3.12.5 and ScrollTrigger in `web/index.html` and CSP update in `web/vercel.json` line 35.
2. Pinned stage architecture (`.cinematic-hero-stage`, 350vh virtual track, 100vh pinned viewport).
3. Phase 01 typographic awakening (`blur(14px) -> blur(0px)`, scale, opacity).
Write comprehensive implementation blueprint in handoff.md and notify via send_message.
