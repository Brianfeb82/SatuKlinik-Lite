const CACHE_NAME = 'satuklinik-v1';
const RUNTIME = 'runtime';

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([
      '/',
      '/manifest.json',
      '/icon-192.png',
      '/icon-512.png'
    ]))
  );
  self.skipWaiting();
});

// Activate - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => 
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== RUNTIME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache (for API), cache first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API requests: network first
  if (url.pathname.startsWith('/api') || url.port === '3001') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(RUNTIME).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
  
  // Static assets: cache first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
