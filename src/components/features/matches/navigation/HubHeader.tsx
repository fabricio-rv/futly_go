import { Bell, MessageCircleMore, Plus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

type RightAction = 'messages' | 'add' | 'none';

type HubHeaderProps = {
  onMessagesPress?: () => void;
  onNotificationsPress?: () => void;
  onAddPress?: () => void;
  unreadCount?: number;
  unreadNotifications?: number;
  title?: string;
  showMessages?: boolean;
  rightAction?: RightAction;
  rightAccessibilityLabel?: string;
};

export function HubHeader({
  onMessagesPress,
  onNotificationsPress,
  onAddPress,
  unreadCount = 0,
  unreadNotifications = 0,
  title,
  showMessages = true,
  rightAction,
  rightAccessibilityLabel,
}: HubHeaderProps) {
  const resolvedRightAction: RightAction =
    rightAction ?? (onAddPress ? 'add' : showMessages ? 'messages' : 'none');
  const showAddButton = resolvedRightAction === 'add' && !!onAddPress;
  const showMessagesButton = resolvedRightAction === 'messages' && !!onMessagesPress;
  const theme = useAppColorScheme();
  const { t } = useTranslation('matches');
  const titleColor = theme === 'light' ? '#1F2937' : '#FFFFFF';
  const buttonBg = theme === 'light' ? '#E8F3ED' : '#22B76C1F';
  const buttonBorder = theme === 'light' ? '#86DDB3' : '#22B76C4D';
  const buttonIcon = theme === 'light' ? '#1A8F57' : '#86E5B4';
  const badgeBorder = theme === 'light' ? '#F4F6F9' : '#05070B';

  return (
    <View className="px-4 pb-2 pt-2">
      <View className="relative min-h-[44px] flex-row items-center justify-between">
        {onNotificationsPress ? (
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full border"
            style={{ borderColor: buttonBorder, backgroundColor: buttonBg }}
            onPress={onNotificationsPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t('hub.openNotifications', 'Abrir notificações')}
          >
            <Bell size={18} color={buttonIcon} strokeWidth={2.2} />
            {unreadNotifications > 0 ? (
              <View
                className="absolute -right-1 -top-1 min-w-[18px] rounded-full border bg-[#22B76C] px-1"
                style={{ borderColor: badgeBorder }}
              >
                <Text className="text-center font-geistBold text-[10px] text-[#05070B]">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            ) : null}
          </Pressable>
        ) : (
          <View className="h-10 w-10" />
        )}

        <View className="absolute left-0 right-0 items-center" pointerEvents="none">
          <Text className="font-geistBold text-[15px]" style={{ color: titleColor }}>
            {title ?? t('hub.title', 'Futly Go')}
          </Text>
        </View>

        {showAddButton ? (
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full border"
            style={{ borderColor: buttonBorder, backgroundColor: buttonBg }}
            onPress={onAddPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={rightAccessibilityLabel ?? t('hub.add', 'Adicionar')}
          >
            <Plus size={20} color={buttonIcon} strokeWidth={2.4} />
          </Pressable>
        ) : showMessagesButton ? (
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full border"
            style={{ borderColor: buttonBorder, backgroundColor: buttonBg }}
            onPress={onMessagesPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={rightAccessibilityLabel ?? t('hub.openConversations', 'Abrir conversas')}
          >
            <MessageCircleMore size={18} color={buttonIcon} strokeWidth={2.2} />
            {unreadCount > 0 ? (
              <View
                className="absolute -right-1 -top-1 min-w-[18px] rounded-full border bg-[#22B76C] px-1"
                style={{ borderColor: badgeBorder }}
              >
                <Text className="text-center font-geistBold text-[10px] text-[#05070B]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        ) : (
          <View className="h-10 w-10" />
        )}
      </View>
    </View>
  );
}
