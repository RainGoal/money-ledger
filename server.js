const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const webpush = require("web-push");
const { DatabaseSync } = require("node:sqlite");

const PORT = Number(process.env.PORT || 5173);
const TOKEN = process.env.LEDGER_TOKEN || "";
const BASE_PATH = normalizeBasePath(process.env.BASE_PATH || "");
const VAPID_PUBLIC_KEY = String(process.env.VAPID_PUBLIC_KEY || "").trim();
const VAPID_PRIVATE_KEY = String(process.env.VAPID_PRIVATE_KEY || "").trim();
const VAPID_SUBJECT = String(process.env.VAPID_SUBJECT || "mailto:admin@example.com").trim();
const NOTIFICATION_CHECK_INTERVAL_MS = Math.max(15000, Number(process.env.NOTIFICATION_CHECK_INTERVAL_MS || 60000));
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");
const SQLITE_FILE = path.join(DATA_DIR, "ledger.sqlite");
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

function normalizeBasePath(value) {
  const pathValue = String(value || "").trim();
  if (!pathValue || pathValue === "/") return "";
  return `/${pathValue.replace(/^\/+|\/+$/g, "")}`;
}

function stripBasePath(pathname) {
  if (!BASE_PATH) return pathname;
  if (pathname === BASE_PATH) return "/";
  if (pathname.startsWith(`${BASE_PATH}/`)) return pathname.slice(BASE_PATH.length) || "/";
  return "";
}

function applyBasePath(content) {
  return content.replace(/__BASE_PATH__/g, BASE_PATH);
}

function staticCacheControl(extension, pathname) {
  if (pathname === "/sw.js" || [".html", ".css", ".js", ".webmanifest"].includes(extension)) {
    return "no-store";
  }
  return "public, max-age=3600";
}

function loadJsonDataFile() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const data = JSON.parse(raw);
  const normalized = {
    members: Array.isArray(data.members) ? data.members : DEFAULT_DATA.members,
    categories: Array.isArray(data.categories) ? data.categories : DEFAULT_DATA.categories,
    monthlyBudgets: data.monthlyBudgets && typeof data.monthlyBudgets === "object" ? data.monthlyBudgets : {},
    expenses: Array.isArray(data.expenses) ? data.expenses : []
  };
  ensureExpenseIds(normalized.expenses);
  return normalized;
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

const db = openDatabase();

function openDatabase() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const database = new DatabaseSync(SQLITE_FILE);
  database.exec("PRAGMA journal_mode = WAL");
  database.exec("PRAGMA foreign_keys = ON");
  database.exec("PRAGMA busy_timeout = 5000");
  return database;
}

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS members (
      name TEXT PRIMARY KEY,
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      default_limit REAL NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS monthly_budgets (
      month TEXT NOT NULL,
      category_id TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      PRIMARY KEY (month, category_id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      member TEXT NOT NULL,
      category_id TEXT NOT NULL,
      amount REAL NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_member ON expenses(member);

    CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint TEXT PRIMARY KEY,
      subscription_json TEXT NOT NULL,
      user_agent TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notification_preferences (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      push_enabled INTEGER NOT NULL DEFAULT 0,
      budget_alerts_enabled INTEGER NOT NULL DEFAULT 1,
      daily_reminder_enabled INTEGER NOT NULL DEFAULT 0,
      daily_reminder_time TEXT NOT NULL DEFAULT '21:30',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notification_events (
      event_key TEXT PRIMARY KEY,
      sent_at TEXT NOT NULL
    );
  `);

  db.prepare(`
    INSERT OR IGNORE INTO notification_preferences (
      id,
      push_enabled,
      budget_alerts_enabled,
      daily_reminder_enabled,
      daily_reminder_time,
      updated_at
    )
    VALUES (1, 0, 1, 0, '21:30', ?)
  `).run(new Date().toISOString());

  seedDatabaseIfNeeded();
}

function getMetadata(key) {
  return db.prepare("SELECT value FROM metadata WHERE key = ?").get(key)?.value || "";
}

function setMetadata(key, value) {
  db.prepare(`
    INSERT INTO metadata (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, String(value));
}

function runTransaction(callback) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = callback();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function seedDatabaseIfNeeded() {
  const hasSchema = getMetadata("schemaVersion") === "1";
  if (hasSchema) return;

  const source = fs.existsSync(DATA_FILE) ? loadJsonDataFile() : DEFAULT_DATA;
  replaceAllData(source);
  setMetadata("schemaVersion", "1");
  setMetadata("migratedFromJsonAt", new Date().toISOString());
}

function serializeData() {
  const data = {
    members: [],
    categories: [],
    monthlyBudgets: {},
    expenses: []
  };

  data.members = db.prepare("SELECT name FROM members ORDER BY sort_order, name").all().map(row => row.name);
  data.categories = db.prepare(`
    SELECT id, name, icon, color, default_limit AS "limit"
    FROM categories
    ORDER BY sort_order, id
  `).all().map(row => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    limit: roundMoney(row.limit)
  }));

  db.prepare(`
    SELECT month, category_id AS categoryId, amount
    FROM monthly_budgets
    ORDER BY month, category_id
  `).all().forEach(row => {
    if (!data.monthlyBudgets[row.month]) data.monthlyBudgets[row.month] = {};
    data.monthlyBudgets[row.month][row.categoryId] = roundMoney(row.amount);
  });

  data.expenses = db.prepare(`
    SELECT
      id,
      date,
      member,
      category_id AS categoryId,
      amount,
      note,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM expenses
    ORDER BY date DESC, created_at DESC
  `).all().map(row => {
    const expense = {
      id: row.id,
      date: row.date,
      member: row.member,
      categoryId: row.categoryId,
      amount: roundMoney(row.amount),
      note: row.note || "",
      createdAt: row.createdAt
    };
    if (row.updatedAt) expense.updatedAt = row.updatedAt;
    return expense;
  });

  return data;
}

function loadData() {
  return serializeData();
}

function replaceAllData(input) {
  const normalized = normalizeImportedData(input) || normalizeImportedData(DEFAULT_DATA);
  runTransaction(() => {
    db.exec(`
      DELETE FROM expenses;
      DELETE FROM monthly_budgets;
      DELETE FROM categories;
      DELETE FROM members;
      DELETE FROM notification_events;
    `);
    insertData(normalized);
  });
  return normalized;
}

function insertData(data) {
  const insertMember = db.prepare("INSERT INTO members (name, sort_order) VALUES (?, ?)");
  data.members.forEach((member, index) => {
    insertMember.run(member, index);
  });

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, icon, color, default_limit, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  data.categories.forEach((category, index) => {
    insertCategory.run(category.id, category.name, category.icon, category.color, category.limit, index);
  });

  const insertBudget = db.prepare(`
    INSERT INTO monthly_budgets (month, category_id, amount)
    VALUES (?, ?, ?)
  `);
  Object.entries(data.monthlyBudgets || {}).forEach(([month, budgets]) => {
    Object.entries(budgets || {}).forEach(([categoryId, amount]) => {
      insertBudget.run(month, categoryId, roundMoney(amount));
    });
  });

  const insertExpense = db.prepare(`
    INSERT INTO expenses (id, date, member, category_id, amount, note, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  data.expenses.forEach(expense => {
    insertExpense.run(
      expense.id,
      expense.date,
      expense.member,
      expense.categoryId,
      expense.amount,
      expense.note || "",
      expense.createdAt,
      expense.updatedAt || null
    );
  });
}

function insertExpense(expense) {
  db.prepare(`
    INSERT INTO expenses (id, date, member, category_id, amount, note, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    expense.id,
    expense.date,
    expense.member,
    expense.categoryId,
    expense.amount,
    expense.note || "",
    expense.createdAt,
    expense.updatedAt || null
  );
}

function updateExpense(id, patch) {
  const result = db.prepare(`
    UPDATE expenses
    SET date = ?, member = ?, category_id = ?, amount = ?, note = ?, updated_at = ?
    WHERE id = ?
  `).run(
    patch.date,
    patch.member,
    patch.categoryId,
    patch.amount,
    patch.note || "",
    patch.updatedAt,
    id
  );
  return result.changes > 0;
}

function deleteExpenseById(id) {
  return db.prepare("DELETE FROM expenses WHERE id = ?").run(id).changes > 0;
}

function saveSettingsData(members, categories, month) {
  runTransaction(() => {
    db.exec("DELETE FROM members");
    const insertMember = db.prepare("INSERT INTO members (name, sort_order) VALUES (?, ?)");
    members.forEach((member, index) => insertMember.run(member, index));

    db.exec("DELETE FROM categories");
    const insertCategory = db.prepare(`
      INSERT INTO categories (id, name, icon, color, default_limit, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    categories.forEach((category, index) => {
      insertCategory.run(category.id, category.name, category.icon, category.color, category.limit, index);
    });

    db.prepare("DELETE FROM monthly_budgets WHERE month = ?").run(month);
    const insertBudget = db.prepare(`
      INSERT INTO monthly_budgets (month, category_id, amount)
      VALUES (?, ?, ?)
    `);
    categories.forEach(category => {
      insertBudget.run(month, category.id, category.limit);
    });
  });
}

function initPushService() {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

function isPushConfigured() {
  return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}

function normalizeSubscription(input) {
  if (!input || typeof input !== "object") return null;
  const endpoint = String(input.endpoint || "").trim();
  const p256dh = String(input.keys?.p256dh || "").trim();
  const auth = String(input.keys?.auth || "").trim();
  if (!endpoint || !p256dh || !auth) return null;
  return {
    endpoint,
    expirationTime: input.expirationTime || null,
    keys: { p256dh, auth }
  };
}

function savePushSubscription(subscription, userAgent = "") {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO push_subscriptions (endpoint, subscription_json, user_agent, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(endpoint) DO UPDATE SET
      subscription_json = excluded.subscription_json,
      user_agent = excluded.user_agent,
      updated_at = excluded.updated_at
  `).run(
    subscription.endpoint,
    JSON.stringify(subscription),
    String(userAgent || "").slice(0, 240),
    now,
    now
  );
}

function deletePushSubscription(endpoint) {
  if (!endpoint) return 0;
  return db.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").run(endpoint).changes;
}

function pushSubscriptionCount() {
  return Number(db.prepare("SELECT COUNT(*) AS count FROM push_subscriptions").get()?.count || 0);
}

function loadPushSubscriptions() {
  return db.prepare("SELECT endpoint, subscription_json AS subscriptionJson FROM push_subscriptions").all()
    .map(row => {
      try {
        return { endpoint: row.endpoint, subscription: JSON.parse(row.subscriptionJson) };
      } catch {
        return null;
      }
    })
    .filter(item => item?.subscription?.endpoint);
}

function normalizeNotificationPreferences(input, current = getNotificationPreferences()) {
  const time = String(input?.dailyReminderTime || current.dailyReminderTime || "21:30").trim();
  return {
    pushEnabled: Boolean(input?.pushEnabled),
    budgetAlertsEnabled: input?.budgetAlertsEnabled !== false,
    dailyReminderEnabled: Boolean(input?.dailyReminderEnabled),
    dailyReminderTime: isValidTime(time) ? time : current.dailyReminderTime
  };
}

function getNotificationPreferences() {
  const row = db.prepare(`
    SELECT
      push_enabled AS pushEnabled,
      budget_alerts_enabled AS budgetAlertsEnabled,
      daily_reminder_enabled AS dailyReminderEnabled,
      daily_reminder_time AS dailyReminderTime
    FROM notification_preferences
    WHERE id = 1
  `).get();
  return {
    pushEnabled: Boolean(row?.pushEnabled),
    budgetAlertsEnabled: row?.budgetAlertsEnabled !== 0,
    dailyReminderEnabled: Boolean(row?.dailyReminderEnabled),
    dailyReminderTime: isValidTime(row?.dailyReminderTime) ? row.dailyReminderTime : "21:30"
  };
}

function saveNotificationPreferences(input) {
  const preferences = normalizeNotificationPreferences(input);
  db.prepare(`
    UPDATE notification_preferences
    SET
      push_enabled = ?,
      budget_alerts_enabled = ?,
      daily_reminder_enabled = ?,
      daily_reminder_time = ?,
      updated_at = ?
    WHERE id = 1
  `).run(
    preferences.pushEnabled ? 1 : 0,
    preferences.budgetAlertsEnabled ? 1 : 0,
    preferences.dailyReminderEnabled ? 1 : 0,
    preferences.dailyReminderTime,
    new Date().toISOString()
  );
  return preferences;
}

function isValidTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || ""));
}

function notificationStatusPayload() {
  return {
    configured: isPushConfigured(),
    subscriptionCount: pushSubscriptionCount(),
    preferences: getNotificationPreferences()
  };
}

async function sendPushPayload(payload) {
  if (!isPushConfigured()) {
    const error = new Error("push_not_configured");
    error.statusCode = 400;
    throw error;
  }

  const subscriptions = loadPushSubscriptions();
  if (subscriptions.length === 0) {
    const error = new Error("push_subscription_missing");
    error.statusCode = 400;
    throw error;
  }

  const body = JSON.stringify({
    badge: `${BASE_PATH || ""}/icon.svg`,
    icon: `${BASE_PATH || ""}/icon.svg`,
    url: `${BASE_PATH || ""}/`,
    ...payload
  });
  let sent = 0;
  let removed = 0;
  let failed = 0;
  let lastError = "";

  await Promise.all(subscriptions.map(async item => {
    try {
      await webpush.sendNotification(item.subscription, body, { TTL: 60 * 60, urgency: "normal" });
      sent += 1;
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        deletePushSubscription(item.endpoint);
        removed += 1;
      } else {
        failed += 1;
        lastError = error.message || "push_send_failed";
        console.error("Push notification failed:", error.message || error);
      }
    }
  }));

  if (sent === 0 && subscriptions.length > 0 && removed === subscriptions.length) {
    const error = new Error("push_subscription_missing");
    error.statusCode = 400;
    throw error;
  }
  if (sent === 0 && failed > 0) {
    const error = new Error("push_send_failed");
    error.detail = lastError;
    error.statusCode = 502;
    throw error;
  }

  return { sent, removed };
}

function expenseCountForDate(date) {
  return Number(db.prepare("SELECT COUNT(*) AS count FROM expenses WHERE date = ?").get(date)?.count || 0);
}

function markNotificationEvent(eventKey) {
  db.prepare(`
    INSERT INTO notification_events (event_key, sent_at)
    VALUES (?, ?)
    ON CONFLICT(event_key) DO NOTHING
  `).run(eventKey, new Date().toISOString());
}

function hasNotificationEvent(eventKey) {
  return Boolean(db.prepare("SELECT 1 FROM notification_events WHERE event_key = ?").get(eventKey));
}

function notificationThreshold(percent) {
  const value = Number(percent || 0);
  if (value >= 100) return 100;
  if (value >= 90) return 90;
  if (value >= 80) return 80;
  return 0;
}

function budgetAlertCandidates(state) {
  const items = [];
  const totalThreshold = notificationThreshold(state.totals.percent);
  if (totalThreshold) {
    items.push({
      key: `budget:${state.month}:total:${totalThreshold}`,
      title: totalThreshold >= 100 ? "总预算已超支" : "总预算接近上限",
      body: `本月总预算已使用 ${state.totals.percent}%，已花 ${state.totals.spent.toFixed(2)}。`,
      url: `${BASE_PATH || ""}/`
    });
  }

  state.categories.forEach(category => {
    const threshold = notificationThreshold(category.percent);
    if (!threshold) return;
    items.push({
      key: `budget:${state.month}:category:${category.id}:${threshold}`,
      title: threshold >= 100 ? `${category.name} 已超支` : `${category.name} 接近预算`,
      body: `已使用 ${category.percent}%，已花 ${category.spent.toFixed(2)} / ${category.limit.toFixed(2)}。`,
      url: `${BASE_PATH || ""}/`
    });
  });

  return items;
}

async function checkBudgetNotifications() {
  const preferences = getNotificationPreferences();
  if (!preferences.pushEnabled || !preferences.budgetAlertsEnabled) return { sent: 0, removed: 0 };

  const state = buildState(loadData(), currentMonth());
  const candidates = budgetAlertCandidates(state).filter(item => !hasNotificationEvent(item.key));
  let sent = 0;
  let removed = 0;

  for (const item of candidates) {
    const result = await sendPushPayload({
      type: "budget-alert",
      title: item.title,
      body: item.body,
      url: item.url,
      tag: item.key
    });
    if (result.sent > 0) markNotificationEvent(item.key);
    sent += result.sent;
    removed += result.removed;
  }

  return { sent, removed };
}

async function checkDailyReminderNotification() {
  const preferences = getNotificationPreferences();
  if (!preferences.pushEnabled || !preferences.dailyReminderEnabled) return { sent: 0, removed: 0 };

  const now = localDateParts();
  const [targetHour, targetMinute] = preferences.dailyReminderTime.split(":").map(Number);
  if (now.hour !== targetHour || now.minute < targetMinute) return { sent: 0, removed: 0 };

  const date = currentDate();
  const eventKey = `daily:${date}:${preferences.dailyReminderTime}`;
  if (hasNotificationEvent(eventKey) || expenseCountForDate(date) > 0) return { sent: 0, removed: 0 };

  const result = await sendPushPayload({
    type: "daily-reminder",
    title: "今天还没有记账",
    body: "打开账本补一笔今天的消费。",
    url: `${BASE_PATH || ""}/`,
    tag: eventKey
  });

  if (result.sent > 0) markNotificationEvent(eventKey);
  return result;
}

let notificationCheckRunning = false;

async function runNotificationChecks() {
  if (notificationCheckRunning || !isPushConfigured()) return;
  notificationCheckRunning = true;
  try {
    await checkBudgetNotifications();
    await checkDailyReminderNotification();
  } catch (error) {
    if (error.message !== "push_subscription_missing") {
      console.error("Notification check failed:", error.message || error);
    }
  } finally {
    notificationCheckRunning = false;
  }
}

function startNotificationScheduler() {
  if (!isPushConfigured()) return;
  setInterval(runNotificationChecks, NOTIFICATION_CHECK_INTERVAL_MS).unref();
  runNotificationChecks();
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
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes()
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

function normalizeMonthlyBudgets(input, categories) {
  if (!input || typeof input !== "object") return {};
  const budgets = {};

  Object.entries(input).forEach(([month, value]) => {
    if (!isValidMonth(month) || !value || typeof value !== "object") return;

    const monthly = {};
    categories.forEach(category => {
      if (!Object.prototype.hasOwnProperty.call(value, category.id)) return;
      const amount = roundMoney(value[category.id]);
      if (Number.isFinite(amount) && amount >= 0) monthly[category.id] = amount;
    });

    if (Object.keys(monthly).length > 0) budgets[month] = monthly;
  });

  return budgets;
}

function normalizeTimestamp(value, fallback) {
  const text = String(value || "").trim();
  if (!text) return fallback;
  return Number.isNaN(new Date(text).getTime()) ? fallback : text;
}

function normalizeExpenses(input, categories, members) {
  if (!Array.isArray(input)) return [];

  return input
    .map(expense => {
      if (!expense || typeof expense !== "object") return null;

      const date = String(expense.date || "").trim();
      const amount = roundMoney(expense.amount);
      let categoryId = String(expense.categoryId || "").trim();
      let member = String(expense.member || "").trim();

      if (!isValidDate(date) || !Number.isFinite(amount) || amount <= 0) return null;
      if (!categoryId) categoryId = categories[0]?.id || "";
      if (!member) member = members[0] || "";
      if (!categoryId || !member) return null;

      const createdAt = normalizeTimestamp(expense.createdAt, new Date().toISOString());
      const normalized = {
        id: String(expense.id || "").trim(),
        date,
        member,
        categoryId,
        amount,
        note: String(expense.note || "").trim().slice(0, 80),
        createdAt
      };
      const updatedAt = normalizeTimestamp(expense.updatedAt, "");
      if (updatedAt) normalized.updatedAt = updatedAt;
      return normalized;
    })
    .filter(Boolean);
}

function normalizeImportedData(payload) {
  const source = payload?.data && typeof payload.data === "object" ? payload.data : payload;
  if (!source || typeof source !== "object") return null;

  const members = normalizeMembers(source.members) || DEFAULT_DATA.members;
  const categories = normalizeCategories(source.categories, DEFAULT_DATA.categories);
  if (!categories || categories.length === 0) return null;

  const normalized = {
    members,
    categories,
    monthlyBudgets: normalizeMonthlyBudgets(source.monthlyBudgets, categories),
    expenses: normalizeExpenses(source.expenses, categories, members)
  };
  ensureExpenseIds(normalized.expenses);
  return normalized;
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

  if (req.method === "GET" && url.pathname === "/api/push/public-key") {
    sendJson(res, 200, {
      configured: isPushConfigured(),
      publicKey: VAPID_PUBLIC_KEY
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/notifications/status") {
    sendJson(res, 200, notificationStatusPayload());
    return;
  }

  if (req.method === "PUT" && url.pathname === "/api/notifications/preferences") {
    const payload = await readJson(req);
    const preferences = saveNotificationPreferences(payload);
    if (!preferences.pushEnabled) {
      db.prepare("DELETE FROM push_subscriptions").run();
    }
    sendJson(res, 200, notificationStatusPayload());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/push/subscribe") {
    if (!isPushConfigured()) {
      sendJson(res, 400, { error: "push_not_configured" });
      return;
    }

    const payload = await readJson(req);
    const subscription = normalizeSubscription(payload.subscription || payload);
    if (!subscription) {
      sendJson(res, 400, { error: "invalid_push_subscription" });
      return;
    }

    savePushSubscription(subscription, req.headers["user-agent"]);
    saveNotificationPreferences({ ...getNotificationPreferences(), pushEnabled: true });
    sendJson(res, 200, notificationStatusPayload());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/push/unsubscribe") {
    const payload = await readJson(req);
    const endpoint = String(payload.endpoint || payload.subscription?.endpoint || "").trim();
    if (endpoint) deletePushSubscription(endpoint);
    saveNotificationPreferences({ ...getNotificationPreferences(), pushEnabled: false });
    sendJson(res, 200, notificationStatusPayload());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/push/test") {
    const result = await sendPushPayload({
      type: "test",
      title: "推送测试成功",
      body: "Money Ledger 已经可以发送提醒。",
      url: `${BASE_PATH || ""}/`,
      tag: `test-${Date.now()}`
    });
    sendJson(res, 200, { ok: true, ...result, status: notificationStatusPayload() });
    return;
  }

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

  if (req.method === "GET" && url.pathname === "/api/export.json") {
    send(res, 200, JSON.stringify({
      exportedAt: new Date().toISOString(),
      version: 1,
      data
    }, null, 2), "application/json; charset=utf-8");
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/import.json") {
    const payload = await readJson(req);
    const imported = normalizeImportedData(payload);
    if (!imported) {
      sendJson(res, 400, { error: "invalid_import" });
      return;
    }

    replaceAllData(imported);
    sendJson(res, 200, { ok: true, state: buildState(imported, month) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/clear") {
    const payload = await readJson(req);
    if (payload.confirm !== "CLEAR_ALL") {
      sendJson(res, 400, { error: "invalid_confirmation" });
      return;
    }

    const cleared = {
      ...DEFAULT_DATA,
      members: [...DEFAULT_DATA.members],
      categories: DEFAULT_DATA.categories.map(category => ({ ...category })),
      monthlyBudgets: {},
      expenses: []
    };
    replaceAllData(cleared);
    sendJson(res, 200, { ok: true, state: buildState(cleared, month) });
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
    insertExpense(expense);
    const nextState = buildState(loadData(), date.slice(0, 7));
    checkBudgetNotifications().catch(error => {
      if (error.message !== "push_subscription_missing") {
        console.error("Budget notification failed:", error.message || error);
      }
    });
    sendJson(res, 201, { expense, state: nextState });
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
    if (!data.members.includes(member) && member !== expense.member) {
      sendJson(res, 400, { error: "invalid_member" });
      return;
    }

    const updatedExpense = {
      ...expense,
      date,
      member,
      categoryId,
      amount,
      note,
      updatedAt: new Date().toISOString()
    };
    updateExpense(expense.id, updatedExpense);
    sendJson(res, 200, { expense: updatedExpense, state: buildState(loadData(), month) });
    return;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/expenses/")) {
    const id = decodeURIComponent(url.pathname.replace("/api/expenses/", ""));
    if (!deleteExpenseById(id)) {
      sendJson(res, 404, { error: "expense_not_found" });
      return;
    }
    sendJson(res, 200, { ok: true, state: buildState(loadData(), month) });
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

    const nextMembers = members || data.members;
    saveSettingsData(nextMembers, categories, safeMonth);
    checkBudgetNotifications().catch(error => {
      if (error.message !== "push_subscription_missing") {
        console.error("Budget notification failed:", error.message || error);
      }
    });
    sendJson(res, 200, buildState(loadData(), safeMonth));
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
    const shouldInjectBasePath = [".html", ".css", ".js", ".webmanifest"].includes(extension);
    const body = shouldInjectBasePath ? applyBasePath(content.toString("utf8")) : content;
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "Cache-Control": staticCacheControl(extension, pathname),
      "X-Content-Type-Options": "nosniff"
    });
    res.end(body);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = stripBasePath(url.pathname);
  if (!pathname) {
    notFound(res);
    return;
  }
  url.pathname = pathname;

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

initDatabase();
initPushService();
startNotificationScheduler();

server.listen(PORT, () => {
  console.log(`Money Ledger PWA running at http://localhost:${PORT}${BASE_PATH || ""}`);
  console.log(`SQLite data file: ${SQLITE_FILE}`);
  if (!TOKEN) {
    console.log("LEDGER_TOKEN is not set. Set it before deploying to a public server.");
  }
  if (!isPushConfigured()) {
    console.log("Web Push is not configured. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to enable notifications.");
  }
});
