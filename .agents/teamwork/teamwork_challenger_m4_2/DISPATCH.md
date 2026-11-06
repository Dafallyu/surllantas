# Task Assignment: Milestone 4 Challenger 2 (Performance SLA, Browser Audit & Infrastructure Preservation)

## Assigned Work
Execute Phase 1 & 2 verification for Milestone 4: Performance SLA Compliance (Feature F16), Infrastructure & SEO Preservation (Feature F17), and full E2E acceptance across all 4 tiers.

## Mission
1. **Performance SLA Audit (Feature F16)**:
   - Verify GPU-accelerated rendering and frame budgeting (sustained 60 FPS).
   - Verify LCP optimization (hero image preloads, particle engine deferred execution, LCP < 1.4s).
   - Verify CLS = 0 (layout stability, fixed dimensional reservations, zero content jumping on scroll).
2. **Infrastructure & SEO Invariance (Feature F17)**:
   - Run byte-level git diff analysis on `web/index.html`.
   - Verify that lines 1–156 (`<!DOCTYPE html>` through `</head>`) are 100% byte-identical to original codebase.
   - Verify OpenGraph tags, JSON-LD `@graph` schemas (AutoPartsStore / LocalBusiness), canonical URL (`https://surllantas.com.bo`), and Vercel Analytics/Speed Insights scripts remain intact and error-free.
3. **Master Regression Execution**:
   - Run `node tests/runner.js` (verify 205/205 tests pass across Tiers 1-4).
   - Run all adversarial harnesses: `tests/m1_stress_harness.js`, `tests/test_m2_adversarial_perf.js`, `tests/m3_stress_harness.js`.

Deliver your empirical verification report and final verdict in:
`d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_challenger_m4_2\handoff.md`


## 2026-11-04T21:48:33Z
You are teamwork_challenger assigned to execute Milestone 4 Phase 1 & 2: Performance SLA, Browser Telemetry & Infrastructure Preservation Audit.
Your working directory is:
d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_challenger_m4_2

Read your assignment in:
d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_challenger_m4_2\DISPATCH.md
And read:
- d:\Proyectos\SurLlantas\.agents\teamwork\ORIGINAL_REQUEST.md
- d:\Proyectos\SurLlantas\PROJECT.md
- d:\Proyectos\SurLlantas\TEST_READY.md

Conduct empirical audits for:
1. Performance SLA (sustained 60 FPS GPU rendering, LCP < 1.4s, CLS = 0).
2. Infrastructure & SEO Invariance (git diff byte-level proof that lines 1-156 of web/index.html are untouched).
3. Master test suite execution: node tests/runner.js (all 205 tests pass).
4. Full regression of all adversarial stress harnesses (tests/m1_stress_harness.js, tests/test_m2_adversarial_perf.js, tests/m3_stress_harness.js).
Deliver your empirical audit report and final verdict in:
d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_challenger_m4_2\handoff.md
Notify the orchestrator via send_message when complete.
