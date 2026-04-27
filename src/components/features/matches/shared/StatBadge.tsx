import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { Text } from '@/src/components/ui';

type StatBadgeTone = 'gold' | 'warn' | 'sky' | 'neutral' | 'green' | 'active';

type StatBadgeProps = {
  label: string;
  tone?: StatBadgeTone;
  small?: boolean;
};

export function StatBadge({ label, tone = 'neutral', small = false }: StatBadgeProps) {
  const theme = useAppColorScheme();
  const isLight = theme === 'light';
  const height = small ? 'h-6' : 'h-[30px]';
  const textClass = small ? 'text-[10px]' : 'text-xs';

  if (tone === 'gold') {
    return (
      <LinearGradient
        colors={['#F6D27A', '#D4A13A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={`${height} px-3 rounded-full border border-[#D4A13A] items-center justify-center`}
      >
        <Text variant="caption" className={textClass} style={{ color: '#2A1A05' }}>{label}</Text>
      </LinearGradient>
    );
  }

  const toneMap: Record<Exclude<StatBadgeTone, 'gold'>, { bg: string; border: string; text: string }> = {
    warn: { bg: 'rgba(245,165,36,0.14)', border: 'rgba(245,165,36,0.35)', text: '#F5A524' },
    sky: { bg: 'rgba(90,177,255,0.14)', border: 'rgba(90,177,255,0.35)', text: '#7AC0FF' },
    neutral: {
      bg: isLight ? '#EEF1F5' : '#0C111E',
      border: isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.10)',
      text: isLight ? '#4B5563' : 'rgba(255,255,255,0.70)',
    },
    green: { bg: 'rgba(34,183,108,0.14)', border: 'rgba(34,183,108,0.35)', text: '#86E5B4' },
    active: { bg: '#22B76C', border: '#22B76C', text: '#05070B' },
  };

  const toneToken = toneMap[tone];

  return (
    <View className={`${height} px-3 rounded-full border items-center justify-center`} style={{ backgroundColor: toneToken.bg, borderColor: toneToken.border }}>
      <Text variant="caption" className={textClass} style={{ color: toneToken.text }}>{label}</Text>
    </View>
  );
}
