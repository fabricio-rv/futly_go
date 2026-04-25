import { MessageCircleMore } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

type HubHeaderProps = {
  onMessagesPress?: () => void;
  unreadCount?: number;
};

export function HubHeader({ onMessagesPress, unreadCount = 0 }: HubHeaderProps) {
  return (
    <View className="px-4 pb-2 pt-2">
      <View className="relative min-h-[44px] justify-center">
        <View className="absolute left-0 right-0 items-center">
          <Text className="font-geistBold text-[15px] text-white">Hub de Partidas</Text>
          <Text className="text-[10px] font-geistBold uppercase tracking-[2px] text-fg3">Quinta - Porto Alegre</Text>
        </View>

        {onMessagesPress ? (
          <Pressable
            className="ml-auto h-10 w-10 items-center justify-center rounded-full border border-[#22B76C4D] bg-[#22B76C1F]"
            onPress={onMessagesPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Abrir conversas"
          >
            <MessageCircleMore size={18} color="#86E5B4" strokeWidth={2.2} />
            {unreadCount > 0 ? (
              <View className="absolute -right-1 -top-1 min-w-[18px] rounded-full border border-[#05070B] bg-[#22B76C] px-1">
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
