import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

type ScreenHeaderProps = {
  title: string;
  subtitle: string;
  rightSlot?: ReactNode;
  canGoBack?: boolean;
};

export function ScreenHeader({ title, subtitle, rightSlot, canGoBack }: ScreenHeaderProps) {
  return (
    <View className="px-4 pb-3 pt-1">
      <View className="flex-row items-center justify-between">
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-[14px] border border-line2 bg-white/5"
          disabled={!canGoBack}
          onPress={() => router.back()}
        >
          {canGoBack ? <ChevronLeft color="white" size={18} /> : null}
        </Pressable>
        <View className="items-center">
          <Text className="font-geistBold text-[15px] text-white">{title}</Text>
          <Text className="text-[10px] font-geistBold uppercase tracking-[2px] text-fg3">{subtitle}</Text>
        </View>
        <View className="h-10 w-10 items-center justify-center">{rightSlot}</View>
      </View>
    </View>
  );
}

