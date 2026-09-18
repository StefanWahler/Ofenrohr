# Blick-Payload und optionale Relay-API

Status: **Spezifikation für die Studie.** Ein öffentlicher Relay wird nicht betrieben. Die App spricht keinen Server an. Dieses Dokument hält das Dateiformat fest und beschreibt, was ein Relay später tun dürfte, ohne die App umzubauen.

Gilt zusammen mit [`pflichtenheft.md`](pflichtenheft.md) Beschluss B4.

---

## 1. Datei `.ofenrohr`

Eine Blick-Datei ist **UTF-8-JSON**. Dateiname typischerweise `blick.ofenrohr`. Es gibt keine ZIP-Hülle in v1 (ein Messenger-Schritt, ein MIME-Typ).

MIME-Typ beim Teilen: `application/json` (breit kompatibel). Eigener Typ `application/vnd.ofenrohr.blick+json` ist für später reserviert.

### 1.1 Schema `ofenrohr.blick.v1`

```json
{
  "schema": "ofenrohr.blick.v1",
  "createdAt": "2026-09-18T00:00:00.000Z",
  "name": "Gebirge",
  "instruction": "Halt die Rückseite senkrecht zum Himmel.",
  "target": {
    "mode": "attitude+azimuth",
    "gravity": { "x": 0, "y": 0, "z": 1 },
    "azimuthDeg": null,
    "look": { "x": 0, "y": 0, "z": 1 }
  },
  "view": {
    "sensors": true,
    "background": "panorama"
  },
  "image": null
}
```

| Feld | Pflicht | Bedeutung |
| --- | --- | --- |
| `schema` | ja | Genau `ofenrohr.blick.v1`. Unbekannte Schema-Werte: Datei ablehnen. |
| `createdAt` | ja | ISO-8601, UTC. Nur Metadaten, keine Gültigkeit. |
| `name` | nein | Anzeigename, max. 80 Zeichen. Fehlt oder leer: „Ofenrohr“. |
| `instruction` | ja | Kurzanleitung, max. 280 Zeichen, darf leer sein (`""`). |
| `target.mode` | ja | `attitude` (nur Neigung, alte Dateien) oder `attitude+azimuth` (Kugel / Planeten-App). |
| `target.gravity` | ja | Gravitationvektor im Expo-Geräteframe. Nicht alle null. |
| `target.azimuthDeg` | nein | Magnetische Himmelsrichtung 0–360, 0 = Nord. |
| `target.look` | nein bei alten Dateien, ja bei neuen | Einheitsvektor ENU: `x` Ost, `y` Nord, `z` oben. Richtung der Geräterückseite. Das Foto hängt an diesem Punkt auf der Kugel. |
| `view` | nein | Empfänger-Voreinstellung. Fehlt: Sensoren an, Hintergrund schwarz. |
| `view.sensors` | nein | `true` Lage/Kompass, `false` Finger. Ohne Sensorerlaubnis immer Finger. |
| `view.background` | nein | `black` \| `camera` \| `panorama`. Kamera ohne Erlaubnis → schwarz. `panorama` ist das feste App-Alpenbild, kein mitgesendetes 360°. |
| `image` | ja | `null` = leerer Blick. Sonst Objekt unten. |

Bildobjekt:

| Feld | Pflicht | Bedeutung |
| --- | --- | --- |
| `image.mime` | ja | `image/jpeg` oder `image/png`. |
| `image.base64` | ja | Rohdaten ohne Data-URL-Präfix. |

Unbekannte zusätzliche Felder: ignorieren (Vorwärtskompatibilität).

### 1.2 Grenzen (lokal und Relay)

- JSON insgesamt höchstens **1,5 MiB** (entspricht grob einem stark JPEG-komprimierten Handyfoto). Größere Dateien ablehnen.
- Keine eingebetteten Skripte, keine zweite Datei, keine Relativ-URLs aufs Netz. Ein Blick ist selbst enthalten.

### 1.3 Leerer Blick

`image: null` ist gültig und gewollt: Empfänger sieht keinen Pin, nur den gewählten Hintergrund (beim Demo-Gebirge das Alpenpanorama). Das ist die Redensart als Datei.

---

## 2. Relay (nicht implementiert, nicht betrieben)

Zweck später: kurze Links, Ablauf, Messenger ohne große Anhänge. **Kein** Pflichtbestandteil der App.

Annahme: ein Prozess hinter einem FOSS-Reverse-Proxy (z. B. Caddy), Lizenz MIT oder Apache-2.0, keine Accounts.

### 2.1 Eigenschaften

- Speichert die **unveränderte** Blick-JSON, nichts sonst.
- Vergibt eine zufällige ID (128 Bit, unratbar).
- **Ablauf:** Standard 7 Tage, höchstens 30 Tage. Danach 404.
- **Größenlimit:** wie Abschnitt 1.2.
- **Kein** öffentliches Listing, keine Suche, keine Vorschau-HTML mit Bild.
- Löschen: `DELETE` mit einem beim Upload einmalig ausgegebenen Löschtoken.
- Die App muss jeden Relay-Host konfigurierbar haben und **ohne** Host lauffähig bleiben.

### 2.2 Endpunkte (Vorschlag)

Basis: `https://{host}/v1`

**`POST /v1/blicke`**

- Request: `Content-Type: application/json`, Body = Blick-JSON.
- Query optional: `ttlHours` (1–720, Default 168).
- Response 201:

```json
{
  "id": "…",
  "expiresAt": "2026-09-25T00:00:00.000Z",
  "deleteToken": "…",
  "url": "https://{host}/v1/blicke/{id}"
}
```

- 413 wenn zu groß, 400 wenn Schema ungültig.

**`GET /v1/blicke/{id}`**

- Response 200: Blick-JSON, `Cache-Control: no-store`.
- 404 wenn unbekannt oder abgelaufen.

**`DELETE /v1/blicke/{id}`**

- Header `X-Delete-Token`.
- 204 oder 404.

Keine weiteren Verben. Keine Analytics-Events.

### 2.3 Kostenbremse (falls es je öffentlich wird)

- Hartes Größenlimit und kurzer TTL halten Speicher klein.
- Kein CDN-Zwang; bei Last Relay abschalten — Dateiweg bleibt.
- Nutzerinhalte hosten löst in DE/EU Pflichten aus (DSGVO, missbräuchliche Inhalte, Kennzeichnung). Deshalb bleibt der öffentliche Betrieb außerhalb der Studie.

### 2.4 Was die Studie nicht tut

- Kein HTTP-Client zum Relay.
- Kein Docker-Compose-Zwang im App-Repo.
- Keine Deep-Links `ofenrohr://`, bis ein Relay oder eine Datei-Association das braucht.

---

## 3. Öffnen auf dem Empfängergerät

1. Datei liegt im Messenger / Dateisystem.
2. „Mit Ofenrohr öffnen“ bzw. in der App **Blick empfangen** (Dokumentenwähler).
3. Parser prüft Schema und Größe, dann Ofenrohr-Ansicht.

Solange Expo Go keine eigene Datei-Association hat, ist der Dokumentenwähler der vorgesehene Weg.
