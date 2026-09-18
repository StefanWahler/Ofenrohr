import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';

type Peak = {
  left: number;
  width: number;
  height: number;
  color: string;
};

const PEAKS: Peak[] = [
  { left: 4, width: 46, height: 38, color: colors.mountainBack },
  { left: 28, width: 42, height: 32, color: colors.mountainBack },
  { left: 18, width: 36, height: 44, color: colors.mountainMid },
  { left: 48, width: 40, height: 36, color: colors.mountainMid },
  { left: 8, width: 34, height: 28, color: colors.mountainFront },
  { left: 55, width: 38, height: 30, color: colors.mountainFront },
];

export function Mountains({ opacity }: { opacity: number }) {
  return (
    <View pointerEvents="none" style={[styles.wrap, { opacity }]}>
      {PEAKS.map((peak, index) => (
        <View
          key={`${peak.left}-${index}`}
          style={[
            styles.peak,
            {
              left: `${peak.left}%`,
              borderLeftWidth: peak.width,
              borderRightWidth: peak.width,
              borderBottomWidth: peak.height,
              borderBottomColor: peak.color,
            },
          ]}
        />
      ))}
      <View style={styles.ground} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  peak: {
    position: 'absolute',
    bottom: 18,
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 22,
    backgroundColor: colors.mountainFront,
  },
});
