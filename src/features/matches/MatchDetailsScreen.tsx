import { Share2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import {
  MatchBackground,
  MatchTopNav,
  PlayerRow,
  SectionTitle,
  StatBadge,
  StatusStamp,
  useMatchTheme,
} from '@/src/components/features/matches';
import { TacticalPitch } from '@/src/components/fifa/TacticalPitch';
import { Button, Card, Screen, Text } from '@/src/components/ui';
import { useMatches } from '@/src/features/matches/hooks/useMatches';
import type { MatchDetails } from '@/src/features/matches/services/matchesService';
import { supabase } from '@/src/lib/supabase';

export function MatchDetailsScreen({ matchId }: { matchId: string }) {
  const matchTheme = useMatchTheme();
  const router = useRouter();
  const { getMatchDetails, joinMatch, leaveMatch, processParticipationRequest, loadingDetails, submitting } = useMatches();
  const [details, setDetails] = useState<MatchDetails | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const loadDetails = useCallback(async () => {
    try {
      const data = await getMatchDetails(matchId);
      setDetails(data);

      if (data.myParticipant) {
        const currentSlot = data.slots.find((slot) => slot.key === data.myParticipant?.position_key);
        setSelectedSlotIndex(currentSlot?.index ?? null);
        return;
      }

      const firstAvailable = data.slots.find((slot) => slot.open && !slot.occupied);
      setSelectedSlotIndex(firstAvailable?.index ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível carregar os detalhes da partida.';
      Alert.alert('Erro', message);
    }
  }, [getMatchDetails, matchId]);

  useEffect(() => {
    loadDetails().catch(() => undefined);
  }, [loadDetails]);

  useEffect(() => {
    const channel = supabase
      .channel(`match-details:${matchId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'match_participation_requests', filter: `match_id=eq.${matchId}` },
        () => {
          void loadDetails();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'match_participants', filter: `match_id=eq.${matchId}` },
        () => {
          void loadDetails();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDetails, matchId]);

  const selectedSlot = useMemo(() => {
    if (!details || selectedSlotIndex === null) return null;
    return details.slots.find((slot) => slot.index === selectedSlotIndex) ?? null;
  }, [details, selectedSlotIndex]);

  const occupiedIndexes = useMemo(() => {
    if (!details) return [];
    return details.slots.filter((slot) => slot.occupied).map((slot) => slot.index);
  }, [details]);

  async function handleJoin() {
    if (!details || !selectedSlot) return;

    try {
      await joinMatch({
        matchId: details.match.id,
        positionKey: selectedSlot.key,
        positionLabel: selectedSlot.label,
      });
      await loadDetails();
      Alert.alert('Solicitacao enviada', 'Seu pedido foi enviado ao host. Aguarde aprovacao.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel enviar sua solicitacao.';
      Alert.alert('Erro', message);
    }
  }

  async function handleLeave() {
    if (!details) return;

    try {
      await leaveMatch(details.match.id);
      await loadDetails();
      Alert.alert('Atualizado', details.myParticipant ? 'Voce saiu da partida.' : 'Solicitacao cancelada com sucesso.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível desmarcar presença.';
      Alert.alert('Erro', message);
    }
  }

  async function handleRequestAction(requestId: string, action: 'accept' | 'reject') {
    try {
      await processParticipationRequest(requestId, action);
      await loadDetails();
      Alert.alert('Solicitacao processada', action === 'accept' ? 'Jogador aceito na partida.' : 'Solicitacao recusada.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel processar a solicitacao.';
      Alert.alert('Erro', message);
    }
  }

  if (!details) {
    return (
      <Screen padded={false} showBackground={false}>
        <MatchBackground />
        <View className="flex-1 items-center justify-center px-6">
          <Text variant="label" style={{ color: matchTheme.colors.fgSecondary }}>
            {loadingDetails ? 'Carregando partida...' : 'Partida não encontrada.'}
          </Text>
        </View>
      </Screen>
    );
  }

  const match = details.match;
  const card = details.card;
  const availableSlots = details.slots.filter((slot) => slot.open && !slot.occupied);

  function formatPositionStats(request: MatchDetails['pendingRequests'][number]) {
    if (request.userPositionStats.length === 0) {
      return 'Sem historico de partidas registradas ainda.';
    }

    return request.userPositionStats
      .slice(0, 6)
      .map((stat) => {
        const ratingText = stat.ratingsCount > 0 && stat.avgRating !== null
          ? `${stat.avgRating.toFixed(1)} (${stat.ratingsCount} avaliacoes)`
          : 'sem avaliacoes ainda';

        return `${stat.modality.toUpperCase()} - ${stat.positionLabel}: ${stat.matchesCount} jogos - media ${ratingText}`;
      })
      .join('\n');
  }

  return (
    <Screen padded={false} showBackground={false}>
      <MatchBackground />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <MatchTopNav
          title="Detalhes"
          subtitle={`PARTIDA #${match.id.slice(0, 8).toUpperCase()}`}
          rightSlot={
            <View
              className="w-10 h-10 rounded-[14px] border items-center justify-center"
              style={{ backgroundColor: matchTheme.colors.bgSurfaceB, borderColor: matchTheme.colors.lineStrong }}
            >
              <Share2 color={matchTheme.colors.fgPrimary} size={16} />
            </View>
          }
        />

        <View className="px-[18px]">
          <LinearGradient colors={['#0F3A24', '#072314', '#021109']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="rounded-[20px] p-[18px] mb-[14px]">
            <View className="absolute top-[14px] right-[14px]">
              <StatusStamp status={card.status === 'host' ? 'host' : 'confirmed'} label={card.statusLabel} />
            </View>

            <Text variant="micro" className="uppercase tracking-[2px] font-bold" style={{ color: matchTheme.colors.okSoft }}>
              {match.modality.toUpperCase()} - {match.venue_name ?? card.title}
            </Text>
            <Text variant="number" className="text-[56px] leading-[50px] mt-1">{card.dateLabel.split(' - ')[0]}</Text>
            <View className="flex-row items-end gap-2 mt-1">
              <Text variant="number" className="text-[30px]" style={{ color: matchTheme.colors.goldA }}>{card.timeLabel}</Text>
              <Text variant="micro" className="uppercase tracking-[2px] pb-1" style={{ color: matchTheme.colors.fgSecondary }}>
                - {card.shiftLabel} - {match.duration_minutes}min
              </Text>
            </View>

            <View className="flex-row gap-2 mt-[14px] flex-wrap">
              <StatBadge label={card.levelLabel} tone={card.levelTone} small />
              <StatBadge label={`R$ ${card.pricePerPlayer}/pessoa`} tone="neutral" small />
              <StatBadge label={`${card.occupiedSlots}/${card.totalSlots} vagas`} tone="neutral" small />
              {details.isHost ? <StatBadge label="HOST" tone="gold" small /> : null}
            </View>
          </LinearGradient>

          <SectionTitle title="Posições e vagas" />
          <Card className="p-[14px]" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
            <View className="items-center">
              <TacticalPitch
                mode={(match.modality as 'futsal' | 'society' | 'campo')}
                selectedIndexes={occupiedIndexes}
                width={210}
              />
            </View>

            <View className="mt-3 gap-2">
              {details.slots.map((slot) => {
                const isAvailable = slot.open && !slot.occupied;
                const isSelected = selectedSlot?.index === slot.index;

                return (
                  <Pressable
                    key={`${slot.key}-${slot.index}`}
                    disabled={!isAvailable || !!details.myParticipant || details.isHost}
                    onPress={() => setSelectedSlotIndex(slot.index)}
                    className="rounded-[12px] border px-3 py-2"
                    style={{
                      borderColor: isSelected ? matchTheme.colors.ok : matchTheme.colors.line,
                      backgroundColor: isSelected ? matchTheme.colors.bgSurfaceB : (matchTheme.colors.bgBase === matchTheme.colors.bgSurfaceA ? 'rgba(34,183,108,0.06)' : 'rgba(255,255,255,0.02)'),
                      opacity: !isAvailable ? 0.6 : 1,
                    }}
                  >
                    <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                      {slot.label}
                    </Text>
                    <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                      {!slot.open
                        ? 'Bloqueada pelo host'
                        : slot.occupied
                          ? `Ocupada por ${slot.occupiedByName ?? 'outro atleta'}`
                          : 'Disponível'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <View className="mt-[14px]">
            <SectionTitle title="Atletas Confirmados" badge={String(details.participants.length)} />
            <Card className="p-0 overflow-hidden" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
              {details.participants.length === 0 ? (
                <View className="px-4 py-4">
                  <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                    Ainda não há atletas confirmados.
                  </Text>
                </View>
              ) : (
                details.participants.map((player) => <PlayerRow key={player.id} player={player} />)
              )}
            </Card>
          </View>

          <View className="mt-[14px] gap-2">
            {details.isHost ? (
              <Button label="Você é o host desta partida" disabled onPress={() => undefined} />
            ) : details.myParticipant ? (
              <Button label="Desmarcar Presenca" variant="destructive" loading={submitting} disabled={submitting} onPress={handleLeave} />
            ) : details.myRequest?.status === 'pending' ? (
              <>
                <Button label="Solicitacao pendente de aprovacao" disabled onPress={() => undefined} />
                <Button label="Cancelar solicitacao" variant="destructive" loading={submitting} disabled={submitting} onPress={handleLeave} />
              </>
            ) : details.myRequest?.status === 'rejected' ? (
              <Button
                label={availableSlots.length === 0 ? 'Sem vagas disponiveis' : 'Solicitar novamente'}
                loading={submitting}
                disabled={submitting || !selectedSlot || availableSlots.length === 0}
                onPress={handleJoin}
              />
            ) : (
              <Button
                label={availableSlots.length === 0 ? 'Sem vagas disponiveis' : 'Solicitar Participacao'}
                loading={submitting}
                disabled={submitting || !selectedSlot || availableSlots.length === 0}
                onPress={handleJoin}
              />
            )}

            <Button label="Voltar" variant="ghost" onPress={() => router.back()} />
          </View>

          {details.isHost ? (
            <View className="mt-[14px]">
              <SectionTitle title="Solicitacoes Pendentes" badge={String(details.pendingRequests.length)} />
              <Card className="p-0 overflow-hidden" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
                {details.pendingRequests.length === 0 ? (
                  <View className="px-4 py-4">
                    <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                      Nenhuma solicitacao pendente.
                    </Text>
                  </View>
                ) : (
                  details.pendingRequests.map((request) => (
                    <View key={request.id} className="px-4 py-3 border-b border-line">
                      <Text variant="label" className="font-semibold text-white">
                        {request.userName}
                      </Text>
                      <Text variant="micro" className="text-fg3 mt-1">
                        Posicao solicitada: {request.requestedPositionLabel}
                      </Text>
                      {request.note ? (
                        <Text variant="micro" className="text-fg3 mt-1">
                          Nota: {request.note}
                        </Text>
                      ) : null}
                      <View className="flex-row gap-2 mt-3">
                        <Pressable
                          className="rounded-[10px] border border-line px-3 py-2"
                          onPress={() =>
                            Alert.alert(
                              'Perfil do solicitante',
                              `Nome: ${request.userName}\nCidade: ${request.userCity ?? 'Nao informada'}\nPosicao solicitada: ${request.requestedPositionLabel}\n\nHistorico por posicao/modalidade:\n${formatPositionStats(request)}`,
                            )
                          }
                        >
                          <Text variant="micro" className="text-white font-semibold">Ver perfil</Text>
                        </Pressable>
                        <Pressable className="rounded-[10px] border border-[#22B76C66] bg-[#22B76C22] px-3 py-2" onPress={() => void handleRequestAction(request.id, 'accept')}>
                          <Text variant="micro" className="text-[#86E5B4] font-semibold">Aceitar</Text>
                        </Pressable>
                        <Pressable className="rounded-[10px] border border-[#EF444466] bg-[#EF444422] px-3 py-2" onPress={() => void handleRequestAction(request.id, 'reject')}>
                          <Text variant="micro" className="text-[#FCA5A5] font-semibold">Recusar</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))
                )}
              </Card>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
