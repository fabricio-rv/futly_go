import { Modal, Pressable, View } from 'react-native';
import { useState } from 'react';
import { Crown, Search, UserMinus, UserPlus } from 'lucide-react-native';

import { Input, Text } from '@/src/components/ui';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { getChatTokens } from '@/src/lib/chatTokens';
import type { ChatProfileSearchResult } from '@/src/features/chat/services/chatService';

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
  canManage?: boolean;
  currentUserId?: string | null;
  onPromoteToAdmin?: (userId: string) => Promise<void> | void;
  onDemoteFromAdmin?: (userId: string) => Promise<void> | void;
  onRemoveParticipant?: (userId: string) => Promise<void> | void;
  onSearchProfiles?: (query: string) => Promise<ChatProfileSearchResult[]>;
  onAddParticipant?: (userId: string) => Promise<void> | void;
  onClose: () => void;
};

export function ParticipantsSheet({
  visible,
  participants,
  title,
  roleLabel,
  canManage = false,
  currentUserId = null,
  onPromoteToAdmin,
  onDemoteFromAdmin,
  onRemoveParticipant,
  onSearchProfiles,
  onAddParticipant,
  onClose,
}: ParticipantsSheetProps) {
  const theme = useAppColorScheme();
  const tk = getChatTokens(theme);
  const [query, setQuery] = useState('');
  const [searchRows, setSearchRows] = useState<ChatProfileSearchResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (!canManage || !onSearchProfiles) return;
    const q = value.trim();
    if (q.length < 2) {
      setSearchRows([]);
      return;
    }
    setLoadingSearch(true);
    try {
      const rows = await onSearchProfiles(q);
      setSearchRows(rows);
    } finally {
      setLoadingSearch(false);
    }
  };

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
          {canManage ? (
            <View className="mb-3">
              <Input
                value={query}
                onChangeText={(v) => void handleSearch(v)}
                onClear={() => {
                  setQuery('');
                  setSearchRows([]);
                }}
                showClearButton
                placeholder="Adicionar participante..."
                size="sm"
                containerClassName="border-line2 bg-[#0C111E]"
                inputClassName="text-fg1"
                leftIcon={<Search size={14} color="rgba(255,255,255,0.45)" strokeWidth={2} />}
              />
              {loadingSearch ? (
                <Text variant="micro" className="mt-2" style={{ color: tk.text.tertiary }}>Buscando...</Text>
              ) : null}
              <View className="gap-2 mt-2">
                {searchRows.map((row) => (
                  <Pressable
                    key={row.id}
                    onPress={() => void onAddParticipant?.(row.id)}
                    className="rounded-xl border px-3 py-2 flex-row items-center justify-between"
                    style={{ borderColor: tk.borderSheet }}
                  >
                    <Text variant="caption" style={{ color: tk.text.primary }} className="font-semibold">{row.full_name}</Text>
                    <UserPlus size={14} color={tk.icon.primary} />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
          <View className="gap-2">
            {participants.map((participant) => (
              <View
                key={participant.user_id}
                className="rounded-xl border px-3 py-2"
                style={{ borderColor: tk.borderSheet }}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text variant="caption" style={{ color: tk.text.primary }} className="font-semibold">
                      {participant.full_name}
                    </Text>
                    <Text variant="micro" style={{ color: tk.text.tertiary }}>
                      {roleLabel(participant.role)}
                    </Text>
                  </View>
                  {canManage && participant.user_id !== currentUserId ? (
                    <View className="flex-row items-center gap-3">
                      {participant.role === 'host' ? (
                        <Pressable onPress={() => void onDemoteFromAdmin?.(participant.user_id)} hitSlop={8}>
                          <UserMinus size={15} color={tk.icon.primary} />
                        </Pressable>
                      ) : (
                        <Pressable onPress={() => void onPromoteToAdmin?.(participant.user_id)} hitSlop={8}>
                          <Crown size={15} color={tk.brand.gold.primary} />
                        </Pressable>
                      )}
                      <Pressable onPress={() => void onRemoveParticipant?.(participant.user_id)} hitSlop={8}>
                        <UserMinus size={15} color={tk.brand.red?.primary ?? '#FF6B6B'} />
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
