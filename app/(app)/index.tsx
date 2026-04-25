import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
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
import { findFilters, findMatches } from '@/src/features/matches/mockData';

export default function ExploreMatchesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filteredMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return findMatches;
    return findMatches.filter((item) => `${item.title} ${item.location}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <SafeAreaView className="flex-1 bg-ink-0">
      <View className="absolute inset-0 bg-ink-0" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubHeader badgeLabel="14 ABERTAS" />

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

        <View className="mt-2 px-[18px]">
          <Text variant="micro" className="uppercase tracking-[2.4px] font-bold mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Voce buscou "Pivo + Manha"
          </Text>
        </View>

        <EmptyStateCard
          title="Nenhuma partida encontrada"
          description="Ninguem marcou jogo de manha para Pivo em Porto Alegre. Que tal ser o primeiro?"
          actionLabel="+ Criar Partida"
          onAction={() => router.push('/(app)/create')}
        />
      </ScrollView>

      <MatchBottomNav active="buscar" />
    </SafeAreaView>
  );
}
