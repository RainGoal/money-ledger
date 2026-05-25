const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 5173);
const TOKEN = process.env.LEDGER_TOKEN || "";
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");
const DEFAULT_CATEGORY_ICONS = ["🍚", "🧴", "🚇", "🎮", "🏠", "💝", "🧾"];

const DEFAULT_DATA = {
  members: ["我", "对象"],
  categories: [
    { id: "food", name: "餐饮", icon: "🍚", color: "#2f7d5c", limit: 3000 },
    { id: "daily", name: "日用品", icon: "🧴", color: "#b15c2f", limit: 800 },
    { id: "transport", name: "交通", icon: "🚇", color: "#3568a6", limit: 600 },
    { id: "fun", name: "娱乐", icon: "🎮", color: "#8c5a9e", limit: 1000 },
    { id: "home", name: "居家", icon: "🏠", color: "#6f6a35", limit: 1200 }
  ],
  monthlyBudgets: {},
  expenses: []
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8"
};

function ensureDataFile() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  }
}

function ensureExpenseIds(expenses) {
  const seen = new Set();
  let changed = false;

  expenses.forEach(expense => {
    if (!expense || typeof expense !== "object") return;

    const currentId = String(expense.id || "").trim();
    let nextId = currentId;
    if (!nextId || seen.has(nextId)) {
      do {
        nextId = crypto.randomUUID();
      } while (seen.has(nextId));
    }

    if (expense.id !== nextId) {
      expense.id = nextId;
      changed = true;
    }
    seen.add(nextId);
  });

  return changed;
}

function loadData() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const data = JSON.parse(raw);
  const normalized = {
    members: Array.isArray(data.members) ? data.members : DEFAULT_DATA.members,
    categories: Array.isArray(data.categories) ? data.categories : DEFAULT_DATA.categories,
    monthlyBudgets: data.monthlyBudgets && typeof data.monthlyBudgets === "object" ? data.monthlyBudgets : {},
    expenses: Array.isArray(data.expenses) ? data.expenses : []
  };
  if (ensureExpenseIds(normalized.expenses)) saveData(normalized);
  return normalized;
}

function saveData(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

function send(res, status, body, contentType = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(body);
}

function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload), "application/json; charset=utf-8");
}

function notFound(res) {
  sendJson(res, 404, { error: "not_found" });
}

function isAuthorized(req, url) {
  if (!TOKEN) return true;
  const authorization = req.headers.authorization || "";
  const queryToken = url.searchParams.get("token") || "";
  return authorization === `Bearer ${TOKEN}` || queryToken === TOKEN;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("request_body_too_large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function readJson(req) {
  const body = await readBody(req);
  if (!body.trim()) return {};
  try {
    return JSON.parse(body);
  } catch {
    const error = new Error("invalid_json");
    error.statusCode = 400;
    throw error;
  }
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function localDateParts(date = new Date()) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  };
}

function currentMonth() {
  const now = localDateParts();
  return `${now.year}-${pad(now.month)}`;
}

function currentDate() {
  const now = localDateParts();
  return `${now.year}-${pad(now.month)}-${pad(now.day)}`;
}

function isValidMonth(month) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

function isValidDate(date) {
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date)) return false;
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
}

function daysInMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber, 0).getDate();
}

function monthPosition(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  return year * 12 + monthNumber;
}

function monthClock(month) {
  const todayMonth = currentMonth();
  const days = daysInMonth(month);

  if (monthPosition(month) < monthPosition(todayMonth)) {
    return { days, elapsedDays: days, remainingDays: 0 };
  }

  if (monthPosition(month) > monthPosition(todayMonth)) {
    return { days, elapsedDays: 0, remainingDays: days };
  }

  const today = localDateParts().day;
  return { days, elapsedDays: today, remainingDays: Math.max(days - today + 1, 1) };
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function slugifyId(name) {
  const ascii = String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return ascii || `cat-${crypto.randomUUID().slice(0, 8)}`;
}

function normalizeColor(color, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(color || "")) ? color : fallback;
}

function normalizeIcon(icon, fallback) {
  const value = String(icon || "").trim();
  return value ? Array.from(value).slice(0, 2).join("") : fallback;
}

function categoryBudget(data, month, category) {
  const monthly = data.monthlyBudgets[month] || {};
  if (Object.prototype.hasOwnProperty.call(monthly, category.id)) {
    return roundMoney(monthly[category.id]);
  }
  return roundMoney(category.limit);
}

function buildState(data, month = currentMonth()) {
  const safeMonth = isValidMonth(month) ? month : currentMonth();
  const clock = monthClock(safeMonth);
  const sourceCategories = data.categories.map((category, index) => ({
    ...category,
    icon: normalizeIcon(category.icon, DEFAULT_CATEGORY_ICONS[index % DEFAULT_CATEGORY_ICONS.length])
  }));
  const categoryMap = new Map(sourceCategories.map(category => [category.id, category]));
  const expenses = data.expenses
    .filter(expense => String(expense.date || "").startsWith(safeMonth))
    .sort((a, b) => {
      if (a.date === b.date) return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
      return String(b.date || "").localeCompare(String(a.date || ""));
    });

  const categories = sourceCategories.map(category => {
    const limit = categoryBudget(data, safeMonth, category);
    const spent = roundMoney(
      expenses
        .filter(expense => expense.categoryId === category.id)
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
    );
    const remaining = roundMoney(limit - spent);
    const percent = limit > 0 ? Math.min(999, Math.round((spent / limit) * 100)) : 0;
    const dailyRemaining = clock.remainingDays > 0 ? roundMoney(Math.max(remaining, 0) / clock.remainingDays) : 0;

    return {
      ...category,
      limit,
      spent,
      remaining,
      percent,
      dailyRemaining
    };
  });

  const totalBudget = roundMoney(categories.reduce((sum, category) => sum + category.limit, 0));
  const totalSpent = roundMoney(expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0));
  const remaining = roundMoney(totalBudget - totalSpent);
  const expectedByToday = roundMoney((totalBudget * clock.elapsedDays) / Math.max(clock.days, 1));
  const paceDelta = roundMoney(totalSpent - expectedByToday);

  return {
    month: safeMonth,
    today: currentDate(),
    members: data.members,
    categories,
    expenses: expenses.map(expense => ({
      ...expense,
      categoryName: categoryMap.get(expense.categoryId)?.name || "未分类",
      categoryIcon: categoryMap.get(expense.categoryId)?.icon || "🧾",
      categoryColor: categoryMap.get(expense.categoryId)?.color || "#777777"
    })),
    totals: {
      budget: totalBudget,
      spent: totalSpent,
      remaining,
      percent: totalBudget > 0 ? Math.min(999, Math.round((totalSpent / totalBudget) * 100)) : 0,
      dailyRemaining: clock.remainingDays > 0 ? roundMoney(Math.max(remaining, 0) / clock.remainingDays) : 0,
      expectedByToday,
      paceDelta,
      daysInMonth: clock.days,
      elapsedDays: clock.elapsedDays,
      remainingDays: clock.remainingDays
    }
  };
}

function buildSummary(state) {
  const direction = state.totals.paceDelta > 0 ? "快于计划" : "慢于计划";
  const pace = Math.abs(state.totals.paceDelta).toFixed(2);
  const lines = [
    `${state.month} 预算摘要`,
    `总计：已花 ${state.totals.spent.toFixed(2)} / ${state.totals.budget.toFixed(2)}，剩余 ${state.totals.remaining.toFixed(2)}`,
    `日均可花：${state.totals.dailyRemaining.toFixed(2)}，当前${direction} ${pace}`
  ];

  state.categories
    .slice()
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5)
    .forEach(category => {
      lines.push(`${category.name}：${category.spent.toFixed(2)} / ${category.limit.toFixed(2)}，剩 ${category.remaining.toFixed(2)}`);
    });

  return lines.join("\n");
}

function normalizeMembers(members) {
  if (!Array.isArray(members)) return null;
  const normalized = members
    .map(member => String(member || "").trim())
    .filter(Boolean)
    .slice(0, 6);
  return normalized.length > 0 ? Array.from(new Set(normalized)) : null;
}

function normalizeCategories(input, existingCategories) {
  if (!Array.isArray(input)) return null;
  const existingIds = new Set();
  const colors = ["#2f7d5c", "#b15c2f", "#3568a6", "#8c5a9e", "#6f6a35", "#bd4257", "#477061"];

  return input
    .map((category, index) => {
      const name = String(category.name || "").trim().slice(0, 20);
      if (!name) return null;

      const originalId = String(category.id || "").trim();
      let id = /^[a-zA-Z0-9_-]{1,40}$/.test(originalId) ? originalId : slugifyId(name);
      while (existingIds.has(id)) id = `${id}-${crypto.randomUUID().slice(0, 4)}`;
      existingIds.add(id);

      const previous = existingCategories.find(item => item.id === id);
      const limit = Math.max(0, roundMoney(category.limit));
      return {
        id,
        name,
        icon: normalizeIcon(category.icon, previous?.icon || DEFAULT_CATEGORY_ICONS[index % DEFAULT_CATEGORY_ICONS.length]),
        color: normalizeColor(category.color, previous?.color || colors[index % colors.length]),
        limit
      };
    })
    .filter(Boolean)
    .slice(0, 24);
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function exportCsv(state) {
  const rows = [["date", "member", "category", "amount", "note", "createdAt"]];
  state.expenses
    .slice()
    .reverse()
    .forEach(expense => {
      rows.push([
        expense.date,
        expense.member,
        expense.categoryName,
        Number(expense.amount || 0).toFixed(2),
        expense.note || "",
        expense.createdAt || ""
      ]);
    });
  return rows.map(row => row.map(csvEscape).join(",")).join("\n");
}

async function handleApi(req, res, url) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    });
    res.end();
    return;
  }

  if (!isAuthorized(req, url)) {
    sendJson(res, 401, { error: "unauthorized" });
    return;
  }

  const data = loadData();
  const month = url.searchParams.get("month") || currentMonth();

  if (req.method === "GET" && url.pathname === "/api/state") {
    sendJson(res, 200, buildState(data, month));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/summary") {
    const summary = buildSummary(buildState(data, month));
    if (url.searchParams.get("format") === "text") {
      send(res, 200, summary, "text/plain; charset=utf-8");
      return;
    }
    sendJson(res, 200, { summary });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/export.csv") {
    const state = buildState(data, month);
    send(res, 200, exportCsv(state), "text/csv; charset=utf-8");
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/expenses") {
    const payload = await readJson(req);
    const amount = roundMoney(payload.amount);
    const categoryId = String(payload.categoryId || "").trim();
    const date = String(payload.date || currentDate()).trim();
    const member = String(payload.member || data.members[0] || "").trim();
    const note = String(payload.note || "").trim().slice(0, 80);

    if (!isValidDate(date)) {
      sendJson(res, 400, { error: "invalid_date" });
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      sendJson(res, 400, { error: "invalid_amount" });
      return;
    }
    if (!data.categories.some(category => category.id === categoryId)) {
      sendJson(res, 400, { error: "invalid_category" });
      return;
    }
    if (!data.members.includes(member)) {
      sendJson(res, 400, { error: "invalid_member" });
      return;
    }

    const expense = {
      id: crypto.randomUUID(),
      date,
      member,
      categoryId,
      amount,
      note,
      createdAt: new Date().toISOString()
    };
    data.expenses.push(expense);
    saveData(data);
    sendJson(res, 201, { expense, state: buildState(data, date.slice(0, 7)) });
    return;
  }

  if (req.method === "PUT" && url.pathname.startsWith("/api/expenses/")) {
    const id = decodeURIComponent(url.pathname.replace("/api/expenses/", ""));
    const expense = data.expenses.find(item => item.id === id);
    if (!expense) {
      sendJson(res, 404, { error: "expense_not_found" });
      return;
    }

    const payload = await readJson(req);
    const amount = roundMoney(payload.amount);
    const categoryId = String(payload.categoryId || expense.categoryId || "").trim();
    const date = String(payload.date || expense.date || currentDate()).trim();
    const member = String(payload.member || expense.member || data.members[0] || "").trim();
    const note = String(payload.note || "").trim().slice(0, 80);

    if (!isValidDate(date)) {
      sendJson(res, 400, { error: "invalid_date" });
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      sendJson(res, 400, { error: "invalid_amount" });
      return;
    }
    if (!data.categories.some(category => category.id === categoryId)) {
      sendJson(res, 400, { error: "invalid_category" });
      return;
    }
    if (!data.members.includes(member)) {
      sendJson(res, 400, { error: "invalid_member" });
      return;
    }

    Object.assign(expense, {
      date,
      member,
      categoryId,
      amount,
      note,
      updatedAt: new Date().toISOString()
    });
    saveData(data);
    sendJson(res, 200, { expense, state: buildState(data, month) });
    return;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/expenses/")) {
    const id = decodeURIComponent(url.pathname.replace("/api/expenses/", ""));
    const before = data.expenses.length;
    data.expenses = data.expenses.filter(expense => expense.id !== id);
    if (data.expenses.length === before) {
      sendJson(res, 404, { error: "expense_not_found" });
      return;
    }
    saveData(data);
    sendJson(res, 200, { ok: true, state: buildState(data, month) });
    return;
  }

  if (req.method === "PUT" && url.pathname === "/api/budgets") {
    const payload = await readJson(req);
    const safeMonth = isValidMonth(payload.month) ? payload.month : currentMonth();
    const members = normalizeMembers(payload.members);
    const categories = normalizeCategories(payload.categories, data.categories);

    if (!categories || categories.length === 0) {
      sendJson(res, 400, { error: "invalid_categories" });
      return;
    }

    if (members) data.members = members;
    data.categories = categories;
    data.monthlyBudgets[safeMonth] = Object.fromEntries(categories.map(category => [category.id, category.limit]));
    saveData(data);
    sendJson(res, 200, buildState(data, safeMonth));
    return;
  }

  notFound(res);
}

function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));

  const relative = path.relative(PUBLIC_DIR, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    sendJson(res, 403, { error: "forbidden" });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      notFound(res);
      return;
    }
    const extension = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "Cache-Control": extension === ".html" ? "no-store" : "public, max-age=3600",
      "X-Content-Type-Options": "nosniff"
    });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    serveStatic(req, res, url);
  } catch (error) {
    const status = error.statusCode || 500;
    sendJson(res, status, { error: error.message || "server_error" });
  }
});

server.listen(PORT, () => {
  ensureDataFile();
  console.log(`Money Ledger PWA running at http://localhost:${PORT}`);
  if (!TOKEN) {
    console.log("LEDGER_TOKEN is not set. Set it before deploying to a public server.");
  }
});
