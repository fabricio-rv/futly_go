import { LinearGradient } from 'expo-linear-gradient';
import { Beer, Car, ChefHat, Coffee, MapPin, ShowerHead, Star } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';

import { Text, TouchableScale } from '@/src/components/ui';
import { matchShadows, useMatchTheme } from '../matches/shared/theme';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import type { Court } from '@/src/data/quadras';

type CourtCardProps = {
  court: Court;
  onPress?: () => void;
  bannerPalette?: [string, string, string];
};

const defaultBanner: [string, string, string] = ['#0F3A24', '#072314', '#021109'];

function amenityIcon(name: string, color: string): ReactNode {
  if (name === 'Churrasqueira') return <ChefHat size={12} color={color} />;
  if (name === 'Vestiário') return <ShowerHead size={12} color={color} />;
  if (name === 'Lanchonete') return <Coffee size={12} color={color} />;
  if (name === 'Estacionamento c/ Seguro') return <Car size={12} color={color} />;
  if (name === 'Bar') return <Beer size={12} color={color} />;
  return null;
}

export function CourtCard({ court, onPress, bannerPalette = defaultBanner }: CourtCardProps) {
  const matchTheme = useMatchTheme();
  const { t } = useTranslation('quadras');

  const ratingDisplay = court.rating > 0 ? court.rating.toFixed(1) : '--';
  const reviewLabel = court.review_count > 0
    ? `${court.review_count} ${t('card.rating', 'avaliações')}`
    : t('card.noRating', 'Sem avaliações');

  const initial = court.name.charAt(0).toUpperCase();

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 280 }}
    >
      <TouchableScale
        onPress={onPress}
        className="rounded-[20px] overflow-hidden border mb-3"
        style={{
          borderColor: matchTheme.colors.line,
          backgroundColor: matchTheme.colors.bgSurfaceA,
          ...matchShadows.panel,
        }}
      >
        <LinearGradient
          colors={bannerPalette}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ overflow: 'hidden', height: 70, justifyContent: 'center', paddingHorizontal: 14 }}
        >
          <View className="absolute right-0 top-1/2 -mt-7" style={{ alignItems: 'flex-end' }}>
            <Text variant="number" className="text-[60px] opacity-10" style={{ color: '#FFFFFF' }} numberOfLines={1}>
              {initial}
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            <View style={{ justifyContent: 'center' }}>
              <Text
                variant="micro"
                className="font-semibold tracking-[2px] uppercase"
                style={{
                  color: 'rgba(255,255,255,0.78)',
                  fontFamily: 'Geist_600SemiBold',
                  fontSize: 12,
                  marginBottom: 3,
                }}
              >
                {court.location_preview}
              </Text>
              <Text
                variant="number"
                className="text-[28px] leading-[28px]"
                style={{
                  color: '#FFFFFF',
                  fontFamily: 'BebasNeue_400Regular',
                  fontWeight: '400',
                  letterSpacing: 0,
                  textTransform: 'uppercase',
                }}
                numberOfLines={1}
              >
                {court.name.toUpperCase()}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="p-[14px]">
          <View className="flex-row items-stretch justify-between mb-1">
            <View className="flex-1 pr-2">
              <Text variant="body" className="font-semibold text-[16px]" style={{ color: matchTheme.colors.fgPrimary }}>
                {court.name}
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                <MapPin size={11} color={matchTheme.colors.fgMuted} />
                <Text variant="caption" numberOfLines={1} style={{ color: matchTheme.colors.fgMuted }}>
                  {court.location_preview}
                </Text>
              </View>

              <View className="flex-row items-center gap-2 mt-3 flex-wrap">
                {court.amenities.slice(0, 4).map((amenity) => {
                  const icon = amenityIcon(amenity, matchTheme.colors.okSoft);
                  if (!icon) return null;
                  return (
                    <View
                      key={amenity}
                      className="flex-row items-center gap-1 rounded-full px-2 py-[3px]"
                      style={{
                        backgroundColor: 'rgba(34,183,108,0.12)',
                        borderWidth: 1,
                        borderColor: 'rgba(34,183,108,0.25)',
                      }}
                    >
                      {icon}
                      <Text
                        variant="micro"
                        style={{ color: matchTheme.colors.okSoft, fontSize: 10, fontWeight: '600' }}
                      >
                        {amenity}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <View
                className="flex-row items-center gap-1 rounded-full px-2 py-1"
                style={{
                  backgroundColor: court.rating > 0 ? 'rgba(245,165,36,0.14)' : 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: court.rating > 0 ? 'rgba(245,165,36,0.35)' : matchTheme.colors.line,
                }}
              >
                <Star
                  size={12}
                  color={court.rating > 0 ? '#F5A524' : matchTheme.colors.fgMuted}
                  fill={court.rating > 0 ? '#F5A524' : 'transparent'}
                />
                <Text
                  variant="caption"
                  className="font-semibold"
                  style={{ color: court.rating > 0 ? '#F5A524' : matchTheme.colors.fgMuted, fontSize: 12 }}
                >
                  {ratingDisplay}
                </Text>
              </View>

              <Text
                variant="micro"
                style={{ color: matchTheme.colors.fgMuted, fontSize: 10, marginTop: 4 }}
                numberOfLines={1}
              >
                {reviewLabel}
              </Text>
            </View>
          </View>
        </View>
      </TouchableScale>
    </MotiView>
  );
}
