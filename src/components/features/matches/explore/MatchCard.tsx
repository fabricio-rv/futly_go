import { LinearGradient } from 'expo-linear-gradient';
import { Clock3, MapPin } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';

import { Text, TouchableScale } from '@/src/components/ui';
import type { Partida } from '@/src/features/matches/types';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import { AvatarStack } from '../shared/AvatarStack';
import { MatchPricePill } from './MatchPricePill';
import { StatBadge } from '../shared/StatBadge';
import { StatusStamp } from '../shared/StatusStamp';
import { matchShadows, useMatchTheme } from '../shared/theme';

type MatchCardProps = {
  partida: Partida;
  onPress?: () => void;
  rightAction?: ReactNode;
  bannerPalette?: [string, string, string];
};

function levelToneToBadge(levelTone: Partida['levelTone']) {
  if (levelTone === 'gold') return 'gold';
  if (levelTone === 'sky') return 'sky';
  return 'neutral';
}

const defaultBanner: [string, string, string] = ['#0F3A24', '#072314', '#021109'];

export function MatchCard({ partida, onPress, rightAction, bannerPalette = defaultBanner }: MatchCardProps) {
  const matchTheme = useMatchTheme();
  const { t, currentLanguage } = useTranslation('matches');
  const fillPercent = partida.totalSlots > 0 ? Math.round((partida.occupiedSlots / partida.totalSlots) * 100) : 0;
  const formattedMatchDate = partida.matchDate
    ? new Date(`${partida.matchDate}T12:00:00`).toLocaleDateString(currentLanguage, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  const translateDayAbbr = (dayAbbr: string) => {
    const days: Record<string, string> = {
      'SEG': t('days.mon', 'SEG'),
      'TER': t('days.tue', 'TER'),
      'QUA': t('days.wed', 'QUA'),
      'QUI': t('days.thu', 'QUI'),
      'SEX': t('days.fri', 'SEX'),
      'SAB': t('days.sat', 'SAB'),
      'SÁB': t('days.sat', 'SAB'),
      'DOM': t('days.sun', 'DOM'),
    };
    return days[dayAbbr] || dayAbbr;
  };

  const translateShiftLabel = (shift: string) => {
    const shifts: Record<string, string> = {
      'Manhã': t('shifts.morning', 'Manhã'),
      'Tarde': t('shifts.afternoon', 'Tarde'),
      'Noite': t('shifts.evening', 'Noite'),
    };
    return shifts[shift] || shift;
  };

  const translateDateLabel = (label: string) => {
    const parts = label.split(' - ');
    if (parts.length === 2) {
      return `${translateDayAbbr(parts[0])} - ${translateShiftLabel(parts[1])}`;
    }
    return label;
  };

  const translateStatusLabel = (label: string) => {
    if (label.includes('abertas') || label.includes('Open') || label.includes('disponibles')) return t('statusOpen', 'Vagas abertas');
    if (label.includes('Lotada') || label.includes('Full') || label.includes('Completo')) return t('statusFull', 'Lotada');
    if (label.includes('Criada') || label.includes('Created')) return t('statusCreatedByYou', 'Criada por você');
    if (label.includes('Finalizada') || label.includes('Finished')) return t('statusFinished', 'Finalizada');
    return label;
  };

  const translateStartsInLabel = (label: string | null | undefined) => {
    if (!label) return label;
    if (label.includes('andamento') || label.includes('progress')) return t('startsInProgress', 'Em andamento');
    return label;
  };

  const translateLevelLabel = (label: string) => {
    if (label === 'Casual') return t('levelCasual', 'Casual');
    if (label.includes('Intermediário') || label.includes('Intermédio') || label.includes('Intermedio')) return t('levelIntermediate', 'Intermediate');
    if (label.includes('Avançado') || label.includes('Avanzado')) return t('levelAdvanced', 'Advanced');
    return label;
  };

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
          opacity: partida.isDimmed ? 0.55 : 1,
          ...matchShadows.panel,
        }}
      >
        <LinearGradient colors={bannerPalette} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="h-24 px-[14px] py-3">
        <View className="absolute right-[14px] top-[14px]">
          <StatusStamp status={partida.status} label={translateStatusLabel(partida.statusLabel)} />
        </View>

        <View className="absolute right-[14px] top-1/2 -mt-7">
          <Text variant="number" className="text-[60px] opacity-10" style={{ color: '#FFFFFF' }}>
            {partida.modality.toUpperCase()}
          </Text>
        </View>

        <View className="flex-row items-end gap-3">
          <Text
            variant="number"
            className="text-[34px] leading-[31px]"
            style={{
              color: '#FFFFFF',
              fontFamily: 'BebasNeue_400Regular',
              fontWeight: '400',
              letterSpacing: 0,
              textTransform: 'uppercase',
            }}
          >
            <Text
              variant="micro"
              className="font-semibold tracking-[2px] uppercase"
              style={{
                color: 'rgba(255,255,255,0.78)',
                fontFamily: 'Geist_600SemiBold',
              }}
            >
              {translateDateLabel(partida.dateLabel)}
            </Text>{'\n'}
            {partida.timeLabel.toUpperCase()}
          </Text>

          <MatchPricePill price={partida.pricePerPlayer} />
        </View>
      </LinearGradient>

      <View className="p-[14px]">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-1 pr-2">
            <Text variant="body" className="font-semibold text-[16px]" style={{ color: matchTheme.colors.fgPrimary }}>
              {partida.title}
            </Text>
            <View className="flex-row items-center gap-1 mt-1">
              <MapPin size={11} color={matchTheme.colors.fgMuted} />
              <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                {partida.location}
                {typeof partida.distanceKm === 'number' ? ` - ${partida.distanceKm.toFixed(1)}km` : ''}
                {formattedMatchDate ? ` - ${formattedMatchDate}` : ''}
              </Text>
            </View>
          </View>

          <StatBadge label={translateLevelLabel(partida.levelLabel)} tone={levelToneToBadge(partida.levelTone)} small />
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1 mr-2">
            <AvatarStack players={partida.players ?? []} />
            <View className="w-[60px] h-1 rounded-full overflow-hidden" style={{ backgroundColor: matchTheme.colors.lineStrong }}>
              <View className="h-1 rounded-full" style={{ width: `${fillPercent}%`, backgroundColor: partida.status === 'done' ? matchTheme.colors.warn : matchTheme.colors.ok }} />
            </View>
            <Text
              variant="caption"
              style={{
                color: matchTheme.colors.fgSecondary,
                fontFamily: 'Geist_400Regular',
                fontSize: 12,
                lineHeight: 12,
                letterSpacing: 0,
                textTransform: 'none',
              }}
            >
              <Text
                variant="number"
                className="text-[34px] leading-none"
                style={{
                  color: matchTheme.colors.fgPrimary,
                  fontFamily: 'BebasNeue_400Regular',
                  letterSpacing: 0,
                  textTransform: 'none',
                }}
              >
                {partida.occupiedSlots}/{partida.totalSlots}
              </Text>{' '}
              {t('slots', 'vagas')}
            </Text>
          </View>

          {rightAction ?? (
            <View className="flex-row items-center gap-1">
              <Clock3 size={12} color={partida.status === 'done' ? matchTheme.colors.warn : matchTheme.colors.ok} />
              <Text variant="caption" className="font-semibold" style={{ color: partida.status === 'done' ? matchTheme.colors.warn : matchTheme.colors.ok }}>
                {translateStartsInLabel(partida.startsIn) ?? '--'}
              </Text>
            </View>
          )}
        </View>
        </View>
      </TouchableScale>
    </MotiView>
  );
}
