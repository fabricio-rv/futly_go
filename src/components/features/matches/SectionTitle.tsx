import { View } from 'react-native';

import { Text } from '@/src/components/ui';
import { matchTheme } from './theme';

type SectionTitleProps = {
  title: string;
  badge?: string;
  actionText?: string;
};

export function SectionTitle({ title, badge, actionText }: SectionTitleProps) {
  return (
    <View className="flex-row items-center justify-between mb-2">
      <View className="flex-row items-center gap-2">
        <Text variant="micro" className="uppercase tracking-[2px] font-bold" style={{ color: matchTheme.colors.fgPrimary }}>
          {title}
        </Text>
        {badge ? (
          <View className="px-2 py-[2px] rounded-[6px] border" style={{ backgroundColor: 'rgba(212,161,58,0.1)', borderColor: 'rgba(212,161,58,0.25)' }}>
            <Text variant="micro" style={{ color: matchTheme.colors.goldA }}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {actionText ? <Text variant="caption" style={{ color: matchTheme.colors.fgSecondary }}>{actionText}</Text> : null}
    </View>
  );
}
