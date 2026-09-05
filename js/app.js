const STORAGE_KEY = "belanja-pintar-items";
const BUDGET_KEY = "belanja-pintar-budget";
const SAVED_LISTS_KEY = "belanja-pintar-saved-lists";
const THEME_KEY = "belanja-pintar-theme";
const LANGUAGE_KEY = "belanja-pintar-language";
const CURRENCY_KEY = "belanja-pintar-currency";
const NOTIFICATION_KEY = "belanja-pintar-notifications";
const BUDGET_ALERT_KEY = "belanja-pintar-budget-alert";
const LOW_DATA_KEY = "belanja-pintar-low-data";
const TEMPLATES_KEY = "belanja-pintar-templates";
const SUPPORTED_CURRENCIES = ["IDR", "USD", "SGD"];
const CURRENCY_RATES = { IDR: 1, USD: 1 / 16000, SGD: 1 / 12500 };
let items = loadItems();
let activeFilter = "all";
let language = ["id", "en"].includes(localStorage.getItem(LANGUAGE_KEY)) ? localStorage.getItem(LANGUAGE_KEY) : "id";
let theme = localStorage.getItem(THEME_KEY) || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
let currency = SUPPORTED_CURRENCIES.includes(localStorage.getItem(CURRENCY_KEY)) ? localStorage.getItem(CURRENCY_KEY) : "IDR";
let budget = Number(localStorage.getItem(BUDGET_KEY)) || 0;
let sortMode = "added";
let selectedStore = "all";
let selectedCategory = "all";
let searchQuery = "";
let savedLists = loadSavedLists();
let undoSnapshot = null;

const elements = {
  form: document.querySelector("#itemForm"),
  name: document.querySelector("#itemName"),
  estimatedPrice: document.querySelector("#estimatedPrice"),
  quantity: document.querySelector("#itemQuantity"),
  unit: document.querySelector("#itemUnit"),
  discount: document.querySelector("#itemDiscount"),
  notes: document.querySelector("#itemNotes"),
  list: document.querySelector("#shoppingList"),
  empty: document.querySelector("#emptyState"),
  estimatedTotal: document.querySelector("#estimatedTotal"),
  actualTotal: document.querySelector("#actualTotal"),
  differenceTotal: document.querySelector("#differenceTotal"),
  estimatedDetail: document.querySelector("#estimatedDetail"),
  actualDetail: document.querySelector("#actualDetail"),
  differenceDetail: document.querySelector("#differenceDetail"),
  progressText: document.querySelector("#progressText"),
  progressPercent: document.querySelector("#progressPercent"),
  progressBar: document.querySelector("#progressBar"),
  allCount: document.querySelector("#allCount"),
  pendingCount: document.querySelector("#pendingCount"),
  doneCount: document.querySelector("#doneCount"),
  themeToggle: document.querySelector("#themeToggle"),
  themeIcon: document.querySelector("#themeIcon"),
  languageToggle: document.querySelector("#languageToggle"),
  category: document.querySelector("#itemCategory"),
  budget: document.querySelector("#budgetInput"),
  budgetStatus: document.querySelector("#budgetStatus"),
  budgetBar: document.querySelector("#budgetBar"),
  store: document.querySelector("#storeInput"),
  listName: document.querySelector("#listName"),
  savedLists: document.querySelector("#savedLists"),
  sort: document.querySelector("#sortSelect"),
  storeFilter: document.querySelector("#storeFilter"),
  categoryFilter: document.querySelector("#categoryFilter"),
  quickAdd: document.querySelector("#quickAddSelect"),
  saveTemplate: document.querySelector("#saveTemplateButton"),
  template: document.querySelector("#templateSelect"),
  undo: document.querySelector("#undoButton"),
  stats: document.querySelector("#statsStrip"),
  search: document.querySelector("#searchInput"),
  scanButton: document.querySelector("#scanButton"),
  scannerModal: document.querySelector("#scannerModal"),
  scannerVideo: document.querySelector("#scannerVideo"),
  scannerMessage: document.querySelector("#scannerMessage"),
  manualBarcode: document.querySelector("#manualBarcode"),
  scannerStream: null,
  scannerTimer: null,
  menuButton: document.querySelector("#menuButton"),
  sideMenu: document.querySelector("#sideMenu"),
  menuBackdrop: document.querySelector("#menuBackdrop"),
};

const translations = {
  id: {
    savedAuto: "Tersimpan otomatis", introEyebrow: "CATATAN BELANJA", introTitle: "Belanja lebih tenang,<br><em>dompet tetap aman.</em>", introCopy: "Rencanakan kebutuhanmu, bandingkan perkiraan dengan harga asli, dan lihat totalnya secara real-time.",
    summary: "Ringkasan belanja", estimate: "Estimasi total", actual: "Total harga asli", difference: "Selisih", planned: "barang direncanakan", actualFilled: "harga sudah diisi", noActual: "Belum ada harga aktual", vsEstimate: "vs estimasi", more: "lebih mahal dari estimasi", less: "lebih hemat dari estimasi", listEyebrow: "DAFTAR KEBUTUHAN", listTitle: "Yang perlu dibeli", name: "Nama barang", namePlaceholder: "Contoh: Telur ayam", store: "Toko", storePlaceholder: "Contoh: Supermarket", estimatedPrice: "Estimasi harga", quantity: "Jumlah", unitLabel: "Satuan", discount: "Diskon %", notes: "Catatan", quickAdd: "Tambah cepat", allCategories: "Semua kategori", category: "Kategori", categories: { food: "Makanan", household: "Rumah", health: "Kesehatan", other: "Lainnya" }, add: "Tambah", filter: "Filter daftar barang", all: "Semua", pending: "Belum dibeli", done: "Selesai", clearDone: "Hapus yang selesai", item: "Barang", estimateColumn: "Estimasi", actualColumn: "Harga asli", emptyTitle: "Daftar masih kosong", emptyCopy: "Tambahkan barang pertama yang ingin kamu beli.", storage: "Data tersimpan di browser ini", unit: "buah", actualPlaceholder: "Isi harga asli", markDone: "Tandai %s selesai", delete: "Hapus %s", edit: "Edit %s", theme: "Mode gelap", budget: "Batas budget", noBudget: "Belum ada budget", budgetUsed: "%s dari %s terpakai", overBudget: "Melewati budget %s", listName: "Nama daftar", listPlaceholder: "Belanja minggu ini", saveList: "Simpan daftar", latest: "Terbaru", share: "Bagikan", export: "Export", saved: "Daftar tersimpan", history: "Riwayat", copied: "Daftar berhasil disalin", scan: "Scan barcode", scannerNote: "Gunakan kamera untuk membaca barcode barang.", scannerMessage: "Arahkan barcode ke dalam kamera.", manualBarcode: "Atau masukkan kode manual", useBarcode: "Gunakan kode", unsupported: "Browser ini belum mendukung scan kamera. Gunakan kode manual.", secure: "Scan kamera membutuhkan HTTPS atau localhost."
  },
  en: {
    savedAuto: "Saved automatically", introEyebrow: "SHOPPING NOTES", introTitle: "Shop with ease,<br><em>stay on budget.</em>", introCopy: "Plan what you need, compare estimates with actual prices, and see your total in real time.",
    summary: "Shopping summary", estimate: "Estimated total", actual: "Actual total", difference: "Difference", planned: "items planned", actualFilled: "prices added", noActual: "No actual prices yet", vsEstimate: "vs estimate", more: "over estimate", less: "under estimate", listEyebrow: "SHOPPING LIST", listTitle: "Things to buy", name: "Item name", namePlaceholder: "Example: Eggs", store: "Store", storePlaceholder: "Example: Supermarket", estimatedPrice: "Estimated price", quantity: "Quantity", unitLabel: "Unit", discount: "Discount %", notes: "Notes", quickAdd: "Quick add", allCategories: "All categories", category: "Category", categories: { food: "Food", household: "Household", health: "Health", other: "Other" }, add: "Add", filter: "Shopping list filter", all: "All", pending: "To buy", done: "Done", clearDone: "Clear completed", item: "Item", estimateColumn: "Estimate", actualColumn: "Actual price", emptyTitle: "Your list is empty", emptyCopy: "Add the first thing you want to buy.", storage: "Data saved in this browser", unit: "item(s)", actualPlaceholder: "Enter actual price", markDone: "Mark %s done", delete: "Delete %s", edit: "Edit %s", theme: "Dark mode", budget: "Budget limit", noBudget: "No budget set", budgetUsed: "%s of %s used", overBudget: "%s over budget", listName: "List name", listPlaceholder: "This week's shopping", saveList: "Save list", latest: "Latest", share: "Share", export: "Export", saved: "Saved lists", history: "History", copied: "List copied", scan: "Scan barcode", scannerNote: "Use your camera to scan a product barcode.", scannerMessage: "Point the barcode at the camera.", manualBarcode: "Or enter the code manually", useBarcode: "Use code", unsupported: "Camera scanning is not supported here. Use the manual code.", secure: "Camera scanning requires HTTPS or localhost."
  }
};

function t(key) { return translations[language][key]; }

function applyPreferences() {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.lowData = localStorage.getItem(LOW_DATA_KEY) === "true" ? "true" : "false";
  document.documentElement.lang = language;
  elements.themeToggle.checked = theme === "dark";
  elements.themeToggle.setAttribute("aria-label", t("theme"));
  document.querySelector(".theme-control").title = t("theme");
  elements.themeIcon.textContent = theme === "dark" ? "☾" : "☼";
  elements.languageToggle.textContent = language === "id" ? "EN" : "ID";
  elements.languageToggle.setAttribute("aria-label", language === "id" ? "Switch to English" : "Beralih ke Bahasa Indonesia");
  document.querySelector("#currencyPrefix").textContent = currency === "IDR" ? "Rp" : currency;
  document.title = language === "id" ? "Belanja Pintar" : "Smart Shopping";
  document.querySelector("#savedLabel").textContent = translations[language].savedAuto;
  document.querySelector("#introEyebrow").textContent = t("introEyebrow");
  document.querySelector("#introTitle").innerHTML = t("introTitle");
  document.querySelector("#introCopy").textContent = t("introCopy");
  document.querySelector("#summarySection").setAttribute("aria-label", t("summary"));
  document.querySelector("#estimateLabel").textContent = t("estimate");
  document.querySelector("#actualLabel").textContent = t("actual");
  document.querySelector("#differenceLabel").textContent = t("difference");
  document.querySelector("#listEyebrow").textContent = t("listEyebrow");
  document.querySelector("#listTitle").textContent = t("listTitle");
  document.querySelector("#nameLabel").textContent = t("name");
  elements.name.placeholder = t("namePlaceholder");
  document.querySelector("#storeLabel").textContent = t("store");
  elements.store.placeholder = t("storePlaceholder");
  document.querySelector("#estimatedPriceLabel").textContent = t("estimatedPrice");
  document.querySelector("#quantityLabel").textContent = t("quantity");
  document.querySelector("#unitLabel").textContent = t("unitLabel");
  document.querySelector("#discountLabel").textContent = t("discount");
  document.querySelector("#notesLabel").textContent = t("notes");
  document.querySelector("#categoryLabel").textContent = t("category");
  [...elements.category.options].forEach((option) => { option.textContent = t("categories")[option.value]; });
  document.querySelector("#budgetLabel").textContent = t("budget");
  document.querySelector("#budgetCurrencyPrefix").textContent = currency === "IDR" ? "Rp" : currency;
  elements.budget.value = budget ? Math.round(budget * CURRENCY_RATES[currency]) : "";
  document.querySelector("#addButton").lastChild.textContent = ` ${t("add")}`;
  document.querySelector("#filterTabs").setAttribute("aria-label", t("filter"));
  document.querySelector("#allLabel").textContent = t("all");
  document.querySelector("#pendingLabel").textContent = t("pending");
  document.querySelector("#doneLabel").textContent = t("done");
  document.querySelector("#clearDone").textContent = t("clearDone");
  document.querySelector("#itemColumnLabel").textContent = t("item");
  document.querySelector("#estimateColumnLabel").textContent = t("estimateColumn");
  document.querySelector("#actualColumnLabel").textContent = t("actualColumn");
  document.querySelector("#emptyTitle").textContent = t("emptyTitle");
  document.querySelector("#emptyCopy").textContent = t("emptyCopy");
  document.querySelector("#storageLabel").textContent = t("storage");
  document.querySelector("#navShopping").textContent = language === "id" ? "Belanja" : "Shopping";
  document.querySelector("#navSaved").textContent = language === "id" ? "Daftar tersimpan" : "Saved lists";
  document.querySelector("#navAnalytics").textContent = language === "id" ? "Analitik" : "Analytics";
  document.querySelector("#navSettings").textContent = language === "id" ? "Pengaturan" : "Settings";
  document.querySelector("#navHint").textContent = language === "id" ? "Data tersimpan otomatis di browser ini." : "Data is saved automatically in this browser.";
  document.querySelector("#savedListLabel").textContent = t("listName");
  elements.search.placeholder = language === "id" ? "Cari barang..." : "Search items...";
  elements.search.setAttribute("aria-label", language === "id" ? "Cari barang" : "Search items");
  elements.quickAdd.options[0].textContent = t("quickAdd");
  elements.categoryFilter.options[0].textContent = t("allCategories");
  elements.listName.placeholder = t("listPlaceholder");
  document.querySelector("#saveListButton").textContent = t("saveList");
  document.querySelector("#shareButton").textContent = t("share");
  document.querySelector("#exportButton").textContent = t("export");
  document.querySelector("#exportCsvButton").textContent = "CSV";
  document.querySelector("#exportPdfButton").textContent = "PDF";
  elements.template.options[0].textContent = language === "id" ? "Template belanja" : "Shopping templates";
  elements.undo.textContent = language === "id" ? "Urungkan" : "Undo";
  document.querySelector("#scanLabel").textContent = t("scan");
  document.querySelector("#scannerNote").textContent = t("scannerNote");
  document.querySelector("#scannerTitle").textContent = t("scan");
  document.querySelector("#scannerMessage").textContent = t("scannerMessage");
  document.querySelector("#manualBarcodeLabel").textContent = t("manualBarcode");
  document.querySelector("#useBarcode").textContent = t("useBarcode");
  elements.sort.options[0].textContent = t("latest");
  elements.sort.options[1].textContent = t("name");
  elements.sort.options[2].textContent = t("estimate");
  elements.sort.options[3].textContent = t("category");
  renderSavedLists();
  updateDate();
}

function updateDate() {
  document.querySelector("#todayLabel").textContent = new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  }).format(new Date());
}

elements.themeToggle.addEventListener("change", () => {
  theme = elements.themeToggle.checked ? "dark" : "light";
  localStorage.setItem(THEME_KEY, theme);
  applyPreferences();
});

elements.languageToggle.addEventListener("click", () => {
  language = language === "id" ? "en" : "id";
  localStorage.setItem(LANGUAGE_KEY, language);
  applyPreferences();
  render();
});

elements.sort.addEventListener("change", () => { sortMode = elements.sort.value; render(); });
elements.storeFilter.addEventListener("change", () => { selectedStore = elements.storeFilter.value; render(); });
elements.categoryFilter.addEventListener("change", () => { selectedCategory = elements.categoryFilter.value; render(); });
elements.search.addEventListener("input", () => { searchQuery = elements.search.value.trim().toLowerCase(); render(); });
elements.quickAdd.addEventListener("change", () => {
  const selected = items.find((item) => item.name === elements.quickAdd.value);
  if (!selected) return;
  elements.name.value = selected.name;
  elements.store.value = selected.store || "";
  elements.estimatedPrice.value = selected.estimatedPrice;
  elements.quantity.value = selected.quantity;
  elements.unit.value = selected.unit || "pcs";
  elements.category.value = selected.category || "other";
  elements.quickAdd.value = "";
  elements.name.focus();
});
elements.template.addEventListener("change", () => {
  const templates = loadTemplates();
  const selected = templates.find((template) => template.name === elements.template.value);
  if (!selected) return;
  items = JSON.parse(JSON.stringify(selected.items)).map(normalizeItem);
  saveAndRender();
  elements.template.value = "";
});
elements.saveTemplate.addEventListener("click", () => {
  if (!items.length) return;
  const name = prompt(language === "id" ? "Nama template" : "Template name", language === "id" ? "Belanja rutin" : "Regular shopping");
  if (!name?.trim()) return;
  const templates = loadTemplates().filter((template) => template.name !== name.trim());
  templates.unshift({ name: name.trim(), items: JSON.parse(JSON.stringify(items)), savedAt: Date.now() });
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates.slice(0, 20)));
  updateTemplates();
});

document.querySelector("#saveListButton").addEventListener("click", () => {
  const name = elements.listName.value.trim() || (language === "id" ? `Daftar ${savedLists.length + 1}` : `List ${savedLists.length + 1}`);
  savedLists.unshift({ name, items: JSON.parse(JSON.stringify(items)), budget, favorite: false, archived: false, savedAt: Date.now() });
  localStorage.setItem(SAVED_LISTS_KEY, JSON.stringify(savedLists));
  elements.listName.value = "";
  renderSavedLists();
});

document.querySelector("#shareButton").addEventListener("click", shareList);
document.querySelector("#exportButton").addEventListener("click", exportList);
document.querySelector("#exportCsvButton").addEventListener("click", exportCsv);
document.querySelector("#exportPdfButton").addEventListener("click", exportPdf);
elements.scanButton.addEventListener("click", openScanner);
document.querySelector("#closeScanner").addEventListener("click", closeScanner);
document.querySelector("#useBarcode").addEventListener("click", () => useBarcode(elements.manualBarcode.value));

function setMenu(open) {
  elements.sideMenu.classList.toggle("open", open);
  elements.sideMenu.setAttribute("aria-hidden", String(!open));
  elements.menuButton.setAttribute("aria-expanded", String(open));
  elements.menuBackdrop.hidden = !open;
}

elements.menuButton.addEventListener("click", () => setMenu(!elements.sideMenu.classList.contains("open")));
document.querySelector("#closeMenu").addEventListener("click", () => setMenu(false));
elements.menuBackdrop.addEventListener("click", () => setMenu(false));
document.querySelectorAll(".nav-link").forEach((link) => link.addEventListener("click", () => {
  document.querySelectorAll(".nav-link").forEach((item) => item.classList.toggle("active", item === link));
  setMenu(false);
}));

const pageLoader = document.querySelector("#pageLoader");
document.querySelectorAll("a[href]").forEach((link) => link.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank" || link.href.startsWith("#")) return;
  pageLoader.hidden = false;
}));
window.addEventListener("pageshow", () => { pageLoader.hidden = true; });

elements.budget.addEventListener("change", () => {
  budget = Math.max(0, Number(elements.budget.value) || 0) / CURRENCY_RATES[currency];
  localStorage.setItem(BUDGET_KEY, String(budget));
  updateSummary();
});

elements.undo.addEventListener("click", () => {
  if (!undoSnapshot) return;
  items = undoSnapshot;
  undoSnapshot = null;
  elements.undo.hidden = true;
  saveAndRender();
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = elements.name.value.trim();
  const estimatedPrice = Number(elements.estimatedPrice.value) / CURRENCY_RATES[currency];
  const quantity = elements.quantity.value === "" ? 1 : Number(elements.quantity.value);
  if (!name || estimatedPrice < 0 || quantity < 1) return;

  items.unshift({
    id: crypto.randomUUID(),
    name,
    store: elements.store.value.trim(),
    estimatedPrice,
    quantity,
    unit: elements.unit.value,
    discount: Math.min(100, Math.max(0, Number(elements.discount.value) || 0)),
    notes: elements.notes.value.trim(),
    category: elements.category.value,
    actualPrice: null,
    completed: false,
  });
  saveAndRender();
  elements.form.reset();
  elements.quantity.value = "";
  elements.name.focus();
});

document.querySelectorAll(".filter-tab").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
    render();
  });
});

document.querySelector("#clearDone").addEventListener("click", () => {
  undoSnapshot = JSON.parse(JSON.stringify(items));
  items = items.filter((item) => !item.completed);
  elements.undo.hidden = false;
  saveAndRender();
});

elements.list.addEventListener("click", (event) => {
  const row = event.target.closest(".item-row");
  if (!row) return;
  const item = items.find((entry) => entry.id === row.dataset.id);
  if (!item) return;
  if (event.target.closest(".check-button")) {
    item.completed = !item.completed;
    if (item.completed) {
      item.purchaseHistory = item.purchaseHistory || [];
      item.purchaseHistory.unshift({ date: new Date().toISOString(), estimated: discountedPrice(item.estimatedPrice, item.discount) * item.quantity, actual: item.actualPrice === null ? null : item.actualPrice * item.quantity });
    }
  }
  if (event.target.closest(".edit-button")) editItem(item);
  if (event.target.closest(".delete-button") && confirm(language === "id" ? `Hapus ${item.name}?` : `Delete ${item.name}?`)) { undoSnapshot = JSON.parse(JSON.stringify(items)); items = items.filter((entry) => entry.id !== item.id); elements.undo.hidden = false; }
  saveAndRender();
});

elements.list.addEventListener("change", (event) => {
  if (!event.target.matches(".actual-input")) return;
  const item = items.find((entry) => entry.id === event.target.closest(".item-row").dataset.id);
  if (!item) return;
  const nextPrice = event.target.value === "" ? null : Math.max(0, Number(event.target.value)) / CURRENCY_RATES[currency];
  if (nextPrice !== null && nextPrice !== item.actualPrice) {
    item.priceHistory = item.priceHistory || [];
    item.priceHistory.unshift({ price: nextPrice, date: new Date().toISOString() });
    item.priceHistory = item.priceHistory.slice(0, 10);
  }
  item.actualPrice = nextPrice;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  updateSummary();
});

function loadItems() {
  try { return (JSON.parse(localStorage.getItem(STORAGE_KEY)) || []).map(normalizeItem).filter(Boolean); }
  catch { return []; }
}

function loadSavedLists() {
  try { return (JSON.parse(localStorage.getItem(SAVED_LISTS_KEY)) || []).map((list) => ({ name: typeof list?.name === "string" && list.name.trim() ? list.name.trim() : "Untitled list", items: Array.isArray(list?.items) ? list.items.map(normalizeItem).filter(Boolean) : [], budget: Number.isFinite(Number(list?.budget)) ? Math.max(0, Number(list.budget)) : 0, favorite: Boolean(list?.favorite), archived: Boolean(list?.archived), savedAt: Number(list?.savedAt) || Date.now() })); }
  catch { return []; }
}

function loadTemplates() {
  try { return (JSON.parse(localStorage.getItem(TEMPLATES_KEY)) || []).filter((template) => typeof template?.name === "string" && Array.isArray(template.items)); } catch { return []; }
}

function normalizeItem(item) {
  if (!item || typeof item !== "object") return null;
  const allowedCategories = ["food", "household", "health", "other"];
  const allowedUnits = ["pcs", "kg", "liter", "box"];
  const id = typeof item.id === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(item.id) ? item.id : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const quantity = Number(item.quantity);
  const estimatedPrice = Number(item.estimatedPrice);
  const actualPrice = item.actualPrice === null || item.actualPrice === undefined || item.actualPrice === "" ? null : Number(item.actualPrice);
  return { id, name: typeof item.name === "string" && item.name.trim() ? item.name.trim() : "Item", store: typeof item.store === "string" ? item.store : "", estimatedPrice: Number.isFinite(estimatedPrice) && estimatedPrice >= 0 ? estimatedPrice : 0, quantity: Number.isFinite(quantity) && quantity >= 1 ? quantity : 1, unit: allowedUnits.includes(item.unit) ? item.unit : "pcs", discount: Math.min(100, Math.max(0, Number(item.discount) || 0)), notes: typeof item.notes === "string" ? item.notes : "", category: allowedCategories.includes(item.category) ? item.category : "other", actualPrice: Number.isFinite(actualPrice) && actualPrice >= 0 ? actualPrice : null, completed: Boolean(item.completed), priceHistory: Array.isArray(item.priceHistory) ? item.priceHistory.filter((entry) => Number.isFinite(Number(entry?.price))).slice(0, 10) : [], purchaseHistory: Array.isArray(item.purchaseHistory) ? item.purchaseHistory.filter((entry) => typeof entry?.date === "string").slice(0, 50) : [] };
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  render();
}

function formatCurrency(value) {
  return new Intl.NumberFormat(language === "id" ? "id-ID" : "en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value * CURRENCY_RATES[currency]);
}

function discountedPrice(price, discount = 0) {
  return Number(price) * (1 - Math.min(100, Math.max(0, Number(discount) || 0)) / 100);
}

function render() {
  updateStoreFilter();
  updateCategoryFilter();
  updateQuickAdd();
  updateTemplates();
  const visibleItems = items.filter((item) => (activeFilter === "all" || (activeFilter === "done" ? item.completed : !item.completed)) && (selectedStore === "all" || (item.store || "") === selectedStore) && (selectedCategory === "all" || (item.category || "other") === selectedCategory) && (!searchQuery || item.name.toLowerCase().includes(searchQuery) || (item.store || "").toLowerCase().includes(searchQuery) || (item.notes || "").toLowerCase().includes(searchQuery)));
  visibleItems.sort((a, b) => sortMode === "name" ? a.name.localeCompare(b.name) : sortMode === "price" ? b.estimatedPrice - a.estimatedPrice : sortMode === "category" ? (a.category || "").localeCompare(b.category || "") : 0);
  elements.list.innerHTML = visibleItems.map(renderItem).join("");
  elements.empty.hidden = visibleItems.length > 0;
  updateSummary();
  updateStats();
}

function updateStoreFilter() {
  const stores = [...new Set(items.map((item) => item.store).filter(Boolean))].sort();
  const options = [`<option value="all">${language === "id" ? "Semua toko" : "All stores"}</option>`, ...stores.map((store) => `<option value="${escapeHtml(store)}">${escapeHtml(store)}</option>`)];
  elements.storeFilter.innerHTML = options.join("");
  elements.storeFilter.value = stores.includes(selectedStore) ? selectedStore : "all";
  selectedStore = elements.storeFilter.value;
}

function updateCategoryFilter() {
  const categories = [...new Set(items.map((item) => item.category || "other"))];
  const options = [`<option value="all">${t("allCategories")}</option>`, ...categories.map((category) => `<option value="${category}">${t("categories")[category]}</option>`)].join("");
  elements.categoryFilter.innerHTML = options;
  elements.categoryFilter.value = categories.includes(selectedCategory) ? selectedCategory : "all";
  selectedCategory = elements.categoryFilter.value;
}

function updateQuickAdd() {
  const names = [...new Set(items.map((item) => item.name))].slice(0, 20);
  elements.quickAdd.innerHTML = `<option value="">${t("quickAdd")}</option>${names.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("")}`;
}

function updateTemplates() {
  elements.template.innerHTML = `<option value="">${language === "id" ? "Template belanja" : "Shopping templates"}</option>${loadTemplates().map((template) => `<option value="${escapeHtml(template.name)}">${escapeHtml(template.name)}</option>`).join("")}`;
}

function updateStats() {
  const categoryTotals = {};
  items.forEach((item) => { categoryTotals[item.category || "other"] = (categoryTotals[item.category || "other"] || 0) + discountedPrice(item.estimatedPrice, item.discount) * item.quantity; });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  elements.stats.innerHTML = `<span>${language === "id" ? "Total item" : "Items"}: <strong>${items.length}</strong></span><span>${language === "id" ? "Kategori terbesar" : "Top category"}: <strong>${topCategory ? t("categories")[topCategory[0]] : "-"}</strong></span><span>${language === "id" ? "Estimasi rata-rata" : "Average estimate"}: <strong>${formatCurrency(items.length ? items.reduce((sum, item) => sum + discountedPrice(item.estimatedPrice, item.discount) * item.quantity, 0) / items.length : 0)}</strong></span>`;
}

function renderItem(item) {
  const estimatedLineTotal = discountedPrice(item.estimatedPrice, item.discount) * item.quantity;
  const category = item.category || "other";
  const history = (item.priceHistory || []).slice(0, 3).map((entry) => formatCurrency(entry.price)).join(" · ");
  return `<div class="item-row ${item.completed ? "completed" : ""}" data-id="${item.id}">
    <div class="item-main"><button class="check-button" type="button" aria-label="${t("markDone").replace("%s", escapeHtml(item.name))}">${item.completed ? "✓" : ""}</button><div><div class="item-name">${escapeHtml(item.name)}</div><span class="item-quantity">${item.quantity} ${escapeHtml(item.unit || "pcs")}</span><span class="item-category">${t("categories")[category]}${item.store ? ` · ${escapeHtml(item.store)}` : ""}</span>${item.notes ? `<small class="item-notes">${escapeHtml(item.notes)}</small>` : ""}</div></div>
    <div class="item-price">${formatCurrency(estimatedLineTotal)}<small>${formatCurrency(discountedPrice(item.estimatedPrice, item.discount))} / ${escapeHtml(item.unit || "pcs")}${item.discount ? ` · -${item.discount}%` : ""}</small>${history ? `<small class="price-history">${t("history")}: ${history}</small>` : ""}</div>
    <input class="actual-input" type="number" min="0" step="100" value="${item.actualPrice ?? ""}" placeholder="${t("actualPlaceholder")}" aria-label="${t("actualColumn")} ${escapeHtml(item.name)}">
    <div class="row-actions"><button class="edit-button" type="button" aria-label="${t("edit").replace("%s", escapeHtml(item.name))}">✎</button><button class="delete-button" type="button" aria-label="${t("delete").replace("%s", escapeHtml(item.name))}">×</button></div>
  </div>`;
}

function editItem(item) {
  const name = prompt(t("name"), item.name);
  if (name === null || !name.trim()) return;
  const price = prompt(t("estimatedPrice"), Math.round(item.estimatedPrice * CURRENCY_RATES[currency]));
  const quantity = prompt(t("quantity"), item.quantity);
  const unit = prompt(t("unitLabel"), item.unit || "pcs");
  const discount = prompt(t("discount"), item.discount || 0);
  const notes = prompt(t("notes"), item.notes || "");
  if (price === null || quantity === null || unit === null || discount === null || notes === null || Number(price) < 0 || Number(quantity) < 1 || Number(discount) < 0 || Number(discount) > 100) return;
  item.name = name.trim();
  item.estimatedPrice = Number(price) / CURRENCY_RATES[currency];
  item.quantity = Number(quantity);
  item.unit = unit.trim() || "pcs";
  item.discount = Number(discount);
  item.notes = notes.trim();
  saveAndRender();
}

function updateSummary() {
  const estimated = items.reduce((total, item) => total + discountedPrice(item.estimatedPrice, item.discount) * item.quantity, 0);
  const actualItems = items.filter((item) => item.actualPrice !== null);
  const actual = actualItems.reduce((total, item) => total + item.actualPrice * item.quantity, 0);
  const completed = items.filter((item) => item.completed).length;
  const difference = actualItems.length ? actual - estimated : 0;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;
  const budgetPercent = budget ? Math.round((estimated / budget) * 100) : 0;

  elements.estimatedTotal.textContent = formatCurrency(estimated);
  elements.actualTotal.textContent = formatCurrency(actual);
  elements.differenceTotal.textContent = formatCurrency(Math.abs(difference));
  elements.differenceTotal.style.color = difference > 0 ? "var(--coral)" : difference < 0 ? "var(--sage-dark)" : "var(--ink)";
  elements.estimatedDetail.textContent = `${items.length} ${t("planned")}`;
  elements.actualDetail.textContent = actualItems.length ? `${actualItems.length} ${t("actualFilled")}` : t("noActual");
  elements.differenceDetail.textContent = difference > 0 ? t("more") : difference < 0 ? t("less") : t("vsEstimate");
  elements.progressText.textContent = language === "id" ? `${completed} dari ${items.length} selesai` : `${completed} of ${items.length} done`;
  elements.progressPercent.textContent = `${progress}%`;
  elements.progressBar.style.width = `${progress}%`;
  elements.allCount.textContent = items.length;
  elements.pendingCount.textContent = items.filter((item) => !item.completed).length;
  elements.doneCount.textContent = completed;
  elements.budgetStatus.textContent = !budget ? t("noBudget") : budgetPercent > 100 ? t("overBudget").replace("%s", formatCurrency(estimated - budget)) : budgetPercent >= 80 ? `${t("budgetUsed").replace("%s", formatCurrency(estimated)).replace("%s", formatCurrency(budget))} ⚠` : t("budgetUsed").replace("%s", formatCurrency(estimated)).replace("%s", formatCurrency(budget));
  elements.budgetBar.style.width = `${Math.min(budgetPercent, 100)}%`;
  elements.budgetBar.style.background = budgetPercent > 100 ? "var(--coral)" : "var(--sage)";
  if (budget && budgetPercent >= 100 && items.length) elements.budgetStatus.classList.add("budget-alert");
  else elements.budgetStatus.classList.remove("budget-alert");
  if (budget && estimated > budget && localStorage.getItem(NOTIFICATION_KEY) === "true" && "Notification" in window && Notification.permission === "granted") {
    if (localStorage.getItem(BUDGET_ALERT_KEY) !== "true") { new Notification(language === "id" ? "Budget terlewati" : "Budget exceeded", { body: `${formatCurrency(estimated - budget)} ${language === "id" ? "di atas budget" : "over budget"}` }); localStorage.setItem(BUDGET_ALERT_KEY, "true"); }
  } else if (!budget || estimated <= budget) localStorage.removeItem(BUDGET_ALERT_KEY);
}

function renderSavedLists() {
  elements.savedLists.innerHTML = savedLists.slice(0, 5).map((list, index) => `<button class="saved-list" type="button" data-list-index="${index}">${escapeHtml(list.name)} <small>${list.items.length}</small></button>`).join("");
  elements.savedLists.querySelectorAll(".saved-list").forEach((button) => button.addEventListener("click", () => {
    const selected = savedLists[Number(button.dataset.listIndex)];
    if (!selected) return;
    items = selected.items;
    budget = selected.budget || 0;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(BUDGET_KEY, String(budget));
    applyPreferences();
    render();
  }));
}

function listText() {
  return items.map((item) => `${item.completed ? "[x]" : "[ ]"} ${item.name} x${item.quantity} - ${formatCurrency(item.actualPrice ?? item.estimatedPrice)}${item.store ? ` (${item.store})` : ""}`).join("\n");
}

async function shareList() {
  const text = listText();
  try {
    if (navigator.share) await navigator.share({ title: document.title, text });
    else if (navigator.clipboard) { await navigator.clipboard.writeText(text); alert(t("copied")); }
    else window.prompt("Copy", text);
  } catch (error) {
    if (error.name !== "AbortError") window.prompt("Copy", text);
  }
}

function exportList() {
  const blob = new Blob([listText()], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "daftar-belanja.txt";
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportCsv() {
  const rows = [["Name", "Store", "Quantity", "Unit", "Estimated price", "Discount", "Estimated total", "Actual price", "Notes", "Completed"], ...items.map((item) => [item.name, item.store || "", item.quantity, item.unit || "pcs", item.estimatedPrice, item.discount || 0, discountedPrice(item.estimatedPrice, item.discount) * item.quantity, item.actualPrice ?? "", item.notes || "", item.completed ? "Yes" : "No"])];
  const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = "daftar-belanja.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportPdf() {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;
  printWindow.document.write(`<title>${escapeHtml(document.title)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#20231f}h1{margin-bottom:18px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f5f1e8}</style><h1>${escapeHtml(document.title)}</h1><table><thead><tr><th>Name</th><th>Quantity</th><th>Unit</th><th>Estimate</th><th>Notes</th></tr></thead><tbody>${items.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${item.quantity}</td><td>${escapeHtml(item.unit || "pcs")}</td><td>${formatCurrency(discountedPrice(item.estimatedPrice, item.discount) * item.quantity)}</td><td>${escapeHtml(item.notes || "")}</td></tr>`).join("")}</tbody></table>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

async function openScanner() {
  elements.scannerModal.hidden = false;
  elements.scannerMessage.textContent = !window.isSecureContext ? t("secure") : t("scannerMessage");
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) return;
  if (!("BarcodeDetector" in window)) {
    elements.scannerMessage.textContent = t("unsupported");
    return;
  }
  try {
    elements.scannerStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
    elements.scannerVideo.srcObject = elements.scannerStream;
    const detector = new BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"] });
    elements.scannerTimer = window.setInterval(async () => {
      if (elements.scannerVideo.readyState < 2) return;
      const codes = await detector.detect(elements.scannerVideo).catch(() => []);
      if (codes[0]?.rawValue) useBarcode(codes[0].rawValue);
    }, 350);
  } catch (error) {
    closeScanner();
    elements.scannerMessage.textContent = error.name === "NotAllowedError" ? (language === "id" ? "Izin kamera ditolak." : "Camera permission was denied.") : t("unsupported");
  }
}

function closeScanner() {
  if (elements.scannerTimer) window.clearInterval(elements.scannerTimer);
  elements.scannerTimer = null;
  elements.scannerStream?.getTracks().forEach((track) => track.stop());
  elements.scannerStream = null;
  elements.scannerVideo.srcObject = null;
  elements.scannerModal.hidden = true;
}

async function useBarcode(value) {
  const code = value.trim();
  if (!code) return;
  closeScanner();
  elements.name.value = code;
  if (navigator.onLine) {
    const product = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`).then((response) => response.ok ? response.json() : null).catch(() => null);
    const productName = product?.product?.product_name || product?.product?.product_name_en;
    if (productName) elements.name.value = productName;
  }
  elements.name.focus();
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

applyPreferences();
render();
document.documentElement.classList.add("app-ready");

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  navigator.serviceWorker.register("../pages/sw.js").catch(() => {});
}
