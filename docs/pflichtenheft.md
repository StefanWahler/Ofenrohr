# Ofenrohr — Pflichtenheft (Machbarkeitsstudie)

| Feld | Wert |
| --- | --- |
| Version | 0.2 |
| Stand | 2026-09-18 |
| Status | lebendiges Paper; Beschlüsse unten gelten, bis sie hier geändert werden |
| Arbeitsverzeichnis | `C:\Developement\Ofenrohr` |
| Git | https://github.com/StefanWahler/Ofenrohr (öffentlich, Branch `main`) |

Dieses Dokument ist die Entscheidungsgrundlage. Chat-Verlauf ersetzt es nicht. Neue Beschlüsse und verworfene Optionen werden hier nachgetragen.

---

## 1. Produktkern

Die Redensart **„Mit dem Ofenrohr ins Gebirge schauen“** (artverwandt: **„in die Röhre gucken“**) bedeutet: leer ausgehen, etwas nicht bekommen, Wunschdenken. Die App nimmt das wörtlich.

Das Handy **ist** das Ofenrohr. Man hält es wie ein Sichtrohr in eine Richtung. Nur wenn die Lage (und optional die Kompassrichtung) zur Vorgabe passt, erscheint ein Bild am Ende des Rohrs. Schwenkt man weg, rutscht das Bild aus dem Blick — wie beim Durchschauen durch ein Rohr, nicht wie ein Ein/Aus-Schalter.

**Soziale Geste:** Jemand schickt einer anderen Person einen *Blick*: Bild plus Anleitung, wohin das Handy zu halten ist (Beispiel: senkrecht nach oben). Der Empfänger muss erst suchen. Die Pointe kann ein Bild sein — oder buchstäblich nichts / Gebirge, also leer ausgehen.

**Arbeitstitel**

- **Blick** — ein Paket aus Bild (optional), Zielrichtung und Metadaten.
- **Ofenrohr** — die Ansicht, in der man sucht.

Vorbild für die Sensorik sind Planet-Finder-Apps. Der Zweck ist umgekehrt: nicht der Himmel wird beschriftet, sondern **ein Objekt hängt an einer Richtung**; das Display ist die Rohröffnung. Blickrichtung der Studie: Rückseite des Geräts zeigt zum Ziel, Bildschirm zum Gesicht (wie beim Sternenhimmel-Zeigen).

---

## 2. Beschlüsse

Gültig für die Machbarkeitsstudie, bis dieses Paper sie ändert.

| ID | Thema | Beschluss |
| --- | --- | --- |
| B1 | Darstellung | **Hybrid.** Drei Hintergründe in der Rohröffnung: **Schwarz**, **Kamera** (Rückseite, Fallback Schwarz ohne Erlaubnis), **Gebirge** (festes CC0-Alpenpanorama als Kugelinnenfläche). Das mitgesendete Foto hängt als Pin auf derselben Blickrichtung. Kein farbiger Halo, kein stilisiertes Overlay-Gebirge. Eigenes 360° in der Datei ist später optional, nicht v1. |
| B2 | Sensor v1 | **Lage + Himmelsrichtung.** Blickrichtung ist die Geräterückseite als Punkt auf einer Kugel (ENU). Kompass (Magnetometer, kippkompensiert) plus Neigung. Alte Dateien ohne `look` bleiben neigungsbasiert. |
| B3 | Bildführung | **Winkelfehlerabhängig**, nicht binär. Das Foto rutscht in der Kreisöffnung (Kugel-Parallaxe), ohne Helligkeits-Fade. Weit daneben nur der gewählte Hintergrund. |
| B4 | Teilen | **Server-optional, payload-first.** v1 teilt eine lokale `.ofenrohr`-Datei über die System-Teilen-Funktion. Dateiname aus dem Anzeigenamen (`Name.ofenrohr`). Ein Relay wird spezifiziert (`docs/relay-api.md`), nicht öffentlich betrieben. In Expo Go öffnet man die Datei über **Blick empfangen** (Dokumentenwähler). Eigene Datei-Association `.ofenrohr` erst im Standalone-Build. |
| B5 | Technologie | **Expo SDK 57** (React Native + TypeScript), Testen mit Expo Go **57**. Kein EAS als Abhängigkeit. Nur FOSS-Komponenten. Quelltext: GitHub wie oben. |
| B6 | Studie-Grenzen | Keine Accounts, kein Feed, kein Push, kein Tracking, keine Bezahlung, kein Store-Release, kein öffentlicher Bilderserver. Kamera nur als optionaler Hintergrund, kein AR-Labeling. |
| B7 | Sprache | UI und Paper **deutsch**. |
| B8 | Lizenz | App und Docs: **MIT**. Assets nur SIL/OFL, CC oder selbst erstellt. Panorama: Poly Haven „Alps Field“, CC0. |
| B9 | Erzeugen | **Foto aus der Mediathek**, optional **Name**, dann Handy halten und **Lage per Knopf übernehmen**. Sender legt Steuerung und Hintergrund für den Empfänger fest. Kein Pflicht-Preset in der Erzeugen-UI. Empfänger muss dieselbe Blickrichtung treffen. |
| B10 | Blick.view | Datei speichert `sensors` (Lage vs. Finger) und `background` (`black` / `camera` / `panorama`). Empfänger kann in der Ansicht umschalten (Test). Sensor verweigert → Finger. Kamera verweigert → Schwarz (Umschalter bleibt auf Kamera). **Schieben im Kreis geht immer;** der erste Fingerstrich schaltet von Sensor auf Finger, ohne Sprung der Blickrichtung. |

### 2.1 Begründung B1 (Darstellung)

Die Magie steckt in Sensor plus Rohr-Parallaxe. Kamera ist ein wählbarer Hintergrund, kein Pflicht-AR. Ohne Erlaubnis bleibt die Öffnung schwarz. Das Gebirge ist ein festes, freies 360°-Bild an der Kugelinnenfläche — nicht mitgesendet, damit die Datei klein bleibt.

### 2.2 Begründung B4 (Teilen)

Ein kleiner selbst gehosteter Dienst wäre für kurze Links bequem. Dagegen stehen: Machbarkeitsstudie ohne Monetarisierung, Kosten- und Haftungsrisiko bei fremden Bildern (DSGVO, missbräuchliche Inhalte, Anbieterkennzeichnung in DE/EU). Deshalb ist das Dateiformat kanonisch und der Server nur Komfort. Die App muss funktionieren, wenn kein Relay läuft.

Messenger, AirDrop, Mail und USB sind die Infrastruktur der Nutzer, nicht unsere.

### 2.3 Begründung B5 (Expo)

`expo-sensors` (DeviceMotion, Magnetometer) ist in Expo Go enthalten und MIT-lizenziert. Eine Codebasis für gängige iOS- und Android-Geräte. Eigene Builds später lokal (Android Studio / Xcode), ohne bezahltes EAS. Flutter wäre ebenfalls FOSS; Expo trifft den vorhandenen Testweg.

---

## 3. Sensor- und Blickkonzept

### 3.1 Zielmodi

Ein Sender wählt einen Modus:

1. **Lage** (ältere Dateien ohne `look`): nur Neigung zur Schwerkraft.
2. **Lage + Azimut** (Standard): Magnetometer plus Gravitation, Blickrichtung der Rückseite als ENU-Vektor. Wie eine Planeten-App: nur wer Höhe *und* Himmelsrichtung trifft, sieht das Bild. Indoor kann der Kompass stören; Acht schwenken, von Metall fernhalten.

Ohne Kompass war die **Himmelsrichtung** früher nicht bestimmbar. Das gilt nur noch für alte Dateien ohne `look`.

### 3.2 Presets (v1)

| Preset | Bedeutung | Ziel-Gravitation (näherungsweise) |
| --- | --- | --- |
| Oben | Rückseite zum Zenit (Planet-Finder „Himmel“) | `{ x: 0, y: 0, z: 1 }` |
| Boden | Rückseite zum Boden, Bildschirm nach oben | `{ x: 0, y: 0, z: -1 }` |
| Brust | Hochkant, Bildschirm zum Gesicht, Horizont | `{ x: 0, y: -1, z: 0 }` |

Zusätzlich (Hauptweg, B9): **aktuelle Lage übernehmen** — Sender hält das Gerät und speichert den gemessenen Blickvektor (Lage + Kompass) per Knopf. Presets bleiben nur für Demos (Home „Ins Gebirge schauen“, `examples/gebirge.ofenrohr`: Zenit, Hintergrund Panorama).

### 3.3 Abbildung des Winkelfehlers

- Kleines Winkelfenster: das mitgesendete Foto sitzt in der Öffnung.
- Beim Schwenken: Foto wandert in der Kreisöffnung (Projektion auf die Blickkugel), Rohrwand / Hintergrund wird sichtbar.
- Weit daneben: nur der gewählte Hintergrund (schwarz, Kamera oder Alpenpanorama). Kein farbiger Hof.

Technisch reicht ein Equirectangular-Ausschnitt für die schmale Rohr-FOV. Ein 3D-Mesh (etwa später Three.js / expo-gl) ist optional.

---

## 4. Teilen und Dateiformat

Kanonischer Austausch: eine Datei **`.ofenrohr`** (JSON, Schema `ofenrohr.blick.v1`). Felder und Regeln: Abschnitt in [`docs/relay-api.md`](relay-api.md) (Payload ist dieselbe, mit oder ohne Relay).

```text
Sender erstellt Blick → .ofenrohr-Datei
        ├─ System-Teilen (Signal, WhatsApp, Mail, AirDrop, …)
        └─ optional später: Relay (kurzer Link, Ablauf)
Empfänger öffnet Datei in der App → Ofenrohr-Ansicht
```

Dateiname: Stamm aus `name` (Pfadzeichen gestrichen), sonst `ofenrohr`. Endung immer `.ofenrohr`.

In Expo Go gibt es keine App-Datei-Association. Empfangsweg: System-Teilen → Datei sichern → in der App **Blick empfangen**. Ein späterer Store-/Sideload-Build darf `.ofenrohr` als Typ registrieren; das ändert das Dateiformat nicht.

Öffentlicher Relay: nur wenn es einen belastbaren Grund gibt (kurze Links, Ablauf, Rückruf). Gegenmittel schon in der Spezifikation: Ablauf, Größenlimit, Server abschaltbar.

---

## 5. Technologie und FOSS-Leitplanken

- Stack: Expo, React Native, React — MIT / Apache-2.0.
- Sensoren: `expo-sensors`. Bilder: `expo-image-picker`. Dateien: `expo-file-system`, `expo-sharing`, `expo-document-picker`. Optionaler Kamerahintergrund: `expo-camera`.
- Keine Firebase, keine Google-Maps-SDK, keine proprietären Analytics-/Crash-Dienste.
- Schrift, Icons, Texturen: nur SIL/OFL, CC oder selbst erstellt.
- Falls später Karte: OpenStreetMap + FOSS-Renderer.
- Relais später: kleines Programm hinter Caddy, Lizenz MIT oder Apache-2.0.

**Expo Application Services** (Cloud-Build) ist optional und **keine** Abhängigkeit. `eas.json` wird nicht vorausgesetzt.

**Expo-Go-Grenzen, die wir akzeptieren:** eigene Native-Module, Datei-Association und manches AR gehen erst im Dev-/Standalone-Build. Sensoren, Mediathek, Teilen, Kamera-Hintergrund, festes Panorama, Fingersteuerung: in Expo Go SDK 57 machbar. Store-Expo-Go und Projekt-SDK müssen dieselbe Major-Version sein.

**Außerhalb von Softwarelizenzen:** Apple- und Google-Store-Konten sind Plattformgebühren. Für die Studie reichen Expo Go, Sideload und interne Builds.

---

## 6. Funktionsumfang der Studie

**Soll (Stand 2026-09-18, im Repo, getestet in Expo Go):**

1. Dieses Paper als lebendiges Pflichtenheft; Quelltext auf GitHub.
2. Expo-App SDK 57: Lage + Kompass (ENU), Debug-HUD in der Rohransicht (an/aus).
3. Ofenrohr-UI: Kreisöffnung ohne Halo; Foto als Pin; Hintergründe Schwarz / Kamera / Gebirge (Poly Haven Alps Field, CC0, `assets/panoramas/`).
4. Steuerung: Sensoren oder Finger; Schieben im Kreis übernimmt auf Finger. Test-Umschalter während der Ansicht.
5. Ofenrohr erzeugen: Name, Foto aus der Mediathek, Lage per Knopf, Steuerung und Hintergrund wählen, teilen.
6. Blick als `.ofenrohr` exportieren/importieren (System-Teilen / Dokumentenwähler). Felder `name`, `look`, `view`.
7. Demo „Ins Gebirge schauen“: leerer Blick, Zenit, Panorama-Hintergrund.

**Nicht in der Studie:** Accounts, Feed, Freundeslisten, Push, Tracking, Bezahlfunktionen, Store-Release, öffentlicher Bilderserver, eigenes 360° in der Blick-Datei, Datei-Association in Expo Go.

---

## 7. Offene Punkte (kein Beschluss)

| ID | Thema | Anmerkung |
| --- | --- | --- |
| O1 | App-Name | Arbeitstitel Ofenrohr; Tonalität (derb vs. still) offen. |
| O2 | Leere | Erledigt: Hintergrund wählbar (schwarz / Kamera / festes Alpenpanorama). |
| O3 | Richtung aufnehmen | Erledigt (B9): Sender hält das Gerät und übernimmt die Lage per Knopf. |
| O4 | Barrierefreiheit | Fingersteuerung ist der Fallback (B10). „Bild trotzdem zeigen“ bleibt anti-Pointe und kein v1-Weg. |
| O5 | Relatives Gyro-Heading | Könnte „Wand vor dir“ ohne Kompass in einer Sitzung simulieren. Nicht v1. |
| O6 | Eigenes 360° | Mitgesendetes Panorama (späterer Monetarisierungs-Hook) nicht v1; App-Panorama bleibt fest. |
| O7 | Datei-Association | `.ofenrohr` im Standalone-Build öffnen. Expo Go: nur Dokumentenwähler. |

---

## 8. Änderungsprotokoll

| Datum | Änderung |
| --- | --- |
| 2026-09-18 | Erstfassung aus der Machbarkeitsdiskussion. Beschlüsse B1–B8. |
| 2026-09-18 | Studie-App (Expo, Expo Go) und Dateiformat `.ofenrohr` ergänzt. Relay nur als Spezifikation. |
| 2026-09-18 | B9: Erzeugen = Mediathek-Foto + Lage per Knopf; Empfänger muss dieselbe Lage treffen. |
| 2026-09-18 | Bild ohne Helligkeits-Fade, nur Rand-Clip. Blickrichtung volle Kugel (Kompass + Höhe). |
| 2026-09-18 | B1/B10: Hintergründe Schwarz, Kamera, CC0-Alpenpanorama; Fingersteuerung; `view` in der Datei. Halo entfernt. |
| 2026-09-18 | v0.2: GitHub-Remote; SDK 57; Name in Datei/Dateiname; Fingerstrich übernimmt von Sensor; Datei-Association erst Standalone; O4/O6/O7. |
