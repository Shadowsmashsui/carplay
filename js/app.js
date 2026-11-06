/* =========================================================
   app.js — Shell: Icon-Registry, Screen-Router, Dock,
   Home-Raster, Uhr, PWA-Registrierung, Login-Gate.
   ========================================================= */
import * as auth from './auth.js';
import { getAppIcon } from './appicons.js';

/* ---------- SVG-Icons (inline, einfarbig, fill=currentColor) ---------- */
export const ICONS = {
  music: '<svg viewBox="0 0 24 24"><path d="M9 17V5l10-2v11"/><circle cx="6.5" cy="17.5" r="2.6"/><circle cx="16.5" cy="14.5" r="2.6"/></svg>',
  list: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="12" height="2.4" rx="1.2"/><rect x="3" y="11" width="12" height="2.4" rx="1.2"/><rect x="3" y="17" width="9" height="2.4" rx="1.2"/><circle cx="18.5" cy="16.5" r="2.4"/><rect x="20.3" y="7" width="1.6" height="9.5"/></svg>',
  maps: '<svg viewBox="0 0 24 24"><path d="M12 2a6 6 0 0 0-6 6c0 4.2 6 12 6 12s6-7.8 6-12a6 6 0 0 0-6-6zm0 8.2A2.2 2.2 0 1 1 12 5.8a2.2 2.2 0 0 1 0 4.4z"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><path d="M19.4 13a7.8 7.8 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1l-.4-2.6H10.9l-.4 2.6a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4L4.4 11a7.8 7.8 0 0 0 0 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.7 1.7 1l.4 2.6h4.2l.4-2.6c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.6zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.3a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .58 3.6 1 1 0 0 1-.24 1z"/></svg>',
  messages: '<svg viewBox="0 0 24 24"><path d="M12 3C6.9 3 3 6.3 3 10.4c0 2.2 1.1 4.1 2.9 5.5-.2 1.2-.8 2.3-1.7 3.1 1.6-.1 3.1-.6 4.3-1.4 1 .3 2.1.5 3.5.5 5.1 0 9-3.3 9-7.7S17.1 3 12 3z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="16" rx="3"/><rect x="3.5" y="4.5" width="17" height="5" rx="3" fill="#ff3b30"/><rect x="7" y="2.5" width="2" height="4" rx="1" fill="#ff3b30"/><rect x="15" y="2.5" width="2" height="4" rx="1" fill="#ff3b30"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.3" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M12 7v5.4l3.4 2" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>',
  home: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
};

/* ---------- App-Katalog ---------- */
/* dock: erscheint standardmäßig in der linken Leiste. */
export const APP_CATALOG = [
  { id: 'player',    label: 'Jetzt läuft',   dock: true },
  { id: 'playlists', label: 'Playlists',     dock: true },
  { id: 'search',    label: 'Suche',         dock: true },
  { id: 'recent',    label: 'Zuletzt gespielt' },
  { id: 'queue',     label: 'Warteschlange' },
  { id: 'library',   label: 'Bibliothek' },
  { id: 'maps',      label: 'Karten' },
  { id: 'settings',  label: 'Einstellungen', dock: true },
  { id: 'phone',     label: 'Telefon' },
  { id: 'messages',  label: 'Nachrichten' },
  { id: 'calendar',  label: 'Kalender' },
  { id: 'clock',     label: 'Uhr' },
];

function readJsonArray(key) {
  try { const v = JSON.parse(localStorage.getItem(key)); return Array.isArray(v) ? v : []; }
  catch (e) { return []; }
}

/** Apps in gespeicherter Reihenfolge + hidden-Flag. */
export function getApps() {
  const order = readJsonArray('appOrder');
  const hidden = readJsonArray('appsHidden');
  const byId = Object.fromEntries(APP_CATALOG.map(a => [a.id, a]));
  const seen = new Set();
  const out = [];
  for (const id of order) { if (byId[id] && !seen.has(id)) { out.push(byId[id]); seen.add(id); } }
  for (const a of APP_CATALOG) { if (!seen.has(a.id)) { out.push(a); seen.add(a.id); } }
  return out.map(a => ({ ...a, hidden: hidden.includes(a.id) }));
}
export function getVisibleApps() { return getApps().filter(a => !a.hidden); }

/** Dock + Home neu aufbauen (nach Einstellungs-Änderung). */
export function rebuildShell() {
  buildDock();
  if (currentId === 'home') { currentId = null; showScreen('home'); }
}

/* ---------- Screen-Registry & Router ---------- */
const screens = {};
let currentId = null;
let currentDef = null;

/** Screen registrieren. def: { render(root), onEnter?(), onLeave?() } */
export function registerScreen(id, def) {
  screens[id] = def;
}

/** Aktiven Screen wechseln (mit Überblendung). */
export function showScreen(id) {
  if (id === currentId) return;
  const root = document.getElementById('screen-root');

  // alten Screen verlassen
  if (currentDef && typeof currentDef.onLeave === 'function') {
    try { currentDef.onLeave(); } catch (e) { console.error(e); }
  }

  const def = screens[id] || placeholderScreen(id);
  currentId = id;
  currentDef = def;

  const el = document.createElement('section');
  el.className = 'screen';
  try { def.render(el); } catch (e) { console.error(e); }

  root.replaceChildren(el);
  // enter-Animation im nächsten Frame
  requestAnimationFrame(() => el.classList.add('enter'));

  if (typeof def.onEnter === 'function') {
    try { def.onEnter(el); } catch (e) { console.error(e); }
  }
  updateDockActive(id);
}

/** Fallback für (noch) nicht registrierte Apps. */
function placeholderScreen(id) {
  const app = APP_CATALOG.find(a => a.id === id);
  const name = app ? app.label : id;
  return {
    render(root) {
      root.innerHTML = `
        <div class="center-note">
          <div>
            <div class="big">${name}</div>
            <div class="sub">In dieser Version noch nicht verfügbar.</div>
          </div>
        </div>`;
    }
  };
}

/* ---------- Home-Screen (App-Raster) ---------- */
registerScreen('home', {
  render(root) {
    const wrap = document.createElement('div');
    wrap.className = 'home-wrap';

    const grid = document.createElement('div');
    grid.className = 'home-grid';
    for (const app of getVisibleApps()) {
      const tile = document.createElement('button');
      tile.className = 'app-tile';
      tile.innerHTML = `
        <span class="icon">${getAppIcon(app.id)}</span>
        <span class="label">${app.label}</span>`;
      tile.addEventListener('click', () => showScreen(app.id));
      grid.appendChild(tile);
    }
    wrap.appendChild(grid);

    const dots = document.createElement('div');
    dots.className = 'page-dots';
    dots.innerHTML = '<span class="dot active"></span><span class="dot"></span>';
    wrap.appendChild(dots);

    root.appendChild(wrap);
  }
});

/* ---------- Dock aufbauen ---------- */
function buildDock() {
  const dockApps = document.getElementById('dock-apps');
  dockApps.replaceChildren();
  for (const app of getVisibleApps().filter(a => a.dock)) {
    const btn = document.createElement('button');
    btn.className = 'dock-app';
    btn.dataset.id = app.id;
    btn.title = app.label;
    btn.innerHTML = getAppIcon(app.id);
    btn.addEventListener('click', () => showScreen(app.id));
    dockApps.appendChild(btn);
  }
  document.getElementById('dock-home').addEventListener('click', () => showScreen('home'));
}

function updateDockActive(id) {
  document.querySelectorAll('.dock-app').forEach(b => {
    b.classList.toggle('active', b.dataset.id === id);
  });
}

/* ---------- Uhr ---------- */
function startClock() {
  const el = document.getElementById('clock');
  const tick = () => {
    const d = new Date();
    const fmt = (localStorage.getItem('clockFormat') || '24');
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    if (fmt === '12') {
      const ap = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      el.textContent = `${h}:${m} ${ap}`;
    } else {
      el.textContent = `${String(h).padStart(2, '0')}:${m}`;
    }
  };
  tick();
  setInterval(tick, 1000);
}

/* ---------- Service Worker ---------- */
function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(err =>
        console.warn('SW-Registrierung fehlgeschlagen:', err));
    });
  }
}

/* ---------- Screen-Module nachladen (fehlertolerant) ---------- */
async function loadScreenModules() {
  const mods = ['player.js', 'playlists.js', 'devices.js', 'settings.js', 'decor.js',
    'search.js', 'recent.js', 'queue.js', 'library.js'];
  for (const m of mods) {
    try { await import(`./${m}`); }
    catch (e) { /* Modul existiert in diesem Task evtl. noch nicht */ }
  }
}

/* ---------- Login-Screen ---------- */
function showLogin() {
  const app = document.getElementById('app');
  const ov = document.createElement('div');
  ov.className = 'login-overlay';
  ov.innerHTML = `
    <div class="login-card panel">
      <div class="login-logo ${/*grün*/''}">${ICONS.music}</div>
      <h1>CarPlay</h1>
      <p>Mit Spotify verbinden, um deine Musik zu steuern.</p>
      <button id="login-btn" class="login-btn">Mit Spotify verbinden</button>
      <button id="skip-btn" class="skip-btn">Ohne Login ansehen</button>
    </div>`;
  app.appendChild(ov);
  ov.querySelector('#login-btn').addEventListener('click', () => auth.login());
  ov.querySelector('#skip-btn').addEventListener('click', () => {
    ov.remove();
    enterUI();
  });
}

function enterUI() {
  showScreen('home');
}

/* ---------- Start ---------- */
async function boot() {
  buildDock();
  startClock();
  registerSW();

  // Spotify-Redirect verarbeiten (nach Login kehrt man mit ?code zurück)
  let loggedIn = false;
  try {
    await auth.handleRedirectCallback();
    loggedIn = auth.isLoggedIn();
  } catch (e) { console.error(e); }

  await loadScreenModules();
  if (window.__applyWallpaper) { try { window.__applyWallpaper(); } catch (e) {} }
  if (window.__applyTheme) { try { window.__applyTheme(); } catch (e) {} }
  if (window.__applyAccent) { try { window.__applyAccent(); } catch (e) {} }
  if (window.__applyMotion) { try { window.__applyMotion(); } catch (e) {} }

  if (loggedIn) {
    enterUI();
  } else {
    // Shell im Hintergrund zeigen, Login-Overlay darüber
    showScreen('home');
    showLogin();
  }
}

document.addEventListener('DOMContentLoaded', boot);
