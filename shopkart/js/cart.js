/* ============================================================
   ShopKart — cart.js
   Drives cart.html: lists items with qty controls, computes the
   receipt-style summary (subtotal, savings, delivery, total) and
   applies a simple demo coupon code.
   ============================================================ */

let appliedCoupon = null;
const VALID_COUPONS = { SAVE10: 0.10, WELCOME50: 50 }; // percent or flat ₹

function initCartPage() {
  renderHeader();
  renderCart();
  document.getElementById("couponForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("couponInput").value.trim().toUpperCase();
    if (VALID_COUPONS[code] !== undefined) {
      appliedCoupon = code;
      showToast(`Coupon ${code} applied`);
    } else {
      appliedCoupon = null;
      showToast("Invalid coupon code");
    }
    renderSummary();
  });
}

function renderCart() {
  const items = getCartDetailed();
  const mount = document.getElementById("cartItems");
  const emptyState = document.getElementById("cartEmpty");
  const layout = document.getElementById("cartLayout");

  if (!items.length) {
    layout.classList.add("hidden");
    emptyState.classList.remove("hidden");
    return;
  }
  layout.classList.remove("hidden");
  emptyState.classList.add("hidden");

  mount.innerHTML = `<h1 style="font-size:1.3rem; margin-bottom: 6px;">Shopping Cart</h1><p class="muted" style="margin-bottom:18px;">${items.length} item${items.length > 1 ? "s" : ""} in your cart</p>` +
    items.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="thumb"><img src="${item.img}" alt="${item.name}"></div>
      <div>
        <h3><a href="product.html?id=${item.id}">${item.name}</a></h3>
        <div class="meta">${item.brand} · ${item.category}</div>
        <div class="cart-item-actions">
          <div class="qty-stepper">
            <button type="button" class="qtyDec">−</button>
            <span>${item.qty}</span>
            <button type="button" class="qtyInc">+</button>
          </div>
          <button type="button" class="remove-link">Remove</button>
        </div>
      </div>
      <div class="cart-item-total">${formatPrice(item.price * item.qty)}</div>
    </div>
  `).join("");

  mount.querySelectorAll(".cart-item").forEach(row => {
    const id = row.dataset.id;
    const item = items.find(i => i.id === id);
    row.querySelector(".qtyInc").addEventListener("click", () => {
      if (item.qty < item.stock) { setCartQty(id, item.qty + 1); renderCart(); renderSummary(); updateBadge(); }
    });
    row.querySelector(".qtyDec").addEventListener("click", () => {
      setCartQty(id, item.qty - 1); renderCart(); renderSummary(); updateBadge();
    });
    row.querySelector(".remove-link").addEventListener("click", () => {
      removeFromCart(id); renderCart(); renderSummary(); updateBadge();
      showToast("Item removed");
    });
  });

  renderSummary();
}

function renderSummary() {
  const items = getCartDetailed();
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const mrpTotal = items.reduce((s, i) => s + i.mrp * i.qty, 0);
  const savings = Math.max(0, mrpTotal - subtotal);
  const delivery = subtotal === 0 || subtotal >= 499 ? 0 : 49;

  let discount = 0;
  if (appliedCoupon) {
    const rule = VALID_COUPONS[appliedCoupon];
    discount = rule < 1 ? Math.round(subtotal * rule) : rule;
    discount = Math.min(discount, subtotal);
  }
  const total = subtotal - discount + delivery;

  const mount = document.getElementById("cartSummary");
  if (!mount) return;
  mount.innerHTML = `
    <div class="receipt">
      <h3>Order Summary</h3>
      <div class="receipt-row"><span>Price (${items.reduce((s, i) => s + i.qty, 0)} items)</span><span>${formatPrice(subtotal)}</span></div>
      <div class="receipt-row saving"><span>Discount on MRP</span><span>− ${formatPrice(savings)}</span></div>
      ${appliedCoupon ? `<div class="receipt-row saving"><span>Coupon ${appliedCoupon}</span><span>− ${formatPrice(discount)}</span></div>` : ""}
      <div class="receipt-row"><span>Delivery</span><span>${delivery === 0 ? "FREE" : formatPrice(delivery)}</span></div>
      <div class="receipt-row total"><span>Total</span><span>${formatPrice(total)}</span></div>
    </div>
    <div class="receipt-edge"></div>
    <form id="couponForm" class="coupon-row" style="padding:0 4px;">
      <input type="text" id="couponInput" placeholder="Try SAVE10 or WELCOME50">
      <button class="btn btn-outline btn-sm" type="submit">Apply</button>
    </form>
    <button class="btn btn-primary btn-block" id="checkoutBtn" ${items.length === 0 ? "disabled" : ""}>Proceed to Checkout</button>
    <p class="muted" style="font-size:0.78rem; margin-top:10px;">🔒 Safe and secure payments. 100% authentic products.</p>
  `;
  document.getElementById("couponForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("couponInput").value.trim().toUpperCase();
    if (VALID_COUPONS[code] !== undefined) { appliedCoupon = code; showToast(`Coupon ${code} applied`); }
    else { appliedCoupon = null; showToast("Invalid coupon code"); }
    renderSummary();
  });
  document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (!getSession()) { window.location.href = "login.html?next=checkout.html"; return; }
    sessionStorage.setItem("sk_applied_coupon", appliedCoupon || "");
    window.location.href = "checkout.html";
  });
}

function updateBadge() {
  const badge = document.getElementById("cartBadge");
  if (badge) badge.textContent = getCartItemCount();
}

document.addEventListener("DOMContentLoaded", initCartPage);
