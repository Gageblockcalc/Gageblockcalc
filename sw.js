/* nick-sites-hub shared offline SW — network-first HTML, cache-first static; never cache API/hub */
const CACHE = 'nick-pwa-v1';
const HUB_RE = /nick-sites-hub\.tekjeep\.workers\.dev|\/api\/|railway\.app|firebaseio\.com|googleapis\.com|cloudflareinsights/i;

self.addEventListener('install', (e) => {
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (HUB_RE.test(url.href) || url.pathname.startsWith('/api') || url.search.includes('site=')) return;
  if ((req.headers.get('accept') || '').includes('text/html') || req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const copy = fresh.clone();
        const cache = await caches.open(CACHE);
        cache.put(req, copy).catch(() => {});
        return fresh;
      } catch (err) {
        const cached = await caches.match(req);
        return cached || caches.match('/') || Response.error();
      }
    })());
    return;
  }
  // static assets: cache-first
  if (/\.(?:js|css|png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf|webp|json|webmanifest)$/i.test(url.pathname) || url.pathname === '/manifest.webmanifest' || url.pathname === '/manifest.json') {
    e.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const fresh = await fetch(req);
      const cache = await caches.open(CACHE);
      cache.put(req, fresh.clone()).catch(() => {});
      return fresh;
    })());
  }
});
