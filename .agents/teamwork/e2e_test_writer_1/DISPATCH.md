# Dispatch for E2E Test Writer (E2E Testing Track)

- Working Directory: d:\Proyectos\SurLlantas\.agents\teamwork\e2e_test_writer_1
- Original Request: d:\Proyectos\SurLlantas\.agents\teamwork\ORIGINAL_REQUEST.md
- Project Scope: d:\Proyectos\SurLlantas\PROJECT.md
- Project Root: d:\Proyectos\SurLlantas

## Mission
You are the dedicated E2E Test Writer for the SurLlantas web portal cinematic transformation.
Your task is to independently build the complete, automated, opaque-box E2E test suite covering ALL 18 features from `PROJECT.md § Feature Inventory` using the 4-tier methodology:

### Tiers to Implement
1. **Tier 1 - Feature Coverage (≥5 tests per feature)**:
   - Happy-path verification of each feature in isolation (Canvas presence, particles, GSAP load, Phase 1 typography, Phase 2 morph, Phase 3 hotspots, Phase 4 CTA landing, catalog cards, spotlight coords, tokens, etc.).
2. **Tier 2 - Boundary & Corner Cases (≥5 tests per feature)**:
   - Limits and extreme states: mobile viewport <768px throttling, ultra-wide displays, resize mid-animation, rapid mouse velocity bursts, scroll bounds (0%, 25%, 55%, 80%, 100%), rapid scrolling up and down, missing touch coordinates, `prefers-reduced-motion: reduce` activation.
3. **Tier 3 - Cross-Feature Combinations (pairwise coverage)**:
   - Feature interactions: particle canvas running during 4-phase scroll scrubbing; telemetry card open during window resize; spotlight glow hover while scrolling; reduced motion combined with mobile viewport; etc.
4. **Tier 4 - Real-World Application Scenarios (≥5 realistic workloads)**:
   - End-to-end user journeys:
     1. User arrives on desktop, moves mouse across hero (particles react), scrolls through Phase 1-4, clicks Hotspot 1, verifies specs, completes scroll to quote CTA, submits WhatsApp inquiry.
     2. User arrives on mobile (<768px), verifies particle throttling (25 particles), scrolls down to catalog, taps tire card, verifies responsive layout.
     3. User with `prefers-reduced-motion: reduce` navigates site, verifies static hero, accessible specs list, zero canvas overhead, zero layout shifts (CLS=0).
     4. Performance audit run: calculates LCP < 1.4s, CLS = 0, sustained 60 FPS GPU paint metrics.
     5. Infrastructure regression check: validates all 156 lines in `<head>`, OpenGraph meta, JSON-LD @graph schemas, and Vercel Analytics scripts.

### Deliverables
1. Automated test runner and scripts in `d:\Proyectos\SurLlantas\tests\`. (e.g. Node.js or Python Playwright/headless tests or standalone test script executable via PowerShell).
2. `d:\Proyectos\SurLlantas\TEST_INFRA.md` following the template in Project Pattern.
3. `d:\Proyectos\SurLlantas\TEST_READY.md` summarizing test tiers, counts, commands, and feature checklist.
4. Report completion via `send_message`.


## 2026-11-04T19:50:16Z
[Message] sender=b5141fb4-5e94-47ba-a788-f4766d27cbcb priority=MESSAGE_PRIORITY_HIGH
You are teamwork_test_writer assigned to E2E Testing Track (e2e_test_writer_1).
Your working directory is: d:\Proyectos\SurLlantas\.agents\teamwork\e2e_test_writer_1
Read d:\Proyectos\SurLlantas\.agents\teamwork\ORIGINAL_REQUEST.md, d:\Proyectos\SurLlantas\PROJECT.md, and d:\Proyectos\SurLlantas\.agents\teamwork\e2e_test_writer_1\DISPATCH.md before starting.

Your mission:
1. Create d:\Proyectos\SurLlantas\TEST_INFRA.md following the template from Project Pattern.
2. Build the complete, automated, opaque-box E2E test suite in d:\Proyectos\SurLlantas\tests\ covering all features (F1 to F18) across the 4 tiers:
   - Tier 1: Feature Coverage (>=5 tests per feature)
   - Tier 2: Boundary & Corner Cases (>=5 tests per feature)
   - Tier 3: Cross-Feature Combinations (pairwise interactions)
   - Tier 4: Real-World Application Scenarios (>=5 realistic end-to-end scenarios)
   The test scripts can be executed via Node.js or Python (e.g. running a local web server or headless checks) and must provide clear exit codes (0 for pass, non-zero for fail).
3. Create d:\Proyectos\SurLlantas\TEST_READY.md when the test suite is ready with runner commands and coverage summary.
4. Report completion via send_message.
