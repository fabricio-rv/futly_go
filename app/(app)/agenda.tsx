import { MessageCircle, Star } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { Modal, Pressable, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";

import {
  HubHeader,
  MatchBottomNav,
  MatchCard,
  SegmentedControl,
  SectionTitle,
  useMatchTheme,
} from "@/src/components/features/matches";
import {
  Button,
  SkeletonList,
  Text,
  TouchableScale,
} from "@/src/components/ui";
import type { Partida } from "@/src/features/matches/types";
import { useMatches } from "@/src/features/matches/hooks/useMatches";
import type { RatingTask } from "@/src/features/matches/services/matchesService";
import { getOrCreateMatchConversation } from "@/src/features/chat/services/chatService";
import { useAppColorScheme } from "@/src/contexts/ThemeContext";
import { useTranslation } from "@/src/i18n/hooks/useTranslation";
import { supabase } from "@/src/lib/supabase";

type AgendaTab = "criadas" | "marcadas" | "pendentes";
type AgendaListItem =
  | { type: "section"; id: string; title: string; count: number }
  | { type: "match"; id: string; partida: Partida };

function isFinishedPartida(partida: Partida) {
  if (partida.status === "done") return true;
  if (!partida.matchDate || !partida.matchTime) return false;
  const when = new Date(`${partida.matchDate}T${partida.matchTime}`);
  return when.getTime() <= Date.now();
}

export default function AgendaScreen() {
  const { t } = useTranslation("agenda");
  const matchTheme = useMatchTheme();
  const theme = useAppColorScheme();
  const isLight = theme === "light";
  const [tab, setTab] = useState<AgendaTab>("criadas");
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<RatingTask | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const {
    agenda,
    hostPendingRequests,
    getUserAgenda,
    getHostPendingRequests,
    submitMatchRating,
    processParticipationRequest,
    loadingAgenda,
    submitting,
  } = useMatches();

  useEffect(() => {
    void Promise.all([getUserAgenda(), getHostPendingRequests()]).catch(
      () => undefined,
    );
  }, [getUserAgenda, getHostPendingRequests]);

  useEffect(() => {
    const channel = supabase
      .channel(`agenda-refresh:${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "match_participation_requests" }, () => {
        void Promise.all([getUserAgenda(), getHostPendingRequests()]);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "match_participants" }, () => {
        void getUserAgenda();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [getHostPendingRequests, getUserAgenda]);

  const list: Partida[] =
    tab === "criadas"
      ? agenda.criadas
      : tab === "marcadas"
        ? agenda.marcadas
        : agenda.pendentes;
  const isPendingTab = tab === "pendentes";
  const activeMatches = useMemo(
    () => list.filter((item) => !isFinishedPartida(item)),
    [list],
  );
  const finishedMatches = useMemo(
    () => list.filter((item) => isFinishedPartida(item)),
    [list],
  );
  const agendaListItems: AgendaListItem[] = useMemo(() => {
    if (isPendingTab) return [];
    const items: AgendaListItem[] = [];

    if (activeMatches.length > 0) {
      items.push({
        type: "section",
        id: "section-active",
        title: t("sections.active", "Ativas"),
        count: activeMatches.length,
      });
      items.push(
        ...activeMatches.map((partida) => ({
          type: "match" as const,
          id: `active-${partida.id}`,
          partida,
        })),
      );
    }

    if (finishedMatches.length > 0) {
      items.push({
        type: "section",
        id: "section-finished",
        title: t("sections.finished", "Finalizadas"),
        count: finishedMatches.length,
      });
      items.push(
        ...finishedMatches.map((partida) => ({
          type: "match" as const,
          id: `finished-${partida.id}`,
          partida,
        })),
      );
    }

    return items;
  }, [activeMatches, finishedMatches, isPendingTab, t]);

  function openRating(task: RatingTask) {
    setSelectedTask(task);
    setRatingScore(5);
    setRatingComment("");
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
      router.push("/(app)/conversations");
    }
  }

  const bgColor = theme === "light" ? "#F1F5F9" : "#020617";

  const header = useMemo(
    () => (
      <View>
        <HubHeader />

        <View className="px-[18px] pb-2">
          <SegmentedControl
            options={[
              { id: "criadas", label: t("tabs.created", "Criadas") },
              { id: "marcadas", label: t("tabs.booked", "Marcadas") },
              { id: "pendentes", label: t("tabs.pending", "Pendentes") },
            ]}
            activeId={tab}
            onChange={(id) => setTab(id as AgendaTab)}
            appearance="flat"
            radius={28}
            containerColor={matchTheme.colors.bgSurfaceA}
            borderColor="rgba(34,183,108,0.35)"
          />
        </View>

        <View className="px-[18px]">
          {!isPendingTab ? <View style={{ height: 6 }} /> : null}

          {loadingAgenda ? <SkeletonList rows={2} /> : null}

          {isPendingTab ? (
            <View className="mt-4">
              <SectionTitle
                title={t("sections.pendingRatings", "Avaliacoes pendentes")}
                badge={String(agenda.ratingTasks.length)}
              />
              {agenda.ratingTasks.length === 0 ? (
                <View
                  className="rounded-[16px] border px-4 py-4"
                  style={{
                    borderColor: matchTheme.colors.line,
                    backgroundColor: matchTheme.colors.bgSurfaceA,
                  }}
                >
                  <Text
                    variant="caption"
                    style={{ color: matchTheme.colors.fgMuted }}
                  >
                    {t(
                      "empty.noPendingRatings",
                      "Sem avaliacoes pendentes agora.",
                    )}
                  </Text>
                </View>
              ) : (
                <View className="gap-2">
                  {agenda.ratingTasks.map((task) => {
                    const translateActionLabel = (label: string) => {
                      if (label.includes("jogador"))
                        return t("actionLabels.ratePlayer", "Avaliar jogador");
                      if (label.includes("host") || label.includes("anfitrião"))
                        return t("actionLabels.rateHost", "Avaliar host");
                      return label;
                    };
                    return (
                      <View
                        key={task.taskId}
                        className="rounded-[16px] border px-4 py-3"
                        style={{
                          borderColor: matchTheme.colors.line,
                          backgroundColor: matchTheme.colors.bgSurfaceA,
                        }}
                      >
                        <Text
                          variant="label"
                          className="font-semibold text-[#111827] dark:text-white"
                        >
                          {translateActionLabel(task.actionLabel)}:{" "}
                          {task.targetUserName}
                        </Text>
                        <Text
                          variant="micro"
                          className="text-[#4B5563] dark:text-fg3 mt-1"
                        >
                          {task.matchTitle} - {task.matchDate}
                        </Text>
                        <TouchableScale
                          className="rounded-[10px] border border-[#22B76C66] bg-[#22B76C22] px-3 py-2 mt-3"
                          onPress={() => openRating(task)}
                        >
                          <Text
                            variant="micro"
                            className="font-semibold text-center"
                            style={{ color: isLight ? "#1A7A4A" : "#86E5B4" }}
                          >
                            {t("actions.rateNow", "Avaliar agora")}
                          </Text>
                        </TouchableScale>
                      </View>
                    );
                  })}
                </View>
              )}

              <View className="mt-[14px]">
                <SectionTitle
                  title={t(
                    "sections.pendingRequests",
                    "Solicitacoes Pendentes",
                  )}
                  badge={String(hostPendingRequests.length)}
                />
                {hostPendingRequests.length === 0 ? (
                  <View
                    className="rounded-[16px] border px-4 py-4"
                    style={{
                      borderColor: matchTheme.colors.line,
                      backgroundColor: matchTheme.colors.bgSurfaceA,
                    }}
                  >
                    <Text
                      variant="caption"
                      style={{ color: matchTheme.colors.fgMuted }}
                    >
                      {t(
                        "empty.noPendingHostRequests",
                        "Sem solicitacoes pendentes como host.",
                      )}
                    </Text>
                  </View>
                ) : (
                  <View className="gap-2">
                    {hostPendingRequests.map((request) => (
                      <View
                        key={request.id}
                        className="rounded-[16px] border px-4 py-3"
                        style={{
                          borderColor: matchTheme.colors.line,
                          backgroundColor: matchTheme.colors.bgSurfaceA,
                        }}
                      >
                        <Text
                          variant="label"
                          className="font-semibold text-[#111827] dark:text-white"
                        >
                          {request.userName}
                        </Text>
                        <Text
                          variant="micro"
                          className="text-[#4B5563] dark:text-fg3 mt-1"
                        >
                          {request.matchTitle} -{" "}
                          {request.requestedPositionLabel}
                        </Text>
                        {request.note ? (
                          <Text
                            variant="micro"
                            className="text-[#4B5563] dark:text-fg3 mt-1"
                          >
                            {t("labels.note", "Nota")}: {request.note}
                          </Text>
                        ) : null}
                        <View className="flex-row gap-2 mt-3">
                          <TouchableScale
                            className="rounded-[10px] border border-[#22B76C66] bg-[#22B76C22] px-3 py-2 flex-1"
                            onPress={() =>
                              void processParticipationRequest(
                                request.id,
                                "accept",
                              ).then(() => Promise.all([getHostPendingRequests(), getUserAgenda()]))
                            }
                          >
                            <Text
                              variant="micro"
                              className="font-semibold text-center"
                              style={{ color: isLight ? "#1A7A4A" : "#86E5B4" }}
                            >
                              {t("actions.accept", "Aceitar")}
                            </Text>
                          </TouchableScale>
                          <TouchableScale
                            className="rounded-[10px] border border-[#EF444466] bg-[#EF444422] px-3 py-2 flex-1"
                            onPress={() =>
                              void processParticipationRequest(
                                request.id,
                                "reject",
                              ).then(() => Promise.all([getHostPendingRequests(), getUserAgenda()]))
                            }
                          >
                            <Text
                              variant="micro"
                              className="font-semibold text-center"
                              style={{ color: isLight ? "#B91C1C" : "#FCA5A5" }}
                            >
                              {t("actions.reject", "Recusar")}
                            </Text>
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
    ),
    [
      activeMatches.length,
      agenda.ratingTasks,
      finishedMatches.length,
      getHostPendingRequests,
      hostPendingRequests,
      isLight,
      isPendingTab,
      loadingAgenda,
      matchTheme.colors.bgSurfaceA,
      matchTheme.colors.fgMuted,
      matchTheme.colors.line,
      processParticipationRequest,
      t,
      tab,
    ],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <FlashList
        data={agendaListItems}
        keyExtractor={(item) => item.id}
        bounces
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={header}
        ListEmptyComponent={
          !isPendingTab &&
          !loadingAgenda &&
          activeMatches.length + finishedMatches.length === 0 ? (
            <View className="px-[18px]">
              <View
                className="rounded-[16px] border px-4 py-5"
                style={{
                  borderColor: matchTheme.colors.line,
                  backgroundColor: matchTheme.colors.bgSurfaceA,
                }}
              >
                <Text
                  variant="label"
                  style={{ color: matchTheme.colors.fgPrimary }}
                >
                  {tab === "criadas"
                    ? t(
                        "empty.noCreatedMatches",
                        "Você ainda não criou partidas. Quando criar, elas aparecem aqui.",
                      )
                    : t(
                        "empty.noBookedMatches",
                        "Você ainda não marcou partidas. Assim que entrar em uma, ela aparece aqui.",
                      )}
                </Text>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          if (item.type === "section") {
            return (
              <View className="px-[18px] pt-1 pb-1">
                <SectionTitle title={item.title} badge={String(item.count)} />
              </View>
            );
          }

          return (
            <View className="px-[18px]">
              <MatchCard
                partida={item.partida}
                onPress={() => router.push(`/(app)/${item.partida.id}`)}
                rightAction={
                  tab === "criadas" || tab === "marcadas" ? (
                    <TouchableScale
                      className="h-9 w-9 rounded-full items-center justify-center"
                      style={{ backgroundColor: "transparent" }}
                      onPress={() => void handleChatPress(item.partida.id)}
                    >
                      <MessageCircle
                        size={16}
                        color={isLight ? "#1A8F57" : "#86E5B4"}
                        strokeWidth={2.2}
                      />
                    </TouchableScale>
                  ) : undefined
                }
              />
            </View>
          );
        }}
      />

      <MatchBottomNav active="agenda" />

      <Modal
        visible={ratingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-center px-6"
          onPress={() => setRatingModalVisible(false)}
        >
          <Pressable
            className="rounded-[18px] border p-4"
            style={{
              borderColor: matchTheme.colors.lineStrong,
              backgroundColor: matchTheme.colors.bgSurfaceA,
            }}
          >
            <Text
              variant="label"
              className="font-bold text-[#111827] dark:text-white"
            >
              {t("rating.modalTitle", "Avaliar")} {selectedTask?.targetUserName}
            </Text>
            <Text variant="micro" className="text-[#4B5563] dark:text-fg3 mt-1">
              {selectedTask?.matchTitle}
            </Text>

            <View className="flex-row gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableScale key={star} onPress={() => setRatingScore(star)}>
                  <Star
                    size={22}
                    color={
                      star <= ratingScore
                        ? "#D4A13A"
                        : theme === "light"
                          ? "#CBD5E1"
                          : "rgba(255,255,255,0.35)"
                    }
                    fill={star <= ratingScore ? "#D4A13A" : "transparent"}
                  />
                </TouchableScale>
              ))}
            </View>

            <TextInput
              value={ratingComment}
              onChangeText={setRatingComment}
              placeholder={t(
                "rating.commentPlaceholder",
                "Comentário opcional",
              )}
              placeholderTextColor={matchTheme.colors.fgMuted}
              className="mt-4 min-h-[84px] rounded-[12px] border px-3 py-2 text-[#111827] dark:text-white"
              style={{
                borderColor: matchTheme.colors.lineStrong,
                backgroundColor: matchTheme.colors.bgSurfaceB,
              }}
              multiline
              maxLength={280}
            />

            <View className="flex-row gap-2 mt-4">
              <Button
                label={t("actions.cancel", "Cancelar")}
                variant="ghost"
                className="flex-1"
                onPress={() => setRatingModalVisible(false)}
              />
              <Button
                label={t("actions.send", "Enviar")}
                className="flex-1"
                loading={submitting}
                disabled={submitting}
                onPress={() => void handleSubmitRating()}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
