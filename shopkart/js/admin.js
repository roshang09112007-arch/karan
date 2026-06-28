/* ============================================================
   ShopKart — admin.js
   Drives admin.html: a tabbed dashboard for managing products,
   orders and users. All data is the same localStorage "DB" used
   by the storefront, so admin changes show up live for shoppers.
   ============================================================ */

let adminTab = "dashboard";
let editingProductId = null;

function initAdminPage() {
  const session = requireAdmin();
  if (!session) return;
  document.getElementById("adminUserName").textContent = session.name;

  document.querySelectorAll(".admin-nav a").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      adminTab = link.dataset.tab;
      document.querySelectorAll(".admin-nav a").forEach(l => l.classList.toggle("active", l === link));
      renderAdminTab();
    });
  });
  document.getElementById("adminLogout").addEventListener("click", (e) => {
    e.preventDefault();
    clearSession();
    window.location.href = "index.html";
  });

  renderAdminTab();
}

function renderAdminTab() {
  document.querySelectorAll(".admin-tab-panel").forEach(p => p.classList.add("hidden"));
  document.getElementById("tab-" + adminTab).classList.remove("hidden");
  if (adminTab === "dashboard") renderDashboard();
  if (adminTab === "products") renderProductsTab();
  if (adminTab === "orders") renderOrdersTab();
  if (adminTab === "users") renderUsersTab();
}

/* ---------------- Dashboard ---------------- */
function renderDashboard() {
  const products = getProducts();
  const orders = getOrders();
  const users = getUsers().filter(u => u.role === "customer");
  const revenue = orders.reduce((s, o) => s + o.total, 0);

  document.getElementById("tab-dashboard").innerHTML = `
    <div class="admin-header"><h1>Dashboard</h1></div>
    <div class="stat-grid">
      <div class="stat-card"><div class="num">${products.length}</div><div class="label">Total products</div></div>
      <div class="stat-card"><div class="num">${orders.length}</div><div class="label">Total orders</div></div>
      <div class="stat-card"><div class="num">${formatPrice(revenue)}</div><div class="label">Revenue (demo)</div></div>
      <div class="stat-card"><div class="num">${users.length}</div><div class="label">Registered customers</div></div>
    </div>
    <div class="admin-panel">
      <h2>Recent orders</h2>
      <table class="admin-table">
        <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          ${orders.slice(0, 6).map(o => `
            <tr>
              <td>${o.id}</td>
              <td>${o.userName}</td>
              <td>${o.items.reduce((s, i) => s + i.qty, 0)}</td>
              <td>${formatPrice(o.total)}</td>
              <td><span class="status-badge status-${o.status.replace(/\s/g, "-")}">${o.status}</span></td>
              <td>${new Date(o.placedAt).toLocaleDateString("en-IN")}</td>
            </tr>`).join("") || `<tr><td colspan="6" class="muted">No orders yet.</td></tr>`}
        </tbody>
      </table>
    </div>
    <div class="admin-panel">
      <h2>Low stock alerts</h2>
      <table class="admin-table">
        <thead><tr><th>Product</th><th>Stock</th></tr></thead>
        <tbody>
          ${products.filter(p => p.stock <= 10).map(p => `<tr><td>${p.name}</td><td>${p.stock}</td></tr>`).join("") || `<tr><td colspan="2" class="muted">All products are well stocked.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

/* ---------------- Products tab ---------------- */
function renderProductsTab() {
  const products = getProducts();
  document.getElementById("tab-products").innerHTML = `
    <div class="admin-header"><h1>Products</h1><button class="btn btn-primary" id="addProductBtn">+ Add Product</button></div>
    <div class="admin-panel">
      <table class="admin-table">
        <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr></thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td><img src="${p.img}" alt=""></td>
              <td>${p.name}</td>
              <td>${p.category}</td>
              <td>${formatPrice(p.price)}</td>
              <td>${p.stock}</td>
              <td>${p.rating.toFixed(1)} ★</td>
              <td class="row-actions">
                <button class="btn btn-outline btn-sm editProductBtn" data-id="${p.id}">Edit</button>
                <button class="btn btn-danger btn-sm deleteProductBtn" data-id="${p.id}">Delete</button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
  document.getElementById("addProductBtn").addEventListener("click", () => openProductModal());
  document.querySelectorAll(".editProductBtn").forEach(b => b.addEventListener("click", () => openProductModal(b.dataset.id)));
  document.querySelectorAll(".deleteProductBtn").forEach(b => b.addEventListener("click", () => {
    if (!confirm("Delete this product?")) return;
    saveProducts(getProducts().filter(p => p.id !== b.dataset.id));
    renderProductsTab();
    showToast("Product deleted");
  }));
}

function openProductModal(id) {
  editingProductId = id || null;
  const p = id ? getProductById(id) : null;
  document.getElementById("modalBackdrop").classList.add("open");
  document.getElementById("modalContent").innerHTML = `
    <h2>${p ? "Edit product" : "Add product"}</h2>
    <form id="productForm">
      <div class="field"><label>Name</label><input id="pf-name" value="${p ? p.name : ""}" required></div>
      <div class="field-row">
        <div class="field"><label>Category</label>
          <select id="pf-category">${CATEGORIES.map(c => `<option ${p && p.category === c ? "selected" : ""}>${c}</option>`).join("")}</select>
        </div>
        <div class="field"><label>Brand</label><input id="pf-brand" value="${p ? p.brand : ""}" required></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Price (₹)</label><input id="pf-price" type="number" min="1" value="${p ? p.price : ""}" required></div>
        <div class="field"><label>MRP (₹)</label><input id="pf-mrp" type="number" min="1" value="${p ? p.mrp : ""}" required></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Stock</label><input id="pf-stock" type="number" min="0" value="${p ? p.stock : 10}" required></div>
        <div class="field"><label>Rating</label><input id="pf-rating" type="number" min="0" max="5" step="0.1" value="${p ? p.rating : 4.0}" required></div>
      </div>
      <div class="field"><label>Image URL</label><input id="pf-img" value="${p ? p.img : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"}" required></div>
      <div class="field"><label>Description</label><textarea id="pf-desc" rows="3">${p ? p.desc : ""}</textarea></div>
      <div class="flex gap-8" style="justify-content:flex-end; margin-top:10px;">
        <button type="button" class="btn btn-outline" id="cancelModalBtn">Cancel</button>
        <button type="submit" class="btn btn-primary">Save product</button>
      </div>
    </form>
  `;
  document.getElementById("cancelModalBtn").addEventListener("click", closeModal);
  document.getElementById("productForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById("pf-name").value.trim(),
      category: document.getElementById("pf-category").value,
      brand: document.getElementById("pf-brand").value.trim(),
      price: Number(document.getElementById("pf-price").value),
      mrp: Number(document.getElementById("pf-mrp").value),
      stock: Number(document.getElementById("pf-stock").value),
      rating: Number(document.getElementById("pf-rating").value),
      img: document.getElementById("pf-img").value.trim(),
      desc: document.getElementById("pf-desc").value.trim(),
    };
    const products = getProducts();
    if (editingProductId) {
      const idx = products.findIndex(pr => pr.id === editingProductId);
      products[idx] = { ...products[idx], ...data };
    } else {
      products.push({ id: "p_" + Date.now(), reviewsCount: 0, ...data });
    }
    saveProducts(products);
    closeModal();
    renderProductsTab();
    showToast("Product saved");
  });
}
function closeModal() { document.getElementById("modalBackdrop").classList.remove("open"); }

/* ---------------- Orders tab ---------------- */
function renderOrdersTab() {
  const orders = getOrders();
  const statuses = ["Placed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
  document.getElementById("tab-orders").innerHTML = `
    <div class="admin-header"><h1>Orders</h1></div>
    <div class="admin-panel">
      <table class="admin-table">
        <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Update</th></tr></thead>
        <tbody>
          ${orders.map(o => `
            <tr>
              <td>${o.id}</td>
              <td>${o.userName}<br><span class="muted">${o.userEmail}</span></td>
              <td>${o.items.reduce((s, i) => s + i.qty, 0)} item(s)</td>
              <td>${formatPrice(o.total)}</td>
              <td style="text-transform:uppercase;">${o.payment}</td>
              <td><span class="status-badge status-${o.status.replace(/\s/g, "-")}">${o.status}</span></td>
              <td>
                <select class="statusSelect" data-id="${o.id}">
                  ${statuses.map(s => `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}
                </select>
              </td>
            </tr>`).join("") || `<tr><td colspan="7" class="muted">No orders placed yet.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
  document.querySelectorAll(".statusSelect").forEach(sel => {
    sel.addEventListener("change", () => {
      updateOrderStatus(sel.dataset.id, sel.value);
      showToast("Order status updated");
      renderOrdersTab();
    });
  });
}

/* ---------------- Users tab ---------------- */
function renderUsersTab() {
  const users = getUsers();
  document.getElementById("tab-users").innerHTML = `
    <div class="admin-header"><h1>Users</h1></div>
    <div class="admin-panel">
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Orders</th><th>Actions</th></tr></thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td>${u.name}</td>
              <td>${u.email}</td>
              <td>${u.role}</td>
              <td>${getOrdersForUser(u.email).length}</td>
              <td class="row-actions">
                ${u.role !== "admin" ? `<button class="btn btn-danger btn-sm deleteUserBtn" data-id="${u.id}">Remove</button>` : `<span class="muted">—</span>`}
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
  document.querySelectorAll(".deleteUserBtn").forEach(b => b.addEventListener("click", () => {
    if (!confirm("Remove this user account?")) return;
    saveUsers(getUsers().filter(u => u.id !== b.dataset.id));
    renderUsersTab();
    showToast("User removed");
  }));
}

document.addEventListener("DOMContentLoaded", initAdminPage);
