import { router } from 'expo-router';
import { Clock3, Search } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ConversationListItem,
  HubTopNav,
} from '@/src/components/features/store';
import { IconButton, Pill, Text } from '@/src/components/ui';
import { useChatList } from '@/src/features/chat/hooks/useChatList';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

export default function ConversationsListScreen() {
  const { filter, setFilter, loading, error, summary, visibleActive, visibleArchived } = useChatList();
  const theme = useAppColorScheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'light' ? '#F3F6FB' : '#05070B' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <HubTopNav
          title="Conversas"
          subtitle={`${summary.activeCount} ATIVAS - ${summary.unreadCount} NAO LIDAS`}
          rightNode={
            <IconButton icon={<Search size={18} color={theme === 'light' ? '#3B4A5E' : '#FFFFFF'} strokeWidth={2} />} />
          }
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 12, gap: 8 }}
        >
          <Pill
            label="Todas"
            rightLabel={String(summary.activeCount)}
            tone={filter === 'todas' ? 'active' : 'default'}
            onPress={() => setFilter('todas')}
          />
          <Pill label="Ativas" tone={filter === 'ativas' ? 'active' : 'default'} onPress={() => setFilter('ativas')} />
          <Pill label="Como Host" tone={filter === 'host' ? 'active' : 'default'} onPress={() => setFilter('host')} />
          <Pill label="Como Jogador" tone={filter === 'jogador' ? 'active' : 'default'} onPress={() => setFilter('jogador')} />
          <Pill label="Arquivadas" tone={filter === 'arquivadas' ? 'active' : 'default'} onPress={() => setFilter('arquivadas')} />
        </ScrollView>

        <View
          className="px-[18px] py-[10px] border-y flex-row items-center gap-2"
          style={{
            borderColor: theme === 'light' ? '#DCE6F2' : 'rgba(255,255,255,0.06)',
            backgroundColor: theme === 'light' ? 'rgba(34,183,108,0.10)' : '#22B76C14',
          }}
        >
          <Clock3 size={12} color={theme === 'light' ? '#1A8F57' : '#86E5B4'} strokeWidth={2.2} />
          <Text variant="micro" className="text-gray-700 dark:text-fg2">
            Cada conversa e vinculada a uma <Text className="text-[#1A8F57] dark:text-[#86E5B4] font-bold">partida marcada</Text>. Auto-arquiva 7 dias apos o jogo.
          </Text>
        </View>

        {error ? (
          <View className="px-[18px] py-3 border-b border-gray-200 dark:border-line">
            <Text variant="micro" className="text-[#D66658] dark:text-[#FF9A9A]">
              {error}
            </Text>
          </View>
        ) : null}

        {loading ? (
          <View className="px-[18px] py-3 border-b border-gray-200 dark:border-line">
            <Text variant="micro" className="text-gray-600 dark:text-fg3">
              Carregando conversas...
            </Text>
          </View>
        ) : null}

        {visibleActive.map((item) => (
          <ConversationListItem
            key={item.id}
            item={item}
            onPress={() => router.push(`/(app)/conversations/${item.id}`)}
          />
        ))}

        {visibleArchived.length > 0 ? (
          <View>
            <View className="px-[18px] pt-[14px] pb-1">
              <Text variant="micro" className="uppercase tracking-[2.4px] font-extrabold text-gray-900 dark:text-white">
                Arquivadas <Text className="text-gold-700 dark:text-goldA">{visibleArchived.length}</Text>
              </Text>
            </View>

            {visibleArchived.map((item) => (
              <ConversationListItem
                key={item.id}
                item={item}
                onPress={() => router.push(`/(app)/conversations/${item.id}`)}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
