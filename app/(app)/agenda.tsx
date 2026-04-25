import { MessageCircle } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HubHeader, MatchBottomNav, MatchCard, PillTabs, PlayerRow, SectionTitle, StatBadge, matchTheme } from '@/src/components/features/matches';
import { Text } from '@/src/components/ui';
import { hostMatch, playerMatch } from '@/src/features/matches/mockData';
import type { Partida } from '@/src/features/matches/types';

export default function AgendaScreen() {
  const [tab, setTab] = useState<'criadas' | 'marcadas'>('criadas');
  const list: Partida[] = tab === 'criadas' ? [hostMatch] : [playerMatch];

  return (
    <SafeAreaView className="flex-1 bg-ink-0">
      <HubHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <PillTabs
          tabs={[{ id: 'criadas', label: 'Criadas' }, { id: 'marcadas', label: 'Marcadas' }]}
          activeId={tab}
          onChange={(id) => setTab(id as 'criadas' | 'marcadas')}
        />

        <View className="px-[18px]">
          <SectionTitle title={tab === 'criadas' ? 'Como Anfitriao' : 'Como Jogador'} badge={tab === 'criadas' ? '2' : '1'} actionText="Ver todas" />

          {list.map((partida) => (
            <MatchCard
              key={partida.id}
              partida={partida}
              rightAction={
                tab === 'criadas' ? (
                  <Pressable className="h-10 rounded-[10px] px-3 flex-row items-center" style={{ backgroundColor: matchTheme.colors.ok }}>
                    <MessageCircle size={13} stroke="#05070B" />
                    <Text variant="caption" className="ml-1 font-semibold" style={{ color: '#05070B' }}>Chat (4)</Text>
                  </Pressable>
                ) : undefined
              }
            />
          ))}
        </View>

        <View className="px-[18px] mt-2">
          <SectionTitle title="Realizadas" badge="12" actionText="Historico" />
          <View className="rounded-[20px] border overflow-hidden" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
            <View className="px-[14px] py-3 flex-row items-center border-b" style={{ borderBottomColor: matchTheme.colors.line }}>
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#1B3A5F' }}>
                <Text variant="label" className="font-semibold">VS</Text>
              </View>
              <View className="flex-1">
                <Text variant="label" className="font-semibold">vs. Barca do Ze - 4x2</Text>
                <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>Ontem - Arena Central - MVP +75 XP</Text>
              </View>
              <StatBadge label="Avaliar" tone="warn" small />
            </View>

            {(hostMatch.players ?? []).slice(1, 3).map((player, index, arr) => (
              <View key={player.id} style={{ borderBottomWidth: index < arr.length - 1 ? 1 : 0, borderBottomColor: matchTheme.colors.line }}>
                <PlayerRow player={player} showStars={index === 0 ? 4 : 5} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <MatchBottomNav active="agenda" />
    </SafeAreaView>
  );
}
