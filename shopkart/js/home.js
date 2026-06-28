/* ============================================================
   ShopKart — home.js
   Drives home.html: hero/category tiles on first load, and the
   full filterable, sortable product grid once a search/category/
   deals query is present (or filters are touched).
   ============================================================ */

const CATEGORY_EMOJI = {
  "Electronics": "💻",
  "Fashion": "👗",
  "Home & Kitchen": "🍳",
  "Books": "📚",
  "Sports": "🏀",
  "Toys": "🧸",
};

let activeFilters = { category: "all", maxPrice: 60000, minRating: 0, brands: [], deals: false, sort: "relevance", q: "" };

function initHomePage() {
  // home.js is also loaded on product.html purely for shared helpers
  // (productCard, bindCardButtons) — skip the full init if we're not
  // actually on the shop page.
  if (!document.getElementById("shopLayout")) return;

  const params = new URLSearchParams(window.location.search);
  activeFilters.q = params.get("q") || "";
  activeFilters.category = params.get("category") || "all";
  activeFilters.deals = params.get("deals") === "1";

  renderHeader(activeFilters.category !== "all" ? activeFilters.category : null);
  renderCategoryTiles();
  renderBrandFilters();
  bindFilterControls();

  const heroSection = document.getElementById("heroSection");
  const showFullCatalogue = !!activeFilters.q || activeFilters.category !== "all" || activeFilters.deals;
  if (heroSection) heroSection.classList.toggle("hidden", showFullCatalogue);
  document.getElementById("categorySection").classList.toggle("hidden", showFullCatalogue);
  document.getElementById("shopLayout").classList.toggle("hidden", !showFullCatalogue);
  document.getElementById("homeFeatured").classList.toggle("hidden", showFullCatalogue);

  if (showFullCatalogue) {
    document.getElementById("catFilterSelect") && (document.getElementById("catFilterSelect").value = activeFilters.category);
    renderProductGrid();
  } else {
    renderFeaturedRows();
  }
}

function renderCategoryTiles() {
  const grid = document.getElementById("categoryGrid");
  if (!grid) return;
  grid.innerHTML = CATEGORIES.map(c => `
    <a class="category-tile" href="home.html?category=${encodeURIComponent(c)}">
      <span class="emoji">${CATEGORY_EMOJI[c] || "🛍️"}</span>
      <span>${c}</span>
    </a>
  `).join("");
}

function renderFeaturedRows() {
  const mount = document.getElementById("homeFeatured");
  if (!mount) return;
  const products = getProducts();
  const deals = products.filter(p => discountPercent(p.price, p.mrp) >= 30).slice(0, 4);
  const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);
  mount.innerHTML = `
    <div class="section-title"><h2>🔥 Today's Deals</h2><a href="home.html?deals=1">View all</a></div>
    <div class="product-grid">${deals.map(productCard).join("")}</div>
    <div class="section-title"><h2>⭐ Top Rated</h2><a href="home.html?category=Electronics">View all</a></div>
    <div class="product-grid">${topRated.map(productCard).join("")}</div>
  `;
  bindCardButtons(mount);
}

function renderBrandFilters() {
  const mount = document.getElementById("brandFilterGroup");
  if (!mount) return;
  const brands = [...new Set(getProducts().map(p => p.brand))].sort();
  mount.innerHTML = brands.map(b => `
    <label class="filter-option">
      <input type="checkbox" value="${b}" class="brandCheckbox"> ${b}
    </label>
  `).join("");
  mount.querySelectorAll(".brandCheckbox").forEach(cb => {
    cb.addEventListener("change", () => {
      activeFilters.brands = [...mount.querySelectorAll(".brandCheckbox:checked")].map(c => c.value);
      renderProductGrid();
    });
  });
}

function bindFilterControls() {
  const catSelect = document.getElementById("catFilterSelect");
  if (catSelect) {
    catSelect.innerHTML = `<option value="all">All Categories</option>` + CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join("");
    catSelect.value = activeFilters.category;
    catSelect.addEventListener("change", () => { activeFilters.category = catSelect.value; renderProductGrid(); });
  }
  const priceRange = document.getElementById("priceRange");
  const priceLabel = document.getElementById("priceRangeLabel");
  if (priceRange) {
    priceRange.addEventListener("input", () => {
      activeFilters.maxPrice = Number(priceRange.value);
      priceLabel.textContent = formatPrice(priceRange.value);
      renderProductGrid();
    });
  }
  document.querySelectorAll(".ratingCheckbox").forEach(cb => {
    cb.addEventListener("change", () => {
      const checked = [...document.querySelectorAll(".ratingCheckbox:checked")].map(c => Number(c.value));
      activeFilters.minRating = checked.length ? Math.min(...checked) : 0;
      renderProductGrid();
    });
  });
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => { activeFilters.sort = sortSelect.value; renderProductGrid(); });
  }
  const clearBtn = document.getElementById("clearFiltersBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      activeFilters = { ...activeFilters, category: "all", maxPrice: 60000, minRating: 0, brands: [], deals: false, sort: "relevance" };
      window.location.href = "home.html" + (activeFilters.q ? `?q=${encodeURIComponent(activeFilters.q)}` : "");
    });
  }
}

function getFilteredProducts() {
  let list = getProducts();
  if (activeFilters.q) {
    const term = activeFilters.q.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term) || p.category.toLowerCase().includes(term));
  }
  if (activeFilters.category !== "all") list = list.filter(p => p.category === activeFilters.category);
  if (activeFilters.deals) list = list.filter(p => discountPercent(p.price, p.mrp) >= 20);
  list = list.filter(p => p.price <= activeFilters.maxPrice);
  if (activeFilters.minRating) list = list.filter(p => p.rating >= activeFilters.minRating);
  if (activeFilters.brands.length) list = list.filter(p => activeFilters.brands.includes(p.brand));

  switch (activeFilters.sort) {
    case "price-low": list.sort((a, b) => a.price - b.price); break;
    case "price-high": list.sort((a, b) => b.price - a.price); break;
    case "rating": list.sort((a, b) => b.rating - a.rating); break;
    case "discount": list.sort((a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp)); break;
    default: break; // relevance: keep catalogue order
  }
  return list;
}

function renderProductGrid() {
  const grid = document.getElementById("productGrid");
  const resultsCount = document.getElementById("resultsCount");
  if (!grid) return;
  const list = getFilteredProducts();
  resultsCount.textContent = activeFilters.q
    ? `${list.length} results for "${activeFilters.q}"`
    : `${list.length} products${activeFilters.category !== "all" ? " in " + activeFilters.category : ""}`;

  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><span class="emoji">🔎</span><h3>No products match your filters</h3><p>Try widening your price range or clearing some filters.</p></div>`;
    return;
  }
  grid.innerHTML = list.map(productCard).join("");
  bindCardButtons(grid);
}

function productCard(p) {
  const off = discountPercent(p.price, p.mrp);
  return `
  <div class="product-card">
    ${off > 0 ? `<span class="deal-ticket">${off}% OFF</span>` : ""}
    <a href="product.html?id=${p.id}">
      <div class="thumb"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
    </a>
    <div class="pcat">${p.category} · ${p.brand}</div>
    <a href="product.html?id=${p.id}"><h3 class="pname">${p.name}</h3></a>
    <span class="rating-pill">${p.rating.toFixed(1)} ★ (${p.reviewsCount})</span>
    <div class="price-row">
      <span class="price-now">${formatPrice(p.price)}</span>
      ${p.mrp > p.price ? `<span class="price-mrp">${formatPrice(p.mrp)}</span><span class="price-off">${off}% off</span>` : ""}
    </div>
    <button class="btn btn-dark btn-sm add-cart-btn" data-id="${p.id}">Add to Cart</button>
  </div>`;
}

function bindCardButtons(scope) {
  scope.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.id, 1);
      showToast("Added to cart");
      document.getElementById("cartBadge").textContent = getCartItemCount();
    });
  });
}

document.addEventListener("DOMContentLoaded", initHomePage);
