import { router } from 'expo-router';
import { Clock3, Search } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

import {
  ConversationListItem,
  HubTopNav,
} from '@/src/components/features/store';
import { IconButton, Pill, SkeletonList, Text } from '@/src/components/ui';
import { useChatList } from '@/src/features/chat/hooks/useChatList';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

export default function ConversationsListScreen() {
  const { t } = useTranslation('chat');
  const { filter, setFilter, loading, error, summary, visibleActive, visibleArchived } = useChatList();
  const theme = useAppColorScheme();

  const data = [...visibleActive, ...visibleArchived];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'light' ? '#F1F5F9' : '#020617' }}>
      <FlashList
        data={data}
        keyExtractor={(item) => item.id}
bounces
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        ListHeaderComponent={(
          <>
            <HubTopNav
              title={t('list.title', 'Conversas')}
              subtitle={t('list.subtitle', `${summary.activeCount} ATIVAS - ${summary.unreadCount} NAO LIDAS`, { active: summary.activeCount, unread: summary.unreadCount })}
              rightNode={
                <IconButton icon={<Search size={18} color={theme === 'light' ? '#3B4A5E' : '#FFFFFF'} strokeWidth={2} />} />
              }
            />

            <ScrollView
              horizontal
              bounces
              overScrollMode="always"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 12, gap: 8 }}
            >
              <Pill
                label={t('filters.all', 'Todas')}
                rightLabel={String(summary.activeCount)}
                tone={filter === 'todas' ? 'active' : 'default'}
                onPress={() => setFilter('todas')}
              />
              <Pill label={t('filters.active', 'Ativas')} tone={filter === 'ativas' ? 'active' : 'default'} onPress={() => setFilter('ativas')} />
              <Pill label={t('filters.asHost', 'Como Host')} tone={filter === 'host' ? 'active' : 'default'} onPress={() => setFilter('host')} />
              <Pill label={t('filters.asPlayer', 'Como Jogador')} tone={filter === 'jogador' ? 'active' : 'default'} onPress={() => setFilter('jogador')} />
              <Pill label={t('filters.archived', 'Arquivadas')} tone={filter === 'arquivadas' ? 'active' : 'default'} onPress={() => setFilter('arquivadas')} />
            </ScrollView>

            <View
              className="px-[18px] py-[10px] border-y flex-row items-center gap-2"
              style={{
                borderColor: theme === 'light' ? '#DCE6F2' : 'rgba(255,255,255,0.06)',
                backgroundColor: theme === 'light' ? 'rgba(34,183,108,0.10)' : '#22B76C14',
              }}
            >
              <Clock3 size={12} color={theme === 'light' ? '#1A8F57' : '#86E5B4'} strokeWidth={2.2} />
              <Text variant="micro" className="text-[#1F2937] dark:text-fg2">
                {t('list.linkedToMatchHint', 'Cada conversa e vinculada a uma ')}
                <Text className="text-[#1A8F57] dark:text-[#86E5B4] font-bold">{t('list.scheduledMatch', 'partida marcada')}</Text>
                {t('list.autoArchiveHint', '. Auto-arquiva 7 dias apos o jogo.')}
              </Text>
            </View>

            {error ? (
              <View className="px-[18px] py-3 border-b border-[rgba(0,0,0,0.08)] dark:border-line">
                <Text variant="micro" className="text-[#D66658] dark:text-[#FF9A9A]">
                  {error}
                </Text>
              </View>
            ) : null}

            {loading ? (
              <View className="px-[18px] py-3">
                <SkeletonList rows={3} />
              </View>
            ) : null}

            {visibleArchived.length > 0 ? (
              <View className="px-[18px] pt-[14px] pb-1">
                <Text variant="micro" className="uppercase tracking-[2.4px] font-extrabold text-[#111827] dark:text-white">
                  {t('filters.archived', 'Arquivadas')} <Text className="text-gold-700 dark:text-goldA">{visibleArchived.length}</Text>
                </Text>
              </View>
            ) : null}
          </>
        )}
        ListEmptyComponent={!loading ? (
          <View className="px-[18px] py-6">
            <Text variant="micro" className="text-[#4B5563] dark:text-fg3">{t('list.empty', 'Nenhuma conversa encontrada.')}</Text>
          </View>
        ) : null}
        renderItem={({ item }) => (
          <ConversationListItem
            item={item}
            onPress={() => router.push(`/(app)/conversations/${item.id}`)}
          />
        )}
      />
    </SafeAreaView>
  );
}



