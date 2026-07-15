import type { ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// One restrained press response is shared by all tappable controls.
const PRESS_SPRING = { damping: 20, mass: 0.6, stiffness: 320 } as const;

type PressableScaleProps = PressableProps & {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** How far the control sinks while pressed. Subtle by default. */
  pressedScale?: number;
};

/**
 * The app-wide tappable primitive: a Pressable that springs down to
 * `pressedScale` on touch and bounces back on release (GPU transform only).
 * Buttons, chips, tiles and icon buttons all build on this so every press in
 * the app answers with the same physical feedback.
 */
export function PressableScale({
  children,
  onPressIn,
  onPressOut,
  pressedScale = 0.96,
  style,
  ...props
}: PressableScaleProps) {
  const pressed = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * (1 - pressedScale) }],
  }));

  return (
    <AnimatedPressable
      onPressIn={(event) => {
        pressed.value = reduceMotion ? 0 : withSpring(1, PRESS_SPRING);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = reduceMotion ? 0 : withSpring(0, PRESS_SPRING);
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
