import { StatusBar } from 'expo-status-bar';
import type { PropsWithChildren } from 'react';
import { View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type ScreenProps = PropsWithChildren<{
  padded?: boolean;
  style?: ViewStyle;
  showBackground?: boolean;
}>;

export function Screen({ children, padded = true, showBackground = true, style }: ScreenProps) {
  const theme = useAppColorScheme();
  const backgroundColor = theme === 'light' ? '#F4F6F9' : '#0A0E18';

  return (
    <SafeAreaView className="flex-1" style={[{ backgroundColor }, style]}>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <View className="flex-1">
        {showBackground ? (
          <View
            className="absolute inset-0"
            style={{
              backgroundColor,
            }}
          />
        ) : null}
        <View className={padded ? 'flex-1 px-5' : 'flex-1'} style={{ minWidth: 0 }}>
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}
