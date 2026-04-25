import { supabase } from '@/src/lib/supabase';
import type { Tables } from '@/src/types/database';

export type SupportMessage = Tables<'support_messages'>;

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Faça login novamente para continuar.');
  return data.user.id;
}

export async function sendSupportMessage(subject: string, message: string) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('support_messages')
    .insert({
      user_id: userId,
      subject,
      message,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error('Não foi possível enviar a mensagem de suporte.');
  }

  return data;
}

export async function fetchMySupportMessages() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Não foi possível carregar as mensagens de suporte.');
  }

  return data || [];
}
