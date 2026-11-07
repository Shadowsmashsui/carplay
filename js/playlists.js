/* =========================================================
   playlists.js — Playlists als Cover-Raster + Detail-Ansicht
   mit Trackliste, Play/Shuffle und Markierung des laufenden Songs.
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
  renderList();
}

/* ---------- Übersicht ---------- */
async function renderList() {
  rootEl.innerHTML = `
    <h2 class="scr-title">Playlists</h2>
    <div class="pl-status" id="pl-status">Lädt…</div>
    <div class="pl-grid" id="pl-grid"></div>`;
  const status = rootEl.querySelector('#pl-status');
  const grid = rootEl.querySelector('#pl-grid');
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
          ${cover ? '' : '<span class="pl-cover-ph"></span>'}</span>
        <span class="pl-name">${escapeHtml(pl.name || '')}</span>`;
      card.addEventListener('click', () => renderDetail(pl));
      grid.appendChild(card);
    }
  } catch (e) {
    hintInto(status, e, 'deine Playlists');
  }
}

/* ---------- Detail (Trackliste) ---------- */
async function renderDetail(pl) {
  const cover = pl.images && pl.images[0] ? pl.images[0].url : '';
  rootEl.innerHTML = `
    <button class="back-btn" id="pl-back">${icBack}<span>Playlists</span></button>
    <div class="det-head">
      <div class="det-cover" style="${cover ? `background-image:url('${cover}')` : ''}"></div>
      <div class="det-meta">
        <div class="det-title">${escapeHtml(pl.name || '')}</div>
        <div class="det-sub">${pl.tracks && pl.tracks.total != null ? pl.tracks.total + ' Titel' : ''}</div>
        <div class="det-actions">
          <button class="det-play" id="pl-play">${icPlay}<span>Abspielen</span></button>
          <button class="det-shuffle" id="pl-shuffle">${icShuffle}<span>Zufall</span></button>
        </div>
      </div>
    </div>
    <div class="track-status" id="pl-tstatus">Lädt…</div>
    <div class="track-list" id="pl-tracks"></div>`;

  rootEl.querySelector('#pl-back').addEventListener('click', renderList);
  rootEl.querySelector('#pl-play').addEventListener('click', async () => {
    try { await sp.setShuffle(false); } catch (e) {}
    startCtx(pl.uri);
  });
  rootEl.querySelector('#pl-shuffle').addEventListener('click', async () => {
    try { await sp.setShuffle(true); } catch (e) {}
    startCtx(pl.uri);
  });

  const tstatus = rootEl.querySelector('#pl-tstatus');
  const listEl = rootEl.querySelector('#pl-tracks');
  try {
    const tracks = await sp.getPlaylistTracks(pl.id);
    let currentId = null;
    try { const st = await sp.getPlaybackState(); currentId = st && st.item ? st.item.id : null; } catch (e) {}
    if (!tracks.length) { tstatus.innerHTML = 'Keine Titel.'; return; }
    tstatus.hidden = true;
    const sub = rootEl.querySelector('.det-sub');
    if (sub && !sub.textContent) sub.textContent = tracks.length + ' Titel';
    tracks.forEach((t, i) => {
      const row = document.createElement('button');
      row.className = 'track-row' + (t.id && t.id === currentId ? ' playing' : '');
      const img = t.album && t.album.images && t.album.images[2] ? t.album.images[2].url
        : (t.album && t.album.images && t.album.images[0] ? t.album.images[0].url : '');
      row.innerHTML = `
        <span class="track-idx">${t.id === currentId ? icEq : (i + 1)}</span>
        <span class="track-cover" style="${img ? `background-image:url('${img}')` : ''}"></span>
        <span class="track-meta">
          <span class="track-name">${escapeHtml(t.name || '')}</span>
          <span class="track-artist">${escapeHtml((t.artists || []).map(a => a.name).join(', '))}</span>
        </span>
        <span class="track-dur">${fmtDur(t.duration_ms)}</span>`;
      row.addEventListener('click', async () => {
        try { await sp.playContextAt(pl.uri, t.uri, targetDevice()); showScreen('player'); }
        catch (e) { showScreen('player'); }
      });
      listEl.appendChild(row);
    });
  } catch (e) {
    hintInto(tstatus, e, 'die Titel');
  }
}

async function startCtx(uri) {
  try { await sp.startContext(uri, targetDevice()); showScreen('player'); }
  catch (e) { showScreen('player'); }
}

/* ---------- Helfer ---------- */
function hintInto(el, e, what) {
  if (e && (e.name === 'NoTokenError' || e.name === 'ForbiddenError')) {
    el.hidden = false;
    el.innerHTML = `<div class="pl-hint">
      <span>Mit Spotify verbinden, um ${what} zu sehen.</span>
      <button class="np-hint-btn" data-login>Mit Spotify verbinden</button></div>`;
    const b = el.querySelector('[data-login]');
    if (b) b.addEventListener('click', () => auth.login());
  } else {
    el.hidden = false;
    el.textContent = 'Konnte nichts laden.';
  }
}
function fmtDur(ms) {
  if (!ms) return '';
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const icBack = '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const icPlay = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
const icShuffle = '<svg viewBox="0 0 24 24"><path d="M17 3l4 4-4 4V8h-2.5l-2 2-1.6-1.9L13 6h4V3zM3 7h4.5c1 0 1.9.4 2.6 1.2L17 16h4v-3l4 4-4 4v-3h-4c-1 0-1.9-.4-2.6-1.2L7.5 9H3V7z"/></svg>';
const icEq = '<svg viewBox="0 0 24 24"><rect x="4" y="10" width="3" height="10" rx="1.5"><animate attributeName="height" values="4;14;4" dur="0.9s" repeatCount="indefinite"/><animate attributeName="y" values="16;6;16" dur="0.9s" repeatCount="indefinite"/></rect><rect x="10.5" y="6" width="3" height="14" rx="1.5"><animate attributeName="height" values="14;5;14" dur="0.9s" repeatCount="indefinite"/><animate attributeName="y" values="6;15;6" dur="0.9s" repeatCount="indefinite"/></rect><rect x="17" y="9" width="3" height="11" rx="1.5"><animate attributeName="height" values="8;14;8" dur="0.9s" repeatCount="indefinite"/><animate attributeName="y" values="12;6;12" dur="0.9s" repeatCount="indefinite"/></rect></svg>';

registerScreen('playlists', { render });
