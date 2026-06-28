/* ============================================================
   ShopKart — auth.js
   Handles the login and registration forms. Validates input,
   checks/creates users in the localStorage "DB", and starts a
   session. Used by login.html and register.html only.
   ============================================================ */

function initLoginPage() {
  const form = document.getElementById("loginForm");
  const errorBox = document.getElementById("loginError");
  if (!form) return;

  // If already logged in, bounce straight to where they wanted to go
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") || "home.html";
  if (getSession()) { window.location.href = next; return; }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const user = getUsers().find(u => u.email.toLowerCase() === email && u.password === password);

    if (!user) {
      errorBox.textContent = "We couldn't find an account with that email and password.";
      errorBox.classList.add("show");
      return;
    }
    errorBox.classList.remove("show");
    setSession(user);
    showToast(`Welcome back, ${user.name.split(" ")[0]}!`);
    setTimeout(() => {
      window.location.href = user.role === "admin" ? "admin.html" : next;
    }, 400);
  });

  // quick-fill demo credentials so reviewers can test instantly
  document.getElementById("fillDemo")?.addEventListener("click", () => {
    document.getElementById("loginEmail").value = "demo@shopkart.test";
    document.getElementById("loginPassword").value = "demo1234";
  });
  document.getElementById("fillAdmin")?.addEventListener("click", () => {
    document.getElementById("loginEmail").value = "admin@shopkart.test";
    document.getElementById("loginPassword").value = "admin123";
  });
}

function initRegisterPage() {
  const form = document.getElementById("registerForm");
  if (!form) return;
  if (getSession()) { window.location.href = "home.html"; return; }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const phone = document.getElementById("regPhone").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirm = document.getElementById("regConfirm").value;

    let valid = true;
    const setError = (id, msg) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = msg; el.classList.toggle("show", !!msg); }
    };

    if (name.length < 2) { setError("err-regName", "Please enter your full name."); valid = false; } else setError("err-regName", "");
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError("err-regEmail", "Enter a valid email address."); valid = false; } else setError("err-regEmail", "");
    if (!/^\d{10}$/.test(phone)) { setError("err-regPhone", "Enter a valid 10-digit phone number."); valid = false; } else setError("err-regPhone", "");
    if (password.length < 6) { setError("err-regPassword", "Password must be at least 6 characters."); valid = false; } else setError("err-regPassword", "");
    if (password !== confirm) { setError("err-regConfirm", "Passwords do not match."); valid = false; } else setError("err-regConfirm", "");
    if (getUsers().some(u => u.email.toLowerCase() === email)) { setError("err-regEmail", "An account with this email already exists."); valid = false; }

    if (!valid) return;

    const newUser = {
      id: "u_" + Date.now(),
      name, email, phone, password,
      role: "customer",
      addresses: [],
    };
    const users = getUsers();
    users.push(newUser);
    saveUsers(users);
    setSession(newUser);
    showToast("Account created — welcome to ShopKart!");
    setTimeout(() => (window.location.href = "home.html"), 500);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLoginPage();
  initRegisterPage();
});
