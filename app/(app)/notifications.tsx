import { Bell, CircleDot, Star } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { View, Modal, Pressable, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

import { MatchBottomNav, useMatchTheme } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { BaseCard, Text, Button, SkeletonList, TouchableScale } from '@/src/components/ui';
import { useNotifications } from '@/src/features/notifications/hooks/useNotifications';
import { useMatches } from '@/src/features/matches/hooks/useMatches';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

type NotificationItem = ReturnType<typeof useNotifications>['notifications'][number];

function toRelative(isoDate: string) {
  const date = new Date(isoDate);
  const now = Date.now();
  const diff = now - date.getTime();
  if (diff < 60_000) return 'now';
  const min = Math.floor(diff / 60_000);
  if (min < 60) return `${min}min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const { t } = useTranslation('notifications');
  const theme = useAppColorScheme();
  const matchTheme = useMatchTheme();
  const { notifications, recentActions, unreadCount, loading, error, setAllRead } = useNotifications();
  const { processParticipationRequest, submitMatchRating, submitting } = useMatches();

  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingData, setRatingData] = useState<{ matchId: string; targetUserId: string; targetRole: 'creator' | 'player' } | null>(null);

  const title = useMemo(() => `${t('title', 'Notificacoes')} ${unreadCount > 0 ? `(${unreadCount})` : ''}`.trim(), [unreadCount, t]);
  const bgColor = theme === 'light' ? '#F1F5F9' : '#020617';

  const handleRequestAction = useCallback(async (requestId: string, action: 'accept' | 'reject') => {
    try {
      await processParticipationRequest(requestId, action);
      Alert.alert(t('common.success', 'Sucesso'), action === 'accept' ? t('requests.accepted', 'Solicitacao aceita!') : t('requests.rejected', 'Solicitacao recusada.'));
      await setAllRead();
    } catch {
      Alert.alert(t('common.error', 'Erro'), t('requests.processError', 'Nao foi possivel processar a solicitacao.'));
    }
  }, [processParticipationRequest, setAllRead, t]);

  const handleOpenRating = useCallback((notif: NotificationItem) => {
    if (notif.metadata?.match_id && notif.metadata?.target_user_id) {
      setRatingData({
        matchId: notif.metadata.match_id,
        targetUserId: notif.metadata.target_user_id,
        targetRole: notif.metadata.target_role || 'player',
      });
      setRatingScore(5);
      setRatingComment('');
      setRatingModalVisible(true);
    }
  }, []);

  const handleSubmitRating = useCallback(async () => {
    if (!ratingData) return;

    try {
      await submitMatchRating({
        matchId: ratingData.matchId,
        reviewedId: ratingData.targetUserId,
        targetRole: ratingData.targetRole,
        score: ratingScore,
        comment: ratingComment.trim() || null,
      });
      setRatingModalVisible(false);
      Alert.alert(t('common.success', 'Sucesso'), t('rating.sent', 'Avaliacao enviada!'));
      await setAllRead();
    } catch {
      Alert.alert(t('common.error', 'Erro'), t('rating.sendError', 'Nao foi possivel enviar a avaliacao.'));
    }
  }, [ratingData, ratingScore, ratingComment, submitMatchRating, setAllRead, t]);

  useFocusEffect(
    useCallback(() => {
      void setAllRead();
    }, [setAllRead]),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <FlashList
        data={notifications}
        keyExtractor={(item) => item.id}
bounces
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={(
          <View className="px-[18px]">
            <HubTopNav
              title={title}
              subtitle={t('subtitle', 'ATIVIDADE')}
              hideBack
            />

            <BaseCard className="mb-4">
              <View className="flex-row items-center gap-2 mb-3">
                <Bell size={16} color="#86E5B4" />
                <Text variant="label" className="font-semibold text-[#111827] dark:text-white">{t('account.title', 'Notificacoes da conta')}</Text>
              </View>
              {error ? <Text variant="caption" className="text-[#FCA5A5]">{error}</Text> : null}
              {loading ? <SkeletonList rows={3} /> : null}
            </BaseCard>
          </View>
        )}
        ListEmptyComponent={!loading ? (
          <View className="px-[18px]">
            <Text variant="caption" className="text-[#4B5563] dark:text-fg3">{t('empty', 'Nenhuma notificacao por enquanto.')}</Text>
          </View>
        ) : null}
        ListFooterComponent={
          <View className="px-[18px]">
            <BaseCard className="mt-1">
              <View className="flex-row items-center gap-2 mb-3">
                <CircleDot size={16} color="#D4A13A" />
                <Text variant="label" className="font-semibold text-[#111827] dark:text-white">{t('recentActions.title', 'Acoes recentes')}</Text>
              </View>

              {recentActions.length === 0 ? (
                <Text variant="caption" className="text-[#4B5563] dark:text-fg3">{t('recentActions.empty', 'Sem acoes recentes.')}</Text>
              ) : (
                <View className="gap-2">
                  {recentActions.map((action) => (
                    <View key={action.id} className="rounded-[12px] border px-3 py-3" style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}>
                      <View className="flex-row items-center justify-between">
                        <Text variant="caption" className="text-[#111827] dark:text-white font-semibold">{action.title}</Text>
                        <Text variant="micro" className="text-[#4B5563] dark:text-fg3">{toRelative(action.createdAt)}</Text>
                      </View>
                      <Text variant="micro" className="text-[#4B5563] dark:text-fg3 mt-1">{action.body}</Text>
                    </View>
                  ))}
                </View>
              )}
            </BaseCard>
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-[18px]">
            <BaseCard className="mb-3" style={{ backgroundColor: item.isRead ? matchTheme.colors.bgSurfaceA : 'rgba(34,183,108,0.08)' }}>
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1">
                  <Text variant="caption" className="text-[#111827] dark:text-white font-semibold">{item.title}</Text>
                  <Text variant="micro" className="text-[#4B5563] dark:text-fg3 mt-1">{item.body}</Text>
                </View>
                <Text variant="micro" className="text-[#4B5563] dark:text-fg3">{toRelative(item.createdAt)}</Text>
              </View>

              {item.type === 'participation_requested' && item.metadata && item.metadata.request_id ? (
                <View className="flex-row gap-2 mt-3">
                  <TouchableScale
                    className="rounded-[10px] border border-[#22B76C66] bg-[#22B76C22] px-3 py-2 flex-1"
                    onPress={() => void handleRequestAction(item.metadata!.request_id, 'accept')}
                    disabled={submitting}
                  >
                    <Text variant="micro" className="text-[#86E5B4] font-semibold text-center">{t('actions.accept', 'Aceitar')}</Text>
                  </TouchableScale>
                  <TouchableScale
                    className="rounded-[10px] border border-[#EF444466] bg-[#EF444422] px-3 py-2 flex-1"
                    onPress={() => void handleRequestAction(item.metadata!.request_id, 'reject')}
                    disabled={submitting}
                  >
                    <Text variant="micro" className="text-[#FCA5A5] font-semibold text-center">{t('actions.reject', 'Recusar')}</Text>
                  </TouchableScale>
                </View>
              ) : null}

              {item.type === 'match_rating_available' ? (
                <TouchableScale
                  className="mt-3 rounded-[10px] px-3 py-2"
                  style={{ backgroundColor: matchTheme.colors.ok }}
                  onPress={() => handleOpenRating(item)}
                >
                  <Text variant="micro" className="text-[#111827] dark:text-white font-semibold text-center">{t('actions.rateNow', 'Avaliar agora')}</Text>
                </TouchableScale>
              ) : null}
            </BaseCard>
          </View>
        )}
      />

      <MatchBottomNav active="notifications" />

      <Modal visible={ratingModalVisible} transparent animationType="fade" onRequestClose={() => setRatingModalVisible(false)}>
        <Pressable className="flex-1 bg-black/60 justify-center px-6" onPress={() => setRatingModalVisible(false)}>
          <Pressable
            className="rounded-[18px] border p-4"
            style={{
              borderColor: matchTheme.colors.lineStrong,
              backgroundColor: matchTheme.colors.bgSurfaceA,
            }}
          >
            <Text variant="label" className="font-bold text-[#111827] dark:text-white">{t('rating.modalTitle', 'Avaliar')}</Text>

            <View className="flex-row gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableScale key={star} onPress={() => setRatingScore(star)}>
                  <Star
                    size={22}
                    color={star <= ratingScore ? '#D4A13A' : theme === 'light' ? '#CBD5E1' : 'rgba(255,255,255,0.35)'}
                    fill={star <= ratingScore ? '#D4A13A' : 'transparent'}
                  />
                </TouchableScale>
              ))}
            </View>

            <TextInput
              value={ratingComment}
              onChangeText={setRatingComment}
              placeholder={t('rating.commentPlaceholder', 'Comentario opcional')}
              placeholderTextColor={matchTheme.colors.fgMuted}
              className="mt-4 min-h-[84px] rounded-[12px] border px-3 py-2"
              style={{ borderColor: matchTheme.colors.lineStrong, backgroundColor: matchTheme.colors.bgSurfaceB, color: matchTheme.colors.fgPrimary }}
              multiline
              maxLength={280}
            />

            <View className="flex-row gap-2 mt-4">
              <Button label={t('actions.cancel', 'Cancelar')} variant="ghost" className="flex-1" onPress={() => setRatingModalVisible(false)} />
              <Button label={t('actions.send', 'Enviar')} className="flex-1" loading={submitting} disabled={submitting} onPress={() => void handleSubmitRating()} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}



