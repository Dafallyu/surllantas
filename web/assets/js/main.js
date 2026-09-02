/**
 * SUR LLANTAS - Main JavaScript Interactivity
 * Stack: Pure Vanilla JS (ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initStatCounters();
  initFaqAccordion();
  initCatalogFilters();
  initWhatsAppWidget();
  initTireQuoteWidget();
});

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

  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const vehicleSelect = document.getElementById('quoteVehicle');
    const sizeInput = document.getElementById('quoteSize');
    const brandSelect = document.getElementById('quoteBrand');

    const vehicle = vehicleSelect ? vehicleSelect.value.trim() : 'Automóvil';
    const size = sizeInput ? sizeInput.value.trim() : '';
    const brand = brandSelect ? brandSelect.value.trim() : 'Cualquier marca recomendada';

    // Validate size
    if (!size) {
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

    // Build friendly, preformatted WhatsApp query
    let message = `Hola Sur Llantas, quiero consultar stock y disponibilidad de llantas:\n\n`;
    message += `🚗 Tipo de Vehículo: ${vehicle}\n`;
    message += `📏 Medida solicitada: ${size}\n`;
    message += `🏷️ Marca preferida: ${brand}\n\n`;
    message += `¿Tienen stock inmediato y cuál sería el precio? Gracias.`;

    const waUrl = `https://wa.me/59172960725?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });
}
