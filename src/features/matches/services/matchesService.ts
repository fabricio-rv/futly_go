import { supabase } from '@/src/lib/supabase';
import type { Partida } from '@/src/features/matches/types';
import { MATCH_POSITIONS, type MatchLevel, type MatchModality, type MatchTurno } from '@/src/features/matches/constants';
import { mapMatchRowToPartida } from '@/src/features/matches/mappers';
import type { Tables, TablesInsert } from '@/src/types/database';

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

export type AgendaResult = {
  criadas: Partida[];
  marcadas: Partida[];
};

type MatchRow = Tables<'matches'>;

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Faça login novamente para continuar.');
  return data.user.id;
}

function buildFormationJson(modality: MatchModality, selectedIndexes: number[]) {
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
    .from('match_participants')
    .select('match_id,status')
    .in('match_id', matchIds)
    .eq('status', 'confirmado');

  if (error) throw new Error('Não foi possível carregar os participantes.');

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

export async function createMatch(input: CreateMatchInput) {
  const userId = await getCurrentUserId();

  const formationJson = buildFormationJson(input.modality, input.selectedPositionIndexes);
  const facilities = (input.facilities ?? []).map((item) => ({
    label: item.label,
    selected: item.selected,
  }));

  const payload: TablesInsert<'matches'> = {
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
    status: 'publicada',
  };

  const { data: match, error } = await supabase
    .from('matches')
    .insert(payload)
    .select('*')
    .single();

  if (error || !match) {
    throw new Error('Não foi possível criar a partida.');
  }

  const hostSlot = MATCH_POSITIONS[input.modality][0];
  const { error: participantError } = await supabase.from('match_participants').insert({
    match_id: match.id,
    user_id: userId,
    is_host: true,
    status: 'confirmado',
    position_key: hostSlot.key,
    position_label: hostSlot.label,
  });

  if (participantError) {
    throw new Error('Partida criada, mas não foi possível registrar o host.');
  }

  return match;
}

export async function fetchAvailableMatches(filters: AvailableMatchesFilters = {}) {
  let query = supabase
    .from('matches')
    .select('*')
    .eq('status', 'publicada')
    .gte('match_date', new Date().toISOString().slice(0, 10));

  if (filters.city) query = query.ilike('city', `%${filters.city}%`);
  if (filters.state) query = query.eq('state', filters.state);
  if (filters.turno) query = query.eq('turno', filters.turno);
  if (filters.modality) query = query.eq('modality', filters.modality);
  if (typeof filters.maxPrice === 'number') query = query.lte('price_per_person', filters.maxPrice);

  const { data, error } = await query;

  if (error) {
    throw new Error('Não foi possível listar partidas disponíveis.');
  }

  const list = (data ?? []).sort(sortByScheduleAsc);
  const matchIds = list.map((item) => item.id);
  const occupiedByMatch = await getOccupiedSlotsByMatchIds(matchIds);

  const queryText = filters.query?.trim().toLowerCase();
  const mapped = list.map((row) => mapMatchRowToPartida(row, occupiedByMatch.get(row.id) ?? 0));

  if (!queryText) return mapped;

  return mapped.filter((item) => {
    const haystack = `${item.title} ${item.location}`.toLowerCase();
    return haystack.includes(queryText);
  });
}

export async function joinMatch(params: {
  matchId: string;
  positionKey: string;
  positionLabel: string;
}) {
  const userId = await getCurrentUserId();

  const { error } = await supabase.from('match_participants').upsert(
    {
      match_id: params.matchId,
      user_id: userId,
      position_key: params.positionKey,
      position_label: params.positionLabel,
      status: 'confirmado',
      is_host: false,
    },
    {
      onConflict: 'match_id,user_id',
    },
  );

  if (error) {
    if (error.code === '23505') {
      throw new Error('Essa posição já foi ocupada por outro jogador.');
    }

    throw new Error('Não foi possível confirmar sua presença nessa partida.');
  }
}

export async function getUserAgenda(): Promise<AgendaResult> {
  const userId = await getCurrentUserId();

  const [{ data: createdData, error: createdError }, { data: joinedRows, error: joinedError }] = await Promise.all([
    supabase.from('matches').select('*').eq('created_by', userId).order('match_date', { ascending: true }),
    supabase
      .from('match_participants')
      .select('match_id')
      .eq('user_id', userId)
      .eq('status', 'confirmado'),
  ]);

  if (createdError) throw new Error('Não foi possível carregar partidas criadas.');
  if (joinedError) throw new Error('Não foi possível carregar partidas marcadas.');

  const joinedMatchIds = Array.from(new Set((joinedRows ?? []).map((row) => row.match_id)));

  let joinedData: MatchRow[] = [];
  if (joinedMatchIds.length > 0) {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .in('id', joinedMatchIds)
      .neq('created_by', userId);

    if (error) throw new Error('Não foi possível carregar as partidas marcadas.');
    joinedData = data ?? [];
  }

  const allMatchIds = [...new Set([...(createdData ?? []).map((m) => m.id), ...joinedData.map((m) => m.id)])];
  const occupiedByMatch = await getOccupiedSlotsByMatchIds(allMatchIds);

  const criadas = (createdData ?? [])
    .sort(sortByScheduleAsc)
    .map((row) => mapMatchRowToPartida(row, occupiedByMatch.get(row.id) ?? 0));

  const marcadas = joinedData
    .sort(sortByScheduleAsc)
    .map((row) => mapMatchRowToPartida(row, occupiedByMatch.get(row.id) ?? 0));

  return { criadas, marcadas };
}
