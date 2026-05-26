const CACHE_NAME = "money-ledger-v32";
const BASE_PATH = "__BASE_PATH__";
const ASSET_VERSION = "32";
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
