import { LOOK_ZENITH, PRESET_GRAVITY, hypot3, type Vec3 } from './orientation';

export const BLICK_SCHEMA = 'ofenrohr.blick.v1' as const;
export const BLICK_MAX_BYTES = Math.floor(1.5 * 1024 * 1024);
export const INSTRUCTION_MAX = 280;
export const NAME_MAX = 80;

export type BlickMode = 'attitude' | 'attitude+azimuth';
export type BlickImageMime = 'image/jpeg' | 'image/png';
export type BlickBackground = 'black' | 'camera' | 'panorama';

export type BlickView = {
  /** true: Gerätelage. false: Finger. Fallback Finger, wenn Sensoren fehlen. */
  sensors: boolean;
  /** black | camera | panorama. camera fällt auf black zurück ohne Kameraerlaubnis. */
  background: BlickBackground;
};

export const DEFAULT_VIEW: BlickView = {
  sensors: true,
  background: 'black',
};

export type BlickImage = {
  mime: BlickImageMime;
  base64: string;
};

export type Blick = {
  schema: typeof BLICK_SCHEMA;
  createdAt: string;
  name: string;
  instruction: string;
  target: {
    mode: BlickMode;
    gravity: Vec3;
    azimuthDeg: number | null;
    /** ENU: x Ost, y Nord, z oben. Rückseite des Handys. */
    look: Vec3 | null;
  };
  view: BlickView;
  image: BlickImage | null;
};

export class BlickParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlickParseError';
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new BlickParseError('Blick ist kein Objekt.');
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new BlickParseError(`${field} fehlt oder ist kein Text.`);
  }
  return value;
}

function asFiniteNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new BlickParseError(`${field} ist keine Zahl.`);
  }
  return value;
}

function parseVec3(value: unknown, prefix: string): Vec3 {
  const rec = asRecord(value);
  const vec = {
    x: asFiniteNumber(rec.x, `${prefix}.x`),
    y: asFiniteNumber(rec.y, `${prefix}.y`),
    z: asFiniteNumber(rec.z, `${prefix}.z`),
  };
  if (hypot3(vec) < 1e-6) {
    throw new BlickParseError(`${prefix} darf nicht der Nullvektor sein.`);
  }
  return vec;
}

function parseView(value: unknown): BlickView {
  if (value === undefined || value === null) {
    return { ...DEFAULT_VIEW };
  }
  const rec = asRecord(value);
  const sensors = rec.sensors === undefined ? DEFAULT_VIEW.sensors : rec.sensors === true;
  let background: BlickBackground = DEFAULT_VIEW.background;
  if (rec.background === 'black' || rec.background === 'camera' || rec.background === 'panorama') {
    background = rec.background;
  } else if (rec.augmented === true) {
    background = 'camera';
  }
  return { sensors, background };
}

function parseImage(value: unknown): BlickImage | null {
  if (value === undefined || value === null) {
    return null;
  }
  const rec = asRecord(value);
  const mime = asString(rec.mime, 'image.mime');
  if (mime !== 'image/jpeg' && mime !== 'image/png') {
    throw new BlickParseError('Bildtyp muss image/jpeg oder image/png sein.');
  }
  const base64 = asString(rec.base64, 'image.base64').replace(/\s/g, '');
  if (!base64) {
    throw new BlickParseError('Bilddaten fehlen.');
  }
  if (base64.startsWith('data:')) {
    throw new BlickParseError('Bild darf kein Data-URL-Präfix enthalten.');
  }
  return { mime, base64 };
}

export function parseBlick(raw: string): Blick {
  const bytes = new TextEncoder().encode(raw).length;
  if (bytes > BLICK_MAX_BYTES) {
    throw new BlickParseError('Datei ist größer als 1,5 MiB.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new BlickParseError('Datei ist kein gültiges JSON.');
  }

  const rec = asRecord(parsed);
  const schema = asString(rec.schema, 'schema');
  if (schema !== BLICK_SCHEMA) {
    throw new BlickParseError(`Unbekanntes Schema: ${schema}`);
  }

  const instruction = asString(rec.instruction, 'instruction');
  if (instruction.length > INSTRUCTION_MAX) {
    throw new BlickParseError(`Anleitung länger als ${INSTRUCTION_MAX} Zeichen.`);
  }

  let name = '';
  if (rec.name !== undefined && rec.name !== null) {
    name = asString(rec.name, 'name');
    if (name.length > NAME_MAX) {
      throw new BlickParseError(`Name länger als ${NAME_MAX} Zeichen.`);
    }
  }

  const targetRec = asRecord(rec.target);
  const mode = asString(targetRec.mode, 'target.mode');
  if (mode !== 'attitude' && mode !== 'attitude+azimuth') {
    throw new BlickParseError('target.mode ist ungültig.');
  }

  let azimuthDeg: number | null = null;
  if (targetRec.azimuthDeg !== undefined && targetRec.azimuthDeg !== null) {
    azimuthDeg = asFiniteNumber(targetRec.azimuthDeg, 'target.azimuthDeg');
  }

  let look: Vec3 | null = null;
  if (targetRec.look !== undefined && targetRec.look !== null) {
    look = parseVec3(targetRec.look, 'target.look');
  }

  return {
    schema: BLICK_SCHEMA,
    createdAt: asString(rec.createdAt, 'createdAt'),
    name,
    instruction,
    target: {
      mode,
      gravity: parseVec3(targetRec.gravity, 'target.gravity'),
      azimuthDeg,
      look,
    },
    view: parseView(rec.view),
    image: parseImage(rec.image),
  };
}

export function serializeBlick(blick: Blick): string {
  return JSON.stringify(blick);
}

export function createBlick(input: {
  name: string;
  instruction: string;
  gravity: Vec3;
  look: Vec3;
  azimuthDeg: number | null;
  image: BlickImage | null;
  view?: BlickView;
}): Blick {
  const instruction = input.instruction.trim().slice(0, INSTRUCTION_MAX);
  const name = input.name.trim().slice(0, NAME_MAX);
  return {
    schema: BLICK_SCHEMA,
    createdAt: new Date().toISOString(),
    name,
    instruction,
    target: {
      mode: 'attitude+azimuth',
      gravity: input.gravity,
      azimuthDeg: input.azimuthDeg,
      look: input.look,
    },
    view: input.view ?? { ...DEFAULT_VIEW },
    image: input.image,
  };
}

export function gebirgeDemoBlick(): Blick {
  return createBlick({
    name: 'Gebirge',
    instruction: 'Rückseite zum Himmel, Bildschirm zu dir.',
    gravity: PRESET_GRAVITY.oben,
    look: LOOK_ZENITH,
    azimuthDeg: null,
    image: null,
    view: { sensors: true, background: 'panorama' },
  });
}

export function imageDataUri(image: BlickImage): string {
  return `data:${image.mime};base64,${image.base64}`;
}

export function displayName(blick: Blick): string {
  const trimmed = blick.name.trim();
  return trimmed || 'Ofenrohr';
}

/** Dateiname ohne Endung, ohne Pfadzeichen. */
export function fileStemFromName(name: string): string {
  const cleaned = name
    .trim()
    .slice(0, NAME_MAX)
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\.+$/g, '')
    .trim();
  return cleaned || 'ofenrohr';
}
