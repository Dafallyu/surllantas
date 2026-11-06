# DISPATCH — Worker M2 Iteration 2: Targeted Remediation of Gate Defects

**Timestamp**: 2026-11-04T21:00:00Z  
**Role**: `teamwork_worker`  
**Milestone**: Milestone 2 Remediation (Iteration 2)  
**Assigned Directory**: `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_worker_m2_iter2`  
**Original Request Document**: `d:\Proyectos\SurLlantas\.agents\teamwork\ORIGINAL_REQUEST.md` (READ FIRST)  
**Project Scope Document**: `d:\Proyectos\SurLlantas\PROJECT.md`  

---

## MANDATORY INTEGRITY WARNING
> DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

---

## 1. Objective
Apply the 4 precise remediations identified by the Milestone 2 Gate Review Council (Reviewer 1, Challenger 1, Challenger 2) across `web/index.html` and `web/assets/js/main.js`. Verify all tests pass, including the adversarial harnesses from both Challengers.

---

## 2. Remediation Tasks

### Fix 1: Correct Corrupted GSAP SRI Digest in `web/index.html` (Challenger 2 Finding)
- **File**: `web/index.html`, line 1043.
- Replace the corrupted SRI hash:
  `integrity="sha512-7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUB46724jg/+AkDpMWb48ZnoG9UidcdSOiqUIFypItVmSBA=="`
  with the correct Cloudflare CDNJS SHA-512 digest:
  `integrity="sha512-7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUBWm67zeAfFC+HrdoE2GanKeocly/VxeLvIqwvCdk7qScg=="`
- CRITICAL: Do NOT alter lines 1 to 156 of `<head>`.

### Fix 2: Prevent Phase 4 Quote Size Pre-fill Clobbering User Edits (Challenger 1 Finding)
- **File**: `web/assets/js/main.js`:
  1. In `TireLandingQuoteBridge.prefillRoadoneTruckQuote()` (line 1021):
     Add `!sizeInput.dataset.userEdited`:
     ```javascript
     if (sizeInput && !sizeInput.dataset.userEdited && (!sizeInput.value || sizeInput.dataset.prefilled === 'true')) {
       sizeInput.value = '315/70 R22.5';
       sizeInput.dataset.prefilled = 'true';
     }
     ```
  2. In the `sizeInput` event listener (around line 254):
     Delete `sizeInput.dataset.prefilled` upon user input:
     ```javascript
     if (sizeInput) {
       sizeInput.addEventListener('input', () => {
         sizeInput.dataset.userEdited = 'true';
         delete sizeInput.dataset.prefilled;
       });
     }
     ```

### Fix 3: Add ScrollTrigger Lifecycle & Re-entrancy Protection (Challenger 2 Finding)
- **File**: `web/assets/js/main.js`:
  In `initCinematicScrollEngine()`:
  1. Clean up previous instances before creating a new timeline:
     ```javascript
     if (window.cinematicTimeline) {
       window.cinematicTimeline.kill();
       window.cinematicTimeline = null;
     }
     if (typeof ScrollTrigger !== 'undefined') {
       const existingSt = ScrollTrigger.getById('cinematic-stage');
       if (existingSt) {
         existingSt.kill();
       }
     }
     ```
  2. Add dynamic `motionQuery.addEventListener('change', ...)` handler:
     ```javascript
     if (motionQuery && !window._motionQueryListenerAttached) {
       window._motionQueryListenerAttached = true;
       motionQuery.addEventListener('change', (e) => {
         if (e.matches) {
           if (window.cinematicTimeline) {
             window.cinematicTimeline.kill();
             window.cinematicTimeline = null;
           }
           const st = ScrollTrigger.getById('cinematic-stage');
           if (st) st.kill();
         } else {
           initCinematicScrollEngine();
         }
       });
     }
     ```

### Fix 4: Optimize Phase 1 Unblur Tween Duration (Reviewer 1 Finding)
- **File**: `web/assets/js/main.js`:
  Around line 1137:
  Update the unblur tween duration to `0.25` so that at midpoint $t = 0.125$ blur is strictly linear at $7.0\text{px}$, and move the typography slide `x: -40, opacity: 0.35` into Phase 2 (e.g. at position `0.25`, duration `0.08`).

---

## 3. Verification Commands
The Worker must execute:
1. `node tests/runner.js` -> 205/205 must pass.
2. `node --test .agents/teamwork/teamwork_challenger_m2_1/test_m2_adversarial_physics.js` -> 18/18 must pass.
3. `node --expose-gc .agents/teamwork/teamwork_challenger_m2_2/test_m2_adversarial_perf.js` -> ALL pass.
4. Verify lines 1-156 of `web/index.html` are intact.

Write `handoff.md` in `d:\Proyectos\SurLlantas\.agents\teamwork\teamwork_worker_m2_iter2\` and notify orchestrator via `send_message`.


## 2026-11-04T21:05:13Z
**Context**: Milestone 2 Remediation (Iteration 2)
**Content**: Checking in on progress of the 4 remediations (GSAP SRI hash, quote edit guard, ScrollTrigger lifecycle cleanup, Phase 1 duration optimization).
**Action**: Please report current status and estimated time to completion.
