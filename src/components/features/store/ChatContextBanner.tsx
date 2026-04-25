import { Globe, ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { Text } from '@/src/components/ui';

type ChatContextBannerProps = {
  title: string;
  subtitle: string;
  onPress?: () => void;
};

export function ChatContextBanner({ title, subtitle, onPress }: ChatContextBannerProps) {
  const theme = useAppColorScheme();

  return (
    <View
      className="mx-[14px] mt-[6px] mb-[10px] rounded-[14px] border px-[14px] py-3 flex-row items-center gap-[10px]"
      style={{
        borderColor: theme === 'light' ? '#86DDB3' : '#22B76C4D',
        backgroundColor: theme === 'light' ? '#EAF7F0' : '#22B76C1F',
      }}
    >
      <View className="h-[34px] w-[34px] rounded-[10px] items-center justify-center" style={{ backgroundColor: theme === 'light' ? 'rgba(34,183,108,0.20)' : '#22B76C2E' }}>
        <Globe size={18} color={theme === 'light' ? '#1A8F57' : '#86E5B4'} strokeWidth={2} />
      </View>

      <View className="flex-1">
        <Text variant="caption" className="font-bold text-gray-900 dark:text-white">
          {title}
        </Text>
        <Text variant="micro" className="mt-[2px] text-gray-600 dark:text-fg2">
          {subtitle}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="h-8 w-8 rounded-[10px] border items-center justify-center"
        style={{
          borderColor: theme === 'light' ? '#86DDB3' : '#22B76C4D',
          backgroundColor: theme === 'light' ? 'rgba(34,183,108,0.16)' : '#22B76C24',
        }}
      >
        <ChevronRight size={14} color={theme === 'light' ? '#1A8F57' : '#86E5B4'} />
      </Pressable>
    </View>
  );
}
