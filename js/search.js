/* =========================================================
   search.js — Spotify-Suche (Songs, Playlists, Alben).
   ========================================================= */
import { registerScreen, showScreen } from './app.js';
import * as sp from './spotify.js';
import { escapeHtml, targetDevice, connectHint, makeTrackRow } from './ui.js';

let rootEl = null;
let debounce = null;

function render(root) {
  rootEl = root;
  root.innerHTML = `
    <h2 class="scr-title">Suche</h2>
    <div class="search-bar">
      <svg class="search-ico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <input type="search" id="search-input" placeholder="Songs, Playlists, Alben…" autocomplete="off" />
    </div>
    <div class="search-results" id="search-results">
      <div class="search-empty">Tippe oben, um zu suchen.</div>
    </div>`;

  const input = root.querySelector('#search-input');
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const term = input.value.trim();
    if (!term) { showEmpty('Tippe oben, um zu suchen.'); return; }
    debounce = setTimeout(() => runSearch(term), 350);
  });
  setTimeout(() => input.focus(), 50);
}

function showEmpty(msg) {
  const r = rootEl && rootEl.querySelector('#search-results');
  if (r) r.innerHTML = `<div class="search-empty">${escapeHtml(msg)}</div>`;
}

async function runSearch(term) {
  const box = rootEl.querySelector('#search-results');
  box.innerHTML = '<div class="search-empty">Suche…</div>';
  try {
    const { tracks, playlists, albums } = await sp.search(term);
    box.innerHTML = '';
    if (!tracks.length && !playlists.length && !albums.length) {
      box.innerHTML = '<div class="search-empty">Nichts gefunden.</div>';
      return;
    }
    if (tracks.length) {
      box.appendChild(sectionTitle('Songs'));
      const list = document.createElement('div');
      list.className = 'track-list';
      tracks.slice(0, 8).forEach(t => list.appendChild(makeTrackRow(t, {
        onClick: () => playAndGo(() => sp.playUris(t.uri, targetDevice())),
        onAdd: (tr, btn) => {
          Promise.resolve(sp.addToQueue(tr.uri, targetDevice()))
            .then(() => { btn.classList.add('added'); btn.innerHTML = '✓'; })
            .catch(() => {});
        },
      })));
      box.appendChild(list);
    }
    if (playlists.length) {
      box.appendChild(sectionTitle('Playlists'));
      box.appendChild(coverRow(playlists, pl => playAndGo(() => sp.startContext(pl.uri, targetDevice()))));
    }
    if (albums.length) {
      box.appendChild(sectionTitle('Alben'));
      box.appendChild(coverRow(albums, al => playAndGo(() => sp.startContext(al.uri, targetDevice()))));
    }
  } catch (e) {
    box.innerHTML = '';
    connectHint(box, e, 'zu suchen');
  }
}

function playAndGo(fn) {
  Promise.resolve(fn()).then(() => showScreen('player')).catch(() => showScreen('player'));
}

function sectionTitle(t) {
  const h = document.createElement('div');
  h.className = 'search-section';
  h.textContent = t;
  return h;
}

function coverRow(items, onClick) {
  const row = document.createElement('div');
  row.className = 'cover-row';
  for (const it of items.slice(0, 10)) {
    const img = it.images && it.images[0] ? it.images[0].url : '';
    const sub = it.type === 'album' && it.artists ? it.artists.map(a => a.name).join(', ') : (it.owner ? it.owner.display_name : '');
    const card = document.createElement('button');
    card.className = 'cover-card';
    card.innerHTML = `
      <span class="cover-img" style="${img ? `background-image:url('${img}')` : ''}"></span>
      <span class="cover-name">${escapeHtml(it.name)}</span>
      <span class="cover-sub">${escapeHtml(sub || '')}</span>`;
    card.addEventListener('click', () => onClick(it));
    row.appendChild(card);
  }
  return row;
}

registerScreen('search', { render });
