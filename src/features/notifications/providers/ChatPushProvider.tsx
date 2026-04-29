import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/src/contexts/AuthContext';
import {
  addChatNotificationResponseListener,
  registerChatPushToken,
} from '@/src/features/notifications/services/pushService';

type ChatPushProviderProps = {
  children: React.ReactNode;
};

export function ChatPushProvider({ children }: ChatPushProviderProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    registerChatPushToken().catch((error) => {
      console.warn('[ChatPushProvider] push token registration skipped:', error);
    });

    return addChatNotificationResponseListener((conversationId) => {
      router.push(`/(app)/conversations/${conversationId}`);
    });
  }, [isAuthenticated, router]);

  return children;
}
