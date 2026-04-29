import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  fetchChatList,
  getCurrentUserId,
  subscribeChatList,
  type ChatListFilter,
  type ChatListRow,
} from '@/src/features/chat/services/chatService';
import { formatLastSeenBrazil, formatRelativeChatTime, formatWeekdayTime, isOnlineByLastSeen, toInitials } from '@/src/features/chat/utils/formatters';
import type { ConversationPreview } from '@/src/components/features/store/data';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

export function useChatList() {
  const { t, currentLanguage } = useTranslation('chat');
  const [filter, setFilter] = useState<ChatListFilter>('todas');
  const [rows, setRows] = useState<ChatListRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const loadSequenceRef = useRef(0);

  const load = useCallback(async () => {
    const loadSequence = ++loadSequenceRef.current;
    setLoading(true);
    setError(null);

    try {
      const [list, userId] = await Promise.all([fetchChatList(), getCurrentUserId()]);
      if (!mountedRef.current || loadSequence !== loadSequenceRef.current) return;
      setRows(list);
      setCurrentUserId(userId);
    } catch (err) {
      if (!mountedRef.current || loadSequence !== loadSequenceRef.current) return;
      const message = err instanceof Error ? err.message : 'Erro ao carregar conversas.';
      setError(message);
    } finally {
      if (mountedRef.current && loadSequence === loadSequenceRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    void load();

    const unsubscribe = subscribeChatList(() => {
      void load();
    });

    return () => {
      mountedRef.current = false;
      loadSequenceRef.current += 1;
      unsubscribe();
    };
  }, [load]);

  const summary = useMemo(() => {
    const activeRows = rows.filter((row) => !row.is_archived);
    const archivedRows = rows.filter((row) => row.is_archived);
    const unread = activeRows.filter((row) => (row.unread_count ?? 0) > 0).length;
    const hostRows = activeRows.filter((row) => row.my_role === 'host');
    const playerRows = activeRows.filter((row) => row.my_role === 'player');

    return {
      activeCount: activeRows.length,
      allCount: activeRows.length,
      archivedCount: archivedRows.length,
      hostCount: hostRows.length,
      playerCount: playerRows.length,
      unreadCount: unread,
    };
  }, [rows]);

  const mapped = useMemo(() => {
    const parseAttachmentPreview = (rawText: string) => {
      const text = (rawText ?? '').replace(/\u200B/g, '').trim();
      const marker = text.match(/^\[(Audio|Foto|Imagem|Image|Video|Vídeo|Arquivo|Documento)(?:\s+([^\]]+))?\]\s*(.*)$/i);
      if (!marker) return { kind: 'text' as const, label: text || t('messages.noMessagesYet', 'Sem mensagens ainda') };

      const kindRaw = (marker[1] ?? '').toLowerCase();
      const extraRaw = (marker[2] ?? '').trim();
      const durationMatch = extraRaw.match(/(\d+)\s*s/i);
      const durationSec = durationMatch ? Number(durationMatch[1]) : null;
      const fileName = (marker[3] ?? '').trim();

      if (kindRaw.includes('audio')) return { kind: 'audio' as const, label: durationSec ? `Áudio ${durationSec}s` : 'Áudio' };
      if (kindRaw.includes('foto') || kindRaw.includes('imagem') || kindRaw.includes('image')) return { kind: 'image' as const, label: 'Imagem' };
      if (kindRaw.includes('video') || kindRaw.includes('vídeo')) return { kind: 'video' as const, label: 'Vídeo' };

      const extension = extraRaw || (fileName.includes('.') ? fileName.split('.').pop()?.toUpperCase() : '');
      return { kind: 'document' as const, label: extension ? `Documento (${extension})` : 'Documento' };
    };

    const localizePreviewMessage = (text: string) => {
      const confirmedMatch = text.match(/^(.*)\sconfirmou\s+presen[cç]a\.?$/i);
      if (confirmedMatch) {
        const name = confirmedMatch[1]?.trim();
        return name
          ? `${name} ${t('messages.confirmedPresenceSnippet', 'confirmou presença')}`
          : t('messages.confirmedPresenceSnippet', 'confirmou presença');
      }

      return text;
    };

    return rows.map((row) => {
      const isPrivate = row.conversation_type === 'private';
      const matchLabel = formatWeekdayTime(row.match_date, row.match_time, currentLanguage);
      const title = isPrivate
        ? (row.private_partner_name ?? t('detail.privateConversationTitle', 'Conversa privada'))
        : row.is_custom_group
          ? (row.group_name ?? t('detail.matchFallbackTitle', 'Grupo'))
          : `${row.match_venue_name ?? row.match_title ?? t('detail.matchFallbackTitle', 'Partida')}${matchLabel ? ` - ${matchLabel}` : ''}`;

      const author = row.last_message_sender_id
        ? row.last_message_sender_id === currentUserId
          ? t('messages.you', 'Você')
          : (row.last_message_sender_name ?? t('detail.athleteFallback', 'Atleta'))
        : t('roles.system', 'Sistema');

      const avatarSource = isPrivate
        ? row.private_partner_name
        : (row.is_custom_group
          ? (row.group_name ?? 'Grupo')
          : (row.match_venue_name ?? row.match_title ?? t('detail.matchFallbackTitle', 'Partida')));

      const timeLabel = formatRelativeChatTime(row.last_message_created_at ?? row.last_message_at ?? row.created_at, currentLanguage);

      const unreadCount = Math.max(0, row.unread_count ?? 0);
      const privateLastSeenAt = row.private_partner_last_seen_at ?? null;
      const privateIsOnline = isPrivate ? isOnlineByLastSeen(privateLastSeenAt) : false;
      const checkStatus = unreadCount > 0
        ? undefined
        : row.last_message_sender_id === currentUserId
          ? row.last_message_receipt_status ?? 'sent'
          : undefined;
      const privateOfflineLastSeenLabel = isPrivate && !privateIsOnline
        ? formatLastSeenBrazil(privateLastSeenAt)
        : '';

      const metadataKind = String((row as any).last_message_metadata?.attachment_kind ?? '').toLowerCase();
      const metadataName = String((row as any).last_message_metadata?.attachment_name ?? '').trim();
      const metadataDuration = Number((row as any).last_message_metadata?.attachment_duration_sec ?? 0);
      const metadataPreview = (() => {
        if (!metadataKind) return null;
        if (metadataKind === 'audio') return { kind: 'audio' as const, label: metadataDuration > 0 ? `Áudio ${metadataDuration}s` : 'Áudio' };
        if (metadataKind === 'image') return { kind: 'image' as const, label: 'Imagem' };
        if (metadataKind === 'video') return { kind: 'video' as const, label: 'Vídeo' };
        if (metadataKind === 'document') {
          const extension = metadataName.includes('.') ? metadataName.split('.').pop()?.toUpperCase() : '';
          return { kind: 'document' as const, label: extension ? `Documento (${extension})` : 'Documento' };
        }
        return { kind: 'document' as const, label: 'Anexo' };
      })();

      const localizedRaw = localizePreviewMessage(row.last_message_content ?? t('messages.noMessagesYet', 'Sem mensagens ainda'));
      const normalizedPreview = metadataPreview ?? parseAttachmentPreview(localizedRaw);
      const finalPreview = !metadataPreview && localizedRaw.trim().startsWith('e2ee:')
        ? { kind: 'text' as const, label: 'Mensagem protegida' }
        : normalizedPreview;

      const preview: ConversationPreview = {
        id: row.conversation_id,
        title,
        message: finalPreview.label,
        author,
        time: timeLabel,
        avatar: toInitials(avatarSource),
        avatarUrl: isPrivate ? row.private_partner_avatar_url ?? null : row.group_avatar_url ?? null,
        avatarTone: row.is_archived
          ? 'gold'
          : row.my_role === 'host'
            ? 'ok'
            : isPrivate
              ? 'brown'
              : 'blue',
        unreadCount: unreadCount > 0 ? unreadCount : undefined,
        unread: unreadCount > 0,
        privateTag: isPrivate ? t('messages.privateTag', 'PRIVADO') : undefined,
        checkStatus,
        archived: row.is_archived,
        presence: isPrivate ? (privateIsOnline ? 'online' : 'offline') : undefined,
        lastSeenLabel: privateOfflineLastSeenLabel || undefined,
        privateSeenLabel: isPrivate && !privateIsOnline && privateOfflineLastSeenLabel
          ? `visto por último ${privateOfflineLastSeenLabel}`
          : undefined,
        messageKind: finalPreview.kind,
      };

      return {
        row,
        preview,
      };
    });
  }, [currentLanguage, currentUserId, rows, t]);

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


