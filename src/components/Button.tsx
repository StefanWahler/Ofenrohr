import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { colors } from '../theme';

type Variant = 'primary' | 'ghost';

type Props = PressableProps & {
  title: string;
  variant?: Variant;
};

export function Button({ title, variant = 'primary', disabled, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...rest}
    >
      <Text style={[styles.label, variant === 'ghost' && styles.ghostLabel]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  primary: {
    backgroundColor: colors.rust,
    borderColor: colors.rustLight,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.rim,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  ghostLabel: {
    color: colors.textDim,
    fontWeight: '500',
  },
});
