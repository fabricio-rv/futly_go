import { ScrollView, View } from 'react-native';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { Text } from '@/src/components/ui';
import type { FiltroPartidas } from '@/src/features/matches/types';

type FilterBarProps = {
  filters: FiltroPartidas[];
};

export function FilterBar({ filters }: FilterBarProps) {
  const theme = useAppColorScheme();
  const passiveBg = theme === 'light' ? '#EAF0F8' : '#11192B';
  const passiveBorder = theme === 'light' ? '#D1DCEB' : 'rgba(255,255,255,0.09)';
  const passiveText = theme === 'light' ? '#5B6B80' : 'rgba(255,255,255,0.62)';
  const activeBg = theme === 'light' ? 'rgba(34,183,108,0.16)' : 'rgba(21,155,87,0.26)';
  const activeBorder = theme === 'light' ? 'rgba(26,143,87,0.45)' : 'rgba(43,201,124,0.45)';
  const activeText = theme === 'light' ? '#1A8F57' : '#75DFA7';

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 14, gap: 8 }}>
      {filters.map((filter) => (
        <View
          key={filter.id}
          className="h-[36px] px-[14px] rounded-full border items-center justify-center"
          style={{
            backgroundColor: filter.active ? activeBg : passiveBg,
            borderColor: filter.active ? activeBorder : passiveBorder,
          }}
        >
          <Text variant="caption" className="font-semibold" style={{ color: filter.active ? activeText : passiveText }}>
            {filter.label}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
