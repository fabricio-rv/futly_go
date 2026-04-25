import { supabase } from '@/src/lib/supabase';
import type { Enums, Tables, TablesUpdate } from '@/src/types/database';

export type ProfileRow = Tables<'profiles'>;

export type UpdateProfileInput = {
  fullName?: string;
  bio?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  primaryPosition?: string | null;
  secondaryPositions?: string[];
  skillLevel?: Enums<'match_level'> | null;
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

  if (typeof input.fullName === 'string') payload.full_name = input.fullName;
  if (input.bio !== undefined) payload.bio = input.bio;
  if (input.heightCm !== undefined) payload.height_cm = input.heightCm;
  if (input.weightKg !== undefined) payload.weight_kg = input.weightKg;
  if (input.primaryPosition !== undefined) payload.primary_position = input.primaryPosition;
  if (input.secondaryPositions !== undefined) payload.secondary_positions = input.secondaryPositions;
  if (input.skillLevel !== undefined) payload.skill_level = input.skillLevel;

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
