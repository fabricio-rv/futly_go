import { forwardRef, useState, type ReactNode } from 'react';
import {
    TextInput,
    type TextInputProps,
    View,
} from 'react-native';

import { Text } from './Text';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
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
    containerClassName,
    inputClassName,
    labelClassName,
    onFocus,
    onBlur,
    style,
    ...rest
  },
  ref,
) {
  const theme = useAppColorScheme();
  const [focused, setFocused] = useState(false);
  const isMultiline = !!rest.multiline;
  const borderClass = error
    ? 'border-danger'
    : focused
      ? 'border-emerald-400'
      : 'border-gray-200 dark:border-ink-hairline';
  const containerHeightClass = isMultiline ? 'min-h-[112px] py-3' : 'h-[52px]';
  const inputClass = isMultiline
    ? 'font-sans text-[15px] text-gray-900 dark:text-text-primary p-0 h-full'
    : 'font-sans text-[15px] text-gray-900 dark:text-text-primary p-0';
  const placeholderColor = theme === 'light' ? '#9CA3AF' : '#7A8699';

  return (
    <View className="w-full">
      {label ? (
        <Text variant="label" tone="secondary" className={`mb-2 ${labelClassName ?? ''}`.trim()}>
          {label}
        </Text>
      ) : null}
      <View
        className={`rounded-md border ${borderClass} bg-white dark:bg-ink-2 px-4 ${containerHeightClass} justify-center ${containerClassName ?? ''}`.trim()}
        style={{ minWidth: 0, width: '100%', overflow: 'hidden' }}
      >
        <View className={`flex-row gap-2 ${isMultiline ? 'items-start' : 'items-center'}`}>
          {leftAdornment ? <View className={isMultiline ? 'pt-1' : ''}>{leftAdornment}</View> : null}
          <TextInput
            ref={ref}
            placeholderTextColor={placeholderColor}
            className={`${inputClass} flex-1 ${inputClassName ?? ''}`.trim()}
            textAlignVertical={isMultiline ? 'top' : 'center'}
            underlineColorAndroid="transparent"
            selectionColor="#22C54D"
            autoCorrect={rest.autoCorrect ?? false}
            style={[
              { borderWidth: 0, minWidth: 0 },
              style,
            ]}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />
          {rightAdornment ? <View className={isMultiline ? 'pt-1' : ''}>{rightAdornment}</View> : null}
        </View>
      </View>
      {error ? (
        <Text variant="caption" tone="danger" className="mt-1">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="muted" className="mt-1">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});
