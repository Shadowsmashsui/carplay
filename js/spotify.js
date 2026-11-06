/* =========================================================
   spotify.js — dünner Wrapper um die Spotify Web API.
   Kapselt Auth-Header, 401-Retry, 429-Rate-Limit, 204-Leer.
   ========================================================= */
import { getAccessToken } from './auth.js';

const API = 'https://api.spotify.com/v1';

export class RateLimitError extends Error {
  constructor(retryAfter) { super('rate_limited'); this.retryAfter = retryAfter; }
}
export class NoTokenError extends Error {
  constructor() { super('no_token'); }
}

async function request(method, path, body, _retried = false) {
  const token = await getAccessToken();
  if (!token) throw new NoTokenError();

  const headers = { Authorization: `Bearer ${token}` };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(API + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Token evtl. abgelaufen -> einmal neu holen (getAccessToken refresht) und wiederholen
  if (res.status === 401 && !_retried) {
    return request(method, path, body, true);
  }
  if (res.status === 429) {
    const ra = parseInt(res.headers.get('Retry-After') || '1', 10);
    throw new RateLimitError(isNaN(ra) ? 1 : ra);
  }
  if (res.status === 204 || res.status === 202) return null;
  if (!res.ok) throw new Error(`api_${res.status}`);

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* ---------- Wiedergabe-Status ---------- */
export function getPlaybackState() {
  return request('GET', '/me/player');
}

/* ---------- Steuerung (alle brauchen Premium + aktives Gerät) ---------- */
export function play(opts) {
  const dev = opts && opts.deviceId ? `?device_id=${opts.deviceId}` : '';
  const body = {};
  if (opts) {
    if (opts.context_uri) body.context_uri = opts.context_uri;
    if (opts.uris) body.uris = opts.uris;
    if (opts.offset) body.offset = opts.offset;
    if (opts.position_ms != null) body.position_ms = opts.position_ms;
  }
  return request('PUT', `/me/player/play${dev}`, Object.keys(body).length ? body : undefined);
}
export function pause() { return request('PUT', '/me/player/pause'); }
export function next() { return request('POST', '/me/player/next'); }
export function previous() { return request('POST', '/me/player/previous'); }
export function seek(ms) {
  const pos = Math.max(0, Math.round(ms));
  return request('PUT', `/me/player/seek?position_ms=${pos}`);
}
export function setVolume(pct) {
  const v = Math.max(0, Math.min(100, Math.round(pct)));
  return request('PUT', `/me/player/volume?volume_percent=${v}`);
}
export function setShuffle(state) {
  return request('PUT', `/me/player/shuffle?state=${state ? 'true' : 'false'}`);
}

/* ---------- Playlists ---------- */
export async function getPlaylists() {
  const data = await request('GET', '/me/playlists?limit=50');
  return data && data.items ? data.items : [];
}
export function startContext(contextUri, deviceId) {
  return play({ context_uri: contextUri, deviceId });
}

/* ---------- Geräte ---------- */
export async function getDevices() {
  const data = await request('GET', '/me/player/devices');
  return data && data.devices ? data.devices : [];
}
export function transferPlayback(deviceId, playNow = true) {
  return request('PUT', '/me/player', { device_ids: [deviceId], play: playNow });
}
