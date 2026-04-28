import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import {
  addChatNotificationResponseListener,
  registerChatPushToken,
} from '@/src/features/notifications/services/pushService';

type ChatPushProviderProps = {
  children: React.ReactNode;
};

export function ChatPushProvider({ children }: ChatPushProviderProps) {
  const router = useRouter();

  useEffect(() => {
    registerChatPushToken().catch((error) => {
      console.warn('[ChatPushProvider] push token registration skipped:', error);
    });

    return addChatNotificationResponseListener((conversationId) => {
      router.push(`/(app)/conversations/${conversationId}`);
    });
  }, [router]);

  return children;
}
