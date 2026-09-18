import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { DeviceMotion, Magnetometer } from 'expo-sensors';

import {
  isUsableGravity,
  lerpLook,
  lerpVec,
  lookFromGravityAndMag,
  type Vec3,
} from '../orientation';

export type MotionStatus =
  | 'idle'
  | 'unavailable'
  | 'denied'
  | 'listening'
  | 'no-compass';

const UPDATE_MS = 40;
const SMOOTH = 0.18;

export function useGravity(): {
  gravity: Vec3 | null;
  look: Vec3 | null;
  status: MotionStatus;
  error: string | null;
  askPermission: () => Promise<void>;
} {
  const [gravity, setGravity] = useState<Vec3 | null>(null);
  const [look, setLook] = useState<Vec3 | null>(null);
  const [status, setStatus] = useState<MotionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [epoch, setEpoch] = useState(0);
  const smoothedG = useRef<Vec3 | null>(null);
  const smoothedLook = useRef<Vec3 | null>(null);
  const magRef = useRef<Vec3 | null>(null);

  useEffect(() => {
    let motionSub: { remove: () => void } | null = null;
    let magSub: { remove: () => void } | null = null;
    let cancelled = false;

    async function start() {
      const motionOk = await DeviceMotion.isAvailableAsync();
      if (cancelled) {
        return;
      }
      if (!motionOk) {
        setStatus('unavailable');
        setError('Kein Lagesensor (Expo Go auf dem Handy verwenden).');
        return;
      }

      const permission = await DeviceMotion.requestPermissionsAsync();
      if (cancelled) {
        return;
      }
      if (permission.status !== 'granted') {
        setStatus('denied');
        setError('Lagezugriff wurde nicht erlaubt.');
        return;
      }

      const magOk = await Magnetometer.isAvailableAsync();
      if (magOk) {
        try {
          await Magnetometer.requestPermissionsAsync();
        } catch {
          // Manche Geräte brauchen keine extra Magnetometer-Freigabe.
        }
        Magnetometer.setUpdateInterval(UPDATE_MS);
        magSub = Magnetometer.addListener((sample) => {
          magRef.current = { x: sample.x, y: sample.y, z: sample.z };
        });
      }

      DeviceMotion.setUpdateInterval(UPDATE_MS);
      motionSub = DeviceMotion.addListener((measurement) => {
        const g = measurement.accelerationIncludingGravity;
        if (!isUsableGravity(g)) {
          return;
        }
        const sample: Vec3 = { x: g.x, y: g.y, z: g.z };
        const prevG = smoothedG.current;
        const nextG = prevG ? lerpVec(prevG, sample, SMOOTH) : sample;
        smoothedG.current = nextG;
        setGravity(nextG);

        const mag = magRef.current;
        const rawLook = mag ? lookFromGravityAndMag(nextG, mag) : null;
        if (rawLook) {
          const prevL = smoothedLook.current;
          const nextL = prevL ? lerpLook(prevL, rawLook, SMOOTH) : rawLook;
          smoothedLook.current = nextL;
          setLook(nextL);
          setStatus('listening');
          setError(null);
        } else if (!smoothedLook.current) {
          setLook(null);
          setStatus('no-compass');
          setError(
            magOk
              ? 'Kompass unklar — Acht schwenken, von Metall und Magneten weg.'
              : 'Kein Magnetometer. Himmelsrichtung nicht messbar.',
          );
        }
      });
    }

    start().catch((err: unknown) => {
      if (!cancelled) {
        setStatus('unavailable');
        setError(err instanceof Error ? err.message : 'Sensorfehler.');
      }
    });

    const app = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        setEpoch((value) => value + 1);
      }
    });

    return () => {
      cancelled = true;
      motionSub?.remove();
      magSub?.remove();
      app.remove();
    };
  }, [epoch]);

  const askPermission = useCallback(async () => {
    const permission = await DeviceMotion.requestPermissionsAsync();
    if (permission.status !== 'granted') {
      await Linking.openSettings();
    }
    setEpoch((value) => value + 1);
  }, []);

  return { gravity, look, status, error, askPermission };
}
