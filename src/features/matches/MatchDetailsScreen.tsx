import { Share2, MapPin, Phone, Clock, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';

import {
  MatchBackground,
  MapPreviewCard,
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
  const [mapPreviewUrls, setMapPreviewUrls] = useState<string[]>([]);

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

  const locationQuery = useMemo(() => {
    if (!details) return '';
    const locationParts = [
      details.match.address,
      details.match.district,
      details.match.city,
      details.match.state,
      details.match.cep,
      'Brasil',
    ].filter(Boolean);
    return locationParts.join(', ');
  }, [details]);

  useEffect(() => {
    let cancelled = false;

    async function loadMapPreview() {
      if (!locationQuery) {
        setMapPreviewUrls([]);
        return;
      }

      try {
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(locationQuery)}`;
        const response = await fetch(geocodeUrl, {
          headers: {
            Accept: 'application/json',
          },
        });
        const payload = (await response.json()) as Array<{ lat?: string; lon?: string }>;
        const first = payload?.[0];

        if (!first?.lat || !first?.lon) {
          if (!cancelled) setMapPreviewUrls([]);
          return;
        }

        const lat = Number(first.lat);
        const lon = Number(first.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          if (!cancelled) setMapPreviewUrls([]);
          return;
        }

        const osmStaticUrl =
          `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}` +
          '&zoom=15&size=1000x420&maptype=mapnik' +
          `&markers=${lat},${lon},lightblue1`;
        const yandexStaticUrl =
          `https://static-maps.yandex.ru/1.x/?lang=pt_BR&ll=${lon},${lat}` +
          '&z=15&l=map&size=650,300' +
          `&pt=${lon},${lat},pm2rdm`;

        if (!cancelled) {
          setMapPreviewUrls([osmStaticUrl, yandexStaticUrl]);
        }
      } catch {
        if (!cancelled) {
          setMapPreviewUrls([]);
        }
      }
    }

    void loadMapPreview();

    return () => {
      cancelled = true;
    };
  }, [locationQuery]);

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

  async function handleOpenRoute() {
    if (!locationQuery) return;
    const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationQuery)}`;
    const canOpen = await Linking.canOpenURL(routeUrl);
    if (canOpen) {
      await Linking.openURL(routeUrl);
      return;
    }

    const fallback = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;
    await Linking.openURL(fallback);
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
                width={300}
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
            <SectionTitle title="Posições Disponíveis" />
            <Card className="p-4 gap-3" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
              <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                Toque para abrir / bloquear vagas
              </Text>
              {details.slots.map((slot) => {
                const blockedCount = !slot.open ? 1 : 0;
                const openCount = !slot.occupied && slot.open ? 1 : 0;
                const confirmedCount = slot.occupied ? 1 : 0;
                const isMyPosition = details.myParticipant && (details.myParticipant as any).position_key === slot.key;

                return (
                  <View
                    key={`${slot.key}-${slot.index}`}
                    className="p-3 rounded-[12px] border"
                    style={{ backgroundColor: matchTheme.colors.bgBase, borderColor: matchTheme.colors.line }}
                  >
                    <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                      {details.isHost && isMyPosition ? `Você (Host) - ${slot.label}` : slot.label}
                    </Text>
                    <View className="flex-row gap-4 mt-2">
                      <View>
                        <Text variant="micro" style={{ color: matchTheme.colors.fgMuted }}>
                          Confirmados
                        </Text>
                        <Text variant="label" style={{ color: matchTheme.colors.ok }}>
                          {confirmedCount}
                        </Text>
                      </View>
                      <View>
                        <Text variant="micro" style={{ color: matchTheme.colors.fgMuted }}>
                          Vagas abertas
                        </Text>
                        <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                          {openCount}
                        </Text>
                      </View>
                      {blockedCount > 0 && (
                        <View>
                          <Text variant="micro" style={{ color: matchTheme.colors.fgMuted }}>
                            Bloqueada
                          </Text>
                          <Text variant="label" style={{ color: matchTheme.colors.fgMuted }}>
                            {blockedCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </Card>
          </View>

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

          <View className="mt-[14px]">
            <SectionTitle title="Localizacao" />
            <MapPreviewCard
              addressLine={match.address ?? match.venue_name ?? 'Endereco nao informado'}
              districtLine={[match.district, match.city, match.state].filter(Boolean).join(' - ') || 'Local nao informado'}
              mapImageUrls={mapPreviewUrls}
              onRoutePress={() => void handleOpenRoute()}
            />
          </View>

          <View className="mt-[14px]">
            <SectionTitle title="Detalhes da Partida" />
            <Card className="p-4 gap-3" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
              <View className="gap-3">
                <View>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                    CEP
                  </Text>
                  <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                    {match.cep ?? 'Não informado'}
                  </Text>
                </View>
                <View>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                    Bairro
                  </Text>
                  <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                    {match.district ?? 'Não informado'}
                  </Text>
                </View>
                <View>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                    Nome do Campo / Quadra
                  </Text>
                  <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                    {match.venue_name ?? 'Não informado'}
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                      Estado
                    </Text>
                    <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                      {match.state ?? 'Não informado'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                      Cidade
                    </Text>
                    <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                      {match.city ?? 'Não informado'}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                    Endereço
                  </Text>
                  <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                    {match.address ?? 'Não informado'}
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          <View className="mt-[14px]">
            <SectionTitle title="Informações da Partida" />
            <Card className="p-4 gap-3" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
              <View className="gap-3">
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                      Data
                    </Text>
                    <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                      {match.match_date}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                      Horário
                    </Text>
                    <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                      {match.match_time}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                    Turno
                  </Text>
                  <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                    {match.turno?.charAt(0).toUpperCase() + match.turno?.slice(1)}
                  </Text>
                </View>
                <View>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                    Telefone para contato
                  </Text>
                  <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                    {match.contact_phone ?? 'Não informado'}
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          <View className="mt-[14px]">
            <SectionTitle title="Facilidades" />
            <Card className="p-4" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
              {Array.isArray(match.facilities) && match.facilities.length > 0 ? (
                <View className="gap-2 flex-row flex-wrap">
                  {match.facilities.map((facility: any, idx: number) => (
                    <View
                      key={`${facility.label}-${idx}`}
                      className="px-3 py-2 rounded-[10px] border"
                      style={{
                        backgroundColor: facility.selected ? matchTheme.colors.bgSurfaceB : 'transparent',
                        borderColor: facility.selected ? matchTheme.colors.ok : matchTheme.colors.line,
                      }}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: facility.selected ? matchTheme.colors.ok : matchTheme.colors.fgMuted,
                        }}
                      >
                        {facility.label}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                  Nenhuma facilidade informada
                </Text>
              )}
            </Card>
          </View>

          <View className="mt-[14px]">
            <SectionTitle title="Requisitos dos Jogadores" />
            <Card className="p-4" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
              <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }} className="mb-3">
                Níveis Mínimos Aceitos
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {['pereba', 'casual', 'resenha', 'avançado', 'competitivo', 'semi-amador', 'amador', 'ex-profissional'].map((level) => {
                  const isAccepted = Array.isArray(match.accepted_levels) && match.accepted_levels.includes(level as any);
                  return (
                    <View
                      key={level}
                      className="px-3 py-2 rounded-[10px] border"
                      style={{
                        backgroundColor: isAccepted ? matchTheme.colors.bgSurfaceB : 'transparent',
                        borderColor: isAccepted ? matchTheme.colors.ok : matchTheme.colors.line,
                      }}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: isAccepted ? matchTheme.colors.ok : matchTheme.colors.fgMuted,
                          fontWeight: isAccepted ? '600' : '400',
                        }}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          </View>

          <View className="mt-[14px]">
            <SectionTitle title="Configurações da Partida" />
            <Card className="p-4 gap-3" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
              <View className="gap-3">
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                      Valor por pessoa
                    </Text>
                    <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                      R$ {match.price_per_person}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                      Duração (min)
                    </Text>
                    <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                      {match.duration_minutes}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                    Restrições de Idade
                  </Text>
                  <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                    De {match.min_age} até {match.max_age} anos
                  </Text>
                </View>
                <View className="flex-row justify-between gap-2">
                  <View className="flex-1">
                    <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                      Tem intervalo
                    </Text>
                    <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                      {match.rest_break ? 'Sim' : 'Não'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                      Árbitro incluído
                    </Text>
                    <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                      {match.referee_included ? 'Sim' : 'Não'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                      Aceitar reservas
                    </Text>
                    <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
                      {match.allow_external_reserves ? 'Sim' : 'Não'}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {match.description ? (
            <View className="mt-[14px]">
              <SectionTitle title="Descrição" />
              <Card className="p-4" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
                <Text variant="label" style={{ color: matchTheme.colors.fgPrimary, lineHeight: 20 }}>
                  {match.description}
                </Text>
              </Card>
            </View>
          ) : null}

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
