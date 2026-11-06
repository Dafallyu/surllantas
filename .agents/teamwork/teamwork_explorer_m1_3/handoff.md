# Handoff Report: Mobile Throttling, Lifecycle Optimization & Reduced Motion (Features F3 & F4)

- **Author**: `teamwork_explorer_m1_3` (Milestone 1 Explorer 3)
- **Target Role**: Upcoming Implementation Worker (Milestone 1)
- **Scope**: Features F3 (Mobile Particle Throttling) & F4 (Reduced Motion & Lifecycle Optimization)
- **Files Investigated**: `web/index.html`, `web/assets/js/main.js`, `web/assets/css/styles.css`, `web/vercel.json`
- **Related Peer Hand-offs**: Explorer 1 (`teamwork_explorer_m1_1`), Explorer 2 (`teamwork_explorer_m1_2`)

---

## 1. Observation

### 1.1 Existing Script Initialization Architecture in `web/assets/js/main.js`
Inspection of `web/assets/js/main.js` (lines 6–16) shows the central entry point:
```javascript
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initStatCounters();
  initFaqAccordion();
  initCatalogFilters();
  initWhatsAppWidget();
  initTireQuoteWidget();
  initRoadoneSlider();
});
```
The script is loaded synchronously at the end of `web/index.html` (line 874):
```html
  <script src="assets/js/main.js?v=2.3"></script>
</body>
</html>
```

### 1.2 Existing IntersectionObserver Patterns in `web/assets/js/main.js`
In `web/assets/js/main.js` (lines 76–95), `IntersectionObserver` is already used for `.reveal`:
```javascript
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}
```
This confirms full native browser support for `IntersectionObserver` in the SurLlantas target runtime environment.

### 1.3 Hero Section DOM Structure & Isolation in `web/index.html`
In `web/index.html` lines 193–214:
```html
  <!-- HERO SECTION -->
  <section class="hero">
    <div class="hero__overlay"></div>
    <div class="container hero__content reveal">
      <div class="badge badge--red hero__badge">...</div>
      <h1 class="heading-xl hero__title">...</h1>
      <p class="hero__subtitle">...</p>
      ...
    </div>
  </section>
```
In `web/assets/css/styles.css` lines 526–538:
```css
.hero {
  position: relative;
  min-height: 90vh;
  padding-top: calc(var(--nav-height) + 3rem);
  padding-bottom: 5rem;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(11, 17, 32, 0.94) 0%, rgba(15, 23, 42, 0.88) 100%),
              radial-gradient(circle at 85% 30%, rgba(211, 47, 47, 0.2) 0%, transparent 55%),
              url('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1600&auto=format&fit=crop') center/cover no-repeat;
  color: var(--text-white);
  overflow: hidden;
}
```
Verification confirmed that `<section class="hero">` exists **only** in `web/index.html`. Pages `nosotros.html` and `contacto.html` use `.page-header`.

### 1.4 Complete Absence of `prefers-reduced-motion` Handling
Direct string inspection across both `web/assets/css/styles.css` and `web/assets/js/main.js` revealed zero occurrences of `prefers-reduced-motion`.
Currently, the site has no motion reduction handling, neither for CSS animations nor for JavaScript loops.

### 1.5 Responsive Breakpoints in `styles.css`
In `web/assets/css/styles.css`:
- Mobile navigation and layouts collapse around standard breakpoints: `max-width: 991px` (desktop to tablet/mobile), `max-width: 768px`, and `max-width: 576px` (e.g. line 2450).
- Feature F3 explicitly defines the mobile boundary at `< 768px`.

---

## 2. Logic Chain

### 2.1 Dynamic Viewport Throttling (F3): 70 vs 25 Particles without GC Thrashing
1. **The Problem of GC Thrashing on Viewport Resize**:
   - In naive implementations, developers re-instantiate or reallocate particle arrays inside a `window.resize` handler (`particles = []; for (...) particles.push(new Particle())`).
   - On mobile devices (iOS Safari, Android Chrome), as the user scrolls, the dynamic browser address bar expands and collapses, triggering repeated `window.resize` events.
   - Allocating 25 to 70 objects per resize event generates heaps of garbage, triggering frequent Generational Garbage Collection runs. This induces noticeable frame drops (jank) and micro-stuttering during page interaction.
2. **The Solution: Pre-Allocated Fixed Pool with Pointer Slicing (`activeCount`)**:
   - Pre-allocate a single fixed array of length `MAX_PARTICLES = 70` once during initialization.
   - Maintain an integer variable: `let activeCount = window.innerWidth < 768 ? 25 : 70;`.
   - The animation render loop iterates strictly from index `0` to `activeCount - 1`:
     ```javascript
     for (let i = 0; i < activeCount; i++) {
       const p = particlePool[i];
       updateParticle(p, dt, width, height, mouse, scrollDelta);
       drawParticle(ctx, p);
     }
     ```
   - When the window resizes:
     - Check if `window.innerWidth` crossed the 768px threshold (`targetCount !== activeCount`).
     - If transitioning **Desktop $\to$ Mobile** (70 $\to$ 25): simply set `activeCount = 25`. Particles `25..69` remain dormant in memory at zero CPU/GPU cost!
     - If transitioning **Mobile $\to$ Desktop** (25 $\to$ 70): set `activeCount = 70`, and re-scatter the waking particles (`i = 25` to `69`) smoothly across the canvas (`resetParticle(particlePool[i], width, height, true)`).
     - **Result: 0 object instantiations, 0 array reallocations, 0 GC thrashing.**
3. **Filtering Mobile Address Bar Scroll Events**:
   - Store `lastWindowWidth = window.innerWidth`.
   - On `resize`, only re-evaluate `updatePoolSize()` if `window.innerWidth !== lastWindowWidth`.
   - Vertical viewport height fluctuations caused by address bar collapse/expand only update canvas buffer height without perturbing the particle pool.

### 2.2 Lifecycle Optimization via `IntersectionObserver` & Page Visibility (0% Overhead)
1. **The Problem of Runaway RAF Loops**:
   - An unconstrained `requestAnimationFrame` loop in `.hero` runs 60 times every second even while the user is far down the page examining catalog tire specs, submitting WhatsApp quotes, or viewing the footer.
   - This causes unnecessary battery consumption, thermal heating, and GPU fill-rate contention with GSAP scroll scrubs.
2. **IntersectionObserver on `.hero` with `threshold: 0`**:
   - Attach an `IntersectionObserver` targeting `.hero` with `threshold: 0`.
   - When the user scrolls past the hero and `.hero` leaves the viewport (`isIntersecting === false`):
     - Immediately invoke `stopLoop()`, executing `cancelAnimationFrame(rafId); rafId = null; isRunning = false;`.
     - CPU and GPU utilization for `#atmospheric-overlay` instantly drops to **0.0%**.
   - When `.hero` re-enters the viewport (`isIntersecting === true`):
     - Immediately invoke `startLoop()`.
3. **Resynchronization Guard on Resume (Preventing Temporal & Velocity Spikes)**:
   - If a user spends 5 minutes in the catalog and scrolls back up to `.hero`, `now - lastTime` would be 300,000 milliseconds! A naive physics step would shoot particles into deep space.
   - Similarly, `window.scrollY - lastScrollY` would report a huge scroll jump.
   - To prevent visual glitches, `startLoop()` must unconditionally reset:
     ```javascript
     lastTime = performance.now();
     lastScrollY = window.scrollY;
     scrollDelta = 0;
     ```
4. **Integration with Document Visibility API**:
   - When the tab is minimized or switched, `document.addEventListener('visibilitychange', ...)` immediately halts the loop (`stopLoop()`). When focused again, it resumes only if `.hero` is currently intersecting.

### 2.3 Reduced Motion Architecture (`prefers-reduced-motion: reduce`)
1. **CSS Contract**:
   - Add to `web/assets/css/styles.css`:
     ```css
     @media (prefers-reduced-motion: reduce) {
       #atmospheric-overlay {
         display: none !important;
       }
     }
     ```
   - Hiding the canvas with `display: none !important;` eliminates it from the browser composite tree and stops all GPU layer rasterization.
2. **JavaScript Contract**:
   - Evaluate `const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');`.
   - Flag: `let isReducedMotion = motionQuery.matches;`.
   - In `startLoop()`, if `isReducedMotion === true`, immediately return.
   - Attach a dynamic change listener:
     ```javascript
     const handleMotionChange = (e) => {
       isReducedMotion = e.matches;
       if (isReducedMotion) {
         stopLoop();
         if (ctx) ctx.clearRect(0, 0, width, height);
       } else if (isHeroVisible && !document.hidden) {
         startLoop();
       }
     };
     if (motionQuery.addEventListener) {
       motionQuery.addEventListener('change', handleMotionChange);
     } else if (motionQuery.addListener) {
       motionQuery.addListener(handleMotionChange); // Safari/WebKit fallback
     }
     ```
   - This provides real-time accessibility compliance without requiring page reload if the user alters system preferences in OS settings or DevTools.

---

## 3. Caveats

1. **Passive Event Listeners**:
   - Window listeners for `scroll` and `resize` must be registered with `{ passive: true }` to guarantee that browser scroll threads are never blocked by canvas physics.
2. **Initial Intersection State**:
   - On page load, `IntersectionObserver` fires asynchronously. To ensure instant particle rendering on page entry (preventing a 100ms blank delay), check `.hero.getBoundingClientRect()` synchronously during initialization: if visible, start loop immediately.
3. **Canvas Cleared on Deactivation**:
   - When reduced motion activates dynamically or canvas pauses, `ctx.clearRect(0, 0, width, height)` must be called so frozen particles do not linger on screen.

---

## 4. Conclusion

### Summary Assessment
Features F3 and F4 are completely formulated with a mathematically sound, allocation-free, zero-GC particle pool and a comprehensive lifecycle state machine.
The upcoming Worker can directly apply the blueprint below into `web/assets/js/main.js` and `web/assets/css/styles.css`.

### Actionable Implementation Blueprint for Worker

#### 4.1 CSS Implementation (`web/assets/css/styles.css`)
Append to the `#atmospheric-overlay` definition in `web/assets/css/styles.css`:
```css
/* Atmospheric Canvas Overlay Positioning & Performance */
#atmospheric-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  will-change: transform;
}

/* Reduced Motion Accessibility Compliance */
@media (prefers-reduced-motion: reduce) {
  #atmospheric-overlay {
    display: none !important;
  }
}
```

#### 4.2 JavaScript Implementation in `web/assets/js/main.js`

1. **Add `initAtmosphericOverlay();` to `DOMContentLoaded`** (line 16):
   ```javascript
   document.addEventListener('DOMContentLoaded', () => {
     initNavbar();
     initMobileMenu();
     initScrollReveal();
     initStatCounters();
     initFaqAccordion();
     initCatalogFilters();
     initWhatsAppWidget();
     initTireQuoteWidget();
     initRoadoneSlider();
     initAtmosphericOverlay(); // <--- Feature F1, F2, F3, F4
   });
   ```

2. **Full Implementation Function `initAtmosphericOverlay()`**:
```javascript
/* --------------------------------------------------------------------------
   10. ATMOSPHERIC HERO CANVAS OVERLAY (FEATURES F1, F2, F3, F4)
   -------------------------------------------------------------------------- */
function initAtmosphericOverlay() {
  const canvas = document.getElementById('atmospheric-overlay');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Sizing & Breakpoints
  const MAX_PARTICLES_DESKTOP = 70;
  const MAX_PARTICLES_MOBILE = 25;
  const MOBILE_BREAKPOINT = 768;

  // Reduced Motion Detection
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isReducedMotion = motionQuery.matches;

  // Dimensions & High-DPI Scaling (DPR clamp <= 2)
  let width = 0;
  let height = 0;
  let dpr = 1;

  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  // Particle Pool Factory
  function createParticle(w, h) {
    const isSpark = Math.random() < 0.30;
    const z = 0.3 + Math.random() * 0.7; // Depth factor
    const radius = isSpark ? (1.2 + Math.random() * 1.4) : (0.6 + Math.random() * 1.2);
    const baseAlpha = isSpark ? (0.25 + Math.random() * 0.40) : (0.15 + Math.random() * 0.25);

    // Color assignment (Micro-dust: amber/slate, Sparks: electric blue/brand red)
    let colorPrefix;
    if (isSpark) {
      colorPrefix = Math.random() < 0.6 ? '0, 102, 255' : '211, 47, 47'; // Electric blue / Red
    } else {
      colorPrefix = Math.random() < 0.5 ? '245, 179, 1' : '148, 163, 184'; // Amber / Slate
    }

    return {
      x: Math.random() * (w || 1000),
      y: Math.random() * (h || 600),
      z: z,
      radius: radius,
      baseAlpha: baseAlpha,
      alpha: baseAlpha,
      colorPrefix: colorPrefix,
      vx0: (Math.random() - 0.5) * 0.35, // Ambient drift X
      vy0: -(0.2 + Math.random() * 0.4),  // Ambient upward drift Y
      vx: 0,
      vy: 0
    };
  }

  function resetParticle(p, w, h, scatterRandomly) {
    if (scatterRandomly) {
      p.x = Math.random() * w;
      p.y = Math.random() * h;
    } else {
      p.x = Math.random() * w;
      p.y = h + 10; // Emerge from bottom
    }
    p.vx = 0;
    p.vy = 0;
  }

  // Pre-allocated Particle Pool (Zero-GC Architecture)
  const particlePool = new Array(MAX_PARTICLES_DESKTOP);
  for (let i = 0; i < MAX_PARTICLES_DESKTOP; i++) {
    particlePool[i] = createParticle(window.innerWidth, window.innerHeight);
  }

  let activeCount = window.innerWidth < MOBILE_BREAKPOINT ? MAX_PARTICLES_MOBILE : MAX_PARTICLES_DESKTOP;
  let lastWindowWidth = window.innerWidth;

  function updatePoolSize() {
    const currentWidth = window.innerWidth;
    const isMobile = currentWidth < MOBILE_BREAKPOINT;
    const targetCount = isMobile ? MAX_PARTICLES_MOBILE : MAX_PARTICLES_DESKTOP;

    if (targetCount !== activeCount) {
      if (targetCount > activeCount) {
        // Transition Mobile -> Desktop: awaken dormant particles
        for (let i = activeCount; i < targetCount; i++) {
          resetParticle(particlePool[i], width, height, true);
        }
      }
      activeCount = targetCount;
    }
    lastWindowWidth = currentWidth;
  }

  // State Machine
  let isHeroVisible = false;
  let isRunning = false;
  let rafId = null;
  let lastTime = 0;
  let lastScrollY = window.scrollY;
  let scrollDelta = 0;

  // Mouse Tracking
  const mouse = {
    x: -9999,
    y: -9999,
    targetX: -9999,
    targetY: -9999,
    vx: 0,
    vy: 0,
    isHovering: false
  };

  // RAF Controller
  function startLoop() {
    if (isRunning || isReducedMotion || !isHeroVisible || document.hidden) return;
    isRunning = true;
    lastTime = performance.now();
    lastScrollY = window.scrollY;
    scrollDelta = 0;
    rafId = requestAnimationFrame(animate);
  }

  function stopLoop() {
    if (!isRunning) return;
    isRunning = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Physics Update & Render Loop
  function animate(now) {
    if (!isRunning) return;

    // Clamped delta time (prevents physics explosion)
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    // Mouse velocity lerp
    if (mouse.isHovering) {
      mouse.vx = (mouse.targetX - mouse.x) * 0.08;
      mouse.vy = (mouse.targetY - mouse.y) * 0.08;
      mouse.x += mouse.vx;
      mouse.y += mouse.vy;
    }

    // Scroll delta damping
    scrollDelta *= 0.90;

    // Particle pool scrub (strictly 0 .. activeCount - 1)
    for (let i = 0; i < activeCount; i++) {
      const p = particlePool[i];

      // Mouse interactive influence (Radius: 140px)
      if (mouse.isHovering) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        const radius = 140;
        if (distSq < radius * radius && distSq > 1) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / radius) * p.z;
          p.vx += (dx / dist * 0.5 + mouse.vx * 0.03) * force;
          p.vy += (dy / dist * 0.5 + mouse.vy * 0.03) * force;
        }
      }

      // Scroll inertia impulse (upward parallax)
      if (Math.abs(scrollDelta) > 0.1) {
        p.vy -= scrollDelta * 0.035 * p.z;
      }

      // Viscous damping
      p.vx *= 0.94;
      p.vy *= 0.94;

      // Position integration
      p.x += (p.vx0 + p.vx) * (dt * 60);
      p.y += (p.vy0 + p.vy) * (dt * 60);

      // Boundary wrap
      if (p.x < -10) p.x = width + 10;
      else if (p.x > width + 10) p.x = -10;
      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      } else if (p.y > height + 10) {
        p.y = -10;
      }

      // Draw
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.colorPrefix}, ${p.baseAlpha})`;
      ctx.fill();
    }

    rafId = requestAnimationFrame(animate);
  }

  // Listeners
  function onMouseMove(e) {
    if (!isHeroVisible || isReducedMotion) return;
    const rect = canvas.getBoundingClientRect();
    mouse.targetX = e.clientX - rect.left;
    mouse.targetY = e.clientY - rect.top;
    if (!mouse.isHovering) {
      mouse.x = mouse.targetX;
      mouse.y = mouse.targetY;
      mouse.isHovering = true;
    }
  }

  function onMouseLeave() {
    mouse.isHovering = false;
  }

  function onScroll() {
    if (!isHeroVisible || isReducedMotion) return;
    const currentScrollY = window.scrollY;
    scrollDelta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;
  }

  let resizeTimer = null;
  function onResize() {
    if (resizeTimer) cancelAnimationFrame(resizeTimer);
    resizeTimer = requestAnimationFrame(() => {
      resizeCanvas();
      if (window.innerWidth !== lastWindowWidth) {
        updatePoolSize();
      }
    });
  }

  function onMotionChange(e) {
    isReducedMotion = e.matches;
    if (isReducedMotion) {
      stopLoop();
      ctx.clearRect(0, 0, width, height);
    } else if (isHeroVisible && !document.hidden) {
      startLoop();
    }
  }

  function onVisibilityChange() {
    if (document.hidden) {
      stopLoop();
    } else if (isHeroVisible && !isReducedMotion) {
      startLoop();
    }
  }

  // IntersectionObserver on .hero
  const heroObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      isHeroVisible = entry.isIntersecting;
      if (isHeroVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    }
  }, {
    root: null,
    threshold: 0
  });

  // Attach Event Handlers
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  canvas.addEventListener('mouseleave', onMouseLeave, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', onMotionChange);
  } else if (motionQuery.addListener) {
    motionQuery.addListener(onMotionChange);
  }

  heroObserver.observe(hero);

  // Initialize
  resizeCanvas();
  updatePoolSize();

  const initialRect = hero.getBoundingClientRect();
  if (initialRect.bottom > 0 && initialRect.top < window.innerHeight) {
    isHeroVisible = true;
    startLoop();
  }
}
```

---

## 5. Verification Method

To verify the implementation once applied:

### 5.1 CSS Reduced Motion Verification
Run in PowerShell:
```powershell
Get-Content web/assets/css/styles.css | Select-String -Pattern "prefers-reduced-motion" -Context 1,3
```
*Expected Result*: Outputs `@media (prefers-reduced-motion: reduce) { #atmospheric-overlay { display: none !important; } }`.

### 5.2 Dynamic Viewport Throttling Verification (DevTools Console)
1. Open `http://localhost:5000` on Desktop viewport (>= 768px).
2. In Chrome DevTools Console, inspect active particle count:
   - On Desktop: Pool iterates to 70.
3. Toggle Device Toolbar to iPhone 12 (390px wide).
4. Verify active particle count automatically throttles to 25.
5. In DevTools Performance panel, record 5 seconds while resizing: verify zero garbage collection spikes (`Minor GC` or `Major GC`) caused by particle allocations.

### 5.3 IntersectionObserver 0% CPU Verification
1. Open `http://localhost:5000`.
2. Open Chrome DevTools > More tools > Rendering > enable "Frame Rendering Stats" and open Task Manager (Shift+Esc).
3. Scroll down past `.hero` into `#catalogo` or footer.
4. Verify `#atmospheric-overlay` ceases scheduling `requestAnimationFrame` and CPU usage drops to 0.0%.
5. Scroll back up into `.hero`: verify animation resumes seamlessly without visual snapping or particle teleportation.

### 5.4 Reduced Motion Accessibility Verification
1. In Chrome DevTools: open Command Menu (`Ctrl+Shift+P`) > type `Show Rendering`.
2. Under "Emulate CSS media feature prefers-reduced-motion", select `prefers-reduced-motion: reduce`.
3. Verify:
   - `#atmospheric-overlay` gets `display: none !important;`.
   - `requestAnimationFrame` loop immediately stops.
   - Canvas is cleared and no particles are rendered.
4. Switch back to "No emulation": verify particle loop restarts immediately without page reload.

### 5.5 Invalidation Conditions
This report is invalidated if:
- `.hero` selector is renamed or removed from `web/index.html`.
- `#atmospheric-overlay` is relocated outside of `.hero`.
- The mobile breakpoint is redefined away from 768px.
