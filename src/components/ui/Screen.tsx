import { StatusBar } from 'expo-status-bar';
import type { PropsWithChildren } from 'react';
import { View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = PropsWithChildren<{
  padded?: boolean;
  style?: ViewStyle;
  showBackground?: boolean;
}>;

export function Screen({ children, padded = true, showBackground = true, style }: ScreenProps) {
  const backgroundColor = '#020617';

  return (
    <SafeAreaView className="flex-1" style={[{ backgroundColor }, style]}>
      <StatusBar style="light" />
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
