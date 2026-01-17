const CACHE_NAME = 'dailyStreak-v2.0.0';

// TOUS LES CHEMINS EN RELATIF (./) !
const FILES_TO_CACHE = [
  './index.html',
  './style.css',
  './app.js',
  './pwa-install.js',              
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
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
          console.log('📦 Servi depuis cache:', event.request.url);
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Cloner la réponse pour la mettre en cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
                console.log('🌐 Mis en cache:', event.request.url);
              });
            
            return response;
          })
          .catch((error) => {
            console.log('❌ Erreur fetch, fallback:', error);
            
            // Fallback pour la navigation
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            
            // Fallback pour les icônes
            if (event.request.url.includes('icon')) {
              return caches.match('./icons/icon-192.png');
            }
            
            return new Response('Application hors ligne', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});
