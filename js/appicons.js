/* =========================================================
   appicons.js — CarPlay-/iOS-nahe App-Icons als volle SVGs
   (eigener abgerundeter Hintergrund + Apple-artige Glyphen).
   viewBox 0 0 60 60, Eck-Radius ~13.5 (iOS-Squircle-Annäherung).
   ========================================================= */

const R = 13.5;

const nowplaying = `
<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="npg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ff5f8f"/><stop offset="1" stop-color="#ff9f43"/></linearGradient></defs>
  <rect width="60" height="60" rx="${R}" fill="#ffffff"/>
  <g fill="url(#npg)">
    <rect x="16" y="25" width="4.6" height="11" rx="2.3"/>
    <rect x="23.7" y="18" width="4.6" height="24" rx="2.3"/>
    <rect x="31.4" y="22" width="4.6" height="16" rx="2.3"/>
    <rect x="39.1" y="27" width="4.6" height="7" rx="2.3"/>
  </g>
</svg>`;

const music = `
<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="mug" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fb5c70"/><stop offset="1" stop-color="#f11e46"/></linearGradient></defs>
  <rect width="60" height="60" rx="${R}" fill="url(#mug)"/>
  <path d="M40 15.5v21.8a5.3 5.3 0 1 1-3.1-4.84V23.4l-14.8 3.17V40.9a5.3 5.3 0 1 1-3.1-4.84V20.9z"
        fill="#fff"/>
</svg>`;

const maps = `
<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="60" rx="${R}" fill="#eef1f2"/>
  <path d="M-2 16 H62 V28 H-2 Z" fill="#cfe9c3"/>
  <path d="M-2 38 H62 V62 H-2 Z" fill="#bcddf6"/>
  <path d="M10 -2 L42 62" stroke="#ffffff" stroke-width="7"/>
  <path d="M10 -2 L42 62" stroke="#f6c84e" stroke-width="2.6"/>
  <path d="M30 21 L37.5 40 L30 35.5 L22.5 40 Z" fill="#2b7bff"/>
</svg>`;

const settingsGear = (() => {
  let teeth = '';
  for (let i = 0; i < 8; i++) {
    teeth += `<rect x="27" y="7.5" width="6" height="9" rx="2.4" transform="rotate(${i * 45} 30 30)"/>`;
  }
  return `
<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="60" rx="${R}" fill="#b9bdc4"/>
  <g fill="#70757d">${teeth}<circle cx="30" cy="30" r="12.5"/></g>
  <circle cx="30" cy="30" r="5.4" fill="#b9bdc4"/>
</svg>`;
})();

const phone = `
<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="phg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#5ff07b"/><stop offset="1" stop-color="#16c23e"/></linearGradient></defs>
  <rect width="60" height="60" rx="${R}" fill="url(#phg)"/>
  <g transform="translate(7.2,7.2) scale(1.9)" fill="#fff">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </g>
</svg>`;

const messages = `
<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="msg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#4be06a"/><stop offset="1" stop-color="#16bb47"/></linearGradient></defs>
  <rect width="60" height="60" rx="${R}" fill="url(#msg)"/>
  <g transform="translate(7.2,8.4) scale(1.9)" fill="#fff">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
  </g>
</svg>`;

const calendar = (weekday, day) => `
<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="60" rx="${R}" fill="#ffffff"/>
  <text x="30" y="21" text-anchor="middle" font-family="-apple-system,Segoe UI,sans-serif"
        font-size="10.5" font-weight="700" fill="#ff3b30">${weekday}</text>
  <text x="30" y="47" text-anchor="middle" font-family="-apple-system,Segoe UI,sans-serif"
        font-size="27" font-weight="300" fill="#1c1c1e">${day}</text>
</svg>`;

const clock = `
<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="60" rx="${R}" fill="#1c1c1e"/>
  <circle cx="30" cy="30" r="18" fill="#fff"/>
  <circle cx="30" cy="30" r="18" fill="none" stroke="#000" stroke-width="1.2"/>
  <line x1="30" y1="30" x2="30" y2="18.5" stroke="#000" stroke-width="2" stroke-linecap="round"/>
  <line x1="30" y1="30" x2="38.5" y2="30" stroke="#ff9500" stroke-width="2" stroke-linecap="round"/>
  <circle cx="30" cy="30" r="1.8" fill="#000"/>
</svg>`;

const list = `
<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="plg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8f6bff"/><stop offset="1" stop-color="#5b2ee0"/></linearGradient></defs>
  <rect width="60" height="60" rx="${R}" fill="url(#plg)"/>
  <g fill="#fff">
    <rect x="16" y="19" width="19" height="3.4" rx="1.7"/>
    <rect x="16" y="27" width="19" height="3.4" rx="1.7"/>
    <rect x="16" y="35" width="12" height="3.4" rx="1.7"/>
    <circle cx="39" cy="38" r="4.2"/>
    <rect x="41.4" y="22" width="2.6" height="16.5"/>
  </g>
</svg>`;

/** Liefert das SVG für eine App-ID (volle Icon-Grafik). */
export function getAppIcon(id) {
  switch (id) {
    case 'player': return nowplaying;
    case 'playlists': return list;
    case 'maps': return maps;
    case 'settings': return settingsGear;
    case 'phone': return phone;
    case 'messages': return messages;
    case 'clock': return clock;
    case 'calendar': {
      const d = new Date();
      const wd = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'][d.getDay()];
      return calendar(wd, d.getDate());
    }
    default: return nowplaying;
  }
}
