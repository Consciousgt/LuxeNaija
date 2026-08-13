// ========================================================
//  LuxeNaija — Main JavaScript
//  Cart, UI, Animations, Navigation, etc.
// ========================================================

// ── Cart State ──
let cart = JSON.parse(localStorage.getItem('luxenaija_cart') || '[]');

function saveCart() {
  localStorage.setItem('luxenaija_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('#cart-count').forEach(el => {
    el.textContent = totalItems;
    el.style.display = totalItems === 0 ? 'none' : 'flex';
  });
}

function addToCart(productId, size = null, qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const key = `${productId}-${size}`;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ key, productId, size, qty, price: product.price });
  }
  saveCart();
  showToast(`${product.name} added to cart! 🛍️`);
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

// ── Toast ──
let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast) return;
  toastMsg.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ── Format Price ──
function formatPrice(n) {
  return '₦' + n.toLocaleString('en-NG');
}

function savingsPercent(price, orig) {
  return Math.round(((orig - price) / orig) * 100);
}

// ── Product Card HTML ──
function renderProductCard(product) {
  const savings = savingsPercent(product.price, product.originalPrice);
  const badgeHTML = product.badge === 'hot'
    ? `<span class="badge-hot">🔥 HOT</span>`
    : product.badge === 'new'
    ? `<span class="badge-new">✦ NEW</span>`
    : '';
  return `
    <article class="product-card fade-up" 
      id="product-card-${product.id}"
      data-product-id="${product.id}"
      onclick="goToProduct(${product.id})"
      role="button"
      aria-label="${product.brand} ${product.name}, ${formatPrice(product.price)}">
      <div class="product-img-wrap">
        <img src="${product.image}" alt="${product.brand} ${product.name}" loading="lazy">
        <div class="product-badges">
          ${badgeHTML}
        </div>
        <div class="product-actions">
          <button class="product-action-btn" 
            aria-label="Quick add to cart"
            onclick="event.stopPropagation(); addToCart(${product.id}, '${product.sizes[0]}', 1)">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </button>
          <button class="product-action-btn" 
            aria-label="View product details"
            onclick="event.stopPropagation(); goToProduct(${product.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        <div class="product-delivery">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          ≤${product.deliveryDays} days
        </div>
      </div>
      <div class="product-info">
        <div class="product-brand">${product.brand}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-price-row">
          <div>
            <span class="product-price">${formatPrice(product.price)}</span>
            <span class="product-price-orig">${formatPrice(product.originalPrice)}</span>
          </div>
          <span class="product-savings">Save ${savings}%</span>
        </div>
      </div>
    </article>
  `;
}

// ── Navigate to product page ──
function goToProduct(id) {
  localStorage.setItem('luxenaija_viewing', id);
  window.location.href = 'product-detail.html?id=' + id;
}

// ── Navbar scroll ──
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

// ── Mobile Menu ──
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  closeBtn?.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── Fade-up Intersection Observer ──
function initFadeUp() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// ── Animated Counter ──
function animateCounter(el, target, duration = 1800) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.childNodes[0].textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count, 10);
        animateCounter(entry.target, target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => obs.observe(el));
}

// ── Home: Featured Products Grid ──
function initFeaturedGrid() {
  const grid = document.getElementById('featured-grid');
  if (!grid || !window.PRODUCTS) return;
  const featured = PRODUCTS.slice(0, 8);
  grid.innerHTML = featured.map(renderProductCard).join('');
  initFadeUp();
}

// ── Newsletter ──
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email')?.value.trim();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.');
      return;
    }
    showToast('🎉 You\'re subscribed! Check your email for 10% off.');
    form.reset();
  });
}

// ── Products Page ──
function initProductsPage() {
  const grid = document.getElementById('products-grid');
  if (!grid || !window.PRODUCTS) return;

  let filtered = [...PRODUCTS];
  const countEl = document.getElementById('product-count');
  const sortEl = document.getElementById('sort-select');

  function renderGrid(products) {
    if (products.length === 0) {
      grid.innerHTML = `<div class="no-results">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <h3 style="margin:0.5rem 0;font-family:var(--font-display)">No products found</h3>
        <p>Try adjusting your filters</p>
      </div>`;
    } else {
      grid.innerHTML = products.map(renderProductCard).join('');
    }
    if (countEl) countEl.textContent = products.length;
    initFadeUp();
  }

  function applyFilters() {
    const brands = [...document.querySelectorAll('.filter-brand:checked')].map(el => el.value);
    const cats = [...document.querySelectorAll('.filter-cat:checked')].map(el => el.value);
    const genders = [...document.querySelectorAll('.filter-gender:checked')].map(el => el.value);
    const maxPrice = parseInt(document.getElementById('price-range')?.value || '999999999', 10);

    filtered = PRODUCTS.filter(p => {
      if (brands.length && !brands.includes(p.brand)) return false;
      if (cats.length && !cats.includes(p.category)) return false;
      if (genders.length && !genders.includes(p.gender)) return false;
      if (p.price > maxPrice) return false;
      return true;
    });
    applySort();
  }

  function applySort() {
    const sort = sortEl?.value || 'featured';
    if (sort === 'price-asc') filtered.sort((a,b) => a.price - b.price);
    else if (sort === 'price-desc') filtered.sort((a,b) => b.price - a.price);
    else if (sort === 'savings') filtered.sort((a,b) => savingsPercent(b.price, b.originalPrice) - savingsPercent(a.price, a.originalPrice));
    else if (sort === 'rating') filtered.sort((a,b) => b.rating - a.rating);
    else filtered = PRODUCTS.filter(p => filtered.includes(p));
    renderGrid(filtered);
  }

  document.querySelectorAll('.filter-brand, .filter-cat, .filter-gender').forEach(el => {
    el.addEventListener('change', applyFilters);
  });
  document.getElementById('price-range')?.addEventListener('input', (e) => {
    const label = document.getElementById('price-max-label');
    if (label) label.textContent = '₦' + parseInt(e.target.value).toLocaleString();
    applyFilters();
  });
  sortEl?.addEventListener('change', applySort);

  // Check URL params
  const params = new URLSearchParams(window.location.search);
  if (params.get('cat')) {
    const checkEl = document.querySelector(`.filter-cat[value="${params.get('cat')}"]`);
    if (checkEl) { checkEl.checked = true; }
  }
  if (params.get('brand')) {
    const checkEl = document.querySelector(`.filter-brand[value="${params.get('brand')}"]`);
    if (checkEl) { checkEl.checked = true; }
  }

  applyFilters();
}

// ── Product Detail Page ──
function initDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id') || localStorage.getItem('luxenaija_viewing'), 10);
  if (!id || !window.PRODUCTS) return;

  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;

  // Update page title & meta
  document.title = `${product.brand} ${product.name} — LuxeNaija`;

  // Fill fields
  const setEl = (selector, val, prop = 'textContent') => {
    const el = document.querySelector(selector);
    if (el) el[prop] = val;
  };

  setEl('#detail-brand', product.brand);
  setEl('#detail-name', product.name);
  setEl('#detail-price', formatPrice(product.price));
  setEl('#detail-price-orig', formatPrice(product.originalPrice));
  setEl('#detail-savings', `Save ${savingsPercent(product.price, product.originalPrice)}%`);
  setEl('#detail-desc', product.description);
  setEl('#detail-delivery-days', `≤ ${product.deliveryDays} days`);
  setEl('#detail-rating', product.rating.toFixed(1));
  setEl('#detail-reviews', `${product.reviews} reviews`);

  // Main image
  const mainImg = document.getElementById('detail-main-img');
  if (mainImg) { mainImg.src = product.image; mainImg.alt = `${product.brand} ${product.name}`; }

  // Sizes
  const sizeGrid = document.getElementById('size-grid');
  if (sizeGrid) {
    sizeGrid.innerHTML = product.sizes.map(s => `<button class="size-btn" data-size="${s}">${s}</button>`).join('');
    sizeGrid.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sizeGrid.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    // Default select first
    sizeGrid.querySelector('.size-btn')?.classList.add('active');
  }

  // Quantity
  let qty = 1;
  const qtyDisplay = document.getElementById('qty-display');
  document.getElementById('qty-minus')?.addEventListener('click', () => {
    if (qty > 1) qty--;
    if (qtyDisplay) qtyDisplay.textContent = qty;
  });
  document.getElementById('qty-plus')?.addEventListener('click', () => {
    if (qty < 10) qty++;
    if (qtyDisplay) qtyDisplay.textContent = qty;
  });

  // Add to cart button
  document.getElementById('detail-add-cart')?.addEventListener('click', () => {
    const activeSize = sizeGrid?.querySelector('.size-btn.active')?.dataset.size || product.sizes[0];
    addToCart(product.id, activeSize, qty);
  });

  // Related products
  const relGrid = document.getElementById('related-grid');
  if (relGrid) {
    const related = PRODUCTS.filter(p => p.id !== id && (p.brand === product.brand || p.category === product.category)).slice(0, 4);
    relGrid.innerHTML = related.map(renderProductCard).join('');
  }

  // Accordion
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const body = trigger.nextElementSibling;
      const isOpen = trigger.classList.toggle('open');
      if (body) body.classList.toggle('open', isOpen);
    });
  });

  initFadeUp();
}

// ── Cart Page ──
function initCartPage() {
  const cartItemsEl = document.getElementById('cart-items');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryTotal = document.getElementById('summary-total');
  const emptyCart = document.getElementById('cart-empty');
  const cartContent = document.getElementById('cart-content');

  function renderCart() {
    if (!cart.length) {
      if (emptyCart) emptyCart.style.display = 'block';
      if (cartContent) cartContent.style.display = 'none';
      return;
    }
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartContent) cartContent.style.display = 'grid';
    if (!cartItemsEl) return;

    cartItemsEl.innerHTML = cart.map(item => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      if (!product) return '';
      return `
        <div class="cart-item" id="cart-item-${item.key.replace(/[^a-z0-9]/gi, '_')}">
          <div class="cart-item-img">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
          </div>
          <div class="cart-item-info">
            <div class="cart-item-brand">${product.brand}</div>
            <div class="cart-item-name">${product.name}</div>
            <div class="cart-item-meta">Size: ${item.size || 'One Size'} · Qty: ${item.qty}</div>
            <button class="cart-item-remove btn-ghost" onclick="removeItem('${item.key}')">✕ Remove</button>
          </div>
          <div class="cart-item-price">${formatPrice(product.price * item.qty)}</div>
        </div>
      `;
    }).join('');

    const subtotal = getCartTotal();
    const shipping = 3500;
    const total = subtotal + shipping;
    if (summarySubtotal) summarySubtotal.textContent = formatPrice(subtotal);
    if (summaryTotal) summaryTotal.textContent = formatPrice(total);
    document.getElementById('summary-shipping').textContent = formatPrice(shipping);
    document.getElementById('summary-savings').textContent = '₦' + cart.reduce((sum, item) => {
      const p = PRODUCTS.find(pr => pr.id === item.productId);
      return sum + ((p ? (p.originalPrice - p.price) : 0) * item.qty);
    }, 0).toLocaleString();
  }

  window.removeItem = function(key) {
    removeFromCart(key);
    renderCart();
  };

  // Pay method toggle
  document.querySelectorAll('.pay-method').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Checkout form
  document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('🎉 Order placed! We\'ll confirm via WhatsApp within 24 hours.');
    setTimeout(() => {
      cart = [];
      saveCart();
      renderCart();
    }, 2000);
  });

  renderCart();
}

// ── Live Search Modal ──
function initLiveSearch() {
  const searchBtn = document.getElementById('search-trigger-btn');
  const searchModal = document.getElementById('search-modal');
  const searchClose = document.getElementById('search-modal-close');
  const searchInput = document.getElementById('search-modal-input');
  const searchResults = document.getElementById('search-modal-results');

  if (!searchModal) return;

  function openSearch() {
    searchModal.classList.add('open');
    if (searchInput) {
      searchInput.value = '';
      setTimeout(() => searchInput.focus(), 100);
    }
    renderSearchResults('');
  }

  function closeSearch() {
    searchModal.classList.remove('open');
  }

  searchBtn?.addEventListener('click', openSearch);
  searchClose?.addEventListener('click', closeSearch);

  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) closeSearch();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModal.classList.contains('open')) {
      closeSearch();
    }
  });

  function renderSearchResults(query) {
    if (!searchResults || !window.PRODUCTS) return;
    const q = query.toLowerCase().trim();
    const matches = PRODUCTS.filter(p => 
      !q || 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    ).slice(0, 6);

    if (matches.length === 0) {
      searchResults.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--white-dim)">No products found matching "${query}"</div>`;
    } else {
      searchResults.innerHTML = matches.map(p => `
        <div class="search-result-item" onclick="closeSearch(); goToProduct(${p.id})">
          <div class="search-result-img"><img src="${p.image}" alt="${p.name}"></div>
          <div style="flex:1">
            <div style="font-size:0.68rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold)">${p.brand}</div>
            <div style="font-family:var(--font-display);font-size:1.05rem;font-weight:600;color:var(--white)">${p.name}</div>
          </div>
          <div style="font-family:var(--font-display);font-size:1.15rem;font-weight:700;color:var(--gold)">${formatPrice(p.price)}</div>
        </div>
      `).join('');
    }
  }

  searchInput?.addEventListener('input', (e) => {
    renderSearchResults(e.target.value);
  });
}

// ── Init on DOM ready ──
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  initNavbar();
  initMobileMenu();
  initFadeUp();
  initCounters();
  initNewsletter();
  initFeaturedGrid();
  initProductsPage();
  initDetailPage();
  initCartPage();
  initFAQ();
  initLiveSearch();
});
