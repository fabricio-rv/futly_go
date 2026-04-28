import * as DocumentPicker from 'expo-document-picker';
import { Audio, Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, View } from 'react-native';
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
import {
  addConversationParticipant,
  createChatFileAttachment,
  removeConversationParticipant,
  searchChatProfiles,
  updateConversationParticipantRole,
} from '@/src/features/chat/services/chatService';
import { formatLastSeenBrazil } from '@/src/features/chat/utils/formatters';
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
  const [attachVisible, setAttachVisible] = useState(false);
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [participantsVisible, setParticipantsVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [sending, setSending] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{
    uri: string;
    fileName: string;
    mimeType: string;
    kind: 'image' | 'video' | 'audio' | 'document';
    durationSec?: number;
  } | null>(null);
  const [openedAttachment, setOpenedAttachment] = useState<{
    kind: 'image' | 'video' | 'audio' | 'document';
    url: string;
    fileName?: string | null;
  } | null>(null);

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
    privatePartner,
    privatePartnerIsOnline,
    currentUserId,
    refresh,
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

  const participantNameById = useMemo(() => new Map(participants.map((p) => [p.user_id, p.full_name])), [participants]);
  const typingNames = useMemo(() => typingUserIds.map((id) => participantNameById.get(id) ?? t('detail.athleteFallback', 'Atleta')), [participantNameById, t, typingUserIds]);
  const onlineCount = onlineUserIds.length;
  const isTyping = typingNames.length > 0;
  const isPrivateConversation = Boolean(header?.privatePartnerId);

  const headerSubtitle = useMemo(() => {
    if (!header) return t('common.loading', 'Carregando...');
    if (isTyping) return t('messages.typing', 'Digitando...');
    if (isPrivateConversation) {
      if (privatePartnerIsOnline) return `${privatePartner?.full_name ?? t('detail.athleteFallback', 'Atleta')} - online`;
      const lastSeen = formatLastSeenBrazil(privatePartner?.last_seen_at ?? null);
      if (lastSeen) return `${privatePartner?.full_name ?? t('detail.athleteFallback', 'Atleta')} - offline • visto por último ${lastSeen}`;
      return `${privatePartner?.full_name ?? t('detail.athleteFallback', 'Atleta')} - offline`;
    }
    if (onlineCount > 0) return `${header.subtitle} - ${onlineCount} online`;
    return header.subtitle;
  }, [header, isPrivateConversation, isTyping, onlineCount, privatePartner?.full_name, privatePartner?.last_seen_at, privatePartnerIsOnline, t]);

  const roleLabel = useCallback((role: 'host' | 'player' | 'system') => {
    if (role === 'host') return t('roles.host', 'Host');
    if (role === 'player') return t('roles.player', 'Jogador');
    return t('roles.system', 'Sistema');
  }, [t]);
  const isGroupAdmin = useMemo(
    () => Boolean(currentUserId && participants.some((p) => p.user_id === currentUserId && p.role === 'host')),
    [currentUserId, participants],
  );

  const handleBack = useCallback(() => {
    if (typeof router.canGoBack === 'function' && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(app)/conversations');
  }, []);

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

  const handleSendAttachment = useCallback(async (input: {
    uri: string;
    fileName: string;
    mimeType: string;
    kind: 'image' | 'video' | 'audio' | 'document';
    durationSec?: number;
  }) => {
    if (!conversationId) return;

    setSending(true);
    try {
      const marker = input.kind === 'audio'
        ? `Audio ${input.durationSec ?? 0}s`
        : input.kind === 'image'
          ? 'Foto'
          : input.kind === 'video'
            ? 'Video'
            : 'Arquivo';
      const text = '\u200B';

      const messageId = await send(text, {
        optimisticText: '',
        optimisticAttachment: {
          id: `temp-attachment-${Date.now()}`,
          kind: input.kind,
          fileName: input.fileName,
          mimeType: input.mimeType,
          url: input.kind === 'image' ? input.uri : null,
        },
        metadata: {
          attachment_kind: input.kind,
          attachment_name: input.fileName,
          attachment_mime: input.mimeType,
          attachment_duration_sec: input.durationSec ?? null,
          attachment_label: marker,
        },
      });

      if (!messageId) throw new Error('Nao foi possivel criar a mensagem do anexo.');

      const response = await fetch(input.uri);
      const blob = await response.blob();
      await createChatFileAttachment({
        conversationId,
        messageId,
        fileName: input.fileName,
        mimeType: input.mimeType,
        bytes: blob,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao enviar anexo.';
      Alert.alert('Falha ao enviar', message);
    } finally {
      setSending(false);
    }
  }, [conversationId, send]);

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissao necessaria', 'Precisamos de acesso a sua galeria para enviar fotos e videos.');
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
      setPendingAttachment({
        uri: asset.uri,
        fileName: asset.fileName ?? (asset.type === 'video' ? `video-${Date.now()}.mp4` : `imagem-${Date.now()}.jpg`),
        mimeType: asset.mimeType ?? (asset.type === 'video' ? 'video/mp4' : 'image/jpeg'),
        kind: asset.type === 'video' ? 'video' : 'image',
      });
    }
  }, [handleSendAttachment]);

  const handleOpenCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissao necessaria', 'Precisamos de acesso a camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.85,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setPendingAttachment({
        uri: asset.uri,
        fileName: asset.fileName ?? (asset.type === 'video' ? `camera-video-${Date.now()}.mp4` : `camera-foto-${Date.now()}.jpg`),
        mimeType: asset.mimeType ?? (asset.type === 'video' ? 'video/mp4' : 'image/jpeg'),
        kind: asset.type === 'video' ? 'video' : 'image',
      });
    }
  }, [handleSendAttachment]);

  const handlePickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        setPendingAttachment({
          uri: file.uri,
          fileName: file.name ?? `arquivo-${Date.now()}`,
          mimeType: file.mimeType ?? 'application/octet-stream',
          kind: 'document',
        });
      }
    } catch {
      Alert.alert('Erro', 'Nao foi possivel selecionar o arquivo.');
    }
  }, [handleSendAttachment]);

  const handleStartRecording = useCallback(async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissao necessaria', 'Precisamos de acesso ao microfone para gravar audios.');
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
      recordingTimerRef.current = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
    } catch {
      Alert.alert('Erro', 'Nao foi possivel iniciar a gravacao.');
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

      const uri = recording.getURI();
      const durationSec = Math.round((status.durationMillis ?? 0) / 1000);
      if (!uri) throw new Error('Nao foi possivel ler o arquivo de audio.');

      await handleSendAttachment({
        uri,
        fileName: `audio-${Date.now()}.m4a`,
        mimeType: 'audio/m4a',
        kind: 'audio',
        durationSec,
      });
    } catch {
      Alert.alert('Erro', 'Nao foi possivel processar o audio gravado.');
    }
  }, [handleSendAttachment]);

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
    { key: 'gallery', label: 'Galeria de Fotos e Videos', icon: 'image' as const, onPress: handlePickImage },
    { key: 'camera', label: 'Camera', icon: 'camera' as const, onPress: handleOpenCamera },
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 6 : 0}>
        <ConversationHeader
          title={header?.title ?? t('detail.title', 'Conversa')}
          subtitle={headerSubtitle}
          avatar={header?.avatar ?? 'CH'}
          isOnline={isPrivateConversation ? privatePartnerIsOnline : onlineCount > 0}
          isTyping={isTyping}
          onBack={handleBack}
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
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 156 + insets.bottom }}
          ListHeaderComponent={(
            <>
              <View className="self-center rounded-full px-3 py-1 mb-3 mt-1" style={{ backgroundColor: theme === 'light' ? '#E9EFF8' : 'rgba(255,255,255,0.05)' }}>
                <Text variant="micro" className="uppercase text-[#6B7280] dark:text-fg3 font-bold">{t('common.today', 'Hoje')}</Text>
              </View>
              {error ? (
                <View className="self-center rounded-full border border-[#FF9A9A66] bg-[#FF9A9A22] px-3 py-1.5 mb-2">
                  <Text variant="micro" className="text-[#D66658] dark:text-[#FFB5B5] font-semibold">{error}</Text>
                </View>
              ) : null}
              {loading && messages.length === 0 ? (
                <View className="self-center rounded-full px-3 py-1.5 mb-2" style={{ backgroundColor: theme === 'light' ? '#E9EFF8' : 'rgba(255,255,255,0.05)' }}>
                  <Text variant="micro" className="text-[#6B7280] dark:text-fg3 font-semibold">{t('detail.loadingMessages', 'Carregando mensagens...')}</Text>
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
              onAttachmentPress={(message) => {
                const url = message.attachment?.url;
                if (!url) return;
                if (message.attachment?.kind === 'document') {
                  void Linking.openURL(url);
                  return;
                }
                setOpenedAttachment({
                  kind: message.attachment?.kind ?? 'document',
                  url,
                  fileName: message.attachment?.fileName,
                });
              }}
              onAttachmentDownload={(message) => {
                const url = message.attachment?.downloadUrl ?? message.attachment?.url;
                if (!url) return;
                if (Platform.OS === 'web' && typeof document !== 'undefined') {
                  void (async () => {
                    try {
                      const response = await fetch(url);
                      const blob = await response.blob();
                      const objectUrl = URL.createObjectURL(blob);
                      const anchor = document.createElement('a');
                      anchor.href = objectUrl;
                      anchor.download = message.attachment?.fileName ?? 'arquivo';
                      anchor.rel = 'noopener noreferrer';
                      document.body.appendChild(anchor);
                      anchor.click();
                      document.body.removeChild(anchor);
                      URL.revokeObjectURL(objectUrl);
                    } catch {
                      void Linking.openURL(url);
                    }
                  })();
                  return;
                }
                void Linking.openURL(url);
              }}
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

        <ChatActionSheet visible={!!selectedMessage} title="Mensagem" actions={selectedMessageActions} onClose={() => setSelectedMessage(null)} />
        <ChatActionSheet visible={attachVisible} title="Anexar" actions={attachmentActions} onClose={() => setAttachVisible(false)} />

        <ParticipantsSheet
          visible={participantsVisible}
          title={t('detail.participants', 'Participantes')}
          participants={participants}
          roleLabel={roleLabel}
          canManage={Boolean(header?.isCustomGroup) && isGroupAdmin}
          currentUserId={currentUserId}
          onSearchProfiles={(q) => searchChatProfiles(q)}
          onAddParticipant={async (userId) => {
            await addConversationParticipant(conversationId, userId, 'player');
            await refresh();
          }}
          onPromoteToAdmin={async (userId) => {
            await updateConversationParticipantRole(conversationId, userId, 'host');
            await refresh();
          }}
          onDemoteFromAdmin={async (userId) => {
            await updateConversationParticipantRole(conversationId, userId, 'player');
            await refresh();
          }}
          onRemoveParticipant={async (userId) => {
            await removeConversationParticipant(conversationId, userId);
            await refresh();
          }}
          onClose={() => setParticipantsVisible(false)}
        />

        <Modal visible={!!pendingAttachment} transparent animationType="fade" onRequestClose={() => setPendingAttachment(null)}>
          <View className="flex-1 bg-black/70 items-center justify-center px-6">
            <View className="w-full rounded-2xl p-4" style={{ backgroundColor: theme === 'light' ? '#fff' : '#111827' }}>
              {pendingAttachment?.kind === 'image' ? (
                <View style={{ width: '100%', height: 320, borderRadius: 12, backgroundColor: '#0b1220', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                  <Image source={{ uri: pendingAttachment.uri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                </View>
              ) : pendingAttachment?.kind === 'video' ? (
                <View style={{ width: '100%', height: 320, borderRadius: 12, backgroundColor: '#0b1220', overflow: 'hidden' }}>
                  <Video
                    source={{ uri: pendingAttachment.uri }}
                    style={{ width: '100%', height: '100%' }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                  />
                </View>
              ) : (
                <View className="rounded-xl border border-[#334155] p-3">
                  <Text variant="caption" className="font-bold text-fg1">{pendingAttachment?.kind.toUpperCase()}</Text>
                  <Text variant="micro" className="text-fg2">{pendingAttachment?.fileName}</Text>
                </View>
              )}
              <View className="mt-3 flex-row gap-2">
                <Pressable className="flex-1 rounded-xl border border-[#64748b] py-2 items-center" onPress={() => setPendingAttachment(null)}>
                  <Text variant="caption">Cancelar</Text>
                </Pressable>
                <Pressable
                  className="flex-1 rounded-xl py-2 items-center"
                  style={{ backgroundColor: '#10b981' }}
                  onPress={() => {
                    if (!pendingAttachment) return;
                    const next = pendingAttachment;
                    setPendingAttachment(null);
                    void handleSendAttachment(next);
                  }}
                >
                  <Text variant="caption" className="text-white font-bold">Enviar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={!!openedAttachment} transparent animationType="slide" onRequestClose={() => setOpenedAttachment(null)}>
          <View className="flex-1 bg-black">
            <View className="px-4 py-3 flex-row items-center justify-between" style={{ backgroundColor: '#0b1220' }}>
              <Text variant="caption" className="text-white font-bold">
                {openedAttachment?.kind === 'document'
                  ? (openedAttachment?.fileName ?? 'Documento')
                  : openedAttachment?.kind === 'image'
                    ? 'Imagem'
                    : openedAttachment?.kind === 'video'
                      ? 'Vídeo'
                      : 'Preview'}
              </Text>
              <View className="flex-row items-center gap-5">
                {(openedAttachment?.kind === 'image' || openedAttachment?.kind === 'video') ? (
                  <Pressable onPress={() => openedAttachment?.url && void Linking.openURL(openedAttachment.url)}>
                    <Text variant="caption" className="text-[#22c55e] font-bold">Baixar</Text>
                  </Pressable>
                ) : null}
                <Pressable onPress={() => setOpenedAttachment(null)}>
                  <Text variant="caption" className="text-[#22c55e] font-bold">Fechar</Text>
                </Pressable>
              </View>
            </View>
            {openedAttachment?.kind === 'image' ? (
              <View className="flex-1 items-center justify-center">
                <Image source={{ uri: openedAttachment.url }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
              </View>
            ) : openedAttachment?.kind === 'video' ? (
              <View className="flex-1 items-center justify-center">
                <Video
                  source={{ uri: openedAttachment.url }}
                  style={{ width: '100%', height: '100%' }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={false}
                />
              </View>
            ) : (
              <View className="flex-1 items-center justify-center px-6">
                <Text variant="caption" className="text-white text-center">
                  Este tipo de arquivo abre no navegador.
                </Text>
              </View>
            )}
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
