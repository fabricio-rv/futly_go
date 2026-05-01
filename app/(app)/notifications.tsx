import { Bell, CircleDot, MessageCircle, Star } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Modal, Pressable, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';

import { useMatchTheme } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { BaseCard, Text, Button, SkeletonList, TouchableScale } from '@/src/components/ui';
import { useNotifications } from '@/src/features/notifications/hooks/useNotifications';
import { useMatches } from '@/src/features/matches/hooks/useMatches';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import { supabase } from '@/src/lib/supabase';

type NotificationItem = ReturnType<typeof useNotifications>['notifications'][number];

type DisplayItem = NotificationItem & {
  chatCount?: number;
  conversationId?: string;
  senderName?: string;
};

function isChatNotif(n: NotificationItem) {
  return n.metadata?.kind === 'chat_message';
}

function groupNotifications(notifications: NotificationItem[]): DisplayItem[] {
  const result: DisplayItem[] = [];
  const chatSeen = new Map<string, number>();

  for (const n of notifications) {
    if (!isChatNotif(n)) {
      result.push(n);
      continue;
    }

    const convId: string = n.metadata?.conversationId ?? n.metadata?.conversation_id ?? '';
    // title é o nome do remetente (definido pelo trigger no DB)
    const senderName: string = n.title;
    const key = `${convId}:${senderName}`;

    if (chatSeen.has(key)) {
      const idx = chatSeen.get(key)!;
      result[idx] = { ...result[idx], chatCount: (result[idx].chatCount ?? 1) + 1 };
    } else {
      chatSeen.set(key, result.length);
      result.push({ ...n, chatCount: 1, conversationId: convId || undefined, senderName });
    }
  }

  return result;
}

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
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingData, setRatingData] = useState<{ matchId: string; targetUserId: string; targetRole: 'creator' | 'player' } | null>(null);
  const [showAllRecentActions, setShowAllRecentActions] = useState(false);
  const [submittedRatingKeys, setSubmittedRatingKeys] = useState<Set<string>>(new Set());
  const [requestStatusById, setRequestStatusById] = useState<Record<string, 'pending' | 'accepted' | 'rejected' | 'cancelled'>>({});

  const title = useMemo(() => `${t('title', 'Notificacoes')} ${unreadCount > 0 ? `(${unreadCount})` : ''}`.trim(), [unreadCount, t]);
  const displayNotifications = useMemo(() => groupNotifications(notifications), [notifications]);
  const displayedRecentActions = useMemo(
    () => (showAllRecentActions ? recentActions : recentActions.slice(0, 3)),
    [recentActions, showAllRecentActions],
  );
  const bgColor = theme === 'light' ? '#F1F5F9' : '#020617';
  const getRatingKey = useCallback((matchId?: string | null, targetUserId?: string | null) => {
    if (!matchId || !targetUserId) return null;
    return `${matchId}:${targetUserId}`;
  }, []);
  const isRatingAlreadySubmitted = useCallback((item: NotificationItem) => {
    const key = getRatingKey(item.metadata?.match_id, item.metadata?.target_user_id);
    return Boolean(key && submittedRatingKeys.has(key));
  }, [getRatingKey, submittedRatingKeys]);

  useEffect(() => {
    let active = true;

    const loadSubmittedRatings = async () => {
      const ratingNotifications = notifications.filter(
        (item) => item.type === 'match_rating_available' && item.metadata?.match_id && item.metadata?.target_user_id,
      );

      if (ratingNotifications.length === 0) {
        if (active) setSubmittedRatingKeys(new Set());
        return;
      }

      const matchIds = Array.from(new Set(ratingNotifications.map((item) => String(item.metadata?.match_id))));
      const targetUserIds = Array.from(new Set(ratingNotifications.map((item) => String(item.metadata?.target_user_id))));

      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) {
        if (active) setSubmittedRatingKeys(new Set());
        return;
      }

      const { data, error } = await supabase
        .from('ratings')
        .select('match_id, reviewed_id')
        .eq('reviewer_id', userId)
        .in('match_id', matchIds)
        .in('reviewed_id', targetUserIds);

      if (error) return;

      const keys = new Set<string>();
      for (const row of data ?? []) {
        const key = getRatingKey(row.match_id, row.reviewed_id);
        if (key) keys.add(key);
      }

      if (active) setSubmittedRatingKeys(keys);
    };

    void loadSubmittedRatings();
    return () => {
      active = false;
    };
  }, [notifications, getRatingKey]);

  const loadRequestStatuses = useCallback(async () => {
    const requestIds = notifications
      .filter((item) => item.type === 'participation_requested' && typeof item.metadata?.request_id === 'string')
      .map((item) => String(item.metadata?.request_id));
    if (requestIds.length === 0) {
      setRequestStatusById({});
      return;
    }
    const { data, error } = await supabase
      .from('match_participation_requests')
      .select('id,status')
      .in('id', requestIds);
    if (error) return;
    const next: Record<string, 'pending' | 'accepted' | 'rejected' | 'cancelled'> = {};
    for (const row of data ?? []) {
      next[String(row.id)] = String(row.status) as 'pending' | 'accepted' | 'rejected' | 'cancelled';
    }
    setRequestStatusById(next);
  }, [notifications]);

  useEffect(() => {
    void loadRequestStatuses();
  }, [loadRequestStatuses]);

  const handleRequestAction = useCallback(async (requestId: string, action: 'accept' | 'reject') => {
    try {
      await processParticipationRequest(requestId, action);
      Alert.alert(t('common.success', 'Sucesso'), action === 'accept' ? t('requests.accepted', 'Solicitação aceita!') : t('requests.rejected', 'Solicitação recusada.'));
      await loadRequestStatuses();
      await setAllRead();
    } catch {
      Alert.alert(t('common.error', 'Erro'), t('requests.processError', 'Não foi possível processar a solicitação.'));
    }
  }, [loadRequestStatuses, processParticipationRequest, setAllRead, t]);

  const handleOpenRating = useCallback((notif: NotificationItem) => {
    if (notif.metadata?.match_id && notif.metadata?.target_user_id) {
      setRatingData({
        matchId: notif.metadata.match_id,
        targetUserId: notif.metadata.target_user_id,
        targetRole: notif.metadata.target_role || 'player',
      });
      setRatingScore(0);
      setRatingComment('');
      setRatingModalVisible(true);
      return;
    }
    Alert.alert(
      t('common.error', 'Erro'),
      t('rating.unavailableTask', 'Esta tarefa de avaliação está incompleta. Atualize as notificações e tente novamente.'),
    );
  }, [t]);

  const handleSubmitRating = useCallback(async () => {
    if (!ratingData) return;
    if (ratingScore <= 0) {
      Alert.alert(t('common.error', 'Erro'), t('rating.chooseScore', 'Escolha uma nota antes de enviar.'));
      return;
    }

    try {
      await submitMatchRating({
        matchId: ratingData.matchId,
        reviewedId: ratingData.targetUserId,
        targetRole: ratingData.targetRole,
        score: ratingScore,
        comment: ratingComment.trim() || null,
      });
      setSubmittedRatingKeys((prev) => {
        const next = new Set(prev);
        const key = getRatingKey(ratingData.matchId, ratingData.targetUserId);
        if (key) next.add(key);
        return next;
      });
      setRatingModalVisible(false);
      Alert.alert(t('common.success', 'Sucesso'), t('rating.sent', 'Avaliação enviada!'));
      await setAllRead();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('rating.sendError', 'Não foi possível enviar a avaliação.');
      Alert.alert(t('common.error', 'Erro'), message);
    }
  }, [ratingData, ratingScore, ratingComment, submitMatchRating, setAllRead, t, getRatingKey]);

  useFocusEffect(
    useCallback(() => {
      void setAllRead();
    }, [setAllRead]),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <FlashList
        data={displayNotifications}
        keyExtractor={(item) => item.conversationId ? `chat:${item.conversationId}:${item.id}` : item.id}
bounces
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={(
          <View className="px-[18px]">
            <View className="pt-1 pb-2">
              <HubTopNav
                title={title}
                plainBack
                centerNode={(
                  <View className="flex-row items-center gap-2 py-0.5">
                    <Bell size={16} color="#86E5B4" />
                    <Text variant="body" className="font-semibold text-[#111827] dark:text-white">
                      {title}
                    </Text>
                  </View>
                )}
              />
            </View>

            {error ? <Text variant="caption" className="text-[#FCA5A5] mb-3">{error}</Text> : null}
            {loading ? <SkeletonList rows={3} /> : null}
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
                <Text variant="label" className="font-semibold text-[#111827] dark:text-white">{t('recentActions.title', 'Ações recentes')}</Text>
              </View>

              {recentActions.length === 0 ? (
                <Text variant="caption" className="text-[#4B5563] dark:text-fg3">{t('recentActions.empty', 'Sem ações recentes.')}</Text>
              ) : (
                <View className="gap-2">
                  {displayedRecentActions.map((action) => (
                    <View key={action.id} className="rounded-[12px] border px-3 py-3" style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}>
                      <View className="flex-row items-center justify-between">
                        <Text variant="caption" className="text-[#111827] dark:text-white font-semibold">{action.title}</Text>
                        <Text variant="micro" className="text-[#4B5563] dark:text-fg3">{toRelative(action.createdAt)}</Text>
                      </View>
                      <Text variant="micro" className="text-[#4B5563] dark:text-fg3 mt-1">{action.body}</Text>
                    </View>
                  ))}
                  {recentActions.length > 3 ? (
                    <TouchableScale
                      className="mt-1 rounded-[10px] border px-3 py-2"
                      style={{ borderColor: matchTheme.colors.lineStrong, backgroundColor: matchTheme.colors.bgSurfaceB }}
                      onPress={() => setShowAllRecentActions((prev) => !prev)}
                    >
                      <Text variant="micro" className="text-center font-semibold" style={{ color: '#86E5B4' }}>
                        {showAllRecentActions ? t('recentActions.showLess', 'Ver menos') : t('recentActions.showMore', 'Ver mais')}
                      </Text>
                    </TouchableScale>
                  ) : null}
                </View>
              )}
            </BaseCard>
          </View>
        }
        renderItem={({ item }: { item: DisplayItem }) => (
          <View className="px-[18px]">
            {item.chatCount !== undefined ? (
              <TouchableScale
                onPress={() => item.conversationId ? router.push(`/(app)/conversations/${item.conversationId}`) : router.push('/(app)/conversations')}
              >
                <BaseCard className="mb-3" style={{ backgroundColor: item.isRead ? matchTheme.colors.bgSurfaceA : 'rgba(34,183,108,0.08)' }}>
                  <View className="flex-row items-center gap-3">
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(34,183,108,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageCircle size={18} color="#22B76C" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 flex-wrap">
                        <Text variant="caption" className="text-[#111827] dark:text-white font-semibold">{item.senderName}</Text>
                        {item.metadata?.conversationType === 'private' ? (
                          <View style={{ backgroundColor: 'rgba(90,177,255,0.18)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                            <Text variant="micro" style={{ color: '#7AC0FF', fontWeight: '700', fontSize: 10 }}>Privada</Text>
                          </View>
                        ) : item.metadata?.conversationName ? (
                          <Text variant="micro" className="text-[#4B5563] dark:text-fg3" numberOfLines={1}>{item.metadata.conversationName}</Text>
                        ) : null}
                        {(item.chatCount ?? 0) > 1 ? (
                          <View style={{ backgroundColor: '#22B76C', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }}>
                            <Text variant="micro" style={{ color: '#05070B', fontWeight: '700', fontSize: 10 }}>{item.chatCount}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text variant="micro" className="text-[#4B5563] dark:text-fg3 mt-0.5" numberOfLines={1}>{item.body}</Text>
                    </View>
                    <Text variant="micro" className="text-[#4B5563] dark:text-fg3">{toRelative(item.createdAt)}</Text>
                  </View>
                </BaseCard>
              </TouchableScale>
            ) : (
              <BaseCard className="mb-3" style={{ backgroundColor: item.isRead ? matchTheme.colors.bgSurfaceA : 'rgba(34,183,108,0.08)' }}>
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text variant="caption" className="text-[#111827] dark:text-white font-semibold">
                      {item.type === 'match_rating_available' && isRatingAlreadySubmitted(item)
                        ? t('rating.sentInlineTitle', 'Avaliação Enviada')
                        : item.type === 'participation_accepted'
                          ? t('requests.acceptedTitle', 'Solicitação aprovada')
                          : item.type === 'participation_rejected'
                            ? t('requests.rejectedTitle', 'Solicitação recusada')
                            : item.title}
                    </Text>
                    <Text variant="micro" className="text-[#4B5563] dark:text-fg3 mt-1">
                      {item.type === 'match_rating_available' && isRatingAlreadySubmitted(item)
                        ? t('rating.sentInlineBody', 'Avaliação Enviada com sucesso. Obrigado pelo feedback!')
                        : item.type === 'participation_requested' && item.metadata?.request_id && requestStatusById[String(item.metadata.request_id)] === 'accepted'
                          ? t('requests.acceptedByYouInMatch', 'Você aceitou esta solicitação na sua partida.')
                          : item.type === 'participation_requested' && item.metadata?.request_id && requestStatusById[String(item.metadata.request_id)] === 'rejected'
                            ? t('requests.rejectedByYouInMatch', 'Você recusou esta solicitação na sua partida.')
                            : item.type === 'participation_accepted'
                              ? t('requests.acceptedForRequester', 'Sua solicitação foi aceita na partida.')
                              : item.type === 'participation_rejected'
                                ? t('requests.rejectedForRequester', 'Sua solicitação foi recusada na partida.')
                        : item.body}
                    </Text>
                  </View>
                  <Text variant="micro" className="text-[#4B5563] dark:text-fg3">{toRelative(item.createdAt)}</Text>
                </View>

                {item.type === 'participation_requested'
                  && item.metadata?.request_id
                  && (requestStatusById[String(item.metadata.request_id)] ?? 'pending') === 'pending' ? (
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
                  item.metadata?.match_id && item.metadata?.target_user_id ? (
                    isRatingAlreadySubmitted(item) ? null : (
                    <TouchableScale
                      className="mt-3 rounded-[10px] px-3 py-2"
                      style={{ backgroundColor: matchTheme.colors.ok }}
                      onPress={() => handleOpenRating(item)}
                    >
                      <Text variant="micro" className="text-[#111827] dark:text-white font-semibold text-center">{t('actions.rateNow', 'Avaliar agora')}</Text>
                    </TouchableScale>
                    )
                  ) : null
                ) : null}

                {item.type === 'match_rating_available' && (!item.metadata?.match_id || !item.metadata?.target_user_id) ? (
                  <Text variant="micro" className="mt-2 text-[#4B5563] dark:text-fg3">
                    {t('rating.unavailableTask', 'Esta tarefa de avaliação está incompleta. Atualize as notificações e tente novamente.')}
                  </Text>
                ) : null}
              </BaseCard>
            )}
          </View>
        )}
      />

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
              placeholder={t('rating.commentPlaceholder', 'Comentário opcional')}
              placeholderTextColor={matchTheme.colors.fgMuted}
              className="mt-4 min-h-[84px] rounded-[12px] border px-3 py-2"
              style={{ borderColor: matchTheme.colors.lineStrong, backgroundColor: matchTheme.colors.bgSurfaceB, color: matchTheme.colors.fgPrimary }}
              multiline
              maxLength={280}
            />

            <View className="flex-row gap-2 mt-4">
              <View className="flex-1">
                <Button
                  label={t('actions.back', 'Voltar')}
                  variant="ghost"
                  onPress={() => setRatingModalVisible(false)}
                />
              </View>
              <View className="flex-1">
                <Button
                  label={t('actions.send', 'Enviar')}
                  loading={submitting}
                  disabled={submitting || ratingScore <= 0}
                  onPress={() => void handleSubmitRating()}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

