import { Bell, CircleDot, Clock3, MessageCircle, Star, UserCheck, UserX } from 'lucide-react-native';
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
import { markChatNotificationsAsReadForConversation } from '@/src/features/notifications/services/notificationsService';
import { useMatches } from '@/src/features/matches/hooks/useMatches';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import { supabase } from '@/src/lib/supabase';

type NotificationItem = ReturnType<typeof useNotifications>['notifications'][number];

type DisplayItem = NotificationItem & {
  chatCount?: number;
  conversationId?: string;
  senderName?: string;
};

type NotificationVisual = {
  accentBg: string;
  accentBorder: string;
  accentText: string;
  iconBg: string;
  badge: string;
  icon: 'pending' | 'approved' | 'rejected' | 'rating' | 'ratingDone' | 'default';
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

    if (n.isRead) {
      continue;
    }

    const convId: string = n.metadata?.conversationId ?? n.metadata?.conversation_id ?? '';
    const senderName = String(n.metadata?.senderName ?? n.metadata?.sender_name ?? n.title ?? '').trim() || n.title;
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

function getNotificationVisual(params: {
  item: NotificationItem;
  requestStatus: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  ratingAlreadySent: boolean;
  t: (key: string, fallback: string) => string;
}): NotificationVisual {
  const { item, requestStatus, ratingAlreadySent, t } = params;

  if (item.type === 'match_rating_available') {
    if (ratingAlreadySent) {
      return {
        accentBg: 'rgba(34,183,108,0.10)',
        accentBorder: 'rgba(34,183,108,0.35)',
        accentText: '#86E5B4',
        iconBg: 'rgba(34,183,108,0.15)',
        badge: t('rating.completed', 'Avaliacao concluida'),
        icon: 'ratingDone',
      };
    }

    return {
      accentBg: 'rgba(212,161,58,0.12)',
      accentBorder: 'rgba(212,161,58,0.35)',
      accentText: '#D4A13A',
      iconBg: 'rgba(212,161,58,0.18)',
      badge: t('rating.pending', 'Avaliacao pendente'),
      icon: 'rating',
    };
  }

  if (item.type === 'participation_requested') {
    if (requestStatus === 'accepted') {
      return {
        accentBg: 'rgba(34,183,108,0.10)',
        accentBorder: 'rgba(34,183,108,0.35)',
        accentText: '#86E5B4',
        iconBg: 'rgba(34,183,108,0.15)',
        badge: t('requests.acceptedBadge', 'Participacao aprovada'),
        icon: 'approved',
      };
    }

    if (requestStatus === 'rejected') {
      return {
        accentBg: 'rgba(239,68,68,0.10)',
        accentBorder: 'rgba(239,68,68,0.35)',
        accentText: '#FCA5A5',
        iconBg: 'rgba(239,68,68,0.18)',
        badge: t('requests.rejectedBadge', 'Participacao recusada'),
        icon: 'rejected',
      };
    }

    return {
      accentBg: 'rgba(90,177,255,0.12)',
      accentBorder: 'rgba(90,177,255,0.35)',
      accentText: '#7AC0FF',
      iconBg: 'rgba(90,177,255,0.20)',
      badge: t('requests.pendingBadge', 'Aguardando decisao'),
      icon: 'pending',
    };
  }

  if (item.type === 'participation_accepted') {
    return {
      accentBg: 'rgba(34,183,108,0.10)',
      accentBorder: 'rgba(34,183,108,0.35)',
      accentText: '#86E5B4',
      iconBg: 'rgba(34,183,108,0.15)',
      badge: t('requests.acceptedBadge', 'Participacao aprovada'),
      icon: 'approved',
    };
  }

  if (item.type === 'participation_rejected') {
    return {
      accentBg: 'rgba(239,68,68,0.10)',
      accentBorder: 'rgba(239,68,68,0.35)',
      accentText: '#FCA5A5',
      iconBg: 'rgba(239,68,68,0.18)',
      badge: t('requests.rejectedBadge', 'Participacao recusada'),
      icon: 'rejected',
    };
  }

  return {
    accentBg: 'rgba(148,163,184,0.12)',
    accentBorder: 'rgba(148,163,184,0.28)',
    accentText: '#94A3B8',
    iconBg: 'rgba(148,163,184,0.20)',
    badge: 'Notificacao',
    icon: 'default',
  };
}

function NotificationIcon({ icon, color }: { icon: NotificationVisual['icon']; color: string }) {
  if (icon === 'pending') return <Clock3 size={16} color={color} />;
  if (icon === 'approved') return <UserCheck size={16} color={color} />;
  if (icon === 'rejected') return <UserX size={16} color={color} />;
  if (icon === 'rating' || icon === 'ratingDone') return <Star size={16} color={color} fill={icon === 'ratingDone' ? color : 'transparent'} />;
  return <CircleDot size={16} color={color} />;
}

export default function NotificationsScreen() {
  const { t } = useTranslation('notifications');
  const theme = useAppColorScheme();
  const matchTheme = useMatchTheme();
  const { notifications, recentActions, unreadCount, loading, error, refresh } = useNotifications();
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

      const { data, error: ratingError } = await supabase
        .from('ratings')
        .select('match_id, reviewed_id')
        .eq('reviewer_id', userId)
        .in('match_id', matchIds)
        .in('reviewed_id', targetUserIds);

      if (ratingError) return;

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

    const { data, error: requestError } = await supabase
      .from('match_participation_requests')
      .select('id,status')
      .in('id', requestIds);

    if (requestError) return;

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
      Alert.alert(
        t('common.success', 'Sucesso'),
        action === 'accept' ? t('requests.accepted', 'Solicitacao aceita!') : t('requests.rejected', 'Solicitacao recusada.'),
      );
      await loadRequestStatuses();
      await refresh();
    } catch {
      Alert.alert(t('common.error', 'Erro'), t('requests.processError', 'Nao foi possivel processar a solicitacao.'));
    }
  }, [loadRequestStatuses, processParticipationRequest, refresh, t]);

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
      t('rating.unavailableTask', 'Esta tarefa de avaliacao esta incompleta. Atualize as notificacoes e tente novamente.'),
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
      Alert.alert(t('common.success', 'Sucesso'), t('rating.sent', 'Avaliacao enviada!'));
      await refresh();
    } catch (ratingSubmitError) {
      const message = ratingSubmitError instanceof Error ? ratingSubmitError.message : t('rating.sendError', 'Nao foi possivel enviar a avaliacao.');
      Alert.alert(t('common.error', 'Erro'), message);
    }
  }, [ratingData, ratingScore, ratingComment, submitMatchRating, refresh, t, getRatingKey]);

  const openChatConversation = useCallback((conversationId?: string) => {
    if (!conversationId) {
      router.push('/(app)/conversations');
      return;
    }

    void markChatNotificationsAsReadForConversation(conversationId).catch(() => undefined);
    router.push(`/(app)/conversations/${conversationId}`);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
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
                <Text variant="label" className="font-semibold text-[#111827] dark:text-white">{t('recentActions.title', 'Acoes recentes')}</Text>
              </View>

              {recentActions.length === 0 ? (
                <Text variant="caption" className="text-[#4B5563] dark:text-fg3">{t('recentActions.empty', 'Sem acoes recentes.')}</Text>
              ) : (
                <View className="gap-2">
                  {displayedRecentActions.map((action) => {
                    const actionColor = action.type === 'rating'
                      ? '#D4A13A'
                      : action.type === 'request'
                        ? '#7AC0FF'
                        : '#86E5B4';
                    const actionBg = action.type === 'rating'
                      ? 'rgba(212,161,58,0.10)'
                      : action.type === 'request'
                        ? 'rgba(90,177,255,0.10)'
                        : 'rgba(34,183,108,0.10)';

                    return (
                      <View
                        key={action.id}
                        className="rounded-[12px] border px-3 py-3"
                        style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-2">
                            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: actionBg, alignItems: 'center', justifyContent: 'center' }}>
                              {action.type === 'rating' ? <Star size={13} color={actionColor} /> : action.type === 'request' ? <Clock3 size={13} color={actionColor} /> : <UserCheck size={13} color={actionColor} />}
                            </View>
                            <Text variant="caption" className="text-[#111827] dark:text-white font-semibold">{action.title}</Text>
                          </View>
                          <Text variant="micro" className="text-[#4B5563] dark:text-fg3">{toRelative(action.createdAt)}</Text>
                        </View>
                        <Text variant="micro" className="text-[#4B5563] dark:text-fg3 mt-1">{action.body}</Text>
                      </View>
                    );
                  })}

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
        renderItem={({ item }: { item: DisplayItem }) => {
          if (item.chatCount !== undefined) {
            const conversationType = item.metadata?.conversationType === 'private' ? 'private' : 'group';
            const conversationName = String(item.metadata?.conversationName ?? '').trim();
            const senderName = String(item.senderName ?? item.title ?? '').trim() || 'Atleta';
            const chatCount = Math.max(1, item.chatCount ?? 1);
            const countLabel = chatCount === 1
              ? t('chat.oneNewMessage', '1 nova mensagem')
              : `${chatCount} ${t('chat.manyNewMessages', 'novas mensagens')}`;
            const titleText = conversationType === 'private' ? senderName : (conversationName || senderName);
            const subtitleText = conversationType === 'private'
              ? countLabel
              : `${senderName} - ${countLabel}`;

            return (
              <View className="px-[18px]">
                <TouchableScale
                  onPress={() => openChatConversation(item.conversationId)}
                >
                  <BaseCard className="mb-3" style={{ backgroundColor: item.isRead ? matchTheme.colors.bgSurfaceA : 'rgba(34,183,108,0.08)' }}>
                    <View className="flex-row items-center gap-3">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 flex-wrap">
                          <Text variant="caption" className="text-[#111827] dark:text-white font-semibold">{titleText}</Text>
                          {conversationType === 'private' ? (
                            <View style={{ backgroundColor: 'rgba(90,177,255,0.18)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                              <Text variant="micro" style={{ color: '#7AC0FF', fontWeight: '700', fontSize: 10 }}>Privada</Text>
                            </View>
                          ) : null}
                          {chatCount > 1 ? (
                            <View style={{ backgroundColor: '#22B76C', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }}>
                              <Text variant="micro" style={{ color: '#05070B', fontWeight: '700', fontSize: 10 }}>{chatCount}</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text variant="micro" className="text-[#4B5563] dark:text-fg3 mt-0.5" numberOfLines={1}>{subtitleText}</Text>
                        <Text variant="micro" className="text-[#4B5563] dark:text-fg3 mt-0.5" numberOfLines={1}>{item.body}</Text>
                      </View>
                      <View className="items-end gap-2">
                        <Text variant="micro" className="text-[#4B5563] dark:text-fg3">{toRelative(item.createdAt)}</Text>
                        <Pressable
                          onPress={() => openChatConversation(item.conversationId)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: 'rgba(34,183,108,0.16)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: 'rgba(34,183,108,0.32)',
                          }}
                        >
                          <MessageCircle size={16} color="#22B76C" />
                        </Pressable>
                      </View>
                    </View>
                  </BaseCard>
                </TouchableScale>
              </View>
            );
          }

          const requestStatus = item.type === 'participation_requested' && item.metadata?.request_id
            ? (requestStatusById[String(item.metadata.request_id)] ?? 'pending')
            : 'pending';
          const ratingSent = item.type === 'match_rating_available' && isRatingAlreadySubmitted(item);
          const visual = getNotificationVisual({
            item,
            requestStatus,
            ratingAlreadySent: ratingSent,
            t,
          });

          const bodyText = (() => {
            if (item.type === 'match_rating_available' && ratingSent) {
              return t('rating.sentInlineBody', 'Avaliacao enviada com sucesso. Obrigado pelo feedback!');
            }

            if (item.type === 'participation_requested' && item.metadata?.request_id && requestStatus === 'accepted') {
              return t('requests.acceptedByYouInMatch', 'Voce aceitou esta solicitacao na sua partida.');
            }

            if (item.type === 'participation_requested' && item.metadata?.request_id && requestStatus === 'rejected') {
              return t('requests.rejectedByYouInMatch', 'Voce recusou esta solicitacao na sua partida.');
            }

            if (item.type === 'participation_accepted') {
              return t('requests.acceptedForRequester', 'Sua solicitacao foi aceita na partida.');
            }

            if (item.type === 'participation_rejected') {
              return t('requests.rejectedForRequester', 'Sua solicitacao foi recusada na partida.');
            }

            return item.body;
          })();

          const titleText = (() => {
            if (item.type === 'match_rating_available' && ratingSent) {
              return t('rating.sentInlineTitle', 'Avaliacao Enviada');
            }
            if (item.type === 'participation_accepted') {
              return t('requests.acceptedTitle', 'Solicitacao aprovada');
            }
            if (item.type === 'participation_rejected') {
              return t('requests.rejectedTitle', 'Solicitacao recusada');
            }
            return item.title;
          })();

          return (
            <View className="px-[18px]">
              <BaseCard className="mb-3" style={{ backgroundColor: item.isRead ? matchTheme.colors.bgSurfaceA : 'rgba(34,183,108,0.08)' }}>
                <View className="flex-row items-center gap-2 mb-2">
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: visual.iconBg, alignItems: 'center', justifyContent: 'center' }}>
                    <NotificationIcon icon={visual.icon} color={visual.accentText} />
                  </View>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: visual.accentBorder,
                      backgroundColor: visual.accentBg,
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <Text variant="micro" style={{ color: visual.accentText, fontWeight: '700', fontSize: 10 }}>
                      {visual.badge}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text variant="caption" className="text-[#111827] dark:text-white font-semibold">
                      {titleText}
                    </Text>
                    <Text variant="micro" className="text-[#4B5563] dark:text-fg3 mt-1">
                      {bodyText}
                    </Text>
                  </View>
                  <Text variant="micro" className="text-[#4B5563] dark:text-fg3">{toRelative(item.createdAt)}</Text>
                </View>

                {item.type === 'participation_requested'
                  && item.metadata?.request_id
                  && requestStatus === 'pending' ? (
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
                    ratingSent ? null : (
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
                    {t('rating.unavailableTask', 'Esta tarefa de avaliacao esta incompleta. Atualize as notificacoes e tente novamente.')}
                  </Text>
                ) : null}
              </BaseCard>
            </View>
          );
        }}
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
              placeholder={t('rating.commentPlaceholder', 'Comentario opcional')}
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
