import { MapPin } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { useMatchTheme } from '../shared/theme';

type MapPreviewCardProps = {
  addressLine: string;
  districtLine: string;
};

export function MapPreviewCard({ addressLine, districtLine }: MapPreviewCardProps) {
  const matchTheme = useMatchTheme();

  return (
    <View>
      <View className="h-40 rounded-[18px] border mb-2 items-center justify-center" style={{ backgroundColor: matchTheme.colors.bgBase, borderColor: matchTheme.colors.lineStrong }}>
        <View className="w-9 h-9 rounded-full border-2 items-center justify-center" style={{ backgroundColor: 'rgba(34,183,108,0.9)', borderColor: '#D8E0EE' }}>
          <MapPin size={14} color="#FFFFFF" />
        </View>
      </View>

      <View className="rounded-[16px] border p-3 mb-4 flex-row items-center" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
        <View className="w-9 h-9 rounded-[10px] items-center justify-center" style={{ backgroundColor: 'rgba(34,183,108,0.14)' }}>
          <MapPin size={14} color={matchTheme.colors.okSoft} />
        </View>
        <View className="ml-3 flex-1">
          <Text variant="label" className="font-semibold">{addressLine}</Text>
          <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>{districtLine}</Text>
        </View>
        <Pressable className="h-10 rounded-[10px] border px-3 items-center justify-center" style={{ borderColor: matchTheme.colors.lineStrong }}>
          <Text variant="body" className="font-semibold">Rota</Text>
        </Pressable>
      </View>
    </View>
  );
}
