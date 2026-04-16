const CACHE_NAME = 'life-game-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/state.js',
  './js/components.js',
  './js/engine.js',
  './js/ui_manager.js',
  './js/app.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
