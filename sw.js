const CACHE_NAME = 'brevettiamo-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/pwa.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: network only
  if (url.pathname.startsWith('/api/') || url.pathname.includes('supabase')) {
    event.respondWith(fetch(request));
    return;
  }

  // Static assets: cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Fallback for HTML pages
        if (request.mode === 'navigate') {
          return caches.match('/pwa.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Background sync for file uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-files') {
    event.waitUntil(syncFiles());
  }
});

async function syncFiles() {
  try {
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((client) => {
      client.postMessage({ type: 'SYNC_FILES' });
    });
  } catch (err) {
    console.error('Sync failed:', err);
  }
}

// Push notifications (prepared for future)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'BrevettIAmo', {
      body: data.body || 'Nuovo aggiornamento',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'default',
      requireInteraction: false
    })
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/pwa.html')
  );
});
