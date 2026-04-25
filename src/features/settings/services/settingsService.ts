import { supabase } from '@/src/lib/supabase';
import type { Tables, TablesUpdate } from '@/src/types/database';

export type Settings = {
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  theme: 'light' | 'dark';
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Faça login novamente para continuar.');
  return data.user.id;
}

export async function fetchSettings(): Promise<Settings> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('profiles')
    .select('notifications_enabled, location_enabled, theme')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error('Não foi possível carregar as preferências.');
  }

  return {
    notificationsEnabled: data.notifications_enabled ?? true,
    locationEnabled: data.location_enabled ?? true,
    theme: (data.theme as 'light' | 'dark') ?? 'dark',
  };
}

export async function updateSettings(input: Partial<Settings>): Promise<Settings> {
  const userId = await getCurrentUserId();

  const payload: TablesUpdate<'profiles'> = {};

  if (input.notificationsEnabled !== undefined) {
    payload.notifications_enabled = input.notificationsEnabled;
  }
  if (input.locationEnabled !== undefined) {
    payload.location_enabled = input.locationEnabled;
  }
  if (input.theme !== undefined) {
    payload.theme = input.theme;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('notifications_enabled, location_enabled, theme')
    .single();

  if (error || !data) {
    throw new Error('Não foi possível atualizar as preferências.');
  }

  return {
    notificationsEnabled: data.notifications_enabled ?? true,
    locationEnabled: data.location_enabled ?? true,
    theme: (data.theme as 'light' | 'dark') ?? 'dark',
  };
}
