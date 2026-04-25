import { Pressable, View } from 'react-native';

import { Text } from './Text';

type Option<T extends string> = {
  value: T;
  label: string;
};

type MultiChipSelectorProps<T extends string> = {
  label?: string;
  options: ReadonlyArray<Option<T>>;
  values: ReadonlyArray<T>;
  onChange: (values: T[]) => void;
  max?: number;
  error?: string;
  hint?: string;
};

export function MultiChipSelector<T extends string>({
  label,
  options,
  values,
  onChange,
  max,
  error,
  hint,
}: MultiChipSelectorProps<T>) {
  const selected = new Set(values);

  const toggle = (value: T) => {
    if (selected.has(value)) {
      onChange(values.filter((current) => current !== value));
      return;
    }

    if (max && values.length >= max) {
      return;
    }

    onChange([...values, value]);
  };

  return (
    <View className="w-full">
      {label ? (
        <Text variant="label" tone="secondary" className="mb-2">
          {label}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%', minWidth: 0 }}>
        {options.map((option) => {
          const active = selected.has(option.value);

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              onPress={() => toggle(option.value)}
              className={`mr-2 mb-2 rounded-xl px-4 h-11 items-center justify-center border ${
                active ? 'bg-emerald-500 border-emerald-500' : 'bg-bg-elev2 border-bg-border'
              }`}
              style={{ maxWidth: '100%' }}
            >
              <Text
                variant="label"
                tone={active ? 'inverse' : 'primary'}
                className="font-semibold"
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
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
}
