/* =========================================================
   queue.js — Warteschlange: aktueller Titel + was als Nächstes kommt.
   ========================================================= */
import { registerScreen, showScreen } from './app.js';
import * as sp from './spotify.js';
import { targetDevice, connectHint, makeTrackRow } from './ui.js';

let rootEl = null;

function render(root) {
  rootEl = root;
  root.innerHTML = `
    <div class="scr-head">
      <h2 class="scr-title">Warteschlange</h2>
      <button class="icon-btn" id="q-refresh" title="Aktualisieren">${icRefresh}</button>
    </div>
    <div id="q-body"><div class="track-status">Lädt…</div></div>`;
  root.querySelector('#q-refresh').addEventListener('click', load);
  load();
}

async function load() {
  const body = rootEl.querySelector('#q-body');
  body.innerHTML = '<div class="track-status">Lädt…</div>';
  try {
    const { current, queue } = await sp.getQueue();
    body.innerHTML = '';
    if (current) {
      body.appendChild(label('Läuft gerade'));
      body.appendChild(makeTrackRow(current, { currentId: current.id }));
    }
    body.appendChild(label('Als Nächstes'));
    if (!queue.length) {
      const empty = document.createElement('div');
      empty.className = 'search-empty'; empty.textContent = 'Die Warteschlange ist leer.';
      body.appendChild(empty);
      return;
    }
    const list = document.createElement('div');
    list.className = 'track-list';
    queue.forEach(t => list.appendChild(makeTrackRow(t, {
      onClick: () => { Promise.resolve(sp.playUris(t.uri, targetDevice())).finally(() => showScreen('player')); },
    })));
    body.appendChild(list);
  } catch (e) {
    body.innerHTML = '<div class="track-status"></div>';
    connectHint(body.firstChild, e, 'die Warteschlange');
  }
}

function label(text) {
  const d = document.createElement('div');
  d.className = 'q-label'; d.textContent = text;
  return d;
}

const icRefresh = '<svg viewBox="0 0 24 24"><path d="M12 5a7 7 0 1 0 6.3 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M12 2.5l3 3-3 3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

registerScreen('queue', { render });
