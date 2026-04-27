import { View } from 'react-native';

import { Text } from './Text';

type StatItemProps = {
  icon: React.ReactNode;
  value: string | number;
  label: string;
};

type StatsBarProps = {
  title: string;
  items: StatItemProps[];
};

export function StatsBar({ title, items }: StatsBarProps) {
  return (
    <View className="bg-[#FAFBFC] dark:bg-ink-2 border border-[rgba(0,0,0,0.08)] dark:border-ink-hairline rounded-lg p-4 mt-4">
      <Text variant="eyebrow" tone="muted" className="mb-3">
        {title}
      </Text>
      <View className="flex-row justify-between">
        {items.map((item, idx) => (
          <View key={idx} className="items-center flex-1">
            <View className="w-10 h-10 rounded-md bg-[#EEF1F5] dark:bg-ink-3 items-center justify-center mb-2">
              {item.icon}
            </View>
            <Text variant="title" tone="primary" className="font-semibold">
              {item.value}
            </Text>
            <Text variant="caption" tone="muted" className="uppercase tracking-[1px]">
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
