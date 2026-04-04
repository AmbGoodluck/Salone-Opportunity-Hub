const CACHE_NAME = 'salone-hub-v1';
const OFFLINE_URL = '/';

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET' || request.url.startsWith('chrome-extension://')) return;

  // Network-first for API and auth routes
  if (request.url.includes('/api/') || request.url.includes('/auth/')) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // Cache-first for static assets (images, fonts, icons)
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.url.includes('/icons/')
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
    return;
  }

  // Stale-while-revalidate for pages
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => cached || caches.match(OFFLINE_URL));
      return cached || fetched;
    })
  );
});
