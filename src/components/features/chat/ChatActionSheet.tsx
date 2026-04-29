import { Archive, Camera, Copy, CornerUpLeft, EyeOff, FileText, Forward, Image, Mic, Pin, Smile, Star, Trash2, Users, X } from 'lucide-react-native';
import { Modal, Pressable, useWindowDimensions, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { Twemoji } from '@/src/components/ui/emoji';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { getChatTokens } from '@/src/lib/chatTokens';

type ActionItem = {
  key: string;
  label: string;
  icon: 'reply' | 'pin' | 'save' | 'unread' | 'users' | 'archive' | 'reaction' | 'delete' | 'image' | 'camera' | 'document' | 'mic' | 'copy' | 'forward';
  onPress: () => void;
};

type ChatActionSheetProps = {
  visible: boolean;
  title?: string;
  actions: ActionItem[];
  quickReactions?: string[];
  anchor?: { x: number; y: number };
  onQuickReaction?: (emoji: string) => void;
  onMoreReactions?: () => void;
  onClose: () => void;
};

const iconMap = {
  reply: CornerUpLeft,
  pin: Pin,
  save: Star,
  unread: EyeOff,
  users: Users,
  archive: Archive,
  reaction: Smile,
  delete: Trash2,
  image: Image,
  camera: Camera,
  document: FileText,
  mic: Mic,
  copy: Copy,
  forward: Forward,
} as const;

function getActionIconColor(
  icon: ActionItem['icon'],
  goldColor: string,
  redColor: string,
  defaultColor: string,
): string {
  if (icon === 'save') return goldColor;
  if (icon === 'delete') return redColor;
  return defaultColor;
}

export function ChatActionSheet({
  visible,
  title,
  actions,
  quickReactions = [],
  anchor,
  onQuickReaction,
  onMoreReactions,
  onClose,
}: ChatActionSheetProps) {
  const theme = useAppColorScheme();
  const tk = getChatTokens(theme);
  const { width, height } = useWindowDimensions();
  const isMessageMenu = quickReactions.length > 0;

  if (!isMessageMenu) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable className="flex-1 bg-black/55 justify-end" onPress={onClose}>
          <Pressable
            className="border-t rounded-t-2xl px-4 py-4 gap-2"
            style={{ backgroundColor: tk.surfaceSheet, borderTopColor: tk.borderSheet }}
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text variant="caption" style={{ color: tk.text.secondary }}>
                {title ?? 'Acoes'}
              </Text>
              <Pressable accessibilityRole="button" hitSlop={8} onPress={onClose}>
                <X size={16} color={tk.closeIcon} />
              </Pressable>
            </View>

            {actions.map((action) => {
              const Icon = iconMap[action.icon];
              const iconColor = getActionIconColor(action.icon, tk.brand.gold.primary, tk.brand.red.primary, tk.icon.primary);

              return (
                <Pressable
                  key={action.key}
                  className="rounded-xl border px-3 py-3 flex-row items-center gap-3"
                  style={{ borderColor: tk.borderSheet }}
                  onPress={() => {
                    action.onPress();
                    onClose();
                  }}
                >
                  <Icon size={17} color={iconColor} />
                  <Text variant="caption" style={{ color: tk.text.primary }} className="font-semibold">
                    {action.label}
                  </Text>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  const menuWidth = 238;
  const left = Math.min(
    Math.max((anchor?.x ?? width - 28) - menuWidth + 10, 12),
    Math.max(12, width - menuWidth - 12),
  );
  const top = Math.min(
    Math.max((anchor?.y ?? height * 0.42) - 54, 18),
    Math.max(18, height - 396),
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/20" onPress={onClose}>
        <Pressable style={{ position: 'absolute', left, top, width: menuWidth }}>
          <View
            className="mb-2 rounded-full px-2 py-1.5 flex-row items-center justify-between"
            style={{
              backgroundColor: '#202124',
              shadowColor: '#000',
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            {quickReactions.map((emoji) => (
              <Pressable
                key={emoji}
                accessibilityRole="button"
                onPress={() => {
                  onQuickReaction?.(emoji);
                  onClose();
                }}
                className="h-8 w-8 items-center justify-center"
              >
                <Twemoji emoji={emoji} size={26} />
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onMoreReactions?.();
              }}
              className="h-8 w-8 items-center justify-center"
            >
              <Text variant="heading" style={{ color: '#FFFFFF' }}>+</Text>
            </Pressable>
          </View>

          <View
            className="rounded-[10px] py-2 overflow-hidden"
            style={{
              backgroundColor: '#1F1F1F',
              shadowColor: '#000',
              shadowOpacity: 0.32,
              shadowRadius: 12,
              elevation: 12,
            }}
          >
            {actions.map((action, index) => {
              const Icon = iconMap[action.icon];
              const iconColor = getActionIconColor(action.icon, tk.brand.gold.primary, '#F87171', '#E5E7EB');

              return (
                <Pressable
                  key={action.key}
                  className="px-4 py-3 flex-row items-center gap-4"
                  style={{
                    borderTopWidth: action.key === 'delete' && index > 0 ? 1 : 0,
                    borderTopColor: 'rgba(255,255,255,0.10)',
                  }}
                  onPress={() => {
                    action.onPress();
                    onClose();
                  }}
                >
                  <Icon size={18} color={iconColor} />
                  <Text variant="caption" style={{ color: '#F3F4F6' }} className="font-semibold">
                    {action.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
