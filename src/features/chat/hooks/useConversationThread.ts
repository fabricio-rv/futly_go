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
        throw new Error('Conversa nao encontrada.');
      }

      const participantById = new Map(participants.map((participant) => [participant.user_id, participant]));

      const formattedMatch = formatWeekdayTime(current.match_date, current.match_time);
      const title = current.conversation_type === 'private'
        ? (current.private_partner_name ?? 'Conversa privada')
        : `${current.match_venue_name ?? current.match_title ?? 'Partida'}${formattedMatch ? ` - ${formattedMatch}` : ''}`;

      const host = participants.find((participant) => participant.role === 'host');
      const subtitle = current.conversation_type === 'private'
        ? `${current.private_partner_name ?? 'Atleta'} - online`
        : `${host?.full_name ?? 'Host'} + ${Math.max(participants.length - 1, 0)} atletas - online`;

      const bannerTitle = current.conversation_type === 'private'
        ? 'Conversa privada'
        : `${formattedMatch}${current.match_date ? ` - ${current.match_date}` : ''}`;

      const bannerSubtitle = current.conversation_type === 'private'
        ? 'Troca direta entre atletas do Futly Go'
        : `${current.match_venue_name ?? current.match_title ?? 'Partida marcada'} - auto-arquiva 7 dias apos o jogo`;

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
          author: participant?.full_name ?? 'Atleta',
          role: participant?.role === 'host' ? 'Host' : participant?.role === 'player' ? 'Jogador' : undefined,
          time: formatRelativeChatTime(message.created_at),
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
      const message = err instanceof Error ? err.message : 'Erro ao carregar conversa.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

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
