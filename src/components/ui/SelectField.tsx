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
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

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
  const theme = useAppColorScheme();
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
        className={`h-12 rounded-xl border px-4 flex-row items-center ${
          error ? 'border-danger' : (theme === 'light' ? 'border-[rgba(0,0,0,0.12)]' : 'border-bg-border')
        } ${disabled ? 'opacity-60' : ''}`}
        style={{ backgroundColor: theme === 'light' ? '#FAFBFC' : '#101626' }}
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
              <Text variant="body" tone="primary" numberOfLines={1} style={{ color: theme === 'light' ? '#111827' : '#F5F7FA' }}>
                {selectedOption.label}
              </Text>
            </>
          ) : (
            <Text variant="body" tone="muted" style={{ color: theme === 'light' ? '#64748B' : '#7A8699' }}>
              {placeholder}
            </Text>
          )}
        </View>
        <ChevronDown size={16} color={theme === 'light' ? 'rgba(31,41,55,0.6)' : 'rgba(255,255,255,0.6)'} />
      </Pressable>

      {error ? (
        <Text variant="caption" tone="danger" className="mt-1">
          {error}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 px-4 justify-center"
          style={{ backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.7)' }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="rounded-2xl border overflow-hidden max-h-[78%]"
            style={{
              borderColor: theme === 'light' ? 'rgba(0,0,0,0.12)' : '#1F2A44',
              backgroundColor: theme === 'light' ? '#FFFFFF' : '#0A0E18'
            }}
            onPress={(event) => event.stopPropagation()}
          >
            <View className="px-4 py-3 border-b" style={{ borderColor: theme === 'light' ? 'rgba(0,0,0,0.12)' : '#1F2A44' }}>
              <Text variant="title" tone="primary" style={{ color: theme === 'light' ? '#111827' : '#F5F7FA' }}>
                {label ?? 'Selecione'}
              </Text>
            </View>

            {searchable ? (
              <View className="px-3 pt-3 pb-2">
                <View className="h-11 rounded-xl border px-3 flex-row items-center" style={{ borderColor: theme === 'light' ? 'rgba(0,0,0,0.12)' : '#1F2A44', backgroundColor: theme === 'light' ? '#FAFBFC' : '#101626' }}>
                  <Search color={theme === 'light' ? '#9CA3AF' : '#9AA4B2'} size={16} />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Buscar..."
                    placeholderTextColor={theme === 'light' ? '#9CA3AF' : '#7A8699'}
                    className="flex-1 ml-2"
                    autoCapitalize="none"
                    autoCorrect={false}
                    underlineColorAndroid="transparent"
                    selectionColor="#22C54D"
                    style={[{ borderWidth: 0, color: theme === 'light' ? '#111827' : '#F5F7FA' }]}
                  />
                </View>
              </View>
            ) : null}

            <FlatList
              data={visibleOptions}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => item.value}
              style={{ backgroundColor: theme === 'light' ? '#FFFFFF' : '#0A0E18' }}
              renderItem={({ item }) => {
                const active = item.value === value;

                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`px-4 py-3 flex-row items-center ${
                      active ? (theme === 'light' ? 'bg-emerald-500/10' : 'bg-emerald-500/10') : ''
                    }`}
                    style={{ borderBottomColor: theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)', borderBottomWidth: 1 }}
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
                      <Text variant="body" tone={active ? 'success' : 'primary'} style={{ color: active ? '#22B76C' : (theme === 'light' ? '#111827' : '#F5F7FA') }}>
                        {item.label}
                      </Text>
                      {item.description ? (
                        <Text variant="caption" tone="muted" style={{ color: theme === 'light' ? '#64748B' : '#7A8699' }}>
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
