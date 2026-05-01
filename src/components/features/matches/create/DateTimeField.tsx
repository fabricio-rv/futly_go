import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { useMatchTheme } from '../shared/theme';

interface DateTimeFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
}

export function DateTimeField({ label, value, placeholder, onPress }: DateTimeFieldProps) {
  const matchTheme = useMatchTheme();

  return (
    <Pressable onPress={onPress}>
      <Text variant="label" className="mb-2.5 font-semibold" style={{ color: matchTheme.colors.fgSecondary }}>{label}</Text>
      <View className="h-14 rounded-[28px] border-[0.5px] px-4 justify-center" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.lineStrong }}>
        <Text variant="body" style={{ color: value ? matchTheme.colors.fgPrimary : matchTheme.colors.fgMuted }}>{value || placeholder}</Text>
      </View>
    </Pressable>
  );
}
