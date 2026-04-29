import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchUnreadChatCount, subscribeChatList } from '@/src/features/chat/services/chatService';

export function useUnreadChatCount() {
  const [count, setCount] = useState(0);
  const mountedRef = useRef(true);
  const loadSequenceRef = useRef(0);

  const load = useCallback(async () => {
    const loadSequence = ++loadSequenceRef.current;
    try {
      const nextCount = await fetchUnreadChatCount();
      if (mountedRef.current && loadSequence === loadSequenceRef.current) setCount(nextCount);
    } catch {
      if (mountedRef.current && loadSequence === loadSequenceRef.current) setCount(0);
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

  return count;
}
