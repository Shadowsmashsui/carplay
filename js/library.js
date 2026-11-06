/* =========================================================
   library.js — Bibliothek: gespeicherte Alben & gefolgte Artists.
   ========================================================= */
import { registerScreen, showScreen } from './app.js';
import * as sp from './spotify.js';
import { escapeHtml, targetDevice, connectHint } from './ui.js';

let rootEl = null;

function render(root) {
  rootEl = root;
  root.innerHTML = `
    <h2 class="scr-title">Bibliothek</h2>
    <div class="track-status" id="lib-status">Lädt…</div>
    <div id="lib-body"></div>`;
  load();
}

async function load() {
  const status = rootEl.querySelector('#lib-status');
  const body = rootEl.querySelector('#lib-body');
  try {
    const [albums, artists] = await Promise.all([
      sp.getSavedAlbums().catch(() => []),
      sp.getFollowedArtists().catch(() => []),
    ]);
    status.hidden = true;
    body.innerHTML = '';
    if (!albums.length && !artists.length) {
      status.hidden = false; status.textContent = 'Deine Bibliothek ist leer.';
      return;
    }
    if (albums.length) {
      body.appendChild(section('Alben'));
      body.appendChild(coverRow(albums, 'album'));
    }
    if (artists.length) {
      body.appendChild(section('Artists'));
      body.appendChild(coverRow(artists, 'artist'));
    }
  } catch (e) {
    connectHint(status, e, 'deine Bibliothek');
  }
}

function section(t) {
  const h = document.createElement('div');
  h.className = 'search-section';
  h.textContent = t;
  return h;
}

function coverRow(items, type) {
  const row = document.createElement('div');
  row.className = 'cover-row';
  for (const it of items) {
    const img = it.images && it.images[0] ? it.images[0].url : '';
    const sub = type === 'album' && it.artists ? it.artists.map(a => a.name).join(', ') : (type === 'artist' ? 'Künstler' : '');
    const card = document.createElement('button');
    card.className = 'cover-card' + (type === 'artist' ? ' round' : '');
    card.innerHTML = `
      <span class="cover-img" style="${img ? `background-image:url('${img}')` : ''}"></span>
      <span class="cover-name">${escapeHtml(it.name)}</span>
      <span class="cover-sub">${escapeHtml(sub)}</span>`;
    card.addEventListener('click', () => {
      Promise.resolve(sp.startContext(it.uri, targetDevice())).finally(() => showScreen('player'));
    });
    row.appendChild(card);
  }
  return row;
}

registerScreen('library', { render });
