import { Modal, Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { getChatTokens } from '@/src/lib/chatTokens';

type Participant = {
  user_id: string;
  full_name: string;
  role: 'host' | 'player' | 'system';
};

type ParticipantsSheetProps = {
  visible: boolean;
  participants: Participant[];
  title: string;
  roleLabel: (role: Participant['role']) => string;
  onClose: () => void;
};

export function ParticipantsSheet({ visible, participants, title, roleLabel, onClose }: ParticipantsSheetProps) {
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
          <View className="gap-2">
            {participants.map((participant) => (
              <View
                key={participant.user_id}
                className="rounded-xl border px-3 py-2"
                style={{ borderColor: tk.borderSheet }}
              >
                <Text variant="caption" style={{ color: tk.text.primary }} className="font-semibold">
                  {participant.full_name}
                </Text>
                <Text variant="micro" style={{ color: tk.text.tertiary }}>
                  {roleLabel(participant.role)}
                </Text>
              </View>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
