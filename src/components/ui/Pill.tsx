import { Pressable, type PressableProps, View } from 'react-native';

import { Text } from './Text';

type PillTone = 'default' | 'active' | 'gold' | 'warn' | 'coral' | 'sky';

const toneClass: Record<PillTone, string> = {
  default: 'bg-[#0C111E] border-line2',
  active: 'bg-ok border-ok',
  gold: 'bg-gold-500 border-gold-500',
  warn: 'bg-[#F5A52424] border-[#F5A52459]',
  coral: 'bg-[#E84C3724] border-[#E84C3759]',
  sky: 'bg-[#5AB1FF24] border-[#5AB1FF59]',
};

const toneTextClass: Record<PillTone, string> = {
  default: 'text-fg2',
  active: 'text-[#05070B]',
  gold: 'text-[#2A1A05]',
  warn: 'text-warn',
  coral: 'text-[#FF8B7A]',
  sky: 'text-[#7AC0FF]',
};

type PillProps = Omit<PressableProps, 'children'> & {
  label: string;
  tone?: PillTone;
  rightLabel?: string;
  className?: string;
};

export function Pill({ label, tone = 'default', rightLabel, className, ...rest }: PillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`h-[30px] px-3 rounded-full border flex-row items-center gap-[6px] ${toneClass[tone]} ${className ?? ''}`.trim()}
      {...rest}
    >
      <Text variant="caption" className={`font-semibold ${toneTextClass[tone]}`}>
        {label}
      </Text>
      {rightLabel ? (
        <View className="rounded-[5px] bg-black/15 px-1.5 py-[1px]">
          <Text variant="micro" className={`font-bold ${toneTextClass[tone]}`}>
            {rightLabel}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
