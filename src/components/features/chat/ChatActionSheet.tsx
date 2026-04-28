import { Archive, Camera, CornerUpLeft, EyeOff, FileText, Image, Mic, Pin, Smile, Star, Trash2, Users, X } from 'lucide-react-native';
import { Modal, Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { getChatTokens } from '@/src/lib/chatTokens';

type ActionItem = {
  key: string;
  label: string;
  icon: 'reply' | 'pin' | 'save' | 'unread' | 'users' | 'archive' | 'reaction' | 'delete' | 'image' | 'camera' | 'document' | 'mic';
  onPress: () => void;
};

type ChatActionSheetProps = {
  visible: boolean;
  title?: string;
  actions: ActionItem[];
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

export function ChatActionSheet({ visible, title, actions, onClose }: ChatActionSheetProps) {
  const theme = useAppColorScheme();
  const tk = getChatTokens(theme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/55 justify-end" onPress={onClose}>
        <Pressable
          className="border-t rounded-t-2xl px-4 py-4 gap-2"
          style={{ backgroundColor: tk.surfaceSheet, borderTopColor: tk.borderSheet }}
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text variant="caption" style={{ color: tk.text.secondary }}>
              {title ?? 'Ações'}
            </Text>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={onClose}>
              <X size={16} color={tk.closeIcon} />
            </Pressable>
          </View>

          {actions.map((action) => {
            const Icon = iconMap[action.icon];
            const iconColor = getActionIconColor(
              action.icon,
              tk.brand.gold.primary,
              tk.brand.red.primary,
              tk.icon.primary,
            );

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
