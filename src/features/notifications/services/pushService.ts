import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '@/src/lib/supabase';
import { getCurrentProfileId } from '@/src/features/chat/services/chatService';

type UntypedSupabase = ReturnType<typeof supabase.schema> extends never ? never : any;
const db = supabase as UntypedSupabase;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getExpoProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    undefined
  );
}

export async function registerChatPushToken() {
  if (Platform.OS === 'web') return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('chat', {
      name: 'Chat',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#22B76C',
    });
  }

  const projectId = getExpoProjectId();
  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );
  const profileId = await getCurrentProfileId();

  const { error } = await db
    .from('push_tokens')
    .upsert(
      {
        profile_id: profileId,
        expo_push_token: tokenResponse.data,
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id,expo_push_token' },
    );

  if (error) throw new Error(error.message);
  return tokenResponse.data;
}

export function addChatNotificationResponseListener(
  onConversationOpen: (conversationId: string) => void,
) {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as {
      conversationId?: unknown;
      conversation_id?: unknown;
    };
    const conversationId =
      typeof data.conversationId === 'string'
        ? data.conversationId
        : typeof data.conversation_id === 'string'
          ? data.conversation_id
          : null;

    if (conversationId) onConversationOpen(conversationId);
  });

  return () => subscription.remove();
}
