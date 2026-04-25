import { Pressable, type PressableProps, View } from 'react-native';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { Text } from './Text';

type PillTone = 'default' | 'active' | 'gold' | 'warn' | 'coral' | 'sky';

type PillProps = Omit<PressableProps, 'children'> & {
  label: string;
  tone?: PillTone;
  rightLabel?: string;
  className?: string;
};

export function Pill({ label, tone = 'default', rightLabel, className, ...rest }: PillProps) {
  const theme = useAppColorScheme();
  const isLight = theme === 'light';

  const toneStyles: Record<PillTone, { bg: string; border: string; text: string }> = {
    default: {
      bg: isLight ? '#EAF0F8' : '#0C111E',
      border: isLight ? '#D1DCEB' : 'rgba(255,255,255,0.10)',
      text: isLight ? '#475569' : 'rgba(255,255,255,0.70)',
    },
    active: { bg: '#22B76C', border: '#22B76C', text: '#05070B' },
    gold: { bg: '#D4A13A', border: '#D4A13A', text: '#2A1A05' },
    warn: { bg: 'rgba(245,165,36,0.18)', border: 'rgba(245,165,36,0.45)', text: '#C98410' },
    coral: { bg: 'rgba(232,76,55,0.16)', border: 'rgba(232,76,55,0.40)', text: '#DC6C5F' },
    sky: { bg: 'rgba(90,177,255,0.16)', border: 'rgba(90,177,255,0.45)', text: '#3D86D4' },
  };

  const current = toneStyles[tone];

  return (
    <Pressable
      accessibilityRole="button"
      className={`h-[30px] px-3 rounded-full border flex-row items-center gap-[6px] ${className ?? ''}`.trim()}
      style={{ backgroundColor: current.bg, borderColor: current.border }}
      {...rest}
    >
      <Text variant="caption" className="font-semibold" style={{ color: current.text }}>
        {label}
      </Text>
      {rightLabel ? (
        <View className="rounded-[5px] px-1.5 py-[1px]" style={{ backgroundColor: tone === 'active' || tone === 'gold' ? 'rgba(0,0,0,0.16)' : isLight ? 'rgba(15,23,42,0.10)' : 'rgba(0,0,0,0.15)' }}>
          <Text variant="micro" className="font-bold" style={{ color: current.text }}>
            {rightLabel}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
