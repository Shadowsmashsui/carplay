# CarPlay für iPad – Spotify-Fernbedienung

Ein Web-App-Nachbau von Apple CarPlay (iOS-26/27-Look) fürs iPad. Liegt als „Autoradio"
neben deinem Forza-Screen und steuert Spotify (das auf deinem PC läuft) per **Spotify Connect**.

- **Optik:** CarPlay-Home mit Dock, bunten Wallpapers, Apple-artigen App-Icons.
- **Funktional:** Jetzt-läuft (Play/Pause, Skip, Shuffle, Lautstärke, Seek), Playlists starten,
  Gerätewahl, Einstellungen (Hintergrund wechseln).
- **Deko (nur Optik):** Karten (Fake-Navi), Uhr, Kalender, Telefon, Nachrichten.

> Die Musik läuft **nicht** im iPad-Browser, sondern auf deinem PC. Das iPad ist die Fernbedienung –
> genau wie echtes CarPlay. Dafür brauchst du **Spotify Premium**.

---

## Einrichtung (einmalig)

### 1. Spotify-App anlegen (kostenlos, kein Secret nötig)
1. Öffne das **Spotify Developer Dashboard**: https://developer.spotify.com/dashboard
2. Mit deinem Spotify-Account einloggen → **Create app**.
3. Ausfüllen:
   - **App name / description:** beliebig (z. B. „CarPlay").
   - **Redirect URI:** deine spätere Web-Adresse (siehe Schritt 3). Beispiel:
     `https://DEIN-NAME.github.io/DEIN-REPO/carplay/`
     *(Für lokale Tests zusätzlich eintragen:* `http://127.0.0.1:8777/` *)*
   - **Which API/SDKs:** **Web API** ankreuzen.
4. Speichern → **Settings** öffnen → **Client ID** kopieren.

### 2. Client-ID eintragen
Öffne [`config.js`](config.js) und trage deine Client-ID ein:
```js
export const CLIENT_ID = "HIER_DEINE_CLIENT_ID";
```
`REDIRECT_URI` wird automatisch aus der aktuellen Adresse gebildet – sie muss **exakt** mit
einer im Dashboard hinterlegten Redirect URI übereinstimmen (inkl. abschließendem `/`).

### 3. Auf GitHub Pages veröffentlichen
1. Repo zu GitHub pushen.
2. Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch `main`, Ordner `/ (root)` → Save.
3. Nach ~1 Min ist die App unter `https://DEIN-NAME.github.io/DEIN-REPO/carplay/` erreichbar.
   Diese URL muss im Spotify-Dashboard als Redirect URI stehen (Schritt 1).

### 4. Aufs iPad holen (wie eine echte App)
1. Im **Safari** auf dem iPad die Pages-URL öffnen.
2. **Teilen-Symbol → „Zum Home-Bildschirm"**.
3. Vom Home-Bildschirm starten → öffnet randlos im Querformat.

### 5. Loslegen
1. **Spotify auf dem PC** öffnen und einmal etwas abspielen (damit es als Gerät auftaucht).
2. In der CarPlay-App **„Mit Spotify verbinden"** → einloggen.
3. In **Jetzt läuft** oben rechts auf das **Geräte-Symbol** → deinen **PC** auswählen.
4. Fertig – steuere Musik vom iPad, während Forza läuft. 🎧🏎️

---

## Lokal testen (am PC)
Im Ordner `carplay/`:
```bash
python -m http.server 8777 --bind 127.0.0.1
```
Dann `http://127.0.0.1:8777/` im Browser öffnen. `127.0.0.1` ist als Redirect URI bei Spotify erlaubt.

Ohne Login kannst du über **„Ohne Login ansehen"** die komplette Optik durchklicken.

---

## Technik (kurz)
- Statische PWA, reines HTML/CSS/Vanilla-JS (ES-Module), **kein Build, kein Backend**.
- Spotify **OAuth Authorization Code + PKCE** (clientseitig, kein Secret).
- Steuerung über die **Spotify Web API** (Connect-Endpoints), Status-Polling ~1 s.
- Voraussetzungen: **Spotify Premium** + ein aktives Spotify-Gerät (dein PC).
