// 1. O IMPORT DO CSS DEVE SER A PRIMEIRA LINHA
import '../../global.css';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View } from 'react-native';

// Importe seus provedores de contexto (Auth, Tema, etc)
import { AppProviders } from '@/src/components/layout/AppProviders'; 

export default function AppLayout() {
  const bgColor = '#020617';

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: bgColor }}>
      <SafeAreaProvider>
        <AppProviders>
          <View style={{ flex: 1, backgroundColor: bgColor }} className="dark">
            <Stack
              initialRouteName="index"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: bgColor },
                // Adiciona uma transição suave entre telas
                animation: Platform.OS === 'web' ? 'none' : 'fade', 
              }}
            >
              {/* Garanta que suas rotas principais estejam declaradas se necessário */}
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
            </Stack>
          </View>
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}