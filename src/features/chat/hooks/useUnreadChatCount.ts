import { useCallback, useEffect, useState } from 'react';

import { fetchUnreadChatCount, subscribeChatList } from '@/src/features/chat/services/chatService';

export function useUnreadChatCount() {
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    try {
      setCount(await fetchUnreadChatCount());
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    void load();
    const unsubscribe = subscribeChatList(() => {
      void load();
    });

    return unsubscribe;
  }, [load]);

  return count;
}
