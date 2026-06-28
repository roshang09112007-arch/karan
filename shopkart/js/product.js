/* ============================================================
   ShopKart — product.js
   Drives product.html: loads the product from the query string,
   renders gallery/pricing/description, reviews, the review form,
   and a related-products rail.
   ============================================================ */

let currentProduct = null;
let currentQty = 1;

function initProductPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  currentProduct = getProductById(id);

  if (!currentProduct) {
    document.getElementById("pdpRoot").innerHTML = `<div class="empty-state"><span class="emoji">📦</span><h3>Product not found</h3><p><a href="home.html">Back to shop</a></p></div>`;
    renderHeader();
    return;
  }
  renderHeader(currentProduct.category);
  document.title = currentProduct.name + " — ShopKart";
  renderProductDetail();
  renderReviews();
  renderRelated();
  bindReviewForm();
}

function renderProductDetail() {
  const p = currentProduct;
  const off = discountPercent(p.price, p.mrp);
  const gallery = [p.img, p.img, p.img]; // demo: same image, distinct thumbs for UI completeness

  document.getElementById("pdpRoot").innerHTML = `
    <div class="breadcrumb">
      <a href="home.html">Home</a> / <a href="home.html?category=${encodeURIComponent(p.category)}">${p.category}</a> / ${p.name}
    </div>
    <div class="pdp">
      <div class="pdp-gallery">
        <div class="main-img"><img id="mainImg" src="${p.img}" alt="${p.name}"></div>
        <div class="thumb-row">
          ${gallery.map((g, i) => `<button class="${i === 0 ? "active" : ""}" data-img="${g}"><img src="${g}" alt="thumb ${i + 1}"></button>`).join("")}
        </div>
      </div>
      <div class="pdp-info">
        <h1>${p.name}</h1>
        <div class="pdp-brand">by <strong>${p.brand}</strong> &nbsp;|&nbsp; <span class="rating-pill">${p.rating.toFixed(1)} ★ (${p.reviewsCount} ratings)</span></div>

        <div class="pdp-price-block">
          <div class="price-row">
            <span class="price-now">${formatPrice(p.price)}</span>
            ${p.mrp > p.price ? `<span class="price-mrp">${formatPrice(p.mrp)}</span><span class="price-off">${off}% off</span>` : ""}
          </div>
          <div class="muted">Inclusive of all taxes</div>
          <div class="stock-tag ${p.stock > 0 ? "in" : "out"}">${p.stock > 0 ? (p.stock <= 5 ? `Only ${p.stock} left — order soon!` : "In stock") : "Out of stock"}</div>
        </div>

        <div class="flex gap-8" style="align-items:center;">
          <span class="muted" style="font-size:0.88rem;">Quantity</span>
          <div class="qty-stepper">
            <button id="qtyMinus" type="button">−</button>
            <span id="qtyVal">1</span>
            <button id="qtyPlus" type="button">+</button>
          </div>
        </div>

        <div class="pdp-actions">
          <button class="btn btn-primary" id="addToCartBtn" ${p.stock === 0 ? "disabled" : ""}>🛒 Add to Cart</button>
          <button class="btn btn-dark" id="buyNowBtn" ${p.stock === 0 ? "disabled" : ""}>⚡ Buy Now</button>
        </div>

        <h3>Product description</h3>
        <p class="pdp-desc">${p.desc}</p>
        <ul class="feature-list">
          <li>Free delivery on orders above ₹499</li>
          <li>7-day easy return &amp; exchange policy</li>
          <li>1-year manufacturer warranty</li>
          <li>Cash on delivery available</li>
        </ul>
      </div>
    </div>
  `;

  // gallery swap
  document.querySelectorAll(".thumb-row button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("mainImg").src = btn.dataset.img;
      document.querySelectorAll(".thumb-row button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // quantity stepper
  currentQty = 1;
  document.getElementById("qtyMinus").addEventListener("click", () => {
    currentQty = Math.max(1, currentQty - 1);
    document.getElementById("qtyVal").textContent = currentQty;
  });
  document.getElementById("qtyPlus").addEventListener("click", () => {
    currentQty = Math.min(p.stock, currentQty + 1);
    document.getElementById("qtyVal").textContent = currentQty;
  });

  document.getElementById("addToCartBtn").addEventListener("click", () => {
    addToCart(p.id, currentQty);
    showToast("Added to cart");
    document.getElementById("cartBadge").textContent = getCartItemCount();
  });
  document.getElementById("buyNowBtn").addEventListener("click", () => {
    addToCart(p.id, currentQty);
    window.location.href = "checkout.html";
  });
}

function renderReviews() {
  const reviews = getReviews(currentProduct.id);
  const mount = document.getElementById("reviewsList");
  document.getElementById("reviewSummaryScore").textContent = currentProduct.rating.toFixed(1);
  document.getElementById("reviewSummaryStars").textContent = starString(currentProduct.rating);
  document.getElementById("reviewSummaryCount").textContent = `${currentProduct.reviewsCount} ratings`;

  if (!reviews.length) {
    mount.innerHTML = `<p class="muted">No reviews yet — be the first to share your thoughts.</p>`;
    return;
  }
  mount.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="stars">${starString(r.rating)}</div>
      <p>${escapeHTML(r.text)}</p>
      <div class="meta">${escapeHTML(r.user)} · ${new Date(r.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</div>
    </div>
  `).join("");
}

function bindReviewForm() {
  const form = document.getElementById("reviewForm");
  if (!form) return;
  const session = getSession();
  let selectedRating = 5;

  const starInput = document.getElementById("starInput");
  starInput.innerHTML = [1, 2, 3, 4, 5].map(i => `<span data-val="${i}" class="${i <= selectedRating ? "active" : "inactive"}">★</span>`).join("");
  starInput.querySelectorAll("span").forEach(s => {
    s.addEventListener("click", () => {
      selectedRating = Number(s.dataset.val);
      starInput.querySelectorAll("span").forEach(x => x.classList.toggle("active", Number(x.dataset.val) <= selectedRating));
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!session) {
      showToast("Please sign in to write a review");
      setTimeout(() => (window.location.href = `login.html?next=product.html?id=${currentProduct.id}`), 600);
      return;
    }
    const text = document.getElementById("reviewText").value.trim();
    if (!text) return;
    addReview(currentProduct.id, { user: session.name, rating: selectedRating, text, date: new Date().toISOString() });
    document.getElementById("reviewText").value = "";
    currentProduct = getProductById(currentProduct.id);
    renderReviews();
    showToast("Thanks for your review!");
  });
}

function renderRelated() {
  const mount = document.getElementById("relatedProducts");
  if (!mount) return;
  const related = getProducts().filter(p => p.category === currentProduct.category && p.id !== currentProduct.id).slice(0, 4);
  if (!related.length) { mount.closest(".reviews-section, section")?.classList; }
  mount.innerHTML = related.map(productCard).join("");
  bindCardButtons(mount);
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", initProductPage);
