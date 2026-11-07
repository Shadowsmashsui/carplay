/* =========================================================
   auth.js — Spotify OAuth (Authorization Code + PKCE).
   Rein clientseitig, kein Secret. Tokens in localStorage.
   ========================================================= */
import { CLIENT_ID, REDIRECT_URI, SCOPES } from '../config.js';

const AUTH_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';

const LS = {
  access: 'sp_access_token',
  refresh: 'sp_refresh_token',
  expires: 'sp_expires_at',     // ms-Zeitstempel
  verifier: 'sp_pkce_verifier',
  scope: 'sp_scope',
};

/* ---------- PKCE-Helfer ---------- */
function randomString(len = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join('');
}

async function sha256base64url(input) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  let bin = '';
  const bytes = new Uint8Array(digest);
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/* ---------- Login starten ---------- */
export async function login() {
  const verifier = randomString(64);
  const challenge = await sha256base64url(verifier);
  const state = randomString(16);
  try {
    localStorage.setItem(LS.verifier, verifier);
    localStorage.setItem('sp_state', state);
  } catch (e) { /* localStorage evtl. blockiert */ }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES,
    state,
  });
  location.assign(`${AUTH_URL}?${params.toString()}`);
}

/* ---------- Redirect-Rückkehr verarbeiten ----------
   Gibt true zurück, wenn ein Code erfolgreich getauscht wurde. */
export async function handleRedirectCallback() {
  const url = new URL(location.href);
  const code = url.searchParams.get('code');
  const err = url.searchParams.get('error');
  if (err) { cleanUrl(); return false; }
  if (!code) return false; // kein Login-Rücklauf -> nichts tun

  const verifier = safeGet(LS.verifier);
  if (!verifier) { cleanUrl(); return false; }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: verifier,
  });

  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) { cleanUrl(); return false; }
    const data = await res.json();
    storeToken(data);
    try { localStorage.removeItem(LS.verifier); } catch (e) {}
    cleanUrl();
    return true;
  } catch (e) {
    cleanUrl();
    return false;
  }
}

/* ---------- Access-Token holen (mit Auto-Refresh) ----------
   force=true überspringt den Cache und erzwingt einen Refresh. */
export async function getAccessToken(force = false) {
  const access = safeGet(LS.access);
  const expires = Number(safeGet(LS.expires) || 0);
  if (!force && access && Date.now() < expires - 60000) return access;

  const refresh = safeGet(LS.refresh);
  if (!refresh) return null;

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh,
    client_id: CLIENT_ID,
  });
  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      // Refresh-Token ungültig/widerrufen -> Tokens löschen, damit die App
      // wieder den Login anbietet statt leerer Listen.
      if (res.status === 400 || res.status === 401) logout();
      return null;
    }
    const data = await res.json();
    storeToken(data);
    return safeGet(LS.access);
  } catch (e) {
    return null;
  }
}

/** Fehlende benötigte Scopes gegenüber den erteilten (aus der Token-Antwort). */
export function missingScopes() {
  const granted = new Set((safeGet(LS.scope) || '').split(' ').filter(Boolean));
  return SCOPES.split(' ').filter(Boolean).filter((s) => !granted.has(s));
}

/** true, wenn ein gültiger Login besteht, aber Berechtigungen fehlen
    (z. B. Token aus der Zeit vor neuen Scopes) -> einmaliger Reconnect. */
export function needsReauth() {
  if (!isLoggedIn()) return false;
  if (missingScopes().length === 0) return false;
  try {
    if (sessionStorage.getItem('sp_reauth_tried')) return false;
    sessionStorage.setItem('sp_reauth_tried', '1');
  } catch (e) {}
  return true;
}

export function isLoggedIn() {
  return !!safeGet(LS.refresh) || (!!safeGet(LS.access) && Date.now() < Number(safeGet(LS.expires) || 0));
}

export function logout() {
  [LS.access, LS.refresh, LS.expires, LS.verifier, LS.scope, 'sp_state'].forEach((k) => {
    try { localStorage.removeItem(k); } catch (e) {}
  });
}

/* ---------- intern ---------- */
function storeToken(data) {
  try {
    if (data.access_token) localStorage.setItem(LS.access, data.access_token);
    if (data.refresh_token) localStorage.setItem(LS.refresh, data.refresh_token);
    if (data.scope != null) localStorage.setItem(LS.scope, data.scope);
    const ttl = (data.expires_in || 3600) * 1000;
    localStorage.setItem(LS.expires, String(Date.now() + ttl));
  } catch (e) { /* ignore */ }
}

function safeGet(k) {
  try { return localStorage.getItem(k); } catch (e) { return null; }
}

function cleanUrl() {
  try {
    const u = new URL(location.href);
    u.search = '';
    history.replaceState({}, '', u.toString());
  } catch (e) {}
}
