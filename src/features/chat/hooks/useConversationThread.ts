import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  fetchChatList,
  fetchConversationMessages,
  fetchConversationParticipants,
  getCurrentUserId,
  markConversationAsRead,
  markConversationAsUnread,
  sendMessage,
  setConversationArchived,
  subscribeConversationMessages,
} from '@/src/features/chat/services/chatService';
import { formatRelativeChatTime, formatWeekdayTime, toInitials } from '@/src/features/chat/utils/formatters';
import type { ChatMessage } from '@/src/components/features/store/data';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

type HeaderData = {
  title: string;
  subtitle: string;
  avatar: string;
  bannerTitle: string;
  bannerSubtitle: string;
  matchId: string | null;
  isArchived: boolean;
};

export function useConversationThread(conversationId: string) {
  const { t, currentLanguage } = useTranslation('chat');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [header, setHeader] = useState<HeaderData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Array<{ user_id: string; full_name: string; role: 'host' | 'player' | 'system' }>>([]);

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

      const chatMessages: ChatMessage[] = rawMessages.map((message) => {
        if (message.message_type === 'system' || !message.sender_id) {
          return {
            id: message.id,
            kind: 'system',
            text: message.content,
          };
        }

        const participant = participantById.get(message.sender_id);
        const mine = message.sender_id === userId;

        return {
          id: message.id,
          kind: mine ? 'me' : 'them',
          text: message.content,
          author: participant?.full_name ?? t('detail.athleteFallback', 'Atleta'),
          role: participant?.role === 'host'
            ? t('roles.host', 'Host')
            : participant?.role === 'player'
              ? t('roles.player', 'Jogador')
              : undefined,
          time: formatRelativeChatTime(message.created_at, currentLanguage),
        };
      });

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
      await markConversationAsRead(conversationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.loadConversationFailed', 'Erro ao carregar conversa.');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [conversationId, currentLanguage, t]);

  useEffect(() => {
    void load();

    const unsubscribe = subscribeConversationMessages(conversationId, () => {
      void load();
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId, load]);

  const send = useCallback(async (content: string) => {
    await sendMessage(conversationId, content);
    await markConversationAsRead(conversationId);
  }, [conversationId]);

  const markUnread = useCallback(async () => {
    await markConversationAsUnread(conversationId);
    await load();
  }, [conversationId, load]);

  const setArchived = useCallback(async (archived: boolean) => {
    await setConversationArchived(conversationId, archived);
    await load();
  }, [conversationId, load]);

  const canSend = useMemo(() => !loading, [loading]);

  return {
    loading,
    error,
    header,
    messages,
    participants,
    canSend,
    refresh: load,
    send,
    markUnread,
    setArchived,
  };
}
