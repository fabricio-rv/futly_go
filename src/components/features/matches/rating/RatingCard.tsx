import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { Text } from '@/src/components/ui';
import { RatingStars } from '../shared/RatingStars';
import { useMatchTheme } from '../shared/theme';

type RatingCardProps = {
  initials: string;
  name: string;
  context: string;
  stars: number;
  onChangeStars?: (value: number) => void;
  gradeLabel: string;
};

export function RatingCard({ initials, name, context, stars, onChangeStars, gradeLabel }: RatingCardProps) {
  const matchTheme = useMatchTheme();

  return (
    <View className="rounded-[20px] border p-5 items-center" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
      <LinearGradient colors={['#1B3A5F', '#071428']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="w-[88px] h-[88px] rounded-[24px] border-2 items-center justify-center mb-3" style={{ borderColor: 'rgba(212,161,58,0.5)' }}>
        <Text variant="heading" className="text-[30px]" style={{ color: matchTheme.colors.fgPrimary }}>{initials}</Text>
      </LinearGradient>

      <Text variant="heading" className="font-semibold" style={{ color: matchTheme.colors.fgPrimary }}>{name}</Text>
      <Text variant="caption" className="text-center mt-1 mb-4" style={{ color: matchTheme.colors.fgMuted }}>{context}</Text>

      <RatingStars value={stars} size={36} onChange={onChangeStars} />

      <Text variant="micro" className="mt-3 uppercase tracking-[1px]" style={{ color: matchTheme.colors.goldA }}>{gradeLabel}</Text>
    </View>
  );
}
