import { ChevronLeft, MoreVertical, Star } from 'lucide-react-native';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { getChatTokens } from '@/src/lib/chatTokens';
import { IconButton, Text } from '@/src/components/ui';

type ConversationHeaderProps = {
  title: string;
  subtitle: string;
  avatar: string;
  isOnline?: boolean;
  isTyping?: boolean;
  onBack: () => void;
  onOpenMenu: () => void;
};

export function ConversationHeader({
  title,
  subtitle,
  avatar,
  isOnline = false,
  isTyping = false,
  onBack,
  onOpenMenu,
}: ConversationHeaderProps) {
  const theme = useAppColorScheme();
  const tk = getChatTokens(theme);

  // Subtitle is green when someone is typing or the contact is online
  const subtitleColor = isTyping || isOnline ? tk.onlineText : tk.text.tertiary;

  return (
    <View
      className="border-b"
      style={{
        backgroundColor: tk.surfaceHeader,
        borderBottomColor: tk.borderHeader,
      }}
    >
      <View className="px-3 pb-2 pt-1 flex-row items-center gap-2">
        <IconButton icon={<ChevronLeft size={18} color={tk.icon.primary} />} onPress={onBack} />

        <View className="flex-1 flex-row items-center gap-2">
          <View>
            <LinearGradient
              colors={['#0F3A24', '#072314']}
              className="h-10 w-10 rounded-full border items-center justify-center"
              style={{ borderColor: tk.brand.green.bg38 }}
            >
              <Text variant="label" className="font-bold text-white">
                {avatar}
              </Text>
            </LinearGradient>
            <View
              className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2"
              style={{
                borderColor: tk.onlineDotBorder,
                backgroundColor: isOnline ? tk.onlineDot : tk.offlineDot,
              }}
            />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text
                variant="label"
                className="font-semibold"
                style={{ color: tk.text.primary }}
                numberOfLines={1}
              >
                {title}
              </Text>
              <Star size={10} color={tk.brand.gold.primary} fill={tk.brand.gold.primary} strokeWidth={1.6} />
            </View>
            <Text variant="micro" numberOfLines={1} style={{ color: subtitleColor }}>
              {subtitle}
            </Text>
          </View>
        </View>

        <IconButton icon={<MoreVertical size={16} color={tk.icon.primary} />} onPress={onOpenMenu} />
      </View>
    </View>
  );
}
