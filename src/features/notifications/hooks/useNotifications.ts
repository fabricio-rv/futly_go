import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  fetchNotifications,
  fetchRecentActions,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeNotifications,
} from '@/src/features/notifications/services/notificationsService';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
  }>>([]);
  const [recentActions, setRecentActions] = useState<Array<{
    id: string;
    title: string;
    body: string;
    createdAt: string;
    type: 'request' | 'rating' | 'match';
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [notificationRows, actionRows] = await Promise.all([fetchNotifications(), fetchRecentActions()]);
      setNotifications(
        notificationRows.map((row) => ({
          id: row.id,
          title: row.title,
          body: row.body,
          isRead: row.is_read,
          createdAt: row.created_at,
        })),
      );
      setRecentActions(actionRows);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar notificacoes.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    const unsubscribe = subscribeNotifications(() => {
      void load();
    });

    return () => {
      unsubscribe();
    };
  }, [load]);

  const unreadCount = useMemo(
    () => notifications.reduce((acc, item) => acc + (item.isRead ? 0 : 1), 0),
    [notifications],
  );

  const setRead = useCallback(async (notificationId: string) => {
    await markNotificationRead(notificationId);
    await load();
  }, [load]);

  const setAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    await load();
  }, [load]);

  return {
    notifications,
    recentActions,
    unreadCount,
    loading,
    error,
    refresh: load,
    setRead,
    setAllRead,
  };
}
