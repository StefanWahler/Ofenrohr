import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import {
  elevationDeg,
  formatHeading,
  type Vec3,
} from '../orientation';
import type { MotionStatus } from '../hooks/useGravity';

function fmt(v: number): string {
  return v.toFixed(2);
}

type Props = {
  look: Vec3 | null;
  targetLook: Vec3;
  errorDeg: number;
  status: MotionStatus;
  sensorError: string | null;
  control: 'sensor' | 'finger';
  background: string;
};

export function DebugHud({
  look,
  targetLook,
  errorDeg,
  status,
  sensorError,
  control,
  background,
}: Props) {
  return (
    <View style={styles.box} pointerEvents="none">
      <Text style={styles.line}>
        Steuerung {control === 'sensor' ? 'Sensor' : 'Finger'} · Sensor {status}
      </Text>
      <Text style={styles.line}>Hintergrund {background}</Text>
      {sensorError ? <Text style={styles.warn}>{sensorError}</Text> : null}
      <Text style={styles.line}>
        Blick {look ? `${formatHeading(look)} · Höhe ${elevationDeg(look).toFixed(0)}°` : '—'}
      </Text>
      <Text style={styles.line}>
        Ziel {formatHeading(targetLook)} · Höhe {elevationDeg(targetLook).toFixed(0)}°
      </Text>
      <Text style={styles.line}>
        ENU {look ? `${fmt(look.x)} ${fmt(look.y)} ${fmt(look.z)}` : '—'}
      </Text>
      <Text style={styles.line}>Winkelfehler {errorDeg.toFixed(1)}°</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 24,
    backgroundColor: 'rgba(8,6,4,0.72)',
    borderColor: colors.rim,
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
  },
  line: {
    color: colors.textDim,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  warn: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 4,
  },
});
