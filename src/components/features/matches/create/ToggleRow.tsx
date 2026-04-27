import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { useMatchTheme } from '../shared/theme';

type ToggleRowProps = {
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: () => void;
};

export function ToggleRow({ title, subtitle, value, onToggle }: ToggleRowProps) {
  const matchTheme = useMatchTheme();

  return (
    <View className="rounded-[14px] border p-[14px] flex-row items-center justify-between" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.lineStrong }}>
      <View className="pr-3 flex-1">
        <Text variant="body" className="font-semibold" style={{ color: matchTheme.colors.fgPrimary }}>{title}</Text>
        <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>{subtitle}</Text>
      </View>

      <Pressable onPress={onToggle} className="w-[46px] h-7 rounded-full justify-center px-[2px]" style={{ backgroundColor: value ? matchTheme.colors.ok : matchTheme.colors.lineStrong }}>
        <View className="w-6 h-6 rounded-full" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, alignSelf: value ? 'flex-end' : 'flex-start' }} />
      </Pressable>
    </View>
  );
}
