/* ============================================================
   ShopKart — checkout.js
   Drives checkout.html: pick/add a delivery address, choose a
   payment method (Card / UPI / COD — all simulated, no real
   payment gateway), review the receipt summary, and place the
   order which is written into the orders "table".
   ============================================================ */

let selectedAddressIdx = 0;
let selectedPayment = "card";

function initCheckoutPage() {
  const session = requireLogin("checkout.html");
  if (!session) return;
  renderHeader();

  const items = getCartDetailed();
  if (!items.length) { window.location.href = "cart.html"; return; }

  renderAddresses();
  renderPaymentOptions();
  renderCheckoutSummary();
  bindAddAddressForm();

  document.getElementById("placeOrderBtn").addEventListener("click", placeOrder);
}

function currentUserFull() { return getCurrentUser(); }

function renderAddresses() {
  const user = currentUserFull();
  const mount = document.getElementById("addressList");
  if (!user.addresses.length) {
    mount.innerHTML = `<p class="muted">No saved addresses yet. Add one below.</p>`;
  } else {
    mount.innerHTML = user.addresses.map((a, i) => `
      <div class="address-card ${i === selectedAddressIdx ? "selected" : ""}" data-idx="${i}">
        <input type="radio" name="addr" ${i === selectedAddressIdx ? "checked" : ""}>
        <div>
          <strong>${a.label}</strong>
          <p>${a.line1}, ${a.city}, ${a.state} - ${a.pin}<br>Phone: ${a.phone}</p>
        </div>
      </div>
    `).join("");
    mount.querySelectorAll(".address-card").forEach(card => {
      card.addEventListener("click", () => {
        selectedAddressIdx = Number(card.dataset.idx);
        renderAddresses();
      });
    });
  }
}

function bindAddAddressForm() {
  const form = document.getElementById("addAddressForm");
  const toggleBtn = document.getElementById("toggleAddAddress");
  toggleBtn.addEventListener("click", () => form.classList.toggle("hidden"));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const newAddr = {
      label: document.getElementById("addrLabel").value.trim() || "Address",
      line1: document.getElementById("addrLine1").value.trim(),
      city: document.getElementById("addrCity").value.trim(),
      state: document.getElementById("addrState").value.trim(),
      pin: document.getElementById("addrPin").value.trim(),
      phone: document.getElementById("addrPhone").value.trim(),
    };
    if (!newAddr.line1 || !/^\d{6}$/.test(newAddr.pin) || !/^\d{10}$/.test(newAddr.phone)) {
      showToast("Please fill the address correctly (6-digit PIN, 10-digit phone)");
      return;
    }
    const users = getUsers();
    const user = users.find(u => u.id === currentUserFull().id);
    user.addresses.push(newAddr);
    saveUsers(users);
    selectedAddressIdx = user.addresses.length - 1;
    form.reset();
    form.classList.add("hidden");
    renderAddresses();
    showToast("Address saved");
  });
}

function renderPaymentOptions() {
  const mount = document.getElementById("payOptions");
  const methods = [
    { id: "card", label: "Credit / Debit Card", icon: "💳" },
    { id: "upi", label: "UPI", icon: "📱" },
    { id: "cod", label: "Cash on Delivery", icon: "💵" },
  ];
  mount.innerHTML = methods.map(m => `
    <div class="pay-option ${m.id === selectedPayment ? "selected" : ""}" data-id="${m.id}">
      <input type="radio" name="pay" ${m.id === selectedPayment ? "checked" : ""}>
      <span>${m.icon}</span><span>${m.label}</span>
    </div>
  `).join("");
  mount.querySelectorAll(".pay-option").forEach(opt => {
    opt.addEventListener("click", () => {
      selectedPayment = opt.dataset.id;
      renderPaymentOptions();
      document.getElementById("cardFields").classList.toggle("show", selectedPayment === "card");
      document.getElementById("upiFields").classList.toggle("show", selectedPayment === "upi");
    });
  });
  document.getElementById("cardFields")?.classList.toggle("show", selectedPayment === "card");
  document.getElementById("upiFields")?.classList.toggle("show", selectedPayment === "upi");
}

function renderCheckoutSummary() {
  const items = getCartDetailed();
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const mrpTotal = items.reduce((s, i) => s + i.mrp * i.qty, 0);
  const savings = Math.max(0, mrpTotal - subtotal);
  const delivery = subtotal >= 499 ? 0 : 49;
  const coupon = sessionStorage.getItem("sk_applied_coupon") || "";
  let discount = 0;
  const coupons = { SAVE10: 0.10, WELCOME50: 50 };
  if (coupon && coupons[coupon] !== undefined) {
    discount = coupons[coupon] < 1 ? Math.round(subtotal * coupons[coupon]) : coupons[coupon];
    discount = Math.min(discount, subtotal);
  }
  const total = subtotal - discount + delivery;

  document.getElementById("checkoutSummary").innerHTML = `
    <div class="receipt">
      <h3>Order Summary</h3>
      ${items.map(i => `<div class="receipt-row"><span>${i.name.slice(0, 26)}${i.name.length > 26 ? "…" : ""} ×${i.qty}</span><span>${formatPrice(i.price * i.qty)}</span></div>`).join("")}
      <div class="receipt-row saving"><span>Discount on MRP</span><span>− ${formatPrice(savings)}</span></div>
      ${coupon ? `<div class="receipt-row saving"><span>Coupon ${coupon}</span><span>− ${formatPrice(discount)}</span></div>` : ""}
      <div class="receipt-row"><span>Delivery</span><span>${delivery === 0 ? "FREE" : formatPrice(delivery)}</span></div>
      <div class="receipt-row total"><span>Total Payable</span><span>${formatPrice(total)}</span></div>
    </div>
    <div class="receipt-edge"></div>
  `;
  return total;
}

function placeOrder() {
  const user = currentUserFull();
  if (!user.addresses.length) { showToast("Please add a delivery address"); return; }

  if (selectedPayment === "card") {
    const num = document.getElementById("cardNumber").value.replace(/\s/g, "");
    const exp = document.getElementById("cardExpiry").value;
    const cvv = document.getElementById("cardCvv").value;
    if (!/^\d{16}$/.test(num) || !/^\d{2}\/\d{2}$/.test(exp) || !/^\d{3}$/.test(cvv)) {
      showToast("Enter valid demo card details (16-digit number, MM/YY, 3-digit CVV)");
      return;
    }
  }
  if (selectedPayment === "upi") {
    const upiId = document.getElementById("upiId").value.trim();
    if (!/^[\w.\-]+@[\w]+$/.test(upiId)) { showToast("Enter a valid UPI ID, e.g. name@bank"); return; }
  }

  const items = getCartDetailed();
  const total = renderCheckoutSummary();
  const address = user.addresses[selectedAddressIdx];
  const order = {
    id: genOrderId(),
    userEmail: user.email,
    userName: user.name,
    items: items.map(i => ({ id: i.id, name: i.name, img: i.img, price: i.price, qty: i.qty })),
    address,
    payment: selectedPayment,
    total,
    status: "Placed",
    placedAt: new Date().toISOString(),
    timeline: [{ status: "Placed", date: new Date().toISOString() }],
  };
  createOrder(order);
  clearCart();
  sessionStorage.removeItem("sk_applied_coupon");
  sessionStorage.setItem("sk_last_order", order.id);
  window.location.href = "order-confirmation.html";
}

document.addEventListener("DOMContentLoaded", initCheckoutPage);
