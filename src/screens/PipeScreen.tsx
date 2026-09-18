import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DEFAULT_VIEW, type Blick, type BlickBackground } from '../blick';
import { Button } from '../components/Button';
import { ChoiceRow } from '../components/ChoiceRow';
import { DebugHud } from '../components/DebugHud';
import { PipeView } from '../components/PipeView';
import { useGravity } from '../hooks/useGravity';
import {
  LOOK_ZENITH,
  angleBetweenRad,
  lookFromLegacyGravity,
  panLook,
  radToDeg,
  type Vec3,
} from '../orientation';
import { colors } from '../theme';

type Props = {
  blick: Blick;
  onBack: () => void;
};

export function PipeScreen({ blick, onBack }: Props) {
  const { look: sensorLook, status, error, askPermission } = useGravity();
  const preferred = blick.view ?? DEFAULT_VIEW;
  const [sensorsOn, setSensorsOn] = useState(preferred.sensors);
  const [background, setBackground] = useState<BlickBackground>(preferred.background);
  const [debug, setDebug] = useState(true);
  const targetLook = blick.target.look ?? lookFromLegacyGravity(blick.target.gravity);
  const [fingerLook, setFingerLook] = useState<Vec3>(targetLook);
  const sensorsLive = sensorsOn && status === 'listening' && sensorLook !== null;
  const look = sensorsLive ? sensorLook : fingerLook;
  const errorDeg = look ? radToDeg(angleBetweenRad(look, targetLook)) : 0;
  const sensorsOnRef = useRef(sensorsOn);
  const lookRef = useRef(look);
  sensorsOnRef.current = sensorsOn;
  lookRef.current = look;

  const onPan = useCallback((dx: number, dy: number) => {
    if (sensorsOnRef.current) {
      setSensorsOn(false);
      setFingerLook(panLook(lookRef.current ?? LOOK_ZENITH, dx, dy));
      return;
    }
    setFingerLook((current) => panLook(current, dx, dy));
  }, []);

  const onCameraDenied = useCallback(() => {
    // Bleibt visuell schwarz; Umschalter bleibt auf Kamera, damit man es erneut versuchen kann.
  }, []);

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Pressable onPress={onBack} accessibilityRole="button">
          <Text style={styles.topLink}>Zurück</Text>
        </Pressable>
        <Pressable onPress={() => setDebug((value) => !value)} accessibilityRole="button">
          <Text style={styles.topLink}>{debug ? 'Debug aus' : 'Debug an'}</Text>
        </Pressable>
      </View>

      <View style={styles.modes} pointerEvents="box-none">
        <Text style={styles.modeLabel}>Steuerung</Text>
        <ChoiceRow
          value={sensorsOn ? 'sensors' : 'finger'}
          options={[
            { id: 'sensors', label: 'Sensoren' },
            { id: 'finger', label: 'Finger' },
          ]}
          onChange={(value) => {
            if (value === 'finger' && sensorLook) {
              setFingerLook(sensorLook);
            }
            setSensorsOn(value === 'sensors');
          }}
        />
        <Text style={styles.modeLabel}>Hintergrund</Text>
        <ChoiceRow
          value={background}
          options={[
            { id: 'black', label: 'Schwarz' },
            { id: 'camera', label: 'Kamera' },
            { id: 'panorama', label: 'Gebirge' },
          ]}
          onChange={setBackground}
        />
      </View>

      <PipeView
        blick={blick}
        look={look ?? LOOK_ZENITH}
        background={background}
        finger={!sensorsLive}
        onPan={onPan}
        onCameraDenied={onCameraDenied}
      />

      {sensorsOn && status === 'denied' ? (
        <View style={styles.permit}>
          <Text style={styles.permitText}>
            Sensoren gesperrt — Fingersteuerung ist aktiv. Einstellungen → Expo Go → Bewegung
            und Fitness, oder oben auf Finger lassen.
          </Text>
          <Button title="Einstellungen öffnen" onPress={() => void askPermission()} />
        </View>
      ) : null}

      {debug ? (
        <DebugHud
          look={look}
          targetLook={targetLook}
          errorDeg={errorDeg}
          status={status}
          sensorError={error}
          control={sensorsLive ? 'sensor' : 'finger'}
          background={background}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.pipe,
  },
  top: {
    paddingTop: 52,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topLink: {
    color: colors.textDim,
    fontSize: 16,
  },
  modes: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 6,
    zIndex: 2,
  },
  modeLabel: {
    color: colors.rustLight,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  permit: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 10,
  },
  permitText: {
    color: colors.textDim,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
