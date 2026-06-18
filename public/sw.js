const CACHE_NAME = "money-ledger-v44";
const BASE_PATH = "__BASE_PATH__";
const ASSET_VERSION = "44";
const ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/styles.css?v=${ASSET_VERSION}`,
  `${BASE_PATH}/app.js?v=${ASSET_VERSION}`,
  `${BASE_PATH}/manifest.webmanifest`,
  `${BASE_PATH}/icon.svg`,
  `${BASE_PATH}/hello-kitty-soft.jpg`,
  `${BASE_PATH}/hello-kitty-red.jpg`
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(ASSETS.map(asset => cache.add(asset)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)))
    )
  );
  self.clients.claim();
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  const basePrefix = BASE_PATH ? `${BASE_PATH}/` : "/";
  if (BASE_PATH && requestUrl.pathname !== BASE_PATH && !requestUrl.pathname.startsWith(basePrefix)) return;
  if (requestUrl.pathname.startsWith(`${basePrefix}api/`)) return;

  if (event.request.mode === "navigate") {
    event.respondWith(navigationResponse(event.request));
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request));
});

self.addEventListener("push", event => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { body: event.data.text() };
    }
  }

  const title = payload.title || "月度预算";
  const options = {
    body: payload.body || "",
    icon: payload.icon || `${BASE_PATH}/icon.svg`,
    badge: payload.badge || `${BASE_PATH}/icon.svg`,
    tag: payload.tag || "money-ledger",
    data: {
      url: payload.url || `${BASE_PATH}/`
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || `${BASE_PATH}/`, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
      const existing = clients.find(client => client.url === targetUrl || client.url.startsWith(targetUrl));
      if (existing) return existing.focus();
      return self.clients.openWindow(targetUrl);
    })
  );
});

async function navigationResponse(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request) || await cache.match(`${BASE_PATH}/index.html`) || await cache.match(`${BASE_PATH}/`);
  if (cached) {
    fetchAndCache(cache, request).catch(() => {});
    return cached;
  }
  return fetchAndCache(cache, request);
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    fetchAndCache(cache, request).catch(() => {});
    return cached;
  }
  return fetchAndCache(cache, request);
}

async function fetchAndCache(cache, request) {
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}
