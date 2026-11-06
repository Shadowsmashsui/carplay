/* =========================================================
   ui.js — gemeinsame UI-Helfer für die Spotify-Screens.
   ========================================================= */
import * as auth from './auth.js';

const DEVICE_KEY = 'sp_device_id';
export function targetDevice() {
  try { return localStorage.getItem(DEVICE_KEY) || undefined; } catch (e) { return undefined; }
}

export function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function fmtDur(ms) {
  if (!ms) return '';
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Hinweis bei fehlendem Login / fehlender Berechtigung in ein Element schreiben. */
export function connectHint(el, err, whatText) {
  el.hidden = false;
  if (err && (err.name === 'NoTokenError' || err.name === 'ForbiddenError')) {
    el.innerHTML = `<div class="pl-hint">
      <span>Mit Spotify verbinden, um ${whatText} zu sehen.</span>
      <button class="np-hint-btn" data-login>Mit Spotify verbinden</button></div>`;
    const b = el.querySelector('[data-login]');
    if (b) b.addEventListener('click', () => auth.login());
    return true;
  }
  el.textContent = 'Konnte nichts laden.';
  return false;
}

const icEq = '<svg viewBox="0 0 24 24"><rect x="4" y="10" width="3" height="10" rx="1.5"><animate attributeName="height" values="4;14;4" dur="0.9s" repeatCount="indefinite"/><animate attributeName="y" values="16;6;16" dur="0.9s" repeatCount="indefinite"/></rect><rect x="10.5" y="6" width="3" height="14" rx="1.5"><animate attributeName="height" values="14;5;14" dur="0.9s" repeatCount="indefinite"/><animate attributeName="y" values="6;15;6" dur="0.9s" repeatCount="indefinite"/></rect><rect x="17" y="9" width="3" height="11" rx="1.5"><animate attributeName="height" values="8;14;8" dur="0.9s" repeatCount="indefinite"/><animate attributeName="y" values="12;6;12" dur="0.9s" repeatCount="indefinite"/></rect></svg>';

const icPlus = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

/** Baut eine Track-Zeile. opts: {index, currentId, onClick, onAdd, trailing} */
export function makeTrackRow(track, opts = {}) {
  const row = document.createElement('div');
  const isCur = track.id && track.id === opts.currentId;
  row.className = 'track-row' + (isCur ? ' playing' : '');
  if (opts.onClick) { row.setAttribute('role', 'button'); row.tabIndex = 0; }
  const imgs = track.album && track.album.images ? track.album.images : [];
  const img = imgs[2] ? imgs[2].url : (imgs[0] ? imgs[0].url : '');
  const lead = opts.index != null ? (isCur ? icEq : opts.index) : (isCur ? icEq : '');
  row.innerHTML = `
    <span class="track-idx">${lead}</span>
    <span class="track-cover" style="${img ? `background-image:url('${img}')` : ''}"></span>
    <span class="track-meta">
      <span class="track-name">${escapeHtml(track.name)}</span>
      <span class="track-artist">${escapeHtml((track.artists || []).map(a => a.name).join(', '))}</span>
    </span>
    ${opts.onAdd ? `<button class="track-add" title="Zur Warteschlange">${icPlus}</button>` : ''}
    <span class="track-dur">${opts.trailing != null ? opts.trailing : fmtDur(track.duration_ms)}</span>`;
  if (opts.onClick) row.addEventListener('click', () => opts.onClick(track));
  if (opts.onAdd) {
    const addBtn = row.querySelector('.track-add');
    addBtn.addEventListener('click', (ev) => { ev.stopPropagation(); opts.onAdd(track, addBtn); });
  }
  return row;
}

export const BACK_ICON = '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
