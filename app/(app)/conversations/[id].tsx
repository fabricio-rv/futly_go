import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

import {
  ChatActionSheet,
  ComposerBar,
  ConversationHeader,
  MessageBubble,
  ParticipantsSheet,
  TwemojiPicker,
  TypingIndicator,
} from '@/src/components/features/chat';
import { Text } from '@/src/components/ui';
import { Camera, FileText, Image as ImageIcon, Pin, Star } from 'lucide-react-native';
import { useConversationThread } from '@/src/features/chat/hooks/useConversationThread';
import {
  addConversationParticipant,
  createChatFileAttachment,
  forwardMessage,
  removeConversationParticipant,
  searchChatProfiles,
  updateConversationParticipantRole,
} from '@/src/features/chat/services/chatService';
import { useChatList } from '@/src/features/chat/hooks/useChatList';
import { formatLastSeenBrazil } from '@/src/features/chat/utils/formatters';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import { DEFAULT_REACTION_EMOJIS } from '@/src/lib/emoji/twemoji';
import type { ChatMessage } from '@/src/components/features/store/data';

type MessageAction = {
  key: string;
  label: string;
  icon: 'reply' | 'pin' | 'save' | 'reaction' | 'delete' | 'copy' | 'forward';
  onPress: () => void;
};

// Lê um arquivo local e retorna ArrayBuffer.
// fetch(file://) é instável em dispositivos iOS físicos e Blob não é confiável
// no React Native para uploads ao Supabase Storage — usar FileSystem + base64.
async function readFileAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const localUri = uri.startsWith('/') ? `file://${uri}` : uri;
  // FileSystem.EncodingType não está disponível no namespace no Expo SDK 54 — usar string literal
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: 'base64' as any,
  });
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer({ uri }, (p) => { p.loop = false; });
  return <VideoView player={player} style={{ width: '100%', height: '100%' }} nativeControls contentFit="cover" />;
}

export default function ConversationDetailScreen() {
  const { t } = useTranslation('chat');
  const insets = useSafeAreaInsets();
  const theme = useAppColorScheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const conversationId = params.id ?? '';

  const [draft, setDraft] = useState('');
  const [attachVisible, setAttachVisible] = useState(false);
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [reactionEmojiVisible, setReactionEmojiVisible] = useState(false);
  const [reactionEmojiMessage, setReactionEmojiMessage] = useState<ChatMessage | null>(null);
  const [reactionEmojiAnchor, setReactionEmojiAnchor] = useState<{ x: number; y: number } | undefined>(undefined);
  const [participantsVisible, setParticipantsVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [selectedMessageAnchor, setSelectedMessageAnchor] = useState<{ x: number; y: number } | undefined>(undefined);
  const [forwardingMessage, setForwardingMessage] = useState<ChatMessage | null>(null);
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
  const listRef = useRef<any>(null);
  const hasScrolledToBottomRef = useRef(false);

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
    privatePartner,
    privatePartnerIsOnline,
    currentUserId,
    refresh,
    canSend,
    send,
    toggleReaction,
    togglePin,
    toggleSave,
    deleteMessage,
    notifyComposerChanged,
    updateTypingState,
  } = useConversationThread(conversationId);
  const { visibleActive: forwardActiveConversations, visibleArchived: forwardArchivedConversations } = useChatList();

  useEffect(() => {
    if (!loading && messages.length > 0 && !hasScrolledToBottomRef.current) {
      hasScrolledToBottomRef.current = true;
      setTimeout(() => {
        listRef.current?.scrollToEnd?.({ animated: false });
      }, 50);
    }
  }, [loading, messages.length]);

  const participantNameById = useMemo(() => new Map(participants.map((p) => [p.user_id, p.full_name])), [participants]);
  const typingNames = useMemo(() => typingUserIds.map((id) => participantNameById.get(id) ?? t('detail.athleteFallback', 'Atleta')), [participantNameById, t, typingUserIds]);
  const isTyping = typingNames.length > 0;
  const isPrivateConversation = Boolean(header?.privatePartnerId);
  const forwardTargets = useMemo(
    () => [...forwardActiveConversations, ...forwardArchivedConversations].filter((item) => item.id !== conversationId),
    [conversationId, forwardActiveConversations, forwardArchivedConversations],
  );
  const messageIndexById = useMemo(() => new Map(messages.map((message, index) => [message.id, index])), [messages]);

  const getMessagePreview = useCallback((message: ChatMessage | null) => {
    if (!message) return '';
    if (message.text?.trim()) return message.text.trim();
    if (message.attachment?.kind === 'image') return 'Imagem';
    if (message.attachment?.kind === 'video') return 'Video';
    if (message.attachment?.kind === 'audio') return message.attachment.durationSec ? `Audio ${message.attachment.durationSec}s` : 'Audio';
    if (message.attachment?.fileName) return message.attachment.fileName;
    return 'Mensagem';
  }, []);

  const getReplyAuthor = useCallback((message: ChatMessage | null) => {
    if (!message) return null;
    if (message.kind === 'me') return t('messages.you', 'Você');
    return message.author ?? (message.senderId ? participantNameById.get(message.senderId) : undefined) ?? 'Mensagem';
  }, [participantNameById]);

  const resolveReplyAuthor = useCallback((message: ChatMessage) => {
    if (!message.replyTo) return message.replyAuthor ?? null;
    if (message.replyMine) return t('messages.you', 'Você');
    if (message.replyAuthor && message.replyAuthor !== 'Mensagem') return message.replyAuthor;

    const quotedMessage = messages.find((candidate) => (
      candidate.id !== message.id
      && getMessagePreview(candidate) === message.replyTo
    ));

    return getReplyAuthor(quotedMessage ?? null) ?? message.replyAuthor ?? 'Mensagem';
  }, [getMessagePreview, getReplyAuthor, messages]);

  const getDisplayMessage = useCallback((message: ChatMessage) => {
    const replyAuthor = resolveReplyAuthor(message);
    if (!replyAuthor || replyAuthor === message.replyAuthor) return message;
    return {
      ...message,
      replyAuthor,
      replyMine: replyAuthor === t('messages.you', 'Você') ? true : message.replyMine,
    };
  }, [resolveReplyAuthor]);

  const getTrackedPreview = useCallback((message: ChatMessage) => {
    const base = getMessagePreview(message);
    return message.author ? `${message.author}: ${base}` : base;
  }, [getMessagePreview]);

  const trackedMessages = useMemo(() => {
    const orderedIds = Array.from(new Set([...pinnedMessageIds, ...savedMessageIds]));
    return orderedIds
      .map((id) => {
        const message = messages.find((item) => item.id === id);
        if (!message) return null;
        return {
          id,
          message,
          pinned: pinnedMessageIds.includes(id),
          saved: savedMessageIds.includes(id),
          preview: getTrackedPreview(message),
        };
      })
      .filter((item): item is { id: string; message: ChatMessage; pinned: boolean; saved: boolean; preview: string } => Boolean(item));
  }, [getTrackedPreview, messages, pinnedMessageIds, savedMessageIds]);

  const scrollToMessage = useCallback((messageId: string) => {
    const index = messageIndexById.get(messageId);
    if (index === undefined) return;
    listRef.current?.scrollToIndex?.({ index, animated: true, viewPosition: 0.5 });
  }, [messageIndexById]);

  const headerSubtitle = useMemo(() => {
    if (!header) return t('common.loading', 'Carregando...');
    if (isTyping) return t('messages.typing', 'Digitando...');
    if (isPrivateConversation) {
      if (privatePartnerIsOnline) return `${privatePartner?.full_name ?? t('detail.athleteFallback', 'Atleta')} - ${t('detail.onlineLabel', 'online')}`;
      const lastSeen = formatLastSeenBrazil(privatePartner?.last_seen_at ?? null);
      if (lastSeen) return `${privatePartner?.full_name ?? t('detail.athleteFallback', 'Atleta')} - ${t('detail.offlineLastSeen', 'offline • visto por último {{lastSeen}}', { lastSeen })}`;
      return `${privatePartner?.full_name ?? t('detail.athleteFallback', 'Atleta')} - ${t('detail.offlineLabel', 'offline')}`;
    }
    return header.subtitle;
  }, [header, isPrivateConversation, isTyping, privatePartner?.full_name, privatePartner?.last_seen_at, privatePartnerIsOnline, t]);

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
    if (!message || !canSend) return;

    const replyPreview = getMessagePreview(replyTo);
    const text = replyPreview ? `> ${replyPreview}\n${message}` : message;
    const metadata = replyTo
      ? {
          reply_author: getReplyAuthor(replyTo),
          reply_mine: replyTo.kind === 'me',
        }
      : undefined;
    setDraft('');
    setReplyTo(null);

    try {
      await send(text, metadata ? { metadata } : undefined);
    } catch {
      setDraft(message);
      Alert.alert(
        t('errors.sendFailedTitle', 'Falha ao enviar'),
        t('errors.sendFailedMessage', 'Nao foi possivel enviar a mensagem agora.'),
      );
    }
  }, [canSend, draft, getMessagePreview, getReplyAuthor, replyTo, send, t]);

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
          url: input.kind === 'image' || input.kind === 'video' || input.kind === 'audio' ? input.uri : null,
          durationSec: input.durationSec ?? null,
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

      const bytes = await readFileAsArrayBuffer(input.uri);
      await createChatFileAttachment({
        conversationId,
        messageId,
        fileName: input.fileName,
        mimeType: input.mimeType,
        bytes,
      });
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.sendAttachmentMessage', 'Falha ao enviar anexo.');
      Alert.alert(t('errors.sendAttachmentFailed', 'Falha ao enviar'), message);
    } finally {
      setSending(false);
    }
  }, [conversationId, send]);

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('errors.micPermissionTitle', 'Permissão necessária'), t('errors.galleryPermissionMessage', 'Precisamos de acesso à sua galeria para enviar fotos e vídeos.'));
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
  }, [handleSendAttachment, t]);

  const handleOpenCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('errors.micPermissionTitle', 'Permissão necessária'), t('errors.cameraPermissionMessage', 'Precisamos de acesso à câmera.'));
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
  }, [handleSendAttachment, t]);

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
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      Alert.alert(t('common.error', 'Erro'), detail || t('errors.selectFileError', 'Não foi possível selecionar o arquivo.'));
    }
  }, [handleSendAttachment, t]);

  const handleStartRecording = useCallback(async () => {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      Alert.alert(t('errors.micPermissionTitle', 'Permissão necessária'), t('errors.micPermissionMessage', 'Precisamos de acesso ao microfone para gravar áudios.'));
      return;
    }

    try {
      if (recordingRef.current) {
        try { await recordingRef.current.stopAndUnloadAsync(); } catch { /* já parado */ }
        recordingRef.current = null;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      Alert.alert(t('common.error', 'Erro'), detail || t('errors.startRecordingError', 'Não foi possível iniciar a gravação.'));
    }
  }, [t]);

  const handleStopRecording = useCallback(async (cancelled: boolean) => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    const durationSec = recordingDuration;
    setIsRecording(false);
    setRecordingDuration(0);

    try {
      const recording = recordingRef.current;
      recordingRef.current = null;
      if (recording) {
        await recording.stopAndUnloadAsync();
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      if (cancelled || !recording) return;

      const uri = recording.getURI();
      if (!uri) throw new Error('Nao foi possivel ler o arquivo de audio.');

      await handleSendAttachment({
        uri,
        fileName: `audio-${Date.now()}.m4a`,
        mimeType: 'audio/m4a',
        kind: 'audio',
        durationSec,
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      Alert.alert(t('common.error', 'Erro'), detail || t('errors.audioProcessError', 'Não foi possível processar o áudio gravado.'));
    }
  }, [handleSendAttachment, recordingDuration, t]);

  // No iOS, o Modal do action sheet precisa estar completamente fechado antes de
  // abrir qualquer picker nativo (UIImagePickerController, UIDocumentPickerViewController).
  // Chamar o picker enquanto o Modal ainda está montado resulta em erro silencioso.
  const attachmentActions = useMemo(() => {
    const run = (fn: () => void) => () => {
      setAttachVisible(false);
      setTimeout(fn, 50);
    };
    return [
      { key: 'gallery', label: t('detail.gallery', 'Galeria'), icon: 'image' as const, color: '#7c3aed', onPress: run(handlePickImage) },
      { key: 'camera', label: t('detail.camera', 'Câmera'), icon: 'camera' as const, color: '#0369a1', onPress: run(handleOpenCamera) },
      { key: 'document', label: t('detail.documentFile', 'Arquivo'), icon: 'document' as const, color: '#e11d48', onPress: run(handlePickDocument) },
    ];
  }, [handleOpenCamera, handlePickDocument, handlePickImage, t]);

  const selectedMessageActions = useMemo(() => {
    if (!selectedMessage) return [];
    const copyableText = selectedMessage.text ?? selectedMessage.attachment?.url ?? selectedMessage.attachment?.fileName ?? '';

    const actions: MessageAction[] = [
      { key: 'reply', label: t('actions.reply', 'Responder'), icon: 'reply', onPress: () => setReplyTo(selectedMessage) },
      {
        key: 'copy',
        label: t('actions.copy', 'Copiar'),
        icon: 'copy',
        onPress: () => {
          if (copyableText) void Clipboard.setStringAsync(copyableText);
        },
      },
      {
        key: 'forward',
        label: t('actions.forward', 'Encaminhar'),
        icon: 'forward',
        onPress: () => {
          setForwardingMessage(selectedMessage);
        },
      },
      {
        key: 'pin',
        label: pinnedMessageIds.includes(selectedMessage.id) ? t('actions.unpin', 'Desfixar mensagem') : t('actions.pin', 'Fixar mensagem'),
        icon: 'pin',
        onPress: () => void togglePin(selectedMessage.id),
      },
      {
        key: 'save',
        label: savedMessageIds.includes(selectedMessage.id) ? t('actions.unsaveMessage', 'Remover dos salvos') : t('actions.saveMessage', 'Salvar mensagem'),
        icon: 'save',
        onPress: () => void toggleSave(selectedMessage.id),
      },
    ];

    if (selectedMessage.kind === 'me') {
      actions.push({ key: 'delete', label: t('actions.deleteMessage', 'Apagar mensagem'), icon: 'delete', onPress: () => void deleteMessage(selectedMessage.id) });
    }

    return actions;
  }, [deleteMessage, pinnedMessageIds, savedMessageIds, selectedMessage, t, togglePin, toggleReaction, toggleSave]);

  const bgColor = theme === 'light' ? '#F4F6F9' : '#05070B';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <ConversationHeader
          title={header?.title ?? t('detail.title', 'Conversa')}
          subtitle={headerSubtitle}
          avatar={header?.avatar ?? 'CH'}
          isOnline={isPrivateConversation ? privatePartnerIsOnline : false}
          isTyping={isTyping}
          showPresenceDot={isPrivateConversation}
          onBack={handleBack}
        />

        {trackedMessages.length > 0 ? (
          <View
            className="mx-3 mt-2 mb-1 rounded-xl border overflow-hidden"
            style={{
              borderColor: theme === 'light' ? '#D1DCEB' : 'rgba(255,255,255,0.10)',
              backgroundColor: theme === 'light' ? '#FFFFFF' : '#151A1D',
            }}
          >
            {trackedMessages.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => scrollToMessage(item.id)}
                className="px-3 py-2 flex-row items-center gap-2"
                style={{
                  borderTopWidth: index > 0 ? 1 : 0,
                  borderTopColor: theme === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                }}
              >
                {item.pinned ? <Pin size={15} color={theme === 'light' ? '#64748B' : '#A3A3A3'} /> : null}
                {item.saved ? <Star size={15} color="#EAB308" fill="#EAB308" /> : null}
                <Text variant="caption" numberOfLines={1} style={{ flex: 1, color: theme === 'light' ? '#475569' : '#A7B0B8' }}>
                  {item.preview}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <FlashList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => (item as ChatMessage & { clientMessageId?: string }).clientMessageId ?? item.id}
          bounces
          overScrollMode="always"
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
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
          renderItem={({ item }) => {
            const displayMessage = getDisplayMessage(item);

            return (
              <MessageBubble
                message={displayMessage}
                showSenderName
                isPinned={pinnedMessageIds.includes(item.id)}
                isSaved={savedMessageIds.includes(item.id)}
                isForwarded={Boolean(item.isForwarded)}
                reactions={reactions[item.id]}
                onLongPress={(message, anchor) => {
                  setSelectedMessage(message);
                  setSelectedMessageAnchor(anchor);
                }}
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
            );
          }}
        />

        {attachVisible ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 12,
              borderTopWidth: 1,
              borderTopColor: theme === 'light' ? '#E5E7EB' : 'rgba(255,255,255,0.09)',
              backgroundColor: theme === 'light' ? '#FFFFFF' : '#111827',
            }}
          >
            {attachmentActions.map((action) => {
              const Icon = action.icon === 'image' ? ImageIcon : action.icon === 'camera' ? Camera : FileText;
              return (
                <Pressable key={action.key} onPress={action.onPress} style={{ alignItems: 'center', gap: 7 }}>
                  <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: action.color, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={24} color="#fff" strokeWidth={1.8} />
                  </View>
                  <Text variant="micro" style={{ color: theme === 'light' ? '#6B7280' : '#9CA3AF' }}>{action.label}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <ComposerBar
          text={draft}
          placeholder={t('detail.messagePlaceholder', 'Mensagem...')}
          replyTo={getMessagePreview(replyTo) || null}
          replySender={getReplyAuthor(replyTo)}
          replyLabel={t('detail.replyingTo', 'Respondendo a')}
          isSending={sending}
          isRecording={isRecording}
          recordingDuration={recordingDuration}
          bottomInset={insets.bottom}
          onChangeText={handleDraftChange}
          onSend={handleSend}
          onAddAttachment={() => setAttachVisible((v) => !v)}
          onOpenCamera={handleOpenCamera}
          onOpenEmoji={() => setEmojiVisible(true)}
          onCancelReply={() => setReplyTo(null)}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onFocus={() => updateTypingState(draft.trim().length > 0)}
          onBlur={() => updateTypingState(false)}
        />
        <TwemojiPicker
          visible={emojiVisible}
          title={t('detail.chooseEmoji', 'Escolha um emoji')}
          onSelect={(emoji) => setDraft((prev) => prev + emoji)}
          onClose={() => setEmojiVisible(false)}
        />
        <ChatActionSheet
          visible={!!selectedMessage}
          title="Mensagem"
          actions={selectedMessageActions}
          quickReactions={DEFAULT_REACTION_EMOJIS}
          anchor={selectedMessageAnchor}
          onQuickReaction={(emoji) => {
            if (selectedMessage) void toggleReaction(selectedMessage.id, emoji);
          }}
          onMoreReactions={() => {
            if (!selectedMessage) return;
            setReactionEmojiMessage(selectedMessage);
            setReactionEmojiAnchor(selectedMessageAnchor);
            setSelectedMessage(null);
            setSelectedMessageAnchor(undefined);
            setReactionEmojiVisible(true);
          }}
          onClose={() => {
            setSelectedMessage(null);
            setSelectedMessageAnchor(undefined);
          }}
        />
        <TwemojiPicker
          visible={reactionEmojiVisible}
          title={t('detail.chooseEmoji', 'Escolha um emoji')}
          anchor={reactionEmojiAnchor}
          compact
          onSelect={(emoji) => {
            if (reactionEmojiMessage) void toggleReaction(reactionEmojiMessage.id, emoji);
          }}
          onClose={() => {
            setReactionEmojiVisible(false);
            setReactionEmojiMessage(null);
            setReactionEmojiAnchor(undefined);
          }}
        />
        <Modal visible={!!forwardingMessage} transparent animationType="fade" onRequestClose={() => setForwardingMessage(null)}>
          <Pressable className="flex-1 bg-black/55 justify-end" onPress={() => setForwardingMessage(null)}>
            <Pressable className="rounded-t-2xl border-t px-4 py-4" style={{ backgroundColor: theme === 'light' ? '#FFFFFF' : '#111827', borderTopColor: theme === 'light' ? '#D1DCEB' : 'rgba(255,255,255,0.10)' }}>
              <Text variant="caption" className="font-bold text-fg1 mb-3">Encaminhar para</Text>
              <View style={{ maxHeight: 360 }}>
                <FlashList
                  data={forwardTargets}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      className="rounded-xl border px-3 py-3 mb-2"
                      style={{ borderColor: theme === 'light' ? '#D1DCEB' : 'rgba(255,255,255,0.10)' }}
                      onPress={() => {
                        if (!forwardingMessage) return;
                        const targetId = item.id;
                        setForwardingMessage(null);
                        void forwardMessage(targetId, forwardingMessage.id).catch((error) => {
                          const message = error instanceof Error ? error.message : 'Nao foi possivel encaminhar.';
                          Alert.alert('Falha ao encaminhar', message);
                        });
                      }}
                    >
                      <Text variant="caption" className="font-semibold text-fg1">{item.title}</Text>
                      <Text variant="micro" className="text-fg3" numberOfLines={1}>{item.message}</Text>
                    </Pressable>
                  )}
                  ListEmptyComponent={(
                    <Text variant="micro" className="text-fg3">Nenhuma conversa disponivel.</Text>
                  )}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>

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
                  <Image source={{ uri: pendingAttachment.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                </View>
              ) : pendingAttachment?.kind === 'video' ? (
                <View style={{ width: '100%', height: 320, borderRadius: 12, backgroundColor: '#0b1220', overflow: 'hidden' }}>
                  <VideoPreview uri={pendingAttachment.uri} />
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

        <Modal visible={!!openedAttachment} transparent animationType="fade" onRequestClose={() => setOpenedAttachment(null)}>
          <View style={{ flex: 1, backgroundColor: '#000' }}>
            {openedAttachment?.kind === 'image' ? (
              <View className="flex-1 items-center justify-center" style={{ paddingTop: insets.top + 56 }}>
                <Image source={{ uri: openedAttachment.url }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
              </View>
            ) : openedAttachment?.kind === 'video' ? (
              <View className="flex-1 items-center justify-center" style={{ paddingTop: insets.top + 56 }}>
                <VideoPreview uri={openedAttachment.url} />
              </View>
            ) : (
              <View className="flex-1 items-center justify-center px-6" style={{ paddingTop: insets.top + 56 }}>
                <Text variant="caption" className="text-white text-center">
                  Este tipo de arquivo abre no navegador.
                </Text>
              </View>
            )}

            <View
              className="px-4 py-3 flex-row items-center justify-between"
              style={{
                backgroundColor: 'rgba(11,18,32,0.94)',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                paddingTop: insets.top + 6,
                zIndex: 50,
                elevation: 50,
              }}
            >
              <Text variant="caption" className="text-white font-bold" numberOfLines={1} style={{ flex: 1, marginRight: 12 }}>
                {openedAttachment?.kind === 'document'
                  ? (openedAttachment?.fileName ?? 'Documento')
                  : openedAttachment?.kind === 'image'
                    ? 'Imagem'
                    : openedAttachment?.kind === 'video'
                      ? 'VÃ­deo'
                      : 'Preview'}
              </Text>
              <View className="flex-row items-center gap-5">
                {(openedAttachment?.kind === 'image' || openedAttachment?.kind === 'video') ? (
                  <Pressable onPress={() => openedAttachment?.url && void Linking.openURL(openedAttachment.url)}>
                    <Text variant="caption" className="text-[#22c55e] font-bold">Baixar</Text>
                  </Pressable>
                ) : null}
                <Pressable onPress={() => setOpenedAttachment(null)} hitSlop={12}>
                  <Text variant="caption" className="text-[#22c55e] font-bold">Fechar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

