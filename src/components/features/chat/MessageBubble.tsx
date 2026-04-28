import { Check, CheckCheck, CornerUpLeft, Forward, Pin, Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { getChatTokens } from '@/src/lib/chatTokens';
import { Text } from '@/src/components/ui';
import type { ChatMessage } from '@/src/components/features/store/data';

type MessageBubbleProps = {
  message: ChatMessage;
  showSenderName?: boolean;
  isPinned?: boolean;
  isSaved?: boolean;
  isForwarded?: boolean;
  selectMode?: boolean;
  isSelected?: boolean;
  reactions?: Array<{ emoji: string; count: number; reactedByMe: boolean }>;
  onLongPress?: (message: ChatMessage) => void;
  onReactionPress?: (emoji: string) => void;
  onToggleSelect?: (messageId: string) => void;
};

export function MessageBubble({
  message,
  showSenderName = false,
  isPinned = false,
  isSaved = false,
  isForwarded = false,
  selectMode = false,
  isSelected = false,
  reactions = [],
  onLongPress,
  onReactionPress,
  onToggleSelect,
}: MessageBubbleProps) {
  const theme = useAppColorScheme();
  const tk = getChatTokens(theme);

  if (message.kind === 'system') {
    return (
      <View
        className="self-center rounded-full border px-3.5 py-1.5 my-[6px]"
        style={{ borderColor: tk.systemBorder, backgroundColor: tk.systemBg }}
      >
        <Text variant="micro" style={{ color: tk.brand.gold.primary }} className="font-semibold">
          {message.text}
        </Text>
      </View>
    );
  }

  const mine = message.kind === 'me';

  const receiptIcon = mine
    ? message.receipt === 'read'
      ? <CheckCheck size={13} color={tk.receiptRead} strokeWidth={2.2} />
      : message.receipt === 'delivered'
        ? <CheckCheck size={13} color={tk.receiptOwnDelivered} strokeWidth={2.2} />
        : <Check size={13} color={tk.receiptOwnSent} strokeWidth={2.2} />
    : null;

  const handlePress = () => {
    if (selectMode) onToggleSelect?.(message.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={() => !selectMode && onLongPress?.(message)}
      delayLongPress={260}
      className={`flex-row items-end gap-2 mb-[7px] ${mine ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Select checkbox */}
      {selectMode && (
        <View
          className="mb-1 h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
          style={{
            borderColor: isSelected ? tk.brand.green.primary : tk.border.primary,
            backgroundColor: isSelected ? tk.brand.green.primary : 'transparent',
          }}
        >
          {isSelected && (
            <View style={{ width: 10, height: 8, alignItems: 'center', justifyContent: 'center' }}>
              <Check size={9} color="#FFFFFF" strokeWidth={3} />
            </View>
          )}
        </View>
      )}

      <View
        className={`max-w-[82%] rounded-[16px] px-3 py-2 border ${mine ? 'rounded-tr-[4px]' : 'rounded-tl-[4px]'}`}
        style={{
          backgroundColor: mine ? tk.bubbleOwnBg : tk.bubbleThemBg,
          borderColor: mine ? tk.bubbleOwnBorder : tk.bubbleThemBorder,
          opacity: isSelected ? 0.85 : 1,
        }}
      >
        {/* Group sender name */}
        {showSenderName && !mine && message.author ? (
          <Text
            variant="micro"
            numberOfLines={1}
            style={{ color: tk.brand.gold.primary }}
            className="font-bold mb-[2px]"
          >
            {message.author}
            {message.role ? ` · ${message.role}` : ''}
          </Text>
        ) : null}

        {/* Forwarded badge */}
        {isForwarded ? (
          <View className="flex-row items-center gap-1 mb-1 opacity-70">
            <Forward size={10} color={mine ? tk.replyTextOwn : tk.replyTextThem} />
            <Text variant="micro" style={{ color: mine ? tk.replyTextOwn : tk.replyTextThem }}>
              Encaminhado
            </Text>
          </View>
        ) : null}

        {/* Reply quote */}
        {message.replyTo ? (
          <View
            className="mb-1.5 rounded-[8px] border-l-2 px-2 py-1"
            style={{
              borderLeftColor: mine ? tk.replyOwnBorder : tk.replyThemBorder,
              backgroundColor: mine ? tk.replyOwnBg : tk.replyThemBg,
            }}
          >
            <View className="flex-row items-center gap-1">
              <CornerUpLeft size={10} color={mine ? tk.replyArrowOwn : tk.replyArrowThem} />
              <Text
                variant="micro"
                numberOfLines={1}
                style={{ color: mine ? tk.replyTextOwn : tk.replyTextThem }}
              >
                {message.replyTo}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Message text */}
        <Text
          variant="caption"
          style={{ lineHeight: 18, color: mine ? '#FFFFFF' : tk.text.primary }}
        >
          {message.text}
        </Text>

        {/* Footer: pin, save, time, receipt */}
        <View className="mt-1 flex-row items-center justify-end gap-1.5">
          {isPinned ? (
            <Pin size={10} color={mine ? tk.brand.green.faint : tk.brand.gold.primary} />
          ) : null}
          {isSaved ? (
            <Star size={10} color={tk.brand.gold.primary} fill={tk.brand.gold.primary} />
          ) : null}
          {message.time ? (
            <Text
              variant="micro"
              style={{ color: mine ? 'rgba(255,255,255,0.55)' : tk.text.tertiary }}
            >
              {message.time}
            </Text>
          ) : null}
          {receiptIcon}
        </View>

        {/* Reaction chips */}
        {reactions.length > 0 ? (
          <View className={`mt-1.5 flex-row flex-wrap gap-1 ${mine ? 'justify-end' : 'justify-start'}`}>
            {reactions.map((reaction) => (
              <Pressable
                key={reaction.emoji}
                className="rounded-full border px-2 py-0.5 flex-row items-center gap-1"
                style={{
                  borderColor: reaction.reactedByMe
                    ? tk.reactionActiveBorder
                    : tk.reactionInactiveBorder,
                  backgroundColor: reaction.reactedByMe
                    ? tk.reactionActiveBg
                    : mine
                      ? tk.reactionOwnInactiveBg
                      : tk.reactionThemInactiveBg,
                }}
                onPress={() => onReactionPress?.(reaction.emoji)}
              >
                <Text
                  variant="micro"
                  style={{ color: mine ? '#FFFFFF' : tk.text.primary }}
                >
                  {reaction.emoji} {reaction.count}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
