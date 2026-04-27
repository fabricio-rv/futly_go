import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { Text } from '@/src/components/ui';
import { useMatchTheme } from '../shared/theme';

type RangeSelectorProps = {
  min: number;
  max: number;
  minPercent: number;
  maxPercent: number;
};

export function RangeSelector({ min, max, minPercent, maxPercent }: RangeSelectorProps) {
  const matchTheme = useMatchTheme();
  return (
    <View>
      <View className="flex-row justify-between items-center px-[2px]">
        <Text variant="caption" style={{ color: matchTheme.colors.fgSecondary }}>Min <Text variant="number" className="text-[18px]" style={{ color: matchTheme.colors.fgPrimary }}>{min}</Text></Text>
        <Text variant="caption" style={{ color: matchTheme.colors.fgSecondary }}>Max <Text variant="number" className="text-[18px]" style={{ color: matchTheme.colors.fgPrimary }}>{max}</Text></Text>
      </View>

      <View className="h-[6px] rounded-full mt-3 mb-2 relative overflow-visible" style={{ backgroundColor: matchTheme.colors.lineStrong }}>
        <LinearGradient colors={['#22B76C', '#F6D27A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="absolute top-0 bottom-0 rounded-full" style={{ left: `${minPercent}%`, width: `${Math.max(0, maxPercent - minPercent)}%` }} />
        <View className="absolute w-[18px] h-[18px] rounded-full border-[3px] border-[#22B76C]" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, left: `${minPercent}%`, top: -6, marginLeft: -9 }} />
        <View className="absolute w-[18px] h-[18px] rounded-full border-[3px] border-[#D4A13A]" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, left: `${maxPercent}%`, top: -6, marginLeft: -9 }} />
      </View>
    </View>
  );
}
