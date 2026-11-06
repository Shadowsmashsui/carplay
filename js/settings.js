/* =========================================================
   settings.js — Einstellungen: Theme, Akzent, Hintergrund,
   App-Verwaltung (sichtbar/Reihenfolge) und Verhalten.
   ========================================================= */
import { registerScreen, rebuildShell, getApps } from './app.js';
import { getAppIcon } from './appicons.js';
import * as auth from './auth.js';

const K = {
  wp: 'wallpaper', clock: 'clockFormat', theme: 'theme',
  accent: 'accent', anim: 'animations', order: 'appOrder',
  hidden: 'appsHidden', preferPc: 'preferComputer',
};

const WALLPAPERS = [
  { id: 'wp-aurora', name: 'Aurora' },
  { id: 'wp-night', name: 'Nacht' },
  { id: 'wp-sunset', name: 'Sonnenuntergang' },
  { id: 'wp-carbon', name: 'Carbon' },
  { id: 'wp-ocean', name: 'Ozean' },
  { id: 'wp-berry', name: 'Beere' },
  { id: 'wp-mint', name: 'Mint' },
  { id: 'wp-mono', name: 'Mono' },
];

const ACCENTS = [
  { id: 'green', c: '#1ed760' }, { id: 'blue', c: '#0a84ff' },
  { id: 'pink', c: '#ff375f' }, { id: 'orange', c: '#ff9f0a' },
  { id: 'purple', c: '#bf5af2' }, { id: 'teal', c: '#40c8e0' },
  { id: 'yellow', c: '#ffd60a' }, { id: 'red', c: '#ff453a' },
];

function sGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function sSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function sArr(k) { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
function sSetArr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

/* ---------- Anwenden (Start + nach Auswahl) ---------- */
export function applyWallpaper() {
  const app = document.getElementById('app');
  if (!app) return;
  const val = sGet(K.wp) || 'wp-aurora';
  app.classList.remove(...WALLPAPERS.map(w => w.id));
  app.style.backgroundImage = '';
  if (val.startsWith('custom:')) app.style.backgroundImage = `url('${val.slice(7)}')`;
  else app.classList.add(WALLPAPERS.some(w => w.id === val) ? val : 'wp-aurora');
}
export function applyTheme() {
  const t = sGet(K.theme) || 'auto';
  const el = document.documentElement;
  if (t === 'light') el.setAttribute('data-theme', 'light');
  else if (t === 'dark') el.setAttribute('data-theme', 'dark');
  else el.removeAttribute('data-theme');
}
export function applyAccent() {
  const id = sGet(K.accent) || 'green';
  const a = ACCENTS.find(x => x.id === id) || ACCENTS[0];
  document.documentElement.style.setProperty('--accent', a.c);
}
export function applyMotion() {
  document.documentElement.classList.toggle('no-anim', sGet(K.anim) === 'off');
}
window.__applyWallpaper = applyWallpaper;
window.__applyTheme = applyTheme;
window.__applyAccent = applyAccent;
window.__applyMotion = applyMotion;

/* ---------- Screen ---------- */
function render(root) {
  const curWp = sGet(K.wp) || 'wp-aurora';
  const clock = sGet(K.clock) || '24';
  const theme = sGet(K.theme) || 'auto';
  const accent = sGet(K.accent) || 'green';
  const anim = sGet(K.anim) || 'on';
  const preferPc = sGet(K.preferPc) === '1';

  root.innerHTML = `
    <h2 class="scr-title">Einstellungen</h2>

    <section class="set-group">
      <div class="set-label">Darstellung</div>
      <div class="seg" id="theme-seg">
        <button data-theme="auto" class="${theme === 'auto' ? 'on' : ''}">Automatisch</button>
        <button data-theme="light" class="${theme === 'light' ? 'on' : ''}">Hell</button>
        <button data-theme="dark" class="${theme === 'dark' ? 'on' : ''}">Dunkel</button>
      </div>
    </section>

    <section class="set-group">
      <div class="set-label">Akzentfarbe</div>
      <div class="accent-row" id="accent-row">
        ${ACCENTS.map(a => `<button class="accent-dot ${a.id === accent ? 'sel' : ''}" data-accent="${a.id}" style="background:${a.c}" title="${a.id}"></button>`).join('')}
      </div>
    </section>

    <section class="set-group">
      <div class="set-label">Hintergrundbild</div>
      <div class="wp-swatches" id="wp-swatches">
        ${WALLPAPERS.map(w => `
          <button class="wp-swatch ${w.id} ${w.id === curWp ? 'sel' : ''}" data-wp="${w.id}" title="${w.name}">
            <span class="wp-swatch-name">${w.name}</span></button>`).join('')}
      </div>
      <div class="set-custom">
        <input type="url" id="wp-url" placeholder="Eigene Bild-URL (https://…)" />
        <button class="set-btn" id="wp-url-apply">Setzen</button>
      </div>
    </section>

    <section class="set-group">
      <div class="set-label">Apps verwalten</div>
      <div class="app-manage" id="app-manage"></div>
    </section>

    <section class="set-group">
      <div class="set-label">Verhalten</div>
      <div class="set-row">
        <span>Immer PC als Ziel</span>
        <button class="switch ${preferPc ? 'on' : ''}" id="sw-pc" role="switch" aria-checked="${preferPc}"><span class="knob"></span></button>
      </div>
      <div class="set-row">
        <span>Animationen</span>
        <button class="switch ${anim !== 'off' ? 'on' : ''}" id="sw-anim" role="switch" aria-checked="${anim !== 'off'}"><span class="knob"></span></button>
      </div>
      <div class="set-row">
        <span>Uhrzeit-Format</span>
        <div class="seg" id="clock-seg">
          <button data-fmt="24" class="${clock === '24' ? 'on' : ''}">24 Std</button>
          <button data-fmt="12" class="${clock === '12' ? 'on' : ''}">12 Std</button>
        </div>
      </div>
    </section>

    <section class="set-group">
      <button class="set-logout" id="set-logout">Spotify trennen (Logout)</button>
    </section>`;

  wireTheme(root);
  wireAccent(root);
  wireWallpaper(root);
  wireAppManage(root);
  wireBehavior(root);
  root.querySelector('#set-logout').addEventListener('click', () => { auth.logout(); location.reload(); });
}

function wireTheme(root) {
  root.querySelectorAll('#theme-seg button').forEach(btn => btn.addEventListener('click', () => {
    sSet(K.theme, btn.dataset.theme); applyTheme();
    root.querySelectorAll('#theme-seg button').forEach(b => b.classList.toggle('on', b === btn));
  }));
}
function wireAccent(root) {
  root.querySelectorAll('.accent-dot').forEach(btn => btn.addEventListener('click', () => {
    sSet(K.accent, btn.dataset.accent); applyAccent();
    root.querySelectorAll('.accent-dot').forEach(b => b.classList.toggle('sel', b === btn));
  }));
}
function wireWallpaper(root) {
  root.querySelectorAll('.wp-swatch').forEach(btn => btn.addEventListener('click', () => {
    sSet(K.wp, btn.dataset.wp); applyWallpaper();
    root.querySelectorAll('.wp-swatch').forEach(b => b.classList.toggle('sel', b === btn));
  }));
  root.querySelector('#wp-url-apply').addEventListener('click', () => {
    const url = root.querySelector('#wp-url').value.trim();
    if (!/^https:\/\//i.test(url)) { root.querySelector('#wp-url').focus(); return; }
    sSet(K.wp, 'custom:' + url); applyWallpaper();
    root.querySelectorAll('.wp-swatch').forEach(b => b.classList.remove('sel'));
  });
}
function wireBehavior(root) {
  const swPc = root.querySelector('#sw-pc');
  swPc.addEventListener('click', () => {
    const on = !swPc.classList.contains('on');
    swPc.classList.toggle('on', on); swPc.setAttribute('aria-checked', on);
    sSet(K.preferPc, on ? '1' : '0');
  });
  const swAnim = root.querySelector('#sw-anim');
  swAnim.addEventListener('click', () => {
    const on = !swAnim.classList.contains('on');
    swAnim.classList.toggle('on', on); swAnim.setAttribute('aria-checked', on);
    sSet(K.anim, on ? 'on' : 'off'); applyMotion();
  });
  root.querySelectorAll('#clock-seg button').forEach(btn => btn.addEventListener('click', () => {
    sSet(K.clock, btn.dataset.fmt);
    root.querySelectorAll('#clock-seg button').forEach(b => b.classList.toggle('on', b === btn));
  }));
}

/* ---------- App-Verwaltung (Sichtbarkeit + Reihenfolge) ---------- */
function wireAppManage(root) {
  const box = root.querySelector('#app-manage');
  const draw = () => {
    const apps = getApps();
    box.innerHTML = '';
    apps.forEach((app, i) => {
      const row = document.createElement('div');
      row.className = 'manage-row';
      row.innerHTML = `
        <span class="manage-ico">${getAppIcon(app.id)}</span>
        <span class="manage-name">${app.label}</span>
        <span class="manage-ctrls">
          <button class="mini-btn" data-up ${i === 0 ? 'disabled' : ''}>▲</button>
          <button class="mini-btn" data-down ${i === apps.length - 1 ? 'disabled' : ''}>▼</button>
          <button class="switch small ${app.hidden ? '' : 'on'}" data-vis role="switch" aria-checked="${!app.hidden}"><span class="knob"></span></button>
        </span>`;
      const order = apps.map(a => a.id);
      row.querySelector('[data-up]').addEventListener('click', () => {
        if (i > 0) { [order[i - 1], order[i]] = [order[i], order[i - 1]]; sSetArr(K.order, order); redraw(); }
      });
      row.querySelector('[data-down]').addEventListener('click', () => {
        if (i < order.length - 1) { [order[i + 1], order[i]] = [order[i], order[i + 1]]; sSetArr(K.order, order); redraw(); }
      });
      row.querySelector('[data-vis]').addEventListener('click', () => {
        const hidden = sArr(K.hidden);
        const idx = hidden.indexOf(app.id);
        if (idx >= 0) hidden.splice(idx, 1); else hidden.push(app.id);
        sSetArr(K.hidden, hidden); redraw();
      });
      box.appendChild(row);
    });
  };
  const redraw = () => { draw(); rebuildShell(); };
  draw();
}

registerScreen('settings', { render });
