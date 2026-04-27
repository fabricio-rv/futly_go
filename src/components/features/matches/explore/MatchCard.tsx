import { LinearGradient } from 'expo-linear-gradient';
import { Clock3, MapPin } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';
import type { Partida } from '@/src/features/matches/types';
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
  const fillPercent = partida.totalSlots > 0 ? Math.round((partida.occupiedSlots / partida.totalSlots) * 100) : 0;
  const formattedMatchDate = partida.matchDate
    ? new Date(`${partida.matchDate}T12:00:00`).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  return (
    <Pressable
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
          <StatusStamp status={partida.status} label={partida.statusLabel} />
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
              {partida.dateLabel}
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

          <StatBadge label={partida.levelLabel} tone={levelToneToBadge(partida.levelTone)} small />
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
              vagas
            </Text>
          </View>

          {rightAction ?? (
            <View className="flex-row items-center gap-1">
              <Clock3 size={12} color={partida.status === 'done' ? matchTheme.colors.warn : matchTheme.colors.ok} />
              <Text variant="caption" className="font-semibold" style={{ color: partida.status === 'done' ? matchTheme.colors.warn : matchTheme.colors.ok }}>
                {partida.startsIn ?? '--'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
