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
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
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
    leftIcon,
    rightIcon,
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
  const [isFilled, setIsFilled] = useState(!!rest.value || !!rest.defaultValue);

  const borderColorValue = useSharedValue(theme === 'light' ? '#E4E4E7' : '#3F3F46');
  const shadowOpacity = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderColorValue.value,
  }));

  const animatedShadowStyle = useAnimatedStyle(() => ({
    shadowColor: '#10B981',
    shadowOpacity: shadowOpacity.value,
    shadowRadius: shadowOpacity.value * 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: shadowOpacity.value * 3,
  }));

  const isMultiline = !!rest.multiline;
  const placeholderColor = theme === 'light' ? '#A1A1AA' : '#71717A';

  const handleFocus = (e: any) => {
    setFocused(true);
    borderColorValue.value = withTiming(
      theme === 'light' ? '#10B981' : '#34D399',
      { duration: 200 }
    );
    shadowOpacity.value = withTiming(0.15, { duration: 200 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    borderColorValue.value = withTiming(
      theme === 'light' ? '#E4E4E7' : '#3F3F46',
      { duration: 200 }
    );
    shadowOpacity.value = withTiming(0, { duration: 200 });
    onBlur?.(e);
  };

  const handleChangeText = (text: string) => {
    setIsFilled(!!text);
    rest.onChangeText?.(text);
  };

  const handleClear = () => {
    handleChangeText('');
    onClear?.();
  };

  return (
    <View className="w-full">
      {label && (
        <Text
          variant="label"
          tone={error ? 'danger' : 'secondary'}
          className={`mb-2.5 font-semibold ${labelClassName || ''}`.trim()}
        >
          {label}
        </Text>
      )}

      <Animated.View
        style={[
          animatedBorderStyle,
          animatedShadowStyle,
          {
            borderRadius: 12,
            borderWidth: 1.5,
          },
        ]}
        className={`bg-white dark:bg-zinc-800 ${
          !editable ? 'opacity-50' : ''
        } ${containerClassName || ''}`.trim()}
      >
        {/* CONTAINER PRINCIPAL - Flexbox com padding e gap */}
        <View className="flex-row items-center px-5 py-4 gap-3">
          {/* ÍCONE ESQUERDO - Flex-shrink para não expandir */}
          {leftIcon && (
            <View className="flex-shrink-0">
              {leftIcon}
            </View>
          )}

          {/* TEXTINPUT - Flex-1 para ocupar espaço restante */}
          <TextInput
            ref={ref}
            testID={testID}
            placeholderTextColor={placeholderColor}
            editable={editable}
            accessibilityLabel={accessibilityLabel || label}
            accessibilityState={{ disabled: !editable }}
            className={`flex-1 font-normal text-base text-zinc-900 dark:text-zinc-50 ${
              inputClassName || ''
            }`.trim()}
            textAlignVertical={isMultiline ? 'top' : 'center'}
            underlineColorAndroid="transparent"
            selectionColor={theme === 'light' ? '#10B981' : '#34D399'}
            style={[
              {
                padding: 0,
                margin: 0,
                includeFontPadding: false,
                textAlignVertical: isMultiline ? 'top' : 'center',
              },
              style,
            ]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeText={handleChangeText}
            {...rest}
          />

          {/* ÍCONE DIREITO - Flex-shrink para não expandir */}
          {showClearButton && isFilled && onClear ? (
            <Pressable
              onPress={handleClear}
              accessibilityLabel="Clear input"
              accessibilityRole="button"
              className="flex-shrink-0 p-1.5"
            >
              <View className="w-5 h-5 rounded-full bg-zinc-300 dark:bg-zinc-600 items-center justify-center">
                <Text className="text-zinc-700 dark:text-zinc-200 text-sm font-bold leading-none">
                  ×
                </Text>
              </View>
            </Pressable>
          ) : rightIcon ? (
            <View className="flex-shrink-0">
              {rightIcon}
            </View>
          ) : null}
        </View>
      </Animated.View>

      {/* MENSAGENS DE ERRO/HINT */}
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
