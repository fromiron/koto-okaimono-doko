import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { surfaceShadow } from '@/src/theme/tokens';

import { Text } from './Text';

type Option<T extends string> = { value: T; label: string };

type SegmentedToggleProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: [Option<T>, Option<T>];
};

type SegmentRect = { x: number; width: number };

const THUMB_SPRING = { damping: 24, mass: 0.8, stiffness: 320 } as const;

/**
 * Two-option segmented control (e.g. 地図 / リスト) with a sliding thumb: the
 * filled pill springs across to the chosen segment instead of teleporting, so
 * switching views reads as one continuous motion.
 */
export function SegmentedToggle<T extends string>({ onChange, options, value }: SegmentedToggleProps<T>) {
  const index = options.findIndex((option) => option.value === value);
  const [rects, setRects] = useState<Array<SegmentRect | null>>([null, null]);
  const placed = useRef(false);
  const thumbX = useSharedValue(0);
  const thumbWidth = useSharedValue(0);

  const rect = rects[index] ?? null;
  useEffect(() => {
    if (!rect) return;
    if (!placed.current) {
      // First layout: place the thumb instantly so it never flies in from 0.
      thumbX.value = rect.x;
      thumbWidth.value = rect.width;
      placed.current = true;
      return;
    }
    thumbX.value = withSpring(rect.x, THUMB_SPRING);
    thumbWidth.value = withSpring(rect.width, THUMB_SPRING);
  }, [rect, thumbX, thumbWidth]);

  const thumbStyle = useAnimatedStyle(() => ({
    opacity: thumbWidth.value > 0 ? 1 : 0,
    transform: [{ translateX: thumbX.value }],
    width: thumbWidth.value,
  }));

  return (
    <View className="relative flex-row rounded-full border border-line bg-neutral-soft p-1">
      <Animated.View
        className="absolute bottom-1 top-1 left-0 rounded-full bg-primary"
        pointerEvents="none"
        style={[thumbStyle, surfaceShadow]}
      />
      {options.map((option, optionIndex) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className="min-h-9 items-center justify-center rounded-full px-4 active:opacity-70"
            key={option.value}
            onLayout={(event) => {
              const { width, x } = event.nativeEvent.layout;
              setRects((previous) => {
                const current = previous[optionIndex];
                if (current && current.x === x && current.width === width) return previous;
                const next = [...previous];
                next[optionIndex] = { width, x };
                return next;
              });
            }}
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
