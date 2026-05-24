const state = {
  data: null,
  selectedCategoryId: null,
  selectedMember: null,
  theme: normalizeTheme(localStorage.getItem("ledgerTheme")),
  token: localStorage.getItem("ledgerToken") || ""
};

const elements = {
  themeColorMeta: document.querySelector("meta[name='theme-color']"),
  monthInput: document.querySelector("#monthInput"),
  tabs: document.querySelectorAll(".tab"),
  themeOptions: document.querySelectorAll("[data-theme-choice]"),
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
  weekdayList: document.querySelector("#weekdayList"),
  rankList: document.querySelector("#rankList")
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

function cuteTabIcon(view) {
  return `
    <svg class="kitty-tab-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path class="kitty-ear" d="M6.7 9.5 8.4 4.8l3.4 3.5"/>
      <path class="kitty-ear" d="M17.3 9.5 15.6 4.8l-3.4 3.5"/>
      <ellipse class="kitty-face" cx="12" cy="13.2" rx="7.5" ry="5.9"/>
      <path class="kitty-whisker" d="M5.2 12.9H2.9M5.4 14.9l-2.1.8M18.8 12.9h2.3M18.6 14.9l2.1.8"/>
      <circle class="kitty-eye" cx="9.5" cy="12.8" r="0.58"/>
      <circle class="kitty-eye" cx="14.5" cy="12.8" r="0.58"/>
      <ellipse class="kitty-nose" cx="12" cy="14.2" rx="0.72" ry="0.5"/>
      <path class="kitty-bow" d="M15.9 6.2c1.4-1.3 3.4-.6 3.5 1.2.1 1.6-1.8 2.3-3.4 1.2.5-.7.5-1.6-.1-2.4Z"/>
      <path class="kitty-bow" d="M14.1 6.9c-.8-1.5-2.8-1.4-3.4.2-.5 1.5 1 2.6 2.8 1.9-.2-.7 0-1.5.6-2.1Z"/>
      <circle class="kitty-bow-knot" cx="14.8" cy="7.9" r="1.1"/>
      ${CUTE_TAB_SYMBOLS[view] || ""}
    </svg>
  `;
}

function normalizeTheme(theme) {
  return theme === "cute" ? "cute" : "minimal";
}

function renderTabIcons() {
  elements.tabs.forEach(tab => {
    const icon = tab.querySelector(".tab-icon");
    if (!icon) return;
    const view = tab.dataset.view;
    icon.innerHTML = state.theme === "cute" ? cuteTabIcon(view) : MINIMAL_TAB_ICONS[view] || "";
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
    elements.themeColorMeta.setAttribute("content", state.theme === "cute" ? "#fff7fb" : "#ffffff");
  }
  renderTabIcons();
  renderThemeControls();
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
    throw new Error(payload.error || "请求失败");
  }

  return response.json();
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

function formatDetailDate(dateString) {
  const parts = dateString.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return dateString;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const base = `${parts[1]}月${parts[2]}日 ${weekdays[date.getDay()]}`;
  return dateString === today().date ? `今天 · ${base}` : base;
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
  state.data.categories.forEach(category => {
    const card = document.createElement("article");
    card.className = "category-card";
    card.style.setProperty("--accent", category.color);
    card.innerHTML = `
      <div class="category-top">
        <div class="category-name">
          <span class="swatch" style="background:${category.color}"></span>
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
  state.data.categories.forEach(category => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${state.selectedCategoryId === category.id ? " is-active" : ""}`;
    button.textContent = category.name;
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
      item.className = "day-item";
      item.style.setProperty("--accent", expense.categoryColor || "#27845b");
      item.innerHTML = `
        <div class="day-item-main">
          <div class="day-item-title">
            <span class="swatch" style="background:${expense.categoryColor || "#27845b"}"></span>
            <span>${escapeHtml(expense.categoryName)}</span>
          </div>
          <div class="recent-meta">${escapeHtml(expense.member)}${expense.note ? ` · ${escapeHtml(expense.note)}` : ""}</div>
        </div>
        <div class="day-item-side">
          <div class="recent-amount">-${money(expense.amount)}</div>
          <button class="delete-button" type="button" aria-label="删除记录">×</button>
        </div>
      `;
      item.querySelector("button").addEventListener("click", () => deleteExpense(expense.id));
      list.appendChild(item);
    });

    card.appendChild(list);
    elements.recentList.appendChild(card);
  });
}

function renderStats() {
  const expenses = state.data.expenses;
  const activeDates = new Set(expenses.map(expense => expense.date));
  const activeDayCount = activeDates.size;
  const averageDailySpend = state.data.totals.elapsedDays > 0 ? state.data.totals.spent / state.data.totals.elapsedDays : 0;
  const topCategory = state.data.categories.slice().sort((a, b) => b.spent - a.spent)[0];

  elements.avgDailySpend.textContent = money(averageDailySpend);
  elements.topCategoryName.textContent = topCategory && topCategory.spent > 0 ? topCategory.name : "-";
  elements.topCategoryAmount.textContent = topCategory ? money(topCategory.spent) : "0.00";
  elements.recordCount.textContent = String(expenses.length);
  elements.activeDays.textContent = String(activeDayCount);

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
    .map(category => ({ label: category.name, amount: category.spent, color: category.color }));
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
    row.innerHTML = `
      <span class="rank-index">${index + 1}</span>
      <span class="swatch" style="background:${item.color || "#27845b"}"></span>
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

  state.data.categories.forEach(category => {
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
    `;
    elements.budgetRows.appendChild(row);
  });
}

function render() {
  renderSummary();
  renderCategories();
  renderEntryControls();
  renderRecent();
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
      ? `${category.name} 剩余 ${money(category.remaining)}，日均 ${money(category.dailyRemaining)}`
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
  render();
}

function collectBudgetRows() {
  return Array.from(elements.budgetRows.querySelectorAll(".budget-row")).map(row => ({
    id: row.dataset.id,
    name: row.querySelector(".budget-name").value.trim(),
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
  `;
  elements.budgetRows.appendChild(row);
  row.querySelector(".budget-name").focus();
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
  elements.monthInput.addEventListener("change", loadState);
  elements.expenseForm.addEventListener("submit", submitExpense);
  elements.settingsForm.addEventListener("submit", saveSettings);
  elements.addCategoryButton.addEventListener("click", addCategoryRow);
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
