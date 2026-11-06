/* =========================================================
   settings.js — Einstellungen: Hintergrund, Uhr-Format, Logout.
   Speichert in localStorage; applyWallpaper() setzt den Hintergrund.
   ========================================================= */
import { registerScreen } from './app.js';
import * as auth from './auth.js';

const WP_KEY = 'wallpaper';
const CLOCK_KEY = 'clockFormat';

const WALLPAPERS = [
  { id: 'wp-aurora', name: 'Aurora' },
  { id: 'wp-night', name: 'Nacht' },
  { id: 'wp-sunset', name: 'Sonnenuntergang' },
  { id: 'wp-carbon', name: 'Carbon' },
];

function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

/* ---------- Hintergrund anwenden (beim Start + nach Auswahl) ---------- */
export function applyWallpaper() {
  const app = document.getElementById('app');
  if (!app) return;
  const val = safeGet(WP_KEY) || 'wp-aurora';
  app.classList.remove(...WALLPAPERS.map(w => w.id));
  app.style.backgroundImage = '';
  if (val.startsWith('custom:')) {
    app.style.backgroundImage = `url('${val.slice(7)}')`;
  } else {
    app.classList.add(WALLPAPERS.some(w => w.id === val) ? val : 'wp-aurora');
  }
}
window.__applyWallpaper = applyWallpaper;

/* ---------- Screen ---------- */
function render(root) {
  const current = safeGet(WP_KEY) || 'wp-aurora';
  const clock = safeGet(CLOCK_KEY) || '24';

  root.innerHTML = `
    <h2 class="scr-title">Einstellungen</h2>

    <section class="set-group">
      <div class="set-label">Hintergrundbild</div>
      <div class="wp-swatches" id="wp-swatches">
        ${WALLPAPERS.map(w => `
          <button class="wp-swatch ${w.id} ${w.id === current ? 'sel' : ''}" data-wp="${w.id}" title="${w.name}">
            <span class="wp-swatch-name">${w.name}</span>
          </button>`).join('')}
      </div>
      <div class="set-custom">
        <input type="url" id="wp-url" placeholder="Eigene Bild-URL (https://…)" />
        <button class="set-btn" id="wp-url-apply">Setzen</button>
      </div>
    </section>

    <section class="set-group">
      <div class="set-label">Uhrzeit-Format</div>
      <div class="seg" id="clock-seg">
        <button data-fmt="24" class="${clock === '24' ? 'on' : ''}">24 Std</button>
        <button data-fmt="12" class="${clock === '12' ? 'on' : ''}">12 Std</button>
      </div>
    </section>

    <section class="set-group">
      <button class="set-logout" id="set-logout">Spotify trennen (Logout)</button>
    </section>`;

  // Wallpaper-Auswahl
  root.querySelectorAll('.wp-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      safeSet(WP_KEY, btn.dataset.wp);
      applyWallpaper();
      root.querySelectorAll('.wp-swatch').forEach(b => b.classList.toggle('sel', b === btn));
    });
  });

  // Eigene URL
  root.querySelector('#wp-url-apply').addEventListener('click', () => {
    const url = root.querySelector('#wp-url').value.trim();
    if (!/^https:\/\//i.test(url)) { root.querySelector('#wp-url').focus(); return; }
    safeSet(WP_KEY, 'custom:' + url);
    applyWallpaper();
    root.querySelectorAll('.wp-swatch').forEach(b => b.classList.remove('sel'));
  });

  // Uhr-Format
  root.querySelectorAll('#clock-seg button').forEach(btn => {
    btn.addEventListener('click', () => {
      safeSet(CLOCK_KEY, btn.dataset.fmt);
      root.querySelectorAll('#clock-seg button').forEach(b => b.classList.toggle('on', b === btn));
    });
  });

  // Logout
  root.querySelector('#set-logout').addEventListener('click', () => {
    auth.logout();
    location.reload();
  });
}

registerScreen('settings', { render });
