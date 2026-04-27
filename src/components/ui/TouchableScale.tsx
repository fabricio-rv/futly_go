import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { impactLight } from '@/src/lib/haptics';

type TouchableScaleProps = Omit<PressableProps, 'children'> & {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  disableHaptics?: boolean;
  pressedScale?: number;
};

export function TouchableScale({
  children,
  className,
  style,
  onPress,
  onPressIn,
  onPressOut,
  disableHaptics = false,
  pressedScale = 0.97,
  ...rest
}: TouchableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      className={className}
      style={style}
      onPress={() => {
        if (!disableHaptics) {
          void impactLight();
        }
        (onPress as (() => void) | undefined)?.();
      }}
      onPressIn={(event) => {
        scale.value = withTiming(pressedScale, { duration: 90 });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, { duration: 120 });
        onPressOut?.(event);
      }}
      {...rest}
    >
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
