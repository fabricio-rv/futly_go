import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { useMatchTheme } from '../shared/theme';

type MatchTopNavProps = {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
};

export function MatchTopNav({ title, subtitle, rightSlot }: MatchTopNavProps) {
  const matchTheme = useMatchTheme();

  return (
    <View className="px-[18px] pb-2 pt-1">
      <View className="flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} hitSlop={12} className="w-10 h-10 items-center justify-center">
          <ChevronLeft color={matchTheme.colors.fgPrimary} size={22} />
        </Pressable>

        <View className="items-center">
          <Text variant="body" className="font-semibold" style={{ color: matchTheme.colors.fgPrimary }}>{title}</Text>
          {subtitle ? <Text variant="micro" style={{ color: matchTheme.colors.fgMuted }}>{subtitle}</Text> : null}
        </View>

        {rightSlot ?? <View className="w-10 h-10" />}
      </View>
    </View>
  );
}
