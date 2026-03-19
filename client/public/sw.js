const CACHE_NAME = 'cardly-v14';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
];

// Install — cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip API requests
  if (request.url.includes('/api/')) return;
  
  // Skip upload requests
  if (request.url.includes('/uploads/')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || caches.match('/');
        });
      })
  );
});
