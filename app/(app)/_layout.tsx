import '../../global.css';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View } from 'react-native';

export default function AppLayout() {
  const bgColor = '#020617';

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: bgColor }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: bgColor }} className="dark">
          <Stack
            initialRouteName="index"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: bgColor },
              animation: Platform.OS === 'web' ? 'none' : 'fade',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}