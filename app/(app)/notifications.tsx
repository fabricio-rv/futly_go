import { Bell, CircleDot } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { Text } from '@/src/components/ui';
import { useNotifications } from '@/src/features/notifications/hooks/useNotifications';

function toRelative(isoDate: string) {
  const date = new Date(isoDate);
  const now = Date.now();
  const diff = now - date.getTime();
  if (diff < 60_000) return 'agora';
  const min = Math.floor(diff / 60_000);
  if (min < 60) return `${min}min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'ontem';
  return `ha ${days}d`;
}

export default function NotificationsScreen() {
  const { notifications, recentActions, unreadCount, loading, error, setAllRead } = useNotifications();

  const title = useMemo(() => `Notificacoes ${unreadCount > 0 ? `(${unreadCount})` : ''}`.trim(), [unreadCount]);

  useFocusEffect(
    useCallback(() => {
      void setAllRead();
    }, [setAllRead]),
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-ink-0">
      <HubTopNav
        title={title}
        subtitle="ATIVIDADE"
        hideBack
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-[18px]">
          <View className="rounded-[16px] border border-line bg-white dark:bg-[#0C111E] p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <Bell size={16} color="#86E5B4" />
              <Text variant="label" className="font-semibold text-gray-900 dark:text-white">Notificacoes da conta</Text>
            </View>

            {loading ? <Text variant="caption" className="text-gray-600 dark:text-fg3">Carregando notificacoes...</Text> : null}
            {error ? <Text variant="caption" className="text-[#FCA5A5]">{error}</Text> : null}

            {!loading && notifications.length === 0 ? (
              <Text variant="caption" className="text-gray-600 dark:text-fg3">Nenhuma notificacao por enquanto.</Text>
            ) : (
              <View className="gap-2">
                {notifications.map((item) => (
                  <View
                    key={item.id}
                    className="rounded-[12px] border border-line px-3 py-3"
                    style={{ backgroundColor: item.isRead ? 'rgba(255,255,255,0.01)' : 'rgba(34,183,108,0.08)' }}
                  >
                    <View className="flex-row items-start justify-between gap-2">
                      <View className="flex-1">
                        <Text variant="caption" className="text-gray-900 dark:text-white font-semibold">{item.title}</Text>
                        <Text variant="micro" className="text-gray-600 dark:text-fg3 mt-1">{item.body}</Text>
                      </View>
                      <Text variant="micro" className="text-gray-600 dark:text-fg3">{toRelative(item.createdAt)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View className="rounded-[16px] border border-line bg-white dark:bg-[#0C111E] p-4 mt-4">
            <View className="flex-row items-center gap-2 mb-3">
              <CircleDot size={16} color="#D4A13A" />
              <Text variant="label" className="font-semibold text-gray-900 dark:text-white">Acoes recentes</Text>
            </View>

            {recentActions.length === 0 ? (
              <Text variant="caption" className="text-gray-600 dark:text-fg3">Sem acoes recentes.</Text>
            ) : (
              <View className="gap-2">
                {recentActions.map((action) => (
                  <View key={action.id} className="rounded-[12px] border border-line px-3 py-3">
                    <View className="flex-row items-center justify-between">
                      <Text variant="caption" className="text-gray-900 dark:text-white font-semibold">{action.title}</Text>
                      <Text variant="micro" className="text-gray-600 dark:text-fg3">{toRelative(action.createdAt)}</Text>
                    </View>
                    <Text variant="micro" className="text-gray-600 dark:text-fg3 mt-1">{action.body}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <MatchBottomNav active="notifications" />
    </SafeAreaView>
  );
}
