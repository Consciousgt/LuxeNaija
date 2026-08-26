// ============================================================
//  LuxeNaija — Animation Engine (animations.js)
//  Scroll reveal, counters, carousel, countdown, ripple, etc.
// ============================================================

// ── Page Loader ──
(function() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('done'), 1200);
  });
  // Fallback in case load event already fired
  if (document.readyState === 'complete') {
    setTimeout(() => loader.classList.add('done'), 1200);
  }
})();

// ── Scroll Progress Bar ──
(function() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const doc = document.documentElement;
    const pct = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
})();

// ── Scroll Reveal (IntersectionObserver) ──
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => observer.observe(el));
}

// ── Animated Counters ──
function animateCounter(el, target, duration) {
  duration = duration || 1800;
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = prefix + current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count, 10);
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}

// ── Ripple Effect ──
function addRipple(e) {
  const btn = e.currentTarget;
  const ripple = document.createElement('span');
  ripple.className = 'ripple-effect';
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

function initRipple() {
  document.querySelectorAll('.ripple-container').forEach(btn => {
    btn.addEventListener('click', addRipple);
  });
}

// ── Testimonial Carousel ──
function initTestimonialCarousel() {
  const carousel = document.getElementById('testimonial-carousel');
  const track = document.getElementById('testimonial-track');
  const dotsContainer = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('test-prev');
  const nextBtn = document.getElementById('test-next');
  if (!carousel || !track) return;

  const slides = track.querySelectorAll('.testimonial-slide');
  if (!slides.length) return;

  let currentIndex = 0;
  let autoTimer = null;

  // Determine visible count
  function getVisible() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function maxIndex() {
    return Math.max(0, slides.length - getVisible());
  }

  // Create dots
  function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const total = maxIndex() + 1;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.style.cssText = 'width:8px;height:8px;border-radius:50%;border:none;cursor:pointer;transition:all 0.3s ease;background:' + (i === 0 ? 'var(--green)' : 'var(--border)');
      dot.setAttribute('aria-label', 'Slide ' + (i+1));
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    dotsContainer.querySelectorAll('button').forEach((dot, i) => {
      dot.style.background = i === currentIndex ? 'var(--green)' : 'var(--border)';
      dot.style.width = i === currentIndex ? '24px' : '8px';
      dot.style.borderRadius = '99px';
    });
  }

  function goTo(index) {
    const max = maxIndex();
    currentIndex = Math.max(0, Math.min(index, max));
    const pct = (100 / getVisible()) * currentIndex;
    track.style.transform = 'translateX(-' + pct + '%)';
    updateDots();
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  function startAuto() {
    autoTimer = setInterval(() => {
      if (currentIndex >= maxIndex()) goTo(0); else next();
    }, 4500);
  }

  function stopAuto() { clearInterval(autoTimer); }

  if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); next(); startAuto(); });

  // Touch/swipe
  let touchStartX = 0;
  carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { stopAuto(); (diff > 0 ? next : prev)(); startAuto(); }
  }, { passive: true });

  // Responsive rebuild
  let lastVisible = getVisible();
  window.addEventListener('resize', () => {
    const v = getVisible();
    if (v !== lastVisible) {
      lastVisible = v;
      createDots();
      goTo(0);
    }
  });

  createDots();
  goTo(0);
  startAuto();
}

// ── Countdown Timer ──
function initCountdown() {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');
  if (!daysEl) return;

  // Target: Sept 2, 2026
  const target = new Date('2026-09-02T23:59:59').getTime();

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = Date.now();
    const diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    daysEl.textContent  = pad(d);
    hoursEl.textContent = pad(h);
    minsEl.textContent  = pad(m);
    secsEl.textContent  = pad(s);
  }

  tick();
  setInterval(tick, 1000);
}

// ── Navbar Show CTA on Scroll ──
function initNavCTA() {
  const cta = document.getElementById('nav-cta');
  if (!cta) return;
  window.addEventListener('scroll', () => {
    cta.style.display = window.scrollY > 300 ? 'inline-flex' : 'none';
  }, { passive: true });
}

// ── Mobile Menu Stagger ──
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn   = document.getElementById('mobile-menu-close');
  if (!hamburger || !mobileMenu) return;

  const links = mobileMenu.querySelectorAll('a, .reveal');

  function openMenu() {
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Stagger reveal each link
    links.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-30px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateX(0)';
      }, 80 + i * 70);
    });
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    links.forEach(el => {
      el.style.opacity = '';
      el.style.transform = '';
      el.style.transition = '';
    });
  }

  hamburger.addEventListener('click', openMenu);
  closeBtn && closeBtn.addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
}

// ── Navbar Scroll ──
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

// ── FAQ Accordion ──
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ── Stagger Grid Items on IntersectionObserver ──
function initStaggerGrids() {
  const grids = document.querySelectorAll('.products-grid, .steps-grid, .testimonials-track, [data-stagger-grid]');
  if (!grids.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.querySelectorAll('.product-card, .step-card, .testimonial-card, [data-stagger-item]');
        items.forEach((item, i) => {
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, i * 80);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  grids.forEach(grid => {
    // Set initial hidden state
    const items = grid.querySelectorAll('.product-card, .step-card, .testimonial-card, [data-stagger-item]');
    items.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(24px)';
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    observer.observe(grid);
  });
}

// ── Card Hover Tilt ──
function initCardTilt() {
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
      card.style.transform = `translateY(-5px) rotateX(${y}deg) rotateY(${x}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ── Filter Sidebar Toggle (mobile) ──
function initFilterToggle() {
  const btn = document.getElementById('filter-toggle-btn');
  const sidebar = document.getElementById('filter-sidebar');
  if (!btn || !sidebar) return;
  btn.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    btn.textContent = open ? 'Close Filters ×' : 'Filter & Sort';
  });
}

// ── Hero Parallax (subtle) ──
function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight) return;
    const offset = window.scrollY * 0.3;
    const floats = hero.querySelectorAll('.hero-product-float, .hero-circle-bg');
    floats.forEach((el, i) => {
      el.style.transform = `translateY(${i % 2 === 0 ? offset * 0.4 : -offset * 0.2}px)`;
    });
  }, { passive: true });
}

// ── Newsletter Form ──
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    if (!email || !email.includes('@')) {
      if (window.showToast) showToast('Please enter a valid email address ✉️', 'error');
      return;
    }
    if (window.showToast) showToast('🎉 You\'re subscribed! Check your inbox for 10% off.', 'success');
    form.reset();
  });
}

// ── Wishlist (localStorage) ──
const WISHLIST_KEY = 'luxenaija_wishlist';

function getWishlist() {
  return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
}

function toggleWishlist(productId) {
  let list = getWishlist();
  const idx = list.indexOf(productId);
  if (idx >= 0) {
    list.splice(idx, 1);
    if (window.showToast) showToast('Removed from wishlist', 'info');
  } else {
    list.push(productId);
    if (window.showToast) showToast('❤️ Added to wishlist!', 'success');
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  // Update all heart buttons for this product
  document.querySelectorAll('.wishlist-btn[data-pid="' + productId + '"]').forEach(btn => {
    btn.classList.toggle('active', list.includes(productId));
  });
}

function initWishlistButtons() {
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const pid = parseInt(btn.dataset.pid, 10);
    if (getWishlist().includes(pid)) btn.classList.add('active');
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleWishlist(pid);
      // Heart bounce animation
      btn.style.transform = 'scale(1.4)';
      setTimeout(() => btn.style.transform = '', 250);
    });
  });
}

// ── Image Gallery (product detail) ──
function initGallery() {
  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', function() {
      const main = document.getElementById('gallery-main-img');
      if (!main) return;
      document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      // Fade swap
      main.style.opacity = '0';
      setTimeout(() => {
        main.src = this.querySelector('img').src;
        main.style.opacity = '1';
      }, 200);
    });
  });
}

// ── Pay Method Selector ──
function initPayMethods() {
  document.querySelectorAll('.pay-method').forEach(method => {
    method.addEventListener('click', function() {
      document.querySelectorAll('.pay-method').forEach(m => m.classList.remove('active'));
      this.classList.add('active');
      const radio = this.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });
}

// ── Init All on DOM Ready ──
document.addEventListener('DOMContentLoaded', function() {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initCounters();
  initRipple();
  initCountdown();
  initNavCTA();
  initTestimonialCarousel();
  initFAQ();
  initFilterToggle();
  initNewsletter();
  initPayMethods();
  // Run after a short delay to let JS render product cards
  setTimeout(() => {
    initStaggerGrids();
    initCardTilt();
    initWishlistButtons();
    initGallery();
    initHeroParallax();
  }, 300);
});

// Export helpers for use by main.js
window.LuxeAnim = {
  animateCounter,
  toggleWishlist,
  getWishlist,
  initStaggerGrids,
  initCardTilt,
  initWishlistButtons,
  initRipple
};
