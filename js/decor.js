/* =========================================================
   decor.js — rein optische "Apps" (Deko) im CarPlay-Stil:
   Karten (Fake-Navi), Uhr (live), Kalender, Telefon, Nachrichten.
   ========================================================= */
import { registerScreen } from './app.js';
import { getAppIcon } from './appicons.js';

/* ---------- Karten (Fake-Navigation) ---------- */
registerScreen('maps', {
  render(root) {
    root.classList.add('full-bleed');
    root.innerHTML = `
      <div class="maps">
        <svg class="maps-canvas" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="1000" height="560" fill="#aacbe6"/>
          <path d="M-20 420 H1020 V580 H-20Z" fill="#9ec6a0"/>
          <path d="M120 -20 C 300 160, 250 360, 520 420 S 900 460, 980 300"
                fill="none" stroke="#ffffff" stroke-width="54"/>
          <path d="M120 -20 C 300 160, 250 360, 520 420 S 900 460, 980 300"
                fill="none" stroke="#d9dde2" stroke-width="40"/>
          <path d="M-20 240 H1020" stroke="#ffffff" stroke-width="30" opacity=".85"/>
          <path d="M700 -20 V580" stroke="#ffffff" stroke-width="26" opacity=".7"/>
          <path d="M120 -20 C 300 160, 250 360, 520 420 S 900 460, 980 300"
                fill="none" stroke="#2b7bff" stroke-width="16" stroke-linecap="round"/>
          <circle cx="520" cy="420" r="15" fill="#2b7bff" stroke="#fff" stroke-width="5"/>
        </svg>
        <div class="maps-card panel">
          <div class="maps-turn">↱</div>
          <div class="maps-info">
            <div class="maps-dist">400 m</div>
            <div class="maps-street">Rechts in die Musterstraße</div>
          </div>
          <div class="maps-eta"><span>12 Min</span><small>5,4 km · 23:48</small></div>
        </div>
        <div class="decor-badge">Nur Optik</div>
      </div>`;
  },
  onLeave() { /* no-op */ },
});

/* ---------- Uhr (live) ---------- */
let clockTimer = null;
registerScreen('clock', {
  render(root) {
    root.innerHTML = `
      <div class="clock-screen">
        <div class="clock-big" id="clock-big">--:--</div>
        <div class="clock-date" id="clock-date"></div>
        <div class="decor-badge">Nur Optik</div>
      </div>`;
  },
  onEnter(root) {
    const big = root.querySelector('#clock-big');
    const date = root.querySelector('#clock-date');
    const tick = () => {
      const d = new Date();
      const fmt = (() => { try { return localStorage.getItem('clockFormat') || '24'; } catch (e) { return '24'; } })();
      let h = d.getHours();
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      if (fmt === '12') { const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; big.textContent = `${h}:${m}:${s} ${ap}`; }
      else { big.textContent = `${String(h).padStart(2, '0')}:${m}:${s}`; }
      const wd = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][d.getDay()];
      const mo = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][d.getMonth()];
      date.textContent = `${wd}, ${d.getDate()}. ${mo}`;
    };
    tick();
    clockTimer = setInterval(tick, 1000);
  },
  onLeave() { if (clockTimer) { clearInterval(clockTimer); clockTimer = null; } },
});

/* ---------- Kalender (Datumskarte) ---------- */
registerScreen('calendar', {
  render(root) {
    const d = new Date();
    const wd = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][d.getDay()];
    const mo = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][d.getMonth()];
    root.innerHTML = `
      <div class="cal-screen">
        <div class="cal-card panel">
          <div class="cal-wd">${wd.toUpperCase()}</div>
          <div class="cal-day">${d.getDate()}</div>
          <div class="cal-mo">${mo} ${d.getFullYear()}</div>
        </div>
        <div class="decor-badge">Nur Optik</div>
      </div>`;
  },
});

/* ---------- Telefon / Nachrichten (schicke Platzhalter) ---------- */
function decorPlaceholder(id, title, text) {
  registerScreen(id, {
    render(root) {
      root.innerHTML = `
        <div class="decor-ph">
          <div class="decor-ph-icon">${getAppIcon(id)}</div>
          <div class="decor-ph-title">${title}</div>
          <div class="decor-ph-text">${text}</div>
          <div class="decor-badge">Nur Optik</div>
        </div>`;
    },
  });
}
decorPlaceholder('phone', 'Telefon', 'In dieser Version nur als CarPlay-Optik enthalten.');
decorPlaceholder('messages', 'Nachrichten', 'In dieser Version nur als CarPlay-Optik enthalten.');
