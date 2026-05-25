const CACHE_NAME = "money-ledger-v27";
const BASE_PATH = "__BASE_PATH__";
const ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/styles.css`,
  `${BASE_PATH}/app.js`,
  `${BASE_PATH}/manifest.webmanifest`,
  `${BASE_PATH}/icon.svg`,
  `${BASE_PATH}/hello-kitty-soft.jpg`,
  `${BASE_PATH}/hello-kitty-red.jpg`
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
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

self.addEventListener("fetch", event => {
  const requestUrl = new URL(event.request.url);
  if (!requestUrl.pathname.startsWith(`${BASE_PATH}/`)) return;
  if (requestUrl.pathname.startsWith(`${BASE_PATH}/api/`)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
