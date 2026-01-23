// service-worker.js - Phase 2 (sans premium)

const CACHE_NAME = 'hdr-calculator-v2';

// Fichiers à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/theme.css',
  '/styles.js',
  '/App.jsx',
  '/version.js',
  // Data
  '/data/photoDatabase.js',
  // i18n
  '/i18n/index.js',
  '/i18n/fr.js',
  '/i18n/en.js',
  // Utils
  '/utils/utils.js',
  '/utils/calculationEngine.js',
  '/utils/validationEngine.js',
  '/utils/helpers.js',
  // Components
  '/components/Header.jsx',
  '/components/Menu.jsx',
  '/components/Footer.jsx',
  '/components/MainSection.jsx',
  '/components/CorrectionISO.jsx',
  '/components/CorrectionAperture.jsx',
  '/components/RangePleine.jsx',
  '/components/SettingsPage.jsx',
  // Icons
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png'
];

// Installation
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker v2: Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Mise en cache des ressources');
        return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http')))
          .catch(err => console.warn('⚠️ Certaines ressources non cachées:', err));
      })
      .then(() => self.skipWaiting())
  );
});

// Activation
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker v2: Activation');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log(`🗑️ Suppression ancien cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Mise à jour en arrière-plan
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.ok) {
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(event.request, networkResponse));
              }
            })
            .catch(() => {});
          
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => {
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/index.html');
            }
            return new Response('Hors ligne', { status: 503 });
          });
      })
  );
});

// Messages
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

console.log('🚀 Service Worker v2 chargé');