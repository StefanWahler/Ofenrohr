import { useMemo, useRef } from 'react';
import { Dimensions, Image, PanResponder, StyleSheet, Text, View } from 'react-native';

import { displayName, imageDataUri, type Blick, type BlickBackground } from '../blick';
import {
  ALIGN_GONE_DEG,
  lookFromLegacyGravity,
  sphereViewOffset,
  type Vec3,
} from '../orientation';
import { colors } from '../theme';
import { CameraBackdrop } from './CameraBackdrop';
import { PanoramaBackdrop } from './PanoramaBackdrop';

type Props = {
  blick: Blick;
  look: Vec3 | null;
  background: BlickBackground;
  finger: boolean;
  onPan: (dx: number, dy: number) => void;
  onCameraDenied: () => void;
};

export function PipeView({ blick, look, background, finger, onPan, onCameraDenied }: Props) {
  const size = Math.min(Dimensions.get('window').width, Dimensions.get('window').height);
  const aperture = Math.round(size * 0.78);
  const last = useRef({ x: 0, y: 0 });

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          last.current = { x: 0, y: 0 };
        },
        onPanResponderMove: (_, gesture) => {
          onPan(gesture.dx - last.current.x, gesture.dy - last.current.y);
          last.current = { x: gesture.dx, y: gesture.dy };
        },
      }),
    [onPan],
  );

  const { errorDeg, offset } = useMemo(() => {
    const targetLook = blick.target.look ?? lookFromLegacyGravity(blick.target.gravity);
    if (!look) {
      return { errorDeg: 180, offset: { x: 0, y: aperture } };
    }
    const projected = sphereViewOffset(look, targetLook, aperture);
    return { errorDeg: projected.angleDeg, offset: { x: projected.x, y: projected.y } };
  }, [aperture, blick.target.gravity, blick.target.look, look]);

  const hasImage = blick.image !== null;
  const onTarget = errorDeg < 14;
  const photo = Math.round(aperture * 0.7);

  return (
    <View style={styles.stage}>
      <View
        {...pan.panHandlers}
        style={[
          styles.aperture,
          {
            width: aperture,
            height: aperture,
            borderRadius: aperture / 2,
          },
        ]}
      >
        {background === 'camera' ? (
          <CameraBackdrop active onDenied={onCameraDenied} />
        ) : null}
        {background === 'panorama' && look ? (
          <PanoramaBackdrop look={look} size={aperture} />
        ) : null}

        {blick.image ? (
          <Image
            accessibilityIgnoresInvertColors
            source={{ uri: imageDataUri(blick.image) }}
            style={[
              styles.photo,
              {
                width: photo,
                height: photo,
                left: (aperture - photo) / 2,
                top: (aperture - photo) / 2,
                transform: [{ translateX: offset.x }, { translateY: offset.y }],
              },
            ]}
          />
        ) : null}
      </View>

      <Text style={styles.title}>{displayName(blick)}</Text>
      <Text style={styles.instruction}>
        {blick.instruction || 'Halt das Ofenrohr in die vorgegebene Richtung.'}
      </Text>
      <Text style={styles.hint}>
        {finger
          ? 'Im Kreis schieben.'
          : 'Handy kippen — oder im Kreis schieben, dann übernimmt der Finger.'}
      </Text>
      {!hasImage && onTarget ? (
        <Text style={styles.punchline}>Leer ausgegangen.</Text>
      ) : null}
      {!finger && look && errorDeg > ALIGN_GONE_DEG ? (
        <Text style={styles.hint}>Schwenken, bis das Bild in der Rohröffnung auftaucht.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  aperture: {
    overflow: 'hidden',
    borderWidth: 16,
    borderColor: colors.rim,
    backgroundColor: '#000000',
  },
  photo: {
    position: 'absolute',
    borderRadius: 4,
  },
  title: {
    marginTop: 18,
    color: colors.rustLight,
    fontSize: 18,
    fontWeight: '600',
  },
  instruction: {
    marginTop: 6,
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  punchline: {
    marginTop: 10,
    color: colors.rustLight,
    fontSize: 15,
    fontStyle: 'italic',
  },
  hint: {
    marginTop: 8,
    color: colors.textDim,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 28,
  },
});
