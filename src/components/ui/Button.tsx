import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  View,
} from 'react-native';

import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

const base = 'flex-row items-center justify-center rounded-md';

const variantClass: Record<Variant, string> = {
  primary: 'bg-emerald-500 active:opacity-90 shadow-neon',
  secondary: 'bg-ink-2 border border-ink-hairline active:bg-ink-3',
  ghost: 'bg-transparent active:bg-ink-2 border border-ink-hairline/60',
  destructive: 'bg-danger active:opacity-80',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-11 px-4',
  md: 'h-[52px] px-5',
  lg: 'h-14 px-6',
};

const labelTone: Record<Variant, 'inverse' | 'primary' | 'secondary' | 'primary'> = {
  primary: 'inverse',
  secondary: 'primary',
  ghost: 'secondary',
  destructive: 'primary',
};

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
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
      } ${isDisabled ? 'opacity-45' : ''}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#05070B' : '#22B76C'} />
      ) : (
        <View className="flex-row items-center">
          <Text variant="bodyLg" tone={labelTone[variant]} className="font-semibold">
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
