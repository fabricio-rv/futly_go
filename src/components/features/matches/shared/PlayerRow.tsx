import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { Text } from '@/src/components/ui';
import type { Jogador } from '@/src/features/matches/types';
import { RatingStars } from './RatingStars';
import { StatBadge } from './StatBadge';
import { matchTheme } from './theme';

type PlayerRowProps = {
  player: Jogador;
  showStars?: number;
  pendingLabel?: string;
};

export function PlayerRow({ player, showStars, pendingLabel }: PlayerRowProps) {
  return (
    <View className="flex-row items-center gap-3 px-[14px] py-3 border-b" style={{ borderColor: matchTheme.colors.line }}>
      <LinearGradient colors={player.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="w-10 h-10 rounded-full border-2 border-white/10 items-center justify-center">
        <Text variant="caption" className="font-bold">{player.initials}</Text>
      </LinearGradient>

      <View className="flex-1">
        <Text variant="label" className="font-semibold" style={{ color: matchTheme.colors.fgPrimary }}>{player.name}</Text>
        <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>{player.rating.toFixed(1)} estrelas - {player.position}</Text>
      </View>

      {typeof showStars === 'number' ? <RatingStars value={showStars} /> : null}
      {pendingLabel ? <StatBadge label={pendingLabel} tone="warn" small /> : null}
      {!showStars && !pendingLabel ? <Text variant="number" className="text-[18px]" style={{ color: matchTheme.colors.goldA }}>{player.position}</Text> : null}
    </View>
  );
}
