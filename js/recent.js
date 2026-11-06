/* =========================================================
   recent.js — Zuletzt gespielte Titel.
   ========================================================= */
import { registerScreen, showScreen } from './app.js';
import * as sp from './spotify.js';
import { targetDevice, connectHint, makeTrackRow } from './ui.js';

let rootEl = null;

function render(root) {
  rootEl = root;
  root.innerHTML = `
    <h2 class="scr-title">Zuletzt gespielt</h2>
    <div class="track-status" id="rc-status">Lädt…</div>
    <div class="track-list" id="rc-list"></div>`;
  load();
}

async function load() {
  const status = rootEl.querySelector('#rc-status');
  const list = rootEl.querySelector('#rc-list');
  try {
    const items = await sp.getRecentlyPlayed();
    // Duplikate (gleicher Track hintereinander) ausdünnen
    const seen = new Set();
    const tracks = [];
    for (const it of items) {
      const t = it.track;
      if (t && t.id && !seen.has(t.id)) { seen.add(t.id); tracks.push(t); }
    }
    if (!tracks.length) { status.textContent = 'Noch nichts gehört.'; return; }
    status.hidden = true;
    tracks.forEach(t => list.appendChild(makeTrackRow(t, {
      onClick: () => { Promise.resolve(sp.playUris(t.uri, targetDevice())).finally(() => showScreen('player')); },
      onAdd: (tr, btn) => { Promise.resolve(sp.addToQueue(tr.uri, targetDevice())).then(() => { btn.classList.add('added'); btn.innerHTML = '✓'; }).catch(() => {}); },
    })));
  } catch (e) {
    connectHint(status, e, 'zuletzt Gespieltes');
  }
}

registerScreen('recent', { render });
