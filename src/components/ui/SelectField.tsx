import { ChevronDown, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    Pressable,
    TextInput,
    View,
    type ImageSourcePropType,
} from 'react-native';

import { Text } from './Text';

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  iconSource?: ImageSourcePropType | null;
  iconUri?: string;
};

type SelectFieldProps<T extends string> = {
  label?: string;
  placeholder?: string;
  value: T | null | undefined;
  options: ReadonlyArray<SelectOption<T>>;
  onChange: (value: T) => void;
  error?: string;
  searchable?: boolean;
  disabled?: boolean;
};

export function SelectField<T extends string>({
  label,
  placeholder = 'Selecione',
  value,
  options,
  onChange,
  error,
  searchable = false,
  disabled = false,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selectedOption = options.find((option) => option.value === value) ?? null;

  const visibleOptions = useMemo(() => {
    if (!searchable) return options;
    const normalizedQuery = search.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) => {
      const haystack = `${option.label} ${option.description ?? ''}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [options, search, searchable]);

  return (
    <View className="w-full">
      {label ? (
        <Text variant="label" tone="secondary" className="mb-2">
          {label}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={`h-12 rounded-xl border bg-bg-elev2 px-4 flex-row items-center ${
          error ? 'border-danger' : 'border-bg-border'
        } ${disabled ? 'opacity-60' : ''}`}
      >
        <View className="flex-1 flex-row items-center">
          {selectedOption ? (
            <>
              {selectedOption.iconSource ? (
                <Image
                  source={selectedOption.iconSource}
                  style={{ width: 24, height: 16, borderRadius: 3, marginRight: 10 }}
                  resizeMode="cover"
                />
              ) : selectedOption.iconUri ? (
                <Image
                  source={{ uri: selectedOption.iconUri }}
                  style={{ width: 24, height: 16, borderRadius: 3, marginRight: 10 }}
                  resizeMode="cover"
                />
              ) : null}
              <Text variant="body" tone="primary" numberOfLines={1}>
                {selectedOption.label}
              </Text>
            </>
          ) : (
            <Text variant="body" tone="muted">
              {placeholder}
            </Text>
          )}
        </View>
        <ChevronDown size={16} color="rgba(255,255,255,0.6)" />
      </Pressable>

      {error ? (
        <Text variant="caption" tone="danger" className="mt-1">
          {error}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 bg-ink-0/70 px-4 justify-center"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="rounded-2xl border border-bg-border bg-bg-base overflow-hidden max-h-[78%]"
            onPress={(event) => event.stopPropagation()}
          >
            <View className="px-4 py-3 border-b border-bg-border">
              <Text variant="title" tone="primary">
                {label ?? 'Selecione'}
              </Text>
            </View>

            {searchable ? (
              <View className="px-3 pt-3 pb-2">
                <View className="h-11 rounded-xl border border-bg-border bg-bg-elev2 px-3 flex-row items-center">
                  <Search color="#9AA4B2" size={16} />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Buscar..."
                    placeholderTextColor="#7A8699"
                    className="flex-1 ml-2 text-text-primary"
                    autoCapitalize="none"
                    autoCorrect={false}
                    underlineColorAndroid="transparent"
                    selectionColor="#22C54D"
                    style={[{ borderWidth: 0 }]}
                  />
                </View>
              </View>
            ) : null}

            <FlatList
              data={visibleOptions}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const active = item.value === value;

                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`px-4 py-3 flex-row items-center border-b border-bg-border/40 ${
                      active ? 'bg-emerald-500/10' : ''
                    }`}
                  >
                    {item.iconSource ? (
                      <Image
                        source={item.iconSource}
                        style={{ width: 28, height: 18, borderRadius: 3, marginRight: 10 }}
                        resizeMode="cover"
                      />
                    ) : item.iconUri ? (
                      <Image
                        source={{ uri: item.iconUri }}
                        style={{ width: 28, height: 18, borderRadius: 3, marginRight: 10 }}
                        resizeMode="cover"
                      />
                    ) : null}

                    <View className="flex-1">
                      <Text variant="body" tone={active ? 'success' : 'primary'}>
                        {item.label}
                      </Text>
                      {item.description ? (
                        <Text variant="caption" tone="muted">
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View className="px-4 py-8 items-center">
                  <Text tone="muted">Nenhum resultado encontrado.</Text>
                </View>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}
