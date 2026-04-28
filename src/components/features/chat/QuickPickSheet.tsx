import { Modal, Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { getChatTokens } from '@/src/lib/chatTokens';

type QuickPickSheetProps = {
  visible: boolean;
  title: string;
  items: string[];
  grid?: boolean;
  onPick: (item: string) => void;
  onClose: () => void;
};

export function QuickPickSheet({ visible, title, items, grid = false, onPick, onClose }: QuickPickSheetProps) {
  const theme = useAppColorScheme();
  const tk = getChatTokens(theme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/55 justify-end" onPress={onClose}>
        <Pressable
          className="border-t rounded-t-2xl px-4 py-4"
          style={{ backgroundColor: tk.surfaceSheet, borderTopColor: tk.borderSheet }}
        >
          <Text variant="caption" style={{ color: tk.text.secondary }} className="mb-2">
            {title}
          </Text>

          <View className={grid ? 'flex-row flex-wrap gap-2' : 'gap-2'}>
            {items.map((item) => (
              <Pressable
                key={item}
                className={grid ? 'h-11 w-11 rounded-xl border items-center justify-center' : 'rounded-xl border px-3 py-3'}
                style={{ borderColor: tk.borderSheet }}
                onPress={() => {
                  onPick(item);
                  onClose();
                }}
              >
                <Text
                  variant={grid ? 'bodyLg' : 'caption'}
                  style={{ color: tk.text.primary }}
                  className="font-semibold"
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
