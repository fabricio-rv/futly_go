import {
  ActivityIndicator,
  type PressableProps,
  View,
  Pressable,
  StyleSheet,
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
  sm: 'h-9 px-5',
  md: 'h-10 px-8 min-w-[120px]',
  lg: 'h-11 px-10 min-w-[138px]',
  xl: 'h-12 px-12 min-w-[156px]',
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

function stripForcedWidthClasses(className?: string) {
  if (!className) return '';
  return className
    .split(/\s+/)
    .filter(Boolean)
    .filter(
      (token) =>
        token !== 'w-full' &&
        token !== 'min-w-full' &&
        token !== 'max-w-full' &&
        token !== 'flex-1' &&
        token !== 'grow' &&
        token !== 'basis-full' &&
        token !== 'self-stretch'
    )
    .join(' ');
}

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

  const normalizedClassName = fullWidth ? className || '' : stripForcedWidthClasses(className);

  const pressableClass = [
    'flex-row items-center justify-center rounded-[14px] overflow-hidden',
    variantClass[variant],
    sizeClass[size],
    fullWidth ? 'w-full' : '',
    isDisabled ? 'opacity-50' : '',
    normalizedClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <View style={fullWidth ? styles.fullWidth : styles.shrink}>
      <Animated.View style={animatedStyle}>
        <Pressable
          testID={testID}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || label}
          accessibilityState={{ disabled: isDisabled }}
          disabled={isDisabled}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className={pressableClass}
          {...rest}
        >
          <View
            className={['flex-row items-center justify-center gap-2', contentClassName || '']
              .filter(Boolean)
              .join(' ')}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={variant === 'primary' || variant === 'destructive' ? '#FFFFFF' : '#10B981'}
              />
            ) : (
              <>
                {leftIcon && <View>{leftIcon}</View>}
                <Text
                  variant="body"
                  tone={labelTone[variant]}
                  numberOfLines={1}
                  className={`font-semibold tracking-[0.2px] ${labelColor[variant]} ${
                    labelClassName || ''
                  }`.trim()}
                >
                  {label}
                </Text>
                {rightIcon && <View>{rightIcon}</View>}
              </>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  shrink: { alignSelf: 'center' },
});
