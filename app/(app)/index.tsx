import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  EmptyStateCard,
  AdvancedFilterPanel,
  HubHeader,
  MatchCard,
  MatchBottomNav,
  SearchInput,
} from '@/src/components/features/matches';
import { Text } from '@/src/components/ui';
import type { AdvancedFilters } from '@/src/components/features/matches/explore/AdvancedFilterPanel';
import { useMatches } from '@/src/features/matches/hooks/useMatches';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

export default function ExploreMatchesScreen() {
  const theme = useAppColorScheme();
  const router = useRouter();
  const { availableMatches, fetchAvailableMatches, loadingAvailable } = useMatches();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});

  useEffect(() => {
    fetchAvailableMatches().catch(() => undefined);
  }, [fetchAvailableMatches]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchAvailableMatches({ query }).catch(() => undefined);
    }, 250);

    return () => clearTimeout(handler);
  }, [query, fetchAvailableMatches]);

  const filteredMatches = useMemo(() => {
    let result = availableMatches;

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((item) => `${item.title} ${item.location}`.toLowerCase().includes(q));
    }

    if (advancedFilters.shift) {
      result = result.filter((item) => item.shiftLabel.toLowerCase().includes(advancedFilters.shift!.toLowerCase()));
    }

    if (advancedFilters.maxPrice !== undefined) {
      result = result.filter((item) => item.pricePerPlayer <= advancedFilters.maxPrice!);
    }

    return result;
  }, [availableMatches, query, advancedFilters]);

  const bgColor = theme === 'light' ? '#F3F6FB' : '#05070B';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <View className="absolute inset-0" style={{ backgroundColor: bgColor }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubHeader onMessagesPress={() => router.push('/(app)/conversations')} unreadCount={2} />

        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar local, time, organizador..."
          onFilterPress={() => setShowFilters(true)}
        />

        <View className="px-[18px]">
          {filteredMatches.map((partida, index) => (
            <MatchCard
              key={partida.id}
              partida={partida}
              bannerPalette={index === 1 ? ['#1A2236', '#0F1828', '#050912'] : index === 2 ? ['#241015', '#170A0F', '#080306'] : undefined}
              onPress={() => router.push(`/(app)/${partida.id}`)}
            />
          ))}
        </View>

        {loadingAvailable ? (
          <View className="px-[18px] mt-2">
            <Text variant="caption" className="text-gray-600 dark:text-fg3">
              Carregando partidas...
            </Text>
          </View>
        ) : null}

        {filteredMatches.length === 0 ? (
          <EmptyStateCard
            title="Nenhuma partida encontrada"
            description="Ninguem marcou jogo com os filtros atuais. Que tal ser o primeiro?"
            actionLabel="+ Criar Partida"
            onAction={() => router.push('/(app)/create')}
          />
        ) : null}
      </ScrollView>

      <AdvancedFilterPanel
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
      />

      <MatchBottomNav active="buscar" />
    </SafeAreaView>
  );
}
