import { Check, CheckCheck } from 'lucide-react-native';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { Text, TouchableScale } from '@/src/components/ui';

import type { ConversationPreview } from './data';

const avatarToneMap: Record<ConversationPreview['avatarTone'], [string, string]> = {
  ok: ['#0F3A24', '#072314'],
  blue: ['#1A2236', '#0F1828'],
  brown: ['#5A3018', '#2A160A'],
  wine: ['#241015', '#170A0F'],
  gold: ['#3A2A05', '#1F1605'],
};

type ConversationListItemProps = {
  item: ConversationPreview;
  onPress?: () => void;
};

export function ConversationListItem({ item, onPress }: ConversationListItemProps) {
  const theme = useAppColorScheme();
  const showUnread = !!item.unreadCount;
  const isRead = item.checkStatus === 'read';
  const isSent = item.checkStatus === 'sent';
  const rowBorder = theme === 'light' ? '#D7E3F2' : 'rgba(255,255,255,0.06)';
  const rowBg = theme === 'light' ? '#FFFFFF' : '#08101E';

  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 220 }}
    >
      <TouchableScale
        onPress={onPress}
        className={`px-[18px] py-[13px] border-b flex-row items-center gap-3 ${item.archived ? 'opacity-75' : ''}`}
        style={{ borderColor: rowBorder, backgroundColor: rowBg }}
      >
        <LinearGradient
          colors={avatarToneMap[item.avatarTone]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-12 w-12 rounded-full items-center justify-center border"
          style={{ borderColor: theme === 'light' ? '#C9D6E8' : 'rgba(255,255,255,0.10)' }}
        >
          <Text variant="label" className="font-bold text-white">
            {item.avatar}
          </Text>
        </LinearGradient>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-0.5">
            <View className="flex-row items-center gap-1.5 flex-1">
              <Text numberOfLines={1} variant="label" className="font-semibold text-[#111827] dark:text-white">
                {item.title}
              </Text>
              {item.privateTag ? (
                <View className="rounded-[4px] px-1.5 py-[1px]" style={{ backgroundColor: theme === 'light' ? 'rgba(212,161,58,0.18)' : 'rgba(212,161,58,0.16)' }}>
                  <Text variant="micro" className="font-bold text-gold-700 dark:text-goldA tracking-[0.8px]">
                    {item.privateTag}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text
              variant="micro"
              className={`ml-2 font-semibold ${item.unread ? 'text-[#1A8F57] dark:text-ok' : 'text-[#6B7280] dark:text-fg3'}`}
            >
              {item.time}
            </Text>
          </View>

          <View className="flex-row items-center justify-between gap-2">
            <Text
              numberOfLines={1}
              variant="caption"
              className={`flex-1 ${item.unread ? 'text-[#1F2937] dark:text-fg2 font-medium' : 'text-[#6B7280] dark:text-fg3'}`}
            >
              {item.author ? `${item.author}: ` : ''}
              {item.message}
            </Text>

            {showUnread ? (
              <View
                className={`h-[18px] min-w-[18px] rounded-full items-center justify-center px-[5px] ${item.avatarTone === 'gold' ? 'bg-goldB' : 'bg-ok'}`}
              >
                <Text
                  variant="micro"
                  className={`font-extrabold ${item.avatarTone === 'gold' ? 'text-[#2A1A05]' : 'text-[#05070B]'}`}
                >
                  {item.unreadCount}
                </Text>
              </View>
            ) : isRead ? (
              <CheckCheck size={14} color="#5AB1FF" strokeWidth={2.2} />
            ) : isSent ? (
              <Check size={14} color={theme === 'light' ? 'rgba(15,23,42,0.35)' : 'rgba(255,255,255,0.45)'} strokeWidth={2.2} />
            ) : null}
          </View>
        </View>
      </TouchableScale>
    </MotiView>
  );
}
