// ═══════════════════════════════════════════════════════════
//  VEDA — Shared Firebase Config + API Utility
//  Include this script in every HTML page BEFORE page logic.
//  Replace the firebaseConfig values with your own project.
// ═══════════════════════════════════════════════════════════

// ── 1. FIREBASE CONFIG ────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyDEMO-REPLACE-WITH-YOUR-KEY",
  authDomain:        "veda-hospital.firebaseapp.com",
  projectId:         "veda-hospital",
  storageBucket:     "veda-hospital.appspot.com",
  messagingSenderId: "000000000000",
  appId:             "1:000000000000:web:demo0000000000"
};

// ── 2. FLASK BACKEND BASE URL ─────────────────────────────
//  Change this to your deployed backend URL in production.
const API_BASE = "http://localhost:5000";

// ── 3. ROLE DETECTION ─────────────────────────────────────
function detectRole(email) {
  if (!email) return "pharmacist";
  if (email.endsWith("@admin"))   return "admin";
  if (email.endsWith("@manager")) return "manager";
  return "pharmacist";
}

// Role → dashboard page mapping
const ROLE_PAGES = {
  admin:      "admin.html",
  manager:    "manager.html",
  pharmacist: "pharma.html"
};

// ── 4. FIREBASE INIT ──────────────────────────────────────
let _firebaseApp, _auth, _db;
let CURRENT_USER  = null;
let CURRENT_ROLE  = null;
let CURRENT_TOKEN = null;

function initFirebase() {
  try {
    if (!firebase.apps.length) {
      _firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      _firebaseApp = firebase.app();
    }
    _auth = firebase.auth();
    _db   = firebase.firestore();
    return true;
  } catch (e) {
    console.warn("[Veda] Firebase init failed — demo mode active:", e.message);
    return false;
  }
}

const FIREBASE_OK = initFirebase();

// ── 5. AUTH GUARD ─────────────────────────────────────────
//  Call on every protected page to redirect unauthenticated users.
//  requiredRole: "admin" | "manager" | "pharmacist" | null (any)
function authGuard(requiredRole, onSuccess) {
  if (!FIREBASE_OK) {
    // Demo mode: inject fake user from sessionStorage
    const demo = sessionStorage.getItem("veda_demo_user");
    if (demo) {
      const u = JSON.parse(demo);
      CURRENT_USER  = u;
      CURRENT_ROLE  = u.role;
      CURRENT_TOKEN = "demo-token";
      if (requiredRole && CURRENT_ROLE !== requiredRole) {
        window.location.href = ROLE_PAGES[CURRENT_ROLE] || "signin.html";
        return;
      }
      if (onSuccess) onSuccess(u);
      return;
    }
    window.location.href = "signin.html";
    return;
  }

  _auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "signin.html";
      return;
    }
    const role  = detectRole(user.email);
    const token = await user.getIdToken();

    CURRENT_USER  = { uid: user.uid, email: user.email, displayName: user.displayName };
    CURRENT_ROLE  = role;
    CURRENT_TOKEN = token;

    if (requiredRole && role !== requiredRole) {
      // Redirect to correct dashboard
      window.location.href = ROLE_PAGES[role] || "signin.html";
      return;
    }
    if (onSuccess) onSuccess({ ...CURRENT_USER, role });
  });
}

// ── 6. SIGN OUT ───────────────────────────────────────────
async function signOut() {
  sessionStorage.removeItem("veda_demo_user");
  if (FIREBASE_OK) {
    await _auth.signOut();
  }
  window.location.href = "signin.html";
}

// ── 7. FLASK API HELPER ───────────────────────────────────
//  All API calls go through this — attaches Firebase token automatically.
async function api(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  if (CURRENT_TOKEN) headers["Authorization"] = `Bearer ${CURRENT_TOKEN}`;

  const opts = { method, headers };
  if (body && method !== "GET") opts.body = JSON.stringify(body);

  try {
    const res  = await fetch(API_BASE + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    console.error(`[Veda API] ${method} ${path} →`, err.message);
    // Return demo data so UI doesn't break without backend
    return _demoFallback(path);
  }
}

// Shorthand helpers
const API = {
  get:    (path)        => api("GET",    path),
  post:   (path, body)  => api("POST",   path, body),
  patch:  (path, body)  => api("PATCH",  path, body),
  delete: (path, body)  => api("DELETE", path, body),
};

// ── 8. DEMO DATA FALLBACK ─────────────────────────────────
//  When the Flask backend isn't running, return local demo data.
function _demoFallback(path) {
  const INVENTORY = [
    {id:"1", name:"Paracetamol 500mg",  category:"Analgesic",      batch:"BT-2024-001", qty:450, unitCost:2.5,  expiry:"2024-04-15", row:"A1",shelf:"S1",comp:"C1",supplier:"Cipla",    threshold:50, dailyUsage:15},
    {id:"2", name:"Amoxicillin 250mg",  category:"Antibiotic",     batch:"BT-2024-002", qty:120, unitCost:8.0,  expiry:"2025-06-30", row:"B2",shelf:"S2",comp:"C3",supplier:"Sun Pharma",threshold:30, dailyUsage:8},
    {id:"3", name:"Metformin 500mg",    category:"Diabetic",       batch:"BT-2024-003", qty:22,  unitCost:4.0,  expiry:"2026-01-10", row:"C1",shelf:"S1",comp:"C2",supplier:"Zydus",    threshold:30, dailyUsage:12},
    {id:"4", name:"Atorvastatin 10mg",  category:"Cardiovascular", batch:"BT-2024-004", qty:380, unitCost:6.5,  expiry:"2026-08-20", row:"D3",shelf:"S2",comp:"C1",supplier:"Ranbaxy",  threshold:50, dailyUsage:10},
    {id:"5", name:"Salbutamol Inhaler", category:"Respiratory",    batch:"BT-2024-005", qty:18,  unitCost:85.0, expiry:"2024-05-01", row:"E1",shelf:"S3",comp:"C4",supplier:"GSK",      threshold:20, dailyUsage:5},
    {id:"6", name:"Omeprazole 20mg",    category:"Gastro",         batch:"BT-2024-006", qty:300, unitCost:5.0,  expiry:"2025-12-15", row:"F2",shelf:"S1",comp:"C3",supplier:"Lupin",    threshold:40, dailyUsage:9},
    {id:"7", name:"Cetirizine 10mg",    category:"Antihistamine",  batch:"BT-2024-007", qty:8,   unitCost:3.0,  expiry:"2024-04-10", row:"G1",shelf:"S2",comp:"C2",supplier:"Cipla",    threshold:25, dailyUsage:6},
    {id:"8", name:"Ibuprofen 400mg",    category:"Analgesic",      batch:"BT-2024-008", qty:210, unitCost:3.5,  expiry:"2026-03-30", row:"A2",shelf:"S1",comp:"C4",supplier:"Abbott",   threshold:40, dailyUsage:11},
  ];
  const ORDERS = [
    {id:"ORD-001", medicine:"Paracetamol 500mg", qty:500, supplier:"Cipla",     status:"dispatched", createdAt:"2024-03-10"},
    {id:"ORD-002", medicine:"Amoxicillin 250mg", qty:200, supplier:"Sun Pharma",status:"approved",   createdAt:"2024-03-12"},
    {id:"ORD-003", medicine:"Salbutamol Inhaler",qty:50,  supplier:"GSK",       status:"requested",  createdAt:"2024-03-14"},
  ];

  if (path.includes("/inventory"))        return {status:"ok", data: INVENTORY};
  if (path.includes("/orders"))           return {status:"ok", data: ORDERS};
  if (path.includes("/analytics/summary"))return {status:"ok", data:{totalMedicines:8, totalValue:124500, expiringThisWeek:2, lowStockCount:3, totalAlerts:5}};
  if (path.includes("/intelligence"))     return {status:"ok", data:[]};
  if (path.includes("/dispense"))         return {status:"ok", message:"Dispensed (demo)"};
  return {status:"ok", data:[]};
}

// ── 9. TOAST UTILITY ─────────────────────────────────────
function showToast(msg, type = "info") {
  const colors = { info:"#1a1f2f", success:"#00a572", error:"#93000a", warning:"#7a5200" };
  const el = document.createElement("div");
  el.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    padding:12px 18px; border-radius:10px; font-size:13px; font-weight:700;
    font-family:'Inter',sans-serif; color:#dee1f7; max-width:320px;
    background:${colors[type]||colors.info};
    border:1px solid rgba(255,255,255,0.1);
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    animation:toastIn .25s ease;
  `;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity="0"; el.style.transition="opacity .3s"; setTimeout(()=>el.remove(),300); }, 3500);
}
const style = document.createElement("style");
style.textContent = `@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`;
document.head.appendChild(style);

// ── 10. SIDEBAR NAV HELPER ────────────────────────────────
//  Sets the active nav link and wires sidebar logout button.
function initSidebar(activePage) {
  // Wire all nav links to their pages
  document.querySelectorAll("[data-nav]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const target = el.getAttribute("data-nav");
      window.location.href = target;
    });
    if (el.getAttribute("data-nav") === activePage) {
      el.classList.add("bg-white/10", "text-blue-300");
      el.classList.remove("text-slate-400");
    }
  });

  // Logout button
  document.querySelectorAll("[data-action='logout']").forEach(el => {
    el.addEventListener("click", signOut);
  });

  // Populate user info
  if (CURRENT_USER) {
    document.querySelectorAll("[data-user-name]").forEach(el => {
      el.textContent = CURRENT_USER.displayName || CURRENT_USER.email?.split("@")[0] || "User";
    });
    document.querySelectorAll("[data-user-email]").forEach(el => {
      el.textContent = CURRENT_USER.email || "";
    });
    document.querySelectorAll("[data-user-role]").forEach(el => {
      el.textContent = CURRENT_ROLE?.charAt(0).toUpperCase() + CURRENT_ROLE?.slice(1) || "—";
    });
  }
}

// ── 11. INTELLIGENCE HELPERS ──────────────────────────────
function daysLeft(expiry) {
  return Math.floor((new Date(expiry) - new Date()) / 864e5);
}
function isLowStock(item) {
  return item.qty <= (item.threshold || 30);
}
function stockoutDays(item) {
  const u = item.dailyUsage || 1;
  return Math.round(item.qty / u);
}
function orderRecommendation(item) {
  const u = item.dailyUsage || 10;
  return Math.max(0, Math.round((u * 30) - item.qty + (u * 7)));
}

console.log("[Veda] firebase-config.js loaded — Firebase:", FIREBASE_OK ? "connected" : "demo mode");
