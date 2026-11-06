/* Service Worker — Cache-First für die statische App-Hülle.
   Spotify-API-Calls (accounts./api.spotify.com) werden NIE gecacht. */
const CACHE = 'carplay-v1';
const ASSETS = [
  '.',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/app.js',
  'js/appicons.js',
  'js/auth.js',
  'js/spotify.js',
  'js/player.js',
  'js/playlists.js',
  'js/devices.js',
  'js/settings.js',
  'js/decor.js',
  'config.js',
  'icons/app-icon-180.png',
  'icons/app-icon-192.png',
  'icons/app-icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // einzeln hinzufügen, damit ein fehlendes optionales Asset den Install nicht killt
      Promise.allSettled(ASSETS.map((a) => c.add(a)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Spotify-Domains immer direkt aus dem Netz
  if (url.hostname.endsWith('spotify.com')) return;
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit || fetch(e.request).then((res) => {
        // nur gleiche Herkunft nachcachen
        if (url.origin === self.location.origin && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit)
    )
  );
});
