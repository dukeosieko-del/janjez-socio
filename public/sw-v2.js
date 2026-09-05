const CACHE_NAME = 'janjez-social-v4';

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      try {
        if (typeof caches !== 'undefined') {
          const cache = await caches.open(CACHE_NAME);
          await cache.addAll(['/', '/manifest.json']);
        }
        await self.skipWaiting();
      } catch (err) {
        console.error('[sw] install failed:', err);
        await self.skipWaiting();
      }
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      try {
        if (typeof caches !== 'undefined') {
          const keys = await caches.keys();
          await Promise.all(
            keys.map(key => key !== CACHE_NAME ? caches.delete(key).catch(() => {}) : undefined)
          );
        }
        await self.clients.claim();
      } catch (err) {
        console.error('[sw] activate failed:', err);
        await self.clients.claim();
      }
    })()
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (request.destination === 'document' && request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        if (typeof caches !== 'undefined') {
          return caches.match('/').catch(() => fetch(request));
        }
        return fetch(request);
      })
    );
    return;
  }

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/images/')) {
    event.respondWith(
      (async () => {
        try {
          if (typeof caches === 'undefined') return fetch(request);
          const cached = await caches.match(request);
          if (cached) return cached;
          const response = await fetch(request);
          if (response && response.status === 200) {
            const clone = response.clone();
            await caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {});
          }
          return response;
        } catch (err) {
          console.error('[sw] fetch failed:', err);
          return fetch(request);
        }
      })()
    );
    return;
  }

  return;
});
