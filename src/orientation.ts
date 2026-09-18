export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export function hypot3(v: Vec3): number {
  return Math.hypot(v.x, v.y, v.z);
}

export function isUsableGravity(v: Vec3): boolean {
  const n = hypot3(v);
  return Number.isFinite(n) && n > 2;
}

export function isUsableMag(v: Vec3): boolean {
  const n = hypot3(v);
  return Number.isFinite(n) && n > 8 && n < 250;
}

export function normalize(v: Vec3): Vec3 {
  const n = hypot3(v);
  if (!Number.isFinite(n) || n < 1e-9) {
    return { x: 0, y: 0, z: 0 };
  }
  return { x: v.x / n, y: v.y / n, z: v.z / n };
}

export function lerpVec(a: Vec3, b: Vec3, t: number): Vec3 {
  const k = Math.min(1, Math.max(0, t));
  return {
    x: a.x + (b.x - a.x) * k,
    y: a.y + (b.y - a.y) * k,
    z: a.z + (b.z - a.z) * k,
  };
}

export function lerpLook(a: Vec3, b: Vec3, t: number): Vec3 {
  return normalize(lerpVec(a, b, t));
}

export function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function angleBetweenRad(a: Vec3, b: Vec3): number {
  const na = normalize(a);
  const nb = normalize(b);
  return Math.acos(Math.min(1, Math.max(-1, dot(na, nb))));
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export const WORLD_UP: Vec3 = { x: 0, y: 0, z: 1 };
export const WORLD_NORTH: Vec3 = { x: 0, y: 1, z: 0 };
export const LOOK_ZENITH: Vec3 = { x: 0, y: 0, z: 1 };

/**
 * Blickrichtung der Geräterückseite (−Z) in ENU:
 * x = Ost, y = Nord, z = oben.
 */
export function lookFromGravityAndMag(gravity: Vec3, mag: Vec3): Vec3 | null {
  if (!isUsableGravity(gravity) || !isUsableMag(mag)) {
    return null;
  }
  const down = normalize(gravity);
  const east = cross(down, mag);
  if (hypot3(east) < 0.08 * hypot3(mag)) {
    return null;
  }
  const eastU = normalize(east);
  const north = cross(eastU, down);
  const back = { x: 0, y: 0, z: -1 };
  const look = {
    x: dot(back, eastU),
    y: dot(back, north),
    z: dot(back, scale(down, -1)),
  };
  if (hypot3(look) < 0.2) {
    return null;
  }
  return normalize(look);
}

/** 0° = magnetisch Nord, 90° = Ost. */
export function headingDeg(look: Vec3): number {
  const n = normalize(look);
  const h = radToDeg(Math.atan2(n.x, n.y));
  return (h + 360) % 360;
}

export function elevationDeg(look: Vec3): number {
  const n = normalize(look);
  return radToDeg(Math.asin(Math.min(1, Math.max(-1, n.z))));
}

export function formatHeading(look: Vec3): string {
  const h = headingDeg(look);
  const labels = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(h / 45) % 8;
  return `${labels[idx]} ${h.toFixed(0)}°`;
}

export function lookFromHeadingElevation(heading: number, elevation: number): Vec3 {
  const h = (heading * Math.PI) / 180;
  const e = (Math.min(89, Math.max(-89, elevation)) * Math.PI) / 180;
  return {
    x: Math.cos(e) * Math.sin(h),
    y: Math.cos(e) * Math.cos(h),
    z: Math.sin(e),
  };
}

/** Finger nach rechts: Inhalt folgt, Blick dreht nach links. */
export function panLook(look: Vec3, dxPx: number, dyPx: number, pxPerDeg = 3.2): Vec3 {
  const heading = headingDeg(look) - dxPx / pxPerDeg;
  const elevation = elevationDeg(look) + dyPx / pxPerDeg;
  return lookFromHeadingElevation(heading, elevation);
}

export const PIPE_HALF_FOV_DEG = 20;

export function sphereViewOffset(
  current: Vec3,
  target: Vec3,
  aperture: number,
): { x: number; y: number; angleDeg: number } {
  const forward = normalize(current);
  const targetN = normalize(target);
  const angleDeg = radToDeg(angleBetweenRad(forward, targetN));
  let right = cross(forward, WORLD_UP);
  if (hypot3(right) < 0.12) {
    right = cross(forward, WORLD_NORTH);
  }
  if (hypot3(right) < 1e-6) {
    right = { x: 1, y: 0, z: 0 };
  }
  right = normalize(right);
  const camUp = normalize(cross(right, forward));
  const x = dot(targetN, right);
  const y = dot(targetN, camUp);
  const z = dot(targetN, forward);
  const half = (PIPE_HALF_FOV_DEG * Math.PI) / 180;
  const f = aperture / 2 / Math.tan(half);
  if (z <= 0.08) {
    const len = Math.hypot(x, y) || 1;
    return {
      x: (x / len) * aperture * 1.6,
      y: -(y / len) * aperture * 1.6,
      angleDeg,
    };
  }
  return {
    x: (x / z) * f,
    y: -(y / z) * f,
    angleDeg,
  };
}

/** Alte Dateien ohne `look`: Zenit/Nadir, sonst Horizont nach Norden. */
export function lookFromLegacyGravity(gravity: Vec3): Vec3 {
  const g = normalize(gravity);
  if (g.z > 0.85) {
    return { ...LOOK_ZENITH };
  }
  if (g.z < -0.85) {
    return { x: 0, y: 0, z: -1 };
  }
  const el = Math.asin(Math.min(1, Math.max(-1, g.z)));
  return { x: 0, y: Math.cos(el), z: Math.sin(el) };
}

export const ALIGN_FULL_DEG = 8;
export const ALIGN_GONE_DEG = 34;

export function alignmentFromErrorDeg(errorDeg: number): number {
  if (errorDeg <= ALIGN_FULL_DEG) {
    return 1;
  }
  if (errorDeg >= ALIGN_GONE_DEG) {
    return 0;
  }
  return 1 - (errorDeg - ALIGN_FULL_DEG) / (ALIGN_GONE_DEG - ALIGN_FULL_DEG);
}

export const PRESET_GRAVITY = {
  oben: { x: 0, y: 0, z: 1 },
  boden: { x: 0, y: 0, z: -1 },
  brust: { x: 0, y: -1, z: 0 },
} as const satisfies Record<string, Vec3>;

export type PresetId = keyof typeof PRESET_GRAVITY;
