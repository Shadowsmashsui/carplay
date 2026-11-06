/* =========================================================
   player.js — "Jetzt läuft": Live-Status + Steuerung.
   Netz-Polling 1 s, lokale UI-Interpolation 250 ms.
   Pausiert bei document.hidden und beim Verlassen.
   ========================================================= */
import { registerScreen, showScreen } from './app.js';
import * as sp from './spotify.js';
import * as auth from './auth.js';

let netTimer = null;
let uiTimer = null;
let last = null;           // { progress_ms, duration_ms, is_playing, ts }
let pollIntervalMs = 1000;
let els = {};
let mounted = false;

const fmt = (ms) => {
  if (!ms || ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function render(root) {
  root.innerHTML = `
    <div class="np">
      <button class="np-devbtn" id="np-devices" title="Geräte">${icDevices}</button>
      <div class="np-art"><img id="np-img" alt="" /><div class="np-art-ph" id="np-ph"></div></div>
      <div class="np-main">
        <div class="np-title" id="np-title">—</div>
        <div class="np-artist" id="np-artist"></div>

        <div class="np-progress" id="np-prog">
          <div class="np-bar"><div class="np-fill" id="np-fill"></div></div>
          <div class="np-times"><span id="np-cur">0:00</span><span id="np-dur">0:00</span></div>
        </div>

        <div class="np-controls">
          <button class="np-ic" id="np-shuffle" title="Zufall">${icShuffle}</button>
          <button class="np-ic big" id="np-prev" title="Zurück">${icPrev}</button>
          <button class="np-ic play" id="np-play" title="Play/Pause">${icPlay}</button>
          <button class="np-ic big" id="np-next" title="Weiter">${icNext}</button>
          <div class="np-ic ghost"></div>
        </div>

        <div class="np-volume">
          ${icVolDown}
          <input type="range" id="np-vol" min="0" max="100" value="50" />
          ${icVolUp}
        </div>

        <div class="np-hint" id="np-hint" hidden></div>
      </div>
    </div>`;

  els = {
    img: root.querySelector('#np-img'),
    ph: root.querySelector('#np-ph'),
    title: root.querySelector('#np-title'),
    artist: root.querySelector('#np-artist'),
    fill: root.querySelector('#np-fill'),
    cur: root.querySelector('#np-cur'),
    dur: root.querySelector('#np-dur'),
    prog: root.querySelector('#np-prog'),
    shuffle: root.querySelector('#np-shuffle'),
    prev: root.querySelector('#np-prev'),
    play: root.querySelector('#np-play'),
    next: root.querySelector('#np-next'),
    vol: root.querySelector('#np-vol'),
    hint: root.querySelector('#np-hint'),
    controls: root.querySelector('.np-controls'),
  };

  els.play.addEventListener('click', onPlayPause);
  els.next.addEventListener('click', () => guard(sp.next()));
  els.prev.addEventListener('click', () => guard(sp.previous()));
  els.shuffle.addEventListener('click', onShuffle);
  els.vol.addEventListener('change', () => guard(sp.setVolume(Number(els.vol.value))));
  els.prog.addEventListener('click', onSeek);
  const devBtn = root.querySelector('#np-devices');
  if (devBtn) devBtn.addEventListener('click', () => showScreen('devices'));
}

/* ---------- Aktionen ---------- */
async function onPlayPause() {
  if (!last) return;
  try {
    if (last.is_playing) await sp.pause(); else await sp.play();
    last.is_playing = !last.is_playing;
    paintTransport();
    setTimeout(pollNow, 250);
  } catch (e) { handleErr(e); }
}
async function onShuffle() {
  if (!last) return;
  const nextState = !last.shuffle_state;
  try { await sp.setShuffle(nextState); last.shuffle_state = nextState; paintShuffle(); }
  catch (e) { handleErr(e); }
}
function onSeek(ev) {
  if (!last || !last.duration_ms) return;
  const rect = els.prog.querySelector('.np-bar').getBoundingClientRect();
  const frac = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width));
  const target = frac * last.duration_ms;
  last.progress_ms = target; last.ts = Date.now();
  paintProgress();
  guard(sp.seek(target));
}
function guard(promise) { Promise.resolve(promise).then(() => setTimeout(pollNow, 250)).catch(handleErr); }

/* ---------- Netz-Polling ---------- */
async function pollNow() {
  if (!mounted || document.hidden) return;
  try {
    const st = await sp.getPlaybackState();
    pollIntervalMs = 1000;
    if (!st || !st.item) { showHint('idle'); last = null; return; }
    clearHint();
    last = {
      progress_ms: st.progress_ms || 0,
      duration_ms: st.item.duration_ms || 0,
      is_playing: !!st.is_playing,
      shuffle_state: !!st.shuffle_state,
      ts: Date.now(),
    };
    paintTrack(st.item);
    paintShuffle();
    paintTransport();
    if (st.device && typeof st.device.volume_percent === 'number') {
      els.vol.value = st.device.volume_percent;
    }
  } catch (e) {
    handleErr(e);
  }
}

function handleErr(e) {
  if (e && e.name === 'NoTokenError') { showHint('login'); last = null; return; }
  if (e && e.name === 'RateLimitError') { pollIntervalMs = Math.min(8000, (e.retryAfter || 1) * 1000); return; }
  // 404 o.ä. (kein aktives Gerät) -> Idle-Hinweis
  showHint('idle'); last = null;
}

/* ---------- Zeichnen ---------- */
function paintTrack(item) {
  const url = item.album && item.album.images && item.album.images[0] ? item.album.images[0].url : '';
  if (url) { els.img.src = url; els.img.style.opacity = '1'; els.ph.style.opacity = '0'; }
  else { els.img.style.opacity = '0'; els.ph.style.opacity = '1'; }
  els.title.textContent = item.name || '—';
  els.artist.textContent = (item.artists || []).map(a => a.name).join(', ');
  els.dur.textContent = fmt(item.duration_ms);
}
function paintShuffle() {
  els.shuffle.classList.toggle('on', !!(last && last.shuffle_state));
}
function paintTransport() {
  els.play.innerHTML = (last && last.is_playing) ? icPause : icPlay;
}
function paintProgress() {
  if (!last || !last.duration_ms) { els.fill.style.width = '0%'; return; }
  let p = last.progress_ms;
  if (last.is_playing) p += Date.now() - last.ts;
  p = Math.min(p, last.duration_ms);
  els.fill.style.width = `${(p / last.duration_ms) * 100}%`;
  els.cur.textContent = fmt(p);
}

/* ---------- Hinweise ---------- */
function showHint(kind) {
  const c = els.controls, h = els.hint;
  if (!h) return;
  h.hidden = false;
  if (kind === 'login') {
    h.innerHTML = `<span>Mit Spotify verbinden, um die Musik zu steuern.</span>
                   <button class="np-hint-btn" id="np-login">Mit Spotify verbinden</button>`;
    h.querySelector('#np-login').addEventListener('click', () => auth.login());
    els.title.textContent = 'Nicht verbunden';
    els.artist.textContent = '';
  } else {
    h.innerHTML = `<span>Keine aktive Wiedergabe. Starte Spotify auf deinem PC.</span>`;
    els.title.textContent = 'Nichts läuft';
    els.artist.textContent = '';
  }
  els.img.style.opacity = '0'; els.ph.style.opacity = '1';
  els.fill.style.width = '0%';
  els.cur.textContent = '0:00'; els.dur.textContent = '0:00';
  if (c) c.classList.add('disabled');
}
function clearHint() {
  if (els.hint) { els.hint.hidden = true; els.hint.innerHTML = ''; }
  if (els.controls) els.controls.classList.remove('disabled');
}

/* ---------- Lifecycle ---------- */
function startTimers() {
  stopTimers();
  const loop = () => { pollNow(); netTimer = setTimeout(loop, pollIntervalMs); };
  loop();
  uiTimer = setInterval(paintProgress, 250);
}
function stopTimers() {
  if (netTimer) { clearTimeout(netTimer); netTimer = null; }
  if (uiTimer) { clearInterval(uiTimer); uiTimer = null; }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (netTimer) { clearTimeout(netTimer); netTimer = null; } }
  else if (mounted && !netTimer) { startTimers(); }
});

registerScreen('player', {
  render,
  onEnter() { mounted = true; startTimers(); },
  onLeave() { mounted = false; stopTimers(); },
});

/* ---------- Icons ---------- */
const icPlay = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
const icPause = '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
const icNext = '<svg viewBox="0 0 24 24"><path d="M6 5l9 7-9 7z"/><rect x="16" y="5" width="2.6" height="14" rx="1"/></svg>';
const icPrev = '<svg viewBox="0 0 24 24"><path d="M18 5l-9 7 9 7z"/><rect x="5.4" y="5" width="2.6" height="14" rx="1"/></svg>';
const icShuffle = '<svg viewBox="0 0 24 24"><path d="M17 3l4 4-4 4V8h-2.5l-2 2-1.6-1.9L13 6h4V3zM3 7h4.5c1 0 1.9.4 2.6 1.2L17 16h4v-3l4 4-4 4v-3h-4c-1 0-1.9-.4-2.6-1.2L7.5 9H3V7z"/></svg>';
const icVolDown = '<svg class="np-volico" viewBox="0 0 24 24"><path d="M4 9v6h4l5 5V4L8 9H4z"/></svg>';
const icVolUp = '<svg class="np-volico" viewBox="0 0 24 24"><path d="M4 9v6h4l5 5V4L8 9H4zm12 3a4 4 0 0 0-2.5-3.7v7.4A4 4 0 0 0 16 12zm-2.5-8v2.1A6 6 0 0 1 13.5 20v2.1A8 8 0 0 0 13.5 4z"/></svg>';
const icDevices = '<svg viewBox="0 0 24 24"><rect x="2" y="4" width="14" height="10" rx="2"/><rect x="13" y="10" width="9" height="10" rx="2"/><rect x="6" y="18" width="6" height="1.8" rx=".9"/></svg>';
