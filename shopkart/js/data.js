/* ============================================================
   ShopKart — data.js
   Central "database" for the demo store. Everything lives in
   localStorage so the whole multi-page site behaves like a real
   app without needing a server. Every other JS file reads/writes
   through the helpers in here.
   ============================================================ */

const DB_KEYS = {
  USERS: "sk_users",
  SESSION: "sk_session",
  CART: "sk_cart",
  ORDERS: "sk_orders",
  PRODUCTS: "sk_products",
  REVIEWS: "sk_reviews",
};

/* ---------- Seed catalogue -----------------------------------
   30 products across 6 categories. Images are royalty-free
   Unsplash source URLs so the catalogue looks real out of the box. */
const SEED_PRODUCTS = [
  // Electronics
  { id: "p01", name: "Aurora 65 Mechanical Keyboard", category: "Electronics", brand: "Aurora", price: 4499, mrp: 5999, rating: 4.5, reviewsCount: 312, stock: 24, img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80", desc: "Hot-swappable 65% mechanical keyboard with PBT keycaps, RGB backlight and a satisfying tactile switch feel. Built for long coding and gaming sessions." },
  { id: "p02", name: "Nimbus Wireless Headphones", category: "Electronics", brand: "Nimbus", price: 2999, mrp: 4499, rating: 4.3, reviewsCount: 891, stock: 50, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", desc: "Over-ear wireless headphones with 40-hour battery life, active noise cancellation, and plush memory-foam ear cushions." },
  { id: "p03", name: "Pixel Edge 6.7\" Smartphone", category: "Electronics", brand: "Pixel Edge", price: 24999, mrp: 28999, rating: 4.6, reviewsCount: 1542, stock: 15, img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80", desc: "6.7-inch AMOLED display, triple camera system, 5G ready, and a 5000mAh battery that lasts all day and then some." },
  { id: "p04", name: "Streamline 14\" Ultrabook", category: "Electronics", brand: "Streamline", price: 54999, mrp: 64999, rating: 4.4, reviewsCount: 203, stock: 8, img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80", desc: "Featherlight aluminium chassis, 16GB RAM, 512GB SSD and a 14-inch 2K display for work on the move." },
  { id: "p05", name: "Orbit Smartwatch Series 3", category: "Electronics", brand: "Orbit", price: 7999, mrp: 9999, rating: 4.2, reviewsCount: 678, stock: 33, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", desc: "Track workouts, sleep and heart rate with a vivid always-on display and 10-day battery life." },
  { id: "p06", name: "EchoBeam Bluetooth Speaker", category: "Electronics", brand: "EchoBeam", price: 1799, mrp: 2499, rating: 4.1, reviewsCount: 455, stock: 60, img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80", desc: "Portable IPX7 waterproof speaker with 360° sound and 12-hour playtime, perfect for outdoor trips." },

  // Fashion
  { id: "p07", name: "Heritage Slim-Fit Denim Jacket", category: "Fashion", brand: "Heritage", price: 1999, mrp: 3499, rating: 4.0, reviewsCount: 221, stock: 40, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80", desc: "Classic washed denim jacket with a tailored slim fit, brass buttons and reinforced stitching." },
  { id: "p08", name: "Drift Running Shoes", category: "Fashion", brand: "Drift", price: 2499, mrp: 3999, rating: 4.4, reviewsCount: 980, stock: 75, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", desc: "Lightweight mesh upper with responsive cushioning, built for daily runs and all-day comfort." },
  { id: "p09", name: "Linen Comfort Shirt", category: "Fashion", brand: "Comfortwear", price: 999, mrp: 1599, rating: 4.1, reviewsCount: 134, stock: 90, img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80", desc: "Breathable pure-linen shirt, perfect for summer with a relaxed everyday fit." },
  { id: "p10", name: "Aviator Polarized Sunglasses", category: "Fashion", brand: "Solflare", price: 1299, mrp: 2199, rating: 4.3, reviewsCount: 312, stock: 56, img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80", desc: "UV400 polarized lenses with a lightweight metal frame for everyday glare-free wear." },
  { id: "p11", name: "Quilted Travel Backpack", category: "Fashion", brand: "Voyage", price: 2199, mrp: 3299, rating: 4.5, reviewsCount: 502, stock: 38, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", desc: "Water-resistant 30L backpack with a padded laptop sleeve and luggage strap pass-through." },
  { id: "p12", name: "Classic Leather Wallet", category: "Fashion", brand: "Heritage", price: 799, mrp: 1299, rating: 4.2, reviewsCount: 290, stock: 70, img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80", desc: "Genuine leather bifold wallet with RFID-blocking card slots and a slim profile." },

  // Home & Kitchen
  { id: "p13", name: "BrewMaster Drip Coffee Maker", category: "Home & Kitchen", brand: "BrewMaster", price: 2899, mrp: 3999, rating: 4.4, reviewsCount: 410, stock: 27, img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80", desc: "12-cup programmable coffee maker with a keep-warm plate and reusable filter." },
  { id: "p14", name: "Lumen Smart LED Bulb (Pack of 2)", category: "Home & Kitchen", brand: "Lumen", price: 599, mrp: 999, rating: 4.0, reviewsCount: 188, stock: 120, img: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&q=80", desc: "Wi-Fi enabled smart bulbs with 16 million colours, voice assistant support, and app scheduling." },
  { id: "p15", name: "Hearth Cast-Iron Skillet 12\"", category: "Home & Kitchen", brand: "Hearth", price: 1499, mrp: 2199, rating: 4.7, reviewsCount: 366, stock: 44, img: "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&q=80", desc: "Pre-seasoned cast iron skillet that goes from stovetop to oven, built to last generations." },
  { id: "p16", name: "Cloudrest Memory Foam Pillow", category: "Home & Kitchen", brand: "Cloudrest", price: 899, mrp: 1499, rating: 4.3, reviewsCount: 521, stock: 65, img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80", desc: "Contoured memory foam pillow with a breathable bamboo cover for better neck support." },
  { id: "p17", name: "Vortex Stick Vacuum Cleaner", category: "Home & Kitchen", brand: "Vortex", price: 5999, mrp: 7999, rating: 4.2, reviewsCount: 245, stock: 19, img: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80", desc: "Cordless stick vacuum with 40 minutes runtime and a detachable handheld unit for tight corners." },
  { id: "p18", name: "Marble Finish Dinner Set (16 pc)", category: "Home & Kitchen", brand: "Hearth", price: 2299, mrp: 3499, rating: 4.5, reviewsCount: 156, stock: 30, img: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80", desc: "Elegant marble-finish stoneware dinner set, microwave and dishwasher safe." },

  // Books
  { id: "p19", name: "The Silent Orchard — Novel", category: "Books", brand: "Penfield Press", price: 399, mrp: 599, rating: 4.6, reviewsCount: 890, stock: 100, img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80", desc: "A sweeping family drama spanning three generations, praised for its lyrical prose." },
  { id: "p20", name: "Atomic Focus — Productivity Guide", category: "Books", brand: "Northbound", price: 349, mrp: 499, rating: 4.4, reviewsCount: 1203, stock: 150, img: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80", desc: "A practical, research-backed guide to building focus habits that actually stick." },
  { id: "p21", name: "Cosmos Illustrated — Science for All", category: "Books", brand: "Stargate Books", price: 599, mrp: 899, rating: 4.7, reviewsCount: 432, stock: 80, img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80", desc: "A beautifully illustrated tour of the universe, written for curious minds of all ages." },
  { id: "p22", name: "Code Like a Pro — JavaScript Edition", category: "Books", brand: "DevPress", price: 699, mrp: 999, rating: 4.3, reviewsCount: 267, stock: 60, img: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80", desc: "Modern JavaScript patterns and best practices explained through real-world projects." },

  // Sports
  { id: "p23", name: "ProGrip Yoga Mat", category: "Sports", brand: "ProGrip", price: 899, mrp: 1399, rating: 4.5, reviewsCount: 612, stock: 85, img: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80", desc: "Extra-thick non-slip yoga mat with carry strap, suitable for all floor types." },
  { id: "p24", name: "Strike Football — Match Ball", category: "Sports", brand: "Strike", price: 1199, mrp: 1799, rating: 4.4, reviewsCount: 340, stock: 50, img: "https://images.unsplash.com/photo-1614632537190-23e4146777db?w=600&q=80", desc: "FIFA-quality match football with thermo-bonded panels for consistent flight." },
  { id: "p25", name: "Summit Adjustable Dumbbell Set", category: "Sports", brand: "Summit", price: 3499, mrp: 4999, rating: 4.6, reviewsCount: 198, stock: 22, img: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600&q=80", desc: "Space-saving adjustable dumbbells, 5-25kg per hand with quick-lock dials." },
  { id: "p26", name: "TrailBlaze Cycling Helmet", category: "Sports", brand: "TrailBlaze", price: 1599, mrp: 2399, rating: 4.3, reviewsCount: 145, stock: 40, img: "https://images.unsplash.com/photo-1557803175-d3704d4b62b9?w=600&q=80", desc: "Aerodynamic helmet with 18 vents and an adjustable fit dial for all-day rides." },

  // Toys & Baby
  { id: "p27", name: "BuildBricks Galaxy Set (500 pc)", category: "Toys", brand: "BuildBricks", price: 1899, mrp: 2799, rating: 4.7, reviewsCount: 720, stock: 36, img: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80", desc: "500-piece interlocking brick set to build a spaceship and rover, compatible with major brands." },
  { id: "p28", name: "Plushy Bear — Giant Cuddly Toy", category: "Toys", brand: "Plushy", price: 799, mrp: 1199, rating: 4.8, reviewsCount: 980, stock: 55, img: "https://images.unsplash.com/photo-1559454403-b8fb88521f12?w=600&q=80", desc: "Super-soft 60cm plush bear made from hypoallergenic fibre, machine washable." },
  { id: "p29", name: "Wonder Wagon — Ride-on Toy", category: "Toys", brand: "Wonder", price: 2999, mrp: 3999, rating: 4.4, reviewsCount: 210, stock: 18, img: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&q=80", desc: "Sturdy ride-on wagon for toddlers with safety harness and shaded canopy." },
  { id: "p30", name: "Puzzle Planet — 1000 pc Jigsaw", category: "Toys", brand: "Puzzle Planet", price: 549, mrp: 799, rating: 4.5, reviewsCount: 305, stock: 70, img: "https://images.unsplash.com/photo-1577083552431-6e5fd01988a5?w=600&q=80", desc: "1000-piece jigsaw puzzle of a starry night sky, printed on premium matte board." },
];

const CATEGORIES = ["Electronics", "Fashion", "Home & Kitchen", "Books", "Sports", "Toys"];

const SEED_REVIEWS = {
  p01: [
    { user: "Rahul M.", rating: 5, text: "Switches feel premium, typing is a joy. Worth every rupee.", date: "2026-04-12" },
    { user: "Asha K.", rating: 4, text: "Great keyboard, software could be simpler.", date: "2026-03-02" },
  ],
  p03: [
    { user: "Vivek S.", rating: 5, text: "Camera quality is outstanding for the price.", date: "2026-05-01" },
    { user: "Priya N.", rating: 4, text: "Battery easily lasts a full day of heavy use.", date: "2026-04-20" },
  ],
  p08: [
    { user: "Karthik R.", rating: 5, text: "Super comfortable for my morning runs.", date: "2026-05-15" },
  ],
};

/* ---------- Bootstrap on first load ---------------------------*/
function initDB() {
  if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
  }
  if (!localStorage.getItem(DB_KEYS.REVIEWS)) {
    localStorage.setItem(DB_KEYS.REVIEWS, JSON.stringify(SEED_REVIEWS));
  }
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    // seed one admin + one demo shopper so login works out of the box
    const users = [
      { id: "u_admin", name: "Store Admin", email: "admin@shopkart.test", password: "admin123", role: "admin", addresses: [] },
      { id: "u_demo", name: "Demo Shopper", email: "demo@shopkart.test", password: "demo1234", role: "customer", addresses: [
        { label: "Home", line1: "221B Baker Street", city: "Bengaluru", state: "Karnataka", pin: "560001", phone: "9876543210" },
      ] },
    ];
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  }
  if (!localStorage.getItem(DB_KEYS.ORDERS)) {
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.CART)) {
    localStorage.setItem(DB_KEYS.CART, JSON.stringify({}));
  }
}
initDB();

/* ---------- Generic helpers ------------------------------------*/
const db = {
  get(key) { return JSON.parse(localStorage.getItem(key) || "null"); },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
};

/* ---------- Product helpers ------------------------------------*/
function getProducts() { return db.get(DB_KEYS.PRODUCTS) || []; }
function saveProducts(list) { db.set(DB_KEYS.PRODUCTS, list); }
function getProductById(id) { return getProducts().find(p => p.id === id); }
function getReviews(productId) {
  const all = db.get(DB_KEYS.REVIEWS) || {};
  return all[productId] || [];
}
function addReview(productId, review) {
  const all = db.get(DB_KEYS.REVIEWS) || {};
  if (!all[productId]) all[productId] = [];
  all[productId].unshift(review);
  db.set(DB_KEYS.REVIEWS, all);
  // bump the rolling rating + count on the product itself
  const products = getProducts();
  const p = products.find(p => p.id === productId);
  if (p) {
    const total = (p.rating * p.reviewsCount) + review.rating;
    p.reviewsCount += 1;
    p.rating = Math.round((total / p.reviewsCount) * 10) / 10;
    saveProducts(products);
  }
}

/* ---------- Auth helpers ----------------------------------------*/
function getUsers() { return db.get(DB_KEYS.USERS) || []; }
function saveUsers(list) { db.set(DB_KEYS.USERS, list); }
function getSession() { return db.get(DB_KEYS.SESSION); }
function setSession(user) {
  db.set(DB_KEYS.SESSION, { id: user.id, name: user.name, email: user.email, role: user.role });
}
function clearSession() { localStorage.removeItem(DB_KEYS.SESSION); }
function getCurrentUser() {
  const s = getSession();
  if (!s) return null;
  return getUsers().find(u => u.id === s.id) || null;
}

/* ---------- Cart helpers (per logged-in user, keyed by email) ---*/
function cartKeyFor() {
  const s = getSession();
  return s ? s.email : "guest";
}
function getCart() {
  const all = db.get(DB_KEYS.CART) || {};
  return all[cartKeyFor()] || {};
}
function saveCart(cart) {
  const all = db.get(DB_KEYS.CART) || {};
  all[cartKeyFor()] = cart;
  db.set(DB_KEYS.CART, all);
}
function addToCart(productId, qty = 1) {
  const cart = getCart();
  cart[productId] = (cart[productId] || 0) + qty;
  saveCart(cart);
}
function setCartQty(productId, qty) {
  const cart = getCart();
  if (qty <= 0) { delete cart[productId]; } else { cart[productId] = qty; }
  saveCart(cart);
}
function removeFromCart(productId) {
  const cart = getCart();
  delete cart[productId];
  saveCart(cart);
}
function clearCart() { saveCart({}); }
function getCartItemCount() {
  const cart = getCart();
  return Object.values(cart).reduce((sum, q) => sum + q, 0);
}
function getCartDetailed() {
  const cart = getCart();
  const products = getProducts();
  return Object.entries(cart).map(([id, qty]) => {
    const product = products.find(p => p.id === id);
    return product ? { ...product, qty } : null;
  }).filter(Boolean);
}

/* ---------- Order helpers ----------------------------------------*/
function getOrders() { return db.get(DB_KEYS.ORDERS) || []; }
function saveOrders(list) { db.set(DB_KEYS.ORDERS, list); }
function getOrdersForUser(email) { return getOrders().filter(o => o.userEmail === email); }
function createOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
}
function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const o = orders.find(o => o.id === orderId);
  if (o) {
    o.status = status;
    o.timeline.push({ status, date: new Date().toISOString() });
    saveOrders(orders);
  }
}
function genOrderId() {
  return "SK" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10);
}

/* ---------- Misc ----------------------------------------------*/
function formatPrice(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}
function discountPercent(price, mrp) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
function starString(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}
