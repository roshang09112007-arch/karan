/* ============================================================
   ShopKart — main.js
   Shared chrome: header (with live search suggestions), category
   nav, footer, toast helper, and login-state aware UI. Every page
   calls renderHeader()/renderFooter() into placeholder elements.
   ============================================================ */

/* ---------- Toast ---------- */
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------- Header ---------- */
function renderHeader(activeCategory) {
  const mount = document.getElementById("site-header");
  if (!mount) return;
  const session = getSession();
  const cartCount = getCartItemCount();

  const accountBlock = session
    ? `<a href="account.html" class="header-action"><span>Hello, ${session.name.split(" ")[0]}</span><strong>Account &amp; Orders</strong></a>
       <a href="#" class="header-action" id="logoutLink"><span>&nbsp;</span><strong>Logout</strong></a>`
    : `<a href="login.html" class="header-action"><span>Hello, sign in</span><strong>Account &amp; Lists</strong></a>`;

  const adminLink = session && session.role === "admin"
    ? `<a href="admin.html" class="header-action"><span>Manage</span><strong>Admin Panel</strong></a>` : "";

  mount.innerHTML = `
    <div class="topbar">
      <div class="container">
        <span>Free delivery on orders above ₹499 · Easy 7-day returns</span>
        <span class="muted-link"><a href="home.html">Become a Seller</a> &nbsp;|&nbsp; <a href="admin.html">Admin Login</a></span>
      </div>
    </div>
    <header class="site-header">
      <div class="header-row container">
        <a href="home.html" class="brand">Shop<span>Kart</span></a>
        <div class="search-wrap">
          <form class="search-form" id="searchForm" autocomplete="off">
            <input type="text" class="search-input" id="searchInput" placeholder="Search for products, brands and more">
            <button class="search-btn" type="submit">🔍</button>
          </form>
          <div class="search-suggestions" id="searchSuggestions"></div>
        </div>
        <div class="header-actions">
          ${adminLink}
          ${accountBlock}
          <a href="cart.html" class="header-action"><span>Your</span><strong>Cart 🛒<span class="cart-badge" id="cartBadge">${cartCount}</span></strong></a>
        </div>
      </div>
      <nav class="category-nav">
        <div class="container">
          ${CATEGORIES.map(c => `<a href="home.html?category=${encodeURIComponent(c)}" class="${activeCategory === c ? 'active' : ''}">${c}</a>`).join("")}
          <a href="home.html?deals=1">Today's Deals</a>
        </div>
      </nav>
    </header>
  `;

  // Logout
  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      clearSession();
      showToast("You've been logged out");
      setTimeout(() => (window.location.href = "index.html"), 600);
    });
  }

  setupSearch();
}

/* ---------- Search with live suggestions ---------- */
function setupSearch() {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  const box = document.getElementById("searchSuggestions");
  if (!form || !input) return;

  // pre-fill from query string if present (so home.html search bar shows current term)
  const params = new URLSearchParams(window.location.search);
  if (params.get("q")) input.value = params.get("q");

  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    if (!term) { box.classList.remove("open"); box.innerHTML = ""; return; }
    const products = getProducts();
    const matches = products
      .filter(p => p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term) || p.category.toLowerCase().includes(term))
      .slice(0, 7);
    if (!matches.length) { box.classList.remove("open"); box.innerHTML = ""; return; }
    box.innerHTML = matches.map(p => `
      <button type="button" data-id="${p.id}">
        🔍 ${highlightMatch(p.name, term)}
        <span class="sugg-cat">${p.category}</span>
      </button>`).join("");
    box.classList.add("open");
    box.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => { window.location.href = `product.html?id=${btn.dataset.id}`; });
    });
  });

  document.addEventListener("click", (e) => {
    if (!form.contains(e.target) && !box.contains(e.target)) box.classList.remove("open");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const term = input.value.trim();
    window.location.href = `home.html?q=${encodeURIComponent(term)}`;
  });
}
function highlightMatch(text, term) {
  const i = text.toLowerCase().indexOf(term);
  if (i === -1) return text;
  return text.slice(0, i) + "<b>" + text.slice(i, i + term.length) + "</b>" + text.slice(i + term.length);
}

/* ---------- Footer ---------- */
function renderFooter() {
  const mount = document.getElementById("site-footer");
  if (!mount) return;
  mount.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <h4>Know Us</h4>
          <a href="#">About ShopKart</a>
          <a href="#">Careers</a>
          <a href="#">Press</a>
        </div>
        <div>
          <h4>Help</h4>
          <a href="account.html">Track your order</a>
          <a href="#">Returns &amp; refunds</a>
          <a href="#">Payments</a>
        </div>
        <div>
          <h4>Policy</h4>
          <a href="#">Terms of use</a>
          <a href="#">Privacy</a>
          <a href="#">Shipping policy</a>
        </div>
        <div>
          <h4>Sell &amp; Manage</h4>
          <a href="admin.html">Seller / Admin login</a>
          <a href="#">Become a seller</a>
        </div>
      </div>
      <div class="footer-bottom">© 2026 ShopKart Demo — built for learning purposes, not a real store.</div>
    </footer>
  `;
}

/* ---------- Page guard helpers ---------- */
function requireLogin(redirectTo) {
  const session = getSession();
  if (!session) {
    window.location.href = `login.html?next=${encodeURIComponent(redirectTo || window.location.pathname.split("/").pop())}`;
    return null;
  }
  return session;
}
function requireAdmin() {
  const session = getSession();
  if (!session || session.role !== "admin") {
    window.location.href = "login.html?next=admin.html";
    return null;
  }
  return session;
}

document.addEventListener("DOMContentLoaded", () => {
  renderFooter();
});
