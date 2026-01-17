const CACHE_NAME = 'dailyStreak-v1.0.0';
const FILES_TO_CACHE = [
  '/DailyStreak/',           // Important pour GitHub Pages
  '/DailyStreak/index.html',
  '/DailyStreak/style.css',
  '/DailyStreak/app.js',
  '/DailyStreak/pwa.js',
  '/DailyStreak/manifest.json',
  '/DailyStreak/icons/icon-192.png',
  '/DailyStreak/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  console.log('⚙️ Service Worker installé');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Mise en cache des ressources');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activé');
  
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Suppression du cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Fallback pour la page d'accueil
            if (event.request.mode === 'navigate') {
              return caches.match('/DailyStreak/index.html');
            }
            return null;
          });
      })
  );
});