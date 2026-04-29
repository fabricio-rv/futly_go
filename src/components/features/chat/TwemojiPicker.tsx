import { useMemo, useState } from 'react';
import { FlatList, Modal, Platform, Pressable, useWindowDimensions, View } from 'react-native';
import { X } from 'lucide-react-native';

import { Text } from '@/src/components/ui';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { getChatTokens } from '@/src/lib/chatTokens';
import { TWEMOJI_CATEGORIES } from '@/src/lib/emoji/twemoji';
import { Twemoji } from '@/src/components/ui/emoji';

type TwemojiPickerProps = {
  visible: boolean;
  title?: string;
  anchor?: { x: number; y: number };
  compact?: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
};

const CATEGORY_ICONS: Record<string, string> = {
  people: '😀',
  nature: '🐶',
  foods: '🍔',
  activity: '⚽',
  places: '🚗',
  objects: '💡',
  symbols: '#️⃣',
  flags: '🏁',
};

export function TwemojiPicker({
  visible,
  title = 'Escolha um emoji',
  anchor,
  compact = false,
  onSelect,
  onClose,
}: TwemojiPickerProps) {
  const theme = useAppColorScheme();
  const tk = getChatTokens(theme);
  const { width, height } = useWindowDimensions();
  const [categoryId, setCategoryId] = useState(TWEMOJI_CATEGORIES[0]?.id ?? 'people');
  const category = useMemo(
    () => TWEMOJI_CATEGORIES.find((item) => item.id === categoryId) ?? TWEMOJI_CATEGORIES[0],
    [categoryId],
  );
  const emojis = category?.emojis ?? [];
  const isWeb = Platform.OS === 'web';
  const isPopover = compact || Boolean(anchor);
  const panelWidth = isPopover ? Math.min(width - 24, isWeb ? 420 : 340) : (isWeb ? Math.min(width - 32, 520) : width);
  const panelHeight = isPopover
    ? Math.min(height * 0.48, isWeb ? 360 : 320)
    : Math.min(height * (isWeb ? 0.58 : 0.52), isWeb ? 440 : 390);
  const horizontalPadding = 12;
  const gridWidth = panelWidth - horizontalPadding * 2;
  const columnCount = Math.max(isPopover ? 6 : 7, Math.min(isPopover ? 8 : 9, Math.floor(gridWidth / (isPopover ? 44 : 46))));
  const itemSize = Math.floor(gridWidth / columnCount);
  const popoverLeft = Math.min(
    Math.max((anchor?.x ?? width / 2) + 14, 12),
    Math.max(12, width - panelWidth - 12),
  );
  const popoverTop = Math.min(
    Math.max((anchor?.y ?? height / 2) - 96, 12),
    Math.max(12, height - panelHeight - 12),
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1"
        style={{
          justifyContent: isPopover ? 'flex-start' : 'flex-end',
          alignItems: isPopover || isWeb ? 'center' : 'stretch',
          backgroundColor: isPopover ? 'rgba(0,0,0,0.10)' : (isWeb ? 'rgba(0,0,0,0.24)' : 'rgba(0,0,0,0.45)'),
          paddingBottom: !isPopover && isWeb ? 18 : 0,
        }}
        onPress={onClose}
      >
        <Pressable
          className="border px-3 pt-3 pb-2"
          style={{
            position: isPopover ? 'absolute' : 'relative',
            left: isPopover ? popoverLeft : undefined,
            top: isPopover ? popoverTop : undefined,
            width: panelWidth,
            height: panelHeight,
            borderRadius: 24,
            borderBottomLeftRadius: !isPopover && !isWeb ? 0 : 24,
            borderBottomRightRadius: !isPopover && !isWeb ? 0 : 24,
            backgroundColor: theme === 'light' ? '#FFFFFF' : '#111827',
            borderColor: theme === 'light' ? '#D7DFEA' : 'rgba(255,255,255,0.10)',
            shadowColor: '#000',
            shadowOpacity: 0.28,
            shadowRadius: 18,
            elevation: 16,
          }}
        >
          <View className="flex-row items-center justify-between px-1 mb-2">
            <Text variant="caption" style={{ color: tk.text.primary, fontSize: isPopover ? 13 : 15 }} className="font-bold">
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={onClose}
              className="h-8 w-8 rounded-full items-center justify-center"
              style={{ backgroundColor: theme === 'light' ? '#F1F5F9' : 'rgba(255,255,255,0.06)' }}
            >
              <X size={17} color={tk.closeIcon} />
            </Pressable>
          </View>

          <FlatList
            style={{ flex: 1 }}
            data={emojis}
            key={`${categoryId}-${columnCount}`}
            keyExtractor={(item, index) => `${item}-${index}`}
            numColumns={columnCount}
            initialNumToRender={96}
            maxToRenderPerBatch={128}
            windowSize={8}
            removeClippedSubviews
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 4, paddingBottom: 8 }}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                className="items-center justify-center rounded-xl"
                style={{ width: itemSize, height: isPopover ? 38 : 42 }}
              >
                <Twemoji emoji={item} size={isPopover ? 24 : 26} />
              </Pressable>
            )}
          />

          <View
            className="mt-1 rounded-2xl flex-row items-center justify-around px-1 py-1"
            style={{ backgroundColor: theme === 'light' ? '#F8FAFC' : 'rgba(255,255,255,0.045)' }}
          >
            {TWEMOJI_CATEGORIES.map((item) => {
              const active = item.id === categoryId;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  onPress={() => setCategoryId(item.id)}
                  className="flex-1 items-center justify-center rounded-xl"
                  style={{ height: isPopover ? 34 : 40, backgroundColor: active ? tk.brand.green.bg18 : 'transparent' }}
                >
                  <Twemoji emoji={CATEGORY_ICONS[item.id] ?? '😀'} size={isPopover ? 19 : 22} />
                  {active ? (
                    <View
                      className="absolute bottom-1 rounded-full"
                      style={{ width: 18, height: 2, backgroundColor: tk.brand.green.primary }}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
