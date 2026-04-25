import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, View } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  EmptyStateCard,
  FilterBar,
  HubHeader,
  MatchCard,
  MatchBottomNav,
  SearchInput,
} from '@/src/components/features/matches';
import { Text } from '@/src/components/ui';
import { findFilters } from '@/src/features/matches/mockData';
import { useMatches } from '@/src/features/matches/hooks/useMatches';

export default function ExploreMatchesScreen() {
  const router = useRouter();
  const { availableMatches, fetchAvailableMatches, loadingAvailable } = useMatches();
  const [query, setQuery] = useState('');

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
    const q = query.trim().toLowerCase();
    if (!q) return availableMatches;
    return availableMatches.filter((item) => `${item.title} ${item.location}`.toLowerCase().includes(q));
  }, [availableMatches, query]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-ink-0">
      <View className="absolute inset-0 bg-white dark:bg-ink-0" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubHeader onMessagesPress={() => router.push('/(app)/conversations')} unreadCount={2} />

        <SearchInput value={query} onChangeText={setQuery} placeholder="Buscar local, time, organizador..." />
        <FilterBar filters={findFilters} />

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
            <Text variant="caption" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Carregando partidas...
            </Text>
          </View>
        ) : null}

        {filteredMatches.length === 0 ? (
          <EmptyStateCard
            title="Nenhuma partida encontrada"
            description="Ninguém marcou jogo com os filtros atuais. Que tal ser o primeiro?"
            actionLabel="+ Criar Partida"
            onAction={() => router.push('/(app)/create')}
          />
        ) : null}
      </ScrollView>

      <MatchBottomNav active="buscar" />
    </SafeAreaView>
  );
}


