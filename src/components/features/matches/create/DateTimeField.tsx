import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { matchTheme } from '../shared/theme';

interface DateTimeFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
}

export function DateTimeField({ label, value, placeholder, onPress }: DateTimeFieldProps) {
  return (
    <Pressable onPress={onPress}>
      <Text variant="label" className="mb-2" style={{ color: matchTheme.colors.fgSecondary }}>{label}</Text>
      <View className="h-12 rounded-[14px] border px-3 justify-center" style={{ backgroundColor: '#0C111E', borderColor: matchTheme.colors.lineStrong }}>
        <Text variant="body" style={{ color: value ? matchTheme.colors.fgPrimary : matchTheme.colors.fgMuted }}>{value || placeholder}</Text>
      </View>
    </Pressable>
  );
}
