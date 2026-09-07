const V = 'guide-hub-v2';
const CDN = [
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-jp-dynamic-subset.css'
];

const SHELL = [
  './index.html', './support.js', './manifest.webmanifest', './units-textbook.json',
  './icon-192.png', './icon-512.png', './icon-180.png', './icon-64.png', './icon-maskable-512.png',
  './components/icon-bundle.js', './components/Components.bundle.js', './components/fig-tokens.css',
  './components/fig-assets.css', './components/legacy/fig-assets.css',
  './components/legacy/assets/879e8c5783b70f45.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => Promise.all([
    Promise.all(SHELL.map((u) => c.add(u).catch(() => null))),
    Promise.all(CDN.map((u) => c.add(new Request(u, { mode: 'no-cors' })).catch(() => null)))
  ])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => {
      const copy = r.clone();
      caches.open(V).then((c) => c.put(req, copy));
      return r;
    }).catch(() => hit)));
    return;
  }

  if (url.pathname.endsWith('.json')) {
    e.respondWith(
      fetch(req).then((r) => {
        const copy = r.clone();
        caches.open(V).then((c) => c.put(req, copy));
        return r;
      }).catch(() => caches.match(req))
    );
    return;
  }

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((r) => {
      const copy = r.clone();
      caches.open(V).then((c) => c.put(req, copy));
      return r;
    }))
  );
});
