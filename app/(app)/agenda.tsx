import { MessageCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HubHeader, MatchBottomNav, MatchCard, PillTabs, SectionTitle, matchTheme } from '@/src/components/features/matches';
import { Text } from '@/src/components/ui';
import type { Partida } from '@/src/features/matches/types';
import { useMatches } from '@/src/features/matches/hooks/useMatches';

export default function AgendaScreen() {
  const [tab, setTab] = useState<'criadas' | 'marcadas'>('criadas');
  const { agenda, getUserAgenda, loadingAgenda } = useMatches();

  useEffect(() => {
    getUserAgenda().catch(() => undefined);
  }, [getUserAgenda]);

  const list: Partida[] = tab === 'criadas' ? agenda.criadas : agenda.marcadas;

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
          <SectionTitle title={tab === 'criadas' ? 'Como Anfitriao' : 'Como Jogador'} badge={String(list.length)} actionText="Ver todas" />

          {list.map((partida) => (
            <MatchCard
              key={partida.id}
              partida={partida}
              rightAction={
                tab === 'criadas' ? (
                  <Pressable
                    className="h-10 rounded-[10px] px-3 flex-row items-center"
                    style={{ backgroundColor: matchTheme.colors.ok }}
                    onPress={() => router.push('/(app)/conversations')}
                  >
                    <MessageCircle size={13} stroke="#05070B" />
                    <Text variant="caption" className="ml-1 font-semibold" style={{ color: '#05070B' }}>Chat</Text>
                  </Pressable>
                ) : undefined
              }
            />
          ))}

          {loadingAgenda ? (
            <Text variant="caption" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Carregando agenda...
            </Text>
          ) : null}

          {!loadingAgenda && list.length === 0 ? (
            <View className="rounded-[16px] border px-4 py-5" style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}>
              <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                Nenhuma partida {tab === 'criadas' ? 'criada' : 'marcada'} ainda.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <MatchBottomNav active="agenda" />
    </SafeAreaView>
  );
}
