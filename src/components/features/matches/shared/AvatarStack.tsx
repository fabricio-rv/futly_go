import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import type { Jogador } from '@/src/features/matches/types';

type AvatarStackProps = {
  players: Jogador[];
  size?: number;
  max?: number;
};

export function AvatarStack({ players, size = 30, max = 3 }: AvatarStackProps) {
  const shown = players.slice(0, max);
  const extra = Math.max(players.length - max, 0);

  return (
    <View className="flex-row items-center">
      {shown.map((player, index) => (
        <LinearGradient
          key={player.id}
          colors={player.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-full border-2 border-[#0F1625] items-center justify-center"
          style={{
            width: size,
            height: size,
            marginLeft: index === 0 ? 0 : -10,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontFamily: 'Geist_700Bold',
              fontSize: 10,
              lineHeight: 10,
              letterSpacing: 0,
              textTransform: 'uppercase',
            }}
          >
            {player.initials}
          </Text>
        </LinearGradient>
      ))}
      {extra > 0 ? (
        <View
          className="rounded-full border-2 border-[#0F1625] items-center justify-center"
          style={{
            width: size,
            height: size,
            marginLeft: -10,
            backgroundColor: '#1B2236',
          }}
        >
          <Text
            style={{
              color: 'rgba(255,255,255,0.78)',
              fontFamily: 'Geist_400Regular',
              fontSize: 10,
              lineHeight: 10,
              letterSpacing: 0,
              textTransform: 'none',
            }}
          >
            +{extra}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
