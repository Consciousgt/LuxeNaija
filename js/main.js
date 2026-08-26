// ============================================================
//  LuxeNaija — Main JavaScript (main.js)
//  Cart, Products, Search, Quickview, Fly-to-Cart
// ============================================================

// ── Cart State ──
let cart = JSON.parse(localStorage.getItem('luxenaija_cart') || '[]');

function saveCart() {
  localStorage.setItem('luxenaija_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('#cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total === 0 ? 'none' : 'flex';
  });
}

// ── Toast ──
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
    setTimeout(() => toast.classList.remove('hide'), 400);
  }, 3500);
}

// ── Format Price ──
function formatPrice(n) {
  return '₦' + Number(n).toLocaleString('en-NG');
}

function savingsPercent(price, orig) {
  return Math.round(((orig - price) / orig) * 100);
}

// ── Add To Cart with Fly Animation ──
function flyToCart(sourceEl) {
  const cartBtn = document.getElementById('cart-btn');
  if (!sourceEl || !cartBtn) return;
  const srcRect = sourceEl.getBoundingClientRect();
  const cartRect = cartBtn.getBoundingClientRect();

  // Try to find nearest product image
  let imgSrc = '';
  const card = sourceEl.closest('.product-card');
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

  // Bounce the cart icon
  setTimeout(() => {
    cartBtn.style.animation = 'cartBounce 0.5s ease';
    setTimeout(() => cartBtn.style.animation = '', 500);
    fly.remove();
  }, 650);
}

function addToCart(productId, size, qty, sourceEl) {
  size = size || null;
  qty = qty || 1;
  const product = (window.PRODUCTS || []).find(p => p.id === productId);
  if (!product) return;
  const key = productId + '-' + size;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ key, productId, size, qty, price: product.price });
  }
  saveCart();
  if (sourceEl) flyToCart(sourceEl);
  showToast(product.brand + ' ' + product.name + ' added! 🛍️', 'cart');
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
  renderCartPage();
}

function updateQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  renderCartPage();
}

function getCartTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

// ── Product Card HTML ──
function renderProductCard(product) {
  const savings = savingsPercent(product.price, product.originalPrice);
  const badgeHTML = product.badge === 'hot'
    ? '<span class="badge-hot">🔥 HOT</span>'
    : product.badge === 'new'
    ? '<span class="badge-new">✦ NEW</span>'
    : '';
  const starsHTML = '★'.repeat(Math.round(product.rating || 5)) + '☆'.repeat(5 - Math.round(product.rating || 5));
  return `
    <article class="product-card"
      id="product-card-${product.id}"
      data-product-id="${product.id}"
      onclick="goToProduct(${product.id})"
      role="button"
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
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="product-action-btn"
            aria-label="Add to cart"
            onclick="event.stopPropagation(); addToCart(${product.id}, '${product.sizes[0]}', 1, this)">
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
        <div style="font-size:0.72rem;color:#FBBF24;margin-bottom:0.4rem">${starsHTML} <span style="color:var(--text-light)">(${product.reviews || 0})</span></div>
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

// ── Navigate to product ──
function goToProduct(id) {
  localStorage.setItem('luxenaija_viewing', id);
  window.location.href = 'product-detail.html?id=' + id;
}

// ── Quick View ──
function openQuickView(productId) {
  const product = (window.PRODUCTS || []).find(p => p.id === productId);
  if (!product) return;
  const overlay = document.getElementById('quickview-overlay');
  const imgEl = document.getElementById('quickview-img');
  const infoEl = document.getElementById('quickview-info');
  if (!overlay) return;

  const savings = savingsPercent(product.price, product.originalPrice);
  if (imgEl) {
    imgEl.innerHTML = '<img src="' + product.image + '" alt="' + product.brand + '" style="width:100%;height:100%;object-fit:cover;min-height:300px">';
  }
  if (infoEl) {
    infoEl.innerHTML = `
      <div style="font-size:0.72rem;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:var(--green);margin-bottom:0.4rem">${product.brand}</div>
      <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:600;color:var(--text);margin-bottom:0.75rem">${product.name}</div>
      <div style="font-size:1.5rem;font-weight:800;color:var(--green-dark)">${formatPrice(product.price)} <span style="font-size:1rem;text-decoration:line-through;color:var(--text-light);font-weight:400">${formatPrice(product.originalPrice)}</span> <span style="font-size:0.8rem;background:var(--green-xlight);color:var(--green);padding:0.2rem 0.6rem;border-radius:99px;font-weight:700">Save ${savings}%</span></div>
      <div style="margin:1rem 0;font-size:0.88rem;color:var(--text-muted);line-height:1.6">${product.description || ''}</div>
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.25rem">
        ${(product.sizes || []).map(s => '<span style="padding:0.4rem 0.9rem;border:1.5px solid var(--border);border-radius:99px;font-size:0.8rem;font-weight:600;cursor:pointer" onclick="this.style.background=\'var(--green)\';this.style.color=\'#fff\';this.style.borderColor=\'var(--green)\'">' + s + '</span>').join('')}
      </div>
      <div style="display:flex;gap:0.75rem">
        <button class="btn btn-primary ripple-container" style="flex:1" onclick="addToCart(${product.id}, '${(product.sizes||['One Size'])[0]}', 1, this); closeQuickView()">Add to Cart 🛍️</button>
        <button class="btn btn-outline" onclick="closeQuickView(); goToProduct(${product.id})">Full Details →</button>
      </div>
    `;
  }
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const overlay = document.getElementById('quickview-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Close quickview on overlay click
document.addEventListener('DOMContentLoaded', () => {
  const ov = document.getElementById('quickview-overlay');
  if (ov) {
    ov.addEventListener('click', e => { if (e.target === ov) closeQuickView(); });
  }
});

// ── Homepage Featured Products ──
function initFeaturedGrid() {
  const skeleton = document.getElementById('featured-skeleton');
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  const products = window.PRODUCTS || [];
  const featured = products.filter(p => p.isFeatured).slice(0, 8);

  setTimeout(() => {
    if (skeleton) skeleton.style.display = 'none';
    grid.style.display = 'grid';
    grid.innerHTML = featured.map(renderProductCard).join('');
    // Re-init animations for new cards
    if (window.LuxeAnim) {
      window.LuxeAnim.initStaggerGrids();
      window.LuxeAnim.initCardTilt();
      window.LuxeAnim.initWishlistButtons();
      window.LuxeAnim.initRipple();
    }
  }, 900);
}

// ── Products Page ──
let allProducts = [];
let activeFilters = { brands: [], categories: [], minPrice: 0, maxPrice: Infinity };
let activeSortBy = 'featured';

function initProductsPage() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  allProducts = window.PRODUCTS || [];

  const skeleton = document.getElementById('products-skeleton');
  setTimeout(() => {
    if (skeleton) skeleton.style.display = 'none';
    grid.style.display = 'grid';
    renderFilteredProducts();
    initFilters();
    handleURLFilters();
  }, 700);
}

function handleURLFilters() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  const sale = params.get('sale');
  if (cat) {
    activeFilters.categories = [cat];
    const cb = document.querySelector('input[data-cat="' + cat + '"]');
    if (cb) cb.checked = true;
    renderFilteredProducts();
  }
  if (sale === '1') {
    allProducts = allProducts.filter(p => p.isSale || savingsPercent(p.price, p.originalPrice) > 40);
    renderFilteredProducts();
  }
}

function initFilters() {
  // Brand checkboxes
  document.querySelectorAll('input[data-brand]').forEach(cb => {
    cb.addEventListener('change', function() {
      const brand = this.dataset.brand;
      if (this.checked) {
        if (!activeFilters.brands.includes(brand)) activeFilters.brands.push(brand);
      } else {
        activeFilters.brands = activeFilters.brands.filter(b => b !== brand);
      }
      renderFilteredProducts();
      updateActiveFilterChips();
    });
  });

  // Category checkboxes
  document.querySelectorAll('input[data-cat]').forEach(cb => {
    cb.addEventListener('change', function() {
      const cat = this.dataset.cat;
      if (this.checked) {
        if (!activeFilters.categories.includes(cat)) activeFilters.categories.push(cat);
      } else {
        activeFilters.categories = activeFilters.categories.filter(c => c !== cat);
      }
      renderFilteredProducts();
      updateActiveFilterChips();
    });
  });

  // Price range
  const minInput = document.getElementById('price-min');
  const maxInput = document.getElementById('price-max');
  if (minInput) minInput.addEventListener('input', () => {
    activeFilters.minPrice = parseInt(minInput.value) || 0;
    renderFilteredProducts();
  });
  if (maxInput) maxInput.addEventListener('input', () => {
    activeFilters.maxPrice = parseInt(maxInput.value) || Infinity;
    renderFilteredProducts();
  });

  // Sort
  const sort = document.getElementById('sort-select');
  if (sort) sort.addEventListener('change', e => {
    activeSortBy = e.target.value;
    renderFilteredProducts();
  });

  // Clear filters
  const clearBtn = document.getElementById('clear-filters');
  if (clearBtn) clearBtn.addEventListener('click', clearAllFilters);
}

function clearAllFilters() {
  activeFilters = { brands: [], categories: [], minPrice: 0, maxPrice: Infinity };
  document.querySelectorAll('input[data-brand], input[data-cat]').forEach(cb => cb.checked = false);
  const minInput = document.getElementById('price-min');
  const maxInput = document.getElementById('price-max');
  if (minInput) minInput.value = '';
  if (maxInput) maxInput.value = '';
  renderFilteredProducts();
  updateActiveFilterChips();
}

function getFilteredProducts() {
  let result = [...allProducts];
  if (activeFilters.brands.length > 0) {
    result = result.filter(p => activeFilters.brands.includes(p.brand));
  }
  if (activeFilters.categories.length > 0) {
    result = result.filter(p => activeFilters.categories.includes(p.category));
  }
  result = result.filter(p => p.price >= activeFilters.minPrice && p.price <= activeFilters.maxPrice);

  // Sort
  switch (activeSortBy) {
    case 'price-asc': result.sort((a,b) => a.price - b.price); break;
    case 'price-desc': result.sort((a,b) => b.price - a.price); break;
    case 'savings': result.sort((a,b) => savingsPercent(b.price,b.originalPrice) - savingsPercent(a.price,a.originalPrice)); break;
    case 'newest': result.sort((a,b) => (b.id - a.id)); break;
    default: result.sort((a,b) => (b.isFeatured ? 1:0) - (a.isFeatured ? 1:0));
  }
  return result;
}

function renderFilteredProducts() {
  const grid = document.getElementById('products-grid');
  const count = document.getElementById('products-count');
  if (!grid) return;

  const filtered = getFilteredProducts();
  if (count) count.textContent = filtered.length + ' product' + (filtered.length !== 1 ? 's' : '') + ' found';

  // Animate out, swap, animate in
  grid.style.opacity = '0';
  grid.style.transform = 'translateY(12px)';
  setTimeout(() => {
    if (!filtered.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--text-muted)">
          <div style="font-size:3rem;margin-bottom:1rem">🔍</div>
          <div style="font-weight:700;font-size:1.1rem;margin-bottom:0.5rem">No products found</div>
          <div style="font-size:0.9rem">Try adjusting your filters or <button onclick="clearAllFilters()" style="color:var(--green);font-weight:600;background:none;border:none;cursor:pointer">clear all filters</button></div>
        </div>`;
    } else {
      grid.innerHTML = filtered.map(renderProductCard).join('');
      if (window.LuxeAnim) {
        window.LuxeAnim.initStaggerGrids();
        window.LuxeAnim.initCardTilt();
        window.LuxeAnim.initWishlistButtons();
        window.LuxeAnim.initRipple();
      }
    }
    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';
    grid.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  }, 200);
}

function updateActiveFilterChips() {
  const area = document.getElementById('active-filters');
  if (!area) return;
  const chips = [];
  activeFilters.brands.forEach(b => chips.push({ label: b, type: 'brand', val: b }));
  activeFilters.categories.forEach(c => chips.push({ label: c, type: 'cat', val: c }));

  if (!chips.length) { area.innerHTML = ''; return; }

  area.innerHTML = '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;margin-bottom:1rem">' +
    '<span style="font-size:0.78rem;font-weight:600;color:var(--text-muted)">Active:</span>' +
    chips.map(chip => `
      <span style="display:inline-flex;align-items:center;gap:0.4rem;background:var(--green-xlight);border:1px solid var(--green-light);border-radius:99px;padding:0.25rem 0.75rem;font-size:0.75rem;font-weight:600;color:var(--green-dark)">
        ${chip.label}
        <button style="background:none;border:none;cursor:pointer;color:var(--green-dark);font-size:1rem;line-height:1;padding:0" 
          onclick="removeFilter('${chip.type}','${chip.val}')">×</button>
      </span>`).join('') +
    '</div>';
}

function removeFilter(type, val) {
  if (type === 'brand') {
    activeFilters.brands = activeFilters.brands.filter(b => b !== val);
    const cb = document.querySelector('input[data-brand="' + val + '"]');
    if (cb) cb.checked = false;
  } else {
    activeFilters.categories = activeFilters.categories.filter(c => c !== val);
    const cb = document.querySelector('input[data-cat="' + val + '"]');
    if (cb) cb.checked = false;
  }
  renderFilteredProducts();
  updateActiveFilterChips();
}

// ── Product Detail Page ──
function initProductDetail() {
  const detailBrand = document.getElementById('detail-brand');
  if (!detailBrand) return;

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id') || localStorage.getItem('luxenaija_viewing'), 10);
  const product = (window.PRODUCTS || []).find(p => p.id === id);

  if (!product) {
    document.body.innerHTML = '<div style="padding:8rem 2rem;text-align:center"><h2>Product not found</h2><a href="products.html" class="btn btn-primary" style="margin-top:1rem;display:inline-flex">Back to Shop</a></div>';
    return;
  }

  // Fill in detail fields
  document.title = product.brand + ' ' + product.name + ' — LuxeNaija';
  document.getElementById('detail-brand').textContent = product.brand;
  document.getElementById('detail-name').textContent = product.name;
  document.getElementById('detail-price').textContent = formatPrice(product.price);

  const origEl = document.getElementById('detail-orig');
  if (origEl) origEl.textContent = formatPrice(product.originalPrice);

  const savingsEl = document.getElementById('detail-savings');
  if (savingsEl) savingsEl.textContent = 'Save ' + savingsPercent(product.price, product.originalPrice) + '%';

  const reviewsEl = document.getElementById('detail-reviews');
  if (reviewsEl) reviewsEl.textContent = '(' + (product.reviews || 0) + ' reviews)';

  const descEl = document.getElementById('detail-desc');
  if (descEl) descEl.textContent = product.description || '';

  const deliveryEl = document.getElementById('detail-delivery');
  if (deliveryEl) deliveryEl.textContent = '≤' + (product.deliveryDays || 30) + ' days';

  // Main image
  const mainImg = document.getElementById('detail-main-img');
  if (mainImg) {
    mainImg.innerHTML = '<img id="gallery-main-img" src="' + product.image + '" alt="' + product.brand + ' ' + product.name + '" style="width:100%;height:100%;object-fit:cover;transition:opacity 0.2s ease">';
  }

  // Sizes
  const sizesEl = document.getElementById('detail-sizes');
  if (sizesEl) {
    let selectedSize = product.sizes[0];
    sizesEl.innerHTML = (product.sizes || []).map((s, i) =>
      '<button class="size-btn ' + (i===0?'active':'') + '" data-size="' + s + '" onclick="selectSize(this, \'' + s.replace(/'/g,"\\'") + '\')">' + s + '</button>'
    ).join('');
    window._selectedSize = selectedSize;
  }

  // Add to cart button
  const addBtn = document.getElementById('detail-add-cart');
  if (addBtn) {
    addBtn.onclick = () => {
      const size = window._selectedSize || (product.sizes[0]);
      addToCart(product.id, size, parseInt(document.getElementById('detail-qty')?.value || 1, 10), addBtn);
    };
  }

  // Wishlist btn
  const wishBtn = document.getElementById('detail-wishlist');
  if (wishBtn) {
    wishBtn.dataset.pid = product.id;
    const wl = JSON.parse(localStorage.getItem('luxenaija_wishlist') || '[]');
    if (wl.includes(product.id)) wishBtn.classList.add('active');
    wishBtn.addEventListener('click', () => {
      if (window.LuxeAnim) window.LuxeAnim.toggleWishlist(product.id);
    });
  }

  // Qty
  const qtyEl = document.getElementById('detail-qty');
  const qtyMinus = document.getElementById('detail-qty-minus');
  const qtyPlus = document.getElementById('detail-qty-plus');
  if (qtyEl && qtyMinus && qtyPlus) {
    qtyMinus.onclick = () => { const v = parseInt(qtyEl.value); if (v > 1) qtyEl.value = v-1; };
    qtyPlus.onclick  = () => { qtyEl.value = parseInt(qtyEl.value) + 1; };
  }

  // Breadcrumb
  const bcEl = document.getElementById('detail-breadcrumb-name');
  if (bcEl) bcEl.textContent = product.brand + ' ' + product.name;

  // Related products
  const relatedGrid = document.getElementById('related-grid');
  if (relatedGrid) {
    const related = (window.PRODUCTS || [])
      .filter(p => p.id !== product.id && (p.brand === product.brand || p.category === product.category))
      .slice(0, 4);
    setTimeout(() => {
      relatedGrid.innerHTML = related.map(renderProductCard).join('');
      if (window.LuxeAnim) {
        window.LuxeAnim.initStaggerGrids();
        window.LuxeAnim.initCardTilt();
        window.LuxeAnim.initWishlistButtons();
        window.LuxeAnim.initRipple();
      }
    }, 500);
  }
}

function selectSize(btn, size) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  window._selectedSize = size;
}

// ── Cart Page ──
function initCartPage() {
  const cartList = document.getElementById('cart-items-list');
  if (!cartList) return;
  renderCartPage();
}

function renderCartPage() {
  const cartList = document.getElementById('cart-items-list');
  const emptyEl = document.getElementById('cart-empty');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  if (!cartList) return;

  if (!cart.length) {
    cartList.innerHTML = '';
    if (emptyEl) { emptyEl.style.display = 'block'; }
    if (subtotalEl) subtotalEl.textContent = formatPrice(0);
    if (totalEl) totalEl.textContent = formatPrice(0);
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  cartList.innerHTML = cart.map(item => {
    const product = (window.PRODUCTS || []).find(p => p.id === item.productId);
    if (!product) return '';
    return `
      <div class="cart-item reveal">
        <div class="cart-item-img"><img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover"></div>
        <div style="flex:1">
          <div class="cart-item-brand">${product.brand}</div>
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-size">${item.size ? 'Size: ' + item.size : ''}</div>
          <div class="qty-control">
            <button class="qty-btn" onclick="updateQty('${item.key}', -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty('${item.key}', 1)">+</button>
            <button class="cart-item-remove" onclick="removeFromCart('${item.key}')" style="margin-left:auto">Remove</button>
          </div>
        </div>
        <div class="cart-item-price">
          <div class="price">${formatPrice(item.price * item.qty)}</div>
          <div style="font-size:0.75rem;color:var(--text-light);margin-top:0.25rem">${formatPrice(item.price)} each</div>
        </div>
      </div>`;
  }).join('');

  const subtotal = getCartTotal();
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (totalEl) totalEl.textContent = formatPrice(subtotal);

  if (window.LuxeAnim) window.LuxeAnim.initStaggerGrids();
}

// ── Place Order ──
function initPlaceOrder() {
  const btn = document.getElementById('place-order-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!cart.length) {
      showToast('Your cart is empty!', 'error');
      return;
    }
    const name = document.getElementById('order-name')?.value?.trim();
    const email = document.getElementById('order-email')?.value?.trim();
    const phone = document.getElementById('order-phone')?.value?.trim();
    const address = document.getElementById('order-address')?.value?.trim();
    const state = document.getElementById('order-state')?.value;
    if (!name || !email || !phone || !address || !state) {
      showToast('Please fill in all delivery details', 'error');
      return;
    }
    // Save order
    const order = {
      id: 'LN' + Date.now(),
      date: new Date().toISOString(),
      items: cart.slice(),
      total: getCartTotal(),
      name, email, phone, address, state,
      status: 'Pending',
      batch: 'Batch 7'
    };
    const orders = JSON.parse(localStorage.getItem('luxenaija_orders') || '[]');
    orders.push(order);
    localStorage.setItem('luxenaija_orders', JSON.stringify(orders));
    // Clear cart
    cart = [];
    saveCart();
    // Success feedback
    btn.innerHTML = '✓ Order Placed!';
    btn.style.background = 'var(--green)';
    showToast('🎉 Pre-order placed! We\'ll contact you within 24hrs.', 'success');
    setTimeout(() => {
      renderCartPage();
      btn.innerHTML = 'Place Pre-Order →';
      btn.style.background = '';
    }, 3000);
  });
}

// ── Live Search ──
function initLiveSearch() {
  const trigger = document.getElementById('search-trigger-btn');
  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-modal-input');
  const closeBtn = document.getElementById('search-modal-close');
  const results = document.getElementById('search-modal-results');
  if (!trigger || !modal) return;

  trigger.addEventListener('click', () => {
    modal.classList.add('open');
    setTimeout(() => input && input.focus(), 100);
    document.body.style.overflow = 'hidden';
  });

  function closeSearch() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (input) input.value = '';
    if (results) results.innerHTML = '';
  }

  closeBtn && closeBtn.addEventListener('click', closeSearch);
  modal.addEventListener('click', e => { if (e.target === modal) closeSearch(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });

  if (!input || !results) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { results.innerHTML = ''; return; }
    const matches = (window.PRODUCTS || []).filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    ).slice(0, 8);

    if (!matches.length) {
      results.innerHTML = '<div style="padding:1.5rem;text-align:center;color:var(--text-muted);font-size:0.9rem">No results for "' + q + '"</div>';
      return;
    }
    results.innerHTML = matches.map(p => `
      <div class="search-result-item" onclick="goToProduct(${p.id})">
        <div class="search-result-img"><img src="${p.image}" alt="${p.brand}"></div>
        <div style="flex:1">
          <div style="font-size:0.72rem;font-weight:700;color:var(--green);letter-spacing:0.15em;text-transform:uppercase">${p.brand}</div>
          <div style="font-weight:600;font-size:0.9rem;color:var(--text)">${p.name}</div>
        </div>
        <div style="font-weight:800;font-size:0.95rem;color:var(--green-dark);white-space:nowrap">${formatPrice(p.price)}</div>
      </div>`).join('');
  });
}

// ── Init on DOM Ready ──
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  initLiveSearch();
  initFeaturedGrid();
  initProductsPage();
  initProductDetail();
  initCartPage();
  initPlaceOrder();
});

// Expose globally
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQty = updateQty;
window.goToProduct = goToProduct;
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;
window.clearAllFilters = clearAllFilters;
window.removeFilter = removeFilter;
window.selectSize = selectSize;
window.showToast = showToast;
window.formatPrice = formatPrice;
