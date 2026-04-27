import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

async function safeHaptic(task: () => Promise<void>) {
  if (isWeb) return;

  try {
    await task();
  } catch {
    // Best-effort haptics should never break UI flow.
  }
}

export async function impactLight() {
  await safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export async function selectionTick() {
  await safeHaptic(() => Haptics.selectionAsync());
}

export async function actionSuccess() {
  await safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
