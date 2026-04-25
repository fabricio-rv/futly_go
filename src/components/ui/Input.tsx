import { forwardRef, useState } from 'react';
import {
    TextInput,
    type TextInputProps,
    View,
} from 'react-native';

import { Text } from './Text';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, onFocus, onBlur, style, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const isMultiline = !!rest.multiline;
  const borderClass = error
    ? 'border-danger'
    : focused
      ? 'border-emerald-400'
      : 'border-ink-hairline';
  const containerHeightClass = isMultiline ? 'min-h-[112px] py-3' : 'h-[52px]';
  const inputClass = isMultiline
    ? 'font-sans text-[15px] text-text-primary p-0 h-full'
    : 'font-sans text-[15px] text-text-primary p-0';

  return (
    <View className="w-full">
      {label ? (
        <Text variant="label" tone="secondary" className="mb-2">
          {label}
        </Text>
      ) : null}
      <View
        className={`rounded-md border ${borderClass} bg-ink-2 px-4 ${containerHeightClass} justify-center`}
        style={{ minWidth: 0, width: '100%', overflow: 'hidden' }}
      >
        <TextInput
          ref={ref}
          placeholderTextColor="#7A8699"
          className={inputClass}
          textAlignVertical={isMultiline ? 'top' : 'center'}
          underlineColorAndroid="transparent"
          selectionColor="#22C54D"
          autoCorrect={rest.autoCorrect ?? false}
          style={[
            { borderWidth: 0, width: '100%', minWidth: 0, maxWidth: '100%' },
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
