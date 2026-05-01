import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { LayoutAnimation, Platform, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

import {
  EmptyStateCard,
  HubHeader,
  MatchBottomNav,
  SearchInput,
} from '@/src/components/features/matches';
import {
  AddCourtModal,
  CourtCard,
  CourtFilterPanel,
  type CourtFilters,
} from '@/src/components/features/courts';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import { selectionTick } from '@/src/lib/haptics';
import { COURTS_DATA, type Court } from '@/src/data/quadras';
import { useUserCourts } from '@/src/features/courts/useUserCourts';

function extractState(court: Court): string {
  const match = court.address.match(/,\s*([A-Z]{2})(?:\s*,|\s*$)/);
  if (match) return match[1];
  return '';
}

function extractCity(court: Court): string {
  const parts = court.location_preview.split(',').map((s) => s.trim());
  return parts[parts.length - 1] ?? '';
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export default function QuadrasScreen() {
  const { t } = useTranslation('quadras');
  const theme = useAppColorScheme();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CourtFilters>({});
  const [addModalVisible, setAddModalVisible] = useState(false);
  const { userCourts, addCourt } = useUserCourts();

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const allCourts = useMemo<Court[]>(
    () => [...userCourts, ...COURTS_DATA],
    [userCourts],
  );

  const states = useMemo(() => {
    const set = new Set<string>();
    allCourts.forEach((court) => {
      const state = extractState(court);
      if (state) set.add(state);
    });
    return Array.from(set).sort();
  }, [allCourts]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    allCourts.forEach((court) => {
      if (filters.state) {
        const courtState = extractState(court);
        if (courtState !== filters.state) return;
      }
      const city = extractCity(court);
      if (city) set.add(city);
    });
    return Array.from(set).sort();
  }, [allCourts, filters.state]);

  const filteredCourts = useMemo(() => {
    let result = allCourts;

    const q = normalize(query.trim());
    if (q) {
      result = result.filter((court) => {
        const haystack = normalize(`${court.name} ${court.location_preview} ${court.address}`);
        return haystack.includes(q);
      });
    }

    if (filters.state) {
      result = result.filter((court) => extractState(court) === filters.state);
    }

    if (filters.city) {
      result = result.filter((court) => extractCity(court) === filters.city);
    }

    if (filters.location) {
      const loc = normalize(filters.location.trim());
      if (loc) {
        result = result.filter((court) =>
          normalize(`${court.location_preview} ${court.address}`).includes(loc),
        );
      }
    }

    return result;
  }, [allCourts, query, filters]);

  const bgColor = theme === 'light' ? '#F1F5F9' : '#020617';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <View className="absolute inset-0" style={{ backgroundColor: bgColor }} />

      <FlashList
        data={filteredCourts}
        keyExtractor={(item) => item.id}
        bounces
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={(
          <>
            <HubHeader
              title={t('title', 'Quadras')}
              showMessages={false}
              onAddPress={() => {
                void selectionTick();
                setAddModalVisible(true);
              }}
              rightAccessibilityLabel={t('add.title', 'Adicionar Quadra')}
            />

            <SearchInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('search.placeholder', 'Buscar por quadra, cidade, cep...')}
              onFilterPress={() => {
                void selectionTick();
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowFilters((prev) => !prev);
              }}
              filtersExpanded={showFilters}
            />

            <View style={{ position: 'relative', zIndex: 50, elevation: 50 }}>
              {showFilters ? (
                <CourtFilterPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  states={states}
                  cities={cities}
                />
              ) : null}
            </View>
          </>
        )}
        ListEmptyComponent={(
          <EmptyStateCard
            title={t('empty.title', 'Nenhuma quadra encontrada')}
            description={t('empty.description', 'Tente ajustar os filtros ou a busca.')}
          />
        )}
        renderItem={({ item, index }) => (
          <View className="px-[18px]" style={{ zIndex: 1, elevation: 1 }}>
            <CourtCard
              court={item}
              bannerPalette={
                index === 1
                  ? ['#1A2236', '#0F1828', '#050912']
                  : index === 2
                    ? ['#241015', '#170A0F', '#080306']
                    : undefined
              }
              onPress={() => router.push(`/(app)/quadras/${item.id}`)}
            />
          </View>
        )}
      />

      <MatchBottomNav active="quadras" />

      <AddCourtModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSubmit={async (court) => {
          await addCourt(court);
        }}
      />
    </SafeAreaView>
  );
}
