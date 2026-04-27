import { View, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { TouchableScale } from './TouchableScale';

type ActionCardProps = {
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
};

export function ActionCard({ label, subtitle, icon, onPress, style, testID }: ActionCardProps) {
  return (
    <TouchableScale
      onPress={onPress}
      testID={testID}
      className="flex-1"
      style={style}
    >
      <View className="rounded-lg border border-[rgba(0,0,0,0.08)] dark:border-ink-hairline bg-[#FAFBFC] dark:bg-ink-2 p-4 h-[136px] justify-between">
        <View>
          <Text variant="eyebrow" tone="primary" className="font-bold tracking-[2px]">
            {label}
          </Text>
          {subtitle ? (
            <Text variant="body" tone="secondary" className="mt-1">
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View className="items-end">
          <View className="h-14 w-14 rounded-md border border-emerald-500/30 bg-emerald-500/10 items-center justify-center">
            {icon}
          </View>
        </View>
      </View>
    </TouchableScale>
  );
}
