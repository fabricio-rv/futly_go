import { View } from 'react-native';

import { Text } from './Text';

type XpHeaderProps = {
  level: number;
  xp: number;
  xpNext?: number;
  name: string;
};

export function XpHeader({ level, xp, xpNext = 3350, name }: XpHeaderProps) {
  const progress = Math.max(0, Math.min(xp / Math.max(xpNext, 1), 1));
  const firstLetter = name?.slice(0, 1).toUpperCase() || 'F';
  const todayXp = Math.max(0, Math.round((xpNext - xp) * 0.05));

  return (
    <View className="flex-row items-center gap-3 mb-4">
      <View className="w-12 h-12 rounded-full items-center justify-center border border-gold-500 bg-gold-700/70">
        <Text variant="bodyLg" tone="primary" className="font-semibold">
          {firstLetter}
        </Text>
      </View>

      <View className="flex-1">
        <Text variant="title" tone="primary" className="font-bold mb-0.5">
          Ola, {name}!
        </Text>

        <View className="flex-row items-center gap-2">
          <View className="flex-1 h-1.5 rounded-pill bg-[#DDE3ED] dark:bg-ink-3 overflow-hidden">
            <View
              className="h-full rounded-pill"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: '#22B76C',
              }}
            />
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-1">
          <Text variant="label" tone="muted" className="font-semibold">
            NIV. {level} - {xp.toLocaleString('pt-BR')} / {xpNext.toLocaleString('pt-BR')} XP
          </Text>
          <Text variant="label" tone="gold" className="font-bold">
            +{todayXp} hoje
          </Text>
        </View>
      </View>
    </View>
  );
}
