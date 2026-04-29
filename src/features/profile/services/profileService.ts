import { supabase } from '@/src/lib/supabase';
import type { Tables, TablesUpdate } from '@/src/types/database';

export type ProfileRow = Tables<'profiles'>;

export type UpdateProfileInput = {
  fullName?: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  cep?: string | null;
  bio?: string | null;
};

export type UserPositionStat = {
  userId: string;
  modality: string;
  positionKey: string;
  positionLabel: string;
  matchesCount: number;
  ratingsCount: number;
  avgRating: number | null;
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Faça login novamente para continuar.');
  return data.user.id;
}

export async function fetchMyProfile() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

  if (error || !data) {
    throw new Error('Não foi possível carregar seu perfil.');
  }

  return data;
}

export async function updateMyProfile(input: UpdateProfileInput) {
  const userId = await getCurrentUserId();

  const payload: TablesUpdate<'profiles'> = {};
  const userMetadata: Record<string, any> = {};

  if (typeof input.fullName === 'string') {
    payload.full_name = input.fullName;
    userMetadata.full_name = input.fullName;
  }
  if (input.phone !== undefined) {
    payload.phone = input.phone;
    userMetadata.phone = input.phone;
  }
  if (input.city !== undefined) {
    payload.city = input.city;
    userMetadata.city = input.city;
  }
  if (input.state !== undefined) {
    payload.state = input.state;
    userMetadata.state = input.state;
  }
  if (input.cep !== undefined) {
    payload.cep = input.cep;
    userMetadata.cep = input.cep;
  }
  if (input.bio !== undefined) payload.bio = input.bio;

  if (Object.keys(userMetadata).length > 0) {
    await supabase.auth.updateUser({ data: userMetadata }).catch(() => undefined);
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error('Não foi possível atualizar seu perfil.');
  }

  return data;
}

export async function fetchUsersPositionStats(userIds: string[]): Promise<UserPositionStat[]> {
  if (userIds.length === 0) return [];

  const { data, error } = await supabase.rpc('get_users_position_stats', {
    p_user_ids: userIds,
  });

  if (error) {
    throw new Error('Não foi possível carregar estatísticas por posição.');
  }

  const rows = (data ?? []) as Array<{
    user_id: string | null;
    modality: string | null;
    position_key: string | null;
    position_label: string | null;
    matches_count: number | null;
    ratings_count: number | null;
    avg_rating: number | null;
  }>;

  const seen = new Set<string>();
  return rows
    .filter((row) => row.user_id && row.modality && row.position_key && row.position_label)
    .filter((row) => {
      const key = `${row.user_id}:${row.modality}:${row.position_key}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((row) => ({
      userId: row.user_id as string,
      modality: row.modality as string,
      positionKey: row.position_key as string,
      positionLabel: row.position_label as string,
      matchesCount: row.matches_count ?? 0,
      ratingsCount: row.ratings_count ?? 0,
      avgRating: row.avg_rating,
    }));
}
