const ITEMS_KEY = "belanja-pintar-items";
const LANGUAGE_KEY = "belanja-pintar-language";
const THEME_KEY = "belanja-pintar-theme";
const CURRENCY_KEY = "belanja-pintar-currency";
const LOW_DATA_KEY = "belanja-pintar-low-data";
const SUPPORTED_CURRENCIES = ["IDR", "USD", "SGD"];
const CURRENCY_RATES = { IDR: 1, USD: 1 / 16000, SGD: 1 / 12500 };
let language = ["id", "en"].includes(localStorage.getItem(LANGUAGE_KEY)) ? localStorage.getItem(LANGUAGE_KEY) : "id";
let theme = localStorage.getItem(THEME_KEY) || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
let currency = SUPPORTED_CURRENCIES.includes(localStorage.getItem(CURRENCY_KEY)) ? localStorage.getItem(CURRENCY_KEY) : "IDR";
const copy = {
  id: { shopping: "Belanja", savedLists: "Daftar tersimpan", analyticsNav: "Analitik", settings: "Pengaturan", analyticsEyebrow: "RINGKASAN BELANJA", analyticsTitle: "Analitik", analyticsCopy: "Lihat pola pengeluaran, kategori terbesar, dan perubahan harga.", categoryBudget: "BUDGET PER KATEGORI", categoryTitle: "Kategori", priceHistoryTitle: "RIWAYAT HARGA", priceHistoryHeading: "Perubahan harga", monthlyHistoryEyebrow: "RIWAYAT BULANAN", monthlyHistoryTitle: "Belanja per bulan", storage: "Data tersimpan di browser ini", theme: "Mode gelap", empty: "Belum ada data analitik.", noPriceHistory: "Belum ada perubahan harga." },
  en: { shopping: "Shopping", savedLists: "Saved lists", analyticsNav: "Analytics", settings: "Settings", analyticsEyebrow: "SHOPPING SUMMARY", analyticsTitle: "Analytics", analyticsCopy: "See spending patterns, top categories, and price changes.", categoryBudget: "BUDGET BY CATEGORY", categoryTitle: "Categories", priceHistoryTitle: "PRICE HISTORY", priceHistoryHeading: "Price changes", monthlyHistoryEyebrow: "MONTHLY HISTORY", monthlyHistoryTitle: "Shopping by month", storage: "Data saved in this browser", theme: "Dark mode", empty: "No analytics data yet.", noPriceHistory: "No price changes yet." }
};
const t = (key) => copy[language][key];
function readItems() { try { return JSON.parse(localStorage.getItem(ITEMS_KEY)) || []; } catch { return []; } }
function formatCurrency(value) { return new Intl.NumberFormat(language === "id" ? "id-ID" : "en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value * CURRENCY_RATES[currency]); }
function discountedPrice(price, discount = 0) { return Number(price || 0) * (1 - Math.min(100, Math.max(0, Number(discount) || 0)) / 100); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character])); }
function applyPreferences() {
  document.documentElement.lang = language;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.lowData = localStorage.getItem(LOW_DATA_KEY) === "true" ? "true" : "false";
  document.title = language === "id" ? "Analitik Belanja" : "Shopping Analytics";
  document.querySelector("#themeToggle").checked = theme === "dark";
  document.querySelector("#themeIcon").textContent = theme === "dark" ? "Moon" : "Sun";
  document.querySelector("#themeToggle").setAttribute("aria-label", t("theme"));
  document.querySelector(".theme-control").title = t("theme");
  document.querySelector("#languageToggle").textContent = language === "id" ? "EN" : "ID";
  document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); });
  renderAnalytics();
}
function setMenu(open) {
  const menu = document.querySelector("#sideMenu");
  menu.classList.toggle("open", open);
  menu.setAttribute("aria-hidden", String(!open));
  document.querySelector("#menuButton").setAttribute("aria-expanded", String(open));
  document.querySelector("#menuBackdrop").hidden = !open;
}
function renderAnalytics() {
  const items = readItems().filter((item) => item && typeof item === "object");
  let categoryBudgets = {};
  try { categoryBudgets = JSON.parse(localStorage.getItem("belanja-pintar-category-budgets")) || {}; } catch {}
  const categoryTotals = {};
  items.forEach((item) => { const category = item.category || "other"; categoryTotals[category] = (categoryTotals[category] || 0) + discountedPrice(item.estimatedPrice, item.discount) * Number(item.quantity || 1); });
  const maxTotal = Math.max(...Object.values(categoryTotals), 0);
  const categoryNames = copy[language].categories || { food: language === "id" ? "Makanan" : "Food", household: language === "id" ? "Rumah" : "Household", health: language === "id" ? "Kesehatan" : "Health", other: language === "id" ? "Lainnya" : "Other" };
  document.querySelector("#categoryChart").innerHTML = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([category, total]) => { const categoryBudget = Number(categoryBudgets[category]) || 0; const percent = categoryBudget ? Math.round(total / categoryBudget * 100) : 0; return `<div class="category-bar"><div class="category-bar-label"><span>${escapeHtml(categoryNames[category] || category)}${categoryBudget ? ` <small>${percent}%</small>` : ""}</span><strong>${formatCurrency(total)}${categoryBudget ? ` / ${formatCurrency(categoryBudget)}` : ""}</strong></div><div class="category-bar-track"><span style="width:${categoryBudget ? Math.min(percent, 100) : (maxTotal ? Math.round(total / maxTotal * 100) : 0)}%;background:${categoryBudget && percent > 100 ? "var(--coral)" : "var(--sage)"}"></span></div></div>`; }).join("") || `<p class="summary-detail">${t("empty")}</p>`;
  const history = items.flatMap((item) => (Array.isArray(item.priceHistory) ? item.priceHistory : []).filter((entry) => entry && Number.isFinite(Number(entry.price))).map((entry) => ({ ...entry, name: typeof item.name === "string" ? item.name : "Item" }))).sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 12);
  const maxPrice = Math.max(...history.map((entry) => Number(entry.price)), 0);
  document.querySelector("#priceHistoryList").innerHTML = history.map((entry) => `<div class="price-history-row"><span><strong>${escapeHtml(entry.name)}</strong><small>${new Date(entry.date).toLocaleDateString(language === "id" ? "id-ID" : "en-US")}</small></span><div class="price-history-value"><strong>${formatCurrency(entry.price)}</strong><span class="price-history-bar"><i style="width:${maxPrice ? Math.round(Number(entry.price) / maxPrice * 100) : 0}%"></i></span></div></div>`).join("") || `<p class="summary-detail">${t("noPriceHistory")}</p>`;
  const totals = {};
  items.flatMap((item) => Array.isArray(item.purchaseHistory) ? item.purchaseHistory : []).forEach((entry) => { const date = String(entry.date || ""); if (!/^\d{4}-\d{2}/.test(date)) return; const month = date.slice(0, 7); totals[month] = (totals[month] || 0) + Number(entry.actual ?? entry.estimated ?? 0); });
  const rows = Object.entries(totals).sort((a, b) => b[0].localeCompare(a[0])).map(([month, total]) => `<tr><td>${month}</td><td>${formatCurrency(total)}</td></tr>`).join("");
  document.querySelector("#monthlyHistory").innerHTML = rows ? `<table class="history-table"><thead><tr><th>${language === "id" ? "Bulan" : "Month"}</th><th>${language === "id" ? "Total" : "Total"}</th></tr></thead><tbody>${rows}</tbody></table>` : `<p class="summary-detail">${t("empty")}</p>`;
}
document.querySelector("#menuButton").addEventListener("click", () => setMenu(!document.querySelector("#sideMenu").classList.contains("open")));
document.querySelector("#closeMenu").addEventListener("click", () => setMenu(false));
document.querySelector("#menuBackdrop").addEventListener("click", () => setMenu(false));
document.querySelectorAll(".nav-link").forEach((link) => link.addEventListener("click", () => { setMenu(false); }));
document.querySelectorAll("a[href]").forEach((link) => link.addEventListener("click", (event) => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && link.target !== "_blank" && !link.href.startsWith("#")) document.querySelector("#pageLoader").hidden = false; }));
window.addEventListener("pageshow", () => { document.querySelector("#pageLoader").hidden = true; });
document.querySelector("#themeToggle").addEventListener("change", (event) => { theme = event.target.checked ? "dark" : "light"; localStorage.setItem(THEME_KEY, theme); applyPreferences(); });
document.querySelector("#languageToggle").addEventListener("click", () => { language = language === "id" ? "en" : "id"; localStorage.setItem(LANGUAGE_KEY, language); applyPreferences(); });
applyPreferences();
document.documentElement.classList.add("app-ready");
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) navigator.serviceWorker.register("sw.js").catch(() => {});
