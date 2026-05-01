import { LinearGradient } from 'expo-linear-gradient';
import {
  Beer,
  Car,
  ChefHat,
  Clock,
  Coffee,
  MapPin,
  Phone,
  ShowerHead,
  Star,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchTopNav, useMatchTheme } from '@/src/components/features/matches';
import { Text } from '@/src/components/ui';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import { COURTS_DATA, type Court } from '@/src/data/quadras';
import { useUserCourts } from '@/src/features/courts/useUserCourts';

const ORDERED_DAYS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

function amenityIcon(name: string, color: string): ReactNode {
  if (name === 'Churrasqueira') return <ChefHat size={16} color={color} />;
  if (name === 'Vestiário') return <ShowerHead size={16} color={color} />;
  if (name === 'Lanchonete') return <Coffee size={16} color={color} />;
  if (name === 'Estacionamento c/ Seguro') return <Car size={16} color={color} />;
  if (name === 'Bar') return <Beer size={16} color={color} />;
  return null;
}

export function CourtDetailsScreen({ courtId }: { courtId: string }) {
  const matchTheme = useMatchTheme();
  const { t } = useTranslation('quadras');

  const { userCourts } = useUserCourts();
  const court: Court | undefined =
    userCourts.find((c) => c.id === courtId) ?? COURTS_DATA.find((c) => c.id === courtId);

  if (!court) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#020617' }}>
        <MatchTopNav title={t('title', 'Quadras')} />
        <View className="flex-1 items-center justify-center px-6">
          <Text variant="label" style={{ color: matchTheme.colors.fgSecondary }}>
            {t('empty.title', 'Nenhuma quadra encontrada')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const phoneIsValid = court.phone && court.phone !== 'Não informado';

  const handleCallPhone = async () => {
    if (!phoneIsValid) return;
    const sanitized = court.phone.replace(/[^\d+]/g, '');
    const url = `tel:${sanitized}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t('details.phone', 'Telefone'), court.phone);
      }
    } catch {
      Alert.alert(t('details.phone', 'Telefone'), court.phone);
    }
  };

  const ratingDisplay = court.rating > 0 ? court.rating.toFixed(1) : '--';
  const reviewLabel = court.review_count > 0
    ? `${court.review_count} ${t('card.rating', 'avaliações')}`
    : t('card.noRating', 'Sem avaliações');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#020617' }}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <MatchTopNav title={t('title', 'Quadras')} />

        <View className="px-[18px] pt-2">
          <View
            className="rounded-[20px] overflow-hidden border mb-3"
            style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}
          >
            <LinearGradient
              colors={['#0F3A24', '#072314', '#021109']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ overflow: 'hidden', paddingHorizontal: 18, paddingVertical: 22 }}
            >
              <Text
                variant="micro"
                className="uppercase tracking-[2px] font-bold"
                style={{ color: '#86E5B4' }}
              >
                {court.location_preview}
              </Text>
              <Text
                variant="number"
                className="mt-1"
                style={{
                  color: '#FFFFFF',
                  fontFamily: 'BebasNeue_400Regular',
                  fontSize: 36,
                  lineHeight: 40,
                  textTransform: 'uppercase',
                }}
              >
                {court.name}
              </Text>

              <View className="flex-row gap-2 flex-wrap mt-3">
                <View
                  className="h-7 px-3 rounded-full border items-center justify-center flex-row gap-1"
                  style={{
                    backgroundColor: court.rating > 0 ? 'rgba(245,165,36,0.18)' : 'rgba(255,255,255,0.06)',
                    borderColor: court.rating > 0 ? 'rgba(245,165,36,0.45)' : 'rgba(255,255,255,0.18)',
                  }}
                >
                  <Star
                    size={12}
                    color={court.rating > 0 ? '#F5A524' : 'rgba(255,255,255,0.6)'}
                    fill={court.rating > 0 ? '#F5A524' : 'transparent'}
                  />
                  <Text
                    variant="caption"
                    className="font-semibold"
                    style={{
                      color: court.rating > 0 ? '#F5A524' : 'rgba(255,255,255,0.7)',
                      fontSize: 12,
                    }}
                  >
                    {ratingDisplay}
                  </Text>
                  <Text
                    variant="micro"
                    style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginLeft: 4 }}
                  >
                    {reviewLabel}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Address */}
          <View
            className="rounded-[16px] border p-4 mb-3"
            style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <MapPin size={14} color={matchTheme.colors.okSoft} />
              <Text
                variant="caption"
                className="font-semibold uppercase tracking-[1.5px]"
                style={{ color: matchTheme.colors.okSoft, fontSize: 11 }}
              >
                {t('details.address', 'Endereço')}
              </Text>
            </View>
            <Text variant="body" style={{ color: matchTheme.colors.fgPrimary, lineHeight: 20 }}>
              {court.address}
            </Text>
          </View>

          {/* Phone */}
          <View
            className="rounded-[16px] border p-4 mb-3"
            style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Phone size={14} color={matchTheme.colors.okSoft} />
              <Text
                variant="caption"
                className="font-semibold uppercase tracking-[1.5px]"
                style={{ color: matchTheme.colors.okSoft, fontSize: 11 }}
              >
                {t('details.phone', 'Telefone')}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text variant="body" style={{ color: matchTheme.colors.fgPrimary, flex: 1 }}>
                {phoneIsValid ? court.phone : t('details.notInformed', 'Não informado')}
              </Text>
              {phoneIsValid ? (
                <Pressable
                  onPress={handleCallPhone}
                  className="rounded-[10px] px-3 py-2 flex-row items-center gap-1"
                  style={{ backgroundColor: matchTheme.colors.ok }}
                >
                  <Phone size={14} color="#05070B" />
                  <Text variant="caption" className="font-semibold" style={{ color: '#05070B', fontSize: 12 }}>
                    {t('details.callPhone', 'Ligar')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Amenities */}
          <View
            className="rounded-[16px] border p-4 mb-3"
            style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}
          >
            <View className="flex-row items-center gap-2 mb-3">
              <Text
                variant="caption"
                className="font-semibold uppercase tracking-[1.5px]"
                style={{ color: matchTheme.colors.okSoft, fontSize: 11 }}
              >
                {t('details.amenities', 'Comodidades')}
              </Text>
            </View>

            {court.amenities.length === 0 ? (
              <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                {t('details.notInformed', 'Não informado')}
              </Text>
            ) : (
              <View className="flex-row gap-2 flex-wrap">
                {court.amenities.map((amenity) => {
                  const icon = amenityIcon(amenity, matchTheme.colors.okSoft);
                  return (
                    <View
                      key={amenity}
                      className="flex-row items-center gap-2 rounded-full px-3 py-2"
                      style={{
                        backgroundColor: 'rgba(34,183,108,0.12)',
                        borderWidth: 1,
                        borderColor: 'rgba(34,183,108,0.25)',
                      }}
                    >
                      {icon}
                      <Text
                        variant="caption"
                        style={{ color: matchTheme.colors.okSoft, fontSize: 12, fontWeight: '600' }}
                      >
                        {amenity}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Working Hours */}
          <View
            className="rounded-[16px] border p-4 mb-3"
            style={{ borderColor: matchTheme.colors.line, backgroundColor: matchTheme.colors.bgSurfaceA }}
          >
            <View className="flex-row items-center gap-2 mb-3">
              <Clock size={14} color={matchTheme.colors.okSoft} />
              <Text
                variant="caption"
                className="font-semibold uppercase tracking-[1.5px]"
                style={{ color: matchTheme.colors.okSoft, fontSize: 11 }}
              >
                {t('details.workingHours', 'Horário de Funcionamento')}
              </Text>
            </View>

            <View className="gap-2">
              {ORDERED_DAYS.map((day) => {
                const hours = court.working_hours[day];
                if (!hours) return null;
                const isClosed = hours.toLowerCase().includes('fechado');
                return (
                  <View
                    key={day}
                    className="flex-row items-center justify-between py-2"
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: matchTheme.colors.line,
                    }}
                  >
                    <Text variant="body" style={{ color: matchTheme.colors.fgPrimary, fontSize: 14 }}>
                      {t(`days.${day}`, day)}
                    </Text>
                    <Text
                      variant="caption"
                      className="font-semibold"
                      style={{
                        color: isClosed ? matchTheme.colors.bad : matchTheme.colors.okSoft,
                        fontFamily: Platform.OS === 'web' ? undefined : 'Geist_600SemiBold',
                      }}
                    >
                      {isClosed ? t('details.closed', 'Fechado') : hours}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
