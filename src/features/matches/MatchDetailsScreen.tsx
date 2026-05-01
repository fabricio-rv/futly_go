import { Share2, MapPin, Phone, Clock, Users } from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { showLocation } from "react-native-map-link";

import {
  MatchBackground,
  MapPreviewCard,
  MatchTopNav,
  PlayerRow,
  SectionTitle,
  StatBadge,
  StatusStamp,
  matchTheme as fixedDarkMatchTheme,
} from "@/src/components/features/matches";
import { TacticalPitch } from "@/src/components/fifa/TacticalPitch";
import { Button, Card, Screen, Text } from "@/src/components/ui";
import { useMatches } from "@/src/features/matches/hooks/useMatches";
import type { MatchDetails } from "@/src/features/matches/services/matchesService";
import { supabase } from "@/src/lib/supabase";
import { useTranslation } from "@/src/i18n/hooks/useTranslation";

export function MatchDetailsScreen({ matchId }: { matchId: string }) {
  const { t } = useTranslation("matches");
  const matchTheme = fixedDarkMatchTheme;
  const { width: screenWidth } = useWindowDimensions();
  const isLight = false;
  const router = useRouter();
  const {
    getMatchDetails,
    joinMatch,
    leaveMatch,
    processParticipationRequest,
    loadingDetails,
    submitting,
  } = useMatches();
  const [details, setDetails] = useState<MatchDetails | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(
    null,
  );
  const [mapPreviewUrls, setMapPreviewUrls] = useState<string[]>([]);
  const [mapCoordinates, setMapCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const translateStatusLabel = (label: string) => {
    if (label.includes("Criada por") || label.includes("Created by"))
      return t("statusCreatedByYou", "Criada por vocÃƒÆ’Ã‚Âª");
    if (label.includes("Finalizada") || label.includes("Finished"))
      return t("statusFinished", "Finalizada");
    if (label.includes("Vagas abertas") || label.includes("Open"))
      return t("statusOpen", "Vagas abertas");
    if (label.includes("Lotada") || label.includes("Full"))
      return t("statusFull", "Lotada");
    return label;
  };

  const translateShiftLabel = (shift: string) => {
    const shifts: Record<string, string> = {
      manha: t("shiftMorning"),
      tarde: t("shiftAfternoon"),
      noite: t("shiftNight"),
      Manha: t("shiftMorning"),
      Tarde: t("shiftAfternoon"),
      Noite: t("shiftNight"),
    };
    return shifts[shift] || shift;
  };

  const translateDayLabel = (dayLabel: string) => {
    const parts = dayLabel.split(" - ");
    if (parts.length === 2) {
      const dayAbbr = parts[0].toUpperCase();
      const shift = parts[1];
      const days: Record<string, string> = {
        SEG: t("days.mon"),
        TER: t("days.tue"),
        QUA: t("days.wed"),
        QUI: t("days.thu"),
        SEX: t("days.fri"),
        SAB: t("days.sat"),
        "SÃƒÆ’Ã‚ÂB": t("days.sat"),
        DOM: t("days.sun"),
        HOJE: "HOJE",
      };
      return `${days[dayAbbr] || dayAbbr} - ${translateShiftLabel(shift)}`;
    }
    return dayLabel;
  };
  const loadDetails = useCallback(async () => {
    try {
      const data = await getMatchDetails(matchId);
      setDetails(data);

      if (data.myParticipant) {
        const currentSlot = data.slots.find(
          (slot) => slot.key === data.myParticipant?.position_key,
        );
        setSelectedSlotIndex(currentSlot?.index ?? null);
        return;
      }

      const firstAvailable = data.slots.find(
        (slot) => slot.open && !slot.occupied,
      );
      setSelectedSlotIndex(firstAvailable?.index ?? null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("common.loadingMatch");
      Alert.alert(t("common.error"), message);
    }
  }, [getMatchDetails, matchId, t]);

  useEffect(() => {
    loadDetails().catch(() => undefined);
  }, [loadDetails]);

  useEffect(() => {
    const channelName = `match-details:${matchId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

    // Em dev (React StrictMode), o effect pode montar/desmontar rapidamente
    // e deixar um canal anterior ativo com o mesmo nome.
    // Garantimos limpeza antes de registrar callbacks + subscribe.
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_participation_requests",
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          void loadDetails();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_participants",
          filter: `match_id=eq.${matchId}`,
        },
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
    return (
      details.slots.find((slot) => slot.index === selectedSlotIndex) ?? null
    );
  }, [details, selectedSlotIndex]);

  const pendingPositionKeys = useMemo(() => {
    if (!details) return new Set<string>();
    return new Set(
      details.pendingRequests.map((request) => request.requestedPositionKey),
    );
  }, [details]);

  const pitchSpotTones = useMemo(() => {
    if (!details) return [];

    return details.slots.map((slot) => {
      if (slot.occupied) return "confirmed" as const;
      if (pendingPositionKeys.has(slot.key)) return "pending" as const;
      if (slot.open) return "available" as const;
      return "inactive" as const;
    });
  }, [details, pendingPositionKeys]);

  const mapGeocodeQueries = useMemo(() => {
    if (!details) return [] as string[];
    const build = (parts: Array<string | null | undefined>) =>
      parts.filter(Boolean).join(", ");
    const queries = [
      build([
        details.match.address,
        details.match.district,
        details.match.city,
        details.match.state,
        details.match.cep,
        "Brasil",
      ]),
      build([
        details.match.address,
        details.match.city,
        details.match.state,
        "Brasil",
      ]),
      build([
        details.match.district,
        details.match.city,
        details.match.state,
        "Brasil",
      ]),
      build([
        details.match.venue_name,
        details.match.city,
        details.match.state,
        "Brasil",
      ]),
      build([details.match.city, details.match.state, "Brasil"]),
    ].filter((q) => q.length > 0);
    return Array.from(new Set(queries));
  }, [details]);

  const locationQuery = mapGeocodeQueries[0] ?? "";

  const mapEmbedUrl = useMemo(() => {
    if (!locationQuery) return null;
    return `https://maps.google.com/maps?q=${encodeURIComponent(locationQuery)}&z=18&output=embed`;
  }, [locationQuery]);

  useEffect(() => {
    let cancelled = false;

    const fetchJson = async <T,>(url: string, source: string): Promise<T> => {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`${source} HTTP ${response.status}`);
      }
      const payload = await response.json();
      return payload as T;
    };

    async function loadMapPreview() {
      if (mapGeocodeQueries.length === 0) {
        setMapPreviewUrls([]);
        setMapCoordinates(null);
        return;
      }

      try {
        let lat: number | null = null;
        let lon: number | null = null;

        for (const query of mapGeocodeQueries) {
          try {
            const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
            const nominatimPayload = await fetchJson<
              Array<{ lat?: string; lon?: string }>
            >(nominatimUrl, "nominatim");
            const first = nominatimPayload?.[0];
            if (first?.lat && first?.lon) {
              const parsedLat = Number(first.lat);
              const parsedLon = Number(first.lon);
              if (Number.isFinite(parsedLat) && Number.isFinite(parsedLon)) {
                lat = parsedLat;
                lon = parsedLon;
                break;
              }
            }
          } catch {}

          try {
            const openMeteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=pt&format=json`;
            const openMeteoPayload = await fetchJson<{
              results?: Array<{ latitude?: number; longitude?: number }>;
            }>(openMeteoUrl, "open-meteo");
            const first = openMeteoPayload?.results?.[0];
            if (first?.latitude != null && first?.longitude != null) {
              const parsedLat = Number(first.latitude);
              const parsedLon = Number(first.longitude);
              if (Number.isFinite(parsedLat) && Number.isFinite(parsedLon)) {
                lat = parsedLat;
                lon = parsedLon;
                break;
              }
            }
          } catch {}
        }

        if (lat == null || lon == null) {
          if (!cancelled) {
            setMapPreviewUrls([]);
            setMapCoordinates(null);
          }
          return;
        }

        const zoomLevel = 18;
        const osmStaticUrl =
          `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}` +
          `&zoom=${zoomLevel}&size=1000x420&maptype=mapnik` +
          `&markers=${lat},${lon},lightblue1`;
        const yandexStaticUrl =
          `https://static-maps.yandex.ru/1.x/?lang=pt_BR&ll=${lon},${lat}` +
          `&z=${zoomLevel}&l=map&size=650,300` +
          `&pt=${lon},${lat},pm2rdm`;

        if (!cancelled) {
          setMapCoordinates({ latitude: lat, longitude: lon });
          setMapPreviewUrls([osmStaticUrl, yandexStaticUrl]);
        }
      } catch {
        if (!cancelled) {
          setMapPreviewUrls([]);
          setMapCoordinates(null);
        }
      }
    }

    void loadMapPreview();

    return () => {
      cancelled = true;
    };
  }, [mapGeocodeQueries]);

  async function handleJoin() {
    if (!details || !selectedSlot) return;

    try {
      await joinMatch({
        matchId: details.match.id,
        positionKey: selectedSlot.key,
        positionLabel: selectedSlot.label,
      });
      await loadDetails();
      Alert.alert(t("players.waiting"), t("actions.requestToJoin"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("common.error");
      Alert.alert(t("common.error"), message);
    }
  }

  async function handleLeave() {
    if (!details) return;

    try {
      await leaveMatch(details.match.id);
      await loadDetails();
      Alert.alert(
        t("actions.success"),
        details.myParticipant
          ? t("success.leftMatch")
          : t("players.requestedToJoin"),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("common.error");
      Alert.alert(t("common.error"), message);
    }
  }

  async function handleRequestAction(
    requestId: string,
    action: "accept" | "reject",
  ) {
    try {
      await processParticipationRequest(requestId, action);
      await loadDetails();
      Alert.alert(
        t("actions.success"),
        action === "accept" ? t("players.accepted") : t("players.declined"),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("common.error");
      Alert.alert(t("common.error"), message);
    }
  }

  async function handleOpenRoute() {
    if (!locationQuery) return;
    try {
      await showLocation({
        latitude: mapCoordinates?.latitude ?? undefined,
        longitude: mapCoordinates?.longitude ?? undefined,
        address: locationQuery,
        title: details?.match.venue_name ?? "Local da partida",
        dialogTitle: "Abrir com",
        dialogMessage: "Escolha o app de mapa",
        cancelText: "Cancelar",
        appsWhiteList: ["apple-maps", "google-maps", "waze"],
        alwaysIncludeGoogle: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert(
        t("common.error"),
        `NÃƒÆ’Ã‚Â£o foi possÃƒÆ’Ã‚Â­vel abrir rota: ${message}`,
      );
    }
  }

  if (!details) {
    return (
      <Screen padded={false} showBackground={false} style={{ backgroundColor: "#05070B" }}>
        <View
          pointerEvents="none"
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "#05070B" }}
        />
        <MatchBackground />
        <View className="flex-1 items-center justify-center px-6">
          <Text
            variant="label"
            style={{ color: matchTheme.colors.fgSecondary }}
          >
            {loadingDetails
              ? t("common.loadingMatch", "Carregando partida...")
              : t("details.notFound", "Partida nÃƒÆ’Ã‚Â£o encontrada.")}
          </Text>
        </View>
      </Screen>
    );
  }

  const match = details.match;
  const card = details.card;
  const availableSlots = details.slots.filter(
    (slot) => slot.open && !slot.occupied,
  );
  const heroGradient = isLight
    ? (["#1A5B33", "#0E3A23", "#082717"] as const)
    : (["#0F3A24", "#072314", "#021109"] as const);
  const matchInfoItemWidth = screenWidth >= 900 ? "25%" : "50%";
  const isCompactScreen = screenWidth <= 390;
  const heroHorizontalPadding = isCompactScreen ? 16 : 20;
  const heroVerticalPadding = isCompactScreen ? 16 : 20;
  const heroDayFontSize = isCompactScreen ? 46 : 56;
  const heroDayLineHeight = isCompactScreen ? 50 : 60;
  const heroTimeFontSize = isCompactScreen ? 26 : 30;
  const heroMetaSpacingTop = isCompactScreen ? 10 : 14;
  const matchDateLabel = (() => {
    if (!match.match_date) return t("details.notInformed", "NÃƒÆ’Ã‚Â£o informado");

    const [year, month, day] = match.match_date.split("-");
    if (!year || !month || !day) return match.match_date;

    return `${day}/${month}/${year}`;
  })();

  function formatPositionStats(
    request: MatchDetails["pendingRequests"][number],
  ) {
    if (request.userPositionStats.length === 0) {
      return t("details.noMatchHistory");
    }

    return request.userPositionStats
      .slice(0, 6)
      .map((stat) => {
        const ratingText =
          stat.ratingsCount > 0 && stat.avgRating !== null
            ? `${stat.avgRating.toFixed(1)} (${stat.ratingsCount})`
            : t("details.noRatings");

        return `${stat.modality.toUpperCase()} - ${stat.positionLabel}: ${stat.matchesCount} - ${ratingText}`;
      })
      .join("\n");
  }

  return (
    <Screen padded={false} showBackground={false} style={{ backgroundColor: "#05070B" }}>
      <View
        pointerEvents="none"
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "#05070B" }}
      />
      <MatchBackground />
      <ScrollView
        style={{ backgroundColor: "#05070B" }}
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, backgroundColor: "#05070B" }}
      >
        <MatchTopNav
          title={t("details.title")}
          subtitle={`PARTIDA #${match.id.slice(0, 8).toUpperCase()}`}
          rightSlot={
            <Pressable
              hitSlop={12}
              className="w-10 h-10 items-center justify-center"
            >
              <Share2 color={matchTheme.colors.fgPrimary} size={20} />
            </Pressable>
          }
        />

        <View
          style={{
            paddingHorizontal: isCompactScreen ? 14 : 18,
            paddingTop: 10,
          }}
        >
          {isLight ? (
            <View
              className="mb-[14px]"
              style={{
                backgroundColor: matchTheme.colors.bgSurfaceA,
                borderColor: matchTheme.colors.line,
                borderWidth: 1,
                borderRadius: 20,
                overflow: "hidden",
                paddingHorizontal: heroHorizontalPadding,
                paddingVertical: heroVerticalPadding,
              }}
            >
              <Text
                variant="micro"
                className="uppercase tracking-[2px] font-bold"
                style={{ color: "#22B76C" }}
              >
                {match.modality.toUpperCase()} -{" "}
                {match.venue_name ?? card.title}
              </Text>
              <Text
                variant="number"
                className="mt-1"
                style={{
                  color: "#111827",
                  fontSize: heroDayFontSize,
                  lineHeight: heroDayLineHeight,
                }}
              >
                {card.dateLabel.split(" - ")[0]}
              </Text>
              <View className="flex-row items-end gap-2 mt-1">
                <Text
                  variant="number"
                  style={{ color: "#D4A13A", fontSize: heroTimeFontSize }}
                >
                  {card.timeLabel}
                </Text>
                <Text
                  variant="micro"
                  className="uppercase tracking-[2px] pb-1"
                  style={{ color: "#4B5563" }}
                >
                  - {translateShiftLabel(card.shiftLabel)} -{" "}
                  {match.duration_minutes}min - {matchDateLabel}
                </Text>
              </View>

              <View
                className="flex-row gap-2 flex-wrap"
                style={{ marginTop: heroMetaSpacingTop }}
              >
                <View
                  className="h-6 px-3 rounded-full border items-center justify-center"
                  style={{
                    backgroundColor: "#E0F2FE",
                    borderColor: "#0284C7",
                    marginLeft: 6,
                  }}
                >
                  <Text
                    variant="caption"
                    className="text-[10px]"
                    style={{ color: "#0C4A6E" }}
                  >
                    {card.levelLabel}
                  </Text>
                </View>
                <View
                  className="h-6 px-3 rounded-full border items-center justify-center"
                  style={{ backgroundColor: "#F3F4F6", borderColor: "#9CA3AF" }}
                >
                  <Text
                    variant="caption"
                    className="text-[10px]"
                    style={{ color: "#111827" }}
                  >
                    R$ {card.pricePerPlayer} {t("pricePerPerson", "/pessoa")}
                  </Text>
                </View>
                <View
                  className="h-6 px-3 rounded-full border items-center justify-center"
                  style={{ backgroundColor: "#DBEAFE", borderColor: "#0284C7" }}
                >
                  <Text
                    variant="caption"
                    className="text-[10px] font-semibold"
                    style={{ color: "#0C4A6E" }}
                  >
                    {card.occupiedSlots}/{card.totalSlots} {t("details.slots")}
                  </Text>
                </View>
                {details.isHost ? (
                  <StatBadge label="HOST" tone="gold" small />
                ) : null}
              </View>
            </View>
          ) : (
            <LinearGradient
              colors={heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="mb-[14px]"
              style={{
                borderRadius: 20,
                overflow: "hidden",
                paddingHorizontal: heroHorizontalPadding,
                paddingVertical: heroVerticalPadding,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <Text
                  variant="micro"
                  numberOfLines={2}
                  className="uppercase tracking-[2px] font-bold flex-1"
                  style={{ color: matchTheme.colors.okSoft }}
                >
                  {match.modality.toUpperCase()} -{" "}
                  {match.venue_name ?? card.title}
                </Text>
                <StatusStamp
                  status={card.status === "host" ? "host" : "confirmed"}
                  label={translateStatusLabel(card.statusLabel)}
                />
              </View>
              <Text
                variant="number"
                className="mt-1"
                style={{
                  fontSize: heroDayFontSize,
                  lineHeight: heroDayLineHeight,
                }}
              >
                {translateDayLabel(card.dateLabel).split(" - ")[0]}
              </Text>
              <View className="flex-row items-end gap-2 mt-1">
                <Text
                  variant="number"
                  style={{
                    color: matchTheme.colors.goldA,
                    fontSize: heroTimeFontSize,
                  }}
                >
                  {card.timeLabel}
                </Text>
                <Text
                  variant="micro"
                  className="uppercase tracking-[2px] pb-1"
                  style={{ color: matchTheme.colors.fgSecondary }}
                >
                  - {translateShiftLabel(card.shiftLabel)} -{" "}
                  {match.duration_minutes}min - {matchDateLabel}
                </Text>
              </View>

              <View
                className="flex-row gap-2 flex-wrap"
                style={{ marginTop: heroMetaSpacingTop }}
              >
                <View
                  className="h-6 px-3 rounded-full border items-center justify-center"
                  style={{
                    backgroundColor: "rgba(90,177,255,0.14)",
                    borderColor: "rgba(90,177,255,0.35)",
                    marginLeft: 6,
                  }}
                >
                  <Text
                    variant="caption"
                    className="text-[10px]"
                    style={{ color: "#7AC0FF" }}
                  >
                    {card.levelLabel}
                  </Text>
                </View>
                <View
                  className="h-6 px-3 rounded-full border items-center justify-center"
                  style={{
                    backgroundColor: "rgba(5,7,11,0.52)",
                    borderColor: "rgba(255,255,255,0.16)",
                  }}
                >
                  <Text
                    variant="caption"
                    className="text-[10px]"
                    style={{ color: "rgba(255,255,255,0.82)" }}
                  >
                    R$ {card.pricePerPlayer} {t("pricePerPerson", "/pessoa")}
                  </Text>
                </View>
                <View
                  className="h-6 px-3 rounded-full border items-center justify-center"
                  style={{
                    backgroundColor: "rgba(5,7,11,0.52)",
                    borderColor: "rgba(255,255,255,0.16)",
                  }}
                >
                  <Text
                    variant="caption"
                    className="text-[10px]"
                    style={{ color: "rgba(255,255,255,0.82)" }}
                  >
                    {card.occupiedSlots}/{card.totalSlots} {t("details.slots")}
                  </Text>
                </View>
                {details.isHost ? (
                  <StatBadge label="HOST" tone="gold" small />
                ) : null}
              </View>
            </LinearGradient>
          )}

          <View className="mt-[18px]">
            <SectionTitle
              title={t("details.positionsAndSlots", "PosiÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes e vagas")}
            />
            <Card
              className="p-[14px]"
              style={{
                backgroundColor: matchTheme.colors.bgSurfaceA,
                borderColor: matchTheme.colors.line,
              }}
            >
              <View className="items-center">
                <TacticalPitch
                  mode={match.modality as "futsal" | "society" | "campo"}
                  spotTones={pitchSpotTones}
                  width={300}
                />
              </View>

              <View className="mt-3 gap-2">
                {details.slots.filter((slot) => slot.open).map((slot) => {
                  const isAvailable = slot.open && !slot.occupied;
                  const isSelected = selectedSlot?.index === slot.index;

                  return (
                    <Pressable
                      key={`${slot.key}-${slot.index}`}
                      disabled={
                        !isAvailable ||
                        !!details.myParticipant ||
                        details.isHost
                      }
                      onPress={() => setSelectedSlotIndex(slot.index)}
                      className="rounded-[12px] border px-3 py-2"
                      style={{
                        borderColor: isSelected
                          ? matchTheme.colors.ok
                          : matchTheme.colors.line,
                        backgroundColor: isSelected
                          ? matchTheme.colors.bgSurfaceB
                          : matchTheme.colors.bgBase ===
                              matchTheme.colors.bgSurfaceA
                            ? "rgba(34,183,108,0.06)"
                            : "rgba(255,255,255,0.02)",
                        opacity: !isAvailable ? 0.6 : 1,
                      }}
                    >
                      <Text
                        variant="label"
                        style={{ color: matchTheme.colors.fgPrimary }}
                      >
                        {slot.label}
                      </Text>
                      <Text
                        variant="caption"
                        style={{ color: matchTheme.colors.fgMuted }}
                      >
                        {!slot.open
                          ? t("details.blockedByHost", "Blocked by host")
                          : slot.occupied
                            ? `${t("details.occupiedBy", "Occupied by")} ${slot.occupiedByName ?? t("details.anotherAthlete", "another athlete")}`
                            : t("details.available", "Available")}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          </View>

          <View className="mt-[18px]">
            <SectionTitle
              title={t("details.confirmedPlayers", "Atletas Confirmados")}
              badge={String(details.participants.length)}
            />
            <Card
              className="p-0 overflow-hidden"
              style={{
                backgroundColor: matchTheme.colors.bgSurfaceA,
                borderColor: "transparent",
                borderWidth: 0,
                padding: 0,
              }}
            >
              {details.participants.length === 0 ? (
                <View className="px-4 py-4">
                  <Text
                    variant="caption"
                    style={{ color: matchTheme.colors.fgMuted }}
                  >
                    {t(
                      "details.noConfirmedPlayers",
                      "No confirmed players yet",
                    )}
                  </Text>
                </View>
              ) : (
                details.participants.map((player) => (
                  <PlayerRow key={player.id} player={player} />
                ))
              )}
            </Card>
          </View>

          <View className="mt-[18px]">
            <View className="mb-1">
              <Text
                variant="number"
                numberOfLines={1}
                style={{
                  color: matchTheme.colors.fgPrimary,
                  fontSize: 28,
                  lineHeight: 30,
                  letterSpacing: -0.3,
                }}
              >
                {match.venue_name ??
                  t("details.notInformed", "NÃƒÆ’Ã‚Â£o informado")}
              </Text>
              <Text
                variant="number"
                className="mt-1"
                style={{
                  color: isLight ? "#0F9D58" : "#66E0A3",
                  fontSize: 18,
                  lineHeight: 20,
                  letterSpacing: 0.8,
                }}
              >
                {match.cep ?? t("details.notInformed", "NÃƒÆ’Ã‚Â£o informado")}
              </Text>
            </View>

            <MapPreviewCard
              addressLine={
                match.address ??
                match.venue_name ??
                t("details.addressNotInformed")
              }
              districtLine={
                [match.district, match.city, match.state]
                  .filter(Boolean)
                  .join(" - ") ||
                t("details.locationNotInformed", "Location not provided")
              }
              mapImageUrls={mapPreviewUrls}
              mapEmbedUrl={mapEmbedUrl}
              latitude={mapCoordinates?.latitude ?? null}
              longitude={mapCoordinates?.longitude ?? null}
              showAddressFooter
              embeddedInCard
              onRoutePress={() => void handleOpenRoute()}
            />
          </View>

          <View className="mt-[18px]">
            <SectionTitle
              title={t("details.matchInfo", "InformaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes da Partida")}
            />
            <Card
              className="p-4"
              style={{
                backgroundColor: matchTheme.colors.bgSurfaceA,
                borderColor: matchTheme.colors.line,
              }}
            >
              <View
                className="flex-row flex-wrap"
                style={{ marginBottom: -12 }}
              >
                {[
                  {
                    label: t("details.contactPhone", "Telefone para contato"),
                    value:
                      match.contact_phone ??
                      t("details.notInformed", "NÃƒÆ’Ã‚Â£o informado"),
                  },
                  {
                    label: t(
                      "details.ageRestrictions",
                      "RestriÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes de idade",
                    ),
                    value: `${match.min_age} - ${match.max_age}`,
                  },
                  {
                    label: t("details.hasBreak", "Tem intervalo"),
                    value: match.rest_break
                      ? t("common.yes", "Sim")
                      : t("common.no", "NÃƒÆ’Ã‚Â£o"),
                  },
                  {
                    label: t(
                      "details.refereeIncluded",
                      "ÃƒÆ’Ã‚Ârbitro incluÃƒÆ’Ã‚Â­do",
                    ),
                    value: match.referee_included
                      ? t("common.yes", "Sim")
                      : t("common.no", "NÃƒÆ’Ã‚Â£o"),
                  },
                ].map((item, i) => (
                  <View
                    key={i}
                    style={{
                      width: matchInfoItemWidth,
                      paddingBottom: 12,
                      paddingRight: 4,
                    }}
                  >
                    <Text
                      variant="caption"
                      style={{
                        color: matchTheme.colors.fgMuted,
                        marginBottom: 2,
                      }}
                    >
                      {item.label}
                    </Text>
                    <Text
                      variant="label"
                      style={{ color: matchTheme.colors.fgPrimary }}
                    >
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>

          {match.description ? (
            <View className="mt-[18px]">
              <SectionTitle
                title={t("details.description", "DescriÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o")}
              />
              <Card
                className="p-4"
                style={{
                  backgroundColor: matchTheme.colors.bgSurfaceA,
                  borderColor: matchTheme.colors.line,
                }}
              >
                <Text
                  variant="label"
                  style={{ color: matchTheme.colors.fgPrimary, lineHeight: 20 }}
                >
                  {match.description}
                </Text>
              </Card>
            </View>
          ) : null}

          <View className="mt-[14px] gap-2">
            {details.isHost ? (
              <Button
                label={t("cta.youAreHost", "VocÃƒÆ’Ã‚Âª ÃƒÆ’Ã‚Â© o host desta partida")}
                disabled
                onPress={() => undefined}
              />
            ) : details.myParticipant ? (
              <Button
                label={t("players.leaveMatch", "Desmarcar PresenÃƒÆ’Ã‚Â§a")}
                variant="destructive"
                loading={submitting}
                disabled={submitting}
                onPress={handleLeave}
              />
            ) : details.myRequest?.status === "pending" ? (
              <>
                <Button
                  label={t(
                    "cta.pendingApproval",
                    "SolicitaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o pendente de aprovacao",
                  )}
                  disabled
                  onPress={() => undefined}
                />
                <Button
                  label={t("cta.cancelRequest", "Cancelar solicitaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o")}
                  variant="destructive"
                  loading={submitting}
                  disabled={submitting}
                  onPress={handleLeave}
                />
              </>
            ) : details.myRequest?.status === "rejected" ? (
              <Button
                label={
                  availableSlots.length === 0
                    ? t("cta.noSlots", "Sem vagas disponÃƒÆ’Ã‚Â­veis")
                    : t("cta.requestAgain", "Solicitar novamente")
                }
                loading={submitting}
                disabled={
                  submitting || !selectedSlot || availableSlots.length === 0
                }
                onPress={handleJoin}
              />
            ) : (
              <Button
                label={
                  availableSlots.length === 0
                    ? t("cta.noSlots", "Sem vagas disponÃƒÆ’Ã‚Â­veis")
                    : t("cta.requestParticipation", "Solicitar Participacao")
                }
                loading={submitting}
                disabled={
                  submitting || !selectedSlot || availableSlots.length === 0
                }
                onPress={handleJoin}
              />
            )}

            <Button
              label={t("common.back", "Voltar")}
              variant="ghost"
              onPress={() => router.back()}
            />
          </View>

          {details.isHost ? (
            <View className="mt-[14px]">
              <SectionTitle
                title={t("details.pendingRequests")}
                badge={String(details.pendingRequests.length)}
              />
              <Card
                className="p-0 overflow-hidden"
                style={{
                  backgroundColor: matchTheme.colors.bgSurfaceA,
                  borderColor: matchTheme.colors.line,
                }}
              >
                {details.pendingRequests.length === 0 ? (
                  <View className="px-4 py-4">
                    <Text
                      variant="caption"
                      style={{ color: matchTheme.colors.fgMuted }}
                    >
                      {t("details.noPendingRequests", "No pending requests")}
                    </Text>
                  </View>
                ) : (
                  details.pendingRequests.map((request) => (
                    <View
                      key={request.id}
                      className="px-4 py-3 border-b border-line"
                    >
                      <Text
                        variant="label"
                        className="font-semibold text-white"
                      >
                        {request.userName}
                      </Text>
                      <Text variant="micro" className="text-fg3 mt-1">
                        {t("details.positionRequested")}:{" "}
                        {request.requestedPositionLabel}
                      </Text>
                      {request.note ? (
                        <Text variant="micro" className="text-fg3 mt-1">
                          {t("details.note")}: {request.note}
                        </Text>
                      ) : null}
                      <View className="flex-row gap-2 mt-3">
                        <Pressable
                          className="rounded-[10px] border border-line px-3 py-2"
                          onPress={() =>
                            Alert.alert(
                              t(
                                "details.requesterProfile",
                                "Requester Profile",
                              ),
                              `${t("common.name", "Name")}: ${request.userName}\n${t("form.city")}: ${request.userCity ?? t("details.notInformed")}\n${t("details.positionRequested")}: ${request.requestedPositionLabel}\n\n${formatPositionStats(request)}`,
                            )
                          }
                        >
                          <Text
                            variant="micro"
                            className="text-white font-semibold"
                          >
                            {t("details.viewProfile", "View Profile")}
                          </Text>
                        </Pressable>
                        <Pressable
                          className="rounded-[10px] border border-[#22B76C66] bg-[#22B76C22] px-3 py-2"
                          onPress={() =>
                            void handleRequestAction(request.id, "accept")
                          }
                        >
                          <Text
                            variant="micro"
                            className="text-[#86E5B4] font-semibold"
                          >
                            {t("players.approve")}
                          </Text>
                        </Pressable>
                        <Pressable
                          className="rounded-[10px] border border-[#EF444466] bg-[#EF444422] px-3 py-2"
                          onPress={() =>
                            void handleRequestAction(request.id, "reject")
                          }
                        >
                          <Text
                            variant="micro"
                            className="text-[#FCA5A5] font-semibold"
                          >
                            {t("players.reject")}
                          </Text>
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
