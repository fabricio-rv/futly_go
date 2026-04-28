import { Check, CheckCheck } from 'lucide-react-native';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { getChatTokens } from '@/src/lib/chatTokens';
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
  const tk = getChatTokens(theme);

  const showUnread = !!item.unreadCount;
  const isGoldTone = item.avatarTone === 'gold';

  const timeColor = item.unread ? tk.brand.green.primary : tk.text.tertiary;
  const messageColor = item.unread ? tk.text.primary : tk.text.secondary;

  const receiptIcon = item.checkStatus === 'read'
    ? <CheckCheck size={14} color={tk.receiptRead} strokeWidth={2.2} />
    : item.checkStatus === 'delivered'
      ? <CheckCheck size={14} color={tk.receiptDelivered} strokeWidth={2.2} />
      : item.checkStatus === 'sent'
        ? <Check size={14} color={tk.receiptSent} strokeWidth={2.2} />
        : null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 180 }}
    >
      <TouchableScale
        onPress={onPress}
        style={{
          borderBottomWidth: 1,
          borderColor: tk.borderListRow,
          backgroundColor: tk.listRowBg,
          opacity: item.archived ? 0.72 : 1,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 18,
            paddingVertical: 12,
          }}
        >
        <LinearGradient
          colors={avatarToneMap[item.avatarTone]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: tk.borderAvatar,
            marginRight: 12,
            flexShrink: 0,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 }}>
            {item.avatar}
          </Text>
        </LinearGradient>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: tk.text.primary,
                  fontSize: 15,
                  fontWeight: item.unread ? '700' : '600',
                  flexShrink: 1,
                }}
              >
                {item.title}
              </Text>
              {item.privateTag ? (
                <View
                  style={{
                    backgroundColor: tk.surfaceTag,
                    borderRadius: 4,
                    paddingHorizontal: 5,
                    paddingVertical: 1,
                    flexShrink: 0,
                  }}
                >
                  <Text
                    style={{
                      color: tk.brand.gold.primary,
                      fontSize: 10,
                      fontWeight: '700',
                      letterSpacing: 0.6,
                    }}
                  >
                    {item.privateTag}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text
              style={{
                color: timeColor,
                fontSize: 12,
                fontWeight: item.unread ? '600' : '400',
                marginLeft: 8,
                flexShrink: 0,
              }}
            >
              {item.time}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {receiptIcon && !showUnread ? (
              <View style={{ marginRight: 3, flexShrink: 0 }}>
                {receiptIcon}
              </View>
            ) : null}
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                color: messageColor,
                fontSize: 13,
                fontWeight: item.unread ? '500' : '400',
              }}
            >
              {item.author ? `${item.author}: ` : ''}
              {item.message}
            </Text>

            <View style={{ marginLeft: 6, flexShrink: 0 }}>
              {showUnread ? (
                <View
                  style={{
                    height: 20,
                    minWidth: 20,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 6,
                    backgroundColor: isGoldTone ? tk.brand.gold.primary : tk.brand.green.primary,
                  }}
                >
                  <Text
                    style={{
                      color: tk.brand.black,
                      fontSize: 11,
                      fontWeight: '800',
                    }}
                  >
                    {item.unreadCount}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
        </View>
      </TouchableScale>
    </MotiView>
  );
}
