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
  const height = small ? 18 : 32;
  const fontSize = small ? 12 : 13;

  if (tone === 'gold') {
    return (
      <LinearGradient
        colors={['#F6D27A', '#D4A13A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: '#D4A13A', alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ color: '#2A1A05', fontSize, fontFamily: 'Geist_700Bold', fontWeight: '700' }}>{label}</Text>
      </LinearGradient>
    );
  }

  const toneMap: Record<Exclude<StatBadgeTone, 'gold'>, { bg: string; border: string; text: string }> = {
    warn: { bg: 'rgba(245,165,36,0.14)', border: 'rgba(245,165,36,0.35)', text: '#F5A524' },
    sky: { bg: 'rgba(90,177,255,0.14)', border: 'rgba(90,177,255,0.35)', text: '#7AC0FF' },
    neutral: {
      bg: isLight ? '#E8ECF2' : '#151D30',
      border: isLight ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.20)',
      text: isLight ? '#374151' : '#FFFFFF',
    },
    green: { bg: 'rgba(34,183,108,0.14)', border: 'rgba(34,183,108,0.35)', text: '#86E5B4' },
    active: { bg: '#22B76C', border: '#22B76C', text: '#05070B' },
  };

  const toneToken = toneMap[tone];

  return (
    <View style={{ height, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: toneToken.bg, borderColor: toneToken.border }}>
      <Text style={{ color: toneToken.text, fontSize, fontFamily: 'Geist_700Bold', fontWeight: '700' }}>{label}</Text>
    </View>
  );
}
