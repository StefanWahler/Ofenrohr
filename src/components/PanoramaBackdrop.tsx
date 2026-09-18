import { Image, StyleSheet, View } from 'react-native';

import {
  PIPE_HALF_FOV_DEG,
  elevationDeg,
  headingDeg,
  type Vec3,
} from '../orientation';

const pano = require('../../assets/panoramas/alps-field.jpg');

type Props = {
  look: Vec3;
  size: number;
};

/** Equirectangular 2:1, Blick aus der Kugelmitte. Schmale Rohr-FOV. */
export function PanoramaBackdrop({ look, size }: Props) {
  const fov = PIPE_HALF_FOV_DEG * 2;
  const width = size * (360 / fov);
  const height = width / 2;
  const u = headingDeg(look) / 360;
  const v = (90 - elevationDeg(look)) / 180;
  const left = size / 2 - u * width;
  const top = size / 2 - v * height;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {[-1, 0, 1].map((copy) => (
        <Image
          key={copy}
          source={pano}
          style={{
            position: 'absolute',
            width,
            height,
            left: left + copy * width,
            top,
          }}
        />
      ))}
    </View>
  );
}
