import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, TextInput, View } from 'react-native';
import { ChevronDown, MapPin, Search, X } from 'lucide-react-native';

import { Text } from '@/src/components/ui';
import { useMatchTheme } from '../matches/shared/theme';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import { COURTS_DATA, type Court } from '@/src/data/quadras';
import { useUserCourts } from '@/src/features/courts/useUserCourts';

type CourtPickerProps = {
  selectedCourtId?: string | null;
  onSelect: (court: Court | null) => void;
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function CourtPicker({ selectedCourtId, onSelect }: CourtPickerProps) {
  const matchTheme = useMatchTheme();
  const theme = useAppColorScheme();
  const { t } = useTranslation('quadras');
  const { userCourts } = useUserCourts();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const fieldBg = theme === 'light' ? '#FAFBFC' : '#101626';

  const allCourts = useMemo<Court[]>(
    () => [...userCourts, ...COURTS_DATA],
    [userCourts],
  );

  const selectedCourt = useMemo(
    () => allCourts.find((c) => c.id === selectedCourtId) ?? null,
    [allCourts, selectedCourtId],
  );

  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    if (!q) return allCourts;
    return allCourts.filter((court) =>
      normalize(`${court.name} ${court.location_preview}`).includes(q),
    );
  }, [allCourts, search]);

  return (
    <View className="w-full">
      <Text variant="label" tone="secondary" className="mb-2.5 font-semibold">
        {t('picker.label', 'Quadra (opcional)')}
      </Text>

      <Pressable
        onPress={() => setOpen(true)}
        className="h-14 rounded-[28px] border-[0.5px] px-4 flex-row items-center"
        style={{
          backgroundColor: fieldBg,
          borderColor: selectedCourt
            ? 'rgba(34,183,108,0.45)'
            : theme === 'light'
              ? 'rgba(0,0,0,0.12)'
              : '#1F2A44',
        }}
      >
        <MapPin
          size={16}
          color={selectedCourt ? matchTheme.colors.okSoft : matchTheme.colors.fgMuted}
        />
        <View className="flex-1 ml-2">
          {selectedCourt ? (
            <>
              <Text
                variant="caption"
                style={{ color: matchTheme.colors.okSoft, fontSize: 11, fontWeight: '600' }}
                numberOfLines={1}
              >
                {selectedCourt.name}
              </Text>
              <Text
                variant="micro"
                style={{ color: matchTheme.colors.fgMuted, fontSize: 11 }}
                numberOfLines={1}
              >
                {selectedCourt.location_preview}
              </Text>
            </>
          ) : (
            <Text variant="body" style={{ color: matchTheme.colors.fgMuted }} numberOfLines={1}>
              {t('picker.placeholder', 'Selecionar quadra cadastrada')}
            </Text>
          )}
        </View>

        {selectedCourt ? (
          <Pressable
            hitSlop={10}
            onPress={(e) => {
              e.stopPropagation();
              onSelect(null);
            }}
            className="h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <X size={14} color={matchTheme.colors.fgMuted} />
          </Pressable>
        ) : (
          <ChevronDown size={16} color={matchTheme.colors.fgMuted} />
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 px-4 justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="rounded-2xl border overflow-hidden max-h-[78%]"
            style={{
              borderColor: matchTheme.colors.lineStrong,
              backgroundColor: matchTheme.colors.bgSurfaceA,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              className="px-4 py-3 border-b"
              style={{ borderColor: matchTheme.colors.line }}
            >
              <Text
                variant="title"
                style={{ color: matchTheme.colors.fgPrimary, fontWeight: '700' }}
              >
                {t('picker.label', 'Quadra (opcional)')}
              </Text>
            </View>

            <View className="px-3 pt-3 pb-2">
              <View
                className="h-11 rounded-xl border px-3 flex-row items-center"
                style={{
                  borderColor: matchTheme.colors.lineStrong,
                  backgroundColor: matchTheme.colors.bgSurfaceB,
                }}
              >
                <Search size={16} color={matchTheme.colors.fgMuted} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder={t('picker.searchPlaceholder', 'Buscar quadra pelo nome...')}
                  placeholderTextColor={matchTheme.colors.fgMuted}
                  className="flex-1 ml-2"
                  autoCapitalize="none"
                  autoCorrect={false}
                  underlineColorAndroid="transparent"
                  selectionColor="#22B76C"
                  style={{ borderWidth: 0, color: matchTheme.colors.fgPrimary }}
                />
              </View>
            </View>

            <View className="px-4 pt-1 pb-1">
              <Text
                variant="micro"
                style={{
                  color: matchTheme.colors.fgMuted,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  fontWeight: '700',
                }}
              >
                {t('picker.listTitle', 'Quadras cadastradas')}
              </Text>
            </View>

            <FlatList
              data={filtered}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => item.id}
              style={{ backgroundColor: matchTheme.colors.bgSurfaceA }}
              renderItem={({ item }) => {
                const active = item.id === selectedCourtId;
                return (
                  <Pressable
                    onPress={() => {
                      onSelect(item);
                      setOpen(false);
                      setSearch('');
                    }}
                    className="px-4 py-3 flex-row items-center"
                    style={{
                      borderBottomColor: matchTheme.colors.line,
                      borderBottomWidth: 1,
                      backgroundColor: active ? 'rgba(34,183,108,0.10)' : 'transparent',
                    }}
                  >
                    <View
                      className="h-9 w-9 rounded-full items-center justify-center mr-3"
                      style={{
                        backgroundColor: 'rgba(34,183,108,0.12)',
                        borderWidth: 1,
                        borderColor: 'rgba(34,183,108,0.25)',
                      }}
                    >
                      <MapPin size={14} color={matchTheme.colors.okSoft} />
                    </View>
                    <View className="flex-1">
                      <Text
                        variant="body"
                        style={{
                          color: active ? matchTheme.colors.okSoft : matchTheme.colors.fgPrimary,
                          fontWeight: active ? '700' : '500',
                        }}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text
                        variant="caption"
                        style={{ color: matchTheme.colors.fgMuted, fontSize: 12 }}
                        numberOfLines={1}
                      >
                        {item.location_preview}
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View className="px-4 py-8 items-center">
                  <Text style={{ color: matchTheme.colors.fgMuted }}>
                    {t('picker.noResults', 'Nenhuma quadra encontrada com esse nome.')}
                  </Text>
                </View>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
