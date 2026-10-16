const CACHE = 'gbc-1.0.67';
const PRE = ['/', '/offline.html', '/worker.js', '/algorithm.js', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];
const HUB_RE = /nick-sites-hub\.tekjeep\.workers\.dev|\/api\/|railway\.app|firebaseio\.com|googleapis\.com|cloudflareinsights|buymeacoffee/i;
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRE.map((u) => new Request(u, { cache: 'reload' }))).catch(() => {})));
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
  if (HUB_RE.test(url.href) || url.pathname.startsWith('/api') || url.pathname.startsWith('/v1/')) return;
  const isNav = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isNav) {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone()).catch(() => {});
        return fresh;
      } catch {
        return (await caches.match(req)) || (await caches.match('/offline.html')) || Response.error();
      }
    })());
    return;
  }
  if (/\.(?:js|css|png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf|json|webmanifest)$/i.test(url.pathname)) {
    // Stale-while-revalidate: instant from cache, refreshed in the background so fixes reach returning visitors.
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      const network = fetch(req).then((fresh) => {
        if (fresh.ok) cache.put(req, fresh.clone()).catch(() => {});
        return fresh;
      });
      if (cached) { e.waitUntil(network.catch(() => {})); return cached; }
      try { return await network; } catch { return Response.error(); }
    })());
  }
});
