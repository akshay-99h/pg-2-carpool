const CACHE_NAME = 'pg2-carpool-v6';

// Only the offline fallback and brand assets are precached. `/` and `/login`
// are deliberately NOT precached: both can respond with a redirect depending on
// session state, and a redirected response cannot be replayed for a navigation.
const SHELL_ASSETS = [
  '/offline',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/branding/pg2-mark.svg',
];
const STATIC_PATH_PREFIXES = ['/_next/static/', '/icons/', '/branding/'];

function isStaticAssetRequest(request, pathname) {
  if (STATIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  return ['style', 'script', 'image', 'font'].includes(request.destination);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Individual failures must not abort the whole install.
      Promise.all(
        SHELL_ASSETS.map((asset) =>
          cache.add(asset).catch(() => {
            /* asset unavailable at install time */
          })
        )
      )
    )
  );

  // NOTE: no skipWaiting() here on purpose. The new worker stays in `waiting`
  // so the in-app update banner can ask the user before we activate and reload,
  // instead of reloading out from under someone mid-form.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((key) => (key === CACHE_NAME ? Promise.resolve() : caches.delete(key))))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin || requestUrl.pathname.startsWith('/api/')) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        // Serve the page itself if we happen to have it, otherwise a real
        // offline screen — never the marketing landing page.
        const cached = await caches.match(event.request);
        if (cached) {
          return cached;
        }
        const offline = await caches.match('/offline');
        return offline || Response.error();
      })
    );
    return;
  }

  if (!isStaticAssetRequest(event.request, requestUrl.pathname)) {
    return;
  }

  // Stale-while-revalidate for immutable-ish static assets.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((response) => {
        if (response?.ok) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        }
        return response;
      });

      if (cached) {
        return cached;
      }

      return networkFetch.catch(() => caches.match('/offline'));
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
