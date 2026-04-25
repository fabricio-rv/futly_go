import { ScrollView, View } from 'react-native';

import { Text } from '@/src/components/ui';
import type { FiltroPartidas } from '@/src/features/matches/types';
import { matchTheme } from './theme';

type FilterBarProps = {
  filters: FiltroPartidas[];
};

export function FilterBar({ filters }: FilterBarProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 14, gap: 8 }}>
      {filters.map((filter) => (
        <View
          key={filter.id}
          className="h-[36px] px-[14px] rounded-full border items-center justify-center"
          style={{
            backgroundColor: filter.active ? 'rgba(21,155,87,0.26)' : '#11192B',
            borderColor: filter.active ? 'rgba(43,201,124,0.45)' : 'rgba(255,255,255,0.09)',
          }}
        >
          <Text variant="caption" className="font-semibold" style={{ color: filter.active ? '#75DFA7' : 'rgba(255,255,255,0.62)' }}>
            {filter.label}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
