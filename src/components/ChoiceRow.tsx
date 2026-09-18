import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

type Option<T extends string> = {
  id: T;
  label: string;
};

type Props<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

export function ChoiceRow<T extends string>({ value, options, onChange }: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const on = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            hitSlop={8}
            style={[styles.chip, on && styles.chipOn]}
          >
            <Text style={[styles.label, on && styles.labelOn]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.rim,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipOn: {
    borderColor: colors.rustLight,
    backgroundColor: colors.rust,
  },
  label: {
    color: colors.textDim,
    fontSize: 14,
  },
  labelOn: {
    color: colors.text,
  },
});
