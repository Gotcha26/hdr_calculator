// service-worker.js - Gestion du cache pour mode hors-ligne PWA

const CACHE_NAME = 'hdr-calculator-v1';

// Fichiers à mettre en cache pour le mode hors-ligne
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

// Ressources externes à mettre en cache
const EXTERNAL_ASSETS = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap'
];

// Installation : mise en cache des ressources statiques
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Mise en cache des ressources statiques');
        // Cache les ressources locales
        return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http')))
          .catch(err => {
            console.warn('⚠️ Certaines ressources locales non cachées:', err);
          });
      })
      .then(() => {
        // Cache les ressources externes séparément (peuvent échouer)
        return caches.open(CACHE_NAME).then(cache => {
          return Promise.allSettled(
            EXTERNAL_ASSETS.map(url => 
              fetch(url, { mode: 'cors' })
                .then(response => {
                  if (response.ok) {
                    return cache.put(url, response);
                  }
                })
                .catch(() => console.warn(`⚠️ Impossible de cacher: ${url}`))
            )
          );
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activation');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log(`🗑️ Service Worker: Suppression ancien cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch : stratégie Cache First avec fallback Network
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Ignorer les requêtes chrome-extension et autres
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Retourner le cache si disponible
        if (cachedResponse) {
          // En arrière-plan, mettre à jour le cache (stale-while-revalidate)
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.ok) {
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(event.request, networkResponse));
              }
            })
            .catch(() => {}); // Ignorer les erreurs réseau silencieusement
          
          return cachedResponse;
        }
        
        // Sinon, fetch depuis le réseau
        return fetch(event.request)
          .then((networkResponse) => {
            // Mettre en cache la nouvelle ressource
            if (networkResponse && networkResponse.ok) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback pour les pages HTML : retourner index.html
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/index.html');
            }
            // Pour les autres ressources, retourner une erreur
            return new Response('Hors ligne', { status: 503 });
          });
      })
  );
});

// Gestion des messages (pour forcer la mise à jour)
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

console.log('🚀 Service Worker chargé');