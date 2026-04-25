import { Pressable, ScrollView, View } from 'react-native';

import { Text } from './Text';

type Option<T extends string> = {
  value: T;
  label: string;
};

type ChipSelectorProps<T extends string> = {
  label?: string;
  options: ReadonlyArray<Option<T>>;
  value: T | null | undefined;
  onChange: (value: T) => void;
  error?: string;
  horizontal?: boolean;
};

export function ChipSelector<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  horizontal = true,
}: ChipSelectorProps<T>) {
  const content = (
    <View style={horizontal ? { flexDirection: 'row', minWidth: 0 } : { flexDirection: 'row', flexWrap: 'wrap', width: '100%', minWidth: 0 }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            onPress={() => onChange(opt.value)}
            testID={`chip-${opt.value}`}
            className={`mr-2 mb-2 rounded-full px-4 h-10 items-center justify-center border ${
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
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View className="w-full">
      {label ? (
        <Text variant="label" tone="secondary" className="mb-2">
          {label}
        </Text>
      ) : null}
      {horizontal ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {error ? (
        <Text variant="caption" tone="danger" className="mt-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
