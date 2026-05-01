import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { LayoutAnimation, Platform, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

import {
  EmptyStateCard,
  AdvancedFilterPanel,
  HubHeader,
  MatchCard,
  MatchBottomNav,
  SearchInput,
} from '@/src/components/features/matches';
import { SkeletonList } from '@/src/components/ui';
import type { AdvancedFilters } from '@/src/components/features/matches/explore/AdvancedFilterPanel';
import { useMatches } from '@/src/features/matches/hooks/useMatches';
import { useUnreadChatCount } from '@/src/features/chat/hooks/useUnreadChatCount';
import {
  fetchUnreadNotificationsCount,
  subscribeNotifications,
} from '@/src/features/notifications/services/notificationsService';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import { selectionTick } from '@/src/lib/haptics';

function isValidFilterDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isValidFilterTime(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hours, minutes] = value.split(':').map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export default function ExploreMatchesScreen() {
  const { t } = useTranslation('matches');
  const theme = useAppColorScheme();
  const router = useRouter();
  const { availableMatches, fetchAvailableMatches, loadingAvailable } = useMatches();
  const unreadChatCount = useUnreadChatCount();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    fetchAvailableMatches().catch(() => undefined);
  }, [fetchAvailableMatches]);

  useEffect(() => {
    let isMounted = true;
    const loadUnread = async () => {
      try {
        const count = await fetchUnreadNotificationsCount();
        if (isMounted) setUnreadNotifications(count);
      } catch {
        if (isMounted) setUnreadNotifications(0);
      }
    };

    void loadUnread();
    const unsubscribe = subscribeNotifications(() => {
      void loadUnread();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

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

    if (advancedFilters.date && isValidFilterDate(advancedFilters.date)) {
      result = result.filter((item) => item.matchDate === advancedFilters.date);
    }

    if (advancedFilters.time && isValidFilterTime(advancedFilters.time)) {
      result = result.filter((item) => {
        if (!item.matchTime) return false;
        return item.matchTime.slice(0, 5) === advancedFilters.time;
      });
    }

    if (advancedFilters.maxPrice !== undefined) {
      result = result.filter((item) => item.pricePerPlayer <= advancedFilters.maxPrice!);
    }

    return result;
  }, [availableMatches, query, advancedFilters]);

  const bgColor = theme === 'light' ? '#F1F5F9' : '#020617';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <View className="absolute inset-0" style={{ backgroundColor: bgColor }} />

      <FlashList
        data={filteredMatches}
        keyExtractor={(item) => item.id}
bounces
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={(
          <>
            <HubHeader
              onMessagesPress={() => router.push('/(app)/conversations')}
              unreadCount={unreadChatCount}
              onNotificationsPress={() => router.push('/(app)/notifications')}
              unreadNotifications={unreadNotifications}
            />

            <SearchInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('search.placeholder', 'Buscar local, time, organizador...')}
              onFilterPress={() => {
                void selectionTick();
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowFilters((prev) => !prev);
              }}
              filtersExpanded={showFilters}
            />

            <View style={{ position: 'relative', zIndex: 50, elevation: 50 }}>
              {showFilters ? <AdvancedFilterPanel filters={advancedFilters} onFiltersChange={setAdvancedFilters} /> : null}
            </View>
          </>
        )}
        ListEmptyComponent={
          loadingAvailable ? (
            <View className="px-[18px]">
              <SkeletonList rows={4} />
            </View>
          ) : (
            <EmptyStateCard
              title={t('empty.noMatchesTitle', 'Nenhuma partida encontrada')}
              description={t('empty.noMatchesDescription', 'Ninguem marcou jogo com os filtros atuais. Que tal ser o primeiro?')}
              actionLabel={t('create.title', '+ Criar Partida')}
              onAction={() => router.push('/(app)/create')}
            />
          )
        }
        renderItem={({ item, index }) => (
          <View className="px-[18px]" style={{ zIndex: 1, elevation: 1 }}>
            <MatchCard
              partida={item}
              bannerPalette={index === 1 ? ['#1A2236', '#0F1828', '#050912'] : index === 2 ? ['#241015', '#170A0F', '#080306'] : undefined}
              onPress={() => router.push(`/(app)/${item.id}`)}
            />
          </View>
        )}
      />

      <MatchBottomNav active="buscar" />
    </SafeAreaView>
  );
}



