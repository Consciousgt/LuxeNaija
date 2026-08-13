/**
 * LuxeNaija Admin Operations & Dynamic State Engine
 */

const ADMIN_PIN = "8888";

// Sample Seed Orders for initial presentation if storage empty
const SAMPLE_ORDERS = [
  {
    id: "LN-849201",
    customer: {
      firstName: "Chinedu",
      lastName: "Okeke",
      phone: "+234 803 456 7890",
      email: "c.okeke@yahoo.com",
      address: "14 Admiralty Way, Lekki Phase 1",
      state: "Lagos",
      city: "Lekki"
    },
    items: [
      { id: 1, size: "41mm Oystersteel", qty: 1 }
    ],
    subtotal: 345000,
    shipping: 3500,
    total: 348500,
    paymentMethod: "Paystack",
    status: "Sourcing in UK/US/Dubai",
    batch: "Batch 7",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString()
  },
  {
    id: "LN-710482",
    customer: {
      firstName: "Amina",
      lastName: "Bello",
      phone: "+234 812 987 6543",
      email: "amina.bello@gmail.com",
      address: "Plot 42 Crescent, Maitama District",
      state: "FCT Abuja",
      city: "Maitama"
    },
    items: [
      { id: 2, size: "Medium", qty: 1 },
      { id: 5, size: "90cm", qty: 1 }
    ],
    subtotal: 380000,
    shipping: 3500,
    total: 383500,
    paymentMethod: "Flutterwave",
    status: "Payment Confirmed",
    batch: "Batch 7",
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString()
  },
  {
    id: "LN-992341",
    customer: {
      firstName: "Tolu",
      lastName: "Adeyemi",
      phone: "+234 705 112 3344",
      email: "tolu.ade@outlook.com",
      address: "GRA Phase 2, Port Harcourt",
      state: "Rivers",
      city: "Port Harcourt"
    },
    items: [
      { id: 3, size: "Medium (25.5cm)", qty: 1 }
    ],
    subtotal: 295000,
    shipping: 3500,
    total: 298500,
    paymentMethod: "Bank Transfer",
    status: "Shipped to Nigeria",
    batch: "Batch 7",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 5).toISOString()
  }
];

// Initialize Orders State
function getStoredOrders() {
  try {
    const orders = localStorage.getItem('luxenaija_orders');
    if (!orders || JSON.parse(orders).length === 0) {
      localStorage.setItem('luxenaija_orders', JSON.stringify(SAMPLE_ORDERS));
      return SAMPLE_ORDERS;
    }
    return JSON.parse(orders);
  } catch (e) {
    return SAMPLE_ORDERS;
  }
}

function saveStoredOrders(orders) {
  localStorage.setItem('luxenaija_orders', JSON.stringify(orders));
}

// Format Currency
function formatNaira(num) {
  return '₦' + Number(num || 0).toLocaleString('en-NG');
}

// ── Auth Handling ──
function initAdminAuth() {
  const lock = document.getElementById('admin-lock');
  const authForm = document.getElementById('admin-auth-form');
  const pinInput = document.getElementById('admin-pin');
  const authError = document.getElementById('auth-error');
  const logoutBtn = document.getElementById('admin-logout-btn');

  const isAuth = sessionStorage.getItem('luxenaija_admin_session');
  if (isAuth === 'true') {
    lock.style.display = 'none';
  }

  authForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (pinInput.value.trim() === ADMIN_PIN || pinInput.value.trim() === 'luxenaija') {
      sessionStorage.setItem('luxenaija_admin_session', 'true');
      lock.style.display = 'none';
      renderAdminDashboard();
    } else {
      authError.style.display = 'block';
      pinInput.value = '';
    }
  });

  logoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem('luxenaija_admin_session');
    location.reload();
  });
}

// ── Tab Switching ──
function switchAdminTab(tabId) {
  document.querySelectorAll('.admin-nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tabId);
  });
  document.querySelectorAll('.admin-tab').forEach(el => {
    el.classList.toggle('active', el.id === tabId);
  });
}

// ── Render Dashboard Overview & Stats ──
function renderAdminDashboard() {
  const orders = getStoredOrders();
  const products = window.PRODUCTS || [];

  // Stats calculation
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status !== 'Delivered').length;

  document.getElementById('stat-revenue').textContent = formatNaira(totalRevenue);
  document.getElementById('stat-orders-count').textContent = orders.length;
  document.getElementById('stat-orders-pending').textContent = `${pendingOrders} In Transit / Sourcing`;
  document.getElementById('stat-products-count').textContent = products.length;
  document.getElementById('orders-badge').textContent = orders.length;

  renderOverviewOrdersTable(orders.slice(0, 5));
  renderAllOrdersTable(orders);
  renderAllProductsTable(products);
}

// ── Render Overview Table ──
function renderOverviewOrdersTable(orders) {
  const tbody = document.getElementById('overview-orders-tbody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--admin-text-muted);padding:2rem">No pre-orders recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => {
    const badgeClass = getStatusBadgeClass(o.status);
    return `
      <tr>
        <td style="font-weight:700;color:var(--admin-gold)">#${o.id}</td>
        <td>
          <div style="font-weight:600">${o.customer.firstName} ${o.customer.lastName}</div>
          <div style="font-size:0.75rem;color:var(--admin-text-muted)">${o.customer.phone}</div>
        </td>
        <td>${o.customer.city}, ${o.customer.state}</td>
        <td>${o.items.length} Item(s)</td>
        <td style="font-weight:600">${formatNaira(o.total)}</td>
        <td><span class="badge ${badgeClass}">${o.status}</span></td>
        <td>
          <button class="btn-admin btn-admin-outline" style="padding:0.4rem 0.8rem;font-size:0.75rem" onclick="switchAdminTab('tab-orders')">Manage</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Render Full Orders Management Table ──
function renderAllOrdersTable(orders) {
  const tbody = document.getElementById('all-orders-tbody');
  if (!tbody) return;

  const searchTerm = (document.getElementById('order-search')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('order-filter-status')?.value || '';

  const filtered = orders.filter(o => {
    const matchesSearch = !searchTerm || 
      o.id.toLowerCase().includes(searchTerm) || 
      o.customer.firstName.toLowerCase().includes(searchTerm) || 
      o.customer.lastName.toLowerCase().includes(searchTerm) || 
      o.customer.state.toLowerCase().includes(searchTerm);
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--admin-text-muted);padding:3rem">No matching pre-orders found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(o => {
    const badgeClass = getStatusBadgeClass(o.status);
    const itemSummary = o.items.map(it => {
      const p = (window.PRODUCTS || []).find(prod => prod.id === it.id);
      return `<div style="font-size:0.8rem">• ${p ? p.brand + ' ' + p.name : 'Luxury Item'} (${it.size || 'Standard'}) x${it.qty || 1}</div>`;
    }).join('');

    return `
      <tr>
        <td style="font-weight:700;color:var(--admin-gold)">#${o.id}<div style="font-size:0.7rem;color:var(--admin-text-muted)">${new Date(o.createdAt).toLocaleDateString()}</div></td>
        <td>
          <div style="font-weight:600">${o.customer.firstName} ${o.customer.lastName}</div>
          <div style="font-size:0.75rem;color:var(--admin-text-muted)">${o.customer.email}</div>
          <a href="https://wa.me/${o.customer.phone.replace(/[^0-9]/g, '')}" target="_blank" style="font-size:0.75rem;color:var(--admin-green);text-decoration:none;display:inline-flex;align-items:center;gap:0.25rem;margin-top:0.2rem">💬 WhatsApp</a>
        </td>
        <td style="max-width:200px">
          <div>${o.customer.address}</div>
          <div style="font-weight:600;color:var(--admin-gold)">${o.customer.city}, ${o.customer.state}</div>
        </td>
        <td>${itemSummary}</td>
        <td>
          <div style="font-weight:700">${formatNaira(o.total)}</div>
          <div style="font-size:0.7rem;color:var(--admin-text-muted)">Via ${o.paymentMethod}</div>
        </td>
        <td><span class="badge ${badgeClass}">${o.status}</span></td>
        <td>
          <select class="form-control" style="padding:0.4rem;font-size:0.8rem" onchange="updateOrderStatus('${o.id}', this.value)">
            <option value="Payment Confirmed" ${o.status === 'Payment Confirmed' ? 'selected' : ''}>Payment Confirmed</option>
            <option value="Sourcing in UK/US/Dubai" ${o.status === 'Sourcing in UK/US/Dubai' ? 'selected' : ''}>Sourcing in UK/US/Dubai</option>
            <option value="Shipped to Nigeria" ${o.status === 'Shipped to Nigeria' ? 'selected' : ''}>Shipped to Nigeria</option>
            <option value="Customs Cleared" ${o.status === 'Customs Cleared' ? 'selected' : ''}>Customs Cleared</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Payment Confirmed': return 'badge-amber';
    case 'Sourcing in UK/US/Dubai': return 'badge-purple';
    case 'Shipped to Nigeria': return 'badge-blue';
    case 'Customs Cleared': return 'badge-blue';
    case 'Delivered': return 'badge-green';
    default: return 'badge-amber';
  }
}

window.updateOrderStatus = function(orderId, newStatus) {
  const orders = getStoredOrders();
  const target = orders.find(o => o.id === orderId);
  if (target) {
    target.status = newStatus;
    saveStoredOrders(orders);
    renderAdminDashboard();
  }
};

// ── Render Products Management Table ──
function renderAllProductsTable(products) {
  const tbody = document.getElementById('all-products-tbody');
  if (!tbody) return;

  const searchTerm = (document.getElementById('product-search')?.value || '').toLowerCase();
  const filtered = products.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm) || p.brand.toLowerCase().includes(searchTerm));

  tbody.innerHTML = filtered.map(p => {
    const savings = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
    return `
      <tr>
        <td>
          <img src="${p.image}" alt="${p.name}" style="width:48px;height:48px;border-radius:6px;object-fit:cover">
        </td>
        <td>
          <div style="font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--admin-gold)">${p.brand}</div>
          <div style="font-weight:600">${p.name}</div>
        </td>
        <td><span class="badge badge-purple" style="text-transform:capitalize">${p.category}</span></td>
        <td style="font-weight:700;color:var(--admin-gold)">${formatNaira(p.price)}</td>
        <td style="color:var(--admin-text-muted);text-decoration:line-through">${formatNaira(p.originalPrice)}</td>
        <td><span class="badge badge-green">-${savings}%</span></td>
        <td>${p.isFeatured ? '⭐ Yes' : 'No'}</td>
        <td>
          <button class="btn-admin btn-admin-danger" style="padding:0.35rem 0.75rem;font-size:0.75rem" onclick="handleDeleteProduct(${p.id})">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

window.handleDeleteProduct = function(id) {
  if (confirm("Are you sure you want to remove this product from the live catalog?")) {
    window.deleteProduct(id);
    renderAdminDashboard();
  }
};

// ── Add/Edit Product Modal Logic ──
function initProductModal() {
  const modal = document.getElementById('product-modal');
  const addBtn = document.getElementById('add-product-btn');
  const quickAddBtn = document.getElementById('quick-add-prod-btn');
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const form = document.getElementById('product-form');
  const imgFileInput = document.getElementById('prod-image-file');

  function openModal() {
    form.reset();
    document.getElementById('prod-id').value = '';
    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  addBtn?.addEventListener('click', openModal);
  quickAddBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let imgPath = document.getElementById('prod-image-url').value.trim();
    if (!imgPath) {
      imgPath = "images/product_gucci_bag.jpg"; // Default fallback luxury image
    }

    const sizesArr = document.getElementById('prod-sizes').value.split(',').map(s => s.trim()).filter(Boolean);

    const newProd = {
      id: Date.now(),
      brand: document.getElementById('prod-brand').value.trim(),
      name: document.getElementById('prod-name').value.trim(),
      category: document.getElementById('prod-category').value,
      gender: document.getElementById('prod-gender').value,
      price: parseInt(document.getElementById('prod-price').value, 10),
      originalPrice: parseInt(document.getElementById('prod-orig-price').value, 10),
      deliveryDays: parseInt(document.getElementById('prod-days').value, 10) || 20,
      sizes: sizesArr.length ? sizesArr : ["One Size"],
      description: document.getElementById('prod-desc').value.trim(),
      isFeatured: document.getElementById('prod-featured').checked,
      image: imgPath,
      rating: 5.0,
      reviews: 1,
      batch: "Batch 7",
      isSale: false
    };

    // If a local file was chosen, read as DataURL
    if (imgFileInput.files && imgFileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        newProd.image = evt.target.result;
        window.saveCustomProduct(newProd);
        closeModal();
        renderAdminDashboard();
      };
      reader.readAsDataURL(imgFileInput.files[0]);
    } else {
      window.saveCustomProduct(newProd);
      closeModal();
      renderAdminDashboard();
    }
  });
}

// ── Search & Filter Listeners ──
function initAdminListeners() {
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      switchAdminTab(item.dataset.tab);
    });
  });

  document.getElementById('order-search')?.addEventListener('input', () => {
    renderAllOrdersTable(getStoredOrders());
  });

  document.getElementById('order-filter-status')?.addEventListener('change', () => {
    renderAllOrdersTable(getStoredOrders());
  });

  document.getElementById('product-search')?.addEventListener('input', () => {
    renderAllProductsTable(window.PRODUCTS || []);
  });

  document.getElementById('export-orders-btn')?.addEventListener('click', () => {
    const orders = getStoredOrders();
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Order ID,Customer,Phone,Email,State,City,Total,Status,Date\n" + 
      orders.map(o => `"${o.id}","${o.customer.firstName} ${o.customer.lastName}","${o.customer.phone}","${o.customer.email}","${o.customer.state}","${o.customer.city}","${o.total}","${o.status}","${o.createdAt}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LuxeNaija_Orders_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

// ── Run on Load ──
document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
  initAdminListeners();
  initProductModal();
  renderAdminDashboard();
});
