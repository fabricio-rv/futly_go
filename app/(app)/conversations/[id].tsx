import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import EmojiKeyboard from 'rn-emoji-keyboard';
import type { EmojiType } from 'rn-emoji-keyboard';

import { ChatContextBanner } from '@/src/components/features/store';
import {
  ChatActionSheet,
  ComposerBar,
  ConversationHeader,
  MessageBubble,
  ParticipantsSheet,
  TypingIndicator,
} from '@/src/components/features/chat';
import { Text } from '@/src/components/ui';
import { useConversationThread } from '@/src/features/chat/hooks/useConversationThread';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import type { ChatMessage } from '@/src/components/features/store/data';

type MessageAction = {
  key: string;
  label: string;
  icon: 'reply' | 'pin' | 'save' | 'reaction' | 'delete';
  onPress: () => void;
};

export default function ConversationDetailScreen() {
  const { t } = useTranslation('chat');
  const insets = useSafeAreaInsets();
  const theme = useAppColorScheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const conversationId = params.id ?? '';

  const [draft, setDraft] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [attachVisible, setAttachVisible] = useState(false);
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [participantsVisible, setParticipantsVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [sending, setSending] = useState(false);

  // ── Voice recording state ──────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    loading,
    error,
    header,
    messages,
    participants,
    reactions,
    pinnedMessageIds,
    savedMessageIds,
    typingUserIds,
    onlineUserIds,
    canSend,
    send,
    markUnread,
    setArchived,
    toggleReaction,
    togglePin,
    toggleSave,
    deleteMessage,
    notifyComposerChanged,
    updateTypingState,
  } = useConversationThread(conversationId);

  const participantNameById = useMemo(() => {
    return new Map(participants.map((p) => [p.user_id, p.full_name]));
  }, [participants]);

  const typingNames = useMemo(() => {
    return typingUserIds.map((id) => participantNameById.get(id) ?? t('detail.athleteFallback', 'Atleta'));
  }, [participantNameById, t, typingUserIds]);

  const onlineCount = onlineUserIds.length;
  const isTyping = typingNames.length > 0;

  const headerSubtitle = useMemo(() => {
    if (!header) return t('common.loading', 'Carregando...');
    if (isTyping) return t('messages.typing', 'Digitando...');
    if (onlineCount > 0) return `${header.subtitle} - ${onlineCount} online`;
    return header.subtitle;
  }, [header, isTyping, onlineCount, t]);

  const roleLabel = useCallback((role: 'host' | 'player' | 'system') => {
    if (role === 'host') return t('roles.host', 'Host');
    if (role === 'player') return t('roles.player', 'Jogador');
    return t('roles.system', 'Sistema');
  }, [t]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (typeof router.canGoBack === 'function' && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(app)/conversations');
  }, []);

  // ── Text message ───────────────────────────────────────────────────────────
  const handleDraftChange = useCallback((value: string) => {
    setDraft(value);
    notifyComposerChanged(value);
  }, [notifyComposerChanged]);

  const handleSend = useCallback(async () => {
    const message = draft.trim();
    if (!message || sending || !canSend) return;

    const text = replyTo?.text ? `> ${replyTo.text}\n${message}` : message;
    setDraft('');
    setReplyTo(null);
    setSending(true);

    try {
      await send(text);
    } catch {
      setDraft(message);
      Alert.alert(
        t('errors.sendFailedTitle', 'Falha ao enviar'),
        t('errors.sendFailedMessage', 'Nao foi possivel enviar a mensagem agora.'),
      );
    } finally {
      setSending(false);
    }
  }, [canSend, draft, replyTo, send, sending, t]);

  // ── Image / video picker (gallery) ─────────────────────────────────────────
  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para enviar fotos e vídeos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 0.85,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      // TODO: upload asset.uri to Supabase Storage, then send message with attachment URL
      Alert.alert(
        'Arquivo selecionado',
        `${asset.fileName ?? (asset.type === 'video' ? 'video.mp4' : 'imagem.jpg')}\n\nUpload para o servidor em desenvolvimento.`,
      );
    }
  }, []);

  // ── Camera (take photo / video) ────────────────────────────────────────────
  const handleOpenCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.85,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      // TODO: upload to Supabase Storage and send
      Alert.alert('Capturado', `${asset.type === 'video' ? 'Vídeo' : 'Foto'} capturado.\n\nUpload em desenvolvimento.`);
    }
  }, []);

  // ── Document / file picker ─────────────────────────────────────────────────
  const handlePickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        const sizeKb = file.size ? (file.size / 1024).toFixed(1) : '?';
        // TODO: upload file.uri to Supabase Storage, send message with download link
        Alert.alert(
          'Arquivo selecionado',
          `📄 ${file.name}\n${sizeKb} KB — ${file.mimeType ?? 'arquivo'}\n\nUpload em desenvolvimento.`,
        );
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  }, []);

  // ── Voice recording ────────────────────────────────────────────────────────
  const handleStartRecording = useCallback(async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso ao microfone para gravar áudios.');
      return;
    }

    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  }, []);

  const handleStopRecording = useCallback(async (cancelled: boolean) => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    setRecordingDuration(0);

    const recording = recordingRef.current;
    recordingRef.current = null;
    if (!recording) return;

    try {
      const status = await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (cancelled) return;

      const durationSec = Math.round((status.durationMillis ?? 0) / 1000);
      // TODO: upload recording URI to Supabase Storage, send audio message with playback
      await send(`🎵 Áudio ${durationSec}s — envio de áudio em desenvolvimento`);
    } catch {
      Alert.alert('Erro', 'Não foi possível processar o áudio gravado.');
    }
  }, [send]);

  // ── Conversation actions ───────────────────────────────────────────────────
  const handleBannerPress = useCallback(() => {
    if (!header?.matchId) {
      Alert.alert(
        t('errors.noMatchLinkedTitle', 'Sem partida vinculada'),
        t('errors.noMatchLinkedMessage', 'Esta conversa nao possui partida vinculada.'),
      );
      return;
    }
    router.push(`/(app)/${header.matchId}`);
  }, [header?.matchId, t]);

  const handleArchiveToggle = useCallback(async () => {
    try {
      await setArchived(!(header?.isArchived ?? false));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nao foi possivel atualizar o status da conversa.';
      Alert.alert(t('errors.archiveFailedTitle', 'Falha ao arquivar'), message);
    }
  }, [header?.isArchived, setArchived, t]);

  const handleMarkUnread = useCallback(async () => {
    try {
      await markUnread();
      Alert.alert(
        t('status.updatedTitle', 'Conversa atualizada'),
        t('status.markedUnreadMessage', 'Marcamos esta conversa como nao lida.'),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.markUnreadFailedMessage', 'Nao foi possivel marcar como nao lida.');
      Alert.alert(t('errors.updateFailedTitle', 'Falha ao atualizar'), message);
    }
  }, [markUnread, t]);

  // ── Action sheets ──────────────────────────────────────────────────────────
  const menuActions = useMemo(() => [
    { key: 'unread', label: t('actions.markUnread', 'Marcar como nao lida'), icon: 'unread' as const, onPress: handleMarkUnread },
    { key: 'participants', label: t('actions.viewParticipants', 'Ver participantes'), icon: 'users' as const, onPress: () => setParticipantsVisible(true) },
    {
      key: 'archive',
      label: header?.isArchived
        ? t('actions.unarchiveConversation', 'Restaurar conversa')
        : t('actions.archiveConversation', 'Arquivar conversa'),
      icon: 'archive' as const,
      onPress: handleArchiveToggle,
    },
    { key: 'match', label: t('actions.openMatchDetails', 'Abrir detalhes da partida'), icon: 'pin' as const, onPress: handleBannerPress },
  ], [handleArchiveToggle, handleBannerPress, handleMarkUnread, header?.isArchived, t]);

  const attachmentActions = useMemo(() => [
    { key: 'gallery', label: 'Galeria de Fotos e Vídeos', icon: 'image' as const, onPress: handlePickImage },
    { key: 'camera', label: 'Câmera', icon: 'camera' as const, onPress: handleOpenCamera },
    { key: 'document', label: 'Documento / Arquivo', icon: 'document' as const, onPress: handlePickDocument },
  ], [handleOpenCamera, handlePickDocument, handlePickImage]);

  const selectedMessageActions = useMemo(() => {
    if (!selectedMessage) return [];

    const actions: MessageAction[] = [
      { key: 'reply', label: 'Responder', icon: 'reply', onPress: () => setReplyTo(selectedMessage) },
      { key: 'react-ok', label: 'Reagir com OK', icon: 'reaction', onPress: () => void toggleReaction(selectedMessage.id, 'OK') },
      {
        key: 'pin',
        label: pinnedMessageIds.includes(selectedMessage.id) ? 'Desfixar mensagem' : 'Fixar mensagem',
        icon: 'pin',
        onPress: () => void togglePin(selectedMessage.id),
      },
      {
        key: 'save',
        label: savedMessageIds.includes(selectedMessage.id) ? 'Remover dos salvos' : 'Salvar mensagem',
        icon: 'save',
        onPress: () => void toggleSave(selectedMessage.id),
      },
    ];

    if (selectedMessage.kind === 'me') {
      actions.push({ key: 'delete', label: 'Apagar mensagem', icon: 'delete', onPress: () => void deleteMessage(selectedMessage.id) });
    }

    return actions;
  }, [deleteMessage, pinnedMessageIds, savedMessageIds, selectedMessage, togglePin, toggleReaction, toggleSave]);

  const bgColor = theme === 'light' ? '#F4F6F9' : '#05070B';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ConversationHeader
        title={header?.title ?? t('detail.title', 'Conversa')}
        subtitle={headerSubtitle}
        avatar={header?.avatar ?? 'CH'}
        isOnline={onlineCount > 0}
        isTyping={isTyping}
        onBack={handleBack}
        onOpenMenu={() => setMenuVisible(true)}
      />

      <ChatContextBanner
        title={header?.bannerTitle ?? t('detail.matchBannerTitle', 'Partida marcada')}
        subtitle={header?.bannerSubtitle ?? t('detail.matchBannerSubtitle', 'Aguarde enquanto carregamos os detalhes')}
        onPress={handleBannerPress}
      />

      <FlashList
        data={messages}
        keyExtractor={(item) => item.id}
        bounces
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 138 + insets.bottom }}
        ListHeaderComponent={(
          <>
            <View
              className="self-center rounded-full px-3 py-1 mb-3 mt-1"
              style={{ backgroundColor: theme === 'light' ? '#E9EFF8' : 'rgba(255,255,255,0.05)' }}
            >
              <Text variant="micro" className="uppercase text-[#6B7280] dark:text-fg3 font-bold">
                {t('common.today', 'Hoje')}
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
                  {t('detail.loadingMessages', 'Carregando mensagens...')}
                </Text>
              </View>
            ) : null}
          </>
        )}
        ListFooterComponent={<TypingIndicator names={typingNames} />}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            showSenderName
            isPinned={pinnedMessageIds.includes(item.id)}
            isSaved={savedMessageIds.includes(item.id)}
            reactions={reactions[item.id]}
            onLongPress={(message) => setSelectedMessage(message)}
            onReactionPress={(emoji) => void toggleReaction(item.id, emoji)}
          />
        )}
      />

      <ComposerBar
        text={draft}
        placeholder={t('detail.messagePlaceholder', 'Mensagem...')}
        replyTo={replyTo?.text ?? null}
        replySender={replyTo?.author ?? null}
        replyLabel={t('detail.replyingTo', 'Respondendo a')}
        isSending={sending}
        isRecording={isRecording}
        recordingDuration={recordingDuration}
        bottomInset={insets.bottom}
        onChangeText={handleDraftChange}
        onSend={handleSend}
        onAddAttachment={() => setAttachVisible(true)}
        onPickImage={handlePickImage}
        onOpenEmoji={() => setEmojiVisible(true)}
        onCancelReply={() => setReplyTo(null)}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onFocus={() => updateTypingState(draft.trim().length > 0)}
        onBlur={() => updateTypingState(false)}
      />

      {/* ── Emoji keyboard ── */}
      <EmojiKeyboard
        onEmojiSelected={(emoji: EmojiType) => setDraft((prev) => prev + emoji.emoji)}
        open={emojiVisible}
        onClose={() => setEmojiVisible(false)}
        defaultHeight={420}
        expandable={false}
        hideHeader={false}
        enableSearchBar
        enableCategoryChangeAnimation
      />

      {/* ── Conversation menu ── */}
      <ChatActionSheet
        visible={menuVisible}
        title="Conversa"
        actions={menuActions}
        onClose={() => setMenuVisible(false)}
      />

      {/* ── Message long-press actions ── */}
      <ChatActionSheet
        visible={!!selectedMessage}
        title="Mensagem"
        actions={selectedMessageActions}
        onClose={() => setSelectedMessage(null)}
      />

      {/* ── Attachment picker ── */}
      <ChatActionSheet
        visible={attachVisible}
        title="Anexar"
        actions={attachmentActions}
        onClose={() => setAttachVisible(false)}
      />

      {/* ── Participants sheet ── */}
      <ParticipantsSheet
        visible={participantsVisible}
        title={t('detail.participants', 'Participantes')}
        participants={participants}
        roleLabel={roleLabel}
        onClose={() => setParticipantsVisible(false)}
      />
    </SafeAreaView>
  );
}
