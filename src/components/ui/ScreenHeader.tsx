import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from './Text';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
};

export function ScreenHeader({ title, subtitle, showBack = true }: ScreenHeaderProps) {
  return (
    <View className="mb-5 pt-1">
      <View className="flex-row items-center">
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (typeof router.canGoBack === 'function' && router.canGoBack()) {
                router.back();
                return;
              }
              router.replace('/');
            }}
            className="h-11 w-11 rounded-md border border-ink-hairline bg-ink-2 items-center justify-center mr-3"
          >
            <ChevronLeft color="#F5F7FA" size={20} />
          </Pressable>
        ) : null}

        <View className="flex-1">
          <Text variant="heading" tone="primary" className="font-bold">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="body" tone="secondary" className="mt-1">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
