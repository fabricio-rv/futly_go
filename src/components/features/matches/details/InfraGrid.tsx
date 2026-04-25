import { CircleCheck, Circle } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/src/components/ui';
import type { InfraItem } from '@/src/features/matches/types';
import { matchTheme } from '../shared/theme';

type InfraGridProps = {
  items: InfraItem[];
};

export function InfraGrid({ items }: InfraGridProps) {
  const goldTone = 'gold' as const;

  return (
    <View className="flex-row flex-wrap gap-2">
      {items.map((item) => {
        const isGold = item.highlighted === goldTone;
        const enabled = item.enabled;
        return (
          <View
            key={item.id}
            className="w-[31%] h-[84px] rounded-[18px] border px-2 items-center justify-center"
            style={{
              backgroundColor: isGold ? 'rgba(212,161,58,0.08)' : enabled ? 'rgba(34,183,108,0.10)' : 'rgba(255,255,255,0.02)',
              borderColor: isGold ? 'rgba(212,161,58,0.25)' : enabled ? 'rgba(34,183,108,0.25)' : matchTheme.colors.lineStrong,
            }}
          >
            {enabled || isGold ? (
              <CircleCheck size={16} color={isGold ? matchTheme.colors.goldA : matchTheme.colors.okSoft} />
            ) : (
              <Circle size={16} color={matchTheme.colors.fgMuted} />
            )}
            <Text variant="caption" className="text-center mt-2 font-semibold" style={{ color: enabled || isGold ? matchTheme.colors.fgPrimary : matchTheme.colors.fgMuted }}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
