const state = {
  data: null,
  selectedCategoryId: null,
  selectedMember: null,
  selectedStatsDate: null,
  selectedExpenseId: null,
  selectedDashboardCategoryId: null,
  selectedSavingId: null,
  savingMember: null,
  detailFilters: { query: "", categoryId: "", member: "" },
  entryTemplates: [],
  trendStates: [],
  notificationStatus: null,
  theme: normalizeTheme(localStorage.getItem("ledgerTheme")),
  token: localStorage.getItem("ledgerToken") || ""
};

window.__MONEY_LEDGER_SUPPORTED_THEMES__ = ["minimal", "cute", "ios26", "custom"];

const BASE_PATH = normalizeBasePath(window.__LEDGER_BASE_PATH__ || "");

const elements = {
  themeColorMeta: document.querySelector("meta[name='theme-color']"),
  monthInput: document.querySelector("#monthInput"),
  tabs: document.querySelectorAll(".tab"),
  themeOptions: document.querySelectorAll("[data-theme-choice]"),
  customThemeGrid: document.querySelector("#customThemeGrid"),
  views: {
    dashboard: document.querySelector("#dashboardView"),
    entry: document.querySelector("#entryView"),
    details: document.querySelector("#detailsView"),
    savings: document.querySelector("#savingsView"),
    stats: document.querySelector("#statsView"),
    settings: document.querySelector("#settingsView")
  },
  totalSpent: document.querySelector("#totalSpent"),
  totalBudget: document.querySelector("#totalBudget"),
  totalMeter: document.querySelector("#totalMeter"),
  remainingAmount: document.querySelector("#remainingAmount"),
  dailyAmount: document.querySelector("#dailyAmount"),
  remainingDays: document.querySelector("#remainingDays"),
  budgetAlertPanel: document.querySelector("#budgetAlertPanel"),
  budgetAlertTitle: document.querySelector("#budgetAlertTitle"),
  budgetAlertSummary: document.querySelector("#budgetAlertSummary"),
  budgetAlertList: document.querySelector("#budgetAlertList"),
  dashboardMain: document.querySelector("#dashboardMain"),
  categoryList: document.querySelector("#categoryList"),
  categoryDetailPane: document.querySelector("#categoryDetailPane"),
  categoryDetailBack: document.querySelector("#categoryDetailBack"),
  categoryDetailTitle: document.querySelector("#categoryDetailTitle"),
  categoryDetailSummary: document.querySelector("#categoryDetailSummary"),
  categoryDetailBudget: document.querySelector("#categoryDetailBudget"),
  categoryDetailMemberSummary: document.querySelector("#categoryDetailMemberSummary"),
  categoryDetailMemberList: document.querySelector("#categoryDetailMemberList"),
  categoryDetailExpenseSummary: document.querySelector("#categoryDetailExpenseSummary"),
  categoryDetailExpenseList: document.querySelector("#categoryDetailExpenseList"),
  categoryChips: document.querySelector("#categoryChips"),
  memberChips: document.querySelector("#memberChips"),
  expenseForm: document.querySelector("#expenseForm"),
  amountInput: document.querySelector("#amountInput"),
  dateInput: document.querySelector("#dateInput"),
  noteInput: document.querySelector("#noteInput"),
  saveTemplateButton: document.querySelector("#saveTemplateButton"),
  templateList: document.querySelector("#templateList"),
  entrySubmitAmount: document.querySelector("#entrySubmitAmount"),
  entrySubmitMeta: document.querySelector("#entrySubmitMeta"),
  entryFeedback: document.querySelector("#entryFeedback"),
  offlineQueueStatus: document.querySelectorAll("[data-offline-queue-status]"),
  recentList: document.querySelector("#recentList"),
  detailSearchInput: document.querySelector("#detailSearchInput"),
  detailCategoryFilter: document.querySelector("#detailCategoryFilter"),
  detailMemberFilter: document.querySelector("#detailMemberFilter"),
  detailFilterStatus: document.querySelector("#detailFilterStatus"),
  detailFilterReset: document.querySelector("#detailFilterReset"),
  detailListPane: document.querySelector("#detailListPane"),
  recordDetailForm: document.querySelector("#recordDetailForm"),
  recordBackButton: document.querySelector("#recordBackButton"),
  recordCreatedAt: document.querySelector("#recordCreatedAt"),
  recordAmountInput: document.querySelector("#recordAmountInput"),
  recordCategorySelect: document.querySelector("#recordCategorySelect"),
  recordMemberSelect: document.querySelector("#recordMemberSelect"),
  recordDateInput: document.querySelector("#recordDateInput"),
  recordNoteInput: document.querySelector("#recordNoteInput"),
  recordDeleteButton: document.querySelector("#recordDeleteButton"),
  recordFeedback: document.querySelector("#recordFeedback"),
  exportLink: document.querySelector("#exportLink"),
  copySummaryButton: document.querySelector("#copySummaryButton"),
  settingsForm: document.querySelector("#settingsForm"),
  settingsFeedback: document.querySelector("#settingsFeedback"),
  memberRows: document.querySelector("#memberRows"),
  addMemberButton: document.querySelector("#addMemberButton"),
  budgetRows: document.querySelector("#budgetRows"),
  addCategoryButton: document.querySelector("#addCategoryButton"),
  notificationNotice: document.querySelector("#notificationNotice"),
  notificationStatusTitle: document.querySelector("#notificationStatusTitle"),
  notificationStatusText: document.querySelector("#notificationStatusText"),
  enablePushButton: document.querySelector("#enablePushButton"),
  budgetPushToggle: document.querySelector("#budgetPushToggle"),
  dailyReminderToggle: document.querySelector("#dailyReminderToggle"),
  dailyReminderTimeInput: document.querySelector("#dailyReminderTimeInput"),
  saveNotificationSettingsButton: document.querySelector("#saveNotificationSettingsButton"),
  testPushButton: document.querySelector("#testPushButton"),
  disablePushButton: document.querySelector("#disablePushButton"),
  jsonExportLink: document.querySelector("#jsonExportLink"),
  importBackupInput: document.querySelector("#importBackupInput"),
  clearAllDataButton: document.querySelector("#clearAllDataButton"),
  avgDailySpend: document.querySelector("#avgDailySpend"),
  topCategoryName: document.querySelector("#topCategoryName"),
  topCategoryAmount: document.querySelector("#topCategoryAmount"),
  recordCount: document.querySelector("#recordCount"),
  activeDays: document.querySelector("#activeDays"),
  trendRangeLabel: document.querySelector("#trendRangeLabel"),
  monthDeltaAmount: document.querySelector("#monthDeltaAmount"),
  monthDeltaLabel: document.querySelector("#monthDeltaLabel"),
  sixMonthAverage: document.querySelector("#sixMonthAverage"),
  sixMonthTotal: document.querySelector("#sixMonthTotal"),
  monthlyTrendList: document.querySelector("#monthlyTrendList"),
  memberCompareLabel: document.querySelector("#memberCompareLabel"),
  memberCompareList: document.querySelector("#memberCompareList"),
  categoryCompareList: document.querySelector("#categoryCompareList"),
  calendarMonthLabel: document.querySelector("#calendarMonthLabel"),
  calendarGrid: document.querySelector("#calendarGrid"),
  selectedDayTitle: document.querySelector("#selectedDayTitle"),
  selectedDayTotal: document.querySelector("#selectedDayTotal"),
  selectedDayList: document.querySelector("#selectedDayList"),
  rankList: document.querySelector("#rankList"),
  successPopup: document.querySelector("#successPopup"),
  successPopupMessage: document.querySelector("#successPopupMessage"),
  pwaUpdatePrompt: document.querySelector("#pwaUpdatePrompt"),
  pwaUpdateButton: document.querySelector("#pwaUpdateButton"),
  pwaUpdateDismiss: document.querySelector("#pwaUpdateDismiss"),
  savingsTotalAll: document.querySelector("#savingsTotalAll"),
  savingsMonthDelta: document.querySelector("#savingsMonthDelta"),
  savingsMemberSummary: document.querySelector("#savingsMemberSummary"),
  savingsMemberList: document.querySelector("#savingsMemberList"),
  savingsList: document.querySelector("#savingsList"),
  savingsListSummary: document.querySelector("#savingsListSummary"),
  savingsListPane: document.querySelector("#savingsListPane"),
  savingForm: document.querySelector("#savingForm"),
  savingAmountInput: document.querySelector("#savingAmountInput"),
  savingMemberChips: document.querySelector("#savingMemberChips"),
  savingDateInput: document.querySelector("#savingDateInput"),
  savingNoteInput: document.querySelector("#savingNoteInput"),
  savingSubmitAmount: document.querySelector("#savingSubmitAmount"),
  savingSubmitMeta: document.querySelector("#savingSubmitMeta"),
  savingFeedback: document.querySelector("#savingFeedback"),
  savingDetailForm: document.querySelector("#savingDetailForm"),
  savingBackButton: document.querySelector("#savingBackButton"),
  savingCreatedAt: document.querySelector("#savingCreatedAt"),
  savingDetailAmountInput: document.querySelector("#savingDetailAmountInput"),
  savingDetailMemberSelect: document.querySelector("#savingDetailMemberSelect"),
  savingDetailDateInput: document.querySelector("#savingDetailDateInput"),
  savingDetailNoteInput: document.querySelector("#savingDetailNoteInput"),
  savingDeleteButton: document.querySelector("#savingDeleteButton"),
  savingDetailFeedback: document.querySelector("#savingDetailFeedback")
};

const cropper = {
  file: null,
  group: "",
  key: "",
  image: null,
  source: "",
  aspectRatio: 1,
  outputWidth: 320,
  outputHeight: 320,
  baseScale: 1,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  frame: { x: 0, y: 0, width: 0, height: 0 },
  dragging: false,
  pointerId: null,
  dragStartX: 0,
  dragStartY: 0,
  startOffsetX: 0,
  startOffsetY: 0,
  resolve: null
};

const cropElements = {
  modal: document.querySelector("#cropModal"),
  title: document.querySelector("#cropTitle"),
  stage: document.querySelector("#cropStage"),
  image: document.querySelector("#cropImage"),
  frame: document.querySelector("#cropFrame"),
  scaleInput: document.querySelector("#cropScaleInput"),
  applyButton: document.querySelector("#cropApplyButton"),
  cancelButton: document.querySelector("#cropCancelButton"),
  cancelTopButton: document.querySelector("#cropCancelTopButton")
};

const MINIMAL_TAB_ICONS = {
  dashboard: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 10.5 12 4l7.5 6.5V20a1 1 0 0 1-1 1h-4.25v-5.5h-4.5V21H5.5a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>`,
  details: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 7h11M6.5 12h11M6.5 17h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  entry: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
  savings: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 11.5a6 5 0 0 1 12 0v.5a4 4 0 0 1-1.5 3v3h-2v-1.5h-5V18h-2v-3a4 4 0 0 1-1.5-3zM4.5 12.5h1.6M14.5 9.5h.01" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  stats: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9m7 10V5m7 14v-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Zm7.2 3.5c0-.5-.1-1-.2-1.5l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2.6-1.5L13.7 2h-4l-.4 3a8 8 0 0 0-2.6 1.5l-2.4-1-2 3.5 2 1.5A8 8 0 0 0 4 12c0 .5.1 1 .2 1.5l-2 1.5 2 3.5 2.4-1A8 8 0 0 0 9.2 19l.4 3h4l.4-3a8 8 0 0 0 2.6-1.5l2.4 1 2-3.5-2-1.5c.1-.5.2-1 .2-1.5Z" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/></svg>`
};

const CUTE_TAB_SYMBOLS = {
  dashboard: `<path class="kitty-symbol" d="M8.9 16.2 12 13.6l3.1 2.6v2.2h-2v-1.6h-2.2v1.6h-2z"/>`,
  details: `<path class="kitty-symbol" d="M8.7 15.1h6.6M8.7 17.1h6.6M8.7 19.1h4.2"/>`,
  entry: `<path class="kitty-symbol" d="M12 14.3v5M9.5 16.8h5"/>`,
  savings: `<path class="kitty-symbol" d="M9 16.5a3 2.5 0 0 1 6 0v.4a2 2 0 0 1-.8 1.6v.9h-1V18.6h-2.4v.8h-1V18.5a2 2 0 0 1-.8-1.6z"/>`,
  stats: `<path class="kitty-symbol" d="M9 18.9v-2.8M12 18.9v-4.6M15 18.9v-3.5"/>`,
  settings: `<path class="kitty-symbol" d="M12 15.1a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4Zm4.2 1.7h-1M9.8 16.8h-1M12 13.6v-1M12 21v-1"/>`
};

const HELLO_KITTY_ICON = assetPath("/hello-kitty-red.jpg");

const CUSTOM_THEME_STORAGE_KEY = "ledgerCustomTheme";
const ENTRY_TEMPLATE_STORAGE_KEY = "ledgerEntryTemplates";
const OFFLINE_QUEUE_STORAGE_KEY = "ledgerOfflineExpenseQueue";
const STATE_CACHE_STORAGE_KEY = "ledgerStateCache";
const CUSTOM_TAB_SLOTS = [
  { key: "dashboard", label: "首页图标" },
  { key: "details", label: "明细图标" },
  { key: "entry", label: "记账图标" },
  { key: "savings", label: "存钱图标" },
  { key: "stats", label: "统计图标" },
  { key: "settings", label: "设置图标" }
];
const CUSTOM_VIEW_SLOTS = [
  { key: "dashboard", label: "首页背景" },
  { key: "details", label: "明细背景" },
  { key: "savings", label: "存钱背景" },
  { key: "stats", label: "统计背景" },
  { key: "settings", label: "设置背景" }
];
const CUSTOM_THEME_SLOTS = [
  ...CUSTOM_TAB_SLOTS.map(slot => ({ ...slot, group: "tabs", hint: "Tabbar" })),
  ...CUSTOM_VIEW_SLOTS.map(slot => ({ ...slot, group: "views", hint: "页面" })),
  { key: "summary", label: "总预算背景", group: "summary", hint: "首页卡片" }
];

const CROP_PRESETS = {
  tabs: { aspectRatio: 1, outputWidth: 320, outputHeight: 320 },
  views: { aspectRatio: 9 / 16, outputWidth: 900, outputHeight: 1600 },
  summary: { aspectRatio: 16 / 9, outputWidth: 1280, outputHeight: 720 }
};
const CATEGORY_ICON_FALLBACKS = ["🍚", "🧴", "🚇", "🎮", "🏠", "💝", "🧾"];

state.customTheme = loadCustomTheme();
state.entryTemplates = loadEntryTemplates();
state.offlineQueue = loadOfflineQueue();
state.syncingOfflineQueue = false;
state.waitingServiceWorker = null;
state.hasServiceWorkerController = false;
state.serviceWorkerControllerChanged = false;
state.reloadForServiceWorkerUpdate = false;
let successPopupTimer = null;

function cuteTabIcon(view) {
  return `
    <span class="kitty-icon-shell kitty-icon-shell--${view}">
      <img class="kitty-icon-image" src="${HELLO_KITTY_ICON}" alt="" aria-hidden="true">
      <svg class="kitty-icon-badge" viewBox="0 0 24 24" aria-hidden="true">
        ${CUTE_TAB_SYMBOLS[view] || ""}
      </svg>
    </span>
  `;
}

function normalizeTheme(theme) {
  if (theme === "cute" || theme === "custom" || theme === "ios26") return theme;
  return "minimal";
}

function renderTabIcons() {
  elements.tabs.forEach(tab => {
    const icon = tab.querySelector(".tab-icon");
    if (!icon) return;
    const view = tab.dataset.view;
    if (state.theme === "cute") {
      icon.innerHTML = cuteTabIcon(view);
      return;
    }
    if (state.theme === "custom") {
      icon.innerHTML = customTabIcon(view) || MINIMAL_TAB_ICONS[view] || "";
      return;
    }
    icon.innerHTML = MINIMAL_TAB_ICONS[view] || "";
  });
}

function renderThemeControls() {
  elements.themeOptions.forEach(button => {
    const isActive = button.dataset.themeChoice === state.theme;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function applyTheme(theme) {
  state.theme = normalizeTheme(theme);
  document.documentElement.dataset.theme = state.theme;
  localStorage.setItem("ledgerTheme", state.theme);
  if (elements.themeColorMeta) {
    const themeColor = state.theme === "minimal" ? "#ffffff" : state.theme === "ios26" ? "#eef4ff" : "#fff7fb";
    elements.themeColorMeta.setAttribute("content", themeColor);
  }
  renderTabIcons();
  renderThemeControls();
  renderCustomThemeControls();
  applyCustomThemeAssets();
}

function loadCustomTheme() {
  try {
    const value = JSON.parse(localStorage.getItem(CUSTOM_THEME_STORAGE_KEY) || "{}");
    return {
      tabs: value.tabs && typeof value.tabs === "object" ? value.tabs : {},
      views: value.views && typeof value.views === "object" ? value.views : {},
      summary: typeof value.summary === "string" ? value.summary : ""
    };
  } catch {
    return { tabs: {}, views: {}, summary: "" };
  }
}

function saveCustomTheme() {
  localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(state.customTheme));
}

function loadEntryTemplates() {
  try {
    const value = JSON.parse(localStorage.getItem(ENTRY_TEMPLATE_STORAGE_KEY) || "[]");
    if (!Array.isArray(value)) return [];
    return value
      .map(template => ({
        id: String(template.id || cryptoId()),
        amount: Number(template.amount || 0),
        categoryId: String(template.categoryId || "").trim(),
        member: String(template.member || "").trim(),
        note: String(template.note || "").trim().slice(0, 80),
        createdAt: String(template.createdAt || "")
      }))
      .filter(template => template.amount > 0 && template.categoryId && template.member)
      .slice(0, 12);
  } catch {
    return [];
  }
}

function saveEntryTemplates() {
  localStorage.setItem(ENTRY_TEMPLATE_STORAGE_KEY, JSON.stringify(state.entryTemplates));
}

function loadOfflineQueue() {
  try {
    const value = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY) || "[]");
    if (!Array.isArray(value)) return [];
    return value
      .map(normalizeOfflineQueueItem)
      .filter(Boolean);
  } catch {
    return [];
  }
}

function saveOfflineQueue() {
  localStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(state.offlineQueue));
}

function normalizeQueuedExpensePayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  const amount = roundMoney(payload.amount);
  const categoryId = String(payload.categoryId || "").trim();
  const member = String(payload.member || "").trim();
  const date = String(payload.date || "").trim();
  const note = String(payload.note || "").trim().slice(0, 80);
  if (!Number.isFinite(amount) || amount <= 0 || !categoryId || !member || !isValidDateValue(date)) return null;
  return { amount, categoryId, member, date, note };
}

function normalizeOfflineQueueItem(item) {
  if (!item || typeof item !== "object") return null;
  const type = ["create", "update", "delete"].includes(item.type) ? item.type : "create";
  const base = {
    id: String(item.id || cryptoId()),
    type,
    queuedAt: String(item.queuedAt || new Date().toISOString()),
    attempts: Number(item.attempts || 0),
    lastError: String(item.lastError || "")
  };

  if (type === "create") {
    const payload = normalizeQueuedExpensePayload(item.payload);
    if (!payload) return null;
    return {
      ...base,
      localId: String(item.localId || item.expenseId || `local_${base.id}`),
      payload,
      month: String(item.month || payload.date.slice(0, 7))
    };
  }

  if (type === "update") {
    const expenseId = String(item.expenseId || "").trim();
    const payload = normalizeQueuedExpensePayload(item.payload);
    if (!expenseId || !payload) return null;
    return {
      ...base,
      expenseId,
      payload,
      month: String(item.month || payload.date.slice(0, 7))
    };
  }

  const expenseId = String(item.expenseId || "").trim();
  if (!expenseId) return null;
  return {
    ...base,
    expenseId,
    month: String(item.month || "")
  };
}

function localExpenseId() {
  return `local_${cryptoId()}_${Date.now().toString(36)}`;
}

function queueItemMatchesExpense(item, expenseId) {
  return item.expenseId === expenseId || item.localId === expenseId;
}

function hasQueuedOperationForExpense(expenseId) {
  return state.offlineQueue.some(item => queueItemMatchesExpense(item, expenseId));
}

function enqueueOfflineCreate(payload) {
  const localId = localExpenseId();
  state.offlineQueue.push({
    id: cryptoId(),
    type: "create",
    localId,
    payload,
    month: payload.date.slice(0, 7),
    queuedAt: new Date().toISOString(),
    attempts: 0,
    lastError: ""
  });
  saveOfflineQueue();
  renderOfflineQueueStatus();
  return localId;
}

function enqueueOfflineUpdate(expenseId, payload) {
  const createItem = state.offlineQueue.find(item => item.type === "create" && queueItemMatchesExpense(item, expenseId));
  if (createItem) {
    createItem.payload = payload;
    createItem.month = payload.date.slice(0, 7);
    createItem.lastError = "";
    saveOfflineQueue();
    renderOfflineQueueStatus();
    return;
  }

  const updateItem = state.offlineQueue.find(item => item.type === "update" && item.expenseId === expenseId);
  if (updateItem) {
    updateItem.payload = payload;
    updateItem.month = payload.date.slice(0, 7);
    updateItem.lastError = "";
  } else {
    state.offlineQueue.push({
      id: cryptoId(),
      type: "update",
      expenseId,
      payload,
      month: payload.date.slice(0, 7),
      queuedAt: new Date().toISOString(),
      attempts: 0,
      lastError: ""
    });
  }
  saveOfflineQueue();
  renderOfflineQueueStatus();
}

function enqueueOfflineDelete(expenseId) {
  const createItem = state.offlineQueue.find(item => item.type === "create" && queueItemMatchesExpense(item, expenseId));
  if (createItem) {
    state.offlineQueue = state.offlineQueue.filter(item => !queueItemMatchesExpense(item, expenseId));
    saveOfflineQueue();
    renderOfflineQueueStatus();
    return;
  }

  state.offlineQueue = state.offlineQueue.filter(item => !(item.type === "update" && item.expenseId === expenseId));
  if (!state.offlineQueue.some(item => item.type === "delete" && item.expenseId === expenseId)) {
    state.offlineQueue.push({
      id: cryptoId(),
      type: "delete",
      expenseId,
      month: state.data?.month || "",
      queuedAt: new Date().toISOString(),
      attempts: 0,
      lastError: ""
    });
  }
  saveOfflineQueue();
  renderOfflineQueueStatus();
}

function renderOfflineQueueStatus() {
  if (!elements.offlineQueueStatus?.length) return;
  const count = state.offlineQueue.length;
  const createCount = state.offlineQueue.filter(item => item.type === "create").length;
  const updateCount = state.offlineQueue.filter(item => item.type === "update").length;
  const deleteCount = state.offlineQueue.filter(item => item.type === "delete").length;
  const parts = [
    createCount ? `新增 ${createCount}` : "",
    updateCount ? `修改 ${updateCount}` : "",
    deleteCount ? `删除 ${deleteCount}` : ""
  ].filter(Boolean).join("，");
  const hidden = count === 0 && !state.syncingOfflineQueue;
  let text = "";
  if (state.syncingOfflineQueue) {
    text = `正在同步离线记录，剩余 ${count} 笔`;
  } else if (count > 0) {
    const failed = state.offlineQueue.find(item => item.lastError);
    text = failed
      ? `待同步 ${count} 笔（${parts}），上次失败：${failed.lastError}`
      : `待同步 ${count} 笔（${parts}），恢复网络后自动同步`;
  }
  elements.offlineQueueStatus.forEach(element => {
    element.hidden = hidden;
    element.classList.toggle("is-syncing", state.syncingOfflineQueue);
    element.textContent = text;
  });
}

function saveCachedTrendStates(month, states) {
  try {
    const value = JSON.parse(localStorage.getItem(STATE_CACHE_STORAGE_KEY) || "{}");
    const byMonth = value.byMonth && typeof value.byMonth === "object" ? value.byMonth : {};
    byMonth[month] = { savedAt: new Date().toISOString(), states };
    localStorage.setItem(STATE_CACHE_STORAGE_KEY, JSON.stringify({ byMonth }));
  } catch {}
}

function loadCachedTrendStates(month) {
  try {
    const value = JSON.parse(localStorage.getItem(STATE_CACHE_STORAGE_KEY) || "{}");
    const states = value.byMonth?.[month]?.states;
    if (!Array.isArray(states) || states.length === 0) return null;
    if (!states[states.length - 1]?.month) return null;
    return states;
  } catch {
    return null;
  }
}

function customTabIcon(view) {
  const source = state.customTheme.tabs?.[view];
  if (!source) return "";
  return `<span class="custom-tab-image"><img src="${source}" alt="" aria-hidden="true"></span>`;
}

function customAssetFor(slot) {
  if (slot.group === "summary") return state.customTheme.summary || "";
  return state.customTheme[slot.group]?.[slot.key] || "";
}

function renderCustomThemeControls() {
  if (!elements.customThemeGrid) return;
  elements.customThemeGrid.innerHTML = "";

  CUSTOM_THEME_SLOTS.forEach(slot => {
    const source = customAssetFor(slot);
    const item = document.createElement("article");
    item.className = "custom-theme-item";
    item.innerHTML = `
      <div class="custom-theme-thumb${source ? " has-image" : ""}" ${source ? `style="background-image:url('${source}')"` : ""}></div>
      <div class="custom-theme-meta">
        <strong>${escapeHtml(slot.label)}</strong>
        <span>${escapeHtml(slot.hint)}</span>
      </div>
      <div class="custom-theme-actions">
        <label class="custom-upload">
          <span>上传</span>
          <input type="file" accept="image/*" data-custom-group="${slot.group}" data-custom-key="${slot.key}">
        </label>
        <button class="custom-clear" type="button" data-custom-clear-group="${slot.group}" data-custom-clear-key="${slot.key}" aria-label="清除${escapeAttribute(slot.label)}">×</button>
      </div>
    `;
    elements.customThemeGrid.appendChild(item);
  });
}

function applyCustomThemeAssets() {
  Object.entries(elements.views).forEach(([view, element]) => {
    const source = state.theme === "custom" ? state.customTheme.views?.[view] : "";
    element.classList.toggle("has-custom-bg", Boolean(source));
    if (source) {
      element.style.setProperty("--view-bg-image", `url("${source}")`);
    } else {
      element.style.removeProperty("--view-bg-image");
    }
  });

  const summaryPanel = document.querySelector(".summary-panel");
  const summarySource = state.theme === "custom" ? state.customTheme.summary : "";
  if (!summaryPanel) return;
  summaryPanel.classList.toggle("has-custom-summary-bg", Boolean(summarySource));
  if (summarySource) {
    summaryPanel.style.setProperty("--summary-bg-image", `url("${summarySource}")`);
  } else {
    summaryPanel.style.removeProperty("--summary-bg-image");
  }
}

async function handleCustomAssetUpload(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== "file") return;
  const file = input.files?.[0];
  if (!file) return;

  const group = input.dataset.customGroup;
  const key = input.dataset.customKey;

  try {
    await openCropper(file, group, key);
  } catch (error) {
    elements.settingsFeedback.textContent = error.message || "图片读取失败";
  } finally {
    input.value = "";
  }
}

function handleCustomAssetClear(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const button = target.closest("[data-custom-clear-group]");
  if (!button) return;
  const group = button.dataset.customClearGroup;
  const key = button.dataset.customClearKey;

  if (group === "summary") {
    state.customTheme.summary = "";
  } else if (state.customTheme[group]) {
    delete state.customTheme[group][key];
  }

  saveCustomTheme();
  renderCustomThemeControls();
  renderTabIcons();
  applyCustomThemeAssets();
  elements.settingsFeedback.textContent = "已清除自定义素材";
}

async function openCropper(file, group, key) {
  const preset = CROP_PRESETS[group];
  if (!preset || (group !== "summary" && !key)) {
    throw new Error("未知素材位置");
  }
  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("请选择图片文件");
  }
  if (!cropElements.modal || !cropElements.stage || !cropElements.image || !cropElements.frame) {
    throw new Error("裁剪器初始化失败");
  }

  const source = await readFileAsDataUrl(file);
  const image = await loadCropImage(source);
  const slot = CUSTOM_THEME_SLOTS.find(item => item.group === group && item.key === key);

  Object.assign(cropper, {
    file,
    group,
    key,
    image,
    source,
    aspectRatio: preset.aspectRatio,
    outputWidth: preset.outputWidth,
    outputHeight: preset.outputHeight,
    baseScale: 1,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    dragging: false,
    pointerId: null
  });

  const completion = new Promise(resolve => {
    cropper.resolve = resolve;
  });

  cropElements.title.textContent = slot ? `裁剪${slot.label}` : "裁剪图片";
  cropElements.image.src = source;
  cropElements.scaleInput.value = "1";
  cropElements.modal.hidden = false;
  document.body.classList.add("is-cropping");

  await new Promise(resolve => requestAnimationFrame(resolve));
  configureCropFrame();
  fitCropImage();
  renderCropper();
  cropElements.applyButton.focus();

  return completion;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}

function loadCropImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片读取失败"));
    image.src = source;
  });
}

function configureCropFrame() {
  const rect = cropElements.stage.getBoundingClientRect();
  const gap = rect.width < 360 ? 24 : 36;
  let width = Math.max(96, rect.width - gap);
  let height = width / cropper.aspectRatio;
  const maxHeight = Math.max(160, rect.height - gap);

  if (height > maxHeight) {
    height = maxHeight;
    width = height * cropper.aspectRatio;
  }

  cropper.frame = {
    x: (rect.width - width) / 2,
    y: (rect.height - height) / 2,
    width,
    height
  };

  cropElements.frame.style.left = `${cropper.frame.x}px`;
  cropElements.frame.style.top = `${cropper.frame.y}px`;
  cropElements.frame.style.width = `${cropper.frame.width}px`;
  cropElements.frame.style.height = `${cropper.frame.height}px`;
}

function fitCropImage() {
  const image = cropper.image;
  if (!image) return;
  cropper.baseScale = Math.max(
    cropper.frame.width / image.naturalWidth,
    cropper.frame.height / image.naturalHeight
  );
  cropper.scale = Number(cropElements.scaleInput.value) || 1;
  cropper.offsetX = 0;
  cropper.offsetY = 0;
  clampCropOffset();
}

function getCropImageLayout() {
  const image = cropper.image;
  const scale = cropper.baseScale * cropper.scale;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const centerX = cropper.frame.x + cropper.frame.width / 2 + cropper.offsetX;
  const centerY = cropper.frame.y + cropper.frame.height / 2 + cropper.offsetY;

  return {
    scale,
    width,
    height,
    left: centerX - width / 2,
    top: centerY - height / 2
  };
}

function clampCropOffset() {
  if (!cropper.image) return;
  const frame = cropper.frame;
  let layout = getCropImageLayout();

  if (layout.width <= frame.width + 0.5) {
    cropper.offsetX = 0;
  } else {
    if (layout.left > frame.x) {
      cropper.offsetX -= layout.left - frame.x;
      layout = getCropImageLayout();
    }
    const rightGap = frame.x + frame.width - (layout.left + layout.width);
    if (rightGap > 0) {
      cropper.offsetX += rightGap;
      layout = getCropImageLayout();
    }
  }

  if (layout.height <= frame.height + 0.5) {
    cropper.offsetY = 0;
  } else {
    if (layout.top > frame.y) {
      cropper.offsetY -= layout.top - frame.y;
      layout = getCropImageLayout();
    }
    const bottomGap = frame.y + frame.height - (layout.top + layout.height);
    if (bottomGap > 0) {
      cropper.offsetY += bottomGap;
    }
  }
}

function renderCropper() {
  if (!cropper.image) return;
  const layout = getCropImageLayout();
  cropElements.image.style.width = `${layout.width}px`;
  cropElements.image.style.height = `${layout.height}px`;
  cropElements.image.style.transform = `translate(${layout.left}px, ${layout.top}px)`;
}

function handleCropPointerDown(event) {
  if (cropElements.modal.hidden || !cropper.image) return;
  if (event.button !== undefined && event.button > 0) return;
  event.preventDefault();
  cropper.dragging = true;
  cropper.pointerId = event.pointerId;
  cropper.dragStartX = event.clientX;
  cropper.dragStartY = event.clientY;
  cropper.startOffsetX = cropper.offsetX;
  cropper.startOffsetY = cropper.offsetY;
  cropElements.stage.setPointerCapture(event.pointerId);
}

function handleCropPointerMove(event) {
  if (!cropper.dragging || cropper.pointerId !== event.pointerId) return;
  cropper.offsetX = cropper.startOffsetX + event.clientX - cropper.dragStartX;
  cropper.offsetY = cropper.startOffsetY + event.clientY - cropper.dragStartY;
  clampCropOffset();
  renderCropper();
}

function handleCropPointerUp(event) {
  if (!cropper.dragging || cropper.pointerId !== event.pointerId) return;
  cropper.dragging = false;
  cropper.pointerId = null;
  if (cropElements.stage.hasPointerCapture(event.pointerId)) {
    cropElements.stage.releasePointerCapture(event.pointerId);
  }
}

function handleCropScaleChange() {
  cropper.scale = Number(cropElements.scaleInput.value) || 1;
  clampCropOffset();
  renderCropper();
}

function handleCropResize() {
  if (cropElements.modal.hidden || !cropper.image) return;
  configureCropFrame();
  fitCropImage();
  renderCropper();
}

function setCustomAsset(group, key, source) {
  if (group === "summary") {
    state.customTheme.summary = source;
    return;
  }
  if (!state.customTheme[group]) state.customTheme[group] = {};
  if (source) {
    state.customTheme[group][key] = source;
  } else {
    delete state.customTheme[group][key];
  }
}

function applyCrop() {
  if (!cropper.image) return;
  const frame = cropper.frame;
  const layout = getCropImageLayout();
  const canvas = document.createElement("canvas");
  canvas.width = cropper.outputWidth;
  canvas.height = cropper.outputHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    elements.settingsFeedback.textContent = "图片处理失败";
    return;
  }

  const sourceX = (frame.x - layout.left) / layout.scale;
  const sourceY = (frame.y - layout.top) / layout.scale;
  const sourceWidth = frame.width / layout.scale;
  const sourceHeight = frame.height / layout.scale;
  const previous = cropper.group === "summary"
    ? state.customTheme.summary
    : state.customTheme[cropper.group]?.[cropper.key] || "";

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(
    cropper.image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const quality = cropper.group === "tabs" ? 0.86 : 0.78;
  const source = canvas.toDataURL("image/jpeg", quality);
  setCustomAsset(cropper.group, cropper.key, source);

  try {
    saveCustomTheme();
  } catch {
    setCustomAsset(cropper.group, cropper.key, previous);
    elements.settingsFeedback.textContent = "图片太大，保存失败";
    return;
  }

  closeCropper();
  applyTheme("custom");
  elements.settingsFeedback.textContent = "自定义主题已更新";
}

function closeCropper() {
  const resolve = cropper.resolve;
  cropper.resolve = null;
  cropper.dragging = false;
  cropper.pointerId = null;
  cropper.image = null;
  cropper.source = "";
  cropElements.image.removeAttribute("src");
  cropElements.image.removeAttribute("style");
  cropElements.modal.hidden = true;
  document.body.classList.remove("is-cropping");
  if (resolve) resolve();
}

function handleCropKeyDown(event) {
  if (event.key === "Escape" && !cropElements.modal.hidden) {
    closeCropper();
  }
}

function today() {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const date = `${month}-${String(now.getDate()).padStart(2, "0")}`;
  return { month, date };
}

function normalizeBasePath(path) {
  const value = String(path || "").trim();
  if (!value || value === "/") return "";
  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

function withBasePath(path) {
  const cleanPath = String(path || "");
  if (/^https?:\/\//i.test(cleanPath)) return cleanPath;
  return `${BASE_PATH}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

function assetPath(path) {
  return withBasePath(path);
}

function money(value) {
  return Number(value || 0).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function apiHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  return headers;
}

const API_ERROR_MESSAGES = {
  not_found: "服务接口未找到，请重启应用后再试",
  expense_not_found: "没有找到这条记录，请返回明细后刷新再试",
  saving_not_found: "没有找到这条存钱记录，请返回后刷新再试",
  push_not_configured: "服务器还没有配置推送密钥",
  push_subscription_missing: "当前没有可用的推送订阅，请先开启通知",
  push_send_failed: "推送发送失败，请检查服务器网络和 VAPID 配置",
  invalid_push_subscription: "通知订阅信息无效，请重新开启通知",
  invalid_date: "日期不正确",
  invalid_amount: "金额不正确",
  invalid_category: "分类不存在，请检查分类设置",
  invalid_member: "记账人员不存在，请检查成员设置",
  invalid_json: "请求数据格式错误",
  invalid_import: "备份文件格式不正确",
  invalid_confirmation: "确认信息不正确",
  unauthorized: "未授权"
};

function apiErrorMessage(payload, response) {
  const code = payload?.error || "";
  return API_ERROR_MESSAGES[code] || code || response.statusText || "请求失败";
}

function urlBase64ToUint8Array(value) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }
  return output;
}

function notificationSupport() {
  const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { supported: false, standalone, message: "当前浏览器不支持网页推送" };
  }
  if (isIos && !standalone) {
    return { supported: false, standalone, message: "iOS 需要先添加到主屏幕后再开启推送" };
  }
  return { supported: true, standalone, message: "" };
}

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(withBasePath(path), {
      ...options,
      headers: {
        ...apiHeaders(),
        ...(options.headers || {})
      }
    });
  } catch (error) {
    error.isNetworkError = true;
    throw error;
  }

  if (response.status === 401) {
    const token = window.prompt("请输入服务器 LEDGER_TOKEN");
    if (!token) throw new Error("未授权");
    state.token = token.trim();
    localStorage.setItem("ledgerToken", state.token);
    return api(path, options);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(apiErrorMessage(payload, response));
  }

  return response.json();
}

function hideSuccessPopup() {
  if (!elements.successPopup) return;
  elements.successPopup.classList.remove("is-visible");
  successPopupTimer = window.setTimeout(() => {
    elements.successPopup.hidden = true;
  }, 180);
}

function showSuccessPopup(message) {
  if (!elements.successPopup) return;
  window.clearTimeout(successPopupTimer);
  elements.successPopupMessage.textContent = message;
  elements.successPopup.hidden = false;
  window.requestAnimationFrame(() => {
    elements.successPopup.classList.add("is-visible");
  });
  successPopupTimer = window.setTimeout(hideSuccessPopup, 1200);
}

function setView(view) {
  elements.tabs.forEach(tab => tab.classList.toggle("is-active", tab.dataset.view === view));
  Object.entries(elements.views).forEach(([name, element]) => {
    element.classList.toggle("is-active", name === view);
  });
}

function isValidDateValue(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function meterColor(percent) {
  if (percent >= 100) return "var(--red)";
  if (percent >= 80) return "var(--yellow)";
  return "var(--green)";
}

function categoryIcon(category, index = 0) {
  return category?.icon || CATEGORY_ICON_FALLBACKS[index % CATEGORY_ICON_FALLBACKS.length];
}

function formatDetailDate(dateString) {
  const parts = dateString.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return dateString;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const base = `${parts[1]}月${parts[2]}日 ${weekdays[date.getDay()]}`;
  return dateString === today().date ? `今天 · ${base}` : base;
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

function groupExpensesByDate(expenses) {
  const groups = [];
  const index = new Map();

  expenses.forEach(expense => {
    let group = index.get(expense.date);
    if (!group) {
      group = { date: expense.date, total: 0, items: [] };
      index.set(expense.date, group);
      groups.push(group);
    }
    group.items.push(expense);
    group.total = roundMoney(group.total + Number(expense.amount || 0));
  });

  return groups;
}

function applyOfflineQueueToState(baseState) {
  if (!baseState || !Array.isArray(baseState.expenses) || state.offlineQueue.length === 0) return baseState;

  const categoryMap = new Map(baseState.categories.map((category, index) => [
    category.id,
    { ...category, icon: categoryIcon(category, index) }
  ]));
  const deletedIds = new Set();
  const byId = new Map(baseState.expenses.map(expense => [expense.id, { ...expense }]));

  state.offlineQueue.forEach(item => {
    if (item.type === "delete") {
      deletedIds.add(item.expenseId);
      byId.delete(item.expenseId);
      return;
    }

    if (item.type === "create") {
      const expense = expenseFromPayload(
        item.localId,
        item.payload,
        baseState,
        item.queuedAt,
        item.lastError ? "failed-create" : "pending-create"
      );
      if (expense.date.startsWith(baseState.month)) byId.set(expense.id, expense);
      return;
    }

    if (item.type === "update") {
      if (deletedIds.has(item.expenseId)) return;
      const previous = byId.get(item.expenseId);
      const expense = expenseFromPayload(
        item.expenseId,
        item.payload,
        baseState,
        previous?.createdAt || item.queuedAt,
        item.lastError ? "failed-update" : "pending-update",
        previous
      );
      if (expense.date.startsWith(baseState.month)) {
        byId.set(expense.id, expense);
      } else {
        byId.delete(expense.id);
      }
    }
  });

  const expenses = Array.from(byId.values())
    .map(expense => enrichExpense(expense, categoryMap))
    .sort(sortExpenses);
  return rebuildStateFromExpenses(baseState, expenses);
}

function rebuildStateFromExpenses(baseState, expenses) {
  const categories = baseState.categories.map(category => {
    const spent = roundMoney(expenses
      .filter(expense => expense.categoryId === category.id)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0));
    const remaining = roundMoney(category.limit - spent);
    const percent = category.limit > 0 ? Math.min(999, Math.round((spent / category.limit) * 100)) : 0;
    const dailyRemaining = baseState.totals.remainingDays > 0 ? roundMoney(Math.max(remaining, 0) / baseState.totals.remainingDays) : 0;
    return { ...category, spent, remaining, percent, dailyRemaining };
  });
  const totals = recalculateTotals(baseState, categories, expenses);

  return { ...baseState, categories, expenses, totals };
}

function expenseFromPayload(id, payload, baseState, createdAt, syncStatus, previous = {}) {
  return {
    ...previous,
    id,
    date: payload.date,
    member: payload.member,
    categoryId: payload.categoryId,
    amount: payload.amount,
    note: payload.note || "",
    createdAt: createdAt || new Date().toISOString(),
    updatedAt: syncStatus === "pending-create" ? previous.updatedAt : new Date().toISOString(),
    syncStatus
  };
}

function enrichExpense(expense, categoryMap) {
  const category = categoryMap.get(expense.categoryId);
  return {
    ...expense,
    categoryName: category?.name || expense.categoryName || "未分类",
    categoryIcon: category?.icon || expense.categoryIcon || "🧾",
    categoryColor: category?.color || expense.categoryColor || "#777777"
  };
}

function sortExpenses(a, b) {
  if (a.date === b.date) return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
  return String(b.date || "").localeCompare(String(a.date || ""));
}

function recalculateTotals(baseState, categories, expenses) {
  const budget = roundMoney(categories.reduce((sum, category) => sum + Number(category.limit || 0), 0));
  const spent = roundMoney(expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0));
  const remaining = roundMoney(budget - spent);
  const elapsedDays = Number(baseState.totals.elapsedDays || 0);
  const daysInMonth = Number(baseState.totals.daysInMonth || 1);
  const remainingDays = Number(baseState.totals.remainingDays || 0);
  const expectedByToday = roundMoney((budget * elapsedDays) / Math.max(daysInMonth, 1));
  return {
    ...baseState.totals,
    budget,
    spent,
    remaining,
    percent: budget > 0 ? Math.min(999, Math.round((spent / budget) * 100)) : 0,
    dailyRemaining: remainingDays > 0 ? roundMoney(Math.max(remaining, 0) / remainingDays) : 0,
    expectedByToday,
    paceDelta: roundMoney(spent - expectedByToday)
  };
}

function monthParts(month) {
  const [year, monthNumber] = String(month || "").split("-").map(Number);
  return { year, monthNumber, monthIndex: monthNumber - 1 };
}

function addMonths(month, delta) {
  const { year, monthIndex } = monthParts(month);
  const date = new Date(year, monthIndex + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function recentMonths(month, count) {
  return Array.from({ length: count }, (_, index) => addMonths(month, index - count + 1));
}

async function loadTrendStates(month) {
  const months = recentMonths(month, 6);
  return Promise.all(months.map(item => api(`/api/state?month=${encodeURIComponent(item)}`)));
}

function replaceTrendState(nextState) {
  const optimisticState = applyOfflineQueueToState(nextState);
  const replaced = state.trendStates.map(item => item.month === optimisticState.month ? optimisticState : item);
  state.trendStates = replaced.some(item => item === optimisticState) ? replaced : [...replaced.slice(1), optimisticState];
  saveCachedTrendStates(optimisticState.month, state.trendStates);
  return optimisticState;
}

function monthLabel(month) {
  const { monthNumber } = monthParts(month);
  return `${monthNumber}月`;
}

function dateInMonth(month, day) {
  return `${month}-${String(day).padStart(2, "0")}`;
}

function compactMoney(value) {
  const number = Number(value || 0);
  if (Math.abs(number) >= 10000) return `${(number / 10000).toFixed(1)}万`;
  return number.toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: number >= 100 ? 0 : 1
  });
}

function calendarDayMap(expenses) {
  const map = new Map();
  expenses.forEach(expense => {
    const date = expense.date;
    if (!map.has(date)) map.set(date, { total: 0, items: [] });
    const day = map.get(date);
    day.items.push(expense);
    day.total = roundMoney(day.total + Number(expense.amount || 0));
  });
  return map;
}

function defaultStatsDate(dayMap) {
  const current = today();
  if (state.data.month === current.month) return current.date;
  return Array.from(dayMap.keys()).sort()[0] || `${state.data.month}-01`;
}

function weekdayLabel(dateString) {
  const parts = dateString.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return "";
  return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][new Date(parts[0], parts[1] - 1, parts[2]).getDay()];
}

function renderSummary() {
  const { totals } = state.data;
  elements.totalSpent.textContent = money(totals.spent);
  elements.totalBudget.textContent = `/ ${money(totals.budget)}`;
  elements.remainingAmount.textContent = money(totals.remaining);
  elements.dailyAmount.textContent = money(totals.dailyRemaining);
  elements.remainingDays.textContent = String(totals.remainingDays);
  elements.totalMeter.style.width = `${Math.min(totals.percent, 100)}%`;
  elements.totalMeter.style.background = meterColor(totals.percent);
  elements.exportLink.href = withBasePath(`/api/export.csv?month=${encodeURIComponent(state.data.month)}${state.token ? `&token=${encodeURIComponent(state.token)}` : ""}`);
  if (elements.jsonExportLink) {
    elements.jsonExportLink.href = withBasePath(`/api/export.json${state.token ? `?token=${encodeURIComponent(state.token)}` : ""}`);
  }
}

function budgetWarnings() {
  const warnings = [];
  const totalPercent = Number(state.data.totals.percent || 0);

  if (totalPercent >= 100) {
    warnings.push({
      level: "danger",
      title: "总预算已超支",
      detail: `已使用 ${totalPercent}%，超出 ${money(Math.abs(state.data.totals.remaining))}`
    });
  } else if (totalPercent >= 90) {
    warnings.push({
      level: "danger",
      title: "总预算接近上限",
      detail: `已使用 ${totalPercent}%，剩余 ${money(state.data.totals.remaining)}`
    });
  } else if (totalPercent >= 80) {
    warnings.push({
      level: "warning",
      title: "总预算使用较快",
      detail: `已使用 ${totalPercent}%，建议控制接下来几天的支出`
    });
  }

  const categoryWarnings = state.data.categories
    .filter(category => Number(category.percent || 0) >= 80)
    .sort((a, b) => Number(b.percent || 0) - Number(a.percent || 0));

  categoryWarnings.slice(0, 4).forEach(category => {
    const overBudget = Number(category.percent || 0) >= 100;
    warnings.push({
      level: overBudget ? "danger" : "warning",
      title: `${categoryIcon(category)} ${category.name}${overBudget ? "已超支" : "接近预算"}`,
      detail: overBudget
        ? `已用 ${category.percent}%，超出 ${money(Math.abs(category.remaining))}`
        : `已用 ${category.percent}%，剩余 ${money(category.remaining)}`
    });
  });

  if (categoryWarnings.length > 4) {
    warnings.push({
      level: "warning",
      title: `还有 ${categoryWarnings.length - 4} 个分类需要注意`,
      detail: "可在分类进度里查看完整预算状态"
    });
  }

  return warnings;
}

function renderBudgetWarnings() {
  if (!elements.budgetAlertPanel) return;

  const warnings = budgetWarnings();
  elements.budgetAlertPanel.hidden = warnings.length === 0;
  elements.budgetAlertPanel.classList.toggle("is-danger", warnings.some(item => item.level === "danger"));

  if (warnings.length === 0) {
    elements.budgetAlertList.innerHTML = "";
    elements.budgetAlertSummary.textContent = "";
    return;
  }

  const dangerCount = warnings.filter(item => item.level === "danger").length;
  elements.budgetAlertTitle.textContent = dangerCount > 0 ? "预算风险" : "预算提醒";
  elements.budgetAlertSummary.textContent = dangerCount > 0
    ? `${dangerCount} 项已超出或接近上限`
    : `${warnings.length} 项需要留意`;
  elements.budgetAlertList.innerHTML = "";

  warnings.forEach(warning => {
    const item = document.createElement("article");
    item.className = `budget-alert-item is-${warning.level}`;
    item.innerHTML = `
      <strong>${escapeHtml(warning.title)}</strong>
      <span>${escapeHtml(warning.detail)}</span>
    `;
    elements.budgetAlertList.appendChild(item);
  });
}

function renderCategories() {
  elements.categoryList.innerHTML = "";
  state.data.categories.forEach((category, index) => {
    const icon = categoryIcon(category, index);
    const card = document.createElement("article");
    card.className = "category-card";
    card.dataset.categoryId = category.id;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `查看${category.name}分类详情`);
    card.style.setProperty("--accent", category.color);
    card.innerHTML = `
      <div class="category-top">
        <div class="category-name">
          <span class="category-icon" aria-hidden="true">${escapeHtml(icon)}</span>
          <span>${escapeHtml(category.name)}</span>
        </div>
        <div class="category-amount">${money(category.spent)} / ${money(category.limit)}</div>
      </div>
      <div class="category-meter"><span style="width:${Math.min(category.percent, 100)}%; background:${meterColor(category.percent)}"></span></div>
      <div class="category-foot">
        <small>剩余 ${money(category.remaining)}</small>
        <small>日均 ${money(category.dailyRemaining)}</small>
        <small>${category.percent}%</small>
      </div>
    `;
    card.addEventListener("click", () => openDashboardCategory(category.id));
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDashboardCategory(category.id);
      }
    });
    elements.categoryList.appendChild(card);
  });
}

function openDashboardCategory(categoryId) {
  state.selectedDashboardCategoryId = categoryId;
  renderDashboardCategoryDetail();
  document.querySelector(".app-shell")?.scrollTo({ top: 0, behavior: "smooth" });
}

function closeDashboardCategory() {
  state.selectedDashboardCategoryId = null;
  renderDashboardCategoryDetail();
}

function dashboardCategoryExpenses(categoryId) {
  return state.data.expenses
    .filter(expense => expense.categoryId === categoryId)
    .slice()
    .sort((left, right) => {
      if (left.date !== right.date) return right.date.localeCompare(left.date);
      return String(right.createdAt || "").localeCompare(String(left.createdAt || ""));
    });
}

function renderDashboardCategoryDetail() {
  if (!elements.categoryDetailPane || !elements.dashboardMain) return;

  const category = state.data.categories.find(item => item.id === state.selectedDashboardCategoryId);
  elements.dashboardMain.hidden = Boolean(category);
  elements.categoryDetailPane.hidden = !category;

  if (!category) {
    state.selectedDashboardCategoryId = null;
    return;
  }

  const expenses = dashboardCategoryExpenses(category.id);
  const total = roundMoney(expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0));
  const percent = category.limit > 0 ? Math.min(999, Math.round((total / category.limit) * 100)) : 0;
  const remaining = roundMoney(Number(category.limit || 0) - total);
  const categoryIndex = state.data.categories.findIndex(item => item.id === category.id);
  const icon = categoryIcon(category, categoryIndex);

  elements.categoryDetailTitle.textContent = `${icon} ${category.name}`;
  elements.categoryDetailSummary.textContent = `${state.data.month} · ${expenses.length} 笔`;
  elements.categoryDetailBudget.innerHTML = `
    <div class="category-detail-budget-top">
      <div>
        <span>本月已花</span>
        <strong>${money(total)}</strong>
      </div>
      <div>
        <span>预算</span>
        <strong>${money(category.limit)}</strong>
      </div>
      <div>
        <span>剩余</span>
        <strong class="${remaining < 0 ? "is-up" : "is-down"}">${money(remaining)}</strong>
      </div>
    </div>
    <div class="category-meter"><span style="width:${Math.min(percent, 100)}%; background:${meterColor(percent)}"></span></div>
    <div class="category-detail-budget-foot">
      <small>使用 ${percent}%</small>
      <small>日均 ${money(category.dailyRemaining)}</small>
    </div>
  `;

  renderDashboardCategoryMembers(expenses, total);
  renderDashboardCategoryExpenses(expenses);
}

function renderDashboardCategoryMembers(expenses, total) {
  const memberNames = [
    ...state.data.members,
    ...expenses.map(expense => expense.member).filter(member => member && !state.data.members.includes(member))
  ];
  const uniqueMembers = Array.from(new Set(memberNames));
  elements.categoryDetailMemberSummary.textContent = `${uniqueMembers.length} 人`;
  elements.categoryDetailMemberList.innerHTML = "";

  uniqueMembers.forEach(member => {
    const memberExpenses = expenses.filter(expense => expense.member === member);
    const amount = roundMoney(memberExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0));
    const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
    const row = document.createElement("article");
    row.className = "category-member-row";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(member)}</strong>
        <small>${memberExpenses.length} 笔 · ${percent}%</small>
      </div>
      <em>${money(amount)}</em>
      <div class="category-member-meter" aria-hidden="true"><span style="width:${percent}%"></span></div>
    `;
    elements.categoryDetailMemberList.appendChild(row);
  });
}

function renderDashboardCategoryExpenses(expenses) {
  elements.categoryDetailExpenseSummary.textContent = `${expenses.length} 笔`;
  elements.categoryDetailExpenseList.innerHTML = "";

  const groups = groupExpensesByDate(expenses);
  if (groups.length === 0) {
    elements.categoryDetailExpenseList.innerHTML = `<div class="empty-state">这个分类本月还没有记录</div>`;
    return;
  }

  groups.forEach(group => {
    const card = document.createElement("article");
    card.className = "day-group category-detail-day";
    card.innerHTML = `
      <div class="day-group-head">
        <div>
          <div class="day-group-title">${escapeHtml(formatDetailDate(group.date))}</div>
          <div class="day-group-meta">${group.items.length} 笔</div>
        </div>
        <div class="day-total">合计 ${money(group.total)}</div>
      </div>
    `;

    const list = document.createElement("div");
    list.className = "day-items";
    group.items.forEach(expense => {
      const item = document.createElement("div");
      const statusLabel = syncStatusLabel(expense.syncStatus);
      item.className = `day-item day-item-button${statusLabel ? " is-pending-sync" : ""}`;
      item.tabIndex = 0;
      item.setAttribute("role", "button");
      item.setAttribute("aria-label", `查看${expense.member} ${money(expense.amount)}的记录详情`);
      item.innerHTML = `
        <div class="day-item-main">
          <div class="day-item-title">
            <span class="category-icon" aria-hidden="true">${escapeHtml(expense.categoryIcon || "🧾")}</span>
            <span>${escapeHtml(expense.member)}</span>
          </div>
          <div class="record-note${expense.note ? "" : " is-empty"}">${expense.note ? escapeHtml(expense.note) : "无备注"}</div>
        </div>
        <div class="day-item-side">
          <div class="recent-amount">-${money(expense.amount)}</div>
          ${statusLabel ? `<span class="sync-status-pill">${escapeHtml(statusLabel)}</span>` : ""}
          <span class="detail-chevron" aria-hidden="true">›</span>
        </div>
      `;
      item.addEventListener("click", () => {
        setView("details");
        openRecordDetail(expense.id);
      });
      item.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setView("details");
          openRecordDetail(expense.id);
        }
      });
      list.appendChild(item);
    });
    card.appendChild(list);
    elements.categoryDetailExpenseList.appendChild(card);
  });
}

function renderEntryControls() {
  if (!state.selectedCategoryId && state.data.categories[0]) {
    state.selectedCategoryId = state.data.categories[0].id;
  }
  if (!state.selectedMember && state.data.members[0]) {
    state.selectedMember = state.data.members[0];
  }

  elements.categoryChips.innerHTML = "";
  state.data.categories.forEach((category, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${state.selectedCategoryId === category.id ? " is-active" : ""}`;
    button.innerHTML = `
      <span class="category-icon" aria-hidden="true">${escapeHtml(categoryIcon(category, index))}</span>
      <span>${escapeHtml(category.name)}</span>
    `;
    button.addEventListener("click", () => {
      state.selectedCategoryId = category.id;
      renderEntryControls();
    });
    elements.categoryChips.appendChild(button);
  });

  elements.memberChips.innerHTML = "";
  state.data.members.forEach(member => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `member-chip${state.selectedMember === member ? " is-active" : ""}`;
    button.textContent = member;
    button.addEventListener("click", () => {
      state.selectedMember = member;
      renderEntryControls();
    });
    elements.memberChips.appendChild(button);
  });

  renderEntrySubmitBar();
}

function renderEntrySubmitBar() {
  if (!elements.entrySubmitAmount || !elements.entrySubmitMeta || !state.data) return;
  const rawAmount = Number(String(elements.amountInput.value).replace(",", "."));
  const amount = roundMoney(rawAmount);
  const category = state.data.categories.find(item => item.id === state.selectedCategoryId);
  const member = state.selectedMember || "未选成员";
  const dateLabel = formatEntryDateLabel(elements.dateInput.value);

  elements.entrySubmitAmount.textContent = Number.isFinite(amount) && amount > 0
    ? `¥${money(amount)}`
    : "待填写金额";
  elements.entrySubmitMeta.textContent = `${category ? `${categoryIcon(category)} ${category.name}` : "未选分类"} · ${member} · ${dateLabel}`;
}

function formatEntryDateLabel(dateValue) {
  if (!dateValue) return "未选日期";
  if (dateValue === today().date) return "今天";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (!match) return dateValue;
  return `${Number(match[2])}月${Number(match[3])}日`;
}

function renderEntryTemplates() {
  elements.templateList.innerHTML = "";

  if (state.entryTemplates.length === 0) {
    elements.templateList.innerHTML = `<div class="template-empty">暂无模板</div>`;
    return;
  }

  state.entryTemplates.forEach(template => {
    const category = state.data.categories.find(item => item.id === template.categoryId);
    const title = template.note || category?.name || "常用支出";
    const item = document.createElement("div");
    item.className = "template-item";
    item.innerHTML = `
      <button class="template-apply" type="button" data-template-id="${escapeAttribute(template.id)}">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(category ? categoryIcon(category) : "🧾")} ${money(template.amount)} · ${escapeHtml(template.member)}</span>
      </button>
      <button class="template-delete" type="button" data-template-delete="${escapeAttribute(template.id)}" aria-label="删除${escapeAttribute(title)}模板">×</button>
    `;
    elements.templateList.appendChild(item);
  });
}

function renderDetailFilters() {
  if (elements.detailSearchInput.value !== state.detailFilters.query) {
    elements.detailSearchInput.value = state.detailFilters.query;
  }

  if (!state.data.categories.some(category => category.id === state.detailFilters.categoryId)) {
    state.detailFilters.categoryId = "";
  }
  if (!state.data.members.includes(state.detailFilters.member)) {
    state.detailFilters.member = "";
  }

  elements.detailCategoryFilter.innerHTML = "";
  elements.detailCategoryFilter.appendChild(option("全部分类", "", state.detailFilters.categoryId));
  state.data.categories.forEach((category, index) => {
    elements.detailCategoryFilter.appendChild(
      option(`${categoryIcon(category, index)} ${category.name}`, category.id, state.detailFilters.categoryId)
    );
  });

  elements.detailMemberFilter.innerHTML = "";
  elements.detailMemberFilter.appendChild(option("全部成员", "", state.detailFilters.member));
  state.data.members.forEach(member => {
    elements.detailMemberFilter.appendChild(option(member, member, state.detailFilters.member));
  });

  elements.detailFilterStatus.textContent = hasDetailFilters() ? "已启用" : "未启用";
}

function hasDetailFilters() {
  return Boolean(
    state.detailFilters.query.trim() ||
    state.detailFilters.categoryId ||
    state.detailFilters.member
  );
}

function detailSearchText(expense) {
  return [
    expense.date,
    expense.member,
    expense.categoryName,
    expense.note,
    money(expense.amount),
    String(expense.amount || "")
  ].join(" ").toLowerCase();
}

function syncStatusLabel(status) {
  const labels = {
    "pending-create": "待同步新增",
    "pending-update": "待同步修改",
    "failed-create": "新增失败",
    "failed-update": "修改失败"
  };
  return labels[status] || "";
}

function filteredExpenses(expenses) {
  const query = state.detailFilters.query.trim().toLowerCase();
  return expenses.filter(expense => {
    if (state.detailFilters.categoryId && expense.categoryId !== state.detailFilters.categoryId) return false;
    if (state.detailFilters.member && expense.member !== state.detailFilters.member) return false;
    if (query && !detailSearchText(expense).includes(query)) return false;
    return true;
  });
}

function renderRecent() {
  elements.recentList.innerHTML = "";
  const groups = groupExpensesByDate(filteredExpenses(state.data.expenses).slice());

  if (groups.length === 0) {
    elements.recentList.innerHTML = `<div class="empty-state">${hasDetailFilters() ? "没有符合筛选的记录" : "本月还没有记录"}</div>`;
    return;
  }

  groups.forEach(group => {
    const card = document.createElement("article");
    card.className = "day-group";

    const head = document.createElement("div");
    head.className = "day-group-head";
    head.innerHTML = `
      <div>
        <div class="day-group-title">${escapeHtml(formatDetailDate(group.date))}</div>
        <div class="day-group-meta">${group.items.length} 笔</div>
      </div>
      <div class="day-total">合计 ${money(group.total)}</div>
    `;
    card.appendChild(head);

    const list = document.createElement("div");
    list.className = "day-items";

    group.items.forEach(expense => {
      const item = document.createElement("div");
      const statusLabel = syncStatusLabel(expense.syncStatus);
      item.className = `day-item day-item-button${statusLabel ? " is-pending-sync" : ""}`;
      item.dataset.expenseId = expense.id;
      item.tabIndex = 0;
      item.setAttribute("role", "button");
      item.setAttribute("aria-label", `查看${expense.categoryName} ${money(expense.amount)}的记录详情`);
      item.style.setProperty("--accent", expense.categoryColor || "#27845b");
      item.innerHTML = `
        <div class="day-item-main">
          <div class="day-item-title">
            <span class="category-icon" aria-hidden="true">${escapeHtml(expense.categoryIcon || "🧾")}</span>
            <span>${escapeHtml(expense.categoryName)}</span>
          </div>
          <div class="record-note${expense.note ? "" : " is-empty"}">${expense.note ? escapeHtml(expense.note) : "无备注"}</div>
        </div>
        <div class="day-item-side">
          <div class="recent-amount">-${money(expense.amount)}</div>
          ${statusLabel ? `<span class="sync-status-pill">${escapeHtml(statusLabel)}</span>` : ""}
          <span class="record-member-pill">${escapeHtml(expense.member)}</span>
          <span class="detail-chevron" aria-hidden="true">›</span>
        </div>
      `;
      item.addEventListener("click", () => openRecordDetail(expense.id));
      item.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openRecordDetail(expense.id);
        }
      });
      list.appendChild(item);
    });

    card.appendChild(list);
    elements.recentList.appendChild(card);
  });
}

function openRecordDetail(id) {
  state.selectedExpenseId = id;
  renderRecordDetail();
  elements.recordAmountInput.focus();
}

function showRecordList() {
  state.selectedExpenseId = null;
  elements.detailListPane.hidden = false;
  elements.recordDetailForm.hidden = true;
  elements.recordFeedback.textContent = "";
}

function option(label, value, selectedValue) {
  const item = document.createElement("option");
  item.value = value;
  item.textContent = label;
  item.selected = value === selectedValue;
  return item;
}

function renderRecordDetail() {
  if (!state.selectedExpenseId) {
    showRecordList();
    return;
  }

  const expense = state.data.expenses.find(item => item.id === state.selectedExpenseId);
  if (!expense) {
    showRecordList();
    return;
  }

  elements.detailListPane.hidden = true;
  elements.recordDetailForm.hidden = false;
  elements.recordCreatedAt.textContent = formatDateTime(expense.createdAt);
  elements.recordAmountInput.value = expense.amount;
  elements.recordDateInput.value = expense.date;
  elements.recordNoteInput.value = expense.note || "";
  elements.recordFeedback.textContent = syncStatusLabel(expense.syncStatus);

  elements.recordCategorySelect.innerHTML = "";
  state.data.categories.forEach((category, index) => {
    elements.recordCategorySelect.appendChild(
      option(`${categoryIcon(category, index)} ${category.name}`, category.id, expense.categoryId)
    );
  });

  elements.recordMemberSelect.innerHTML = "";
  const memberOptions = state.data.members.includes(expense.member)
    ? state.data.members
    : [expense.member, ...state.data.members];
  memberOptions.forEach(member => {
    elements.recordMemberSelect.appendChild(option(member, member, expense.member));
  });
}

function collectRecordDetail() {
  return {
    amount: Number(String(elements.recordAmountInput.value).replace(",", ".")),
    categoryId: elements.recordCategorySelect.value,
    member: elements.recordMemberSelect.value,
    date: elements.recordDateInput.value,
    note: elements.recordNoteInput.value
  };
}

function renderCalendar(dayMap) {
  const { year, monthNumber, monthIndex } = monthParts(state.data.month);
  const days = new Date(year, monthNumber, 0).getDate();
  const leadingBlanks = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const currentDate = today().date;

  elements.calendarMonthLabel.textContent = `${year}年${monthNumber}月`;
  elements.calendarGrid.innerHTML = "";

  for (let index = 0; index < leadingBlanks; index += 1) {
    const blank = document.createElement("span");
    blank.className = "calendar-blank";
    elements.calendarGrid.appendChild(blank);
  }

  for (let day = 1; day <= days; day += 1) {
    const date = dateInMonth(state.data.month, day);
    const info = dayMap.get(date);
    const hasExpense = Boolean(info?.items.length);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `calendar-day${hasExpense ? " has-expense" : ""}${state.selectedStatsDate === date ? " is-selected" : ""}${currentDate === date ? " is-today" : ""}`;
    button.dataset.calendarDate = date;
    button.setAttribute("aria-pressed", String(state.selectedStatsDate === date));
    button.setAttribute("aria-label", `${date} 消费 ${money(info?.total || 0)}`);
    button.innerHTML = `
      <span class="calendar-day-number">${day}</span>
      <strong>${hasExpense ? compactMoney(info.total) : "0"}</strong>
      <small>${hasExpense ? `${info.items.length} 笔` : "无"}</small>
    `;
    elements.calendarGrid.appendChild(button);
  }
}

function renderSelectedDayDetails(dayMap) {
  const info = dayMap.get(state.selectedStatsDate) || { total: 0, items: [] };
  elements.selectedDayTitle.textContent = formatDetailDate(state.selectedStatsDate);
  elements.selectedDayTotal.textContent = `合计 ${money(info.total)}`;
  elements.selectedDayList.innerHTML = "";

  if (info.items.length === 0) {
    elements.selectedDayList.innerHTML = `<div class="empty-state">当天没有消费记录</div>`;
    return;
  }

  info.items.forEach(expense => {
    const statusLabel = syncStatusLabel(expense.syncStatus);
    const item = document.createElement("div");
    item.className = `calendar-expense${statusLabel ? " is-pending-sync" : ""}`;
    item.style.setProperty("--accent", expense.categoryColor || "#27845b");
    item.innerHTML = `
      <div class="day-item-main">
        <div class="day-item-title">
          <span class="category-icon" aria-hidden="true">${escapeHtml(expense.categoryIcon || "🧾")}</span>
          <span>${escapeHtml(expense.categoryName)}</span>
        </div>
        <div class="recent-meta">${escapeHtml(expense.member)}${expense.note ? ` · ${escapeHtml(expense.note)}` : ""}${statusLabel ? ` · ${escapeHtml(statusLabel)}` : ""}</div>
      </div>
      <strong class="calendar-expense-amount">-${money(expense.amount)}</strong>
    `;
    elements.selectedDayList.appendChild(item);
  });
}

function memberTotalsFor(expenses) {
  const totals = new Map(state.data.members.map(member => [member, 0]));
  expenses.forEach(expense => {
    totals.set(expense.member, roundMoney((totals.get(expense.member) || 0) + Number(expense.amount || 0)));
  });
  return totals;
}

function renderMonthlyTrend() {
  const states = state.trendStates.length ? state.trendStates : [state.data];
  const totals = states.map(item => item.totals.spent);
  const max = Math.max(...totals, 1);
  const current = states[states.length - 1] || state.data;
  const previous = states[states.length - 2];
  const total = roundMoney(totals.reduce((sum, amount) => sum + amount, 0));
  const average = states.length > 0 ? roundMoney(total / states.length) : 0;
  const delta = previous ? roundMoney(current.totals.spent - previous.totals.spent) : 0;
  const deltaText = delta > 0 ? `多花 ${money(delta)}` : delta < 0 ? `少花 ${money(Math.abs(delta))}` : "持平";

  elements.trendRangeLabel.textContent = states.length > 1
    ? `${states[0].month} - ${current.month}`
    : current.month;
  elements.monthDeltaAmount.textContent = previous ? `${delta > 0 ? "+" : delta < 0 ? "-" : ""}${money(Math.abs(delta))}` : "-";
  elements.monthDeltaAmount.classList.toggle("is-up", delta > 0);
  elements.monthDeltaAmount.classList.toggle("is-down", delta < 0);
  elements.monthDeltaLabel.textContent = previous ? `比 ${monthLabel(previous.month)} ${deltaText}` : "暂无上月数据";
  elements.sixMonthAverage.textContent = money(average);
  elements.sixMonthTotal.textContent = `合计 ${money(total)}`;

  elements.monthlyTrendList.innerHTML = "";
  states.forEach(item => {
    const percent = Math.max(4, Math.round((item.totals.spent / max) * 100));
    const row = document.createElement("div");
    row.className = "monthly-trend-row";
    row.innerHTML = `
      <span>${escapeHtml(monthLabel(item.month))}</span>
      <div class="trend-track"><span style="width:${percent}%"></span></div>
      <strong>${money(item.totals.spent)}</strong>
    `;
    elements.monthlyTrendList.appendChild(row);
  });
}

function renderMemberCompare() {
  const totals = memberTotalsFor(state.data.expenses);
  const max = Math.max(...Array.from(totals.values()), 1);
  elements.memberCompareLabel.textContent = state.data.month;
  elements.memberCompareList.innerHTML = "";

  state.data.members.forEach(member => {
    const amount = totals.get(member) || 0;
    const percent = Math.max(amount > 0 ? 5 : 0, Math.round((amount / max) * 100));
    const row = document.createElement("div");
    row.className = "member-compare-row";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(member)}</strong>
        <span>${money(amount)}</span>
      </div>
      <div class="trend-track"><span style="width:${percent}%"></span></div>
    `;
    elements.memberCompareList.appendChild(row);
  });
}

function renderCategoryCompare() {
  const states = state.trendStates.length ? state.trendStates : [state.data];
  const current = states[states.length - 1] || state.data;
  const previous = states[states.length - 2];
  const previousCategories = new Map((previous?.categories || []).map(category => [category.id, category]));
  const categories = current.categories
    .slice()
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  elements.categoryCompareList.innerHTML = "";
  if (categories.length === 0) {
    elements.categoryCompareList.innerHTML = `<div class="empty-state">暂无分类</div>`;
    return;
  }

  categories.forEach(category => {
    const previousSpent = previousCategories.get(category.id)?.spent || 0;
    const delta = roundMoney(category.spent - previousSpent);
    const deltaLabel = previous ? (delta > 0 ? `+${money(delta)}` : delta < 0 ? `-${money(Math.abs(delta))}` : "持平") : "暂无上月";
    const row = document.createElement("div");
    row.className = "category-compare-row";
    row.style.setProperty("--accent", category.color || "#27845b");
    row.innerHTML = `
      <span class="category-icon" aria-hidden="true">${escapeHtml(categoryIcon(category))}</span>
      <div>
        <strong>${escapeHtml(category.name)}</strong>
        <small>本月 ${money(category.spent)} · 上月 ${money(previousSpent)}</small>
      </div>
      <em class="${delta > 0 ? "is-up" : delta < 0 ? "is-down" : ""}">${escapeHtml(deltaLabel)}</em>
    `;
    elements.categoryCompareList.appendChild(row);
  });
}

function renderStats() {
  const expenses = state.data.expenses;
  const dayMap = calendarDayMap(expenses);
  const activeDates = new Set(expenses.map(expense => expense.date));
  const activeDayCount = activeDates.size;
  const averageDailySpend = state.data.totals.elapsedDays > 0 ? state.data.totals.spent / state.data.totals.elapsedDays : 0;
  const topCategory = state.data.categories.slice().sort((a, b) => b.spent - a.spent)[0];

  if (!state.selectedStatsDate || !state.selectedStatsDate.startsWith(`${state.data.month}-`)) {
    state.selectedStatsDate = defaultStatsDate(dayMap);
  }

  elements.avgDailySpend.textContent = money(averageDailySpend);
  elements.topCategoryName.textContent = topCategory && topCategory.spent > 0
    ? `${categoryIcon(topCategory)} ${topCategory.name}`
    : "-";
  elements.topCategoryAmount.textContent = topCategory ? money(topCategory.spent) : "0.00";
  elements.recordCount.textContent = String(expenses.length);
  elements.activeDays.textContent = String(activeDayCount);
  renderMonthlyTrend();
  renderMemberCompare();
  renderCategoryCompare();
  renderCalendar(dayMap);
  renderSelectedDayDetails(dayMap);

  const ranks = state.data.categories
    .slice()
    .sort((a, b) => b.spent - a.spent)
    .map(category => ({ label: category.name, amount: category.spent, color: category.color, icon: categoryIcon(category) }));
  renderRankList(ranks);
}

function renderRankList(items) {
  elements.rankList.innerHTML = "";
  if (items.length === 0) {
    elements.rankList.innerHTML = `<div class="empty-state">暂无分类</div>`;
    return;
  }

  items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "rank-row";
    row.style.setProperty("--accent", item.color || "#27845b");
    row.innerHTML = `
      <span class="rank-index">${index + 1}</span>
      <span class="category-icon" aria-hidden="true">${escapeHtml(item.icon || "🧾")}</span>
      <span class="rank-name">${escapeHtml(item.label)}</span>
      <strong>${money(item.amount)}</strong>
    `;
    elements.rankList.appendChild(row);
  });
}

const SAVINGS_SHARED_LABEL = "共同";
const SAVINGS_SHARED_VALUE = "";

function savingMemberOptions() {
  return [
    { value: SAVINGS_SHARED_VALUE, label: SAVINGS_SHARED_LABEL },
    ...state.data.members.map(member => ({ value: member, label: member }))
  ];
}

function savingMemberLabel(member) {
  return member && state.data.members.includes(member) ? member : SAVINGS_SHARED_LABEL;
}

function renderSavingsSummary() {
  if (!elements.savingsTotalAll || !state.data?.savings) return;
  const totals = state.data.savings.totals;
  elements.savingsTotalAll.textContent = money(totals.all);
  const monthLabelText = totals.month > 0
    ? `本月 +${money(totals.month)}`
    : "本月 +0.00";
  elements.savingsMonthDelta.textContent = monthLabelText;
}

function renderSavingsMembers() {
  if (!elements.savingsMemberList || !state.data?.savings) return;
  const totals = state.data.savings.totals;
  const entries = savingMemberOptions().map(option => ({
    label: option.label,
    member: option.value,
    amount: Number(totals.byMember?.[option.value || SAVINGS_SHARED_LABEL] || 0)
  }));

  elements.savingsMemberSummary.textContent = `本月 ${totals.monthCount} 笔 · 合计 ${money(totals.month)}`;
  elements.savingsMemberList.innerHTML = "";

  const max = Math.max(...entries.map(item => item.amount), 1);
  entries.forEach(entry => {
    const percent = Math.max(entry.amount > 0 ? 6 : 0, Math.round((entry.amount / max) * 100));
    const row = document.createElement("article");
    row.className = "savings-member-row";
    row.innerHTML = `
      <div class="savings-member-row-head">
        <strong>${escapeHtml(entry.label)}</strong>
        <em>${money(entry.amount)}</em>
      </div>
      <div class="trend-track"><span style="width:${percent}%"></span></div>
    `;
    elements.savingsMemberList.appendChild(row);
  });
}

function renderSavingMemberChips() {
  if (!elements.savingMemberChips) return;
  const options = savingMemberOptions();
  if (state.savingMember == null || !options.some(item => item.value === state.savingMember)) {
    state.savingMember = SAVINGS_SHARED_VALUE;
  }

  elements.savingMemberChips.innerHTML = "";
  options.forEach(option => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `member-chip${state.savingMember === option.value ? " is-active" : ""}`;
    button.textContent = option.label;
    button.addEventListener("click", () => {
      state.savingMember = option.value;
      renderSavingMemberChips();
      renderSavingSubmitBar();
    });
    elements.savingMemberChips.appendChild(button);
  });
}

function renderSavingSubmitBar() {
  if (!elements.savingSubmitAmount || !state.data) return;
  const rawAmount = Number(String(elements.savingAmountInput.value).replace(",", "."));
  const amount = roundMoney(rawAmount);
  const memberLabel = savingMemberLabel(state.savingMember);
  const dateLabel = formatEntryDateLabel(elements.savingDateInput.value);
  elements.savingSubmitAmount.textContent = Number.isFinite(amount) && amount > 0
    ? `+¥${money(amount)}`
    : "待填写金额";
  elements.savingSubmitMeta.textContent = `${memberLabel} · ${dateLabel}`;
}

function renderSavingsList() {
  if (!elements.savingsList || !state.data?.savings) return;
  const items = state.data.savings.items || [];
  const monthItems = items.filter(item => String(item.date || "").startsWith(state.data.month));
  elements.savingsListSummary.textContent = `本月 ${monthItems.length} 笔`;
  elements.savingsList.innerHTML = "";

  if (monthItems.length === 0) {
    elements.savingsList.innerHTML = `<div class="empty-state">本月还没有存钱记录</div>`;
    return;
  }

  const groups = groupExpensesByDate(monthItems);
  groups.forEach(group => {
    const card = document.createElement("article");
    card.className = "day-group";

    const head = document.createElement("div");
    head.className = "day-group-head";
    head.innerHTML = `
      <div>
        <div class="day-group-title">${escapeHtml(formatDetailDate(group.date))}</div>
        <div class="day-group-meta">${group.items.length} 笔</div>
      </div>
      <div class="day-total">合计 ${money(group.total)}</div>
    `;
    card.appendChild(head);

    const list = document.createElement("div");
    list.className = "day-items";

    group.items.forEach(item => {
      const node = document.createElement("div");
      node.className = "day-item day-item-button";
      node.dataset.savingId = item.id;
      node.tabIndex = 0;
      node.setAttribute("role", "button");
      node.setAttribute("aria-label", `查看${savingMemberLabel(item.member)} ${money(item.amount)} 的存钱记录`);
      node.style.setProperty("--accent", "#27845b");
      node.innerHTML = `
        <div class="day-item-main">
          <div class="day-item-title">
            <span class="category-icon" aria-hidden="true">💰</span>
            <span>${escapeHtml(savingMemberLabel(item.member))}</span>
          </div>
          <div class="record-note${item.note ? "" : " is-empty"}">${item.note ? escapeHtml(item.note) : "无备注"}</div>
        </div>
        <div class="day-item-side">
          <div class="recent-amount savings-amount-positive">+${money(item.amount)}</div>
          <span class="detail-chevron" aria-hidden="true">›</span>
        </div>
      `;
      const open = () => openSavingDetail(item.id);
      node.addEventListener("click", open);
      node.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });
      list.appendChild(node);
    });

    card.appendChild(list);
    elements.savingsList.appendChild(card);
  });
}

function renderSavings() {
  if (!state.data?.savings) return;
  renderSavingsSummary();
  renderSavingsMembers();
  renderSavingMemberChips();
  renderSavingSubmitBar();
  renderSavingsList();
  renderSavingDetail();
}

function showSavingsList() {
  state.selectedSavingId = null;
  if (elements.savingsListPane) elements.savingsListPane.hidden = false;
  if (elements.savingDetailForm) elements.savingDetailForm.hidden = true;
  if (elements.savingDetailFeedback) elements.savingDetailFeedback.textContent = "";
}

function openSavingDetail(id) {
  state.selectedSavingId = id;
  renderSavingDetail();
  elements.savingDetailAmountInput?.focus();
}

function renderSavingDetail() {
  if (!elements.savingDetailForm || !elements.savingsListPane) return;
  if (!state.selectedSavingId) {
    showSavingsList();
    return;
  }

  const item = state.data?.savings?.items?.find(saving => saving.id === state.selectedSavingId);
  if (!item) {
    showSavingsList();
    return;
  }

  elements.savingsListPane.hidden = true;
  elements.savingDetailForm.hidden = false;
  elements.savingCreatedAt.textContent = formatDateTime(item.createdAt);
  elements.savingDetailAmountInput.value = item.amount;
  elements.savingDetailDateInput.value = item.date;
  elements.savingDetailNoteInput.value = item.note || "";
  elements.savingDetailFeedback.textContent = "";

  elements.savingDetailMemberSelect.innerHTML = "";
  savingMemberOptions().forEach(opt => {
    elements.savingDetailMemberSelect.appendChild(option(opt.label, opt.value, item.member || ""));
  });
}

function collectSavingPayload(amountInput, member, dateInput, noteInput) {
  const amount = roundMoney(Number(String(amountInput.value).replace(",", ".")));
  const date = dateInput.value;
  const note = noteInput.value.trim().slice(0, 80);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("金额不正确");
  }
  if (!isValidDateValue(date)) {
    throw new Error("日期不正确");
  }
  if (member && !state.data.members.includes(member)) {
    throw new Error("成员不存在");
  }

  return { amount, date, note, member: member || "" };
}

async function submitSaving(event) {
  event.preventDefault();
  elements.savingFeedback.textContent = "提交中...";
  try {
    const payload = collectSavingPayload(
      elements.savingAmountInput,
      state.savingMember,
      elements.savingDateInput,
      elements.savingNoteInput
    );
    const result = await api(`/api/savings?month=${encodeURIComponent(state.data.month)}`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    state.data = result.state;
    replaceTrendState(result.state);
    elements.savingAmountInput.value = "";
    elements.savingNoteInput.value = "";
    elements.savingFeedback.textContent = `本月共存 ${money(state.data.savings.totals.month)} · 累计 ${money(state.data.savings.totals.all)}`;
    render();
    showSuccessPopup("存钱成功");
  } catch (error) {
    elements.savingFeedback.textContent = error.isNetworkError ? "网络不可用，请稍后再试" : error.message;
  }
}

async function saveSavingDetail(event) {
  event.preventDefault();
  if (!state.selectedSavingId) return;
  elements.savingDetailFeedback.textContent = "保存中...";
  try {
    const payload = collectSavingPayload(
      elements.savingDetailAmountInput,
      elements.savingDetailMemberSelect.value,
      elements.savingDetailDateInput,
      elements.savingDetailNoteInput
    );
    const result = await api(`/api/savings/${encodeURIComponent(state.selectedSavingId)}?month=${encodeURIComponent(state.data.month)}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    state.data = result.state;
    replaceTrendState(result.state);
    state.selectedSavingId = null;
    render();
    showSuccessPopup("保存成功");
  } catch (error) {
    elements.savingDetailFeedback.textContent = error.isNetworkError ? "网络不可用，请稍后再试" : error.message;
  }
}

async function deleteSelectedSaving() {
  if (!state.selectedSavingId) return;
  if (!window.confirm("删除这条存钱记录？")) return;
  try {
    const result = await api(`/api/savings/${encodeURIComponent(state.selectedSavingId)}?month=${encodeURIComponent(state.data.month)}`, {
      method: "DELETE"
    });
    state.data = result.state;
    replaceTrendState(result.state);
    state.selectedSavingId = null;
    render();
    showSuccessPopup("已删除");
  } catch (error) {
    elements.savingDetailFeedback.textContent = error.isNetworkError ? "网络不可用，请稍后再试" : error.message;
  }
}

function createMemberRow(member = "") {
  const row = document.createElement("div");
  row.className = "member-settings-row";
  row.innerHTML = `
    <label>
      <span>成员名称</span>
      <input class="member-name-input" value="${escapeAttribute(member)}" maxlength="12" required>
    </label>
    <button class="member-remove-button" type="button" aria-label="删除成员">删除</button>
  `;
  return row;
}

function renderSettings() {
  elements.memberRows.innerHTML = "";
  state.data.members.forEach(member => {
    elements.memberRows.appendChild(createMemberRow(member));
  });
  elements.budgetRows.innerHTML = "";

  state.data.categories.forEach((category, index) => {
    const row = document.createElement("div");
    row.className = "budget-row";
    row.dataset.id = category.id;
    row.style.setProperty("--accent", category.color);
    row.innerHTML = `
      <label>
        <span>分类</span>
        <input class="budget-name" value="${escapeAttribute(category.name)}" maxlength="20" required>
      </label>
      <label>
        <span>额度</span>
        <input class="budget-limit" value="${category.limit}" inputmode="decimal" required>
      </label>
      <label>
        <span>颜色</span>
        <input class="budget-color" type="color" value="${category.color}">
      </label>
      <label>
        <span>图标</span>
        <input class="budget-icon" value="${escapeAttribute(categoryIcon(category, index))}" maxlength="4" aria-label="${escapeAttribute(category.name)}图标">
      </label>
    `;
    elements.budgetRows.appendChild(row);
  });
  renderNotificationSettings();
}

function renderNotificationSettings() {
  if (!elements.notificationStatusTitle) return;

  const support = notificationSupport();
  const status = state.notificationStatus;
  const preferences = status?.preferences || {
    pushEnabled: false,
    budgetAlertsEnabled: true,
    dailyReminderEnabled: false,
    dailyReminderTime: "21:30"
  };
  const permission = "Notification" in window ? Notification.permission : "default";
  const isEnabled = Boolean(preferences.pushEnabled && permission === "granted" && status?.subscriptionCount > 0);

  const noticeText = !support.supported
    ? support.message
    : status?.configured === false
      ? "服务器还没有配置 VAPID 推送密钥"
      : "";
  elements.notificationNotice.hidden = !noticeText;
  elements.notificationNotice.textContent = noticeText;

  elements.notificationStatusTitle.textContent = isEnabled ? "通知已开启" : "通知未开启";
  elements.notificationStatusText.textContent = isEnabled
    ? `已绑定 ${status.subscriptionCount} 台设备`
    : permission === "denied"
      ? "系统已拒绝通知权限，需要在浏览器或系统设置中重新允许"
      : "开启后可接收预算和每日记账提醒";

  elements.budgetPushToggle.checked = Boolean(preferences.budgetAlertsEnabled);
  elements.dailyReminderToggle.checked = Boolean(preferences.dailyReminderEnabled);
  elements.dailyReminderTimeInput.value = preferences.dailyReminderTime || "21:30";

  const canUsePush = support.supported && Boolean(status?.configured) && permission !== "denied";
  elements.enablePushButton.disabled = !canUsePush || isEnabled;
  elements.testPushButton.disabled = !isEnabled;
  elements.disablePushButton.disabled = !isEnabled;
  elements.saveNotificationSettingsButton.disabled = !Boolean(status?.configured);
}

async function refreshNotificationStatus() {
  if (!elements.notificationStatusTitle) return;
  try {
    state.notificationStatus = await api("/api/notifications/status");
    renderNotificationSettings();
  } catch {
    renderNotificationSettings();
  }
}

async function serviceWorkerReady() {
  const registration = await navigator.serviceWorker.ready;
  return registration;
}

async function subscribePushNotifications() {
  elements.notificationStatusText.textContent = "正在开启通知...";

  const support = notificationSupport();
  if (!support.supported) throw new Error(support.message);
  if (state.notificationStatus?.configured === false) {
    throw new Error("服务器还没有配置推送密钥");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("没有获得通知权限");
  }

  const keyInfo = await api("/api/push/public-key");
  if (!keyInfo.configured || !keyInfo.publicKey) {
    throw new Error("服务器还没有配置推送密钥");
  }

  const registration = await serviceWorkerReady();
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyInfo.publicKey)
    });
  }

  state.notificationStatus = await api("/api/push/subscribe", {
    method: "POST",
    body: JSON.stringify({ subscription })
  });
  renderNotificationSettings();
  showSuccessPopup("通知已开启");
}

async function disablePushNotifications() {
  elements.notificationStatusText.textContent = "正在关闭通知...";
  let endpoint = "";

  if ("serviceWorker" in navigator) {
    const registration = await serviceWorkerReady().catch(() => null);
    const subscription = await registration?.pushManager.getSubscription();
    endpoint = subscription?.endpoint || "";
    if (subscription) await subscription.unsubscribe();
  }

  state.notificationStatus = await api("/api/push/unsubscribe", {
    method: "POST",
    body: JSON.stringify({ endpoint })
  });
  renderNotificationSettings();
  showSuccessPopup("通知已关闭");
}

function collectNotificationPreferences(pushEnabled = state.notificationStatus?.preferences?.pushEnabled) {
  return {
    pushEnabled: Boolean(pushEnabled),
    budgetAlertsEnabled: elements.budgetPushToggle.checked,
    dailyReminderEnabled: elements.dailyReminderToggle.checked,
    dailyReminderTime: elements.dailyReminderTimeInput.value || "21:30"
  };
}

async function saveNotificationSettings() {
  elements.notificationStatusText.textContent = "正在保存提醒设置...";
  state.notificationStatus = await api("/api/notifications/preferences", {
    method: "PUT",
    body: JSON.stringify(collectNotificationPreferences())
  });
  renderNotificationSettings();
  showSuccessPopup("提醒设置已保存");
}

async function sendTestPushNotification() {
  elements.notificationStatusText.textContent = "正在发送测试通知...";
  const result = await api("/api/push/test", { method: "POST", body: "{}" });
  if (result.status) state.notificationStatus = result.status;
  renderNotificationSettings();
  showSuccessPopup(result.sent > 0 ? "测试通知已发送" : "没有可用设备");
}

function render() {
  renderSummary();
  renderBudgetWarnings();
  renderCategories();
  renderDashboardCategoryDetail();
  renderEntryControls();
  renderEntryTemplates();
  renderOfflineQueueStatus();
  renderDetailFilters();
  renderRecent();
  renderRecordDetail();
  renderSavings();
  renderStats();
  renderSettings();
}

async function loadState() {
  const month = elements.monthInput.value || today().month;
  let states;
  try {
    states = await loadTrendStates(month);
    saveCachedTrendStates(month, states);
  } catch (error) {
    if (!error.isNetworkError) throw error;
    states = loadCachedTrendStates(month);
    if (!states) throw new Error("网络不可用，且本机没有可用的离线缓存");
  }
  state.trendStates = states.map(item => applyOfflineQueueToState(item));
  state.data = state.trendStates[state.trendStates.length - 1];
  elements.monthInput.value = state.data.month;
  const defaultDate = state.data.month === today().month ? state.data.today : `${state.data.month}-01`;
  elements.dateInput.value = defaultDate;
  if (elements.savingDateInput) elements.savingDateInput.value = defaultDate;
  render();
}

function collectExpensePayload() {
  const amount = roundMoney(Number(String(elements.amountInput.value).replace(",", ".")));
  const categoryId = state.selectedCategoryId;
  const member = state.selectedMember;
  const date = elements.dateInput.value;
  const note = elements.noteInput.value.trim().slice(0, 80);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("金额不正确");
  }
  if (!state.data.categories.some(category => category.id === categoryId)) {
    throw new Error("请选择分类");
  }
  if (!state.data.members.includes(member)) {
    throw new Error("请选择成员");
  }
  if (!isValidDateValue(date)) {
    throw new Error("日期不正确");
  }

  return { amount, categoryId, member, date, note };
}

async function syncOfflineQueue({ silent = false } = {}) {
  if (state.syncingOfflineQueue || state.offlineQueue.length === 0 || navigator.onLine === false) {
    renderOfflineQueueStatus();
    return { synced: 0, pending: state.offlineQueue.length };
  }

  state.syncingOfflineQueue = true;
  renderOfflineQueueStatus();

  let synced = 0;

  while (state.offlineQueue.length > 0) {
    const item = state.offlineQueue[0];
    try {
      await syncOfflineQueueItem(item);
      state.offlineQueue.shift();
      saveOfflineQueue();
      synced += 1;
    } catch (error) {
      item.attempts = Number(item.attempts || 0) + 1;
      item.lastError = error.isNetworkError ? "网络不可用" : error.message;
      saveOfflineQueue();
      break;
    }
  }

  state.syncingOfflineQueue = false;

  if (synced > 0) {
    await loadState().catch(() => {});
    if (!silent) showSuccessPopup(`已同步 ${synced} 笔`);
  }

  renderOfflineQueueStatus();
  return { synced, pending: state.offlineQueue.length };
}

async function syncOfflineQueueItem(item) {
  if (item.type === "create") {
    const result = await api("/api/expenses", {
      method: "POST",
      body: JSON.stringify(item.payload)
    });
    const serverId = result.expense?.id;
    if (serverId && item.localId) {
      replaceQueuedExpenseId(item.localId, serverId);
      if (state.selectedExpenseId === item.localId) state.selectedExpenseId = serverId;
    }
    return result;
  }

  if (item.type === "update") {
    return api(`/api/expenses/${encodeURIComponent(item.expenseId)}?month=${encodeURIComponent(item.month || state.data.month)}`, {
      method: "PUT",
      body: JSON.stringify(item.payload)
    });
  }

  if (item.type === "delete") {
    return api(`/api/expenses/${encodeURIComponent(item.expenseId)}?month=${encodeURIComponent(item.month || state.data.month)}`, {
      method: "DELETE"
    });
  }

  throw new Error("离线队列类型不正确");
}

function replaceQueuedExpenseId(localId, serverId) {
  state.offlineQueue.forEach(item => {
    if (item.expenseId === localId) item.expenseId = serverId;
    if (item.localId === localId) item.localId = serverId;
  });
  if (state.data) {
    state.data.expenses.forEach(expense => {
      if (expense.id === localId) expense.id = serverId;
    });
  }
  state.trendStates.forEach(trendState => {
    trendState.expenses?.forEach(expense => {
      if (expense.id === localId) expense.id = serverId;
    });
  });
}

async function submitExpense(event) {
  event.preventDefault();
  elements.entryFeedback.textContent = "提交中...";

  try {
    const payload = collectExpensePayload();
    const result = await api("/api/expenses", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    state.data = result.state;
    replaceTrendState(result.state);
    elements.monthInput.value = state.data.month;
    elements.amountInput.value = "";
    elements.noteInput.value = "";
    const category = state.data.categories.find(item => item.id === state.selectedCategoryId);
    elements.entryFeedback.textContent = category
      ? `${categoryIcon(category)} ${category.name} 剩余 ${money(category.remaining)}，日均 ${money(category.dailyRemaining)}`
      : "已提交";
    state.selectedExpenseId = null;
    render();
    showSuccessPopup("记账成功");
    setView("details");
  } catch (error) {
    if (error.isNetworkError) {
      try {
        const payload = collectExpensePayload();
        const localId = enqueueOfflineCreate(payload);
        applyOfflineCreate(localId, payload);
        elements.amountInput.value = "";
        elements.noteInput.value = "";
        elements.entryFeedback.textContent = `网络不可用，已加入待同步队列（${state.offlineQueue.length} 笔）`;
        render();
        showSuccessPopup("已离线保存");
        setView("details");
      } catch (validationError) {
        elements.entryFeedback.textContent = validationError.message;
      }
      return;
    }
    elements.entryFeedback.textContent = error.message;
  }
}

function applyOfflineCreate(localId, payload) {
  if (!state.data) return;
  const nextState = applyOfflineQueueToState(state.data);
  state.data = nextState;
  replaceTrendState(nextState);
}

function collectCurrentTemplate() {
  const amount = Number(String(elements.amountInput.value).replace(",", "."));
  const categoryId = state.selectedCategoryId;
  const member = state.selectedMember;
  const note = elements.noteInput.value.trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("先填一个有效金额");
  }
  if (!state.data.categories.some(category => category.id === categoryId)) {
    throw new Error("请选择分类");
  }
  if (!state.data.members.includes(member)) {
    throw new Error("请选择成员");
  }

  return {
    amount: roundMoney(amount),
    categoryId,
    member,
    note
  };
}

function saveCurrentTemplate() {
  try {
    const template = {
      id: cryptoId(),
      ...collectCurrentTemplate(),
      createdAt: new Date().toISOString()
    };
    state.entryTemplates = [
      template,
      ...state.entryTemplates.filter(item =>
        item.amount !== template.amount ||
        item.categoryId !== template.categoryId ||
        item.member !== template.member ||
        item.note !== template.note
      )
    ].slice(0, 12);
    saveEntryTemplates();
    renderEntryTemplates();
    elements.entryFeedback.textContent = "已保存为常用模板";
  } catch (error) {
    elements.entryFeedback.textContent = error.message;
  }
}

function applyEntryTemplate(id) {
  const template = state.entryTemplates.find(item => item.id === id);
  if (!template) return;

  elements.amountInput.value = template.amount;
  elements.noteInput.value = template.note || "";
  if (state.data.categories.some(category => category.id === template.categoryId)) {
    state.selectedCategoryId = template.categoryId;
  }
  if (state.data.members.includes(template.member)) {
    state.selectedMember = template.member;
  }
  renderEntryControls();
  elements.entryFeedback.textContent = "已填入常用模板";
}

function deleteEntryTemplate(id) {
  state.entryTemplates = state.entryTemplates.filter(template => template.id !== id);
  saveEntryTemplates();
  renderEntryTemplates();
  elements.entryFeedback.textContent = "已删除模板";
}

function handleTemplateClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const deleteButton = target.closest("[data-template-delete]");
  if (deleteButton) {
    deleteEntryTemplate(deleteButton.dataset.templateDelete);
    return;
  }

  const applyButton = target.closest("[data-template-id]");
  if (applyButton) {
    applyEntryTemplate(applyButton.dataset.templateId);
  }
}

async function deleteExpense(id) {
  if (!window.confirm("删除这条记录？")) return;
  const result = await api(`/api/expenses/${encodeURIComponent(id)}?month=${encodeURIComponent(state.data.month)}`, {
    method: "DELETE"
  });
  state.data = result.state;
  replaceTrendState(result.state);
  state.selectedExpenseId = null;
  render();
  showRecordList();
}

async function saveRecordDetail(event) {
  event.preventDefault();
  if (!state.selectedExpenseId) return;
  elements.recordFeedback.textContent = "保存中...";
  const expenseId = state.selectedExpenseId;

  try {
    if (hasQueuedOperationForExpense(expenseId)) {
      const payload = normalizeQueuedExpensePayload(collectRecordDetail());
      if (!payload) throw new Error("记录内容不正确");
      enqueueOfflineUpdate(expenseId, payload);
      applyOfflineMutation();
      state.selectedExpenseId = null;
      render();
      showRecordList();
      showSuccessPopup("已更新待同步修改");
      return;
    }

    const result = await api(`/api/expenses/${encodeURIComponent(expenseId)}?month=${encodeURIComponent(state.data.month)}`, {
      method: "PUT",
      body: JSON.stringify(collectRecordDetail())
    });
    state.data = result.state;
    replaceTrendState(result.state);
    state.selectedExpenseId = null;
    render();
    showSuccessPopup("保存成功");
  } catch (error) {
    if (error.isNetworkError) {
      try {
        const payload = normalizeQueuedExpensePayload(collectRecordDetail());
        if (!payload) throw new Error("记录内容不正确");
        enqueueOfflineUpdate(expenseId, payload);
        applyOfflineMutation();
        state.selectedExpenseId = null;
        render();
        showRecordList();
        showSuccessPopup("已离线保存修改");
      } catch (validationError) {
        elements.recordFeedback.textContent = validationError.message;
      }
      return;
    }
    elements.recordFeedback.textContent = error.message;
  }
}

function deleteSelectedExpense() {
  if (!state.selectedExpenseId) return;
  if (hasQueuedOperationForExpense(state.selectedExpenseId)) {
    enqueueOfflineDelete(state.selectedExpenseId);
    applyOfflineMutation();
    state.selectedExpenseId = null;
    render();
    showRecordList();
    showSuccessPopup("已从待同步队列移除");
    return;
  }
  deleteExpense(state.selectedExpenseId).catch(error => {
    if (error.isNetworkError) {
      enqueueOfflineDelete(state.selectedExpenseId);
      applyOfflineMutation();
      state.selectedExpenseId = null;
      render();
      showRecordList();
      showSuccessPopup("已离线删除");
      return;
    }
    elements.recordFeedback.textContent = error.message;
  });
}

function applyOfflineMutation() {
  if (!state.data) return;
  const queuedIds = new Set();
  state.offlineQueue.forEach(item => {
    if (item.localId) queuedIds.add(item.localId);
    if (item.expenseId) queuedIds.add(item.expenseId);
  });
  const baseState = {
    ...state.data,
    expenses: state.data.expenses.filter(expense => !expense.id.startsWith("local_") || queuedIds.has(expense.id))
  };
  const nextState = applyOfflineQueueToState(rebuildStateFromExpenses(baseState, baseState.expenses));
  state.data = nextState;
  replaceTrendState(nextState);
}

function collectBudgetRows() {
  return Array.from(elements.budgetRows.querySelectorAll(".budget-row")).map(row => ({
    id: row.dataset.id,
    name: row.querySelector(".budget-name").value.trim(),
    icon: row.querySelector(".budget-icon").value.trim(),
    limit: Number(String(row.querySelector(".budget-limit").value).replace(",", ".")),
    color: row.querySelector(".budget-color").value
  }));
}

function collectMemberRows() {
  const seen = new Set();
  return Array.from(elements.memberRows.querySelectorAll(".member-name-input"))
    .map(input => input.value.trim())
    .filter(member => {
      if (!member || seen.has(member)) return false;
      seen.add(member);
      return true;
    });
}

async function saveSettings(event) {
  event.preventDefault();
  elements.settingsFeedback.textContent = "保存中...";
  try {
    const members = collectMemberRows();
    if (members.length === 0) {
      throw new Error("请至少保留一个成员");
    }

    const result = await api("/api/budgets", {
      method: "PUT",
      body: JSON.stringify({
        month: elements.monthInput.value,
        members,
        categories: collectBudgetRows()
      })
    });
    state.data = result;
    replaceTrendState(result);
    state.selectedCategoryId = state.data.categories[0]?.id || null;
    state.selectedMember = state.data.members[0] || null;
    elements.settingsFeedback.textContent = "已保存";
    render();
  } catch (error) {
    elements.settingsFeedback.textContent = error.message;
  }
}

function addCategoryRow() {
  const id = `cat-${cryptoId()}`;
  const icon = CATEGORY_ICON_FALLBACKS[elements.budgetRows.children.length % CATEGORY_ICON_FALLBACKS.length];
  const row = document.createElement("div");
  row.className = "budget-row";
  row.dataset.id = id;
  row.style.setProperty("--accent", "#1f8a5b");
  row.innerHTML = `
    <label>
      <span>分类</span>
      <input class="budget-name" value="新分类" maxlength="20" required>
    </label>
    <label>
      <span>额度</span>
      <input class="budget-limit" value="0" inputmode="decimal" required>
    </label>
    <label>
      <span>颜色</span>
      <input class="budget-color" type="color" value="#477061">
    </label>
    <label>
      <span>图标</span>
      <input class="budget-icon" value="${escapeAttribute(icon)}" maxlength="4" aria-label="新分类图标">
    </label>
  `;
  elements.budgetRows.appendChild(row);
  row.querySelector(".budget-name").focus();
}

function addMemberRow() {
  if (elements.memberRows.querySelectorAll(".member-settings-row").length >= 6) {
    elements.settingsFeedback.textContent = "最多支持 6 个成员";
    return;
  }

  const row = createMemberRow("");
  elements.memberRows.appendChild(row);
  row.querySelector(".member-name-input").focus();
}

function handleMemberRowsClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const button = target.closest(".member-remove-button");
  if (!button) return;

  const rows = Array.from(elements.memberRows.querySelectorAll(".member-settings-row"));
  if (rows.length <= 1) {
    elements.settingsFeedback.textContent = "请至少保留一个成员";
    return;
  }

  button.closest(".member-settings-row")?.remove();
  elements.settingsFeedback.textContent = "成员已移除，保存后生效";
}

function handleCalendarClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const button = target.closest("[data-calendar-date]");
  if (!button) return;
  state.selectedStatsDate = button.dataset.calendarDate;
  renderStats();
}

function handleDetailFilterChange() {
  state.detailFilters.query = elements.detailSearchInput.value;
  state.detailFilters.categoryId = elements.detailCategoryFilter.value;
  state.detailFilters.member = elements.detailMemberFilter.value;
  elements.detailFilterStatus.textContent = hasDetailFilters() ? "已启用" : "未启用";
  renderRecent();
}

function resetDetailFilters() {
  state.detailFilters = { query: "", categoryId: "", member: "" };
  renderDetailFilters();
  renderRecent();
}

async function importBackup(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  const file = input.files?.[0];
  if (!file) return;

  try {
    if (!window.confirm("导入备份会覆盖当前所有数据，继续？")) return;
    elements.settingsFeedback.textContent = "导入中...";
    const text = await file.text();
    const result = await api(`/api/import.json?month=${encodeURIComponent(elements.monthInput.value || today().month)}`, {
      method: "POST",
      body: text
    });
    state.data = result.state;
    state.trendStates = await loadTrendStates(result.state.month);
    state.selectedExpenseId = null;
    state.selectedCategoryId = state.data.categories[0]?.id || null;
    state.selectedMember = state.data.members[0] || null;
    elements.monthInput.value = state.data.month;
    render();
    elements.settingsFeedback.textContent = "导入成功";
    showSuccessPopup("导入成功");
  } catch (error) {
    elements.settingsFeedback.textContent = error.message;
  } finally {
    input.value = "";
  }
}

async function clearAllData() {
  if (!window.confirm("确定要清除全部数据吗？这个操作不能撤销。")) return;
  const typed = window.prompt("请再次确认：输入“清空”后才会清除全部数据");
  if (typed !== "清空") {
    elements.settingsFeedback.textContent = "已取消清空";
    return;
  }

  try {
    elements.settingsFeedback.textContent = "清空中...";
    const result = await api(`/api/clear?month=${encodeURIComponent(elements.monthInput.value || today().month)}`, {
      method: "POST",
      body: JSON.stringify({ confirm: "CLEAR_ALL" })
    });
    state.data = result.state;
    state.trendStates = await loadTrendStates(result.state.month);
    state.selectedExpenseId = null;
    state.selectedCategoryId = state.data.categories[0]?.id || null;
    state.selectedMember = state.data.members[0] || null;
    state.selectedStatsDate = null;
    state.detailFilters = { query: "", categoryId: "", member: "" };
    state.entryTemplates = [];
    saveEntryTemplates();
    elements.monthInput.value = state.data.month;
    render();
    elements.settingsFeedback.textContent = "已清空全部数据";
    showSuccessPopup("已清空");
  } catch (error) {
    elements.settingsFeedback.textContent = error.message;
  }
}

async function copySummary() {
  const response = await api(`/api/summary?month=${encodeURIComponent(state.data.month)}`);
  await navigator.clipboard.writeText(response.summary);
  elements.copySummaryButton.textContent = "已复制";
  window.setTimeout(() => {
    elements.copySummaryButton.textContent = "摘要";
  }, 1200);
}

function showPwaUpdatePrompt(worker = null) {
  state.waitingServiceWorker = worker || state.waitingServiceWorker;
  if (!elements.pwaUpdatePrompt) return;
  elements.pwaUpdatePrompt.hidden = false;
  window.requestAnimationFrame(() => {
    elements.pwaUpdatePrompt.classList.add("is-visible");
  });
}

function hidePwaUpdatePrompt() {
  if (!elements.pwaUpdatePrompt) return;
  elements.pwaUpdatePrompt.classList.remove("is-visible");
  window.setTimeout(() => {
    elements.pwaUpdatePrompt.hidden = true;
  }, 180);
}

function applyPwaUpdate() {
  if (state.waitingServiceWorker) {
    state.reloadForServiceWorkerUpdate = true;
    state.waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    return;
  }
  window.location.reload();
}

function cryptoId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID().slice(0, 8);
  return Math.random().toString(16).slice(2, 10);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    state.hasServiceWorkerController = Boolean(navigator.serviceWorker.controller);

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!state.hasServiceWorkerController || state.serviceWorkerControllerChanged) return;
      state.serviceWorkerControllerChanged = true;
      state.waitingServiceWorker = null;
      if (state.reloadForServiceWorkerUpdate) {
        window.location.reload();
        return;
      }
      showPwaUpdatePrompt();
    });

    navigator.serviceWorker.register(withBasePath("/sw.js"), { scope: `${BASE_PATH || ""}/` })
      .then(registration => {
        if (registration.waiting && navigator.serviceWorker.controller) {
          showPwaUpdatePrompt(registration.waiting);
        }

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              showPwaUpdatePrompt(registration.waiting || worker);
            }
          });
        });
      })
      .catch(() => {});
  }
}

function bindEvents() {
  elements.tabs.forEach(tab => tab.addEventListener("click", () => setView(tab.dataset.view)));
  elements.themeOptions.forEach(button => button.addEventListener("click", () => applyTheme(button.dataset.themeChoice)));
  elements.customThemeGrid.addEventListener("change", handleCustomAssetUpload);
  elements.customThemeGrid.addEventListener("click", handleCustomAssetClear);
  cropElements.stage.addEventListener("pointerdown", handleCropPointerDown);
  cropElements.stage.addEventListener("pointermove", handleCropPointerMove);
  cropElements.stage.addEventListener("pointerup", handleCropPointerUp);
  cropElements.stage.addEventListener("pointercancel", handleCropPointerUp);
  cropElements.scaleInput.addEventListener("input", handleCropScaleChange);
  cropElements.applyButton.addEventListener("click", applyCrop);
  cropElements.cancelButton.addEventListener("click", closeCropper);
  cropElements.cancelTopButton.addEventListener("click", closeCropper);
  cropElements.modal.addEventListener("click", event => {
    if (event.target === cropElements.modal) closeCropper();
  });
  window.addEventListener("resize", handleCropResize);
  document.addEventListener("keydown", handleCropKeyDown);
  elements.monthInput.addEventListener("change", loadState);
  elements.categoryDetailBack.addEventListener("click", closeDashboardCategory);
  elements.expenseForm.addEventListener("submit", submitExpense);
  elements.amountInput.addEventListener("input", renderEntrySubmitBar);
  elements.dateInput.addEventListener("change", renderEntrySubmitBar);
  elements.saveTemplateButton.addEventListener("click", saveCurrentTemplate);
  elements.templateList.addEventListener("click", handleTemplateClick);
  elements.detailSearchInput.addEventListener("input", handleDetailFilterChange);
  elements.detailCategoryFilter.addEventListener("change", handleDetailFilterChange);
  elements.detailMemberFilter.addEventListener("change", handleDetailFilterChange);
  elements.detailFilterReset.addEventListener("click", resetDetailFilters);
  elements.recordDetailForm.addEventListener("submit", saveRecordDetail);
  elements.recordBackButton.addEventListener("click", showRecordList);
  elements.recordDeleteButton.addEventListener("click", deleteSelectedExpense);
  elements.savingForm?.addEventListener("submit", submitSaving);
  elements.savingAmountInput?.addEventListener("input", renderSavingSubmitBar);
  elements.savingDateInput?.addEventListener("change", renderSavingSubmitBar);
  elements.savingDetailForm?.addEventListener("submit", saveSavingDetail);
  elements.savingBackButton?.addEventListener("click", showSavingsList);
  elements.savingDeleteButton?.addEventListener("click", deleteSelectedSaving);
  elements.settingsForm.addEventListener("submit", saveSettings);
  elements.addMemberButton.addEventListener("click", addMemberRow);
  elements.memberRows.addEventListener("click", handleMemberRowsClick);
  elements.addCategoryButton.addEventListener("click", addCategoryRow);
  elements.enablePushButton?.addEventListener("click", () => {
    subscribePushNotifications().catch(error => {
      elements.notificationStatusText.textContent = error.message;
      renderNotificationSettings();
    });
  });
  elements.disablePushButton?.addEventListener("click", () => {
    disablePushNotifications().catch(error => {
      elements.notificationStatusText.textContent = error.message;
      renderNotificationSettings();
    });
  });
  elements.saveNotificationSettingsButton?.addEventListener("click", () => {
    saveNotificationSettings().catch(error => {
      elements.notificationStatusText.textContent = error.message;
      renderNotificationSettings();
    });
  });
  elements.testPushButton?.addEventListener("click", () => {
    sendTestPushNotification().catch(error => {
      elements.notificationStatusText.textContent = error.message;
      renderNotificationSettings();
    });
  });
  elements.importBackupInput.addEventListener("change", importBackup);
  elements.clearAllDataButton.addEventListener("click", clearAllData);
  elements.calendarGrid.addEventListener("click", handleCalendarClick);
  elements.copySummaryButton.addEventListener("click", copySummary);
  elements.pwaUpdateButton?.addEventListener("click", applyPwaUpdate);
  elements.pwaUpdateDismiss?.addEventListener("click", hidePwaUpdatePrompt);
  window.addEventListener("online", () => syncOfflineQueue());
  window.addEventListener("focus", () => syncOfflineQueue({ silent: true }));
}

function dismissStartupScreen() {
  const startupScreen = document.querySelector("#startupScreen");
  document.body.classList.add("app-ready");
  if (startupScreen) {
    window.setTimeout(() => {
      startupScreen.hidden = true;
    }, 220);
  }
}

function init() {
  const now = today();
  elements.monthInput.value = now.month;
  elements.dateInput.value = now.date;
  applyTheme(state.theme);
  bindEvents();
  registerServiceWorker();
  loadState()
    .then(() => {
      dismissStartupScreen();
      syncOfflineQueue({ silent: true });
      refreshNotificationStatus();
    })
    .catch(error => {
      document.body.innerHTML = `<main class="app-shell"><div class="empty-state">${escapeHtml(error.message)}</div></main>`;
    });
}

init();
