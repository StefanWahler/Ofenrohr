# Ofenrohr

Handy-App zur Redensart *mit dem Ofenrohr ins Gebirge schauen*. Das Gerät ist das Sichtrohr: ein Bild hängt an einer Lage im Raum und rutscht aus dem Blick, wenn man schwenkt.

Konzept und Beschlüsse: [`docs/pflichtenheft.md`](docs/pflichtenheft.md). Dateiformat und spätere Relay-API: [`docs/relay-api.md`](docs/relay-api.md).

Lizenz: MIT. Kein EAS, kein proprietärer Dienst.

## Studie auf dem Handy (Expo Go)

Dieses Repo ist **Expo SDK 57**. Expo Go aus dem Store ist oft eine *andere* SDK-Version. Dann kommt „Project is incompatible with this version of Expo Go“ — der QR-Code ist trotzdem richtig, nur die App auf dem Telefon nicht.

### 1. Passendes Expo Go

- Android: [expo.dev/go](https://expo.dev/go) öffnen, **SDK 57** und Android wählen, APK installieren (Play-Store-Version darf hinterherhinken).
- iPhone: Expo Go aus dem App Store *nur*, wenn dort SDK 57 steht. Sonst dieselbe Seite, SDK 57, iOS. Store-Builds enden oft bei älterem SDK.

In Expo Go unter Profil/Info die SDK-Nummer prüfen. Sie muss **57** sein.

### 2. Rechner (QR ist schon da: dieser Schritt ist erledigt)

Im Repo-Root `C:\Developement\Ofenrohr`: `npm start`. Handy und PC im **selben WLAN** (kein Gastnetz, das Geräte trennt).

### 3. Einloggen (iPhone mit aktuellem Expo Go oft Pflicht)

Derselbe Expo-Account an **beiden** Enden:

- Terminal: `npx expo login`
- Expo Go: Home → Avatar oben rechts → anmelden

Ohne Login zeigt iOS nach dem Scan oft nur eine Login-Meldung, kein Projekt.

### 4. QR scannen

Nicht mit der normalen Kamera-App auf Android. In **Expo Go** → *Scan QR code* (iPhone: Kamera geht, wenn Expo Go installiert ist).

Beim ersten Start Lage-Sensor erlauben. Kamera nur, wenn ein Blick den Hintergrund „Kamera“ wählt; sonst bleibt die Rohröffnung schwarz.

### 5. Wenn nichts lädt

- Firewall / WLAN: im Terminal `s` drücken und **Tunnel** wählen, QR neu scannen.
- Falsches Expo Go: deinstallieren, SDK-57-Build von [expo.dev/go](https://expo.dev/go).
- Server neu: Terminal mit Ctrl+C beenden, wieder `npm start`.

Web im Browser ist nicht das Ziel; Sensoren und Teilen gehören aufs Telefon.

Eigenen Native-Build später lokal (`npx expo prebuild`, Android Studio / Xcode). Cloud-Builds von Expo Application Services sind keine Abhängigkeit.

## Skripte

- `npm start` — Metro / Expo Go
- `npm run typecheck` — TypeScript ohne Emit
