import { supabase } from "@/src/lib/supabase";
import {
  MATCH_POSITIONS,
  type MatchLevel,
  type MatchModality,
  type MatchTurno,
} from "@/src/features/matches/constants";
import {
  getMatchSlotMetrics,
  mapMatchRowToPartida,
} from "@/src/features/matches/mappers";
import type { Jogador, Partida } from "@/src/features/matches/types";
import {
  fetchUsersPositionStats,
  type UserPositionStat,
} from "@/src/features/profile/services/profileService";
import type { Tables, TablesInsert } from "@/src/types/database";
import { sendMatchCreatedEmail } from "@/src/features/email/resendService";

export type CreateMatchInput = {
  title: string;
  description: string;
  modality: MatchModality;
  matchDate: string;
  matchTime: string;
  turno: MatchTurno;
  durationMinutes: number;
  pricePerPerson: number;
  minAge: number;
  maxAge: number;
  acceptedLevels: MatchLevel[];
  allowExternalReserves: boolean;
  restBreak: boolean;
  refereeIncluded: boolean;
  contactPhone: string | null;
  venueName: string | null;
  cep: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  selectedPositionIndexes: number[];
  status?: "publicada" | "rascunho";
  facilities?: Array<{ label: string; selected: boolean }>;
};

export type AvailableMatchesFilters = {
  query?: string;
  city?: string;
  state?: string;
  turno?: MatchTurno;
  modality?: MatchModality;
  maxPrice?: number;
};

export type RatingTask = {
  taskId: string;
  matchId: string;
  matchTitle: string;
  matchDate: string;
  targetUserId: string;
  targetUserName: string;
  targetRole: "creator" | "player";
  actionLabel: string;
};

export type AgendaResult = {
  criadas: Partida[];
  marcadas: Partida[];
  pendentes: Partida[];
  ratingTasks: RatingTask[];
};

type MatchRow = Tables<"matches">;
type ParticipantRow = Tables<"match_participants">;
type ProfileRow = Tables<"profiles">;
type ParticipationRequestRow = Tables<"match_participation_requests">;

export type PendingMatchRequest = {
  id: string;
  userId: string;
  userName: string;
  userCity: string | null;
  userPositionStats: UserPositionStat[];
  requestedPositionKey: string;
  requestedPositionLabel: string;
  note: string | null;
  createdAt: string;
  status: ParticipationRequestRow["status"];
};

export type MatchSlot = {
  index: number;
  key: string;
  label: string;
  open: boolean;
  occupied: boolean;
  occupiedByUserId: string | null;
  occupiedByName: string | null;
};

export type MatchDetails = {
  match: MatchRow;
  card: Partida;
  slots: MatchSlot[];
  participants: Jogador[];
  isHost: boolean;
  myParticipant: ParticipantRow | null;
  myRequest: ParticipationRequestRow | null;
  pendingRequests: PendingMatchRequest[];
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user)
    throw new Error("Faça login novamente para continuar.");
  return data.user.id;
}

function getGradientById(id: string): [string, string] {
  const palettes: Array<[string, string]> = [
    ["#1B3A5F", "#071428"],
    ["#5A3018", "#2A160A"],
    ["#6C7487", "#20242E"],
    ["#3F7D58", "#173023"],
    ["#7E4B8D", "#2F1B35"],
    ["#C69745", "#3A2A0B"],
  ];

  const code = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palettes[code % palettes.length];
}

function toInitials(name: string | null | undefined) {
  const value = (name ?? "").trim();
  if (!value) return "AT";

  const parts = value.split(" ").filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "AT"
  );
}

function normalizeSlots(
  modality: MatchModality,
  formationJson: unknown,
): MatchSlot[] {
  const modalitySlots = MATCH_POSITIONS[modality];
  const defaults = modalitySlots.map((slot, index) => ({
    index,
    key: slot.key,
    label: slot.label,
    open: true,
    occupied: false,
    occupiedByUserId: null,
    occupiedByName: null,
  }));

  if (!formationJson || typeof formationJson !== "object") {
    return defaults;
  }

  const rawSlots = (formationJson as { slots?: unknown[] }).slots;
  if (!Array.isArray(rawSlots)) return defaults;

  const parsedRawSlots: Array<{ index: number; key: string; open: boolean }> =
    [];

  for (const item of rawSlots) {
    if (!item || typeof item !== "object") continue;
    const row = item as {
      index?: unknown;
      key?: unknown;
      label?: unknown;
      open?: unknown;
    };

    if (typeof row.index !== "number" || typeof row.key !== "string") continue;

    parsedRawSlots.push({
      index: row.index,
      key: row.key.trim().toUpperCase(),
      open: row.open !== false,
    });
  }

  if (parsedRawSlots.length === 0) return defaults;

  const validKeys = new Set(
    modalitySlots.map((slot) => slot.key.toUpperCase()),
  );
  const keyMatches = parsedRawSlots.filter((slot) =>
    validKeys.has(slot.key),
  ).length;
  const canUseIndexMapping =
    keyMatches === 0 && parsedRawSlots.length === modalitySlots.length;

  const rawByKey = new Map(parsedRawSlots.map((slot) => [slot.key, slot]));
  const rawByIndex = new Map(parsedRawSlots.map((slot) => [slot.index, slot]));

  return modalitySlots.map((slot, index) => {
    const slotKey = slot.key.toUpperCase();
    const rawByMatchedKey = rawByKey.get(slotKey);
    const rawByMatchedIndex = canUseIndexMapping
      ? rawByIndex.get(index)
      : undefined;
    const rawMatch = rawByMatchedKey ?? rawByMatchedIndex;

    return {
      index,
      key: slot.key,
      label: slot.label,
      open: rawMatch ? rawMatch.open : true,
      occupied: false,
      occupiedByUserId: null,
      occupiedByName: null,
    };
  });
}

function buildFormationJson(
  modality: MatchModality,
  selectedIndexes: number[],
) {
  const allSlots = MATCH_POSITIONS[modality];
  const selectedSet = new Set(selectedIndexes);

  return {
    mode: modality,
    slots: allSlots.map((slot, index) => ({
      key: slot.key,
      label: slot.label,
      open: selectedSet.has(index),
      index,
    })),
  };
}

async function getOccupiedSlotsByMatchIds(matchIds: string[]) {
  if (matchIds.length === 0) return new Map<string, number>();

  const { data, error } = await supabase
    .from("match_participants")
    .select("match_id,status")
    .in("match_id", matchIds)
    .eq("status", "confirmado");

  if (error) throw new Error("Não foi possível carregar os participantes.");

  const counts = new Map<string, number>();

  for (const row of data) {
    counts.set(row.match_id, (counts.get(row.match_id) ?? 0) + 1);
  }

  return counts;
}

function sortByScheduleAsc(a: MatchRow, b: MatchRow) {
  const aTime = new Date(`${a.match_date}T${a.match_time}`).getTime();
  const bTime = new Date(`${b.match_date}T${b.match_time}`).getTime();
  return aTime - bTime;
}

function getFilledSlotsCount(match: MatchRow, confirmedParticipants: number) {
  const { totalSlots, openSlots } = getMatchSlotMetrics(match.formation_json);
  const availableSlots = Math.max(openSlots - confirmedParticipants, 0);
  return Math.min(totalSlots, Math.max(totalSlots - availableSlots, 0));
}

async function getMatchById(matchId: string) {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();
  if (error || !data) throw new Error("Partida não encontrada.");
  return data;
}

async function getParticipantsWithProfiles(matchId: string) {
  const { data, error } = await supabase
    .from("match_participants")
    .select(
      "id,match_id,user_id,position_key,position_label,status,is_host,joined_at,updated_at",
    )
    .eq("match_id", matchId)
    .eq("status", "confirmado");

  if (error) throw new Error("Não foi possível carregar participantes.");

  const participants = (data ?? []) as ParticipantRow[];
  const userIds = participants.map((item) => item.user_id);

  let profiles: ProfileRow[] = [];
  if (userIds.length > 0) {
    const { data: profileRows, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    if (profileError)
      throw new Error("Não foi possível carregar perfis dos participantes.");
    profiles = (profileRows ?? []) as ProfileRow[];
  }

  const profileById = new Map<string, ProfileRow>();
  for (const profile of profiles) {
    profileById.set(profile.id, profile);
  }

  return { participants, profileById };
}

async function getPendingRequests(matchId: string) {
  const { data, error } = await supabase
    .from("match_participation_requests")
    .select(
      "id,match_id,user_id,requested_position_key,requested_position_label,note,status,created_at,updated_at,decision_by,decision_reason,decided_at",
    )
    .eq("match_id", matchId)
    .in("status", ["pending", "accepted", "rejected"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Não foi possível carregar solicitacoes desta partida.");
  }

  return (data ?? []) as ParticipationRequestRow[];
}

export async function createMatch(input: CreateMatchInput) {
  const userId = await getCurrentUserId();

  const formationJson = buildFormationJson(
    input.modality,
    input.selectedPositionIndexes,
  );
  const facilities = (input.facilities ?? []).map((item) => ({
    label: item.label,
    selected: item.selected,
  }));

  const payload: TablesInsert<"matches"> = {
    created_by: userId,
    title: input.title,
    description: input.description || null,
    modality: input.modality,
    match_date: input.matchDate,
    match_time: input.matchTime,
    turno: input.turno,
    duration_minutes: input.durationMinutes,
    price_per_person: input.pricePerPerson,
    min_age: input.minAge,
    max_age: input.maxAge,
    accepted_levels: input.acceptedLevels,
    allow_external_reserves: input.allowExternalReserves,
    rest_break: input.restBreak,
    referee_included: input.refereeIncluded,
    contact_phone: input.contactPhone,
    venue_name: input.venueName,
    cep: input.cep,
    district: input.district,
    city: input.city,
    state: input.state,
    address: input.address,
    formation_json: formationJson,
    facilities,
    status: input.status ?? "publicada",
  };

  const { data: match, error } = await supabase
    .from("matches")
    .insert(payload)
    .select("*")
    .single();

  if (error || !match) {
    if (error?.code === "23505") {
      throw new Error(
        "Você já criou uma partida igual para esse mesmo horário.",
      );
    }

    throw new Error("Não foi possível criar a partida.");
  }

  const hostSlot = MATCH_POSITIONS[input.modality][0];
  const { error: participantError } = await supabase
    .from("match_participants")
    .insert({
      match_id: match.id,
      user_id: userId,
      is_host: true,
      status: "confirmado",
      position_key: hostSlot.key,
      position_label: hostSlot.label,
    });

  if (participantError) {
    await supabase.from("matches").delete().eq("id", match.id);
    throw new Error(
      "Não foi possível registrar o host da partida. Tente novamente.",
    );
  }

  // Enviar email de confirmação ao host
  const { data: hostProfile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  if (hostProfile?.email) {
    const date = new Date(match.match_date).toLocaleDateString("pt-BR");
    await sendMatchCreatedEmail(
      hostProfile.email,
      hostProfile.full_name || "Host",
      match.title,
      date,
      match.match_time,
    ).catch(() => undefined);
  }

  return match;
}

export async function fetchAvailableMatches(
  filters: AvailableMatchesFilters = {},
) {
  const currentUserId = await getCurrentUserId();

  let query = supabase
    .from("matches")
    .select("*")
    .in("status", ["publicada", "rascunho"])
    .gte("match_date", new Date().toISOString().slice(0, 10));

  if (filters.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters.state) query = query.eq("state", filters.state);
  if (filters.turno) query = query.eq("turno", filters.turno);
  if (filters.modality) query = query.eq("modality", filters.modality);
  if (typeof filters.maxPrice === "number")
    query = query.lte("price_per_person", filters.maxPrice);

  const { data, error } = await query;

  if (error) {
    throw new Error("Não foi possível listar partidas disponíveis.");
  }

  const list = (data ?? []).sort(sortByScheduleAsc);
  const matchIds = list.map((item) => item.id);
  const occupiedByMatch = await getOccupiedSlotsByMatchIds(matchIds);

  const queryText = filters.query?.trim().toLowerCase();
  const mapped = list.map((row) => {
    const participantsCount = occupiedByMatch.get(row.id) ?? 0;
    const filledSlots = getFilledSlotsCount(row, participantsCount);
    return mapMatchRowToPartida(row, filledSlots, { currentUserId });
  });

  if (!queryText) return mapped;

  return mapped.filter((item) => {
    const haystack = `${item.title} ${item.location}`.toLowerCase();
    return haystack.includes(queryText);
  });
}

export async function getMatchDetails(matchId: string): Promise<MatchDetails> {
  const currentUserId = await getCurrentUserId();
  const match = await getMatchById(matchId);
  const [{ participants, profileById }, requestRows] = await Promise.all([
    getParticipantsWithProfiles(matchId),
    getPendingRequests(matchId),
  ]);

  const slots = normalizeSlots(
    match.modality as MatchModality,
    match.formation_json,
  );
  const slotByKey = new Map(slots.map((slot) => [slot.key, slot]));

  for (const participant of participants) {
    const slot = slotByKey.get(participant.position_key);
    const profile = profileById.get(participant.user_id);

    if (!slot) continue;

    slot.occupied = true;
    slot.occupiedByUserId = participant.user_id;
    slot.occupiedByName = profile?.full_name ?? "Atleta";
  }

  const requestUserIds = Array.from(
    new Set(requestRows.map((request) => request.user_id)),
  );
  let requestProfiles: ProfileRow[] = [];
  if (requestUserIds.length > 0) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("id", requestUserIds);
    if (error)
      throw new Error("Não foi possível carregar perfis das solicitacoes.");
    requestProfiles = (data ?? []) as ProfileRow[];
  }

  const requestProfileMap = new Map(
    requestProfiles.map((profile) => [profile.id, profile]),
  );
  const statsUserIds = Array.from(
    new Set([...participants.map((item) => item.user_id), ...requestUserIds]),
  );
  const positionStats = await fetchUsersPositionStats(statsUserIds);
  const statsByUser = new Map<string, UserPositionStat[]>();
  for (const stat of positionStats) {
    const list = statsByUser.get(stat.userId) ?? [];
    list.push(stat);
    statsByUser.set(stat.userId, list);
  }

  const pendingRequests: PendingMatchRequest[] = requestRows
    .filter((request) => request.status === "pending")
    .map((request) => ({
      id: request.id,
      userId: request.user_id,
      userName: requestProfileMap.get(request.user_id)?.full_name ?? "Atleta",
      userCity: requestProfileMap.get(request.user_id)?.city ?? null,
      userPositionStats: statsByUser.get(request.user_id) ?? [],
      requestedPositionKey: request.requested_position_key,
      requestedPositionLabel: request.requested_position_label,
      note: request.note,
      createdAt: request.created_at,
      status: request.status,
    }));

  const participantsList: Jogador[] = participants.map((participant) => {
    const profile = profileById.get(participant.user_id);
    const name = profile?.full_name ?? "Atleta";
    const playerStats = (statsByUser.get(participant.user_id) ?? []).find(
      (stat) =>
        stat.modality === match.modality &&
        stat.positionKey === participant.position_key,
    );

    return {
      id: participant.user_id,
      name,
      initials: toInitials(name),
      rating: playerStats?.ratingsCount ? playerStats.avgRating : null,
      position: participant.position_label,
      gradient: getGradientById(participant.user_id),
      isHost: participant.is_host,
    };
  });

  const filledSlots = getFilledSlotsCount(match, participants.length);
  const card = mapMatchRowToPartida(match, filledSlots, { currentUserId });
  const myParticipant =
    participants.find((item) => item.user_id === currentUserId) ?? null;
  const myRequest =
    requestRows.find((request) => request.user_id === currentUserId) ?? null;

  return {
    match,
    card,
    slots,
    participants: participantsList,
    isHost: match.created_by === currentUserId,
    myParticipant,
    myRequest,
    pendingRequests,
  };
}

export async function joinMatch(params: {
  matchId: string;
  positionKey: string;
  positionLabel: string;
  note?: string | null;
}) {
  const userId = await getCurrentUserId();
  const match = await getMatchById(params.matchId);

  if (match.created_by === userId) {
    throw new Error("O host não pode solicitar a propria partida.");
  }

  if (match.status !== "publicada") {
    throw new Error("Esta partida não esta com inscricoes abertas.");
  }

  const { data: existingParticipant } = await supabase
    .from("match_participants")
    .select("id")
    .eq("match_id", params.matchId)
    .eq("user_id", userId)
    .eq("status", "confirmado")
    .maybeSingle();

  if (existingParticipant) {
    throw new Error("Você já esta confirmado nesta partida.");
  }

  const { error } = await supabase.from("match_participation_requests").upsert(
    {
      match_id: params.matchId,
      user_id: userId,
      requested_position_key: params.positionKey,
      requested_position_label: params.positionLabel,
      note: params.note ?? null,
      status: "pending",
      decision_by: null,
      decision_reason: null,
      decided_at: null,
    },
    { onConflict: "match_id,user_id" },
  );

  if (error) {
    throw new Error("Não foi possível enviar sua solicitação para a partida.");
  }
}

export async function processParticipationRequest(
  requestId: string,
  action: "accept" | "reject",
  reason?: string | null,
) {
  const { error } = await supabase.rpc("process_match_participation_request", {
    p_request_id: requestId,
    p_action: action,
    p_decision_reason: reason ?? undefined,
  });

  if (error) {
    throw new Error(
      error.message || "Não foi possível processar a solicitação.",
    );
  }
}

export type HostPendingRequest = {
  id: string;
  matchId: string;
  matchTitle: string;
  userName: string;
  requestedPositionLabel: string;
  note: string | null;
  createdAt: string;
};

export async function fetchHostPendingRequests(): Promise<
  HostPendingRequest[]
> {
  const userId = await getCurrentUserId();

  const { data: createdMatches, error: createdError } = await supabase
    .from("matches")
    .select("id,title")
    .eq("created_by", userId);

  if (createdError)
    throw new Error("Não foi possível carregar as partidas criadas.");

  const createdMatchIds = (createdMatches ?? []).map((m) => m.id);
  if (createdMatchIds.length === 0) {
    return [];
  }

  const { data: requestRows, error: requestError } = await supabase
    .from("match_participation_requests")
    .select(
      "id,match_id,user_id,requested_position_label,note,created_at,status",
    )
    .in("match_id", createdMatchIds)
    .eq("status", "pending");

  if (requestError)
    throw new Error("Não foi possível carregar as solicitacoes.");

  if (!requestRows || requestRows.length === 0) {
    return [];
  }

  const userIds = Array.from(
    new Set((requestRows ?? []).map((r: any) => r.user_id)),
  );
  let profiles: ProfileRow[] = [];
  if (userIds.length > 0) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id,full_name")
      .in("id", userIds);

    if (profileError)
      throw new Error("Não foi possível carregar perfis dos solicitantes.");
    profiles = (profileData ?? []) as ProfileRow[];
  }

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const matchById = new Map((createdMatches ?? []).map((m: any) => [m.id, m]));

  return (requestRows ?? []).map((row: any) => ({
    id: row.id,
    matchId: row.match_id,
    matchTitle: matchById.get(row.match_id)?.title ?? "Partida",
    userName: profileById.get(row.user_id)?.full_name ?? "Atleta",
    requestedPositionLabel: row.requested_position_label,
    note: row.note,
    createdAt: row.created_at,
  }));
}

export async function leaveMatch(matchId: string) {
  const userId = await getCurrentUserId();
  const match = await getMatchById(matchId);

  if (match.created_by === userId) {
    throw new Error("O host não pode desmarcar a propria partida.");
  }

  const { data: existingParticipant } = await supabase
    .from("match_participants")
    .select("id")
    .eq("match_id", matchId)
    .eq("user_id", userId)
    .eq("is_host", false)
    .maybeSingle();

  if (existingParticipant) {
    const { error } = await supabase
      .from("match_participants")
      .delete()
      .eq("match_id", matchId)
      .eq("user_id", userId)
      .eq("is_host", false);

    if (error) {
      throw new Error("Não foi possível desmarcar sua presença.");
    }

    return;
  }

  const { error } = await supabase
    .from("match_participation_requests")
    .update({
      status: "cancelled",
      decision_by: userId,
      decided_at: new Date().toISOString(),
    })
    .eq("match_id", matchId)
    .eq("user_id", userId)
    .eq("status", "pending");

  if (error) {
    throw new Error("Não foi possível cancelar sua solicitação.");
  }
}

export async function submitMatchRating(params: {
  matchId: string;
  reviewedId: string;
  targetRole: "creator" | "player";
  score: number;
  comment?: string | null;
}) {
  const reviewerId = await getCurrentUserId();

  const { error } = await supabase.from("ratings").insert({
    match_id: params.matchId,
    reviewer_id: reviewerId,
    reviewed_id: params.reviewedId,
    target_role: params.targetRole,
    score: params.score,
    tags: [],
    comment: params.comment ?? null,
    anonymous: false,
  });

  if (error) {
    throw new Error(error.message || "Não foi possível salvar a avaliação.");
  }
}

export async function getUserAgenda(): Promise<AgendaResult> {
  const userId = await getCurrentUserId();

  const [
    { data: createdData, error: createdError },
    { data: joinedRows, error: joinedError },
    { data: pendingRows, error: pendingError },
    { data: ratingTaskRows, error: ratingTaskError },
  ] = await Promise.all([
    supabase
      .from("matches")
      .select("*")
      .eq("created_by", userId)
      .order("match_date", { ascending: true }),
    supabase
      .from("match_participants")
      .select("match_id")
      .eq("user_id", userId)
      .eq("status", "confirmado"),
    supabase
      .from("match_participation_requests")
      .select("match_id")
      .eq("user_id", userId)
      .eq("status", "pending"),
    supabase
      .from("match_rating_tasks")
      .select("*")
      .order("match_date", { ascending: false }),
  ]);

  if (createdError)
    throw new Error("Não foi possível carregar partidas criadas.");
  if (joinedError)
    throw new Error("Não foi possível carregar partidas marcadas.");
  if (pendingError)
    throw new Error("Não foi possível carregar solicitacoes pendentes.");
  if (ratingTaskError)
    throw new Error("Não foi possível carregar tarefas de avaliação.");

  const joinedMatchIds = Array.from(
    new Set((joinedRows ?? []).map((row) => row.match_id)),
  );
  const pendingMatchIds = Array.from(
    new Set((pendingRows ?? []).map((row) => row.match_id)),
  );

  let joinedData: MatchRow[] = [];
  if (joinedMatchIds.length > 0) {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .in("id", joinedMatchIds)
      .neq("created_by", userId);

    if (error)
      throw new Error("Não foi possível carregar as partidas marcadas.");
    joinedData = data ?? [];
  }

  let pendingData: MatchRow[] = [];
  if (pendingMatchIds.length > 0) {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .in("id", pendingMatchIds);
    if (error)
      throw new Error("Não foi possível carregar as partidas pendentes.");
    pendingData = data ?? [];
  }

  const allMatchIds = [
    ...new Set([
      ...(createdData ?? []).map((m) => m.id),
      ...joinedData.map((m) => m.id),
      ...pendingData.map((m) => m.id),
    ]),
  ];
  const occupiedByMatch = await getOccupiedSlotsByMatchIds(allMatchIds);

  const criadas = (createdData ?? [])
    .filter((row) => row.created_by === userId)
    .sort(sortByScheduleAsc)
    .map((row) => {
      const participantsCount = occupiedByMatch.get(row.id) ?? 0;
      const filledSlots = getFilledSlotsCount(row, participantsCount);
      return mapMatchRowToPartida(row, filledSlots, { currentUserId: userId });
    });

  const marcadas = joinedData
    .filter(
      (row) => row.created_by !== userId && joinedMatchIds.includes(row.id),
    )
    .sort(sortByScheduleAsc)
    .map((row) => {
      const participantsCount = occupiedByMatch.get(row.id) ?? 0;
      const filledSlots = getFilledSlotsCount(row, participantsCount);
      return mapMatchRowToPartida(row, filledSlots, { currentUserId: userId });
    });

  const pendentes = pendingData.sort(sortByScheduleAsc).map((row) => {
    const participantsCount = occupiedByMatch.get(row.id) ?? 0;
    const filledSlots = getFilledSlotsCount(row, participantsCount);
    const partida = mapMatchRowToPartida(row, filledSlots, {
      currentUserId: userId,
    });
    return {
      ...partida,
      status: "confirmed" as const,
      statusLabel: "Solicitação pendente",
      isDimmed: true,
    };
  });

  const ratingTasks: RatingTask[] = (ratingTaskRows ?? [])
    .filter((row) =>
      Boolean(
        row.task_id &&
        row.match_id &&
        row.match_title &&
        row.match_date &&
        row.target_user_id &&
        row.target_user_name &&
        row.target_role &&
        row.action_label,
      ),
    )
    .map((row) => ({
      taskId: row.task_id as string,
      matchId: row.match_id as string,
      matchTitle: row.match_title as string,
      matchDate: row.match_date as string,
      targetUserId: row.target_user_id as string,
      targetUserName: row.target_user_name as string,
      targetRole: row.target_role as "creator" | "player",
      actionLabel: row.action_label as string,
    }));

  return { criadas, marcadas, pendentes, ratingTasks };
}
