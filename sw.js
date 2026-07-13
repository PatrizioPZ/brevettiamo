const CACHE_NAME = 'brevettiamo-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/pwa.html',
  '/manifest.json'
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
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxOTIgMTkyIj48cmVjdCB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgZmlsbD0iIzFhM2E1YyIgcng9IjI0Ii8+PGNpcmNsZSBjeD0iOTYiIGN5PSI5NiIgcj0iNzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2M5YTg0YyIgc3Ryb2tlLXdpZHRoPSI0Ii8+PGNpcmNsZSBjeD0iOTYiIGN5PSI5NiIgcj0iNTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2M5YTg0YyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI4IDgiLz48Y2lyY2xlIGN4PSI5NiIgY3k9Ijk2IiByPSI0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzlhODRjIiBzdHJva2Utd2lkdGg9IjEiLz48ZWxsaXBzZSBjeD0iOTYiIGN5PSI5NiIgcng9IjM1IiByeT0iMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2M5YTg0YyIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iOTYiIGN5PSI5NiIgcj0iMTIiIGZpbGw9IiNjOWE4NGMiIG9wYWNpdHk9IjAuMyIvPjxjaXJjbGUgY3g9Ijk2IiBjeT0iOTYiIHI9IjYiIGZpbGw9IiNjOWE4NGMiLz48bGluZSB4MT0iOTYiIHkxPSIyNiIgeDI9Ijk2IiB5Mj0iNDYiIHN0cm9rZT0iI2M5YTg0YyIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9Ijk2IiB5MT0iMTQ2IiB4Mj0iOTYiIHkyPSIxNjYiIHN0cm9rZT0iI2M5YTg0YyIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjI2IiB5MT0iOTYiIHgyPSI0NiIgeTI9Ijk2IiBzdHJva2U9IiNjOWE4NGMiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIxNDYiIHkxPSI5NiIgeDI9IjE2NiIgeTI9Ijk2IiBzdHJva2U9IiNjOWE4NGMiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==',
      badge: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxOTIgMTkyIj48cmVjdCB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgZmlsbD0iIzFhM2E1YyIgcng9IjI0Ii8+PGNpcmNsZSBjeD0iOTYiIGN5PSI5NiIgcj0iNzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2M5YTg0YyIgc3Ryb2tlLXdpZHRoPSI0Ii8+PGNpcmNsZSBjeD0iOTYiIGN5PSI5NiIgcj0iNTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2M5YTg0YyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI4IDgiLz48Y2lyY2xlIGN4PSI5NiIgY3k9Ijk2IiByPSI0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzlhODRjIiBzdHJva2Utd2lkdGg9IjEiLz48ZWxsaXBzZSBjeD0iOTYiIGN5PSI5NiIgcng9IjM1IiByeT0iMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2M5YTg0YyIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iOTYiIGN5PSI5NiIgcj0iMTIiIGZpbGw9IiNjOWE4NGMiIG9wYWNpdHk9IjAuMyIvPjxjaXJjbGUgY3g9Ijk2IiBjeT0iOTYiIHI9IjYiIGZpbGw9IiNjOWE4NGMiLz48bGluZSB4MT0iOTYiIHkxPSIyNiIgeDI9Ijk2IiB5Mj0iNDYiIHN0cm9rZT0iI2M5YTg0YyIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9Ijk2IiB5MT0iMTQ2IiB4Mj0iOTYiIHkyPSIxNjYiIHN0cm9rZT0iI2M5YTg0YyIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjI2IiB5MT0iOTYiIHgyPSI0NiIgeTI9Ijk2IiBzdHJva2U9IiNjOWE4NGMiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIxNDYiIHkxPSI5NiIgeDI9IjE2NiIgeTI9Ijk2IiBzdHJva2U9IiNjOWE4NGMiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==',
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
