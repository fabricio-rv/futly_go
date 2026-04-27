import { forwardRef, useState, type ReactNode } from 'react';
import {
  TextInput,
  type TextInputProps,
  View,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from './Text';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
  onClear?: () => void;
  showClearButton?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    hint,
    leftAdornment,
    rightAdornment,
    onClear,
    showClearButton = false,
    containerClassName,
    inputClassName,
    labelClassName,
    onFocus,
    onBlur,
    style,
    accessibilityLabel,
    testID,
    editable = true,
    ...rest
  },
  ref,
) {
  const theme = useAppColorScheme();
  const [focused, setFocused] = useState(false);

  const borderOpacity = useSharedValue(0);
  const shadowOpacity = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: focused
      ? theme === 'light'
        ? 'rgba(16, 185, 129, 0.5)'
        : 'rgba(52, 211, 153, 0.5)'
      : 'transparent',
    borderWidth: focused ? 1.5 : 0,
  }));

  const animatedShadowStyle = useAnimatedStyle(() => ({
    shadowColor: theme === 'light' ? '#10B981' : '#10B981',
    shadowOpacity: shadowOpacity.value,
    shadowRadius: shadowOpacity.value * 8,
    elevation: shadowOpacity.value * 4,
  }));

  const isMultiline = !!rest.multiline;
  const containerHeightClass = isMultiline ? 'min-h-[112px] py-4' : 'h-[52px]';
  const inputClass = isMultiline
    ? 'font-system text-base text-zinc-900 dark:text-zinc-50 p-0 h-full'
    : 'font-system text-base text-zinc-900 dark:text-zinc-50 p-0';

  const placeholderColor = theme === 'light' ? '#A1A1AA' : '#52525B';
  const isDisabled = !editable;

  const handleFocus = (e: any) => {
    setFocused(true);
    borderOpacity.value = withTiming(1, { duration: 200 });
    shadowOpacity.value = withTiming(0.15, { duration: 200 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    borderOpacity.value = withTiming(0, { duration: 200 });
    shadowOpacity.value = withTiming(0, { duration: 200 });
    onBlur?.(e);
  };

  const handleClear = () => {
    onClear?.();
  };

  return (
    <View className="w-full">
      {label ? (
        <Text
          variant="label"
          tone="secondary"
          className={`mb-2.5 font-medium ${labelClassName || ''}`.trim()}
          accessibilityLabel={`${label} label`}
        >
          {label}
        </Text>
      ) : null}

      <Animated.View
        style={[
          animatedBorderStyle,
          animatedShadowStyle,
          { minWidth: 0, width: '100%', overflow: 'hidden' },
        ]}
        className={`rounded-[12px] bg-zinc-100 dark:bg-zinc-900 px-4 ${containerHeightClass} justify-center ${
          isDisabled ? 'opacity-60' : ''
        } ${containerClassName || ''}`.trim()}
      >
        <View className={`flex-row gap-3 ${isMultiline ? 'items-start pt-1' : 'items-center'}`}>
          {leftAdornment ? (
            <View
              className={`text-zinc-400 dark:text-zinc-500 flex-shrink-0 ${
                isMultiline ? 'pt-0.5' : ''
              }`}
              accessibilityElementsHidden
            >
              {leftAdornment}
            </View>
          ) : null}

          <TextInput
            ref={ref}
            testID={testID}
            placeholderTextColor={placeholderColor}
            editable={editable}
            accessibilityLabel={accessibilityLabel || label}
            className={`${inputClass} flex-1 ${inputClassName || ''}`.trim()}
            textAlignVertical={isMultiline ? 'top' : 'center'}
            underlineColorAndroid="transparent"
            selectionColor={theme === 'light' ? '#10B981' : '#34D399'}
            autoCorrect={rest.autoCorrect ?? false}
            style={[
              {
                borderWidth: 0,
                minWidth: 0,
                padding: 0,
              },
              style,
            ]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />

          {showClearButton && onClear ? (
            <Pressable
              onPress={handleClear}
              accessibilityLabel="Clear input"
              accessibilityRole="button"
              className="flex-shrink-0 p-1"
            >
              <View className="w-5 h-5 rounded-full bg-zinc-300 dark:bg-zinc-600 items-center justify-center">
                <Text className="text-zinc-600 dark:text-zinc-300 text-lg leading-none font-bold">
                  ×
                </Text>
              </View>
            </Pressable>
          ) : rightAdornment ? (
            <View
              className={`flex-shrink-0 text-zinc-400 dark:text-zinc-500 ${
                isMultiline ? 'pt-0.5' : ''
              }`}
              accessibilityElementsHidden
            >
              {rightAdornment}
            </View>
          ) : null}
        </View>
      </Animated.View>

      {error ? (
        <Text
          variant="caption"
          tone="danger"
          className="mt-2 font-medium"
          accessibilityLiveRegion="assertive"
        >
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="secondary" className="mt-2">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});
