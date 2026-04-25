import '@/global.css';
import { AppProviders } from '@/src/components/layout/AppProviders';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  Geist_400Regular,
  Geist_600SemiBold,
  Geist_700Bold,
} from '@expo-google-fonts/geist';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded] = useFonts({
    BebasNeue_400Regular,
    Geist_400Regular,
    Geist_600SemiBold,
    Geist_700Bold,
    GeistMono_400Regular,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#05060A' }}>
      <SafeAreaProvider>
        <AppProviders>
          <View style={{ flex: 1, backgroundColor: '#05060A' }}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#05060A' },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="(app)" />
            </Stack>
          </View>
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
