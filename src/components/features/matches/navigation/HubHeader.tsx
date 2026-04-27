import { MessageCircleMore } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type HubHeaderProps = {
  onMessagesPress?: () => void;
  unreadCount?: number;
};

export function HubHeader({ onMessagesPress, unreadCount = 0 }: HubHeaderProps) {
  const theme = useAppColorScheme();
  const titleColor = theme === 'light' ? '#1F2937' : '#FFFFFF';
  const subtitleColor = theme === 'light' ? '#7A8597' : 'rgba(255,255,255,0.45)';
  const buttonBg = theme === 'light' ? '#E8F3ED' : '#22B76C1F';
  const buttonBorder = theme === 'light' ? '#86DDB3' : '#22B76C4D';
  const buttonIcon = theme === 'light' ? '#1A8F57' : '#86E5B4';

  return (
    <View className="px-4 pb-2 pt-2">
      <View className="relative min-h-[44px] justify-center">
        <View className="absolute left-0 right-0 items-center">
          <Text className="font-geistBold text-[15px]" style={{ color: titleColor }}>Hub de Partidas</Text>
          <Text className="text-[10px] font-geistBold uppercase tracking-[2px]" style={{ color: subtitleColor }}>Quinta - Porto Alegre</Text>
        </View>

        {onMessagesPress ? (
          <Pressable
            className="ml-auto h-10 w-10 items-center justify-center rounded-full border"
            style={{ borderColor: buttonBorder, backgroundColor: buttonBg }}
            onPress={onMessagesPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Abrir conversas"
          >
            <MessageCircleMore size={18} color={buttonIcon} strokeWidth={2.2} />
            {unreadCount > 0 ? (
              <View
                className="absolute -right-1 -top-1 min-w-[18px] rounded-full border bg-[#22B76C] px-1"
                style={{ borderColor: theme === 'light' ? '#F4F6F9' : '#05070B' }}
              >
                <Text className="text-center font-geistBold text-[10px] text-[#05070B]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
