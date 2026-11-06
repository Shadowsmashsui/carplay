/* =========================================================
   devices.js — Spotify-Connect-Geräte wählen (Zielgerät).
   Auswahl in localStorage; andere Module lesen getSelectedDeviceId().
   ========================================================= */
import { registerScreen } from './app.js';
import * as sp from './spotify.js';
import * as auth from './auth.js';

const DEVICE_KEY = 'sp_device_id';

export function getSelectedDeviceId() {
  try { return localStorage.getItem(DEVICE_KEY) || undefined; } catch (e) { return undefined; }
}
function setSelected(id) {
  try { localStorage.setItem(DEVICE_KEY, id); } catch (e) {}
}

let rootEl = null;

function render(root) {
  rootEl = root;
  root.innerHTML = `
    <h2 class="scr-title">Geräte</h2>
    <div class="dev-status" id="dev-status">Lädt…</div>
    <div class="dev-list" id="dev-list"></div>`;
}

async function load() {
  const status = rootEl.querySelector('#dev-status');
  const list = rootEl.querySelector('#dev-list');
  list.innerHTML = '';
  status.hidden = false; status.innerHTML = 'Lädt…';

  try {
    const devices = await sp.getDevices();
    if (!devices.length) {
      status.innerHTML = 'Keine Geräte gefunden. Öffne Spotify auf deinem PC/Handy.';
      return;
    }
    status.hidden = true;
    // "Immer PC als Ziel": automatisch das Computer-Gerät wählen
    let preferPc = false; try { preferPc = localStorage.getItem('preferComputer') === '1'; } catch (e) {}
    if (preferPc) {
      const pc = devices.find(d => (d.type || '').toLowerCase().includes('computer'));
      if (pc && getSelectedDeviceId() !== pc.id) { setSelected(pc.id); try { await sp.transferPlayback(pc.id, false); } catch (e) {} }
    }
    const selected = getSelectedDeviceId();
    for (const d of devices) {
      const isActive = d.is_active || d.id === selected;
      const row = document.createElement('button');
      row.className = 'dev-row' + (isActive ? ' active' : '');
      row.innerHTML = `
        <span class="dev-ico">${deviceIcon(d.type)}</span>
        <span class="dev-meta">
          <span class="dev-name">${escapeHtml(d.name || 'Gerät')}</span>
          <span class="dev-type">${escapeHtml(d.type || '')}${d.is_active ? ' · aktiv' : ''}</span>
        </span>
        <span class="dev-check">${isActive ? check : ''}</span>`;
      row.addEventListener('click', () => choose(d));
      list.appendChild(row);
    }
  } catch (e) {
    if (e && e.name === 'NoTokenError') {
      status.innerHTML = `<div class="pl-hint">
        <span>Mit Spotify verbinden, um deine Geräte zu sehen.</span>
        <button class="np-hint-btn" id="dev-login">Mit Spotify verbinden</button></div>`;
      const b = rootEl.querySelector('#dev-login');
      if (b) b.addEventListener('click', () => auth.login());
    } else {
      status.innerHTML = 'Konnte Geräte nicht laden.';
    }
  }
}

async function choose(d) {
  setSelected(d.id);
  try { await sp.transferPlayback(d.id, false); } catch (e) {}
  load();
}

function deviceIcon(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('computer')) return '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><rect x="8" y="18" width="8" height="2" rx="1"/></svg>';
  if (t.includes('smartphone') || t.includes('phone')) return '<svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2.5"/><rect x="10.5" y="18" width="3" height="1.6" rx=".8" fill="#10121a"/></svg>';
  if (t.includes('speaker')) return '<svg viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="3"/><circle cx="12" cy="15" r="3.4" fill="#10121a"/></svg>';
  if (t.includes('tv') || t.includes('cast')) return '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><rect x="9" y="19" width="6" height="2" rx="1"/></svg>';
  return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>';
}

const check = '<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

registerScreen('devices', {
  render,
  onEnter() { load(); },
});
