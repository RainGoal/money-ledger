const state = {
  data: null,
  selectedCategoryId: null,
  selectedMember: null,
  selectedStatsDate: null,
  selectedExpenseId: null,
  theme: normalizeTheme(localStorage.getItem("ledgerTheme")),
  token: localStorage.getItem("ledgerToken") || ""
};

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
    stats: document.querySelector("#statsView"),
    settings: document.querySelector("#settingsView")
  },
  totalSpent: document.querySelector("#totalSpent"),
  totalBudget: document.querySelector("#totalBudget"),
  totalMeter: document.querySelector("#totalMeter"),
  remainingAmount: document.querySelector("#remainingAmount"),
  dailyAmount: document.querySelector("#dailyAmount"),
  remainingDays: document.querySelector("#remainingDays"),
  categoryList: document.querySelector("#categoryList"),
  categoryChips: document.querySelector("#categoryChips"),
  memberChips: document.querySelector("#memberChips"),
  expenseForm: document.querySelector("#expenseForm"),
  amountInput: document.querySelector("#amountInput"),
  dateInput: document.querySelector("#dateInput"),
  noteInput: document.querySelector("#noteInput"),
  entryFeedback: document.querySelector("#entryFeedback"),
  recentList: document.querySelector("#recentList"),
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
  memberOneInput: document.querySelector("#memberOneInput"),
  memberTwoInput: document.querySelector("#memberTwoInput"),
  budgetRows: document.querySelector("#budgetRows"),
  addCategoryButton: document.querySelector("#addCategoryButton"),
  avgDailySpend: document.querySelector("#avgDailySpend"),
  topCategoryName: document.querySelector("#topCategoryName"),
  topCategoryAmount: document.querySelector("#topCategoryAmount"),
  recordCount: document.querySelector("#recordCount"),
  activeDays: document.querySelector("#activeDays"),
  calendarMonthLabel: document.querySelector("#calendarMonthLabel"),
  calendarGrid: document.querySelector("#calendarGrid"),
  selectedDayTitle: document.querySelector("#selectedDayTitle"),
  selectedDayTotal: document.querySelector("#selectedDayTotal"),
  selectedDayList: document.querySelector("#selectedDayList"),
  weekdayList: document.querySelector("#weekdayList"),
  rankList: document.querySelector("#rankList"),
  successPopup: document.querySelector("#successPopup"),
  successPopupMessage: document.querySelector("#successPopupMessage")
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
  stats: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9m7 10V5m7 14v-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Zm7.2 3.5c0-.5-.1-1-.2-1.5l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2.6-1.5L13.7 2h-4l-.4 3a8 8 0 0 0-2.6 1.5l-2.4-1-2 3.5 2 1.5A8 8 0 0 0 4 12c0 .5.1 1 .2 1.5l-2 1.5 2 3.5 2.4-1A8 8 0 0 0 9.2 19l.4 3h4l.4-3a8 8 0 0 0 2.6-1.5l2.4 1 2-3.5-2-1.5c.1-.5.2-1 .2-1.5Z" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/></svg>`
};

const CUTE_TAB_SYMBOLS = {
  dashboard: `<path class="kitty-symbol" d="M8.9 16.2 12 13.6l3.1 2.6v2.2h-2v-1.6h-2.2v1.6h-2z"/>`,
  details: `<path class="kitty-symbol" d="M8.7 15.1h6.6M8.7 17.1h6.6M8.7 19.1h4.2"/>`,
  entry: `<path class="kitty-symbol" d="M12 14.3v5M9.5 16.8h5"/>`,
  stats: `<path class="kitty-symbol" d="M9 18.9v-2.8M12 18.9v-4.6M15 18.9v-3.5"/>`,
  settings: `<path class="kitty-symbol" d="M12 15.1a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4Zm4.2 1.7h-1M9.8 16.8h-1M12 13.6v-1M12 21v-1"/>`
};

const HELLO_KITTY_ICON = "/hello-kitty-red.jpg";

const CUSTOM_THEME_STORAGE_KEY = "ledgerCustomTheme";
const CUSTOM_TAB_SLOTS = [
  { key: "dashboard", label: "首页图标" },
  { key: "details", label: "明细图标" },
  { key: "entry", label: "记账图标" },
  { key: "stats", label: "统计图标" },
  { key: "settings", label: "设置图标" }
];
const CUSTOM_VIEW_SLOTS = [
  { key: "dashboard", label: "首页背景" },
  { key: "details", label: "明细背景" },
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
  if (theme === "cute" || theme === "custom") return theme;
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
    elements.themeColorMeta.setAttribute("content", state.theme === "minimal" ? "#ffffff" : "#fff7fb");
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
  invalid_date: "日期不正确",
  invalid_amount: "金额不正确",
  invalid_category: "分类不存在，请检查分类设置",
  invalid_member: "记账人员不存在，请检查成员设置",
  invalid_json: "请求数据格式错误",
  unauthorized: "未授权"
};

function apiErrorMessage(payload, response) {
  const code = payload?.error || "";
  return API_ERROR_MESSAGES[code] || code || response.statusText || "请求失败";
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...apiHeaders(),
      ...(options.headers || {})
    }
  });

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

function monthParts(month) {
  const [year, monthNumber] = String(month || "").split("-").map(Number);
  return { year, monthNumber, monthIndex: monthNumber - 1 };
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
  elements.exportLink.href = `/api/export.csv?month=${encodeURIComponent(state.data.month)}${state.token ? `&token=${encodeURIComponent(state.token)}` : ""}`;
}

function renderCategories() {
  elements.categoryList.innerHTML = "";
  state.data.categories.forEach((category, index) => {
    const icon = categoryIcon(category, index);
    const card = document.createElement("article");
    card.className = "category-card";
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
    card.addEventListener("click", () => {
      state.selectedCategoryId = category.id;
      renderEntryControls();
      setView("entry");
      elements.amountInput.focus();
    });
    elements.categoryList.appendChild(card);
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
}

function renderRecent() {
  elements.recentList.innerHTML = "";
  const groups = groupExpensesByDate(state.data.expenses.slice());

  if (groups.length === 0) {
    elements.recentList.innerHTML = `<div class="empty-state">本月还没有记录</div>`;
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
      item.className = "day-item day-item-button";
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
  elements.recordFeedback.textContent = "";

  elements.recordCategorySelect.innerHTML = "";
  state.data.categories.forEach((category, index) => {
    elements.recordCategorySelect.appendChild(
      option(`${categoryIcon(category, index)} ${category.name}`, category.id, expense.categoryId)
    );
  });

  elements.recordMemberSelect.innerHTML = "";
  state.data.members.forEach(member => {
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
    const item = document.createElement("div");
    item.className = "calendar-expense";
    item.style.setProperty("--accent", expense.categoryColor || "#27845b");
    item.innerHTML = `
      <div class="day-item-main">
        <div class="day-item-title">
          <span class="category-icon" aria-hidden="true">${escapeHtml(expense.categoryIcon || "🧾")}</span>
          <span>${escapeHtml(expense.categoryName)}</span>
        </div>
        <div class="recent-meta">${escapeHtml(expense.member)}${expense.note ? ` · ${escapeHtml(expense.note)}` : ""}</div>
      </div>
      <strong class="calendar-expense-amount">-${money(expense.amount)}</strong>
    `;
    elements.selectedDayList.appendChild(item);
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
  renderCalendar(dayMap);
  renderSelectedDayDetails(dayMap);

  const weekdayTotals = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map(label => ({ label, amount: 0 }));
  const weekdayIndex = new Map(weekdayTotals.map((item, index) => [item.label, index]));
  expenses.forEach(expense => {
    const label = weekdayLabel(expense.date);
    const index = weekdayIndex.get(label);
    if (index !== undefined) {
      weekdayTotals[index].amount = roundMoney(weekdayTotals[index].amount + Number(expense.amount || 0));
    }
  });
  renderBarList(elements.weekdayList, weekdayTotals);

  const ranks = state.data.categories
    .slice()
    .sort((a, b) => b.spent - a.spent)
    .map(category => ({ label: category.name, amount: category.spent, color: category.color, icon: categoryIcon(category) }));
  renderRankList(ranks);
}

function renderBarList(container, items) {
  container.innerHTML = "";
  const max = Math.max(...items.map(item => item.amount), 1);
  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span>${escapeHtml(item.label)}</span>
      <div class="bar-track"><span style="width:${Math.round((item.amount / max) * 100)}%"></span></div>
      <strong>${money(item.amount)}</strong>
    `;
    container.appendChild(row);
  });
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

function renderSettings() {
  elements.memberOneInput.value = state.data.members[0] || "";
  elements.memberTwoInput.value = state.data.members[1] || "";
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
}

function render() {
  renderSummary();
  renderCategories();
  renderEntryControls();
  renderRecent();
  renderRecordDetail();
  renderStats();
  renderSettings();
}

async function loadState() {
  const month = elements.monthInput.value || today().month;
  state.data = await api(`/api/state?month=${encodeURIComponent(month)}`);
  elements.monthInput.value = state.data.month;
  elements.dateInput.value = state.data.month === today().month ? state.data.today : `${state.data.month}-01`;
  render();
}

async function submitExpense(event) {
  event.preventDefault();
  elements.entryFeedback.textContent = "提交中...";
  const amount = Number(String(elements.amountInput.value).replace(",", "."));

  try {
    const payload = {
      amount,
      categoryId: state.selectedCategoryId,
      member: state.selectedMember,
      date: elements.dateInput.value,
      note: elements.noteInput.value
    };
    const result = await api("/api/expenses", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    state.data = result.state;
    elements.monthInput.value = state.data.month;
    elements.amountInput.value = "";
    elements.noteInput.value = "";
    const category = state.data.categories.find(item => item.id === state.selectedCategoryId);
    elements.entryFeedback.textContent = category
      ? `${categoryIcon(category)} ${category.name} 剩余 ${money(category.remaining)}，日均 ${money(category.dailyRemaining)}`
      : "已提交";
    render();
  } catch (error) {
    elements.entryFeedback.textContent = error.message;
  }
}

async function deleteExpense(id) {
  if (!window.confirm("删除这条记录？")) return;
  const result = await api(`/api/expenses/${encodeURIComponent(id)}?month=${encodeURIComponent(state.data.month)}`, {
    method: "DELETE"
  });
  state.data = result.state;
  state.selectedExpenseId = null;
  render();
  showRecordList();
}

async function saveRecordDetail(event) {
  event.preventDefault();
  if (!state.selectedExpenseId) return;
  elements.recordFeedback.textContent = "保存中...";

  try {
    const result = await api(`/api/expenses/${encodeURIComponent(state.selectedExpenseId)}?month=${encodeURIComponent(state.data.month)}`, {
      method: "PUT",
      body: JSON.stringify(collectRecordDetail())
    });
    state.data = result.state;
    state.selectedExpenseId = null;
    render();
    showSuccessPopup("保存成功");
  } catch (error) {
    elements.recordFeedback.textContent = error.message;
  }
}

function deleteSelectedExpense() {
  if (!state.selectedExpenseId) return;
  deleteExpense(state.selectedExpenseId).catch(error => {
    elements.recordFeedback.textContent = error.message;
  });
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

async function saveSettings(event) {
  event.preventDefault();
  elements.settingsFeedback.textContent = "保存中...";
  try {
    const result = await api("/api/budgets", {
      method: "PUT",
      body: JSON.stringify({
        month: elements.monthInput.value,
        members: [elements.memberOneInput.value, elements.memberTwoInput.value],
        categories: collectBudgetRows()
      })
    });
    state.data = result;
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

function handleCalendarClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const button = target.closest("[data-calendar-date]");
  if (!button) return;
  state.selectedStatsDate = button.dataset.calendarDate;
  renderStats();
}

async function copySummary() {
  const response = await api(`/api/summary?month=${encodeURIComponent(state.data.month)}`);
  await navigator.clipboard.writeText(response.summary);
  elements.copySummaryButton.textContent = "已复制";
  window.setTimeout(() => {
    elements.copySummaryButton.textContent = "摘要";
  }, 1200);
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
    navigator.serviceWorker.register("/sw.js").catch(() => {});
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
  elements.expenseForm.addEventListener("submit", submitExpense);
  elements.recordDetailForm.addEventListener("submit", saveRecordDetail);
  elements.recordBackButton.addEventListener("click", showRecordList);
  elements.recordDeleteButton.addEventListener("click", deleteSelectedExpense);
  elements.settingsForm.addEventListener("submit", saveSettings);
  elements.addCategoryButton.addEventListener("click", addCategoryRow);
  elements.calendarGrid.addEventListener("click", handleCalendarClick);
  elements.copySummaryButton.addEventListener("click", copySummary);
}

function init() {
  const now = today();
  elements.monthInput.value = now.month;
  elements.dateInput.value = now.date;
  applyTheme(state.theme);
  bindEvents();
  registerServiceWorker();
  loadState().catch(error => {
    document.body.innerHTML = `<main class="app-shell"><div class="empty-state">${escapeHtml(error.message)}</div></main>`;
  });
}

init();
