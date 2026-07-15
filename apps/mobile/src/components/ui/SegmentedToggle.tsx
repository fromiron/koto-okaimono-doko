import { Pressable, View } from 'react-native';

import { Text } from './Text';

type Option<T extends string> = {
  accessibilityHint?: string;
  label: string;
  value: T;
};

type SegmentedToggleProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: [Option<T>, Option<T>];
};

/**
 * Two-option segmented control (e.g. 地図 / リスト). The selected state is
 * explicit without a decorative sliding layer or elevation.
 */
export function SegmentedToggle<T extends string>({
  onChange,
  options,
  value,
}: SegmentedToggleProps<T>) {
  return (
    <View className="flex-row rounded-card border border-control-line bg-surface p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityHint={option.accessibilityHint}
            accessibilityLabel={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`min-h-9 items-center justify-center rounded-thumb px-4 active:opacity-70 ${
              selected ? 'bg-primary-strong' : 'bg-transparent'
            }`}
            hitSlop={{ bottom: 4, top: 4 }}
            key={option.value}
            onPress={() => onChange(option.value)}
          >
            <Text tone={selected ? 'inverse' : 'muted'} variant="label">
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
