import '@/global.css';
import { AppProviders } from '@/src/components/layout/AppProviders';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  Geist_400Regular,
  Geist_600SemiBold,
  Geist_700Bold,
} from '@expo-google-fonts/geist';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
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
  initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootLayoutContent() {
  const theme = useAppColorScheme();
  const bgColor = theme === 'light' ? '#F1F5F9' : '#020617';

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: bgColor }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: bgColor }} className={theme === 'dark' ? 'dark' : ''}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: bgColor },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    BebasNeue_400Regular,
    Geist_400Regular,
    Geist_600SemiBold,
    Geist_700Bold,
    GeistMono_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AppProviders>
      <RootLayoutContent />
    </AppProviders>
  );
}
