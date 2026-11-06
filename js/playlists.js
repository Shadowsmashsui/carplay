/* =========================================================
   playlists.js — eigene Spotify-Playlists als Cover-Raster.
   Tippen startet die Playlist auf dem Zielgerät.
   ========================================================= */
import { registerScreen, showScreen } from './app.js';
import * as sp from './spotify.js';
import * as auth from './auth.js';

const DEVICE_KEY = 'sp_device_id';
function targetDevice() {
  try { return localStorage.getItem(DEVICE_KEY) || undefined; } catch (e) { return undefined; }
}

let rootEl = null;

function render(root) {
  rootEl = root;
  root.innerHTML = `
    <h2 class="scr-title">Playlists</h2>
    <div class="pl-status" id="pl-status">Lädt…</div>
    <div class="pl-grid" id="pl-grid"></div>`;
}

async function load() {
  const status = rootEl.querySelector('#pl-status');
  const grid = rootEl.querySelector('#pl-grid');
  grid.innerHTML = '';
  status.hidden = false;
  status.innerHTML = 'Lädt…';

  try {
    const items = await sp.getPlaylists();
    if (!items.length) { status.innerHTML = 'Keine Playlists gefunden.'; return; }
    status.hidden = true;
    for (const pl of items) {
      const cover = pl.images && pl.images[0] ? pl.images[0].url : '';
      const card = document.createElement('button');
      card.className = 'pl-card';
      card.innerHTML = `
        <span class="pl-cover" style="${cover ? `background-image:url('${cover}')` : ''}">
          ${cover ? '' : '<span class="pl-cover-ph"></span>'}
        </span>
        <span class="pl-name">${escapeHtml(pl.name || '')}</span>`;
      card.addEventListener('click', () => start(pl));
      grid.appendChild(card);
    }
  } catch (e) {
    if (e && e.name === 'NoTokenError') {
      status.innerHTML = `<div class="pl-hint">
        <span>Mit Spotify verbinden, um deine Playlists zu sehen.</span>
        <button class="np-hint-btn" id="pl-login">Mit Spotify verbinden</button></div>`;
      const b = rootEl.querySelector('#pl-login');
      if (b) b.addEventListener('click', () => auth.login());
    } else {
      status.innerHTML = 'Konnte Playlists nicht laden.';
    }
  }
}

async function start(pl) {
  try {
    await sp.startContext(pl.uri, targetDevice());
    showScreen('player');
  } catch (e) {
    // kein Gerät/kein Login -> Player zeigt den passenden Hinweis
    showScreen('player');
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

registerScreen('playlists', {
  render,
  onEnter() { load(); },
});
