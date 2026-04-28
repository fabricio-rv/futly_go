import { router } from 'expo-router';
import { Clock3, Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
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
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isLight = theme === 'light';

  const filterItems = (items: typeof visibleActive) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q) ||
      (item.author ?? '').toLowerCase().includes(q)
    );
  };

  const data = useMemo(() => {
    const filteredActive = filterItems(visibleActive);
    const filteredArchived = filterItems(visibleArchived);

    if (filter === 'todas' && filteredArchived.length > 0) {
      return [
        ...filteredActive.map((item) => ({ type: 'conversation' as const, id: item.id, item })),
        { type: 'archivedHeader' as const, id: 'archived-header' },
        ...filteredArchived.map((item) => ({ type: 'conversation' as const, id: item.id, item })),
      ];
    }

    return [...filteredActive, ...filterItems(visibleArchived)].map((item) => ({ type: 'conversation' as const, id: item.id, item }));
  }, [filter, visibleActive, visibleArchived, searchQuery]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isLight ? '#EEF3FA' : '#060B17' }}>
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
              subtitle={t('list.subtitle', `${summary.activeCount} ATIVAS - ${summary.unreadCount} NAO LIDAS`, { activeCount: summary.activeCount, unreadCount: summary.unreadCount })}
              rightNode={
                <IconButton
                  icon={<Search size={18} color={showSearch ? '#22B76C' : (isLight ? '#3B4A5E' : '#FFFFFF')} strokeWidth={2} />}
                  onPress={() => {
                    setShowSearch((v) => !v);
                    setSearchQuery('');
                  }}
                />
              }
            />

            {showSearch ? (
              <View
                style={{
                  marginHorizontal: 18,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isLight ? '#C8D6E8' : 'rgba(255,255,255,0.10)',
                  backgroundColor: isLight ? '#FFFFFF' : '#0C111E',
                  paddingHorizontal: 12,
                  height: 44,
                }}
              >
                <Search size={16} color={isLight ? '#8A9BB0' : '#5A6A80'} strokeWidth={2} style={{ marginRight: 8 }} />
                <TextInput
                  autoFocus
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar conversa ou usuário..."
                  placeholderTextColor={isLight ? '#9BABBF' : '#4A5A6F'}
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: isLight ? '#1F2937' : '#E8EDF3',
                    includeFontPadding: false,
                    paddingVertical: 0,
                  }}
                />
                {searchQuery.length > 0 ? (
                  <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                    <X size={16} color={isLight ? '#8A9BB0' : '#5A6A80'} strokeWidth={2} />
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            <ScrollView
              horizontal
              bounces
              overScrollMode="always"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 10, gap: 8 }}
            >
              <Pill
                label={`${t('filters.all', 'Todas')} ${summary.activeCount}`}
                tone={filter === 'todas' ? 'active' : 'default'}
                onPress={() => setFilter('todas')}
              />
              <Pill label={t('filters.active', 'Ativas')} tone={filter === 'ativas' ? 'active' : 'default'} onPress={() => setFilter('ativas')} />
              <Pill label={t('filters.asHost', 'Como Host')} tone={filter === 'host' ? 'active' : 'default'} onPress={() => setFilter('host')} />
              <Pill label={t('filters.asPlayer', 'Como Jogador')} tone={filter === 'jogador' ? 'active' : 'default'} onPress={() => setFilter('jogador')} />
              <Pill label={t('filters.archived', 'Arquivadas')} tone={filter === 'arquivadas' ? 'active' : 'default'} onPress={() => setFilter('arquivadas')} />
            </ScrollView>

            <View
              className="mx-[18px] mt-1 mb-2 px-3 py-[10px] border rounded-2xl flex-row items-center gap-2"
              style={{
                borderColor: isLight ? '#CFE1D4' : 'rgba(34,183,108,0.30)',
                backgroundColor: isLight ? '#E8F6EE' : '#113126',
              }}
            >
              <Clock3 size={12} color={isLight ? '#1A8F57' : '#86E5B4'} strokeWidth={2.2} />
              <Text variant="micro" className="text-[#1F2937] dark:text-fg2">
                {t('list.linkedToMatchHint', 'Cada conversa e vinculada a uma ')}
                <Text variant="micro" className="text-[#1A8F57] dark:text-[#86E5B4] font-bold">{t('list.scheduledMatch', 'partida marcada')}</Text>
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
          </>
        )}
        ListEmptyComponent={!loading ? (
          <View className="px-[18px] py-6">
            <Text variant="micro" className="text-[#4B5563] dark:text-fg3">
              {searchQuery.trim()
                ? 'Nenhum resultado encontrado.'
                : t('list.empty', 'Nenhuma conversa encontrada.')}
            </Text>
          </View>
        ) : null}
        renderItem={({ item }) => {
          if (item.type === 'archivedHeader') {
            return (
              <View className="px-[18px] pt-[16px] pb-1">
                <Text variant="micro" className="uppercase tracking-[2.4px] font-extrabold text-[#111827] dark:text-white">
                  {t('filters.archived', 'Arquivadas')} <Text className="text-gold-700 dark:text-goldA">{visibleArchived.length}</Text>
                </Text>
              </View>
            );
          }

          return (
            <ConversationListItem
              item={item.item}
              onPress={() => router.push(`/(app)/conversations/${item.item.id}`)}
            />
          );
        }}
      />
    </SafeAreaView>
  );
}
