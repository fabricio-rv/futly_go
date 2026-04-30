import { MapPin } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { Text } from '@/src/components/ui';
import { useMatchTheme } from '../shared/theme';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type MapPreviewCardProps = {
  addressLine: string;
  districtLine: string;
  mapImageUrls?: string[];
  mapEmbedUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  onRoutePress?: () => void;
  showAddressFooter?: boolean;
  embeddedInCard?: boolean;
};

export function MapPreviewCard({
  addressLine,
  districtLine,
  mapImageUrls = [],
  mapEmbedUrl,
  latitude = null,
  longitude = null,
  onRoutePress,
  showAddressFooter = true,
  embeddedInCard = false,
}: MapPreviewCardProps) {
  const matchTheme = useMatchTheme();
  const theme = useAppColorScheme();
  const isLight = theme === 'light';
  const isWeb = Platform.OS === 'web';
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const Iframe: any = 'iframe';

  useEffect(() => {
    setCurrentUrlIndex(0);
  }, [mapImageUrls]);

  const activeMapUrl = mapImageUrls[currentUrlIndex] ?? null;
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const mapProvider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;
  const mapClassName = embeddedInCard
    ? 'h-64 w-full overflow-hidden rounded-[20px]'
    : 'h-56 rounded-[18px] border mb-2 overflow-hidden';

  return (
    <View style={embeddedInCard ? { width: '100%' } : undefined}>
      <View
        className={mapClassName}
        style={{
          backgroundColor: isLight ? matchTheme.colors.bgSurfaceB : matchTheme.colors.bgBase,
          borderColor: matchTheme.colors.lineStrong,
          borderWidth: 1,
        }}
        pointerEvents="box-none"
      >
        {isWeb && mapEmbedUrl ? (
          <Iframe
            src={mapEmbedUrl}
            title="Mapa da partida"
            style={{ width: '100%', height: '100%', border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : !isWeb && hasCoordinates ? (
          <MapView
            style={{ width: '100%', height: '100%' }}
            provider={mapProvider}
            initialRegion={{
              latitude: latitude as number,
              longitude: longitude as number,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            }}
            zoomEnabled
            zoomTapEnabled
            scrollEnabled
            rotateEnabled
            pitchEnabled
            showsCompass
            toolbarEnabled={false}
            moveOnMarkerPress={false}
            scrollDuringRotateOrZoomEnabled={false}
          >
            <Marker coordinate={{ latitude: latitude as number, longitude: longitude as number }} />
          </MapView>
        ) : !isWeb && activeMapUrl ? (
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
            <View
              className="w-9 h-9 rounded-full border-2 items-center justify-center"
              style={{
                backgroundColor: isLight ? '#22B76C' : 'rgba(34,183,108,0.9)',
                borderColor: isLight ? '#E2E8F0' : '#D8E0EE',
              }}
            >
              <MapPin size={14} color="#FFFFFF" />
            </View>
          </View>
        )}
      </View>

      {showAddressFooter ? (
        <View
          className="rounded-[16px] border p-3 mb-1 mt-2 flex-row items-center"
          style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.lineStrong }}
        >
          <View
            className="w-9 h-9 rounded-[10px] items-center justify-center"
            style={{ backgroundColor: isLight ? 'rgba(34,183,108,0.18)' : 'rgba(34,183,108,0.14)' }}
          >
            <MapPin size={14} color={matchTheme.colors.okSoft} />
          </View>
          <View className="ml-3 flex-1">
            <Text variant="label" className="font-semibold" style={{ color: matchTheme.colors.fgPrimary }}>
              {addressLine}
            </Text>
            <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>{districtLine}</Text>
          </View>
          <Pressable
            className="h-10 rounded-[10px] border px-3 items-center justify-center"
            style={{ borderColor: matchTheme.colors.lineStrong, backgroundColor: isLight ? '#FFFFFF' : 'transparent' }}
            onPress={onRoutePress}
          >
            <Text variant="body" className="font-semibold" style={{ color: matchTheme.colors.fgPrimary }}>
              Rota
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
