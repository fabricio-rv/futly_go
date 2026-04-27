import { MessageCircle, Star } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Modal, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

import { HubHeader, MatchBottomNav, MatchCard, PillTabs, SectionTitle, useMatchTheme } from '@/src/components/features/matches';
import { Button, SkeletonList, Text, TouchableScale } from '@/src/components/ui';
import type { Partida } from '@/src/features/matches/types';
import { useMatches } from '@/src/features/matches/hooks/useMatches';
import type { RatingTask } from '@/src/features/matches/services/matchesService';
import { getOrCreateMatchConversation } from '@/src/features/chat/services/chatService';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

type AgendaTab = 'criadas' | 'marcadas' | 'pendentes';

export default function AgendaScreen() {
  const { t } = useTranslation('agenda');
  const matchTheme = useMatchTheme();
  const theme = useAppColorScheme();
  const isLight = theme === 'light';
  const [tab, setTab] = useState<AgendaTab>('criadas');
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<RatingTask | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const { agenda, hostPendingRequests, getUserAgenda, getHostPendingRequests, submitMatchRating, processParticipationRequest, loadingAgenda, submitting } = useMatches();

  useEffect(() => {
    void Promise.all([getUserAgenda(), getHostPendingRequests()]).catch(() => undefined);
  }, [getUserAgenda, getHostPendingRequests]);

  const list: Partida[] = tab === 'criadas' ? agenda.criadas : tab === 'marcadas' ? agenda.marcadas : agenda.pendentes;
  const isPendingTab = tab === 'pendentes';

  function openRating(task: RatingTask) {
    setSelectedTask(task);
    setRatingScore(5);
    setRatingComment('');
    setRatingModalVisible(true);
  }

  async function handleSubmitRating() {
    if (!selectedTask) return;

    await submitMatchRating({
      matchId: selectedTask.matchId,
      reviewedId: selectedTask.targetUserId,
      targetRole: selectedTask.targetRole,
      score: ratingScore,
      comment: ratingComment.trim() || null,
    });

    setRatingModalVisible(false);
    setSelectedTask(null);
    await getUserAgenda();
  }

  async function handleChatPress(matchId: string) {
    try {
      const conversationId = await getOrCreateMatchConversation(matchId);
      router.push(`/(app)/conversations/${conversationId}`);
    } catch {
      router.push('/(app)/conversations');
    }
  }

  const bgColor = theme === 'light' ? '#F1F5F9' : '#020617';

  const header = useMemo(() => (
    <View>
      <HubHeader />

      <PillTabs
        tabs={[{ id: 'criadas', label: t('tabs.created', 'Criadas') }, { id: 'marcadas', label: t('tabs.booked', 'Marcadas') }, { id: 'pendentes', label: t('tabs.pending', 'Pendentes') }]}
        activeId={tab}
        onChange={(id) => setTab(id as AgendaTab)}
      />

      <View className="px-[18px]">
        {!isPendingTab ? (
          <SectionTitle
            title={
              tab === 'criadas'
                ? t('sections.asHost', 'Como Anfitriao')
                : t('sections.asPlayer', 'Como Jogador')
            }
            badge={String(list.length)}
            actionText={t('actions.viewAll', 'Ver todas')}
          />
        ) : null}

        {loadingAgenda ? <SkeletonList rows={2} /> : null}

        {isPendingTab ? (
          <View className="mt-4">
            <SectionTitle title={t('sections.pendingRatings', 'Avaliacoes pendentes')} badge={String(agenda.ratingTasks.length)} />
            {agenda.ratingTasks.length === 0 ? (
              <View className="rounded-[16px] border px-4 py-4" style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}>
                <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                  {t('empty.noPendingRatings', 'Sem avaliacoes pendentes agora.')}
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {agenda.ratingTasks.map((task) => {
                  const translateActionLabel = (label: string) => {
                    if (label.includes('jogador')) return t('actionLabels.ratePlayer', 'Avaliar jogador');
                    if (label.includes('host') || label.includes('anfitrião')) return t('actionLabels.rateHost', 'Avaliar host');
                    return label;
                  };
                  return (
                  <View key={task.taskId} className="rounded-[16px] border px-4 py-3" style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}>
                    <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                      {translateActionLabel(task.actionLabel)}: {task.targetUserName}
                    </Text>
                    <Text variant="micro" className="text-[#4B5563] dark:text-fg3 mt-1">{task.matchTitle} - {task.matchDate}</Text>
                    <TouchableScale
                      className="rounded-[10px] border border-[#22B76C66] bg-[#22B76C22] px-3 py-2 mt-3"
                      onPress={() => openRating(task)}
                    >
                      <Text variant="micro" className="font-semibold text-center" style={{ color: isLight ? '#1A7A4A' : '#86E5B4' }}>
                        {t('actions.rateNow', 'Avaliar agora')}
                      </Text>
                    </TouchableScale>
                  </View>
                  );
                })}
              </View>
            )}

            <View className="mt-[14px]">
              <SectionTitle title={t('sections.pendingRequests', 'Solicitacoes Pendentes')} badge={String(hostPendingRequests.length)} />
              {hostPendingRequests.length === 0 ? (
                <View className="rounded-[16px] border px-4 py-4" style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                    {t('empty.noPendingHostRequests', 'Sem solicitacoes pendentes como host.')}
                  </Text>
                </View>
              ) : (
                <View className="gap-2">
                  {hostPendingRequests.map((request) => (
                    <View key={request.id} className="rounded-[16px] border px-4 py-3" style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}>
                      <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                        {request.userName}
                      </Text>
                      <Text variant="micro" className="text-[#4B5563] dark:text-fg3 mt-1">
                        {request.matchTitle} - {request.requestedPositionLabel}
                      </Text>
                      {request.note ? (
                        <Text variant="micro" className="text-[#4B5563] dark:text-fg3 mt-1">
                          {t('labels.note', 'Nota')}: {request.note}
                        </Text>
                      ) : null}
                      <View className="flex-row gap-2 mt-3">
                        <TouchableScale
                          className="rounded-[10px] border border-[#22B76C66] bg-[#22B76C22] px-3 py-2 flex-1"
                          onPress={() => void processParticipationRequest(request.id, 'accept').then(() => getHostPendingRequests())}
                        >
                          <Text variant="micro" className="font-semibold text-center" style={{ color: isLight ? '#1A7A4A' : '#86E5B4' }}>{t('actions.accept', 'Aceitar')}</Text>
                        </TouchableScale>
                        <TouchableScale
                          className="rounded-[10px] border border-[#EF444466] bg-[#EF444422] px-3 py-2 flex-1"
                          onPress={() => void processParticipationRequest(request.id, 'reject').then(() => getHostPendingRequests())}
                        >
                          <Text variant="micro" className="font-semibold text-center" style={{ color: isLight ? '#B91C1C' : '#FCA5A5' }}>{t('actions.reject', 'Recusar')}</Text>
                        </TouchableScale>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  ), [agenda.ratingTasks, getHostPendingRequests, hostPendingRequests, isLight, isPendingTab, list.length, loadingAgenda, matchTheme.colors.bgSurfaceA, matchTheme.colors.fgMuted, matchTheme.colors.line, processParticipationRequest, t, tab]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <FlashList
        data={isPendingTab ? [] : list}
        keyExtractor={(item) => item.id}
bounces
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={header}
        ListEmptyComponent={!isPendingTab && !loadingAgenda ? (
          <View className="px-[18px]">
            <View className="rounded-[16px] border px-4 py-5" style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}>
              <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                {tab === 'criadas' ? t('empty.noCreatedMatches', 'Nenhuma partida criada ainda.') : t('empty.noBookedMatches', 'Nenhuma partida marcada ainda.')}
              </Text>
            </View>
          </View>
        ) : null}
        renderItem={({ item }) => (
          <View className="px-[18px]">
            <MatchCard
              partida={item}
              onPress={() => router.push(`/(app)/${item.id}`)}
              rightAction={
                tab === 'criadas' ? (
                  <TouchableScale
                    className="h-10 rounded-[10px] px-3 flex-row items-center"
                    style={{ backgroundColor: matchTheme.colors.ok }}
                    onPress={() => void handleChatPress(item.id)}
                  >
                    <MessageCircle size={13} stroke="#05070B" />
                    <Text variant="caption" className="ml-1 font-semibold" style={{ color: '#05070B' }}>{t('actions.chat', 'Chat')}</Text>
                  </TouchableScale>
                ) : undefined
              }
            />
          </View>
        )}
      />

      <MatchBottomNav active="agenda" />

      <Modal visible={ratingModalVisible} transparent animationType="fade" onRequestClose={() => setRatingModalVisible(false)}>
        <Pressable className="flex-1 bg-black/60 justify-center px-6" onPress={() => setRatingModalVisible(false)}>
          <Pressable
            className="rounded-[18px] border p-4"
            style={{
              borderColor: matchTheme.colors.lineStrong,
              backgroundColor: matchTheme.colors.bgSurfaceA,
            }}
          >
            <Text variant="label" className="font-bold text-[#111827] dark:text-white">{t('rating.modalTitle', 'Avaliar')} {selectedTask?.targetUserName}</Text>
            <Text variant="micro" className="text-[#4B5563] dark:text-fg3 mt-1">{selectedTask?.matchTitle}</Text>

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
              className="mt-4 min-h-[84px] rounded-[12px] border px-3 py-2 text-[#111827] dark:text-white"
              style={{ borderColor: matchTheme.colors.lineStrong, backgroundColor: matchTheme.colors.bgSurfaceB }}
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



