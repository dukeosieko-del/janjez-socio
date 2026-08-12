const BUILD_ID = self.location.pathname.includes('/sw.js') ? 'v1' : 'v1';
const CACHE_NAME = 'janjez-social-' + BUILD_ID;
const STATIC_URLS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/janjez-logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;

  if (url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/auth/') ||
      url.pathname.startsWith('/admin/') ||
      url.pathname.startsWith('/dashboard') ||
      url.pathname.startsWith('/orders') ||
      url.pathname.startsWith('/services')) {
    event.respondWith(fetch(event.request));
    return;
  }

  const isStaticAsset =
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|eot)$/) ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/' ||
    STATIC_URLS.includes(url.pathname);

  event.respondWith(
    isStaticAsset
      ? caches.match(event.request).then(response => {
          if (response) return response;
          return fetch(event.request).then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200) return networkResponse;
            const toCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
            return networkResponse;
          });
        })
      : fetch(event.request)
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
