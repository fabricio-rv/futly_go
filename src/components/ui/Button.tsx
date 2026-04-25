import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  View,
} from 'react-native';
import type { ReactNode } from 'react';

import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'gold';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const base = 'flex-row items-center justify-center rounded-md';

const variantClass: Record<Variant, string> = {
  primary: 'bg-emerald-500 active:opacity-90 shadow-neon',
  secondary: 'bg-ink-2 border border-ink-hairline active:bg-ink-3',
  ghost: 'bg-transparent active:bg-ink-2 border border-ink-hairline/60',
  destructive: 'bg-danger active:opacity-80',
  gold: 'bg-gold-500 active:opacity-90 shadow-gold',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-11 px-4',
  md: 'h-[52px] px-5',
  lg: 'h-14 px-6',
  xl: 'h-[54px] px-6',
};

const labelTone: Record<Variant, 'inverse' | 'primary' | 'secondary' | 'primary' | 'inverse'> = {
  primary: 'inverse',
  secondary: 'primary',
  ghost: 'secondary',
  destructive: 'primary',
  gold: 'inverse',
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
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={(e) => {
        onPress?.(e);
      }}
      className={`${base} ${variantClass[variant]} ${sizeClass[size]} ${
        fullWidth ? 'w-full' : ''
      } ${isDisabled ? 'opacity-45' : ''} ${className ?? ''}`.trim()}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'gold' ? '#05070B' : '#22B76C'} />
      ) : (
        <View className={`flex-row items-center justify-center gap-2 ${contentClassName ?? ''}`.trim()}>
          {leftAdornment ? <View>{leftAdornment}</View> : null}
          <Text variant="bodyLg" tone={labelTone[variant]} className={`font-semibold ${labelClassName ?? ''}`.trim()}>
            {label}
          </Text>
          {rightAdornment ? <View>{rightAdornment}</View> : null}
        </View>
      )}
    </Pressable>
  );
}
