/* Service Worker — Network-First für die eigene App (immer frisch online,
   offline aus dem Cache). Spotify-Domains werden NIE angefasst. */
const CACHE = 'carplay-v6';
const ASSETS = [
  '.',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/app.js',
  'js/appicons.js',
  'js/auth.js',
  'js/spotify.js',
  'js/ui.js',
  'js/player.js',
  'js/playlists.js',
  'js/devices.js',
  'js/settings.js',
  'js/decor.js',
  'js/search.js',
  'js/recent.js',
  'js/queue.js',
  'js/library.js',
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

  // Network-First mit Server-Revalidierung: Same-Origin-Dateien per
  // cache:'no-cache' immer gegen den Server prüfen (schnelles 304 wenn gleich,
  // frisches 200 wenn geändert). Sonst würde der HTTP-Cache alte JS/CSS bis zu
  // 10 Min halten und frische Deploys erst verzögert greifen. Cache nur als
  // Offline-Fallback.
  const sameOrigin = url.origin === self.location.origin;
  let networkReq = e.request;
  if (sameOrigin) {
    try { networkReq = new Request(e.request, { cache: 'no-cache' }); }
    catch (err) { networkReq = e.request; }
  }
  e.respondWith(
    fetch(networkReq).then((res) => {
      if (sameOrigin && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
