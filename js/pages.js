const THEME_KEY = "belanja-pintar-theme";
const LANGUAGE_KEY = "belanja-pintar-language";
const BUDGET_KEY = "belanja-pintar-budget";
const SAVED_LISTS_KEY = "belanja-pintar-saved-lists";
const CURRENCY_KEY = "belanja-pintar-currency";
const NOTIFICATION_KEY = "belanja-pintar-notifications";
const THEME_MODE_KEY = "belanja-pintar-theme-mode";
const LOW_DATA_KEY = "belanja-pintar-low-data";
const SUPPORTED_CURRENCIES = ["IDR", "USD", "SGD"];
let language = ["id", "en"].includes(localStorage.getItem(LANGUAGE_KEY)) ? localStorage.getItem(LANGUAGE_KEY) : "id";
let theme = localStorage.getItem(THEME_KEY) || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
let currency = SUPPORTED_CURRENCIES.includes(localStorage.getItem(CURRENCY_KEY)) ? localStorage.getItem(CURRENCY_KEY) : "IDR";
let savedSearch = "";
let savedView = "active";
const copy = {
  id: { shopping: "Belanja", savedLists: "Daftar tersimpan", analyticsNav: "Analitik", settings: "Pengaturan", savedEyebrow: "ARSIP BELANJA", savedTitle: "Daftar tersimpan", savedCopy: "Buka kembali daftar belanja yang pernah kamu simpan.", savedEmptyTitle: "Belum ada daftar tersimpan", savedEmptyCopy: "Simpan daftar dari halaman Belanja untuk melihatnya di sini.", goShopping: "Ke halaman belanja", settingsEyebrow: "PREFERENSI", settingsTitle: "Pengaturan", settingsCopy: "Atur tampilan dan batas belanja sesuai kebutuhanmu.", themeSetting: "Tema tampilan", themeSettingCopy: "Gunakan toggle tema di header untuk mengganti tampilan.", budgetSetting: "Batas budget", budgetSettingCopy: "Batas ini dipakai di halaman Belanja.", offlineSetting: "Mode offline", offlineSettingCopy: "Data daftar disimpan di browser ini.", active: "Aktif", open: "Buka", delete: "Hapus", storage: "Data tersimpan di browser ini", theme: "Mode gelap" },
  en: { shopping: "Shopping", savedLists: "Saved lists", analyticsNav: "Analytics", settings: "Settings", savedEyebrow: "SHOPPING ARCHIVE", savedTitle: "Saved lists", savedCopy: "Open a shopping list you saved before.", savedEmptyTitle: "No saved lists yet", savedEmptyCopy: "Save a list from the Shopping page to see it here.", goShopping: "Go shopping", settingsEyebrow: "PREFERENCES", settingsTitle: "Settings", settingsCopy: "Adjust the appearance and spending limit for your list.", themeSetting: "Appearance", themeSettingCopy: "Use the theme toggle in the header to switch appearance.", budgetSetting: "Budget limit", budgetSettingCopy: "This limit is used on the Shopping page.", offlineSetting: "Offline mode", offlineSettingCopy: "Your lists are saved in this browser.", active: "Active", open: "Open", delete: "Delete", storage: "Data saved in this browser", theme: "Dark mode" }
};
copy.id.backupSetting = "Backup data"; copy.id.backupSettingCopy = "Simpan atau pulihkan semua data aplikasi."; copy.id.backup = "Backup"; copy.id.restore = "Import";
copy.en.backupSetting = "Data backup"; copy.en.backupSettingCopy = "Save or restore all app data."; copy.en.backup = "Backup"; copy.en.restore = "Import";
copy.id.historyEyebrow = "RIWAYAT"; copy.id.historyTitle = "Riwayat belanja bulanan";
copy.en.historyEyebrow = "HISTORY"; copy.en.historyTitle = "Monthly shopping history";
copy.id.savedSearch = "Cari daftar..."; copy.en.savedSearch = "Search lists...";
copy.id.savedViewLabel = "Tampilan daftar"; copy.en.savedViewLabel = "List view";
copy.id.rename = "Ubah nama"; copy.en.rename = "Rename"; copy.id.archive = "Arsipkan"; copy.en.archive = "Archive"; copy.id.unarchive = "Keluarkan dari arsip"; copy.en.unarchive = "Unarchive";
copy.id.activeLists = "Aktif"; copy.en.activeLists = "Active";
copy.id.favoriteLists = "Favorit"; copy.en.favoriteLists = "Favorites";
copy.id.archivedLists = "Arsip"; copy.en.archivedLists = "Archived";
copy.id.currencySetting = "Mata uang"; copy.en.currencySetting = "Currency";
copy.id.currencySettingCopy = "Dipakai untuk semua total dan harga."; copy.en.currencySettingCopy = "Used for all totals and prices.";
copy.id.notificationSetting = "Notifikasi budget"; copy.en.notificationSetting = "Budget notifications";
copy.id.notificationSettingCopy = "Beri izin notifikasi saat budget terlewati."; copy.en.notificationSettingCopy = "Allow notifications when budget is exceeded.";
copy.id.installSetting = "Install aplikasi"; copy.en.installSetting = "Install app";
copy.id.installSettingCopy = "Tambahkan Belanja Pintar ke Home Screen."; copy.en.installSettingCopy = "Add Belanja Pintar to your Home Screen.";
copy.id.install = "Install"; copy.en.install = "Install";
copy.id.resetSetting = "Reset data"; copy.en.resetSetting = "Reset data";
copy.id.resetSettingCopy = "Hapus semua daftar dan pengaturan lokal."; copy.en.resetSettingCopy = "Delete all local lists and settings.";
copy.id.reset = "Reset"; copy.en.reset = "Reset";
copy.id.lowDataSetting = "Mode hemat data"; copy.en.lowDataSetting = "Data saver mode";
copy.id.lowDataSettingCopy = "Kurangi pola dan animasi dekoratif."; copy.en.lowDataSettingCopy = "Reduce decorative patterns and animations.";
const t = (key) => copy[language][key];

function applyPagePreferences() {
  document.documentElement.lang = language;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.lowData = localStorage.getItem(LOW_DATA_KEY) === "true" ? "true" : "false";
  document.title = document.body.dataset.page === "saved" ? (language === "id" ? "Daftar Tersimpan" : "Saved Lists") : (language === "id" ? "Pengaturan" : "Settings");
  document.querySelector("#themeToggle").checked = theme === "dark";
  document.querySelector("#themeIcon").textContent = theme === "dark" ? "☾" : "☼";
  document.querySelector("#themeToggle").setAttribute("aria-label", t("theme"));
  document.querySelector(".theme-control").title = t("theme");
  document.querySelector("#languageToggle").textContent = language === "id" ? "EN" : "ID";
  document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); });
  const currency = document.querySelector("#settingsCurrency");
  if (currency) currency.textContent = SUPPORTED_CURRENCIES.includes(localStorage.getItem(CURRENCY_KEY)) ? localStorage.getItem(CURRENCY_KEY) : "IDR";
  const currencySelect = document.querySelector("#currencySelect");
  if (currencySelect) currencySelect.value = localStorage.getItem(CURRENCY_KEY) || "IDR";
  const themeMode = document.querySelector("#themeMode");
  if (themeMode) themeMode.value = localStorage.getItem(THEME_MODE_KEY) || theme;
  const notificationToggle = document.querySelector("#notificationToggle");
  if (notificationToggle) notificationToggle.checked = localStorage.getItem(NOTIFICATION_KEY) === "true";
  const lowDataToggle = document.querySelector("#lowDataToggle");
  if (lowDataToggle) lowDataToggle.checked = localStorage.getItem(LOW_DATA_KEY) === "true";
  const status = document.querySelector("#themeStatus");
  if (status) status.textContent = theme === "dark" ? "Dark" : "Light";
  const budget = document.querySelector("#settingsBudget");
  if (budget) budget.value = Number(localStorage.getItem(BUDGET_KEY)) || "";
  const savedSearchInput = document.querySelector("#savedSearch");
  if (savedSearchInput) { savedSearchInput.placeholder = t("savedSearch"); savedSearchInput.setAttribute("aria-label", t("savedSearch")); }
  const savedViewInput = document.querySelector("#savedView");
  if (savedViewInput) { savedViewInput.options[0].textContent = t("activeLists"); savedViewInput.options[1].textContent = t("favoriteLists"); savedViewInput.options[2].textContent = t("archivedLists"); savedViewInput.setAttribute("aria-label", t("savedViewLabel")); }
  if (document.body.dataset.page === "saved") renderSavedLists();
  if (document.body.dataset.page === "saved") renderMonthlyHistory();
}

function setMenu(open) {
  const menu = document.querySelector("#sideMenu");
  menu.classList.toggle("open", open);
  menu.setAttribute("aria-hidden", String(!open));
  document.querySelector("#menuButton").setAttribute("aria-expanded", String(open));
  document.querySelector("#menuBackdrop").hidden = !open;
}

document.querySelector("#menuButton").addEventListener("click", () => setMenu(!document.querySelector("#sideMenu").classList.contains("open")));
document.querySelector("#closeMenu").addEventListener("click", () => setMenu(false));
document.querySelector("#menuBackdrop").addEventListener("click", () => setMenu(false));
const pageLoader = document.querySelector("#pageLoader");
document.querySelectorAll("a[href]").forEach((link) => link.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank" || link.href.startsWith("#")) return;
  pageLoader.hidden = false;
}));
window.addEventListener("pageshow", () => { pageLoader.hidden = true; });
document.querySelector("#themeToggle").addEventListener("change", (event) => { theme = event.target.checked ? "dark" : "light"; localStorage.setItem(THEME_KEY, theme); applyPagePreferences(); });
document.querySelector("#languageToggle").addEventListener("click", () => { language = language === "id" ? "en" : "id"; localStorage.setItem(LANGUAGE_KEY, language); applyPagePreferences(); });
const budgetInput = document.querySelector("#settingsBudget");
if (budgetInput) budgetInput.addEventListener("change", () => localStorage.setItem(BUDGET_KEY, String(Math.max(0, Number(budgetInput.value) || 0))));
const currencySelect = document.querySelector("#currencySelect");
if (currencySelect) currencySelect.addEventListener("change", () => { localStorage.setItem(CURRENCY_KEY, currencySelect.value); location.reload(); });
const themeMode = document.querySelector("#themeMode");
if (themeMode) themeMode.addEventListener("change", () => { const mode = themeMode.value; localStorage.setItem(THEME_MODE_KEY, mode); localStorage.setItem(THEME_KEY, mode === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : mode); applyPagePreferences(); });
const notificationToggle = document.querySelector("#notificationToggle");
if (notificationToggle) notificationToggle.addEventListener("change", async () => { if (notificationToggle.checked && "Notification" in window && Notification.permission !== "granted") { const permission = await Notification.requestPermission(); notificationToggle.checked = permission === "granted"; } localStorage.setItem(NOTIFICATION_KEY, String(notificationToggle.checked)); });
const lowDataToggle = document.querySelector("#lowDataToggle");
if (lowDataToggle) lowDataToggle.addEventListener("change", () => { localStorage.setItem(LOW_DATA_KEY, String(lowDataToggle.checked)); applyPagePreferences(); });
let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); deferredInstallPrompt = event; });
const installButton = document.querySelector("#installButton");
if (installButton) installButton.addEventListener("click", async () => { if (!deferredInstallPrompt) { alert(language === "id" ? "Gunakan menu browser untuk menambahkan ke Home Screen." : "Use your browser menu to add this app to the Home Screen."); return; } deferredInstallPrompt.prompt(); await deferredInstallPrompt.userChoice; deferredInstallPrompt = null; });
const resetButton = document.querySelector("#resetButton");
if (resetButton) resetButton.addEventListener("click", () => { if (!confirm(language === "id" ? "Hapus semua data aplikasi?" : "Delete all app data?")) return; ["belanja-pintar-items", SAVED_LISTS_KEY, BUDGET_KEY, CURRENCY_KEY, THEME_KEY, THEME_MODE_KEY, LANGUAGE_KEY, NOTIFICATION_KEY, LOW_DATA_KEY].forEach((key) => localStorage.removeItem(key)); location.reload(); });
const backupButton = document.querySelector("#backupButton");
if (backupButton) backupButton.addEventListener("click", backupData);
const restoreButton = document.querySelector("#restoreButton");
if (restoreButton) restoreButton.addEventListener("click", () => document.querySelector("#restoreInput").click());
const restoreInput = document.querySelector("#restoreInput");
if (restoreInput) restoreInput.addEventListener("change", restoreData);
const savedSearchInput = document.querySelector("#savedSearch");
if (savedSearchInput) savedSearchInput.addEventListener("input", () => { savedSearch = savedSearchInput.value.trim().toLowerCase(); renderSavedLists(); });
const savedViewInput = document.querySelector("#savedView");
if (savedViewInput) savedViewInput.addEventListener("change", () => { savedView = savedViewInput.value; renderSavedLists(); });

function loadSavedLists() {
  try { return (JSON.parse(localStorage.getItem(SAVED_LISTS_KEY)) || []).filter((list) => list && typeof list.name === "string" && Array.isArray(list.items)).map((list) => ({ favorite: Boolean(list.favorite), archived: Boolean(list.archived), name: list.name.trim() || "Untitled list", items: list.items.filter((item) => item && typeof item === "object"), budget: Number(list.budget) || 0, savedAt: Number(list.savedAt) || Date.now() })); } catch { return []; }
}
function formatDate(timestamp) { return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric" }).format(timestamp); }
function renderSavedLists() {
  const container = document.querySelector("#savedPageList");
  if (!container) return;
  const lists = loadSavedLists();
  const filtered = lists.map((list, index) => ({ list, index })).filter(({ list }) => (savedView === "favorite" ? list.favorite && !list.archived : savedView === "archived" ? list.archived : !list.archived) && (!savedSearch || list.name.toLowerCase().includes(savedSearch)));
  document.querySelector("#savedPageEmpty").hidden = filtered.length > 0;
  container.innerHTML = filtered.map(({ list, index }) => { const total = list.items.reduce((sum, item) => sum + Number(item.estimatedPrice || 0) * Number(item.quantity || 1) * (1 - Number(item.discount || 0) / 100), 0); return `<article class="saved-page-card"><div><h2>${escapeHtml(list.name)} ${list.favorite ? "★" : "☆"}</h2><p>${list.items.length} ${language === "id" ? "barang" : "items"} · ${formatDate(list.savedAt || Date.now())} · ${formatCurrency(total)}</p></div><div class="saved-card-actions"><a class="tool-button" href="index.html" data-load-index="${index}">${t("open")}</a><button class="tool-button" type="button" data-favorite-index="${index}">${list.favorite ? "☆" : "★"}</button><button class="tool-button" type="button" data-archive-index="${index}">${list.archived ? t("unarchive") : t("archive")}</button><button class="tool-button" type="button" data-rename-index="${index}">${t("rename")}</button><button class="tool-button" type="button" data-copy-index="${index}">${language === "id" ? "Duplikat" : "Duplicate"}</button><button class="tool-button" type="button" data-delete-index="${index}">${t("delete")}</button></div></article>`; }).join("");
  container.querySelectorAll("[data-delete-index]").forEach((button) => button.addEventListener("click", () => { if (!confirm(language === "id" ? "Hapus daftar ini?" : "Delete this list?")) return; const next = loadSavedLists(); next.splice(Number(button.dataset.deleteIndex), 1); localStorage.setItem(SAVED_LISTS_KEY, JSON.stringify(next)); renderSavedLists(); }));
  container.querySelectorAll("[data-favorite-index]").forEach((button) => button.addEventListener("click", () => { const next = loadSavedLists(); const index = Number(button.dataset.favoriteIndex); next[index].favorite = !next[index].favorite; localStorage.setItem(SAVED_LISTS_KEY, JSON.stringify(next)); renderSavedLists(); }));
  container.querySelectorAll("[data-archive-index]").forEach((button) => button.addEventListener("click", () => { const next = loadSavedLists(); const index = Number(button.dataset.archiveIndex); next[index].archived = !next[index].archived; localStorage.setItem(SAVED_LISTS_KEY, JSON.stringify(next)); renderSavedLists(); }));
  container.querySelectorAll("[data-rename-index]").forEach((button) => button.addEventListener("click", () => { const next = loadSavedLists(); const name = prompt(language === "id" ? "Nama baru" : "New name", next[Number(button.dataset.renameIndex)].name); if (name?.trim()) { next[Number(button.dataset.renameIndex)].name = name.trim(); localStorage.setItem(SAVED_LISTS_KEY, JSON.stringify(next)); renderSavedLists(); } }));
  container.querySelectorAll("[data-copy-index]").forEach((button) => button.addEventListener("click", () => { const next = loadSavedLists(); const source = next[Number(button.dataset.copyIndex)]; next.unshift({ ...source, favorite: false, archived: false, name: `${source.name} (${language === "id" ? "salinan" : "copy"})`, items: JSON.parse(JSON.stringify(source.items)), savedAt: Date.now() }); localStorage.setItem(SAVED_LISTS_KEY, JSON.stringify(next)); renderSavedLists(); }));
  container.querySelectorAll("[data-load-index]").forEach((link) => link.addEventListener("click", () => { const list = loadSavedLists()[Number(link.dataset.loadIndex)]; if (list) { localStorage.setItem("belanja-pintar-items", JSON.stringify(list.items)); localStorage.setItem(BUDGET_KEY, String(list.budget || 0)); } }));
}

function formatCurrency(value) { return new Intl.NumberFormat(language === "id" ? "id-ID" : "en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value); }

function renderMonthlyHistory() {
  const target = document.querySelector("#monthlyHistory");
  if (!target) return;
  let items = [];
  try { items = JSON.parse(localStorage.getItem("belanja-pintar-items")) || []; } catch {}
  const totals = {};
  items.flatMap((item) => item.purchaseHistory || []).forEach((entry) => {
    if (!/^\d{4}-\d{2}/.test(entry.date)) return;
    const month = entry.date.slice(0, 7);
    if (!totals[month]) totals[month] = { count: 0, estimated: 0, actual: 0, actualCount: 0 };
    totals[month].count += 1;
    totals[month].estimated += entry.estimated || 0;
    if (entry.actual !== null) { totals[month].actual += entry.actual; totals[month].actualCount += 1; }
  });
  const rows = Object.entries(totals).sort((a, b) => b[0].localeCompare(a[0])).map(([month, value]) => `<tr><td>${month}</td><td>${value.count}</td><td>${formatCurrency(value.estimated)}</td><td>${value.actualCount ? formatCurrency(value.actual) : "-"}</td></tr>`).join("");
  target.innerHTML = rows ? `<table class="history-table"><thead><tr><th>${language === "id" ? "Bulan" : "Month"}</th><th>${language === "id" ? "Barang" : "Items"}</th><th>${language === "id" ? "Estimasi" : "Estimate"}</th><th>${language === "id" ? "Aktual" : "Actual"}</th></tr></thead><tbody>${rows}</tbody></table>` : `<p class="summary-detail">${language === "id" ? "Belum ada riwayat pembelian." : "No purchase history yet."}</p>`;
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character])); }

function backupData() {
  const data = { items: JSON.parse(localStorage.getItem("belanja-pintar-items") || "[]"), savedLists: loadSavedLists(), budget: Number(localStorage.getItem(BUDGET_KEY)) || 0, language, theme, currency: localStorage.getItem(CURRENCY_KEY) || "IDR" };
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  link.download = "belanja-pintar-backup.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function restoreData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { try { const data = JSON.parse(reader.result); if (!Array.isArray(data.items) || !Array.isArray(data.savedLists)) throw new Error("Invalid backup structure"); localStorage.setItem("belanja-pintar-items", JSON.stringify(data.items)); localStorage.setItem(SAVED_LISTS_KEY, JSON.stringify(data.savedLists)); localStorage.setItem(BUDGET_KEY, String(Number(data.budget) || 0)); if (["id", "en"].includes(data.language)) localStorage.setItem(LANGUAGE_KEY, data.language); if (["light", "dark"].includes(data.theme)) localStorage.setItem(THEME_KEY, data.theme); if (SUPPORTED_CURRENCIES.includes(data.currency)) localStorage.setItem(CURRENCY_KEY, data.currency); location.reload(); } catch { alert(language === "id" ? "File backup tidak valid." : "Invalid backup file."); } };
  reader.readAsText(file);
}

applyPagePreferences();
document.documentElement.classList.add("app-ready");
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) navigator.serviceWorker.register("sw.js").catch(() => {});
