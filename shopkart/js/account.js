/* ============================================================
   ShopKart — account.js
   Drives account.html: shows the logged-in shopper's profile,
   saved addresses, and their full order history with a visual
   status tracker for each order.
   ============================================================ */

const TRACK_STEPS = ["Placed", "Shipped", "Out for Delivery", "Delivered"];

function initAccountPage() {
  const session = requireLogin("account.html");
  if (!session) return;
  renderHeader();

  const user = getCurrentUser();
  document.getElementById("acctName").textContent = user.name;
  document.getElementById("acctEmail").textContent = user.email;

  renderAddressList(user);
  renderOrderHistory(user);
}

function renderAddressList(user) {
  const mount = document.getElementById("acctAddresses");
  if (!user.addresses.length) {
    mount.innerHTML = `<p class="muted">No saved addresses yet. You can add one during checkout.</p>`;
    return;
  }
  mount.innerHTML = user.addresses.map(a => `
    <div class="address-card">
      <div>
        <strong>${a.label}</strong>
        <p>${a.line1}, ${a.city}, ${a.state} - ${a.pin}<br>Phone: ${a.phone}</p>
      </div>
    </div>
  `).join("");
}

function renderOrderHistory(user) {
  const orders = getOrdersForUser(user.email);
  const mount = document.getElementById("orderHistory");
  if (!orders.length) {
    mount.innerHTML = `<div class="empty-state"><span class="emoji">📦</span><h3>No orders yet</h3><p><a href="home.html">Start shopping</a></p></div>`;
    return;
  }
  mount.innerHTML = orders.map(orderCardHTML).join("");
  mount.querySelectorAll(".cancel-order-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!confirm("Cancel this order?")) return;
      updateOrderStatus(btn.dataset.id, "Cancelled");
      renderOrderHistory(getCurrentUser());
      showToast("Order cancelled");
    });
  });
}

function orderCardHTML(o) {
  const stepIdx = TRACK_STEPS.indexOf(o.status);
  const cancelled = o.status === "Cancelled";
  return `
  <div class="order-card">
    <div class="order-card-head">
      <div>
        <span class="order-id">${o.id}</span>
        <span class="muted"> · placed ${new Date(o.placedAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
      </div>
      <span class="status-badge status-${o.status.replace(/\s/g, "-")}">${o.status}</span>
    </div>
    <div class="order-items-row">
      ${o.items.map(i => `<div class="thumb" title="${i.name} ×${i.qty}"><img src="${i.img}" alt="${i.name}"></div>`).join("")}
    </div>
    <div class="flex-between">
      <span class="muted">${o.items.reduce((s, i) => s + i.qty, 0)} item(s) · Deliver to ${o.address.city}</span>
      <strong>${formatPrice(o.total)}</strong>
    </div>
    ${!cancelled ? `
    <div class="tracker">
      ${TRACK_STEPS.map((s, i) => `<div class="tracker-step ${i < stepIdx ? "done" : ""} ${i === stepIdx ? "current" : ""}">${s}</div>`).join("")}
    </div>` : `<p class="muted" style="margin-top:10px;">This order was cancelled.</p>`}
    ${(!cancelled && o.status === "Placed") ? `<div style="margin-top:12px;"><button class="btn btn-outline btn-sm cancel-order-btn" data-id="${o.id}">Cancel order</button></div>` : ""}
  </div>`;
}

document.addEventListener("DOMContentLoaded", initAccountPage);
