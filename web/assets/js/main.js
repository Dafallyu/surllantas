/**
 * SUR LLANTAS - Main JavaScript Interactivity
 * Stack: Pure Vanilla JS (ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history && !window.location.hash) {
    try { history.scrollRestoration = 'manual'; } catch (_) {}
  }
  initVideoTakeover();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initStatCounters();
  initFaqAccordion();
  initCatalogFilters();
  initWhatsAppWidget();
  initTireQuoteWidget();
  initRoadoneSlider();
  initAtmosphericOverlay();
  initCinematicScrollEngine();
  initCatalogSpotlightGlow();
});

/* --------------------------------------------------------------------------
   0. VIDEO TAKEOVER ENGINE & PROCEDURAL HIGHWAY ENGINE
   Scroll-driven parallax exit and high-speed night asphalt perspective
   -------------------------------------------------------------------------- */
class CinematicTakeoverEngine {
  constructor(canvas, container) {
    this.canvas = canvas;
    this.container = container;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.rafId = null;
    this.isActive = false;
    this.speed = 1.0;
    this.mouseX = 0.5;
    this.mouseY = 0.5;
    this.currentMouseX = 0.5;
    this.roadOffset = 0;
    this.numStreaks = 55;
  }

  init() {
    this.resize();
    this.initStreaks();
    this.bindEvents();
    this.isActive = true;
    this.render();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = this.container.offsetWidth || window.innerWidth;
    this.height = this.container.offsetHeight || window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  initStreaks() {
    this.particles = [];
    for (let i = 0; i < this.numStreaks; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * 2.2,
        y: (Math.random() - 0.5) * 2.0,
        z: Math.random() * 1000 + 1,
        color: Math.random() > 0.4 ? 'rgba(0, 102, 255, ' : 'rgba(211, 47, 47, ',
        speed: Math.random() * 8 + 14
      });
    }
  }

  bindEvents() {
    this.onResize = () => this.resize();
    this.onMouseMove = (e) => {
      this.mouseX = e.clientX / window.innerWidth;
      this.mouseY = e.clientY / window.innerHeight;
    };
    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('mousemove', this.onMouseMove, { passive: true });
  }

  render() {
    if (!this.isActive) return;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Smooth camera inertia
    this.currentMouseX += (this.mouseX - this.currentMouseX) * 0.05;

    // Background deep night asphalt gradient
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, w, h);

    const cx = w * (0.46 + this.currentMouseX * 0.08);
    const cy = h * 0.46;

    // Volumetric headlight illumination
    const headGlow = ctx.createRadialGradient(cx, cy + h * 0.1, 10, cx, cy + h * 0.4, Math.max(w, h) * 0.7);
    headGlow.addColorStop(0, 'rgba(0, 102, 255, 0.16)');
    headGlow.addColorStop(0.35, 'rgba(211, 47, 47, 0.07)');
    headGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = headGlow;
    ctx.fillRect(0, 0, w, h);

    // Perspective Highway Asphalt Horizon
    const horizonY = cy;
    const roadBottomLeft = -w * 0.15;
    const roadBottomRight = w * 1.15;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - 24, horizonY);
    ctx.lineTo(cx + 24, horizonY);
    ctx.lineTo(roadBottomRight, h);
    ctx.lineTo(roadBottomLeft, h);
    ctx.closePath();

    const roadGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    roadGrad.addColorStop(0, '#0A0F1A');
    roadGrad.addColorStop(0.5, '#0E1522');
    roadGrad.addColorStop(1, '#050811');
    ctx.fillStyle = roadGrad;
    ctx.fill();

    // Road glowing edge borders
    ctx.strokeStyle = 'rgba(0, 102, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Animated Highway Center Lane Dashes (Golden Highway Lines)
    this.roadOffset = (this.roadOffset + 16 * this.speed) % 100;
    ctx.save();
    for (let d = this.roadOffset; d < 1000; d += 90) {
      const zNorm = d / 1000;
      const yPos = horizonY + Math.pow(zNorm, 2.3) * (h - horizonY);
      const dashH = Math.max(3, Math.pow(zNorm, 2.0) * 48);
      const xPos = cx;
      const alpha = Math.min(1, Math.pow(zNorm, 1.8));

      ctx.strokeStyle = `rgba(255, 192, 45, ${alpha * 0.8})`;
      ctx.lineWidth = Math.max(1.2, zNorm * 4.2);
      ctx.beginPath();
      ctx.moveTo(xPos, yPos);
      ctx.lineTo(xPos, yPos + dashH);
      ctx.stroke();
    }
    ctx.restore();

    // Speed streaks & atmospheric particles
    for (let p of this.particles) {
      p.z -= p.speed * this.speed;
      if (p.z <= 0) {
        p.z = 1000;
        p.x = (Math.random() - 0.5) * 2.2;
        p.y = (Math.random() - 0.5) * 2.0;
      }

      const k = 420 / p.z;
      const px = p.x * w * k + cx;
      const py = p.y * h * k + cy;

      const prevK = 420 / (p.z + p.speed * 2.8);
      const prevX = p.x * w * prevK + cx;
      const prevY = p.y * h * prevK + cy;

      if (px >= 0 && px <= w && py >= 0 && py <= h) {
        const alpha = Math.min(1, (1000 - p.z) / 400);
        ctx.strokeStyle = p.color + alpha + ')';
        ctx.lineWidth = Math.max(1, (1000 - p.z) / 220);
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(px, py);
        ctx.stroke();
      }
    }

    this.rafId = requestAnimationFrame(() => this.render());
  }

  destroy() {
    this.isActive = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
  }
}

function initVideoTakeover() {
  const section = document.getElementById('video-takeover');
  if (!section) return;

  const navbar = document.querySelector('.navbar');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Wire video src when file exists (lazy - won't 404 if absent)
  const videoEl = document.getElementById('takeover-video');
  if (videoEl) {
    const src = videoEl.dataset.src;
    if (src) {
      fetch(src, { method: 'HEAD' })
        .then(r => {
          if (r.ok) {
            videoEl.src = src;
            videoEl.style.opacity = '1';
          }
        })
        .catch(() => {});
    }
  }

  // Run procedural highway engine on the takeover canvas
  const takeoverCanvas = document.getElementById('video-canvas');
  if (takeoverCanvas && !prefersReduced) {
    const takeoverEngine = new CinematicTakeoverEngine(takeoverCanvas, section);
    takeoverEngine.init();
    window.takeoverEngine = takeoverEngine;
  }

  if (prefersReduced) {
    section.style.display = 'none';
    if (navbar) navbar.classList.remove('navbar--over-video');
    return;
  }

  // Add transparent-over-video class to navbar initially
  if (navbar) navbar.classList.add('navbar--over-video');

  // Scroll-driven exit: smooth content fade & highway acceleration
  function onTakeoverScroll() {
    const scrollY = window.scrollY;
    const sectionH = section.offsetHeight || window.innerHeight;

    if (scrollY <= sectionH) {
      const progress = scrollY / sectionH; // 0 -> 1
      if (window.takeoverEngine) {
        window.takeoverEngine.speed = 1.0 + progress * 4.5;
      }
      const center = section.querySelector('.video-takeover__center');
      if (center) {
        center.style.opacity = String(Math.max(0, 1 - progress * 1.4));
        center.style.transform = `translateY(-${scrollY * 0.25}px) scale(${1 - progress * 0.08})`;
      }
      if (navbar) {
        if (progress > 0.35) {
          navbar.classList.remove('navbar--over-video');
        } else {
          navbar.classList.add('navbar--over-video');
        }
      }
    } else {
      if (navbar) navbar.classList.remove('navbar--over-video');
    }
  }

  window.addEventListener('scroll', onTakeoverScroll, { passive: true });
}

/* --------------------------------------------------------------------------
   1. STICKY NAVBAR
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* --------------------------------------------------------------------------
   2. MOBILE DRAWER MENU
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.navbar__toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.mobile-menu__overlay');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  if (!toggleBtn || !mobileMenu) return;

  // Initialize accessibility attributes
  toggleBtn.setAttribute('aria-expanded', 'false');

  const toggleMenu = (open) => {
    const isOpen = open !== undefined ? open : !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', isOpen);
    if (overlay) overlay.classList.toggle('open', isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  toggleBtn.addEventListener('click', () => toggleMenu());
  if (overlay) overlay.addEventListener('click', () => toggleMenu(false));

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      toggleMenu(false);
    }
  });
}

/* --------------------------------------------------------------------------
   3. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
   -------------------------------------------------------------------------- */
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

/* --------------------------------------------------------------------------
   4. NUMBER COUNT-UP ANIMATION FOR NOSOTROS STATS
   -------------------------------------------------------------------------- */
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-card__number[data-count]');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const countTo = parseInt(target.getAttribute('data-count'), 10);
        const suffix = target.getAttribute('data-suffix') || '';
        let current = 0;
        const duration = 2000;
        const stepTime = 30;
        const steps = duration / stepTime;
        const increment = countTo / steps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= countTo) {
            target.innerHTML = `${countTo}${suffix}`;
            clearInterval(timer);
          } else {
            target.innerHTML = `${Math.floor(current)}${suffix}`;
          }
        }, stepTime);

        obs.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => observer.observe(num));
}

/* --------------------------------------------------------------------------
   5. FAQ ACCORDION (PURE VANILLA JS)
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  if (!faqQuestions.length) return;

  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const faqItem = btn.parentElement;
      const isOpen = faqItem.classList.contains('active');

      // Close all active items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      // Toggle current
      if (!isOpen) {
        faqItem.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   6. CATALOG CATEGORY FILTERS
   -------------------------------------------------------------------------- */
function initCatalogFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const tireCards = document.querySelectorAll('.category-card, .tire-card');

  if (!filterBtns.length || !tireCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      tireCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterValue === 'all' || cardCategory === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   7. FLOATING WHATSAPP WIDGET
   -------------------------------------------------------------------------- */
function initWhatsAppWidget() {
  const floatingBtn = document.getElementById('waFloatingBtn');
  const popup = document.getElementById('waPopup');
  const closeBtn = document.getElementById('waCloseBtn');

  if (!floatingBtn || !popup) return;

  const togglePopup = (show) => {
    const isVisible = show !== undefined ? show : !popup.classList.contains('active');
    popup.classList.toggle('active', isVisible);
    popup.setAttribute('aria-hidden', !isVisible);
    floatingBtn.setAttribute('aria-expanded', isVisible);
  };

  floatingBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePopup();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopup(false);
    });
  }

  document.addEventListener('click', (e) => {
    if (!popup.contains(e.target) && !floatingBtn.contains(e.target)) {
      togglePopup(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('active')) {
      togglePopup(false);
    }
  });
}

/* --------------------------------------------------------------------------
   8. TIRE QUOTE SELECTOR WIDGET (WHATSAPP CONVERSION)
   -------------------------------------------------------------------------- */
function initTireQuoteWidget() {
  const quoteForm = document.getElementById('tireQuoteForm');
  if (!quoteForm) return;

  const vehicleSelect = document.getElementById('quoteVehicle');
  const sizeInput = document.getElementById('quoteSize');
  const brandSelect = document.getElementById('quoteBrand');

  if (vehicleSelect) {
    vehicleSelect.addEventListener('change', () => { vehicleSelect.dataset.userEdited = 'true'; });
  }
  if (sizeInput) {
    sizeInput.addEventListener('input', () => {
      sizeInput.dataset.userEdited = 'true';
      delete sizeInput.dataset.prefilled;
    });
  }
  if (brandSelect) {
    brandSelect.addEventListener('change', () => { brandSelect.dataset.userEdited = 'true'; });
  }

  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const vehicle = vehicleSelect ? vehicleSelect.value.trim() : 'Automóvil';
    const size = sizeInput ? sizeInput.value.trim() : '';
    const brand = brandSelect ? brandSelect.value.trim() : 'Cualquier marca recomendada';

    // Validate size
    const validation = typeof TireLandingQuoteBridge !== 'undefined'
      ? TireLandingQuoteBridge.validateQuoteForm(vehicle, size)
      : { valid: Boolean(size) };

    if (!validation.valid) {
      if (sizeInput) {
        sizeInput.focus();
        sizeInput.style.borderColor = 'var(--color-rojo)';
        sizeInput.setAttribute('aria-invalid', 'true');
        setTimeout(() => {
          sizeInput.style.borderColor = '';
          sizeInput.removeAttribute('aria-invalid');
        }, 2500);
      }
      return;
    }

    const waUrl = typeof TireLandingQuoteBridge !== 'undefined'
      ? TireLandingQuoteBridge.buildWhatsAppQuoteURL(vehicle, size, brand)
      : `https://wa.me/59172960725?text=${encodeURIComponent(`Hola, quisiera consultar disponibilidad y precio para ${vehicle}, medida ${size}, marca ${brand}.`)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });
}

/* --------------------------------------------------------------------------
   9. ROADONE INTERACTIVE TIRE SLIDER (45° / FRONT VIEW TOGGLE + SLIDER)
   -------------------------------------------------------------------------- */
function initRoadoneSlider() {
  const slider = document.getElementById('roadoneSlider');
  const track = document.getElementById('roadoneSliderTrack');
  const prevBtn = document.getElementById('roadonePrev');
  const nextBtn = document.getElementById('roadoneNext');
  const dotsContainer = document.getElementById('roadoneDots');
  const angleBtns = document.querySelectorAll('.roadone-angle-btn');

  if (!slider || !track) return;

  const cards = track.querySelectorAll('.roadone-card');
  const totalSlides = cards.length;
  if (totalSlides === 0) return;

  let currentIndex = 0;
  let autoSlideTimer = null;
  let currentAngle = '45';

  // Build pagination dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    cards.forEach((card, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `roadone-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir a la medida ${card.getAttribute('data-size') || idx + 1}`);
      dot.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => {
        goToSlide(idx);
        restartAutoSlide();
      });
      dotsContainer.appendChild(dot);
    });
  }

  const updateSliderPosition = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    cards.forEach((c, idx) => {
      c.classList.toggle('active', idx === currentIndex);
    });
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.roadone-dot');
      dots.forEach((d, idx) => {
        const isActive = idx === currentIndex;
        d.classList.toggle('active', isActive);
        d.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }
  };

  const goToSlide = (idx) => {
    currentIndex = (idx + totalSlides) % totalSlides;
    updateSliderPosition();
  };

  const nextSlide = () => {
    goToSlide(currentIndex + 1);
  };

  const prevSlide = () => {
    goToSlide(currentIndex - 1);
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      restartAutoSlide();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      restartAutoSlide();
    });
  }

  // Angle Switcher (45° vs Frontal)
  angleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const angle = btn.getAttribute('data-angle');
      if (angle === currentAngle) return;

      currentAngle = angle;
      angleBtns.forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      cards.forEach(card => {
        const img45 = card.querySelector('.roadone-card__img--45');
        const imgFrente = card.querySelector('.roadone-card__img--frente');
        if (img45 && imgFrente) {
          if (angle === 'frente') {
            img45.style.display = 'none';
            imgFrente.style.display = 'block';
          } else {
            img45.style.display = 'block';
            imgFrente.style.display = 'none';
          }
        }
      });
    });
  });

  // Touch Swipe for Mobile
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoSlide();
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    startAutoSlide();
  }, { passive: true });

  // Auto Slide (every 4.5s)
  const startAutoSlide = () => {
    stopAutoSlide();
    autoSlideTimer = setInterval(() => {
      nextSlide();
    }, 4500);
  };

  const stopAutoSlide = () => {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  };

  const restartAutoSlide = () => {
    stopAutoSlide();
    startAutoSlide();
  };

  const wrapper = slider.closest('.roadone-slider-wrapper') || slider;
  wrapper.addEventListener('mouseenter', stopAutoSlide);
  wrapper.addEventListener('mouseleave', startAutoSlide);

  // Keyboard navigation
  slider.setAttribute('tabindex', '0');
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
      restartAutoSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
      restartAutoSlide();
    }
  });

  startAutoSlide();
}

/* --------------------------------------------------------------------------
   10. ATMOSPHERIC HERO CANVAS OVERLAY (FEATURES F1, F2, F3, F4)
   -------------------------------------------------------------------------- */

class AtmosphericParticleEngine {
  constructor(canvas, hero) {
    this.canvas = canvas;
    this.hero = hero;
    this.ctx = canvas.getContext('2d');
    
    // Capacities & Breakpoint
    this.MAX_CAPACITY = 70;
    this.MOBILE_CAPACITY = 25;
    this.MOBILE_BREAKPOINT = 768;
    this.activeCount = window.innerWidth < this.MOBILE_BREAKPOINT ? this.MOBILE_CAPACITY : this.MAX_CAPACITY;
    this.lastWindowWidth = window.innerWidth;

    // Dimensions & DPR
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    // Fixed particle pool (Zero-GC)
    this.particles = new Array(this.MAX_CAPACITY);

    // Mouse state
    this.mouse = {
      targetX: -9999,
      targetY: -9999,
      currentX: -9999,
      currentY: -9999,
      prevX: -9999,
      prevY: -9999,
      isHovered: false
    };

    // Scroll state
    this.lastScrollY = window.scrollY || window.pageYOffset || 0;
    this.scrollDelta = 0;

    // Lifecycle state
    this.isRunning = false;
    this.isHeroVisible = false;
    this.isReducedMotion = false;
    this.rafId = null;

    // Bound event handlers
    this.handlePointerMove = this.onPointerMove.bind(this);
    this.handlePointerLeave = this.onPointerLeave.bind(this);
    this.handleScroll = this.onScroll.bind(this);
    this.handleResize = this.onResize.bind(this);
    this.handleVisibilityChange = this.onVisibilityChange.bind(this);
    this.handleMotionChange = this.onMotionChange.bind(this);
    this.animate = this.renderLoop.bind(this);
  }

  init() {
    if (!this.ctx) return;

    // Reduced motion media query
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = this.motionQuery.matches;

    // Set initial sizing
    this.resizeCanvas();

    // Populate particle pool
    this.initPool();

    // Setup event listeners
    this.setupListeners();

    // Setup IntersectionObserver on .hero
    this.setupIntersectionObserver();

    // Initial visibility check
    const initialRect = this.hero.getBoundingClientRect();
    if (initialRect.bottom > 0 && initialRect.top < window.innerHeight) {
      this.isHeroVisible = true;
      if (!this.isReducedMotion && !document.hidden) {
        this.startLoop();
      }
    }

    if (this.isReducedMotion) {
      this.canvas.style.display = 'none';
    }
  }

  setupListeners() {
    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', this.handlePointerLeave, { passive: true });
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleResize, { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    if (this.motionQuery.addEventListener) {
      this.motionQuery.addEventListener('change', this.handleMotionChange);
    } else if (this.motionQuery.addListener) {
      this.motionQuery.addListener(this.handleMotionChange);
    }
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        this.isHeroVisible = entry.isIntersecting;
        if (this.isHeroVisible) {
          if (!this.isReducedMotion && !document.hidden) {
            this.startLoop();
          }
        } else {
          this.stopLoop();
        }
      }
    }, {
      root: null,
      threshold: 0
    });

    this.observer.observe(this.hero);
  }

  resizeCanvas() {
    const rect = this.hero.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    const newDpr = Math.min(window.devicePixelRatio || 1, 2);

    if (w === 0 || h === 0) return;

    this.width = w;
    this.height = h;
    this.dpr = newDpr;

    this.canvas.width = Math.floor(w * newDpr);
    this.canvas.height = Math.floor(h * newDpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(newDpr, newDpr);
  }

  createParticle(scatter) {
    const isSpark = Math.random() < 0.30;
    const z = 0.30 + Math.random() * 0.70;

    // Radius distribution scaled by depth
    const baseRadius = isSpark
      ? (1.2 + Math.random() * 1.4)  // Sparks: 1.2px - 2.6px
      : (0.6 + Math.random() * 1.2); // Dust:   0.6px - 1.8px
    const radius = baseRadius * (0.7 + 0.3 * z);

    // Alpha distribution scaled by depth
    const baseAlpha = isSpark
      ? (0.25 + Math.random() * 0.40) // Sparks: 0.25 - 0.65
      : (0.15 + Math.random() * 0.25); // Dust:   0.15 - 0.40
    const alpha = baseAlpha * (0.6 + 0.4 * z);

    // Color distribution
    let rgb;
    if (isSpark) {
      // 50% Electric Blue #0066FF, 50% Brand Red #DC2626
      rgb = Math.random() < 0.5 ? '0, 102, 255' : '220, 38, 38';
    } else {
      // 50% Asphalt Amber #F5B301, 50% Slate Road Dust #94A3B8
      rgb = Math.random() < 0.5 ? '245, 179, 1' : '148, 163, 184';
    }

    // Ambient convective velocities
    const vx0 = (Math.random() - 0.5) * (isSpark ? 0.60 : 0.40);
    const vy0 = -0.05 - Math.random() * (isSpark ? 0.45 : 0.25);

    const w = this.width || 1200;
    const h = this.height || 600;

    return {
      x: scatter ? Math.random() * w : Math.random() * w,
      y: scatter ? Math.random() * h : h + 10,
      z: z,
      vx0: vx0,
      vy0: vy0,
      vx: 0,
      vy: 0,
      radius: radius,
      style: `rgba(${rgb},${alpha.toFixed(3)})`
    };
  }

  initPool() {
    for (let i = 0; i < this.MAX_CAPACITY; i++) {
      this.particles[i] = this.createParticle(true);
    }
  }

  onResize() {
    this.resizeCanvas();
    const currentWidth = window.innerWidth;
    if (currentWidth !== this.lastWindowWidth) {
      this.updatePoolSize(currentWidth);
      this.lastWindowWidth = currentWidth;
    }
  }

  updatePoolSize(currentWidth) {
    const isMobile = currentWidth < this.MOBILE_BREAKPOINT;
    const targetCount = isMobile ? this.MOBILE_CAPACITY : this.MAX_CAPACITY;

    if (targetCount !== this.activeCount) {
      if (targetCount > this.activeCount) {
        // Awaken dormant particles
        for (let i = this.activeCount; i < targetCount; i++) {
          const p = this.particles[i];
          if (p) {
            p.x = Math.random() * (this.width || 1200);
            p.y = Math.random() * (this.height || 600);
            p.vx = 0;
            p.vy = 0;
          }
        }
      }
      this.activeCount = targetCount;
    }
  }

  onPointerMove(e) {
    if (!this.isHeroVisible || this.isReducedMotion) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!this.mouse.isHovered) {
      // First entry: avoid supersonic impulse spike
      this.mouse.currentX = x;
      this.mouse.currentY = y;
      this.mouse.prevX = x;
      this.mouse.prevY = y;
      this.mouse.isHovered = true;
    }

    this.mouse.targetX = x;
    this.mouse.targetY = y;
  }

  onPointerLeave() {
    this.mouse.targetX = -9999;
    this.mouse.targetY = -9999;
    this.mouse.isHovered = false;
  }

  onScroll() {
    if (!this.isHeroVisible || this.isReducedMotion) return;
    const currentY = window.scrollY || window.pageYOffset || 0;
    this.scrollDelta += (currentY - this.lastScrollY);
    this.lastScrollY = currentY;
  }

  onVisibilityChange() {
    if (document.hidden) {
      this.stopLoop();
    } else if (this.isHeroVisible && !this.isReducedMotion) {
      this.startLoop();
    }
  }

  onMotionChange(e) {
    this.isReducedMotion = e.matches;
    if (this.isReducedMotion) {
      this.stopLoop();
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.width, this.height);
      }
      this.canvas.style.display = 'none';
    } else {
      this.canvas.style.display = '';
      if (this.isHeroVisible && !document.hidden) {
        this.startLoop();
      }
    }
  }

  startLoop() {
    if (this.isRunning || this.isReducedMotion || !this.isHeroVisible || document.hidden) return;
    this.isRunning = true;
    this.lastScrollY = window.scrollY || window.pageYOffset || 0;
    this.scrollDelta = 0;
    this.mouse.prevX = this.mouse.currentX;
    this.mouse.prevY = this.mouse.currentY;
    this.rafId = requestAnimationFrame(this.animate);
  }

  stopLoop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  renderLoop() {
    if (!this.isRunning) return;

    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;

    // Clear frame
    ctx.clearRect(0, 0, width, height);

    // 1. Mouse Lerping (smoothing factor 0.08)
    if (this.mouse.isHovered) {
      this.mouse.currentX += (this.mouse.targetX - this.mouse.currentX) * 0.08;
      this.mouse.currentY += (this.mouse.targetY - this.mouse.currentY) * 0.08;
    } else {
      this.mouse.currentX = -9999;
      this.mouse.currentY = -9999;
    }

    const vmx = this.mouse.currentX - this.mouse.prevX;
    const vmy = this.mouse.currentY - this.mouse.prevY;
    this.mouse.prevX = this.mouse.currentX;
    this.mouse.prevY = this.mouse.currentY;

    // 2. Scroll Impulse Consumption
    const appliedScroll = Math.max(-60, Math.min(60, this.scrollDelta * 0.5));
    this.scrollDelta -= appliedScroll;

    // 3. Update & Draw Active Particles
    const count = this.activeCount;
    const radiusInfluence = 140;
    const radiusSq = 19600; // 140 * 140
    const margin = 20;

    for (let i = 0; i < count; i++) {
      const p = this.particles[i];

      // Mouse interactive influence
      if (this.mouse.isHovered) {
        const dx = p.x - this.mouse.currentX;
        const dy = p.y - this.mouse.currentY;
        const distSq = dx * dx + dy * dy;

        if (distSq < radiusSq && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const force = (1 - (dist / radiusInfluence)) * p.z;
          p.vx += ((dx / dist) * 0.6 + vmx * 0.04) * force;
          p.vy += ((dy / dist) * 0.6 + vmy * 0.04) * force;
        }
      }

      // Scroll upward parallax impulse
      if (appliedScroll !== 0) {
        p.vy -= appliedScroll * 0.035 * p.z;
      }

      // Viscous Damping
      p.vx *= 0.94;
      p.vy *= 0.94;

      // Position Integration
      p.x += p.vx + p.vx0;
      p.y += p.vy + p.vy0;

      // Boundary Wrap with Anti-clumping Random X
      if (p.x < -margin) {
        p.x = width + margin;
      } else if (p.x > width + margin) {
        p.x = -margin;
      }

      if (p.y < -margin) {
        p.y = height + margin;
        p.x = Math.random() * width;
      } else if (p.y > height + margin) {
        p.y = -margin;
        p.x = Math.random() * width;
      }

      // Render particle (zero string allocation)
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 6.283185307179586);
      ctx.fillStyle = p.style;
      ctx.fill();
    }

    this.rafId = requestAnimationFrame(this.animate);
  }

  destroy() {
    this.stopLoop();
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerleave', this.handlePointerLeave);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    if (this.motionQuery) {
      if (this.motionQuery.removeEventListener) {
        this.motionQuery.removeEventListener('change', this.handleMotionChange);
      } else if (this.motionQuery.removeListener) {
        this.motionQuery.removeListener(this.handleMotionChange);
      }
    }

    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

function initAtmosphericOverlay() {
  const canvas = document.getElementById('atmospheric-overlay');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;

  const engine = new AtmosphericParticleEngine(canvas, hero);
  engine.init();

  // Expose on window for testing and diagnostics
  window.particleEngine = engine;
  return engine;
}

/* --------------------------------------------------------------------------
   11. CINEMATIC 4-PHASE SCROLL ENGINE (FEATURES F5, F6, F7, F8, F9, F10, F11, F12)
   -------------------------------------------------------------------------- */

/**
 * Phase 03: Telemetry Hotspots & Glass Cards Controller (Features F9 & F10)
 */
class TelemetryController {
  constructor() {
    this.layer = document.getElementById('telemetryLayer');
    this.hotspots = document.querySelectorAll('.telemetry-hotspot');
    this.cards = document.querySelectorAll('.telemetry-card');
    this.activeHotspotId = null;

    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init() {
    if (!this.layer || !this.hotspots.length) return;

    this.hotspots.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleHotspot(btn.id);
      });

      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Space') {
          e.preventDefault();
          e.stopPropagation();
          this.toggleHotspot(btn.id);
        }
      });
    });

    const closeButtons = document.querySelectorAll('.telemetry-card__close');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeAll();
      });
    });

    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('pointerdown', this.handleOutsideClick);
    window.addEventListener('resize', this.handleResize, { passive: true });
  }

  toggleHotspot(id) {
    if (this.activeHotspotId === id) {
      this.closeAll();
    } else {
      this.openHotspot(id);
    }
  }

  openHotspot(id) {
    this.closeAll();
    const btn = document.getElementById(id);
    if (!btn) return;

    const cardId = btn.getAttribute('aria-controls');
    const card = document.getElementById(cardId);

    btn.setAttribute('aria-expanded', 'true');
    btn.classList.add('active');
    if (card) {
      card.classList.add('active');
    }
    this.activeHotspotId = id;
  }

  closeAll() {
    this.hotspots.forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('active');
    });
    this.cards.forEach(card => card.classList.remove('active'));
    this.activeHotspotId = null;
  }

  handleKeydown(e) {
    if (e.key === 'Escape' && this.activeHotspotId) {
      this.closeAll();
    }
  }

  handleOutsideClick(e) {
    if (!this.activeHotspotId) return;
    const clickedInside = e.target.closest('.telemetry-hotspot') || e.target.closest('.telemetry-card');
    if (!clickedInside) {
      this.closeAll();
    }
  }

  handleResize() {
    if (this.activeHotspotId) {
      this.closeAll();
    }
  }

  setPhaseVisible(isVisible) {
    if (!this.layer) return;
    if (isVisible) {
      this.layer.classList.add('active');
    } else {
      this.layer.classList.remove('active');
      this.closeAll();
    }
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('pointerdown', this.handleOutsideClick);
    window.removeEventListener('resize', this.handleResize);
  }
}

/**
 * Phase 04: Tire Landing into WhatsApp CTA Bridge (Feature F11)
 */
class TireLandingQuoteBridge {
  static prefillRoadoneTruckQuote() {
    const vehicleSelect = document.getElementById('quoteVehicle');
    const sizeInput = document.getElementById('quoteSize');
    const brandSelect = document.getElementById('quoteBrand');

    if (vehicleSelect && !vehicleSelect.dataset.userEdited) {
      vehicleSelect.value = 'Camión / Transporte Pesado';
    }
    if (sizeInput && !sizeInput.dataset.userEdited && (!sizeInput.value || sizeInput.dataset.prefilled === 'true')) {
      sizeInput.value = '315/70 R22.5';
      sizeInput.dataset.prefilled = 'true';
    }
    if (brandSelect && !brandSelect.dataset.userEdited) {
      brandSelect.value = 'Roadone';
    }
  }

  static buildWhatsAppQuoteURL(vehicle, size, brand, phone = '59172960725') {
    const safeVehicle = (vehicle || 'Camión / Transporte Pesado').trim();
    const safeSize = (size || '315/70 R22.5').trim().substring(0, 100);
    const safeBrand = (brand || 'Roadone HD55').trim();

    const text = `Hola, quisiera consultar disponibilidad y precio para ${safeVehicle}, medida ${safeSize}, marca ${safeBrand}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  static validateQuoteForm(vehicle, size) {
    if (!vehicle || !size || size.trim() === '') {
      return { valid: false, error: 'Medida requerida' };
    }
    return { valid: true };
  }
}

/**
 * Master Scroll Engine Initialization (Features F5, F6, F7, F8, F9, F10, F11, F12)
 */
function initCinematicScrollEngine() {
  // 1. Safe dependency check (Feature F5, test F5-T2-3)
  if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
    console.warn('[SurLlantas] GSAP 3.12.5 or ScrollTrigger not loaded. Using accessible static layout.');
    return null;
  }

  // 2. Reduced-motion check & dynamic change listener (Feature F12, test F12-T2-1)
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery && !window._motionQueryListenerAttached) {
    window._motionQueryListenerAttached = true;
    motionQuery.addEventListener('change', (e) => {
      if (e.matches) {
        if (window.cinematicTimeline) {
          window.cinematicTimeline.kill();
          window.cinematicTimeline = null;
        }
        if (typeof ScrollTrigger !== 'undefined') {
          const st = ScrollTrigger.getById('cinematic-stage');
          if (st) st.kill();
        }
      } else {
        initCinematicScrollEngine();
      }
    });
  }

  if (motionQuery.matches) {
    console.info('[SurLlantas] prefers-reduced-motion is active. Skipping scroll timeline.');
    return null;
  }

  // Clean up previous timeline and trigger instances before recreating
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

  // Register plugin
  gsap.registerPlugin(ScrollTrigger);

  const stage = document.querySelector('.cinematic-hero-stage') || document.getElementById('heroStage');
  const viewport = document.querySelector('.cinematic-viewport') || document.querySelector('.hero');
  const typography = document.querySelector('.cinematic-hero__typography') || document.getElementById('heroTypography');
  const tireFrente = document.getElementById('tireImgFrente');
  const tire45 = document.getElementById('tireImg45');
  const tire3DWrapper = document.getElementById('tire3DWrapper');
  const tireContactShadow = document.getElementById('tireContactShadow');
  const telemetryLayer = document.getElementById('telemetryLayer');
  const tireStage = document.getElementById('cinematicTireStage');

  if (!stage || !viewport || !typography) return null;

  // Initialize telemetry controller
  const telemetry = new TelemetryController();
  telemetry.init();
  window.telemetryController = telemetry;

  // 3. Telemetry is active and visible by default
  telemetry.setPhaseVisible(true);

  const isMobile = window.innerWidth < 992;

  // 4. Create Master Timeline with ScrollTrigger Pinning on Desktop
  const masterTimeline = gsap.timeline({
    scrollTrigger: {
      id: 'cinematic-stage',
      trigger: stage,
      start: isMobile ? 'top 80%' : 'top top',
      end: isMobile ? 'bottom 20%' : '+=130%',
      scrub: 0.8,
      pin: isMobile ? false : viewport,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        window.cinematicScrollProgress = p;

        // Telemetry visibility: active in phase 2-3 (0.25 to 0.80)
        if (telemetry) {
          if (p < 0.25 || p >= 0.80) {
            telemetry.setPhaseVisible(false);
          } else {
            telemetry.setPhaseVisible(true);
          }
        }

        // Pre-fill quote when scrolling towards catalog (Phase 4, test T5-SCE-06)
        if (p >= 0.8) {
          TireLandingQuoteBridge.prefillRoadoneTruckQuote();
        }
      }
    }
  });

  // Milestone 2 Phase Labels (Master Contract)
  masterTimeline.addLabel('phase1-start', 0.00);
  masterTimeline.addLabel('phase1-end',   0.25);
  masterTimeline.addLabel('phase2-start', 0.25);
  masterTimeline.addLabel('phase2-end',   0.55);
  masterTimeline.addLabel('phase3-start', 0.55);
  masterTimeline.addLabel('phase3-end',   0.80);
  masterTimeline.addLabel('phase4-start', 0.80);
  masterTimeline.addLabel('phase4-end',   1.00);

  // Expose on window for diagnostics and extension
  window.cinematicTimeline = masterTimeline;

  // =========================================================================
  // PHASE 01: Typographic Awakening (Scroll 0.00 to 0.25)
  // =========================================================================
  gsap.set(typography, {
    filter: 'blur(14px)',
    opacity: 0.15,
    y: 24,
    scale: 1.05,
    transformOrigin: 'left center'
  });

  // Linear unblur and awakening from 0.00 to 0.25 (Feature F6, test F6-T1-2..4)
  masterTimeline.to(typography, {
    filter: 'blur(0px)',
    opacity: 1.0,
    y: 0,
    scale: 1.0,
    ease: 'none',
    duration: 0.25
  }, 0.00);

  // Focus settling transition at 0.25 to 0.33
  masterTimeline.to(typography, {
    x: -25,
    opacity: 0.85,
    scale: 0.98,
    ease: 'power1.out',
    duration: 0.08
  }, 0.25);

  // =========================================================================
  // PHASE 02: Roadone HD55 Perspective Morph & Physics (Scroll 0.25 to 0.55)
  // =========================================================================
  if (tireFrente && tire45 && tire3DWrapper && tireContactShadow) {
    // Initial tire setup
    gsap.set(tireFrente, { opacity: 1 });
    gsap.set(tire45, { opacity: 0 });
    gsap.set(tire3DWrapper, { rotateY: 0, rotateX: 0, scale: 0.96 });

    // Morph: Frente fades out, 45 fades in inversely (Feature F7, tests F7-T1-4..5)
    masterTimeline.to(tireFrente, {
      opacity: 0,
      ease: 'none',
      duration: 0.30
    }, 0.25);

    masterTimeline.to(tire45, {
      opacity: 1,
      ease: 'none',
      duration: 0.30
    }, 0.25);

    // 3D Perspective Rotation (Feature F7)
    masterTimeline.to(tire3DWrapper, {
      rotateY: -18,
      rotateX: 3,
      scale: 1.05,
      ease: 'none',
      duration: 0.30
    }, 0.25);

    // Contact shadow affine matrix deformation (Feature F8, tests F8-T1-1..5)
    const shadowProxy = { p: 0 };
    masterTimeline.to(shadowProxy, {
      p: 1,
      ease: 'none',
      duration: 0.30,
      onUpdate: () => {
        const p = Math.max(0, Math.min(1, shadowProxy.p));
        const angleRad = (p * 45 * Math.PI) / 180;
        const sinVal = Math.sin(angleRad);
        const scaleX = 1 + 0.15 * sinVal;
        const rawSkewX = -0.35 * sinVal;
        const skewX = Math.abs(rawSkewX) < 1e-6 ? 0 : rawSkewX;
        const scaleY = 1 - 0.25 * sinVal;
        const tx = 20 * p;
        const ty = 10 * p;
        tireContactShadow.style.transform =
          `matrix(${scaleX.toFixed(4)}, 0, ${skewX.toFixed(4)}, ${scaleY.toFixed(4)}, ${tx.toFixed(2)}, ${ty.toFixed(2)})`;
      }
    }, 0.25);
  }

  // =========================================================================
  // PHASE 03: SVG Telemetry Hotspots Layer (Scroll 0.55 to 0.80)
  // =========================================================================
  if (telemetryLayer) {
    gsap.set(telemetryLayer, { opacity: 0, visibility: 'hidden' });

    masterTimeline.to(telemetryLayer, {
      opacity: 1,
      visibility: 'visible',
      ease: 'power2.out',
      duration: 0.08
    }, 0.55);

    if (tire3DWrapper) {
      masterTimeline.to(tire3DWrapper, {
        rotateY: -22,
        rotateX: 4,
        scale: 1.07,
        ease: 'none',
        duration: 0.25
      }, 0.55);
    }
  }

  // =========================================================================
  // PHASE 04: Tire Landing into WhatsApp Quote Bar (Scroll 0.80 to 1.00)
  // =========================================================================
  if (telemetryLayer) {
    masterTimeline.to(telemetryLayer, {
      opacity: 0,
      visibility: 'hidden',
      ease: 'power1.in',
      duration: 0.06
    }, 0.80);
  }

  if (tireStage) {
    masterTimeline.to(tireStage, {
      y: 70,
      scale: 0.88,
      opacity: 0.45,
      ease: 'power2.inOut',
      duration: 0.20
    }, 0.80);
  }

  // Interactive mouse 3D tilt on desktop (subtle physical response on hover)
  if (!isMobile && tire3DWrapper) {
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      heroEl.addEventListener('mousemove', (e) => {
        const rect = heroEl.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(tire3DWrapper, {
          rotateY: -18 + x * 20,
          rotateX: 3 - y * 14,
          duration: 0.4,
          ease: 'power1.out'
        });
        if (tireContactShadow) {
          gsap.to(tireContactShadow, {
            x: x * 18,
            duration: 0.4,
            ease: 'power1.out'
          });
        }
      }, { passive: true });
    }
  }

  return masterTimeline;
}

/* --------------------------------------------------------------------------
   12. CATALOG CARDS SPOTLIGHT GLOW (FEATURES F13, F14, F15)
   -------------------------------------------------------------------------- */

/**
 * Pure coordinate calculator matching PhysicsOracle specification.
 */
class CatalogSpotlightController {
  static calculateCoords(clientX, clientY, cardRect) {
    const mouseX = clientX - cardRect.left;
    const mouseY = clientY - cardRect.top;
    const isInside = mouseX >= 0 && mouseX <= cardRect.width && mouseY >= 0 && mouseY <= cardRect.height;
    return {
      mouseX,
      mouseY,
      isInside,
      cssVarX: `${Math.round(mouseX)}px`,
      cssVarY: `${Math.round(mouseY)}px`
    };
  }

  static calculateSpotlightCoords(clientX, clientY, cardRect) {
    return this.calculateCoords(clientX, clientY, cardRect);
  }
}

/**
 * Initializes reactive cursor tracking on catalog cards (.category-card).
 * Updates CSS custom properties --mouse-x and --mouse-y with integer pixel
 * coordinates relative to the card's bounding box.
 * 
 * Performance & Architecture:
 * - Batched via requestAnimationFrame to avoid layout thrashing.
 * - Non-blocking passive pointer listeners.
 * - Independent coordinate frames per card without cross-talk.
 * - Ignores touch inputs to prevent stuck/frozen glow artifacts.
 * - Smooth fade-out reset on pointerleave (retaining exit coordinates until CSS fade completes).
 */
function initCatalogSpotlightGlow() {
  const cards = document.querySelectorAll('.category-card');
  if (!cards || !cards.length) return;

  // Reduced motion guard: disable all dynamic tracking if prefers-reduced-motion matches
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    // Touch-only guard: disable dynamic cursor tracking on pure touch devices (F15)
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      return;
    }
  }

  // Touch event detection flag to suppress synthetic mousemove events on touchscreens (F15-T2-1)
  let hasTouchOccurred = false;
  if (typeof window !== 'undefined') {
    window.addEventListener('touchstart', () => {
      hasTouchOccurred = true;
    }, { passive: true, capture: true });
  }

  cards.forEach(card => {
    let rafId = null;
    let latestClientX = 0;
    let latestClientY = 0;
    let isInside = false;
    let resetTimer = null;

    const updateCoordinates = () => {
      rafId = null;
      if (!isInside) return;

      const rect = card.getBoundingClientRect();
      const coords = CatalogSpotlightController.calculateCoords(latestClientX, latestClientY, rect);

      card.style.setProperty('--mouse-x', coords.cssVarX);
      card.style.setProperty('--mouse-y', coords.cssVarY);
    };

    const onPointerMove = (e) => {
      // Ignore touch and pen inputs to avoid stuck glow on touchscreens (F15)
      if (e.pointerType === 'touch' || e.pointerType === 'pen' || hasTouchOccurred) return;

      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none)').matches) {
        return;
      }

      latestClientX = e.clientX;
      latestClientY = e.clientY;

      if (!rafId) {
        if (typeof requestAnimationFrame !== 'undefined') {
          rafId = requestAnimationFrame(updateCoordinates);
        } else {
          updateCoordinates();
        }
      }
    };

    const onPointerEnter = (e) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen' || hasTouchOccurred) return;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none)').matches) {
        return;
      }

      isInside = true;
      if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
      }
      latestClientX = e.clientX;
      latestClientY = e.clientY;
      updateCoordinates();
    };

    const onPointerLeave = () => {
      isInside = false;
      if (rafId) {
        if (typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(rafId);
        }
        rafId = null;
      }
      // Smooth reset: keep coordinates during CSS opacity transition (0.3s ease),
      // then cleanly remove inline custom properties after fade-out completes.
      if (resetTimer) {
        clearTimeout(resetTimer);
      }
      resetTimer = setTimeout(() => {
        if (!isInside) {
          card.style.removeProperty('--mouse-x');
          card.style.removeProperty('--mouse-y');
        }
      }, 350);
    };

    card.addEventListener('pointerenter', onPointerEnter, { passive: true });
    card.addEventListener('pointermove', onPointerMove, { passive: true });
    card.addEventListener('pointerleave', onPointerLeave, { passive: true });
  });
}

// Expose globals for testing and diagnostics
if (typeof window !== 'undefined') {
  window.TelemetryController = TelemetryController;
  window.TireLandingQuoteBridge = TireLandingQuoteBridge;
  window.initCinematicScrollEngine = initCinematicScrollEngine;
  window.CatalogSpotlightController = CatalogSpotlightController;
  window.initCatalogSpotlightGlow = initCatalogSpotlightGlow;
}

