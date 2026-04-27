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

const base =
  'flex-row items-center justify-center rounded-[12px] overflow-hidden active:shadow-none';

const variantClass: Record<Variant, string> = {
  primary: 'bg-emerald-500 shadow-md',
  secondary: 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm',
  ghost: 'bg-zinc-100 dark:bg-zinc-900/50',
  destructive: 'bg-red-500 shadow-md',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-10 px-4',
  md: 'h-12 px-6',
  lg: 'h-[52px] px-7',
  xl: 'h-14 px-8',
};

const labelTone: Record<Variant, 'inverse' | 'primary' | 'destructive'> = {
  primary: 'inverse',
  secondary: 'primary',
  ghost: 'primary',
  destructive: 'inverse',
};

const labelColor: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-emerald-500 dark:text-emerald-400',
  ghost: 'text-zinc-900 dark:text-zinc-100',
  destructive: 'text-white',
};

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
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
  leftAdornment,
  rightAdornment,
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
    opacity.value = withTiming(0.85, { duration: 100 });
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
    base,
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
      accessibilityHint={disabled ? 'Button is disabled' : undefined}
      disabled={isDisabled}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={containerClass}
      {...rest}
    >
      <Animated.View style={animatedStyle} className="flex-1">
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' || variant === 'destructive' ? '#FFFFFF' : '#10B981'}
            size="small"
          />
        ) : (
          <View
            className={`flex-row items-center justify-center gap-2 ${contentClassName || ''}`.trim()}
          >
            {leftAdornment ? <View className="flex-row">{leftAdornment}</View> : null}
            <Text
              variant="bodyLg"
              tone={labelTone[variant]}
              className={`font-semibold tracking-[0.3px] ${labelColor[variant]} ${
                labelClassName || ''
              }`.trim()}
            >
              {label}
            </Text>
            {rightAdornment ? <View className="flex-row">{rightAdornment}</View> : null}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}
