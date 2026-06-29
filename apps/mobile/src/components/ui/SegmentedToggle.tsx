import { Pressable, View } from 'react-native';

import { Text } from './Text';

type Option<T extends string> = { value: T; label: string };

type SegmentedToggleProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: [Option<T>, Option<T>];
};

/** Two-option segmented control (e.g. 地図 / リスト). */
export function SegmentedToggle<T extends string>({ onChange, options, value }: SegmentedToggleProps<T>) {
  return (
    <View className="flex-row rounded-full border border-line bg-neutral-soft p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`min-h-9 items-center justify-center rounded-full px-4 ${selected ? 'bg-primary' : ''}`}
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
