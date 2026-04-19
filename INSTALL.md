# Installationsanleitung – TKD Trainer PWA

Diese Anleitung beschreibt die Einrichtung der App vom ersten Klonen/Kopieren bis zur installierten Progressive Web App auf dem Endgerät.

---

## 1. Voraussetzungen

| Komponente | Mindest-Version | Anmerkung |
|---|---|---|
| Node.js | 20 LTS | Empfohlen: aktuelle LTS |
| npm | 10 | Im Node LTS enthalten |
| Browser | Chrome/Edge/Safari/Firefox aktuell | PWA-Install über Chromium-Browser am besten |
| Google-Konto | — | Nur falls Cloud-Sync genutzt werden soll |

Die App speichert Daten **lokal im Browser** (SQLite in IndexedDB via `sql.js`) und synchronisiert bei Bedarf mit **Google Drive** (Scope `drive.file`, also nur von der App erstellte Dateien).

---

## 2. Projekt einrichten

```bash
# 1. In das Projektverzeichnis wechseln
cd C:\Projekte\apps\taekwondo-trainer-app

# 2. Abhängigkeiten installieren
npm install

# 3. Entwicklungsserver starten
npm run dev
```

Der Dev-Server läuft standardmäßig unter `http://localhost:5173`.

---

## 3. Produktiv-Build und Deployment

```bash
npm run build   # erzeugt dist/
npm run preview # lokale Vorschau des Builds
```

Der Inhalt von `dist/` kann anschließend auf **jede statische Hosting-Plattform** deployt werden, z. B.:

- **GitHub Pages**, **Netlify**, **Vercel**, **Cloudflare Pages** — Ordner `dist/` hochladen.
- **Eigener Webserver (nginx / Apache / IIS)** — Inhalt nach `wwwroot` kopieren; SPA-Rewrite so konfigurieren, dass unbekannte Pfade auf `index.html` umgeleitet werden:
  - nginx: `try_files $uri /index.html;`
  - Apache: `FallbackResource /index.html`

**Wichtig**: Für PWA-Funktionalität (Service Worker, Installation) muss die App über **HTTPS** ausgeliefert werden. Lokaler `localhost` zählt als „sicherer Ursprung" und funktioniert auch ohne TLS.

---

## 4. Google Drive Cloud-Sync einrichten (optional)

Die App benötigt eine **eigene OAuth-Client-ID** von Google, damit Nutzer sich mit ihrem Google-Konto anmelden können.

### 4.1 Google Cloud Projekt anlegen

1. Öffnen: <https://console.cloud.google.com/>
2. Oben links neues Projekt erstellen: z. B. **„TKD Trainer"**.
3. Links im Menü **„APIs & Dienste" → „Aktivierte APIs"** öffnen.
4. Auf **„+ APIs und Dienste aktivieren"**, dann **Google Drive API** suchen und aktivieren.

### 4.2 OAuth-Zustimmung konfigurieren

1. **„APIs & Dienste" → „OAuth-Zustimmungsbildschirm"**.
2. **User Type: Extern** wählen.
3. App-Name: **„TKD Trainer"**, Support-E-Mail eintragen.
4. Scopes: Auf **„Scopes hinzufügen"** klicken und **`https://www.googleapis.com/auth/drive.file`** wählen.
5. Testnutzer: Eigene Google-Mail-Adresse eintragen.

### 4.3 OAuth-Client-ID erstellen

1. **„APIs & Dienste" → „Anmeldedaten"**.
2. **„+ Anmeldedaten erstellen" → „OAuth-Client-ID"**.
3. Anwendungstyp: **Webanwendung**.
4. Autorisierte JavaScript-Ursprünge:
   - `http://localhost:5173` (für Entwicklung)
   - `https://IHRE-DOMAIN` (für Produktion)
5. **Client-ID kopieren** (Format: `…apps.googleusercontent.com`).

446797811667-bsvl8h3srocngu3ka6h2oitig4ocnvvr.apps.googleusercontent.com


### 4.4 In der App eintragen

1. App öffnen → **Einstellungen → ☁ Cloud-Sync**.
2. **Google OAuth Client-ID** einfügen → **Client-ID speichern**.
3. **🔗 Verbinden** klicken → Google-Login-Dialog durchlaufen.
4. Nach erfolgreicher Verbindung: **⬆ Jetzt sichern** drückt einmalig die aktuelle lokale DB nach Drive.

> **Was wird gesichert?** Eine Datei `taekwondo-trainer.db` (aktueller Stand) sowie ein Unterordner `TKD-Trainer-Archive/` mit täglichen Snapshots. Diese Dateien sind nur für die App sichtbar — weder andere Apps noch Ihr Drive-Explorer zeigen sie im Hauptordner an.

### 4.5 Automatisches Verhalten

- **Beim Start**: Wenn Client-ID hinterlegt ist, versucht die App stillschweigend, das Access-Token zu erneuern und die neueste DB zu laden.
- **Beim Verlassen** (Tab schließen / in Hintergrund): Änderungen werden automatisch nach Drive hochgeladen.
- **Einmal pro Tag**: Ein zusätzliches Archiv (`taekwondo-trainer-YYYY-MM-DD.db`) wird im Unterordner abgelegt. Archive älter als 30 Tage werden entfernt (es bleiben aber immer mindestens 7 erhalten).

---

## 5. KI-Anbindung einrichten (optional)

1. **Einstellungen → KI**.
2. Provider wählen: **Claude** (empfohlen), **OpenAI** oder **Custom**.
3. Modell auswählen (Dropdown).
4. **API-Key eingeben**:
   - Claude: `sk-ant-…` von <https://console.anthropic.com/>
   - OpenAI: `sk-…` von <https://platform.openai.com/api-keys>
5. **🔌 Verbindung testen** — zeigt grün bei Erfolg.
6. **Speichern**.

> **Sicherheit**: Der API-Key wird mit **AES-GCM (WebCrypto)** verschlüsselt lokal in IndexedDB gespeichert. Der Master-Key verlässt das Gerät nicht — auch nicht über das Drive-Backup (auf neuem Gerät muss der Key erneut eingegeben werden).

Die einzelnen KI-Funktionen (Einheitsvorschläge, Phasenplan, Dashboard-Empfehlung, Progression, Variation, Bibliotheksvorschläge) können weiter unten auf der Seite einzeln aktiviert/deaktiviert werden.

---

## 6. Als PWA installieren

Nach dem Produktiv-Deployment kann die App wie eine native App installiert werden.

### Mobile (iOS Safari)
- URL aufrufen → **Teilen → Zum Home-Bildschirm**.

### Mobile (Android Chrome)
- URL aufrufen → Pop-up „TKD Trainer installieren?" bestätigen, alternativ Menü → **App installieren**.

### Desktop (Chrome/Edge)
- Rechts in der Adressleiste erscheint ein **Install-Icon** (⊕). Klicken → App läuft anschließend in eigenem Fenster ohne Browser-Chrome.

Die App funktioniert **offline** (Kern-Funktionen). Nur die KI-Aufrufe und Google-Drive-Sync benötigen eine Internetverbindung.

---

## 7. Fehlersuche

| Symptom | Ursache / Lösung |
|---|---|
| Weißer Bildschirm nach `npm run dev` | Console öffnen (F12). Häufig fehlen Abhängigkeiten — `npm install` erneut ausführen. |
| „Kein API-Key konfiguriert" beim KI-Vorschlag | Einstellungen → KI → Key eintragen und speichern. |
| Drive-Verbindung fehlschlägt (popup_closed_by_user) | Popup-Blocker deaktivieren; sicherstellen, dass die Domain in den autorisierten Ursprüngen eingetragen ist. |
| Konflikt zwischen zwei Geräten | Dialog erscheint beim Start; sicherheitshalber **„Aus Drive laden"** über Einstellungen ausführen oder lokal speichern, dann manuell hochladen. |
| Daten weg nach Browser-Cache-Leeren | Lokale DB verloren — falls Drive verbunden: **Einstellungen → ⬇ Aus Drive laden** stellt wieder her. |

---

## 8. Deinstallation / Datenexport

- **App entfernen**: Im Browser über die App-Einstellungen oder im System über „Apps/Programme".
- **Lokale Daten löschen**: Browser → Seiteneinstellungen → Speicher leeren (alternativ im Browser-DevTools → Application → IndexedDB: Datenbanken `tkd-trainer` und `tkd-trainer-secure` löschen).
- **Export**: Aktuell nur über den manuellen Upload nach Google Drive. CSV-/PDF-Export ist als Erweiterungsstufe vorgesehen.
