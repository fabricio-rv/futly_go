import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  deleteOwnMessage,
  fetchAttachmentsForMessages,
  fetchChatList,
  fetchConversationMessages,
  fetchConversationParticipants,
  getConversationMessageReceiptMap,
  getConversationMessageReactions,
  getConversationPinnedMessageIds,
  getChatAttachmentDownloadPayload,
  getMySavedMessageIds,
  getCurrentUserId,
  markConversationMessagesDelivered,
  markConversationMessagesRead,
  markConversationAsRead,
  markConversationAsUnread,
  sendMessage,
  setConversationArchived,
  subscribeConversationSocialState,
  subscribeConversationMessages,
  toggleMessageReaction,
  togglePinMessage,
  toggleSaveMessage,
  type MessageReceiptMap,
  type ReactionGroup,
} from '@/src/features/chat/services/chatService';
import { formatRelativeChatTime, formatWeekdayTime, toInitials } from '@/src/features/chat/utils/formatters';
import type { ChatMessage } from '@/src/components/features/store/data';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import { supabase } from '@/src/lib/supabase';
import { decryptMessage, encryptMessage } from '@/src/features/chat/services/chatCrypto';

type HeaderData = {
  title: string;
  subtitle: string;
  avatar: string;
  bannerTitle: string;
  bannerSubtitle: string;
  matchId: string | null;
  isArchived: boolean;
};

function isNetworkFetchError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const message = String((error as { message?: unknown }).message ?? '').toLowerCase();
  return message.includes('failed to fetch') || message.includes('network request failed');
}

function parseReplyText(content: string) {
  const match = content.match(/^>\s?(.+)\n([\s\S]+)$/);
  if (!match) return { text: content, replyTo: undefined };

  return {
    replyTo: match[1]?.trim(),
    text: match[2]?.trim() || content,
  };
}

function cleanMessageText(text: string) {
  const normalized = text.replace(/\u200B/g, '').trim();
  if (!normalized) return '';
  if (/^\[(Audio|Foto|Video|Arquivo)/i.test(normalized)) return '';
  return normalized;
}

export function useConversationThread(conversationId: string) {
  const { t, currentLanguage } = useTranslation('chat');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [header, setHeader] = useState<HeaderData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Array<{ user_id: string; full_name: string; avatar_url?: string | null; role: 'host' | 'player' | 'system' }>>([]);
  const [messageReceipts, setMessageReceipts] = useState<MessageReceiptMap>({});
  const [reactions, setReactions] = useState<Record<string, ReactionGroup[]>>({});
  const [pinnedMessageIds, setPinnedMessageIds] = useState<string[]>([]);
  const [savedMessageIds, setSavedMessageIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const channelSubscribedRef = useRef(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [presenceRetryToken, setPresenceRetryToken] = useState(0);
  const attachmentUrlCacheRef = useRef<Record<string, { url: string; expiresAt: number }>>({});
  type SendOptions = {
    metadata?: Record<string, unknown>;
    optimisticText?: string;
    optimisticAttachment?: ChatMessage['attachment'];
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [rows, rawMessages, participants, userId] = await Promise.all([
        fetchChatList(),
        fetchConversationMessages(conversationId),
        fetchConversationParticipants(conversationId),
        getCurrentUserId(),
      ]);
      setCurrentUserId(userId);

      const current = rows.find((row) => row.conversation_id === conversationId);
      if (!current) {
        throw new Error(t('errors.conversationNotFound', 'Conversa não encontrada.'));
      }

      const participantById = new Map(participants.map((participant) => [participant.user_id, participant]));

      const formattedMatch = formatWeekdayTime(current.match_date, current.match_time, currentLanguage);
      const title = current.conversation_type === 'private'
        ? (current.private_partner_name ?? t('detail.privateConversationTitle', 'Conversa privada'))
        : `${current.match_venue_name ?? current.match_title ?? t('detail.matchFallbackTitle', 'Partida')}${formattedMatch ? ` - ${formattedMatch}` : ''}`;

      const onlineLabel = t('detail.onlineLabel', 'online');
      const athletesLabel = t('detail.athletesLabel', 'atletas');

      const host = participants.find((participant) => participant.role === 'host');
      const subtitle = current.conversation_type === 'private'
        ? t('detail.privateSubtitle', '{{name}} - {{online}}', {
            name: current.private_partner_name ?? t('detail.athleteFallback', 'Atleta'),
            online: onlineLabel,
          })
        : t('detail.groupSubtitle', '{{host}} + {{count}} {{athletes}} - {{online}}', {
            host: host?.full_name ?? t('roles.host', 'Host'),
            count: Math.max(participants.length - 1, 0),
            athletes: athletesLabel,
            online: onlineLabel,
          });

      const bannerTitle = current.conversation_type === 'private'
        ? t('detail.privateConversationTitle', 'Conversa privada')
        : `${formattedMatch}${current.match_date ? ` - ${current.match_date}` : ''}`;

      const bannerSubtitle = current.conversation_type === 'private'
        ? t('detail.privateConversationSubtitle', 'Troca direta entre atletas do Futly Go')
        : `${current.match_venue_name ?? current.match_title ?? t('detail.matchBannerTitle', 'Partida marcada')} - ${t('detail.autoArchiveShort', 'auto-arquiva 7 dias apos o jogo')}`;

      const decryptedMessages = await Promise.all(
        rawMessages.map(async (message) => ({
          ...message,
          content: message.message_type === 'system' ? message.content : await decryptMessage(conversationId, message.content),
        })),
      );

      const messageIds = decryptedMessages.map((message) => message.id);
      const incomingMessageIds = decryptedMessages
        .filter((message) => message.sender_id && message.sender_id !== userId)
        .map((message) => message.id);
      const ownMessageIds = decryptedMessages
        .filter((message) => message.sender_id === userId)
        .map((message) => message.id);

      const [
        receiptMap,
        reactionMap,
        pinnedIds,
        savedIds,
        attachmentsByMessageId,
      ] = await Promise.all([
        getConversationMessageReceiptMap(ownMessageIds).catch(() => ({} as MessageReceiptMap)),
        getConversationMessageReactions(messageIds).catch(() => ({})),
        getConversationPinnedMessageIds(conversationId).catch(() => []),
        getMySavedMessageIds(messageIds).catch(() => []),
        fetchAttachmentsForMessages(messageIds).catch(() => ({} as Record<string, Array<{ id: string; file_name: string | null; mime_type: string | null }>>)),
      ]);
      const attachmentUrlById: Record<string, string> = {};
      const attachmentDownloadUrlById: Record<string, string> = {};
      const nowMs = Date.now();
      await Promise.all(
        (Object.values(attachmentsByMessageId).flat() as Array<{ id: string }>)
          .map(async (attachment) => {
            const cached = attachmentUrlCacheRef.current[attachment.id];
            if (cached && cached.expiresAt > nowMs + 30_000) {
              attachmentUrlById[attachment.id] = cached.url;
              return;
            }
            try {
              const payload = await getChatAttachmentDownloadPayload(attachment.id);
              attachmentUrlById[attachment.id] = payload.url;
              attachmentDownloadUrlById[attachment.id] = payload.downloadUrl;
              attachmentUrlCacheRef.current[attachment.id] = {
                url: payload.url,
                expiresAt: nowMs + 4 * 60 * 1000,
              };
            } catch {
              attachmentUrlById[attachment.id] = '';
            }
          }),
      );

      const chatMessages: ChatMessage[] = decryptedMessages.map((message) => {
        if (message.message_type === 'system' || !message.sender_id) {
          return {
            id: message.id,
            kind: 'system',
            senderId: message.sender_id,
            text: message.content,
          };
        }

        const participant = participantById.get(message.sender_id);
        const mine = message.sender_id === userId;
        const parsed = parseReplyText(message.content);
        const othersIds = participants
          .map((entry) => entry.user_id)
          .filter((id) => id !== userId);
        const receipt = receiptMap[message.id];
        const allOthersRead = othersIds.length > 0
          && othersIds.every((id) => receipt?.read_by?.includes(id));

        const firstAttachment = attachmentsByMessageId[message.id]?.[0];
        const attachment = (() => {
          if (!firstAttachment) return undefined;
          const mime = firstAttachment.mime_type ?? '';
          const kind = mime.startsWith('image/')
            ? 'image'
            : mime.startsWith('video/')
              ? 'video'
              : mime.startsWith('audio/')
                ? 'audio'
                : 'document';
          return {
            id: firstAttachment.id,
            kind,
            fileName: firstAttachment.file_name,
            mimeType: firstAttachment.mime_type,
            url: attachmentUrlById[firstAttachment.id] || null,
            downloadUrl: attachmentDownloadUrlById[firstAttachment.id] || null,
            previewUrl: kind === 'document' && (firstAttachment.mime_type ?? '').includes('pdf')
              ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(attachmentUrlById[firstAttachment.id] || '')}`
              : null,
            durationSec: Number((message.metadata as Record<string, unknown> | undefined)?.attachment_duration_sec ?? 0) || null,
          } as ChatMessage['attachment'];
        })();

        const cleanedText = cleanMessageText(parsed.text) || undefined;
        if (!attachment && !cleanedText) return null as unknown as ChatMessage;

        return {
          id: message.id,
          kind: mine ? 'me' : 'them',
          senderId: message.sender_id,
          text: attachment ? undefined : cleanedText,
          attachment,
          replyTo: parsed.replyTo,
          author: participant?.full_name ?? t('detail.athleteFallback', 'Atleta'),
          avatarUrl: participant?.avatar_url ?? null,
          role: participant?.role === 'host'
            ? t('roles.host', 'Host')
            : participant?.role === 'player'
              ? t('roles.player', 'Jogador')
              : undefined,
          time: formatRelativeChatTime(message.created_at, currentLanguage),
          receipt: mine
            ? allOthersRead ? 'read' : 'delivered'
            : undefined,
        };
      }).filter(Boolean) as ChatMessage[];

      setHeader({
        title,
        subtitle,
        avatar: toInitials(current.conversation_type === 'private' ? current.private_partner_name : current.match_venue_name ?? current.match_title),
        bannerTitle,
        bannerSubtitle,
        matchId: current.match_id,
        isArchived: current.is_archived,
      });

      setMessages(chatMessages);
      setParticipants(participants);
      setMessageReceipts(receiptMap);
      setReactions(reactionMap);
      setPinnedMessageIds(pinnedIds);
      setSavedMessageIds(savedIds);
      void Promise.allSettled([
        markConversationMessagesDelivered(incomingMessageIds),
        markConversationMessagesRead(incomingMessageIds),
        markConversationAsRead(conversationId),
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.loadConversationFailed', 'Erro ao carregar conversa.');
      if (messages.length > 0 && isNetworkFetchError(err)) {
        console.warn('[chat] transient fetch error while refreshing conversation:', message);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [conversationId, currentLanguage, messages.length, t]);

  useEffect(() => {
    void load();

    const unsubscribe = subscribeConversationMessages(conversationId, () => {
      void load();
    });
    const unsubscribeSocial = subscribeConversationSocialState(conversationId, () => {
      void load();
    });

    return () => {
      unsubscribe();
      unsubscribeSocial();
    };
  }, [conversationId, load]);

  useEffect(() => {
    if (!currentUserId || messages.length === 0) return;

    const syncReadReceipts = () => {
      const incomingMessageIds = messages
        .filter((message) => message.senderId && message.senderId !== currentUserId)
        .map((message) => message.id);

      if (incomingMessageIds.length === 0) return;
      void markConversationMessagesRead(incomingMessageIds).catch(() => undefined);
    };

    syncReadReceipts();
    const intervalId = setInterval(syncReadReceipts, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [currentUserId, messages]);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const channel = supabase.channel(`conversation-presence:${conversationId}`, {
      config: { presence: { key: currentUserId } },
    });
    channelRef.current = channel;

    const syncPresence = () => {
      const state = channel.presenceState() as Record<string, Array<{ userId?: string; typing?: boolean; typingExpiresAt?: string | null }>>;
      const now = Date.now();
      const nextOnline = new Set<string>();
      const nextTyping = new Set<string>();

      Object.values(state).forEach((entries) => {
        entries.forEach((entry) => {
          if (!entry.userId || entry.userId === currentUserId) return;
          nextOnline.add(entry.userId);
          const expiresAt = entry.typingExpiresAt ? new Date(entry.typingExpiresAt).getTime() : 0;
          if (entry.typing && expiresAt > now) nextTyping.add(entry.userId);
        });
      });

      setOnlineUserIds(Array.from(nextOnline).sort());
      setTypingUserIds(Array.from(nextTyping).sort());
    };

    const intervalId = setInterval(syncPresence, 900);

    channel
      .on('presence', { event: 'sync' }, syncPresence)
      .on('presence', { event: 'join' }, syncPresence)
      .on('presence', { event: 'leave' }, syncPresence)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const event = payload as { userId?: string; typing?: boolean; typingExpiresAt?: string | null };
        if (!event.userId || event.userId === currentUserId) return;
        const expiresAt = event.typingExpiresAt ? new Date(event.typingExpiresAt).getTime() : 0;
        setTypingUserIds((previous) => {
          const withoutUser = previous.filter((id) => id !== event.userId);
          if (!event.typing || expiresAt <= Date.now()) return withoutUser;
          return [...withoutUser, event.userId!].sort();
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          reconnectAttemptRef.current = 0;
          channelSubscribedRef.current = true;
          await channel.track({ userId: currentUserId, typing: false, typingExpiresAt: null, onlineAt: new Date().toISOString() });
          syncPresence();
          return;
        }

        if (status === 'CLOSED' || status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          channelSubscribedRef.current = false;
          if (!reconnectTimeoutRef.current) {
            const nextAttempt = reconnectAttemptRef.current + 1;
            reconnectAttemptRef.current = nextAttempt;
            const delayMs = Math.min(8000, 500 * 2 ** Math.min(nextAttempt - 1, 4));
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectTimeoutRef.current = null;
              setPresenceRetryToken((value) => value + 1);
            }, delayMs);
          }
        }
      });

    return () => {
      clearInterval(intervalId);
      channelSubscribedRef.current = false;
      setTypingUserIds([]);
      setOnlineUserIds([]);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      channel.untrack();
      supabase.removeChannel(channel);
      if (channelRef.current === channel) channelRef.current = null;
    };
  }, [conversationId, currentUserId, presenceRetryToken]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const updateTypingState = useCallback((typing: boolean) => {
    if (!currentUserId) return;
    const channel = channelRef.current;
    if (!channel) return;
    if (!channelSubscribedRef.current) return;

    const typingExpiresAt = typing ? new Date(Date.now() + 7000).toISOString() : null;
    const payload = { userId: currentUserId, typing, typingExpiresAt, onlineAt: new Date().toISOString() };

    void channel.track(payload);
    void channel.send({ type: 'broadcast', event: 'typing', payload });
  }, [currentUserId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void load();
        if (!channelSubscribedRef.current) setPresenceRetryToken((value) => value + 1);
      } else {
        updateTypingState(false);
      }
    });

    return () => {
      updateTypingState(false);
      subscription.remove();
    };
  }, [load, updateTypingState]);

  const notifyComposerChanged = useCallback((value: string) => {
    const typing = value.trim().length > 0;
    updateTypingState(typing);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (typing) {
      typingTimeoutRef.current = setTimeout(() => updateTypingState(false), 1800);
    }
  }, [updateTypingState]);

  const send = useCallback(async (content: string, options: SendOptions = {}) => {
    updateTypingState(false);
    if (!currentUserId) {
      await load();
      return null;
    }

    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const parsed = parseReplyText(content);
    const optimisticMessage: ChatMessage = {
      id: tempId,
      kind: 'me',
      senderId: currentUserId,
      text: options.optimisticText ?? parsed.text,
      attachment: options.optimisticAttachment,
      replyTo: parsed.replyTo,
      time: formatRelativeChatTime(now, currentLanguage),
      receipt: 'delivered',
    };

    setMessages((previous) => [...previous, optimisticMessage]);

    try {
      let encryptedContent = content;
      let encryptionStatus: 'encrypted' | 'unsupported' = 'encrypted';
      try {
        encryptedContent = await encryptMessage(conversationId, content);
      } catch (encryptionError) {
        encryptionStatus = 'unsupported';
        console.warn('Chat E2EE unavailable in this runtime; sending plaintext fallback.', encryptionError);
      }
      const persisted = await sendMessage(conversationId, encryptedContent, {
        metadata: {
          ...(options.metadata ?? {}),
          encryptionStatus,
        },
      });
      if (persisted) {
        setMessages((previous) =>
          previous.map((message) =>
            message.id === tempId
              ? {
                  ...optimisticMessage,
                  id: persisted.id,
                  time: formatRelativeChatTime(persisted.created_at, currentLanguage),
                }
              : message,
          ),
        );
        return persisted.id;
      }
      await markConversationAsRead(conversationId);
    } catch (error) {
      setMessages((previous) => previous.filter((message) => message.id !== tempId));
      await load();
      throw error;
    }
    return null;
  }, [conversationId, currentLanguage, currentUserId, load, updateTypingState]);

  const markUnread = useCallback(async () => {
    await markConversationAsUnread(conversationId);
    await load();
  }, [conversationId, load]);

  const setArchived = useCallback(async (archived: boolean) => {
    const previous = header;
    setHeader((current) => current ? { ...current, isArchived: archived } : current);
    try {
      await setConversationArchived(conversationId, archived);
    } catch (error) {
      setHeader(previous);
      await load();
      throw error;
    }
  }, [conversationId, load]);

  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    const previous = reactions;
    setReactions((current) => {
      const groups = current[messageId] ?? [];
      const existing = groups.find((group) => group.reactedByMe);
      const same = existing?.emoji === emoji;
      const nextGroups = same
        ? groups
            .map((group) => group.emoji === emoji
              ? { ...group, count: Math.max(0, group.count - 1), reactedByMe: false, profileIds: group.profileIds.filter((id) => id !== currentUserId) }
              : group)
            .filter((group) => group.count > 0)
        : [
            ...groups
              .map((group) => group.reactedByMe
                ? { ...group, count: Math.max(0, group.count - 1), reactedByMe: false, profileIds: group.profileIds.filter((id) => id !== currentUserId) }
                : group)
              .filter((group) => group.count > 0),
            { emoji, count: 1, reactedByMe: true, profileIds: currentUserId ? [currentUserId] : [] },
          ];

      return { ...current, [messageId]: nextGroups };
    });

    try {
      await toggleMessageReaction(messageId, emoji);
    } catch (error) {
      setReactions(previous);
      await load();
      throw error;
    }
  }, [currentUserId, load, reactions]);

  const togglePin = useCallback(async (messageId: string) => {
    const wasPinned = pinnedMessageIds.includes(messageId);
    setPinnedMessageIds((current) => wasPinned ? current.filter((id) => id !== messageId) : [...current, messageId]);
    try {
      await togglePinMessage(conversationId, messageId);
    } catch (error) {
      setPinnedMessageIds((current) => wasPinned ? [...current, messageId] : current.filter((id) => id !== messageId));
      await load();
      throw error;
    }
  }, [conversationId, load, pinnedMessageIds]);

  const toggleSave = useCallback(async (messageId: string) => {
    const wasSaved = savedMessageIds.includes(messageId);
    setSavedMessageIds((current) => wasSaved ? current.filter((id) => id !== messageId) : [...current, messageId]);
    try {
      await toggleSaveMessage(messageId);
    } catch (error) {
      setSavedMessageIds((current) => wasSaved ? [...current, messageId] : current.filter((id) => id !== messageId));
      await load();
      throw error;
    }
  }, [load, savedMessageIds]);

  const deleteMessage = useCallback(async (messageId: string) => {
    const previous = messages;
    setMessages((current) => current.filter((message) => message.id !== messageId));
    try {
      await deleteOwnMessage(messageId);
    } catch (error) {
      setMessages(previous);
      await load();
      throw error;
    }
  }, [load, messages]);

  const canSend = useMemo(() => !loading, [loading]);

  return {
    loading,
    error,
    header,
    messages,
    participants,
    messageReceipts,
    reactions,
    pinnedMessageIds,
    savedMessageIds,
    currentUserId,
    typingUserIds,
    onlineUserIds,
    canSend,
    refresh: load,
    send,
    markUnread,
    setArchived,
    toggleReaction,
    togglePin,
    toggleSave,
    deleteMessage,
    notifyComposerChanged,
    updateTypingState,
  };
}
