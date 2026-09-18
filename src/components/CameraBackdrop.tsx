import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

type Props = {
  active: boolean;
  onDenied: () => void;
};

export function CameraBackdrop({ active, onDenied }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const asked = useRef(false);

  useEffect(() => {
    if (!active || !permission || permission.granted) {
      return;
    }
    if (permission.canAskAgain && !asked.current) {
      asked.current = true;
      void requestPermission();
      return;
    }
    if (!permission.canAskAgain) {
      onDenied();
    }
  }, [active, onDenied, permission, requestPermission]);

  if (!active || !permission?.granted) {
    return null;
  }

  return <CameraView facing="back" pointerEvents="none" style={StyleSheet.absoluteFill} />;
}
