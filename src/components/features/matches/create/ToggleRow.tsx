import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { matchTheme } from '../shared/theme';

type ToggleRowProps = {
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: () => void;
};

export function ToggleRow({ title, subtitle, value, onToggle }: ToggleRowProps) {
  return (
    <View className="rounded-[14px] border p-[14px] flex-row items-center justify-between" style={{ backgroundColor: '#0C111E', borderColor: matchTheme.colors.lineStrong }}>
      <View className="pr-3 flex-1">
        <Text variant="body" className="font-semibold" style={{ color: matchTheme.colors.fgPrimary }}>{title}</Text>
        <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>{subtitle}</Text>
      </View>

      <Pressable onPress={onToggle} className="w-[46px] h-7 rounded-full justify-center px-[2px]" style={{ backgroundColor: value ? matchTheme.colors.ok : '#1B2236' }}>
        <View className="w-6 h-6 rounded-full bg-white" style={{ alignSelf: value ? 'flex-end' : 'flex-start' }} />
      </Pressable>
    </View>
  );
}
