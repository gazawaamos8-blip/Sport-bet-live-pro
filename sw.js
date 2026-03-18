const CACHE_NAME = 'sportbot-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://raw.githubusercontent.com/gazawaamos8-blip/Mon-icon-/refs/heads/main/sportbot-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
