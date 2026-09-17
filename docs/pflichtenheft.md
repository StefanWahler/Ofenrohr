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
| B1 | Darstellung | **Hybrid, Stufen.** Jetzt: geschlossenes Rohr (kein Kamerabild, keine Kamera-Berechtigung). Später: optionale Kameradurchsicht, dieselbe Richtungsphysik. |
| B2 | Sensor v1 | **Lage relativ zur Schwerkraft.** Presets und „Lage einfrieren“ speichern den Gravitationvektor. Kompass-Azimut ist in der Datenstruktur vorgesehen, in v1 nicht nötig. |
| B3 | Bildführung | **Winkelfehlerabhängig**, nicht binär. Parallaxe im Rohr; weit daneben nur Rohrinneres und Gebirge. |
| B4 | Teilen | **Server-optional, payload-first.** v1 teilt eine lokale `.ofenrohr`-Datei über die System-Teilen-Funktion. Ein Relay wird spezifiziert (`docs/relay-api.md`), nicht öffentlich betrieben. |
| B5 | Technologie | **Expo (React Native) + TypeScript**, Testen mit Expo Go. Kein EAS als Abhängigkeit. Nur FOSS-Komponenten. |
| B6 | Studie-Grenzen | Keine Accounts, kein Feed, kein Push, kein Tracking, keine Bezahlung, kein Store-Release, kein öffentlicher Bilderserver, kein Kameramodus. |
| B7 | Sprache | UI und Paper **deutsch**. |
| B8 | Lizenz | App und Docs: **MIT**. Assets nur SIL/OFL, CC oder selbst erstellt. |

### 2.1 Begründung B1 (Darstellung)

Die Magie steckt in Sensor plus Rohr-Parallaxe, nicht in AR-Kamera. Kamera erhöht Aufwand (Berechtigungen, Belichtung, Datenschutz) und ist für den Machbarkeitsbeweis entbehrlich.

### 2.2 Begründung B4 (Teilen)

Ein kleiner selbst gehosteter Dienst wäre für kurze Links bequem. Dagegen stehen: Machbarkeitsstudie ohne Monetarisierung, Kosten- und Haftungsrisiko bei fremden Bildern (DSGVO, missbräuchliche Inhalte, Anbieterkennzeichnung in DE/EU). Deshalb ist das Dateiformat kanonisch und der Server nur Komfort. Die App muss funktionieren, wenn kein Relay läuft.

Messenger, AirDrop, Mail und USB sind die Infrastruktur der Nutzer, nicht unsere.

### 2.3 Begründung B5 (Expo)

`expo-sensors` (DeviceMotion, Magnetometer) ist in Expo Go enthalten und MIT-lizenziert. Eine Codebasis für gängige iOS- und Android-Geräte. Eigene Builds später lokal (Android Studio / Xcode), ohne bezahltes EAS. Flutter wäre ebenfalls FOSS; Expo trifft den vorhandenen Testweg.

---

## 3. Sensor- und Blickkonzept

### 3.1 Zielmodi

Ein Sender wählt einen Modus:

1. **Lage** (v1, ohne Kompass): z. B. senkrecht nach oben, flach auf den Boden, hochkant vor die Brust. Zuverlässig indoor. Speichert den normalisierten Gravitationvektor im Gerätekoordinatensystem von Expo (`x` rechts, `y` oben, `z` aus dem Bildschirm zum Nutzer).
2. **Lage + Azimut** (später): z. B. nach Norden, 45° über dem Horizont. Braucht Magnetometer und Kalibrierhinweis (Acht schwenken). Feld in der Blick-Datei bereits optional.

Ohne Kompass ist die **Himmelsrichtung** nicht bestimmbar. „Bild an der Wand vor dir“ ist in v1 nicht heading-stabil; „Handy so kippen“ schon. Das ist Absicht, kein Fehler.

### 3.2 Presets (v1)

| Preset | Bedeutung | Ziel-Gravitation (näherungsweise) |
| --- | --- | --- |
| Oben | Rückseite zum Zenit (Planet-Finder „Himmel“) | `{ x: 0, y: 0, z: 1 }` |
| Boden | Rückseite zum Boden, Bildschirm nach oben | `{ x: 0, y: 0, z: -1 }` |
| Brust | Hochkant, Bildschirm zum Gesicht, Horizont | `{ x: 0, y: -1, z: 0 }` |

Zusätzlich: **aktuelle Lage einfrieren** — speichert den gemessenen Gravitationvektor.

### 3.3 Abbildung des Winkelfehlers

- Kleines Winkelfenster: Bild füllt die Öffnung.
- Beim Schwenken: Bild wandert in der Kreisöffnung (2D-Parallaxe aus der Differenz der Gravitationvektoren in der Geräte-XY-Ebene), Rohrwand wird sichtbar.
- Weit daneben: nur dunkles Rohrinneres und stilisiertes Gebirge.

Technisch reicht 2D-Parallaxe. Ein 3D-Rohr (etwa später Three.js / expo-gl) ist optional, nicht Voraussetzung.

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
- Sensoren: `expo-sensors`. Bilder: `expo-image-picker`. Dateien: `expo-file-system`, `expo-sharing`, `expo-document-picker`.
- Keine Firebase, keine Google-Maps-SDK, keine proprietären Analytics-/Crash-Dienste.
- Schrift, Icons, Texturen: nur SIL/OFL, CC oder selbst erstellt.
- Falls später Karte: OpenStreetMap + FOSS-Renderer.
- Relais später: kleines Programm hinter Caddy, Lizenz MIT oder Apache-2.0.

**Expo Application Services** (Cloud-Build) ist optional und **keine** Abhängigkeit. `eas.json` wird nicht vorausgesetzt.

**Expo-Go-Grenzen, die wir akzeptieren:** eigene Native-Module und manches AR gehen erst im Dev-Build. Sensoren, Bilder, Teilen, geschlossenes Rohr: in Expo Go machbar.

**Außerhalb von Softwarelizenzen:** Apple- und Google-Store-Konten sind Plattformgebühren. Für die Studie reichen Expo Go, Sideload und interne Builds.

---

## 6. Funktionsumfang der Studie

**Soll (Reihenfolge, erledigt bzw. zu erledigen im Repo):**

1. Dieses Paper als lebendiges Pflichtenheft.
2. Expo-App: Lage lesen, Zielrichtung (Preset „oben“ + frei einfrieren), Winkelanzeige zum Debuggen.
3. Ofenrohr-UI: Vignette, Bild erscheint/verschwindet mit Parallaxe.
4. Blick erstellen: Bild wählen, Richtung setzen, Kurztext.
5. Blick als Datei exportieren/importieren (System-Teilen).
6. Leerer Blick / Gebirge als bewusste Pointe.

**Nicht in der Studie:** Accounts, Feed, Freundeslisten, Push, Tracking, Bezahlfunktionen, Store-Release, öffentlicher Bilderserver, Kameramodus.

---

## 7. Offene Punkte (kein Beschluss)

| ID | Thema | Anmerkung |
| --- | --- | --- |
| O1 | App-Name | Arbeitstitel Ofenrohr; Tonalität (derb vs. still) offen. |
| O2 | Leere | Wie stark Gebirge vs. nur rostiges Rohr. Studie: beides, Gebirge dezent am Ende des Rohrs. |
| O3 | Richtung aufnehmen | Studie: ja, Sender hält das eigene Gerät und friert ein, zusätzlich Presets. |
| O4 | Barrierefreiheit | Reine Sensor-UI schließt Nutzung aus. Fallback „Bild trotzdem zeigen“ wäre anti-Pointe. Später klären. |
| O5 | Relatives Gyro-Heading | Könnte „Wand vor dir“ ohne Kompass in einer Sitzung simulieren. Nicht v1. |

---

## 8. Änderungsprotokoll

| Datum | Änderung |
| --- | --- |
| 2026-09-18 | Erstfassung aus der Machbarkeitsdiskussion. Beschlüsse B1–B8. |
