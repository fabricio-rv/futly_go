import {
  ActivityIndicator,
  type PressableProps,
  View,
  Pressable,
} from 'react-native';
import type { ReactNode } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const variantClass: Record<Variant, string> = {
  primary: 'bg-emerald-500',
  secondary: 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700',
  ghost: 'bg-zinc-100 dark:bg-zinc-900',
  destructive: 'bg-red-500',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-10 px-4',
  md: 'h-12 px-6',
  lg: 'h-14 px-6',
  xl: 'h-14 px-8',
};

const labelTone: Record<Variant, 'inverse' | 'primary'> = {
  primary: 'inverse',
  secondary: 'primary',
  ghost: 'primary',
  destructive: 'inverse',
};

const labelColor: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-emerald-600 dark:text-emerald-400',
  ghost: 'text-zinc-900 dark:text-zinc-100',
  destructive: 'text-white',
};

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  labelClassName?: string;
  contentClassName?: string;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  className,
  labelClassName,
  contentClassName,
  disabled,
  onPress,
  accessibilityLabel,
  testID,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 100 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const containerClass = [
    'flex-row items-center justify-center rounded-xl overflow-hidden',
    variantClass[variant],
    sizeClass[size],
    fullWidth ? 'w-full' : '',
    isDisabled ? 'opacity-50' : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={containerClass}
      {...rest}
    >
      <Animated.View style={animatedStyle} className="flex-row items-center justify-center gap-2">
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' || variant === 'destructive' ? '#FFFFFF' : '#10B981'}
          />
        ) : (
          <>
            {leftIcon && <View>{leftIcon}</View>}
            <Text
              variant="bodyLg"
              tone={labelTone[variant]}
              numberOfLines={1}
              className={`font-semibold tracking-wide ${labelColor[variant]} ${
                labelClassName || ''
              }`.trim()}
            >
              {label}
            </Text>
            {rightIcon && <View>{rightIcon}</View>}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}
