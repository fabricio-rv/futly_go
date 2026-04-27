import { MapPin } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { useMatchTheme } from '../shared/theme';

type MapPreviewCardProps = {
  addressLine: string;
  districtLine: string;
  mapImageUrls?: string[];
  mapEmbedUrl?: string | null;
  onRoutePress?: () => void;
};

export function MapPreviewCard({ addressLine, districtLine, mapImageUrls = [], mapEmbedUrl, onRoutePress }: MapPreviewCardProps) {
  const matchTheme = useMatchTheme();
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const Iframe: any = 'iframe';

  useEffect(() => {
    setCurrentUrlIndex(0);
  }, [mapImageUrls]);

  const activeMapUrl = mapImageUrls[currentUrlIndex] ?? null;

  return (
    <View>
      <View className="h-40 rounded-[18px] border mb-2 overflow-hidden" style={{ backgroundColor: matchTheme.colors.bgBase, borderColor: matchTheme.colors.lineStrong }}>
        {Platform.OS === 'web' && mapEmbedUrl ? (
          <Iframe
            src={mapEmbedUrl}
            title="Mapa da partida"
            style={{ width: '100%', height: '100%', border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : activeMapUrl ? (
          <Image
            source={{ uri: activeMapUrl }}
            resizeMode="cover"
            className="w-full h-full"
            onError={() => {
              if (currentUrlIndex < mapImageUrls.length - 1) {
                setCurrentUrlIndex((prev) => prev + 1);
              }
            }}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <View className="w-9 h-9 rounded-full border-2 items-center justify-center" style={{ backgroundColor: 'rgba(34,183,108,0.9)', borderColor: '#D8E0EE' }}>
              <MapPin size={14} color="#FFFFFF" />
            </View>
          </View>
        )}
      </View>

      <View className="rounded-[16px] border p-3 mb-4 flex-row items-center" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
        <View className="w-9 h-9 rounded-[10px] items-center justify-center" style={{ backgroundColor: 'rgba(34,183,108,0.14)' }}>
          <MapPin size={14} color={matchTheme.colors.okSoft} />
        </View>
        <View className="ml-3 flex-1">
          <Text variant="label" className="font-semibold">{addressLine}</Text>
          <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>{districtLine}</Text>
        </View>
        <Pressable className="h-10 rounded-[10px] border px-3 items-center justify-center" style={{ borderColor: matchTheme.colors.lineStrong }} onPress={onRoutePress}>
          <Text variant="body" className="font-semibold">Rota</Text>
        </Pressable>
      </View>
    </View>
  );
}
