import { MessageCircle, Star } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HubHeader, MatchBottomNav, MatchCard, PillTabs, SectionTitle, useMatchTheme } from '@/src/components/features/matches';
import { Button, Text } from '@/src/components/ui';
import type { Partida } from '@/src/features/matches/types';
import { useMatches } from '@/src/features/matches/hooks/useMatches';
import type { RatingTask } from '@/src/features/matches/services/matchesService';
import { getOrCreateMatchConversation } from '@/src/features/chat/services/chatService';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type AgendaTab = 'criadas' | 'marcadas' | 'pendentes';

export default function AgendaScreen() {
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
      // Fallback to conversations list if error
      router.push('/(app)/conversations');
    }
  }

  const bgColor = theme === 'light' ? '#F4F6F9' : '#05070B';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <HubHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <PillTabs
          tabs={[{ id: 'criadas', label: 'Criadas' }, { id: 'marcadas', label: 'Marcadas' }, { id: 'pendentes', label: 'Pendentes' }]}
          activeId={tab}
          onChange={(id) => setTab(id as AgendaTab)}
        />

        <View className="px-[18px]">
          {tab !== 'pendentes' && (
            <SectionTitle
              title={
                tab === 'criadas'
                  ? 'Como Anfitriao'
                  : tab === 'marcadas'
                    ? 'Como Jogador'
                    : 'Solicitacoes Pendentes'
              }
              badge={String(list.length)}
              actionText="Ver todas"
            />
          )}

          {tab !== 'pendentes' && list.map((partida) => (
            <MatchCard
              key={partida.id}
              partida={partida}
              onPress={() => router.push(`/(app)/${partida.id}`)}
              rightAction={
                tab === 'criadas' ? (
                  <Pressable
                    className="h-10 rounded-[10px] px-3 flex-row items-center"
                    style={{ backgroundColor: matchTheme.colors.ok }}
                    onPress={() => void handleChatPress(partida.id)}
                  >
                    <MessageCircle size={13} stroke="#05070B" />
                    <Text variant="caption" className="ml-1 font-semibold" style={{ color: '#05070B' }}>Chat</Text>
                  </Pressable>
                ) : undefined
              }
            />
          ))}

          {tab === 'pendentes' && (
            <View className="mt-4">
              <SectionTitle title="Avaliacoes pendentes" badge={String(agenda.ratingTasks.length)} />
              {agenda.ratingTasks.length === 0 ? (
                <View className="rounded-[16px] border px-4 py-4" style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                    Sem avaliacoes pendentes agora.
                  </Text>
                </View>
              ) : (
                <View className="gap-2">
                  {agenda.ratingTasks.map((task) => (
                    <View key={task.taskId} className="rounded-[16px] border px-4 py-3" style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}>
                      <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                        {task.actionLabel}: {task.targetUserName}
                      </Text>
                      <Text variant="micro" className="text-[#4B5563] dark:text-fg3 mt-1">{task.matchTitle} - {task.matchDate}</Text>
                      <Pressable
                        className="rounded-[10px] border border-[#22B76C66] bg-[#22B76C22] px-3 py-2 mt-3"
                        onPress={() => openRating(task)}
                      >
                        <Text variant="micro" className="font-semibold text-center" style={{ color: isLight ? '#1A7A4A' : '#86E5B4' }}>
                          Avaliar agora
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {loadingAgenda ? (
            <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
              Carregando agenda...
            </Text>
          ) : null}

          {tab === 'pendentes' && (
            <View className="mt-[14px]">
              <SectionTitle title="Solicitacoes Pendentes" badge={String(hostPendingRequests.length)} />
              {hostPendingRequests.length === 0 ? (
                <View className="rounded-[16px] border px-4 py-4" style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                    Sem solicitacoes pendentes como host.
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
                          Nota: {request.note}
                        </Text>
                      ) : null}
                      <View className="flex-row gap-2 mt-3">
                        <Pressable
                          className="rounded-[10px] border border-[#22B76C66] bg-[#22B76C22] px-3 py-2 flex-1"
                          onPress={() => void processParticipationRequest(request.id, 'accept').then(() => getHostPendingRequests())}
                        >
                          <Text variant="micro" className="font-semibold text-center" style={{ color: isLight ? '#1A7A4A' : '#86E5B4' }}>Aceitar</Text>
                        </Pressable>
                        <Pressable
                          className="rounded-[10px] border border-[#EF444466] bg-[#EF444422] px-3 py-2 flex-1"
                          onPress={() => void processParticipationRequest(request.id, 'reject').then(() => getHostPendingRequests())}
                        >
                          <Text variant="micro" className="font-semibold text-center" style={{ color: isLight ? '#B91C1C' : '#FCA5A5' }}>Recusar</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {!loadingAgenda && list.length === 0 && tab !== 'pendentes' ? (
            <View className="rounded-[16px] border px-4 py-5" style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}>
              <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                {`Nenhuma partida ${tab === 'criadas' ? 'criada' : 'marcada'} ainda.`}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

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
            <Text variant="label" className="font-bold text-[#111827] dark:text-white">Avaliar {selectedTask?.targetUserName}</Text>
            <Text variant="micro" className="text-[#4B5563] dark:text-fg3 mt-1">{selectedTask?.matchTitle}</Text>

            <View className="flex-row gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setRatingScore(star)}>
                  <Star
                    size={22}
                    color={star <= ratingScore ? '#D4A13A' : theme === 'light' ? '#CBD5E1' : 'rgba(255,255,255,0.35)'}
                    fill={star <= ratingScore ? '#D4A13A' : 'transparent'}
                  />
                </Pressable>
              ))}
            </View>

            <TextInput
              value={ratingComment}
              onChangeText={setRatingComment}
              placeholder="Comentario opcional"
              placeholderTextColor={matchTheme.colors.fgMuted}
              className="mt-4 min-h-[84px] rounded-[12px] border px-3 py-2 text-[#111827] dark:text-white"
              style={{ borderColor: matchTheme.colors.lineStrong, backgroundColor: matchTheme.colors.bgSurfaceB }}
              multiline
              maxLength={280}
            />

            <View className="flex-row gap-2 mt-4">
              <Button label="Cancelar" variant="ghost" className="flex-1" onPress={() => setRatingModalVisible(false)} />
              <Button label="Enviar" className="flex-1" loading={submitting} disabled={submitting} onPress={() => void handleSubmitRating()} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
