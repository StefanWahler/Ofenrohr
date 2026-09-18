import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import {
  BlickParseError,
  createBlick,
  fileStemFromName,
  parseBlick,
  serializeBlick,
  type Blick,
} from './blick';
import { LOOK_ZENITH, PRESET_GRAVITY } from './orientation';
import { imageFromUri } from './pickImage';

export async function shareBlick(blick: Blick): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Teilen ist auf diesem Gerät nicht verfügbar.');
  }

  const body = serializeBlick(blick);
  const stem = fileStemFromName(blick.name);
  const file = new File(Paths.cache, `${stem}.ofenrohr`);
  file.create({ overwrite: true });
  file.write(body);

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Blick teilen',
  });
}

const IMAGE_EXT = /\.(jpe?g|png|heic|heif|webp|gif)$/i;
const BLICK_EXT = /\.(ofenrohr|json)$/i;

function looksLikePdf(name: string, mime: string | undefined, bytes: Uint8Array): boolean {
  if (mime?.includes('pdf') || name.toLowerCase().endsWith('.pdf')) {
    return true;
  }
  return bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

function looksLikeImage(name: string, mime: string | undefined, bytes: Uint8Array): boolean {
  if (mime?.startsWith('image/') || IMAGE_EXT.test(name)) {
    return true;
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return true;
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return true;
  }
  if (bytes.length >= 12) {
    const brand = String.fromCharCode(...bytes.slice(4, 12));
    if (brand.startsWith('ftyp')) {
      return true;
    }
  }
  return false;
}

function looksLikeJson(bytes: Uint8Array): boolean {
  let i = 0;
  while (i < bytes.length && (bytes[i] === 0x20 || bytes[i] === 0x09 || bytes[i] === 0x0a || bytes[i] === 0x0d)) {
    i += 1;
  }
  return bytes[i] === 0x7b;
}

function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

export function describeImportError(err: unknown): string {
  if (err instanceof BlickParseError) {
    return err.message;
  }
  const message = err instanceof Error ? err.message : '';
  if (/encoding|couldn't be opened|UnexpectedException|not valid UTF|binary/i.test(message)) {
    return 'Das ist keine Blick-Datei. Eine .ofenrohr-Datei oder ein Foto wählen — keine PDF.';
  }
  return message || 'Datei konnte nicht gelesen werden.';
}

export async function pickBlickFile(): Promise<Blick | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'image/*', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  if (!asset?.uri) {
    throw new BlickParseError('Keine Datei gewählt.');
  }

  const name = asset.name ?? '';
  const mime = asset.mimeType;
  const file = new File(asset.uri);
  const bytes = await file.bytes();

  if (looksLikePdf(name, mime, bytes)) {
    throw new BlickParseError(
      'PDF ist kein Blick. Entweder eine .ofenrohr-Datei öffnen oder unter „Blick schicken“ ein Foto aus der Mediathek wählen (auch HEIC).',
    );
  }

  if (looksLikeImage(name, mime, bytes) && !BLICK_EXT.test(name)) {
    const image = await imageFromUri(asset.uri);
    return createBlick({
      name: 'Foto',
      instruction: 'Rückseite zum Himmel, Bildschirm zu dir.',
      gravity: PRESET_GRAVITY.oben,
      look: LOOK_ZENITH,
      azimuthDeg: null,
      image,
    });
  }

  if (!looksLikeJson(bytes) && !BLICK_EXT.test(name)) {
    throw new BlickParseError(
      'Keine Blick-Datei (.ofenrohr). Fotos liegen in der Mediathek: „Blick schicken“. Empfangen ist für eine geteilte .ofenrohr-Datei — oder ein Foto aus Dateien.',
    );
  }

  return parseBlick(decodeUtf8(bytes));
}
