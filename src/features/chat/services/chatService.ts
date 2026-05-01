import { supabase } from '@/src/lib/supabase';
import { decryptMessage, encryptMessage, isEncryptedMessage } from '@/src/features/chat/services/chatCrypto';

type ConversationRole = 'host' | 'player' | 'system';
export type ChatListFilter = 'todas' | 'ativas' | 'host' | 'jogador' | 'arquivadas';
type UntypedSupabase = ReturnType<typeof supabase.schema> extends never ? never : any;
const db = supabase as UntypedSupabase;
let realtimeTopicSequence = 0;
let authUserIdPromise: Promise<string> | null = null;
let profileIdPromise: Promise<string> | null = null;
let cachedAuthUserId: string | null = null;
let cachedProfileId: string | null = null;

export function resetChatIdentityCache() {
  authUserIdPromise = null;
  profileIdPromise = null;
  cachedAuthUserId = null;
  cachedProfileId = null;
}

function nextRealtimeTopic(base: string) {
  realtimeTopicSequence += 1;
  return `${base}:${Date.now()}:${realtimeTopicSequence}`;
}

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
  group_name?: string | null;
  group_description?: string | null;
  group_avatar_url?: string | null;
  is_custom_group?: boolean;
  auto_archive_enabled?: boolean;
  last_message_id: string | null;
  last_message_content: string | null;
  last_message_created_at: string | null;
  last_message_type: 'user' | 'system' | null;
  last_message_sender_id: string | null;
  last_message_sender_name: string | null;
  private_partner_id: string | null;
  private_partner_name: string | null;
  private_partner_avatar_url?: string | null;
  private_partner_last_seen_at?: string | null;
  last_message_metadata?: Record<string, unknown>;
  unread_count: number;
  last_message_receipt_status?: 'sent' | 'delivered' | 'read';
};

export type ConversationMessage = {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  content: string;
  message_type: 'user' | 'system';
  created_at: string;
  metadata?: Record<string, unknown>;
};

export type ConversationParticipant = {
  user_id: string;
  role: ConversationRole;
  full_name: string;
  avatar_url?: string | null;
  last_seen_at?: string | null;
};

export type ChatProfileSearchResult = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};

export type ConversationInfoData = {
  id: string;
  type: 'group' | 'private';
  title: string;
  avatarUrl: string | null;
  description: string | null;
  partnerId: string | null;
  partnerPhone: string | null;
  mediaCount: number;
  videoCount: number;
  audioCount: number;
  sentCount: number;
  starredCount: number;
  pinnedCount: number;
  notificationsEnabled: boolean;
  membersCount: number;
};

export type MessageReceiptStatus = {
  delivered_at: string | null;
  read_at: string | null;
  delivered_by: string[];
  read_by: string[];
};

export type MessageReceiptMap = Record<string, MessageReceiptStatus>;

export type ReactionGroup = {
  emoji: string;
  count: number;
  reactedByMe: boolean;
  profileIds: string[];
};

export type SendMessageOptions = {
  messageType?: 'user' | 'system';
  metadata?: Record<string, unknown>;
};

export type ChatFileAttachment = {
  id: string;
  message_id: string;
  storage_bucket: string;
  storage_path: string;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
};

function errorMessage(prefix: string, error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message?: unknown }).message ?? '').trim();
    if (message) return `${prefix} ${message}`;
  }

  return prefix;
}

function isStorageLockAbort(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const message = String((error as { message?: unknown }).message ?? '').toLowerCase();
  const name = String((error as { name?: unknown }).name ?? '').toLowerCase();
  return name === 'aborterror' || message.includes('lock broken by another request');
}

function isNetworkFetchError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const message = String((error as { message?: unknown }).message ?? '').toLowerCase();
  const name = String((error as { name?: unknown }).name ?? '').toLowerCase();
  return name === 'typeerror' && (message.includes('failed to fetch') || message.includes('network request failed'));
}

function looksLikeEncryptedPayload(value: string | null | undefined) {
  const text = String(value ?? '').trim();
  if (!text) return false;
  return text.startsWith('e2ee:') || isEncryptedMessage(text);
}

async function resolveCurrentAuthUserId() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user?.id) return sessionData.session.user.id;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Faca login novamente para continuar.');
  }

  return data.user.id;
}

export async function getCurrentAuthUserId() {
  if (cachedAuthUserId) return cachedAuthUserId;
  if (!authUserIdPromise) {
    authUserIdPromise = resolveCurrentAuthUserId()
      .then((id) => {
        cachedAuthUserId = id;
        return id;
      })
      .finally(() => {
        authUserIdPromise = null;
      });
  }

  return authUserIdPromise;
  /*
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Faça login novamente para continuar.');
  }

  return data.user.id;
  */
}

export async function getCurrentProfileId() {
  if (cachedProfileId) return cachedProfileId;
  if (!profileIdPromise) {
    profileIdPromise = resolveCurrentProfileId().finally(() => {
      profileIdPromise = null;
    });
  }

  return profileIdPromise;
}

async function resolveCurrentProfileId() {
  const authUserId = await getCurrentAuthUserId();
  const { data, error } = await db
    .from('profiles')
    .select('id,user_id')
    .or(`id.eq.${authUserId},user_id.eq.${authUserId}`)
    .limit(1)
    .maybeSingle();

  if (error || !data?.id) {
    throw new Error(errorMessage('Nao foi possivel identificar seu perfil.', error));
  }

  cachedProfileId = data.id as string;
  return cachedProfileId;
}

export const getCurrentUserId = getCurrentProfileId;

export async function fetchChatList() {
  const { data, error } = await supabase
    .from('chat_conversation_list')
    .select('*')
    .order('is_archived', { ascending: true })
    .order('last_message_created_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(errorMessage('Não foi possível carregar a lista de conversas.', error));
  }

  const rows = (data ?? []) as ChatListRow[];
  const lastMessageIds = rows
    .map((row) => row.last_message_id)
    .filter((id): id is string => Boolean(id));

  const lastMessageMetadataById = new Map<string, Record<string, unknown> | undefined>();
  if (lastMessageIds.length > 0) {
    const { data: lastMessages } = await (supabase as any)
      .from('messages')
      .select('id,metadata')
      .in('id', lastMessageIds);
    (lastMessages ?? []).forEach((message: { id: string; metadata?: Record<string, unknown> }) => {
      lastMessageMetadataById.set(message.id, message.metadata);
    });
  }
  const privatePartnerIds = Array.from(new Set(rows
    .filter((row) => row.conversation_type === 'private' && row.private_partner_id)
    .map((row) => row.private_partner_id as string)));
  let privatePartnerLastSeenById = new Map<string, string | null>();
  let privatePartnerAvatarById = new Map<string, string | null>();
  if (privatePartnerIds.length > 0) {
    const { data: privateProfiles } = await (supabase as any)
      .from('profiles')
      .select('id,avatar_url,last_seen_at,updated_at')
      .in('id', privatePartnerIds);
    privatePartnerLastSeenById = new Map((privateProfiles ?? []).map((profile: any) => [
      profile.id as string,
      (profile.last_seen_at ?? profile.updated_at ?? null) as string | null,
    ]));
    privatePartnerAvatarById = new Map((privateProfiles ?? []).map((profile: any) => [
      profile.id as string,
      (profile.avatar_url ?? null) as string | null,
    ]));
  }

  const currentProfileId = await getCurrentProfileId();
  const conversationIds = rows.map((row) => row.conversation_id);
  const { data: participantRows } = await supabase
    .from('conversation_participants')
    .select('conversation_id,user_id')
    .in('conversation_id', conversationIds);
  const otherParticipantsCountByConversation = (participantRows ?? []).reduce<Record<string, number>>((acc, row) => {
    const typedRow = row as { conversation_id: string; user_id: string };
    if (typedRow.user_id === currentProfileId) return acc;
    acc[typedRow.conversation_id] = (acc[typedRow.conversation_id] ?? 0) + 1;
    return acc;
  }, {});

  const ownLastMessageIds = rows
    .filter((row) => row.last_message_id && row.last_message_sender_id === currentProfileId)
    .map((row) => row.last_message_id as string);
  const receiptMap = await getConversationMessageReceiptMap(ownLastMessageIds);

  return Promise.all(
    rows.map(async (row) => {
      const lastMessageMetadata = row.last_message_id
        ? lastMessageMetadataById.get(row.last_message_id)
        : undefined;
      const attachmentKind = String(lastMessageMetadata?.attachment_kind ?? '').toLowerCase();
      const attachmentLabel = String(lastMessageMetadata?.attachment_label ?? '').trim();
      const attachmentName = String(lastMessageMetadata?.attachment_name ?? '').trim();
      const attachmentDuration = Number(lastMessageMetadata?.attachment_duration_sec ?? 0);

      const attachmentPreview = (() => {
        if (!attachmentKind) return null;
        if (attachmentKind === 'audio') return attachmentDuration > 0 ? `[Audio ${attachmentDuration}s]` : '[Audio]';
        if (attachmentKind === 'image') return '[Imagem]';
        if (attachmentKind === 'video') return '[Vídeo]';
        if (attachmentKind === 'document') {
          if (!attachmentName) return '[Documento]';
          const extension = attachmentName.includes('.') ? attachmentName.split('.').pop()?.toUpperCase() : '';
          return extension ? `[Documento ${extension}]` : '[Documento]';
        }
        if (attachmentLabel) return `[${attachmentLabel}]`;
        return '[Anexo]';
      })();

      const receipt = row.last_message_id ? receiptMap[row.last_message_id] : undefined;
      const othersCount = otherParticipantsCountByConversation[row.conversation_id] ?? 0;
      const readByOthersCount = (receipt?.read_by ?? []).filter((profileId) => profileId !== currentProfileId).length;
      const allOthersRead = othersCount > 0 && readByOthersCount >= othersCount;
      const receiptStatus: ChatListRow['last_message_receipt_status'] = row.last_message_sender_id === currentProfileId
        ? allOthersRead ? 'read' : 'delivered'
        : undefined;

      const rowWithReceipt = {
        ...row,
        last_message_content: (
          (row.last_message_content ?? '').replace(/\u200B/g, '').trim() || attachmentPreview || row.last_message_content
        ),
        last_message_receipt_status: receiptStatus,
        private_partner_last_seen_at: row.private_partner_id
          ? (privatePartnerLastSeenById.get(row.private_partner_id) ?? null)
          : null,
        private_partner_avatar_url: row.private_partner_id
          ? (privatePartnerAvatarById.get(row.private_partner_id) ?? null)
          : null,
        last_message_metadata: lastMessageMetadata,
      };

      if (!row.last_message_content || row.last_message_type === 'system') return rowWithReceipt;
      if (!looksLikeEncryptedPayload(row.last_message_content)) {
        const safeText = String(rowWithReceipt.last_message_content ?? '').trim();
        if (safeText.startsWith('e2ee:')) {
          return {
            ...rowWithReceipt,
            last_message_content: 'Mensagem protegida',
          };
        }
        return rowWithReceipt;
      }

      const decrypted = await decryptMessage(row.conversation_id, row.last_message_content);
      const normalizedDecrypted = decrypted.replace(/\u200B/g, '').trim();

      return {
        ...rowWithReceipt,
        last_message_content: looksLikeEncryptedPayload(decrypted)
          ? 'Mensagem protegida'
          : (normalizedDecrypted || rowWithReceipt.last_message_content),
      };
    }),
  );
}

export async function fetchUnreadChatCount() {
  const rows = await fetchChatList();
  return rows
    .filter((row) => !row.is_archived)
    .reduce((total, row) => total + Math.max(0, Number(row.unread_count ?? 0)), 0);
}

export async function fetchConversationMessages(conversationId: string, limit = 150) {
  const { data, error } = await supabase
    .from('messages')
    .select('id,conversation_id,sender_id,content,message_type,metadata,created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(errorMessage('Não foi possível carregar as mensagens.', error));
  }

  return (data ?? []) as ConversationMessage[];
}

export async function getConversationMessageById(messageId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('id,conversation_id,sender_id,content,message_type,metadata,created_at')
    .eq('id', messageId)
    .maybeSingle();

  if (error) {
    throw new Error(errorMessage('Nao foi possivel carregar a mensagem.', error));
  }

  return data as ConversationMessage | null;
}

export async function fetchConversationParticipants(conversationId: string) {
  const { data, error } = await supabase
    .from('conversation_participants')
    .select('user_id,role')
    .eq('conversation_id', conversationId);

  if (error) {
    throw new Error(errorMessage('Não foi possível carregar os participantes da conversa.', error));
  }

  const rows = (data ?? []) as Array<{ user_id: string; role: ConversationRole }>;
  const ids = rows.map((row) => row.user_id);

  let profileById = new Map<string, { full_name: string; avatar_url: string | null; last_seen_at: string | null }>();
  if (ids.length > 0) {
    const { data: profiles, error: profilesError } = await (supabase as any)
      .from('profiles')
      .select('id,full_name,avatar_url,last_seen_at,updated_at')
      .in('id', ids);

    if (profilesError) {
      throw new Error(errorMessage('Não foi possível carregar os perfis dos participantes.', profilesError));
    }

    profileById = new Map((profiles ?? []).map((profile: any) => [profile.id, {
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      last_seen_at: profile.last_seen_at ?? profile.updated_at ?? null,
    }]));
  }

  return rows.map((row) => ({
    user_id: row.user_id,
    role: row.role,
    full_name: (profileById.get(row.user_id) as { full_name?: string } | undefined)?.full_name ?? 'Atleta',
    avatar_url: (profileById.get(row.user_id) as { avatar_url?: string | null } | undefined)?.avatar_url ?? null,
    last_seen_at: (profileById.get(row.user_id) as { last_seen_at?: string | null } | undefined)?.last_seen_at ?? null,
  })) as ConversationParticipant[];
}

export async function touchMyLastSeen() {
  const userId = await getCurrentProfileId();
  const now = new Date().toISOString();

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ last_seen_at: now })
    .eq('id', userId);

  if (error) {
    console.warn('[chat] failed to update last_seen_at:', error.message);
  }
}

export async function sendMessage(conversationId: string, content: string, options: SendMessageOptions = {}) {
  const senderId = await getCurrentProfileId();

  const trimmed = content.trim();
  const hasAttachmentMetadata = Boolean(options.metadata && (options.metadata as Record<string, unknown>).attachment_kind);
  if (!trimmed && !hasAttachmentMetadata) return;
  const persistedContent = trimmed || '\u200B';

  const { data, error } = await db
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: options.messageType === 'system' ? null : senderId,
      content: persistedContent,
      message_type: options.messageType ?? 'user',
      metadata: options.metadata ?? {},
    })
    .select('id,conversation_id,sender_id,content,message_type,metadata,created_at')
    .single();

  if (error) {
    throw new Error(errorMessage('Não foi possível enviar a mensagem.', error));
  }

  void dispatchChatPushQueue();
  return data as ConversationMessage;
}

export async function dispatchChatPushQueue() {
  const { error } = await supabase.functions.invoke('chat-push-dispatch', {
    body: { source: 'mobile-chat' },
  });

  if (error) {
    console.warn('[chat] push dispatch skipped:', error.message);
  }
}

export async function forwardMessage(targetConversationId: string, messageId: string) {
  const source = await getConversationMessageById(messageId);
  if (!source?.content) return null;

  const sourceAttachments = await fetchAttachmentsForMessages([messageId]);
  const firstAttachment = sourceAttachments[messageId]?.[0];
  const plainContent = source.message_type === 'system'
    ? source.content
    : await decryptMessage(source.conversation_id, source.content);
  const nextContent = source.message_type === 'system'
    ? plainContent
    : await encryptMessage(targetConversationId, plainContent);

  const forwarded = await sendMessage(targetConversationId, nextContent, {
    metadata: {
      ...(source.metadata ?? {}),
      forwardedFromMessageId: source.id,
      forwardedFromConversationId: source.conversation_id,
    },
  });

  if (forwarded && firstAttachment) {
    const profileId = await getCurrentProfileId();
    const extension = firstAttachment.file_name?.includes('.')
      ? firstAttachment.file_name.split('.').pop()
      : firstAttachment.storage_path.split('.').pop() ?? 'bin';
    const nextPath = `${targetConversationId}/${forwarded.id}/${Date.now()}.${extension}`;

    const { error: copyError } = await supabase.storage
      .from(firstAttachment.storage_bucket)
      .copy(firstAttachment.storage_path, nextPath);

    if (copyError) {
      throw new Error(errorMessage('Nao foi possivel encaminhar anexo.', copyError));
    }

    const { error: attachmentError } = await db
      .from('chat_file_attachments')
      .insert({
        message_id: forwarded.id,
        created_by: profileId,
        storage_bucket: firstAttachment.storage_bucket,
        storage_path: nextPath,
        file_name: firstAttachment.file_name,
        mime_type: firstAttachment.mime_type,
        file_size: firstAttachment.file_size,
      });

    if (attachmentError) {
      throw new Error(errorMessage('Nao foi possivel vincular anexo encaminhado.', attachmentError));
    }
  }

  return targetConversationId;
}

export async function deleteOwnMessage(messageId: string) {
  const userId = await getCurrentProfileId();

  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)
    .eq('sender_id', userId);

  if (error) {
    throw new Error(errorMessage('Nao foi possivel apagar a mensagem.', error));
  }
}

function collapseReceiptRows(rows: Array<{ message_id: string; profile_id: string; delivered_at: string | null; read_at: string | null }>) {
  const map: MessageReceiptMap = {};

  rows.forEach((row) => {
    const current = map[row.message_id];
    const deliveredBy = new Set(current?.delivered_by ?? []);
    const readBy = new Set(current?.read_by ?? []);
    if (row.delivered_at) deliveredBy.add(row.profile_id);
    if (row.read_at) readBy.add(row.profile_id);
    map[row.message_id] = {
      delivered_at: latestTimestamp(current?.delivered_at ?? null, row.delivered_at),
      read_at: latestTimestamp(current?.read_at ?? null, row.read_at),
      delivered_by: Array.from(deliveredBy),
      read_by: Array.from(readBy),
    };
  });

  return map;
}

function latestTimestamp(current: string | null, next: string | null) {
  if (!current) return next;
  if (!next) return current;
  return current > next ? current : next;
}

async function getConversationIdsByMessage(messageIds: string[]) {
  const uniqueIds = Array.from(new Set(messageIds));
  if (uniqueIds.length === 0) return {};

  const { data, error } = await supabase
    .from('messages')
    .select('id,conversation_id')
    .in('id', uniqueIds);

  if (error) {
    throw new Error(errorMessage('Nao foi possivel resolver conversa das mensagens.', error));
  }

  return Object.fromEntries((data ?? []).map((row) => [row.id, row.conversation_id])) as Record<string, string>;
}

export async function getConversationMessageReceiptMap(messageIds: string[]) {
  if (messageIds.length === 0) return {};

  const { data, error } = await db
    .from('chat_message_receipts')
    .select('message_id,profile_id,delivered_at,read_at')
    .in('message_id', messageIds);

  if (error) {
    if (isStorageLockAbort(error)) return {};
    throw new Error(errorMessage('Nao foi possivel carregar recibos.', error));
  }

  return collapseReceiptRows(data ?? []);
}

export async function markConversationMessagesDelivered(messageIds: string[]) {
  if (messageIds.length === 0) return;
  const userId = await getCurrentProfileId();
  const now = new Date().toISOString();
  const conversationByMessage = await getConversationIdsByMessage(messageIds);
  const rows = Array.from(new Set(messageIds))
    .map((messageId) => {
      const conversationId = conversationByMessage[messageId];
      if (!conversationId) return null;

      return {
        message_id: messageId,
        conversation_id: conversationId,
        profile_id: userId,
        delivered_at: now,
      };
    })
    .filter((row): row is { message_id: string; conversation_id: string; profile_id: string; delivered_at: string } => Boolean(row));

  if (rows.length === 0) return;

  const { error } = await db
    .from('chat_message_receipts')
    .upsert(rows, { onConflict: 'message_id,profile_id' });

  if (error) {
    if (isNetworkFetchError(error)) {
      console.warn('[chat] delivered receipt sync skipped:', (error as { message?: string }).message ?? error);
      return;
    }
    throw new Error(errorMessage('Nao foi possivel marcar mensagens como entregues.', error));
  }
}

export async function markConversationMessagesRead(messageIds: string[]) {
  if (messageIds.length === 0) return;
  const userId = await getCurrentProfileId();
  const now = new Date().toISOString();
  const conversationByMessage = await getConversationIdsByMessage(messageIds);
  const rows = Array.from(new Set(messageIds))
    .map((messageId) => {
      const conversationId = conversationByMessage[messageId];
      if (!conversationId) return null;

      return {
        message_id: messageId,
        conversation_id: conversationId,
        profile_id: userId,
        delivered_at: now,
        read_at: now,
      };
    })
    .filter((row): row is {
      message_id: string;
      conversation_id: string;
      profile_id: string;
      delivered_at: string;
      read_at: string;
    } => Boolean(row));

  if (rows.length === 0) return;

  const { error } = await db
    .from('chat_message_receipts')
    .upsert(rows, { onConflict: 'message_id,profile_id' });

  if (error) {
    if (isNetworkFetchError(error)) {
      console.warn('[chat] read receipt sync skipped:', (error as { message?: string }).message ?? error);
      return;
    }
    throw new Error(errorMessage('Nao foi possivel marcar mensagens como lidas.', error));
  }
}

export async function getConversationMessageReactions(messageIds: string[]) {
  const userId = await getCurrentProfileId();
  if (messageIds.length === 0) return {};

  const { data, error } = await db
    .from('message_reactions')
    .select('message_id,profile_id,emoji')
    .in('message_id', messageIds);

  if (error) {
    throw new Error(errorMessage('Nao foi possivel carregar reacoes.', error));
  }

  const grouped: Record<string, Record<string, { count: number; profileIds: string[] }>> = {};
  (data ?? []).forEach((row: { message_id: string; profile_id: string; emoji: string }) => {
    grouped[row.message_id] ??= {};
    grouped[row.message_id][row.emoji] ??= { count: 0, profileIds: [] };
    grouped[row.message_id][row.emoji].count += 1;
    grouped[row.message_id][row.emoji].profileIds.push(row.profile_id);
  });

  return Object.fromEntries(
    Object.entries(grouped).map(([messageId, emojis]) => [
      messageId,
      Object.entries(emojis).map(([emoji, value]) => ({
        emoji,
        count: value.count,
        reactedByMe: value.profileIds.includes(userId),
        profileIds: value.profileIds,
      })),
    ]),
  ) as Record<string, ReactionGroup[]>;
}

export async function toggleMessageReaction(messageId: string, emoji: string) {
  const userId = await getCurrentProfileId();
  const conversationByMessage = await getConversationIdsByMessage([messageId]);
  const conversationId = conversationByMessage[messageId];

  const { data: existingRows, error: findError } = await db
    .from('message_reactions')
    .select('emoji')
    .eq('message_id', messageId)
    .eq('profile_id', userId);

  if (findError) {
    throw new Error(errorMessage('Nao foi possivel alternar reacao.', findError));
  }

  const existing = (existingRows ?? []) as Array<{ emoji: string }>;
  const hasSameEmoji = existing.some((row) => row.emoji === emoji);

  if (hasSameEmoji) {
    const { error } = await db
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('profile_id', userId);
    if (error) throw new Error(errorMessage('Nao foi possivel remover reacao.', error));
    return 'removed' as const;
  }

  const { error } = await db
    .from('message_reactions')
    .upsert({ message_id: messageId, conversation_id: conversationId, profile_id: userId, emoji }, { onConflict: 'message_id,profile_id' });

  if (error) {
    throw new Error(errorMessage('Nao foi possivel adicionar reacao.', error));
  }

  return 'added' as const;
}

export async function getConversationPinnedMessageIds(conversationId: string) {
  const { data, error } = await db
    .from('pinned_messages')
    .select('message_id')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(errorMessage('Nao foi possivel carregar fixadas.', error));
  }

  return (data ?? []).map((row: { message_id: string }) => row.message_id);
}

export async function togglePinMessage(conversationId: string, messageId: string) {
  const userId = await getCurrentProfileId();
  const { data: existing, error: findError } = await db
    .from('pinned_messages')
    .select('message_id')
    .eq('message_id', messageId)
    .maybeSingle();

  if (findError) {
    throw new Error(errorMessage('Nao foi possivel alternar fixada.', findError));
  }

  if (existing) {
    const { error } = await db.from('pinned_messages').delete().eq('message_id', messageId);
    if (error) throw new Error(errorMessage('Nao foi possivel desfixar mensagem.', error));
    return 'unpinned' as const;
  }

  const { error } = await db
    .from('pinned_messages')
    .insert({ conversation_id: conversationId, message_id: messageId, pinned_by: userId });

  if (error) {
    throw new Error(errorMessage('Nao foi possivel fixar mensagem.', error));
  }

  return 'pinned' as const;
}

export async function getMySavedMessageIds(messageIds: string[]) {
  const userId = await getCurrentProfileId();
  if (messageIds.length === 0) return [];

  const { data, error } = await db
    .from('saved_messages')
    .select('message_id')
    .eq('profile_id', userId)
    .in('message_id', messageIds);

  if (error) {
    if (isNetworkFetchError(error)) return [];
    throw new Error(errorMessage('Nao foi possivel carregar salvas.', error));
  }

  return (data ?? []).map((row: { message_id: string }) => row.message_id);
}

export async function toggleSaveMessage(messageId: string) {
  const userId = await getCurrentProfileId();
  const { data: existing, error: findError } = await db
    .from('saved_messages')
    .select('message_id')
    .eq('message_id', messageId)
    .eq('profile_id', userId)
    .maybeSingle();

  if (findError) {
    throw new Error(errorMessage('Nao foi possivel alternar mensagem salva.', findError));
  }

  if (existing) {
    const { error } = await db
      .from('saved_messages')
      .delete()
      .eq('message_id', messageId)
      .eq('profile_id', userId);
    if (error) throw new Error(errorMessage('Nao foi possivel remover dos salvos.', error));
    return 'unsaved' as const;
  }

  const { error } = await db
    .from('saved_messages')
    .insert({ message_id: messageId, profile_id: userId });

  if (error) {
    throw new Error(errorMessage('Nao foi possivel salvar mensagem.', error));
  }

  return 'saved' as const;
}

export async function fetchAttachmentsForMessages(messageIds: string[]) {
  if (messageIds.length === 0) return {};

  const { data, error } = await db
    .from('chat_file_attachments')
    .select('id,message_id,storage_bucket,storage_path,file_name,mime_type,file_size,created_at')
    .in('message_id', messageIds);

  if (error) {
    throw new Error(errorMessage('Nao foi possivel carregar anexos.', error));
  }

  return (data ?? []).reduce((map: Record<string, ChatFileAttachment[]>, attachment: ChatFileAttachment) => {
    map[attachment.message_id] ??= [];
    map[attachment.message_id].push(attachment);
    return map;
  }, {});
}

export async function createChatFileAttachment(input: {
  conversationId: string;
  messageId: string;
  fileName: string;
  mimeType: string;
  bytes: ArrayBuffer | Blob;
}) {
  const profileId = await getCurrentProfileId();
  const extension = input.fileName.includes('.') ? input.fileName.split('.').pop() : 'bin';
  const storagePath = `${input.conversationId}/${input.messageId}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('chat-attachments')
    .upload(storagePath, input.bytes, {
      contentType: input.mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(errorMessage('Nao foi possivel enviar anexo.', uploadError));
  }

  const fileSize = input.bytes instanceof Blob ? input.bytes.size : input.bytes.byteLength;
  const { data, error } = await db
    .from('chat_file_attachments')
    .insert({
      message_id: input.messageId,
      created_by: profileId,
      storage_bucket: 'chat-attachments',
      storage_path: storagePath,
      file_name: input.fileName,
      mime_type: input.mimeType,
      file_size: fileSize,
    })
    .select('id,message_id,storage_bucket,storage_path,file_name,mime_type,file_size,created_at')
    .single();

  if (error) {
    throw new Error(errorMessage('Nao foi possivel vincular anexo.', error));
  }

  return data as ChatFileAttachment;
}

export async function getChatAttachmentDownloadPayload(attachmentId: string) {
  const { data: attachment, error } = await db
    .from('chat_file_attachments')
    .select('id,storage_bucket,storage_path,file_name,mime_type,file_size')
    .eq('id', attachmentId)
    .single();

  if (error || !attachment) {
    throw new Error(errorMessage('Nao foi possivel carregar anexo.', error));
  }

  const { data: openData, error: openError } = await supabase.storage
    .from(attachment.storage_bucket)
    .createSignedUrl(attachment.storage_path, 60 * 5);

  if (openError || !openData?.signedUrl) {
    throw new Error(errorMessage('Nao foi possivel gerar link seguro.', openError));
  }

  const { data: downloadData, error: signedError } = await supabase.storage
    .from(attachment.storage_bucket)
    .createSignedUrl(attachment.storage_path, 60 * 5, {
      download: attachment.file_name ?? undefined,
    });

  if (signedError || !downloadData?.signedUrl) {
    throw new Error(errorMessage('Nao foi possivel gerar link seguro.', signedError));
  }

  return {
    url: openData.signedUrl,
    downloadUrl: downloadData.signedUrl,
    fileName: attachment.file_name as string | null,
    mimeType: attachment.mime_type as string | null,
    fileSize: attachment.file_size as number | null,
  };
}

export async function markConversationAsRead(conversationId: string) {
  const userId = await getCurrentProfileId();

  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) {
    if (isNetworkFetchError(error)) {
      console.warn('[chat] mark conversation as read skipped:', (error as { message?: string }).message ?? error);
      return;
    }
    throw new Error(errorMessage('N??o foi poss??vel atualizar leitura da conversa.', error));
  }
}

export async function markConversationAsUnread(conversationId: string) {
  const userId = await getCurrentProfileId();

  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: '1970-01-01T00:00:00.000Z' })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(errorMessage('Não foi possível marcar a conversa como não lida.', error));
  }
}

export async function setConversationArchived(conversationId: string, archived: boolean) {
  const payload = archived
    ? { archived_at: new Date().toISOString() }
    : { archived_at: null };
  const userId = await getCurrentProfileId();

  const { error } = await db
    .from('conversation_participants')
    .update(payload)
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(errorMessage('Não foi possível atualizar o status da conversa.', error));
  }
}

export async function leaveConversation(conversationId: string) {
  const userId = await getCurrentProfileId();

  const { error } = await supabase
    .from('conversation_participants')
    .delete()
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(errorMessage('Nao foi possivel sair da conversa.', error));
  }
}

export async function addConversationParticipant(conversationId: string, userId: string, role: ConversationRole = 'player') {
  const { error } = await db.rpc('add_group_participant', {
    p_conversation_id: conversationId,
    p_profile_id: userId,
    p_role: role,
  });

  if (error) {
    throw new Error(errorMessage('Nao foi possivel adicionar participante.', error));
  }
}

export async function removeConversationParticipant(conversationId: string, userId: string) {
  const { error } = await db.rpc('remove_group_participant', {
    p_conversation_id: conversationId,
    p_profile_id: userId,
  });

  if (error) {
    throw new Error(errorMessage('Nao foi possivel remover participante.', error));
  }
}

export async function updateConversationParticipantRole(conversationId: string, userId: string, role: ConversationRole) {
  const { error } = await db.rpc('update_group_participant_role', {
    p_conversation_id: conversationId,
    p_profile_id: userId,
    p_role: role,
  });

  if (error) {
    throw new Error(errorMessage('Nao foi possivel atualizar permissao do participante.', error));
  }
}

export async function getOrCreateMatchConversation(matchId: string) {
  const { data, error } = await supabase.rpc('ensure_match_conversation', { p_match_id: matchId });

  if (error || !data) {
    throw new Error(errorMessage('Não foi possível carregar a conversa da partida.', error));
  }

  return data as string;
}

export async function createPrivateConversation(otherUserId: string, initialMessage?: string) {
  const { data, error } = await supabase.rpc('create_private_conversation', {
    p_other_user_id: otherUserId,
    p_initial_message: initialMessage,
  });

  if (error || !data) {
    throw new Error(errorMessage('Não foi possível iniciar conversa privada.', error));
  }

  return data as string;
}

export async function fetchConversationInfo(conversationId: string): Promise<ConversationInfoData> {
  const me = await getCurrentProfileId();
  const { data: conversation, error } = await (supabase as any)
    .from('conversations')
    .select('id,type,group_name,group_description,group_avatar_url,match_id')
    .eq('id', conversationId)
    .single();
  if (error || !conversation) throw new Error(errorMessage('Nao foi possivel carregar info da conversa.', error));
  let matchInfo: { title: string | null; description: string | null } | null = null;
  if (conversation.match_id) {
    const { data } = await (supabase as any)
      .from('matches')
      .select('title,description')
      .eq('id', conversation.match_id)
      .maybeSingle();
    matchInfo = data ?? null;
  }

  const { data: participants } = await (supabase as any)
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId);
  const membersCount = (participants ?? []).length;
  const partnerId = conversation.type === 'private'
    ? ((participants ?? []).find((p: any) => p.user_id !== me)?.user_id ?? null)
    : null;

  let partnerProfile: any = null;
  if (partnerId) {
    const { data } = await (supabase as any).from('profiles').select('id,full_name,phone,avatar_url').eq('id', partnerId).maybeSingle();
    partnerProfile = data ?? null;
  }

  const { data: messages } = await (supabase as any)
    .from('messages')
    .select('id,sender_id,metadata')
    .eq('conversation_id', conversationId);
  const rows = messages ?? [];
  const messageIds = rows.map((row: any) => row.id);
  const mySentCount = rows.filter((row: any) => row.sender_id === me).length;
  const mediaCount = rows.filter((row: any) => String(row.metadata?.attachment_kind ?? '') === 'image').length;
  const videoCount = rows.filter((row: any) => String(row.metadata?.attachment_kind ?? '') === 'video').length;
  const audioCount = rows.filter((row: any) => String(row.metadata?.attachment_kind ?? '') === 'audio').length;

  const { count: pinnedCount } = await (supabase as any)
    .from('pinned_messages')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', conversationId);
  const { count: starredCount } = await (supabase as any)
    .from('saved_messages')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', me)
    .in('message_id', messageIds.length > 0 ? messageIds : ['00000000-0000-0000-0000-000000000000']);

  const { data: setting } = await (supabase as any)
    .from('chat_conversation_notification_settings')
    .select('notifications_enabled')
    .eq('conversation_id', conversationId)
    .eq('profile_id', me)
    .maybeSingle();

  return {
    id: conversation.id,
    type: conversation.type,
    title: conversation.type === 'private'
      ? (partnerProfile?.full_name ?? 'Atleta')
      : (conversation.group_name ?? matchInfo?.title ?? 'Grupo'),
    avatarUrl: conversation.type === 'private' ? (partnerProfile?.avatar_url ?? null) : (conversation.group_avatar_url ?? null),
    description: conversation.group_description ?? matchInfo?.description ?? null,
    partnerId,
    partnerPhone: partnerProfile?.phone ?? null,
    mediaCount,
    videoCount,
    audioCount,
    sentCount: mySentCount,
    starredCount: Number(starredCount ?? 0),
    pinnedCount: Number(pinnedCount ?? 0),
    notificationsEnabled: setting?.notifications_enabled ?? true,
    membersCount,
  };
}

export async function setConversationNotificationsEnabled(conversationId: string, enabled: boolean) {
  const me = await getCurrentProfileId();
  const { error } = await (supabase as any)
    .from('chat_conversation_notification_settings')
    .upsert({
      conversation_id: conversationId,
      profile_id: me,
      notifications_enabled: enabled,
    }, { onConflict: 'conversation_id,profile_id' });
  if (error) throw new Error(errorMessage('Nao foi possivel atualizar notificacoes.', error));
}

export async function fetchGroupsInCommon(otherProfileId: string) {
  const me = await getCurrentProfileId();
  const { data, error } = await (supabase as any)
    .rpc('get_groups_in_common_with_profile', { p_other_profile_id: otherProfileId, p_me: me });
  if (error) throw new Error(errorMessage('Nao foi possivel carregar grupos em comum.', error));
  return (data ?? []) as Array<{ conversation_id: string; group_name: string; members_count: number }>;
}

export async function updateGroupInfo(input: { conversationId: string; name: string; description?: string | null; avatarUrl?: string | null }) {
  const { error } = await (supabase as any).rpc('update_group_info', {
    p_conversation_id: input.conversationId,
    p_name: input.name,
    p_description: input.description ?? null,
    p_avatar_url: input.avatarUrl ?? null,
  });
  if (error) throw new Error(errorMessage('Nao foi possivel atualizar grupo.', error));
}

export async function createCustomGroupConversation(input: {
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
  memberIds?: string[];
  autoArchiveEnabled?: boolean;
}) {
  const { data, error } = await (supabase as any).rpc('create_custom_group_conversation', {
    p_name: input.name,
    p_description: input.description ?? null,
    p_avatar_url: input.avatarUrl ?? null,
    p_member_ids: input.memberIds ?? [],
    p_auto_archive_enabled: input.autoArchiveEnabled ?? false,
  });

  if (error || !data) {
    throw new Error(errorMessage('Nao foi possivel criar grupo.', error));
  }

  return data as string;
}

export async function uploadCustomGroupAvatar(input: {
  fileName: string;
  mimeType: string;
  bytes: ArrayBuffer | Blob;
}) {
  const profileId = await getCurrentProfileId();
  const extension = input.fileName.includes('.') ? input.fileName.split('.').pop() : 'jpg';
  const storagePath = `group-avatars/${profileId}/${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from('chat-attachments')
    .upload(storagePath, input.bytes, {
      contentType: input.mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(errorMessage('Nao foi possivel enviar foto do grupo.', error));
  }

  const { data } = supabase.storage
    .from('chat-attachments')
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

export async function searchChatProfiles(query: string, limit = 20) {
  const q = query.trim();
  if (!q) return [] as ChatProfileSearchResult[];
  const me = await getCurrentProfileId();

  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('id,full_name,avatar_url')
    .neq('id', me)
    .ilike('full_name', `%${q}%`)
    .order('full_name', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(errorMessage('Nao foi possivel buscar usuarios.', error));
  }

  return (data ?? []).map((row: any) => ({
    id: row.id as string,
    full_name: (row.full_name ?? 'Atleta') as string,
    avatar_url: (row.avatar_url ?? null) as string | null,
  })) as ChatProfileSearchResult[];
}

export type ChatRealtimePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  new?: Record<string, unknown>;
  old?: Record<string, unknown>;
};

export function subscribeConversationMessages(
  conversationId: string,
  onChange: (payload?: ChatRealtimePayload) => void,
) {
  const channel = supabase
    .channel(nextRealtimeTopic(`messages:${conversationId}`))
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onChange(payload as ChatRealtimePayload),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeConversationSocialState(
  conversationId: string,
  onChange: () => void,
) {
  const channel = supabase
    .channel(nextRealtimeTopic(`conversation-social:${conversationId}`))
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'chat_message_receipts', filter: `conversation_id=eq.${conversationId}` },
      onChange,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'message_reactions', filter: `conversation_id=eq.${conversationId}` },
      onChange,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pinned_messages', filter: `conversation_id=eq.${conversationId}` },
      onChange,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'chat_file_attachments' },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeChatList(onChange: () => void) {
  const channel = supabase
    .channel(nextRealtimeTopic('chat-list'))
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
