import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { BLICK_MAX_BYTES, type BlickImage } from './blick';

const IMAGE_BUDGET = Math.floor(BLICK_MAX_BYTES * 0.7);

function approxDecodedBytes(base64: string): number {
  return Math.floor((base64.length * 3) / 4);
}

/** JPEG inkl. HEIC→JPEG über den System-Konverter. */
export async function imageFromUri(uri: string): Promise<BlickImage> {
  const widths = [960, 720, 512];
  const qualities = [0.62, 0.48, 0.34];

  for (const width of widths) {
    for (const compress of qualities) {
      const processed = await manipulateAsync(uri, [{ resize: { width } }], {
        compress,
        format: SaveFormat.JPEG,
        base64: true,
      });
      const base64 = processed.base64;
      if (!base64) {
        continue;
      }
      if (approxDecodedBytes(base64) <= IMAGE_BUDGET) {
        return { mime: 'image/jpeg', base64 };
      }
    }
  }

  throw new Error('Das Bild bleibt zu groß. Bitte ein kleineres Foto wählen.');
}

export async function pickBlickImage(): Promise<BlickImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Ohne Zugriff auf die Bilder kann kein Foto gewählt werden.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  if (!asset?.uri) {
    throw new Error('Bild konnte nicht gelesen werden.');
  }

  return imageFromUri(asset.uri);
}
