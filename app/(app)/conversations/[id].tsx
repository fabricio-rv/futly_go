import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, MoreVertical, Plus, Send, Smile, Star } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChatBubble,
  ChatContextBanner,
} from '@/src/components/features/store';
import { IconButton, Text } from '@/src/components/ui';
import { useConversationThread } from '@/src/features/chat/hooks/useConversationThread';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

const QUICK_ATTACH_MESSAGES = [
  'Compartilhando localizacao agora.',
  'Pix enviado no card da partida. Confirmem por favor.',
  'Confirmei presenca aqui no chat.',
];

const QUICK_EMOJIS = [':)', ':D', '<3', 'OK', 'GG', 'TMJ', 'GO', 'VAMO'];

function roleLabel(role: 'host' | 'player' | 'system') {
  if (role === 'host') return 'Host';
  if (role === 'player') return 'Jogador';
  return 'Sistema';
}

export default function ConversationDetailScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppColorScheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const conversationId = params.id ?? '';
  const [draft, setDraft] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [plusVisible, setPlusVisible] = useState(false);
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [participantsVisible, setParticipantsVisible] = useState(false);

  const {
    loading,
    error,
    header,
    messages,
    participants,
    canSend,
    send,
    markUnread,
    setArchived,
  } = useConversationThread(conversationId);

  const canSubmit = useMemo(() => canSend && draft.trim().length > 0, [canSend, draft]);

  const handleSend = useCallback(async () => {
    const message = draft.trim();
    if (!message) return;

    setDraft('');

    try {
      await send(message);
    } catch {
      setDraft(message);
      Alert.alert('Falha ao enviar', 'Nao foi possivel enviar a mensagem agora.');
    }
  }, [draft, send]);

  const handleBannerPress = useCallback(() => {
    if (!header?.matchId) {
      Alert.alert('Sem partida vinculada', 'Esta conversa nao possui partida vinculada.');
      return;
    }

    router.push(`/(app)/${header.matchId}`);
  }, [header?.matchId]);

  const handleArchiveToggle = useCallback(async () => {
    try {
      await setArchived(!(header?.isArchived ?? false));
      setMenuVisible(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nao foi possivel atualizar o status da conversa.';
      Alert.alert('Falha ao arquivar', message);
    }
  }, [header?.isArchived, setArchived]);

  const handleMarkUnread = useCallback(async () => {
    try {
      await markUnread();
      setMenuVisible(false);
      Alert.alert('Conversa atualizada', 'Marcamos esta conversa como nao lida.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nao foi possivel marcar como nao lida.';
      Alert.alert('Falha ao atualizar', message);
    }
  }, [markUnread]);

  const handleQuickAttach = useCallback(async (text: string) => {
    try {
      await send(text);
      setPlusVisible(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nao foi possivel compartilhar o item.';
      Alert.alert('Falha', message);
    }
  }, [send]);

  const handleEmojiPick = useCallback((emoji: string) => {
    setDraft((previous) => `${previous}${emoji}`);
    setEmojiVisible(false);
  }, []);

  const panelBg = theme === 'light' ? '#FFFFFF' : '#0E1322';
  const panelBorder = theme === 'light' ? '#D6DFEB' : 'rgba(255,255,255,0.06)';
  const bgColor = theme === 'light' ? '#F4F6F9' : '#05070B';
  const topBg = theme === 'light' ? 'rgba(243,246,251,0.95)' : 'rgba(5,7,11,0.95)';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <View className="border-b" style={{ backgroundColor: topBg, borderBottomColor: theme === 'light' ? '#DCE6F2' : 'rgba(255,255,255,0.06)' }}>
        <View className="px-3 pb-2 pt-1 flex-row items-center gap-2">
          <IconButton
            icon={<ChevronLeft size={18} color={theme === 'light' ? '#1F2937' : '#FFFFFF'} />}
            onPress={() => {
              if (typeof router.canGoBack === 'function' && router.canGoBack()) {
                router.back();
                return;
              }

              router.replace('/(app)/conversations');
            }}
          />

          <View className="flex-1 flex-row items-center gap-2">
            <LinearGradient
              colors={['#0F3A24', '#072314']}
              className="h-9 w-9 rounded-full border border-ok items-center justify-center"
            >
              <Text variant="label" className="font-bold text-white dark:text-white">
                {header?.avatar ?? 'CH'}
              </Text>
            </LinearGradient>

            <View className="flex-1">
              <View className="flex-row items-center gap-1">
                <Text variant="label" className="font-semibold text-[#111827] dark:text-white" numberOfLines={1}>
                  {header?.title ?? 'Conversa'}
                </Text>
                <Star size={11} color="#D4A13A" fill="#D4A13A" strokeWidth={1.6} />
              </View>
              <Text variant="micro" className="text-[#1A8F57] dark:text-[#86E5B4] mt-[1px]" numberOfLines={1}>
                {header?.subtitle ?? 'Carregando...'}
              </Text>
            </View>
          </View>

          <IconButton icon={<MoreVertical size={16} color={theme === 'light' ? '#1F2937' : '#FFFFFF'} />} onPress={() => setMenuVisible(true)} />
        </View>
      </View>

      <ChatContextBanner
        title={header?.bannerTitle ?? 'Partida marcada'}
        subtitle={header?.bannerSubtitle ?? 'Aguarde enquanto carregamos os detalhes'}
        onPress={handleBannerPress}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 112 + insets.bottom }}
      >
        <View
          className="self-center rounded-full px-3 py-1 mb-3 mt-1"
          style={{ backgroundColor: theme === 'light' ? '#E9EFF8' : 'rgba(255,255,255,0.05)' }}
        >
          <Text variant="micro" className="uppercase tracking-[1.6px] text-[#6B7280] dark:text-fg3 font-bold">
            Hoje
          </Text>
        </View>

        {error ? (
          <View className="self-center rounded-full border border-[#FF9A9A66] bg-[#FF9A9A22] px-3 py-1.5 mb-2">
            <Text variant="micro" className="text-[#D66658] dark:text-[#FFB5B5] font-semibold">
              {error}
            </Text>
          </View>
        ) : null}

        {loading && messages.length === 0 ? (
          <View
            className="self-center rounded-full px-3 py-1.5 mb-2"
            style={{ backgroundColor: theme === 'light' ? '#E9EFF8' : 'rgba(255,255,255,0.05)' }}
          >
            <Text variant="micro" className="text-[#6B7280] dark:text-fg3 font-semibold">
              Carregando mensagens...
            </Text>
          </View>
        ) : null}

        <View className="gap-1">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </View>
      </ScrollView>

      <View
        className="absolute left-0 right-0 bottom-0 border-t px-[14px] pt-3 flex-row items-end gap-2"
        style={{
          paddingBottom: Math.max(insets.bottom, 14),
          borderTopColor: theme === 'light' ? '#DCE6F2' : 'rgba(255,255,255,0.06)',
          backgroundColor: theme === 'light' ? 'rgba(245,248,252,0.96)' : 'rgba(10,14,24,0.95)',
        }}
      >
        <IconButton
          icon={<Plus size={18} color={theme === 'light' ? '#1A8F57' : '#86E5B4'} strokeWidth={2.3} />}
          size={36}
          className="rounded-full"
          style={{
            borderColor: theme === 'light' ? '#86DDB3' : undefined,
            backgroundColor: theme === 'light' ? 'rgba(34,183,108,0.16)' : undefined,
          }}
          onPress={() => setPlusVisible(true)}
        />

        <View
          className="flex-1 min-h-11 rounded-full border px-[14px] py-[8px] flex-row items-center gap-2"
          style={{
            borderColor: theme === 'light' ? '#D1DCEB' : 'rgba(255,255,255,0.10)',
            backgroundColor: theme === 'light' ? '#EAF0F8' : '#0C111E',
          }}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Mensagem..."
            placeholderTextColor={theme === 'light' ? '#7A8597' : 'rgba(255,255,255,0.45)'}
            className="flex-1"
            style={{ color: theme === 'light' ? '#1F2937' : '#FFFFFF' }}
            multiline
            maxLength={1000}
          />
          <Pressable onPress={() => setEmojiVisible(true)} hitSlop={8}>
            <Smile size={16} color={theme === 'light' ? '#7A8597' : 'rgba(255,255,255,0.45)'} strokeWidth={2} />
          </Pressable>
        </View>

        <IconButton
          icon={<Send size={18} color="#05070B" strokeWidth={2.4} />}
          size={44}
          className="rounded-full"
          style={
            canSubmit
              ? { backgroundColor: '#22B76C', borderColor: '#22B76C' }
              : {
                  backgroundColor: theme === 'light' ? '#B7C7BF' : '#4B5B55',
                  borderColor: theme === 'light' ? '#A6B6AE' : '#4B5B55',
                }
          }
          onPress={handleSend}
        />
      </View>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable className="flex-1 bg-black/55 justify-end" onPress={() => setMenuVisible(false)}>
          <Pressable className="border-t rounded-t-2xl px-4 py-4 gap-2" style={{ backgroundColor: panelBg, borderTopColor: panelBorder }}>
            <Pressable className="rounded-xl border px-3 py-3" style={{ borderColor: panelBorder }} onPress={handleMarkUnread}>
              <Text variant="caption" className="text-[#111827] dark:text-white font-semibold">Marcar como nao lida</Text>
            </Pressable>
            <Pressable className="rounded-xl border px-3 py-3" style={{ borderColor: panelBorder }} onPress={() => { setParticipantsVisible(true); setMenuVisible(false); }}>
              <Text variant="caption" className="text-[#111827] dark:text-white font-semibold">Ver participantes</Text>
            </Pressable>
            <Pressable className="rounded-xl border px-3 py-3" style={{ borderColor: panelBorder }} onPress={handleArchiveToggle}>
              <Text variant="caption" className="text-[#111827] dark:text-white font-semibold">{header?.isArchived ? 'Desarquivar conversa' : 'Arquivar conversa'}</Text>
            </Pressable>
            <Pressable className="rounded-xl border px-3 py-3" style={{ borderColor: panelBorder }} onPress={() => { setMenuVisible(false); handleBannerPress(); }}>
              <Text variant="caption" className="text-[#111827] dark:text-white font-semibold">Abrir detalhes da partida</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={plusVisible} transparent animationType="fade" onRequestClose={() => setPlusVisible(false)}>
        <Pressable className="flex-1 bg-black/55 justify-end" onPress={() => setPlusVisible(false)}>
          <Pressable className="border-t rounded-t-2xl px-4 py-4 gap-2" style={{ backgroundColor: panelBg, borderTopColor: panelBorder }}>
            <Text variant="caption" className="text-[#4B5563] dark:text-fg2 mb-1">Acoes rapidas</Text>
            {QUICK_ATTACH_MESSAGES.map((item) => (
              <Pressable key={item} className="rounded-xl border px-3 py-3" style={{ borderColor: panelBorder }} onPress={() => void handleQuickAttach(item)}>
                <Text variant="caption" className="text-[#111827] dark:text-white font-semibold">{item}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={emojiVisible} transparent animationType="fade" onRequestClose={() => setEmojiVisible(false)}>
        <Pressable className="flex-1 bg-black/55 justify-end" onPress={() => setEmojiVisible(false)}>
          <Pressable className="border-t rounded-t-2xl px-4 py-4" style={{ backgroundColor: panelBg, borderTopColor: panelBorder }}>
            <Text variant="caption" className="text-[#4B5563] dark:text-fg2 mb-2">Escolha um emoji</Text>
            <View className="flex-row flex-wrap gap-2">
              {QUICK_EMOJIS.map((emoji) => (
                <Pressable key={emoji} className="h-11 w-11 rounded-xl border items-center justify-center" style={{ borderColor: panelBorder }} onPress={() => handleEmojiPick(emoji)}>
                  <Text variant="bodyLg">{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={participantsVisible} transparent animationType="fade" onRequestClose={() => setParticipantsVisible(false)}>
        <Pressable className="flex-1 bg-black/55 justify-end" onPress={() => setParticipantsVisible(false)}>
          <Pressable className="border-t rounded-t-2xl px-4 py-4" style={{ backgroundColor: panelBg, borderTopColor: panelBorder }}>
            <Text variant="caption" className="text-[#4B5563] dark:text-fg2 mb-2">Participantes</Text>
            <View className="gap-2">
              {participants.map((participant) => (
                <View key={participant.user_id} className="rounded-xl border px-3 py-2" style={{ borderColor: panelBorder }}>
                  <Text variant="caption" className="text-[#111827] dark:text-white font-semibold">{participant.full_name}</Text>
                  <Text variant="micro" className="text-[#6B7280] dark:text-fg3">{roleLabel(participant.role)}</Text>
                </View>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
