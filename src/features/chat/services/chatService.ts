import { supabase } from '@/src/lib/supabase';

type ConversationRole = 'host' | 'player' | 'system';
export type ChatListFilter = 'todas' | 'ativas' | 'host' | 'jogador' | 'arquivadas';

export type ChatListRow = {
  conversation_id: string;
  conversation_type: 'group' | 'private';
  match_id: string | null;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  last_message_at: string | null;
  my_role: ConversationRole;
  match_host_id: string | null;
  match_title: string | null;
  match_venue_name: string | null;
  match_date: string | null;
  match_time: string | null;
  last_message_id: string | null;
  last_message_content: string | null;
  last_message_created_at: string | null;
  last_message_type: 'user' | 'system' | null;
  last_message_sender_id: string | null;
  last_message_sender_name: string | null;
  private_partner_id: string | null;
  private_partner_name: string | null;
  unread_count: number;
};

export type ConversationMessage = {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  content: string;
  message_type: 'user' | 'system';
  created_at: string;
};

export type ConversationParticipant = {
  user_id: string;
  role: ConversationRole;
  full_name: string;
};

function errorMessage(prefix: string, error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message?: unknown }).message ?? '').trim();
    if (message) return `${prefix} ${message}`;
  }

  return prefix;
}

export async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Faca login novamente para continuar.');
  }

  return data.user.id;
}

export async function fetchChatList() {
  const { data, error } = await supabase
    .from('chat_conversation_list')
    .select('*')
    .order('is_archived', { ascending: true })
    .order('last_message_created_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(errorMessage('Nao foi possivel carregar a lista de conversas.', error));
  }

  return (data ?? []) as ChatListRow[];
}

export async function fetchConversationMessages(conversationId: string, limit = 150) {
  const { data, error } = await supabase
    .from('messages')
    .select('id,conversation_id,sender_id,content,message_type,created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(errorMessage('Nao foi possivel carregar as mensagens.', error));
  }

  return (data ?? []) as ConversationMessage[];
}

export async function fetchConversationParticipants(conversationId: string) {
  const { data, error } = await supabase
    .from('conversation_participants')
    .select('user_id,role')
    .eq('conversation_id', conversationId);

  if (error) {
    throw new Error(errorMessage('Nao foi possivel carregar os participantes da conversa.', error));
  }

  const rows = (data ?? []) as Array<{ user_id: string; role: ConversationRole }>;
  const ids = rows.map((row) => row.user_id);

  let profileById = new Map<string, string>();
  if (ids.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id,full_name')
      .in('id', ids);

    if (profilesError) {
      throw new Error(errorMessage('Nao foi possivel carregar os perfis dos participantes.', profilesError));
    }

    profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]));
  }

  return rows.map((row) => ({
    user_id: row.user_id,
    role: row.role,
    full_name: profileById.get(row.user_id) ?? 'Atleta',
  })) as ConversationParticipant[];
}

export async function sendMessage(conversationId: string, content: string) {
  const senderId = await getCurrentUserId();

  const trimmed = content.trim();
  if (!trimmed) return;

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content: trimmed,
    message_type: 'user',
  });

  if (error) {
    throw new Error(errorMessage('Nao foi possivel enviar a mensagem.', error));
  }
}

export async function markConversationAsRead(conversationId: string) {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(errorMessage('Nao foi possivel atualizar leitura da conversa.', error));
  }
}

export async function markConversationAsUnread(conversationId: string) {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: '1970-01-01T00:00:00.000Z' })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(errorMessage('Nao foi possivel marcar a conversa como nao lida.', error));
  }
}

export async function setConversationArchived(conversationId: string, archived: boolean) {
  const payload = archived
    ? { is_archived: true, archived_at: new Date().toISOString() }
    : { is_archived: false, archived_at: null };

  const { error } = await supabase
    .from('conversations')
    .update(payload)
    .eq('id', conversationId);

  if (error) {
    throw new Error(errorMessage('Nao foi possivel atualizar o status da conversa.', error));
  }
}

export async function getOrCreateMatchConversation(matchId: string) {
  const { data, error } = await supabase.rpc('ensure_match_conversation', { p_match_id: matchId });

  if (error || !data) {
    throw new Error(errorMessage('Nao foi possivel carregar a conversa da partida.', error));
  }

  return data as string;
}

export async function createPrivateConversation(otherUserId: string, initialMessage?: string) {
  const { data, error } = await supabase.rpc('create_private_conversation', {
    p_other_user_id: otherUserId,
    p_initial_message: initialMessage,
  });

  if (error || !data) {
    throw new Error(errorMessage('Nao foi possivel iniciar conversa privada.', error));
  }

  return data as string;
}

export function subscribeConversationMessages(
  conversationId: string,
  onChange: () => void,
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeChatList(onChange: () => void) {
  const channel = supabase
    .channel('chat-list')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, onChange)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'conversation_participants' },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
