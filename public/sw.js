const CACHE_NAME = 'tiny-fixers-v1';
const ASSETS_TO_CACHE = [
  '/tiny-fixers/',
  '/tiny-fixers/index.html',
  '/tiny-fixers/manifest.json',
  '/tiny-fixers/privacy.html',
  '/tiny-fixers/assets/icons/icon-192.png',
  '/tiny-fixers/assets/icons/icon-512.png',
  '/tiny-fixers/assets/icons/icon-maskable-192.png',
  '/tiny-fixers/assets/icons/icon-maskable-512.png',
  '/tiny-fixers/assets/icons/apple-touch-icon.png',
  '/tiny-fixers/assets/icons/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      });
    })
  );
});
