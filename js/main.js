// ============================================================
//  LuxeNaija — Main Application Controller (main.js)
//  Cart, Dynamic Catalog, Search, QuickView & Checkout
// ============================================================

// ── Cart State ──
let cart = JSON.parse(localStorage.getItem('luxenaija_cart') || '[]');

function saveCart() {
  localStorage.setItem('luxenaija_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const total = cart.reduce((s, i) => s + (parseInt(i.qty, 10) || 1), 0);
  document.querySelectorAll('#cart-count, .cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total === 0 ? 'none' : 'flex';
  });
}

// ── Toast Notification ──
let toastTimeout;
function showToast(msg, type) {
  type = type || 'success';
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  const toastIcon = document.getElementById('toast-icon');
  if (!toast) return;
  
  const icons = { success: '✓', error: '✕', info: 'ℹ', cart: '🛍️' };
  const colors = { success: 'var(--green-dark)', error: '#dc2626', info: '#2563eb', cart: 'var(--green-dark)' };
  
  if (toastIcon) toastIcon.textContent = icons[type] || '✓';
  if (toastMsg) toastMsg.textContent = msg;
  toast.style.background = colors[type] || 'var(--green-dark)';
  
  toast.classList.remove('hide');
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.classList.remove('hide'), 300);
  }, 3200);
}

// ── Format Price in Nigerian Naira ──
function formatPrice(n) {
  return '₦' + Number(n || 0).toLocaleString('en-NG');
}

function savingsPercent(price, orig) {
  if (!orig || orig <= price) return 0;
  return Math.round(((orig - price) / orig) * 100);
}

// ── Fly-to-Cart Trajectory Animation ──
function flyToCart(sourceEl) {
  const cartBtn = document.getElementById('cart-btn');
  if (!sourceEl || !cartBtn) return;
  
  const srcRect = sourceEl.getBoundingClientRect();
  const cartRect = cartBtn.getBoundingClientRect();

  let imgSrc = '';
  const card = sourceEl.closest('.product-card, .quickview-panel, .product-detail-layout');
  if (card) {
    const img = card.querySelector('img');
    if (img) imgSrc = img.src;
  }

  const fly = document.createElement(imgSrc ? 'img' : 'div');
  fly.className = 'cart-fly-item';
  if (imgSrc) {
    fly.src = imgSrc;
  } else {
    fly.style.background = 'var(--green)';
    fly.style.borderRadius = '50%';
  }

  const flyX = (cartRect.left + cartRect.width/2) - (srcRect.left + srcRect.width/2);
  const flyY = (cartRect.top + cartRect.height/2) - (srcRect.top + srcRect.height/2);

  fly.style.left = (srcRect.left + srcRect.width/2 - 24) + 'px';
  fly.style.top  = (srcRect.top  + srcRect.height/2 - 24) + 'px';
  fly.style.setProperty('--fly-x', flyX + 'px');
  fly.style.setProperty('--fly-y', flyY + 'px');

  document.body.appendChild(fly);

  setTimeout(() => {
    cartBtn.style.animation = 'cartBounce 0.5s ease';
    setTimeout(() => cartBtn.style.animation = '', 500);
    fly.remove();
  }, 620);
}

// ── Add to Cart ──
function addToCart(productId, size, qty, sourceEl) {
  size = size || 'Standard';
  qty = parseInt(qty, 10) || 1;
  const products = window.PRODUCTS || [];
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const key = productId + '-' + size;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      key: key,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      size: size,
      qty: qty
    });
  }
  
  saveCart();
  if (sourceEl) flyToCart(sourceEl);
  showToast(`${product.brand} ${product.name} added! 🛍️`, 'cart');
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
  renderCartPage();
  showToast('Item removed from cart', 'info');
}

function updateQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  renderCartPage();
}

function getCartTotal() {
  return cart.reduce((s, i) => s + (i.price * i.qty), 0);
}

function getCartSavings() {
  return cart.reduce((s, i) => {
    const orig = i.originalPrice || (i.price * 1.6);
    return s + ((orig - i.price) * i.qty);
  }, 0);
}

// ── Product Card Render HTML ──
function renderProductCard(product) {
  const savings = savingsPercent(product.price, product.originalPrice);
  const badgeHTML = product.badge === 'hot'
    ? '<span class="badge-hot">🔥 HOT</span>'
    : product.badge === 'new'
    ? '<span class="badge-new">✦ NEW</span>'
    : '';
  const starsHTML = '★'.repeat(Math.round(product.rating || 5)) + '☆'.repeat(5 - Math.round(product.rating || 5));
  const defaultSize = (product.sizes && product.sizes.length) ? product.sizes[0] : 'Standard';

  return `
    <article class="product-card"
      id="product-card-${product.id}"
      data-product-id="${product.id}"
      onclick="goToProduct(${product.id})"
      role="button"
      tabindex="0"
      aria-label="${product.brand} ${product.name}, ${formatPrice(product.price)}">
      <div class="product-img-wrap">
        <img src="${product.image}" alt="${product.brand} ${product.name}" loading="lazy">
        <div class="product-badges">${badgeHTML}</div>
        <div class="product-actions">
          <button class="product-action-btn wishlist-btn" data-pid="${product.id}"
            aria-label="Add to wishlist"
            onclick="event.stopPropagation(); (window.LuxeAnim||{toggleWishlist:()=>{}}).toggleWishlist(${product.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button class="product-action-btn"
            aria-label="Quick view"
            onclick="event.stopPropagation(); openQuickView(${product.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="product-action-btn"
            aria-label="Add to cart"
            onclick="event.stopPropagation(); addToCart(${product.id}, '${defaultSize}', 1, this)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </button>
        </div>
        <div class="product-delivery">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          ≤${product.deliveryDays || 30} days
        </div>
      </div>
      <div class="product-info">
        <div class="product-brand">${product.brand}</div>
        <div class="product-name">${product.name}</div>
        <div style="font-size:0.72rem;color:#FBBF24;margin-bottom:0.35rem">${starsHTML} <span style="color:var(--text-muted);font-size:0.75rem">(${product.reviews || 42})</span></div>
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

// ── Navigate to Product Detail ──
function goToProduct(id) {
  localStorage.setItem('luxenaija_viewing', id);
  window.location.href = 'product-detail.html?id=' + id;
}

// ── QuickView Modal ──
function openQuickView(productId) {
  const product = (window.PRODUCTS || []).find(p => p.id === productId);
  if (!product) return;

  let overlay = document.getElementById('quickview-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'quickview-overlay';
    overlay.className = 'quickview-overlay';
    overlay.innerHTML = '<div class="quickview-panel" id="quickview-panel"><div id="quickview-img" style="background:var(--off-white)"></div><div style="padding:2rem;overflow-y:auto" id="quickview-info"></div></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeQuickView(); });
  }

  const imgEl = document.getElementById('quickview-img');
  const infoEl = document.getElementById('quickview-info');
  const savings = savingsPercent(product.price, product.originalPrice);

  if (imgEl) {
    imgEl.innerHTML = `<img src="${product.image}" alt="${product.brand}" style="width:100%;height:100%;object-fit:cover;min-height:320px">`;
  }

  if (infoEl) {
    infoEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
        <span style="font-size:0.72rem;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:var(--green)">${product.brand}</span>
        <button onclick="closeQuickView()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--text-muted);line-height:1">✕</button>
      </div>
      <h3 style="font-family:var(--font-display);font-size:1.6rem;font-weight:700;color:var(--text);margin-bottom:0.75rem;line-height:1.2">${product.name}</h3>
      <div style="display:flex;align-items:baseline;gap:0.75rem;margin-bottom:1rem">
        <span style="font-size:1.6rem;font-weight:800;color:var(--green-dark)">${formatPrice(product.price)}</span>
        <span style="font-size:1rem;text-decoration:line-through;color:var(--text-muted)">${formatPrice(product.originalPrice)}</span>
        <span style="font-size:0.75rem;background:var(--green-xlight);color:var(--green-dark);padding:0.2rem 0.6rem;border-radius:99px;font-weight:700">Save ${savings}%</span>
      </div>
      <p style="font-size:0.88rem;color:var(--text-muted);line-height:1.6;margin-bottom:1.25rem">${product.description || 'Authentic designer item delivered directly from brand stores to Nigeria.'}</p>
      <div style="margin-bottom:1.25rem">
        <div style="font-size:0.8rem;font-weight:700;margin-bottom:0.5rem">Sizes / Options:</div>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
          ${(product.sizes || ['Standard']).map((s, idx) => `<span style="padding:0.35rem 0.85rem;border:1.5px solid ${idx===0?'var(--green)':'var(--border)'};background:${idx===0?'var(--green-xlight)':'#fff'};color:${idx===0?'var(--green-dark)':'var(--text)'};border-radius:99px;font-size:0.8rem;font-weight:600;cursor:pointer" onclick="this.parentNode.querySelectorAll('span').forEach(el=>{el.style.borderColor='var(--border)';el.style.background='#fff';el.style.color='var(--text)'}); this.style.borderColor='var(--green)'; this.style.background='var(--green-xlight)'; this.style.color='var(--green-dark)'; window._selectedQuickSize='${s}';">${s}</span>`).join('')}
        </div>
      </div>
      <div style="display:flex;gap:0.75rem">
        <button class="btn btn-primary ripple-container" style="flex:1;justify-content:center" onclick="addToCart(${product.id}, window._selectedQuickSize || '${(product.sizes||['Standard'])[0]}', 1, this); closeQuickView()">Add to Cart 🛍️</button>
        <button class="btn btn-outline" onclick="closeQuickView(); goToProduct(${product.id})">Full Details →</button>
      </div>
    `;
    window._selectedQuickSize = (product.sizes && product.sizes.length) ? product.sizes[0] : 'Standard';
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const overlay = document.getElementById('quickview-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Home Page: Featured Products ──
function initFeaturedGrid() {
  const grid = document.getElementById('featured-grid');
  const skeleton = document.getElementById('featured-skeleton');
  if (!grid) return;

  const products = window.PRODUCTS || [];
  const featured = products.filter(p => p.isFeatured).slice(0, 8);
  const itemsToRender = featured.length ? featured : products.slice(0, 8);

  if (skeleton) skeleton.style.display = 'none';
  grid.style.display = 'grid';
  grid.innerHTML = itemsToRender.map(renderProductCard).join('');

  if (window.LuxeAnim) {
    window.LuxeAnim.initStaggerGrids();
    window.LuxeAnim.initCardTilt();
    window.LuxeAnim.initWishlistButtons();
    window.LuxeAnim.initRipple();
  }
}

// ── Products Page Filtering & Sorting ──
let allProducts = [];
let activeFilters = { brands: [], categories: [], minPrice: 0, maxPrice: Infinity };
let activeSortBy = 'featured';

function initProductsPage() {
  const grid = document.getElementById('products-grid') || document.getElementById('products-main-grid');
  if (!grid) return;

  allProducts = window.PRODUCTS || [];
  const skeleton = document.getElementById('products-skeleton');
  if (skeleton) skeleton.style.display = 'none';
  grid.style.display = 'grid';

  initFilterListeners();
  handleURLParameters();
  renderFilteredCatalog();
}

function handleURLParameters() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  const brand = params.get('brand');
  const sale = params.get('sale');

  if (cat) {
    activeFilters.categories = [cat.toLowerCase()];
    document.querySelectorAll(`input[data-cat="${cat}"], input.filter-cat[value="${cat}"]`).forEach(cb => cb.checked = true);
  }
  if (brand) {
    activeFilters.brands = [brand];
    document.querySelectorAll(`input[data-brand="${brand}"], input.filter-brand[value="${brand}"]`).forEach(cb => cb.checked = true);
  }
  if (sale === '1') {
    allProducts = allProducts.filter(p => p.isSale || savingsPercent(p.price, p.originalPrice) >= 50);
  }
}

function initFilterListeners() {
  document.querySelectorAll('input[data-brand], input.filter-brand').forEach(cb => {
    cb.addEventListener('change', function() {
      const brandVal = this.dataset.brand || this.value;
      if (this.checked) {
        if (!activeFilters.brands.includes(brandVal)) activeFilters.brands.push(brandVal);
      } else {
        activeFilters.brands = activeFilters.brands.filter(b => b.toLowerCase() !== brandVal.toLowerCase());
      }
      renderFilteredCatalog();
      updateFilterChips();
    });
  });

  document.querySelectorAll('input[data-cat], input.filter-cat').forEach(cb => {
    cb.addEventListener('change', function() {
      const catVal = (this.dataset.cat || this.value).toLowerCase();
      if (this.checked) {
        if (!activeFilters.categories.includes(catVal)) activeFilters.categories.push(catVal);
      } else {
        activeFilters.categories = activeFilters.categories.filter(c => c !== catVal);
      }
      renderFilteredCatalog();
      updateFilterChips();
    });
  });

  const minInput = document.getElementById('price-min');
  const maxInput = document.getElementById('price-max');
  if (minInput) minInput.addEventListener('input', () => {
    activeFilters.minPrice = parseInt(minInput.value, 10) || 0;
    renderFilteredCatalog();
  });
  if (maxInput) maxInput.addEventListener('input', () => {
    activeFilters.maxPrice = parseInt(maxInput.value, 10) || Infinity;
    renderFilteredCatalog();
  });

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.addEventListener('change', e => {
    activeSortBy = e.target.value;
    renderFilteredCatalog();
  });

  const clearBtn = document.getElementById('clear-filters');
  if (clearBtn) clearBtn.addEventListener('click', clearFilters);
}

function clearFilters() {
  activeFilters = { brands: [], categories: [], minPrice: 0, maxPrice: Infinity };
  document.querySelectorAll('input[data-brand], input.filter-brand, input[data-cat], input.filter-cat').forEach(cb => cb.checked = false);
  const minInput = document.getElementById('price-min');
  const maxInput = document.getElementById('price-max');
  if (minInput) minInput.value = '';
  if (maxInput) maxInput.value = '';
  renderFilteredCatalog();
  updateFilterChips();
}

function renderFilteredCatalog() {
  const grid = document.getElementById('products-grid') || document.getElementById('products-main-grid');
  const countEl = document.getElementById('products-count');
  if (!grid) return;

  let list = [...allProducts];

  if (activeFilters.brands.length > 0) {
    list = list.filter(p => activeFilters.brands.some(b => b.toLowerCase() === p.brand.toLowerCase()));
  }

  if (activeFilters.categories.length > 0) {
    list = list.filter(p => activeFilters.categories.some(c => c.toLowerCase() === (p.category || '').toLowerCase()));
  }

  list = list.filter(p => p.price >= activeFilters.minPrice && p.price <= activeFilters.maxPrice);

  switch (activeSortBy) {
    case 'price-asc': list.sort((a,b) => a.price - b.price); break;
    case 'price-desc': list.sort((a,b) => b.price - a.price); break;
    case 'savings': list.sort((a,b) => savingsPercent(b.price, b.originalPrice) - savingsPercent(a.price, a.originalPrice)); break;
    case 'newest': list.sort((a,b) => b.id - a.id); break;
    default: list.sort((a,b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  if (countEl) countEl.textContent = `${list.length} item${list.length !== 1 ? 's' : ''} available`;

  if (!list.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:5rem 2rem;color:var(--text-muted)">
        <div style="font-size:3.5rem;margin-bottom:1rem">🔍</div>
        <h3 style="font-size:1.3rem;font-weight:700;margin-bottom:0.5rem;color:var(--text)">No Luxury Items Found</h3>
        <p style="font-size:0.9rem;margin-bottom:1.5rem">Try clearing your filters to see our full catalog.</p>
        <button onclick="clearFilters()" class="btn btn-primary" style="margin-inline:auto">Reset Filters</button>
      </div>`;
  } else {
    grid.innerHTML = list.map(renderProductCard).join('');
    if (window.LuxeAnim) {
      window.LuxeAnim.initStaggerGrids();
      window.LuxeAnim.initCardTilt();
      window.LuxeAnim.initWishlistButtons();
      window.LuxeAnim.initRipple();
    }
  }
}

function updateFilterChips() {
  const area = document.getElementById('active-filters');
  if (!area) return;

  const chips = [];
  activeFilters.brands.forEach(b => chips.push({ label: b, type: 'brand', val: b }));
  activeFilters.categories.forEach(c => chips.push({ label: c.toUpperCase(), type: 'cat', val: c }));

  if (!chips.length) { area.innerHTML = ''; return; }

  area.innerHTML = `
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;margin-bottom:1.25rem">
      <span style="font-size:0.8rem;font-weight:700;color:var(--text-muted)">Filters:</span>
      ${chips.map(chip => `
        <span style="display:inline-flex;align-items:center;gap:0.4rem;background:var(--green-xlight);border:1px solid var(--green-light);border-radius:99px;padding:0.25rem 0.75rem;font-size:0.75rem;font-weight:700;color:var(--green-dark)">
          ${chip.label}
          <button onclick="removeFilterChip('${chip.type}','${chip.val}')" style="background:none;border:none;cursor:pointer;color:var(--green-dark);font-size:1rem;padding:0;line-height:1">✕</button>
        </span>
      `).join('')}
      <button onclick="clearFilters()" style="background:none;border:none;font-size:0.78rem;font-weight:700;color:var(--green);cursor:pointer;text-decoration:underline;padding-left:0.5rem">Clear All</button>
    </div>`;
}

function removeFilterChip(type, val) {
  if (type === 'brand') {
    activeFilters.brands = activeFilters.brands.filter(b => b.toLowerCase() !== val.toLowerCase());
    document.querySelectorAll(`input[data-brand="${val}"], input.filter-brand[value="${val}"]`).forEach(cb => cb.checked = false);
  } else {
    activeFilters.categories = activeFilters.categories.filter(c => c.toLowerCase() !== val.toLowerCase());
    document.querySelectorAll(`input[data-cat="${val}"], input.filter-cat[value="${val}"]`).forEach(cb => cb.checked = false);
  }
  renderFilteredCatalog();
  updateFilterChips();
}

// ── Product Detail Page ──
function initProductDetailPage() {
  const detailName = document.getElementById('detail-name');
  if (!detailName) return;

  const params = new URLSearchParams(window.location.search);
  let id = parseInt(params.get('id'), 10);
  if (!id) {
    id = parseInt(localStorage.getItem('luxenaija_viewing'), 10) || 1;
  }

  const products = window.PRODUCTS || [];
  const product = products.find(p => p.id === id) || products[0];
  if (!product) return;

  document.title = `${product.brand} ${product.name} — LuxeNaija`;

  const brandEl = document.getElementById('detail-brand');
  if (brandEl) brandEl.textContent = product.brand;
  detailName.textContent = product.name;

  const priceEl = document.getElementById('detail-price');
  if (priceEl) priceEl.textContent = formatPrice(product.price);

  const origEl = document.getElementById('detail-orig');
  if (origEl) origEl.textContent = formatPrice(product.originalPrice);

  const savingsEl = document.getElementById('detail-savings');
  if (savingsEl) savingsEl.textContent = `Save ${savingsPercent(product.price, product.originalPrice)}%`;

  const descEl = document.getElementById('detail-desc');
  if (descEl) descEl.textContent = product.description || 'Crafted with premium materials and sourced directly from official brand boutiques with full receipts.';

  const bcEl = document.getElementById('detail-breadcrumb-name');
  if (bcEl) bcEl.textContent = `${product.brand} ${product.name}`;

  const mainImgWrap = document.getElementById('detail-main-img');
  if (mainImgWrap) {
    mainImgWrap.innerHTML = `<img id="gallery-main-img" src="${product.image}" alt="${product.brand} ${product.name}" style="width:100%;height:100%;object-fit:cover;transition:opacity 0.2s ease">`;
  }

  const sizesContainer = document.getElementById('detail-sizes');
  if (sizesContainer) {
    const sizes = (product.sizes && product.sizes.length) ? product.sizes : ['Standard One Size'];
    window._selectedDetailSize = sizes[0];
    sizesContainer.innerHTML = sizes.map((s, idx) => `
      <button class="size-btn ${idx===0?'active':''}" onclick="selectDetailSize(this, '${s}')">${s}</button>
    `).join('');
  }

  const addBtn = document.getElementById('detail-add-cart');
  if (addBtn) {
    addBtn.onclick = () => {
      const qtyInput = document.getElementById('detail-qty');
      const qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
      addToCart(product.id, window._selectedDetailSize || 'Standard', qty, addBtn);
    };
  }

  const qtyMinus = document.getElementById('detail-qty-minus');
  const qtyPlus = document.getElementById('detail-qty-plus');
  const qtyInput = document.getElementById('detail-qty');
  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.onclick = () => {
      const v = parseInt(qtyInput.value, 10) || 1;
      if (v > 1) qtyInput.value = v - 1;
    };
    qtyPlus.onclick = () => {
      const v = parseInt(qtyInput.value, 10) || 1;
      if (v < 10) qtyInput.value = v + 1;
    };
  }

  const wishBtn = document.getElementById('detail-wishlist');
  if (wishBtn) {
    wishBtn.dataset.pid = product.id;
    const wl = JSON.parse(localStorage.getItem('luxenaija_wishlist') || '[]');
    if (wl.includes(product.id)) wishBtn.classList.add('active');
    wishBtn.onclick = () => {
      if (window.LuxeAnim) window.LuxeAnim.toggleWishlist(product.id);
    };
  }

  const relatedGrid = document.getElementById('related-grid');
  if (relatedGrid) {
    const related = products.filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand)).slice(0, 4);
    relatedGrid.innerHTML = related.map(renderProductCard).join('');
  }
}

function selectDetailSize(btn, size) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  window._selectedDetailSize = size;
}

// ── Cart & Checkout Page ──
function initCartPage() {
  const cartList = document.getElementById('cart-items') || document.getElementById('cart-items-list');
  if (!cartList) return;

  renderCartPage();
  bindCheckoutHandlers();
}

function renderCartPage() {
  const cartList = document.getElementById('cart-items') || document.getElementById('cart-items-list');
  const emptyEl = document.getElementById('cart-empty');
  const contentEl = document.getElementById('cart-content');
  const subtotalEl = document.getElementById('summary-subtotal') || document.getElementById('cart-subtotal');
  const shippingEl = document.getElementById('summary-shipping');
  const totalEl = document.getElementById('summary-total') || document.getElementById('cart-total');
  const savingsEl = document.getElementById('summary-savings');

  if (!cartList) return;

  if (!cart.length) {
    cartList.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    if (contentEl) contentEl.style.display = 'none';
    if (subtotalEl) subtotalEl.textContent = formatPrice(0);
    if (totalEl) totalEl.textContent = formatPrice(0);
    if (savingsEl) savingsEl.textContent = formatPrice(0);
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'grid';

  cartList.innerHTML = cart.map(item => {
    const price = item.price || 0;
    const qty = item.qty || 1;
    return `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${item.image || 'images/logo.jpg'}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <div class="cart-item-brand">${item.brand || 'Luxury'}</div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-size">Option: <strong>${item.size || 'Standard'}</strong></div>
          <div class="qty-control">
            <button class="qty-btn" onclick="updateQty('${item.key}', -1)">−</button>
            <span class="qty-num">${qty}</span>
            <button class="qty-btn" onclick="updateQty('${item.key}', 1)">+</button>
            <button class="cart-item-remove" onclick="removeFromCart('${item.key}')">Remove</button>
          </div>
        </div>
        <div class="cart-item-price">
          <div class="price">${formatPrice(price * qty)}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem">${formatPrice(price)} each</div>
        </div>
      </div>
    `;
  }).join('');

  const subtotal = getCartTotal();
  const shipping = subtotal >= 150000 ? 0 : 3500;
  const total = subtotal + shipping;
  const totalSavings = getCartSavings();

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
  if (totalEl) totalEl.textContent = formatPrice(total);
  if (savingsEl) savingsEl.textContent = formatPrice(totalSavings);
}

function bindCheckoutHandlers() {
  const checkoutForm = document.getElementById('checkout-form');
  const placeBtn = document.getElementById('place-order-btn');

  function handleOrderSubmission(e) {
    if (e) e.preventDefault();
    if (!cart.length) {
      showToast('Your pre-order cart is empty! 🛍️', 'error');
      return;
    }

    const firstName = document.getElementById('first-name')?.value?.trim() || '';
    const lastName = document.getElementById('last-name')?.value?.trim() || '';
    const name = document.getElementById('order-name')?.value?.trim() || `${firstName} ${lastName}`.trim();
    const email = document.getElementById('email')?.value?.trim() || document.getElementById('order-email')?.value?.trim() || '';
    const phone = document.getElementById('phone')?.value?.trim() || document.getElementById('order-phone')?.value?.trim() || '';
    const address = document.getElementById('address')?.value?.trim() || document.getElementById('order-address')?.value?.trim() || '';
    const state = document.getElementById('state')?.value || document.getElementById('order-state')?.value || '';

    if (!name || !email || !phone || !address || !state) {
      showToast('Please fill in all delivery details ✍️', 'error');
      return;
    }

    const orderId = 'LN-' + Math.floor(100000 + Math.random() * 900000);
    const orderData = {
      id: orderId,
      date: new Date().toISOString(),
      customer: { name, email, phone, address, state },
      items: [...cart],
      subtotal: getCartTotal(),
      total: getCartTotal() + (getCartTotal() >= 150000 ? 0 : 3500),
      batch: 'Batch 7',
      status: 'Payment Confirmed'
    };

    const orders = JSON.parse(localStorage.getItem('luxenaija_orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('luxenaija_orders', JSON.stringify(orders));

    cart = [];
    saveCart();
    renderCartPage();

    showOrderSuccessModal(orderData);
  }

  if (checkoutForm) checkoutForm.addEventListener('submit', handleOrderSubmission);
  if (placeBtn) placeBtn.addEventListener('click', handleOrderSubmission);
}

function showOrderSuccessModal(order) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay open';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(12,81,63,0.6);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1.5rem';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:24px;max-width:480px;width:100%;padding:2.5rem;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,0.2)">
      <div style="width:68px;height:68px;background:var(--green-xlight);border:2px solid var(--green);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;font-size:2rem;color:var(--green)">✓</div>
      <h3 style="font-family:var(--font-display);font-size:1.8rem;font-weight:700;color:var(--text);margin-bottom:0.5rem">Pre-Order Confirmed!</h3>
      <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:1.5rem">Thank you, <strong>${order.customer.name}</strong>! Your items have been locked in for <strong>Batch 7</strong> sourcing.</p>
      <div style="background:var(--off-white);padding:1rem;border-radius:12px;margin-bottom:1.5rem;font-size:0.85rem;text-align:left">
        <div style="display:flex;justify-content:space-between;margin-bottom:0.35rem"><span>Order ID:</span><strong style="color:var(--green-dark)">${order.id}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.35rem"><span>Total:</span><strong>${formatPrice(order.total)}</strong></div>
        <div style="display:flex;justify-content:space-between"><span>Delivery:</span><span>≤30 Days (${order.customer.state})</span></div>
      </div>
      <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1.5rem">We have sent a confirmation to <strong>${order.customer.email}</strong> and our team will contact your WhatsApp.</p>
      <button class="btn btn-primary btn-full" onclick="this.closest('.modal-overlay').remove(); window.location.href='index.html'" style="justify-content:center">Continue to Home →</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// ── Live Search ──
function initLiveSearch() {
  const trigger = document.getElementById('search-trigger-btn');
  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-modal-input');
  const closeBtn = document.getElementById('search-modal-close');
  const results = document.getElementById('search-modal-results');
  if (!trigger || !modal) return;

  function openSearch() {
    modal.classList.add('open');
    setTimeout(() => input && input.focus(), 80);
    document.body.style.overflow = 'hidden';
  }

  function closeSearch() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (input) input.value = '';
    if (results) results.innerHTML = '';
  }

  trigger.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);
  modal.addEventListener('click', e => { if (e.target === modal) closeSearch(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });

  if (!input || !results) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { results.innerHTML = ''; return; }

    const products = window.PRODUCTS || [];
    const matches = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    ).slice(0, 8);

    if (!matches.length) {
      results.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--text-muted);font-size:0.9rem">No designer items found for "${q}"</div>`;
      return;
    }

    results.innerHTML = matches.map(p => `
      <div class="search-result-item" onclick="goToProduct(${p.id})">
        <div class="search-result-img"><img src="${p.image}" alt="${p.brand}"></div>
        <div style="flex:1">
          <div style="font-size:0.72rem;font-weight:800;color:var(--green);letter-spacing:0.15em;text-transform:uppercase">${p.brand}</div>
          <div style="font-weight:600;font-size:0.9rem;color:var(--text)">${p.name}</div>
        </div>
        <div style="font-weight:800;font-size:0.95rem;color:var(--green-dark);white-space:nowrap">${formatPrice(p.price)}</div>
      </div>
    `).join('');
  });
}

// ── Bootstrapper ──
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  initLiveSearch();
  initFeaturedGrid();
  initProductsPage();
  initProductDetailPage();
  initCartPage();
});

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQty = updateQty;
window.goToProduct = goToProduct;
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;
window.clearFilters = clearFilters;
window.removeFilterChip = removeFilterChip;
window.showToast = showToast;
window.formatPrice = formatPrice;
