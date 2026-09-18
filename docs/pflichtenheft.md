# Ofenrohr — Pflichtenheft (Machbarkeitsstudie)

| Feld | Wert |
| --- | --- |
| Version | 0.1 |
| Stand | 2026-09-18 |
| Status | lebendiges Paper; Beschlüsse unten gelten, bis sie hier geändert werden |
| Arbeitsverzeichnis | `C:\Developement\Ofenrohr` |

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
| B4 | Teilen | **Server-optional, payload-first.** v1 teilt eine lokale `.ofenrohr`-Datei über die System-Teilen-Funktion. Ein Relay wird spezifiziert (`docs/relay-api.md`), nicht öffentlich betrieben. |
| B5 | Technologie | **Expo (React Native) + TypeScript**, Testen mit Expo Go. Kein EAS als Abhängigkeit. Nur FOSS-Komponenten. |
| B6 | Studie-Grenzen | Keine Accounts, kein Feed, kein Push, kein Tracking, keine Bezahlung, kein Store-Release, kein öffentlicher Bilderserver. Kamera nur als optionaler Hintergrund, kein AR-Labeling. |
| B7 | Sprache | UI und Paper **deutsch**. |
| B8 | Lizenz | App und Docs: **MIT**. Assets nur SIL/OFL, CC oder selbst erstellt. Panorama: Poly Haven „Alps Field“, CC0. |
| B9 | Erzeugen | **Foto aus der Mediathek**, dann Handy halten und **Lage per Knopf übernehmen**. Kein Pflicht-Preset. Empfänger muss dieselbe Lage treffen. |
| B10 | Blick.view | Datei speichert `sensors` (Lage vs. Finger) und `background` (`black` / `camera` / `panorama`). Empfänger kann in der Ansicht umschalten. Sensor verweigert → Finger. Kamera verweigert → Schwarz. |

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

Zusätzlich (Hauptweg, B9): **aktuelle Lage übernehmen** — Sender hält das Gerät und speichert den gemessenen Gravitationvektor per Knopf. Presets bleiben nur für Demos (Gebirge / Beispieldatei).

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

**Expo-Go-Grenzen, die wir akzeptieren:** eigene Native-Module und manches AR gehen erst im Dev-Build. Sensoren, Bilder, Teilen, geschlossenes Rohr: in Expo Go machbar.

**Außerhalb von Softwarelizenzen:** Apple- und Google-Store-Konten sind Plattformgebühren. Für die Studie reichen Expo Go, Sideload und interne Builds.

---

## 6. Funktionsumfang der Studie

**Soll (Stand 2026-09-18, im Repo):**

1. Dieses Paper als lebendiges Pflichtenheft.
2. Expo-App: Lage lesen, Zielrichtung (Preset „oben“ + frei einfrieren), Winkelanzeige zum Debuggen.
3. Ofenrohr-UI: Kreisöffnung ohne Halo; Foto als Pin; Hintergründe Schwarz / Kamera / Gebirge.
4. Ofenrohr erzeugen: Foto aus der Mediathek, Lage per Knopf übernehmen, Steuerung und Hintergrund wählen, teilen.
5. Blick als Datei exportieren/importieren (System-Teilen). `view` in der Datei.
6. Leerer Blick: kein Foto, optional Alpenpanorama in der Kugel.

**Nicht in der Studie:** Accounts, Feed, Freundeslisten, Push, Tracking, Bezahlfunktionen, Store-Release, öffentlicher Bilderserver, eigenes 360° in der Blick-Datei.

---

## 7. Offene Punkte (kein Beschluss)

| ID | Thema | Anmerkung |
| --- | --- | --- |
| O1 | App-Name | Arbeitstitel Ofenrohr; Tonalität (derb vs. still) offen. |
| O2 | Leere | Erledigt: Hintergrund wählbar (schwarz / Kamera / festes Alpenpanorama). |
| O3 | Richtung aufnehmen | Erledigt (B9): Sender hält das Gerät und übernimmt die Lage per Knopf. |
| O4 | Barrierefreiheit | Reine Sensor-UI schließt Nutzung aus. Fallback „Bild trotzdem zeigen“ wäre anti-Pointe. Später klären. |
| O5 | Relatives Gyro-Heading | Könnte „Wand vor dir“ ohne Kompass in einer Sitzung simulieren. Nicht v1. |

---

## 8. Änderungsprotokoll

| Datum | Änderung |
| --- | --- |
| 2026-09-18 | Erstfassung aus der Machbarkeitsdiskussion. Beschlüsse B1–B8. |
| 2026-09-18 | Studie-App (Expo, Expo Go) und Dateiformat `.ofenrohr` ergänzt. Relay nur als Spezifikation. |
| 2026-09-18 | B9: Erzeugen = Mediathek-Foto + Lage per Knopf; Empfänger muss dieselbe Lage treffen. |
| 2026-09-18 | Bild ohne Helligkeits-Fade, nur Rand-Clip. Blickrichtung volle Kugel (Kompass + Höhe). |
| 2026-09-18 | B1/B10: Hintergründe Schwarz, Kamera, CC0-Alpenpanorama; Fingersteuerung; `view` in der Datei. Halo entfernt. |
