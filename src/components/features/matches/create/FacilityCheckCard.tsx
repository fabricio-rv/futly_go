import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { useMatchTheme } from '../shared/theme';

type FacilityCheckCardProps = {
  label: string;
  selected: boolean;
  onPress?: () => void;
};

export function FacilityCheckCard({ label, selected, onPress }: FacilityCheckCardProps) {
  const matchTheme = useMatchTheme();

  return (
    <Pressable onPress={onPress} className="rounded-[14px] border px-[14px] py-3 flex-row items-center gap-[10px]" style={{ backgroundColor: selected ? 'rgba(0,154,84,0.12)' : matchTheme.colors.bgSurfaceA, borderColor: selected ? matchTheme.colors.ok : matchTheme.colors.lineStrong }}>
      <View className="w-5 h-5 rounded-[6px] border items-center justify-center" style={{ borderColor: selected ? matchTheme.colors.ok : matchTheme.colors.lineStrong, backgroundColor: selected ? matchTheme.colors.ok : 'transparent' }}>
        {selected ? <Check size={12} stroke="#05070B" /> : null}
      </View>
      <Text variant="label" className="font-semibold" style={{ color: matchTheme.colors.fgPrimary }}>{label}</Text>
    </Pressable>
  );
}
