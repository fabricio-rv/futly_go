import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { matchTheme } from './theme';

type SegmentedControlProps = {
  options: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
  compact?: boolean;
};

export function SegmentedControl({ options, activeId, onChange, compact = false }: SegmentedControlProps) {
  return (
    <View className="rounded-[14px] border p-[1px] flex-row" style={{ backgroundColor: matchTheme.colors.lineStrong, borderColor: matchTheme.colors.lineStrong, minHeight: compact ? 32 : 42 }}>
      {options.map((option) => {
        const active = option.id === activeId;
        return (
          <Pressable key={option.id} onPress={() => onChange(option.id)} className="flex-1 items-center justify-center" style={{ backgroundColor: active ? matchTheme.colors.ok : '#0C111E', borderRadius: 12, minHeight: compact ? 30 : 40 }}>
            <Text variant={compact ? 'caption' : 'label'} style={{ color: active ? '#05070B' : matchTheme.colors.fgSecondary }}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
