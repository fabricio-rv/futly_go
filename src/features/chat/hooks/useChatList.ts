import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  fetchChatList,
  getCurrentUserId,
  subscribeChatList,
  type ChatListFilter,
  type ChatListRow,
} from '@/src/features/chat/services/chatService';
import { formatRelativeChatTime, formatWeekdayTime, toInitials } from '@/src/features/chat/utils/formatters';
import type { ConversationPreview } from '@/src/components/features/store/data';

export function useChatList() {
  const [filter, setFilter] = useState<ChatListFilter>('todas');
  const [rows, setRows] = useState<ChatListRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [list, userId] = await Promise.all([fetchChatList(), getCurrentUserId()]);
      setRows(list);
      setCurrentUserId(userId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar conversas.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const boot = async () => {
      await load();
      if (!active) return;
    };

    void boot();

    const unsubscribe = subscribeChatList(() => {
      void load();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [load]);

  const summary = useMemo(() => {
    const activeRows = rows.filter((row) => !row.is_archived);
    const unread = activeRows.filter((row) => (row.unread_count ?? 0) > 0).length;

    return {
      activeCount: activeRows.length,
      unreadCount: unread,
    };
  }, [rows]);

  const mapped = useMemo(() => {
    return rows.map((row) => {
      const isPrivate = row.conversation_type === 'private';
      const matchLabel = formatWeekdayTime(row.match_date, row.match_time);
      const title = isPrivate
        ? (row.private_partner_name ?? 'Conversa privada')
        : `${row.match_venue_name ?? row.match_title ?? 'Partida'}${matchLabel ? ` - ${matchLabel}` : ''}`;

      const author = row.last_message_sender_id
        ? row.last_message_sender_id === currentUserId
          ? 'Voce'
          : (row.last_message_sender_name ?? 'Atleta')
        : 'Sistema';

      const avatarSource = isPrivate
        ? row.private_partner_name
        : (row.match_venue_name ?? row.match_title ?? 'Partida');

      const timeLabel = formatRelativeChatTime(row.last_message_created_at ?? row.last_message_at ?? row.created_at);

      const unreadCount = Math.max(0, row.unread_count ?? 0);
      const checkStatus = unreadCount > 0
        ? undefined
        : row.last_message_sender_id === currentUserId
          ? 'read'
          : 'sent';

      const preview: ConversationPreview = {
        id: row.conversation_id,
        title,
        message: row.last_message_content ?? 'Sem mensagens ainda',
        author,
        time: timeLabel,
        avatar: toInitials(avatarSource),
        avatarTone: row.is_archived
          ? 'gold'
          : row.my_role === 'host'
            ? 'ok'
            : isPrivate
              ? 'brown'
              : 'blue',
        unreadCount: unreadCount > 0 ? unreadCount : undefined,
        unread: unreadCount > 0,
        privateTag: isPrivate ? 'PRIVADO' : undefined,
        checkStatus,
        archived: row.is_archived,
      };

      return {
        row,
        preview,
      };
    });
  }, [currentUserId, rows]);

  const visibleActive = useMemo(() => {
    return mapped
      .filter(({ row }) => {
        if (filter === 'arquivadas') return false;
        if (row.is_archived) return false;
        if (filter === 'host') return row.my_role === 'host';
        if (filter === 'jogador') return row.my_role === 'player';
        return true;
      })
      .map(({ preview }) => preview);
  }, [filter, mapped]);

  const visibleArchived = useMemo(() => {
    if (filter !== 'arquivadas' && filter !== 'todas') return [];

    return mapped
      .filter(({ row }) => row.is_archived)
      .map(({ preview }) => preview);
  }, [filter, mapped]);

  return {
    filter,
    setFilter,
    loading,
    error,
    summary,
    visibleActive,
    visibleArchived,
    refresh: load,
  };
}
