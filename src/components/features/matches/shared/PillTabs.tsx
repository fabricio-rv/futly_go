import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { matchTheme } from './theme';

type PillTabsProps = {
  tabs: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
};

export function PillTabs({ tabs, activeId, onChange }: PillTabsProps) {
  return (
    <View className="mx-[18px] mb-[14px] rounded-[14px] p-1 flex-row gap-1 border" style={{ backgroundColor: '#0C111E', borderColor: matchTheme.colors.lineStrong }}>
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <Pressable key={tab.id} onPress={() => onChange(tab.id)} className="flex-1 h-[38px] rounded-[10px] items-center justify-center" style={{ backgroundColor: active ? 'rgba(255,255,255,0.07)' : 'transparent' }}>
            <Text variant="label" style={{ color: active ? matchTheme.colors.fgPrimary : matchTheme.colors.fgSecondary }}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
