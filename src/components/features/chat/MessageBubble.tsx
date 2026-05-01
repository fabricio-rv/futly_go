import { Check, CheckCheck, CornerUpLeft, FileText, Forward, Mic, Pause, Pin, Play, Star } from 'lucide-react-native';
import { Image, Platform, Pressable, type GestureResponderEvent, View, useWindowDimensions } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEffect, type ReactNode } from 'react';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { getChatTokens } from '@/src/lib/chatTokens';
import { Text } from '@/src/components/ui';
import { Twemoji, TwemojiRichText } from '@/src/components/ui/emoji';
import type { ChatMessage } from '@/src/components/features/store/data';

type MessageBubbleProps = {
  message: ChatMessage;
  showSenderName?: boolean;
  isPinned?: boolean;
  isSaved?: boolean;
  isForwarded?: boolean;
  selectMode?: boolean;
  isSelected?: boolean;
  reactions?: Array<{ emoji: string; count: number; reactedByMe: boolean }>;
  onLongPress?: (message: ChatMessage, anchor?: { x: number; y: number }) => void;
  onReactionPress?: (emoji: string) => void;
  onToggleSelect?: (messageId: string) => void;
  onAttachmentPress?: (message: ChatMessage) => void;
  onAttachmentDownload?: (message: ChatMessage) => void;
  onContactPress?: (message: ChatMessage) => void;
};

function formatAudioTime(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const min = Math.floor(total / 60).toString().padStart(1, '0');
  const sec = (total % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

function VideoAttachmentPreview({ url }: { url: string }) {
  const videoPlayer = useVideoPlayer({ uri: url }, (p) => { p.loop = false; });
  return (
    <VideoView
      player={videoPlayer}
      style={{ width: '100%', height: '100%' }}
      nativeControls
      contentFit="cover"
    />
  );
}

type AudioAttachmentProps = {
  message: ChatMessage;
  mine: boolean;
  bubbleBg: string;
  textSecondary: string;
  textTertiary: string;
  brandGold: string;
  isPinned: boolean;
  isSaved: boolean;
  receiptIcon: ReactNode;
  attachmentCardWidth: number;
};

function AudioAttachmentCard({
  message,
  mine,
  bubbleBg,
  textSecondary,
  textTertiary,
  brandGold,
  isPinned,
  isSaved,
  receiptIcon,
  attachmentCardWidth,
}: AudioAttachmentProps) {
  const audioSource = message.attachment?.kind === 'audio' && message.attachment?.url
    ? { uri: message.attachment.url }
    : null;
  const audioPlayer = useAudioPlayer(audioSource);
  const audioStatus = useAudioPlayerStatus(audioPlayer);
  const isPlayingAudio = audioStatus.playing;
  const audioDurationMs = audioStatus.duration * 1000;
  const audioPositionMs = audioStatus.currentTime * 1000;
  const metadataDurationMs = message.attachment?.durationSec && message.attachment.durationSec > 0
    ? message.attachment.durationSec * 1000
    : 0;
  const playbackTargetDurationMs = metadataDurationMs || audioDurationMs;
  const probedDurationMs = playbackTargetDurationMs;

  useEffect(() => {
    // Garante reprodução no volume máximo permitido pelo sistema.
    audioPlayer.volume = 1.0;
  }, [audioPlayer]);

  useEffect(() => {
    if (!isPlayingAudio || playbackTargetDurationMs <= 0) return;
    if (audioPositionMs >= playbackTargetDurationMs - 90) {
      audioPlayer.pause();
      audioPlayer.seekTo(0);
    }
  }, [audioPlayer, audioPositionMs, isPlayingAudio, playbackTargetDurationMs]);

  const toggleAudioPlayback = () => {
    if (!message.attachment?.url || message.attachment.kind !== 'audio') return;
    if (audioStatus.playing) {
      audioPlayer.pause();
    } else {
      const finished = audioStatus.duration > 0 && audioStatus.currentTime >= audioStatus.duration - 0.5;
      if (finished) {
        audioPlayer.seekTo(0);
      }
      audioPlayer.play();
    }
  };

  return (
    <Pressable
      onPress={toggleAudioPlayback}
      style={{
        backgroundColor: bubbleBg,
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 8,
        width: attachmentCardWidth,
        minWidth: 220,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {message.avatarUrl ? (
          <Image source={{ uri: message.avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0 }} resizeMode="cover" />
        ) : (
          <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: mine ? 'rgba(255,255,255,0.22)' : '#0f766e' }}>
            <Text variant="micro" style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>{(message.author ?? 'A').slice(0, 1).toUpperCase()}</Text>
          </View>
        )}
        <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.15)' }}>
          {isPlayingAudio ? (
            <Pause size={16} color="#FFFFFF" fill="#FFFFFF" />
          ) : (
            <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
          )}
        </View>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          {Array.from({ length: 32 }).map((_, idx) => {
            const totalMs = playbackTargetDurationMs || ((message.attachment?.durationSec ?? 0) * 1000);
            const playedRatio = totalMs > 0 ? audioPositionMs / totalMs : 0;
            const activeBar = idx / 32 <= playedRatio;
            const heights = [5, 8, 12, 7, 10, 14, 6, 9, 13, 5, 11, 8, 15, 6, 10, 7, 12, 9, 14, 5, 8, 13, 6, 11, 7, 10, 15, 8, 6, 12, 9, 5];
            const barH = heights[idx % heights.length];
            return (
              <View
                key={`${message.id}-bar-${idx}`}
                style={{
                  flex: 1,
                  height: barH,
                  borderRadius: 1.5,
                  backgroundColor: activeBar
                    ? (mine ? '#4ade80' : '#22d3ee')
                    : (mine ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.25)'),
                }}
              />
            );
          })}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingLeft: 82 }}>
        <Text variant="micro" style={{ color: mine ? 'rgba(255,255,255,0.85)' : textSecondary, fontSize: 12 }}>
          {formatAudioTime(playbackTargetDurationMs || ((message.attachment?.durationSec ?? 0) * 1000) || audioPositionMs)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {isPinned ? <Pin size={10} color={mine ? 'rgba(255,255,255,0.68)' : brandGold} /> : null}
          {isSaved ? <Star size={10} color={mine ? 'rgba(255,255,255,0.68)' : brandGold} fill={mine ? 'rgba(255,255,255,0.68)' : brandGold} /> : null}
          {message.time ? (
            <Text variant="micro" style={{ color: mine ? 'rgba(255,255,255,0.65)' : textTertiary, fontSize: 11 }}>
              {message.time}
            </Text>
          ) : null}
          {receiptIcon}
        </View>
      </View>
    </Pressable>
  );
}

export function MessageBubble({
  message,
  showSenderName = false,
  isPinned = false,
  isSaved = false,
  isForwarded = false,
  selectMode = false,
  isSelected = false,
  reactions = [],
  onLongPress,
  onReactionPress,
  onToggleSelect,
  onAttachmentPress,
  onAttachmentDownload,
  onContactPress,
}: MessageBubbleProps) {
  const theme = useAppColorScheme();
  const tk = getChatTokens(theme);
  const { width: screenWidth } = useWindowDimensions();


  if (message.kind === 'system') {
    return (
      <View
        className="self-center rounded-full border px-3.5 py-1.5 my-[6px]"
        style={{ borderColor: tk.systemBorder, backgroundColor: tk.systemBg }}
      >
        <Text variant="micro" style={{ color: tk.brand.gold.primary }} className="font-semibold">
          {message.text}
        </Text>
      </View>
    );
  }

  const mine = message.kind === 'me';
  const isAudioOnly = message.attachment?.kind === 'audio' && !message.text && !message.replyTo;
  const isDocumentOnly = message.attachment?.kind === 'document' && !message.text && !message.replyTo;
  const isMediaAttachment = message.attachment?.kind === 'image' || message.attachment?.kind === 'video';
  const hasReactionBadge = reactions.length > 0;
  const firstReaction = reactions[0];
  const mediaWidth = Math.min(330, Math.max(220, screenWidth - 92));
  const mediaHeight = Math.round(mediaWidth * 1.2);
  const attachmentCardWidth = Math.min(screenWidth * 0.76, 320);
  const senderNameMaxWidth = isMediaAttachment
    ? mediaWidth - 24
    : (isAudioOnly || isDocumentOnly ? attachmentCardWidth - 24 : undefined);

  const receiptIcon = mine
    ? message.receipt === 'read'
      ? <CheckCheck size={13} color={tk.receiptRead} strokeWidth={2.2} />
      : message.receipt === 'delivered'
        ? <CheckCheck size={13} color={tk.receiptOwnDelivered} strokeWidth={2.2} />
        : <Check size={13} color={tk.receiptOwnSent} strokeWidth={2.2} />
    : null;

  const handlePress = () => {
    if (selectMode) onToggleSelect?.(message.id);
  };

  const openActions = (event?: GestureResponderEvent | { nativeEvent?: { pageX?: number; pageY?: number; clientX?: number; clientY?: number } }) => {
    const nativeEvent = event?.nativeEvent as { pageX?: number; pageY?: number; clientX?: number; clientY?: number } | undefined;
    const x = nativeEvent?.pageX ?? nativeEvent?.clientX;
    const y = nativeEvent?.pageY ?? nativeEvent?.clientY;
    onLongPress?.(message, typeof x === 'number' && typeof y === 'number' ? { x, y } : undefined);
  };

  const webContextMenuProps = Platform.OS === 'web'
    ? {
        onContextMenu: (event: { preventDefault?: () => void; nativeEvent?: { pageX?: number; pageY?: number; clientX?: number; clientY?: number } }) => {
          event.preventDefault?.();
          if (!selectMode) openActions(event);
        },
      }
    : {};


  return (
    <Pressable
      {...webContextMenuProps}
      onPress={handlePress}
      onLongPress={(event) => !selectMode && openActions(event)}
      delayLongPress={260}
      className={`flex-row items-end gap-2 mb-[11px] ${mine ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Select checkbox */}
      {selectMode && (
        <View
          className="mb-1 h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
          style={{
            borderColor: isSelected ? tk.brand.green.primary : tk.border.primary,
            backgroundColor: isSelected ? tk.brand.green.primary : 'transparent',
          }}
        >
          {isSelected && (
            <View style={{ width: 10, height: 8, alignItems: 'center', justifyContent: 'center' }}>
              <Check size={9} color="#FFFFFF" strokeWidth={3} />
            </View>
          )}
        </View>
      )}

      <View style={{ maxWidth: '82%', position: 'relative', marginBottom: hasReactionBadge ? 14 : 0 }}>
        <View
          className={`rounded-[16px] ${(isAudioOnly || isDocumentOnly || isMediaAttachment) ? 'px-0 py-0 border-0' : `px-3 py-2 border ${mine ? 'rounded-tr-[4px]' : 'rounded-tl-[4px]'}`}`}
          style={{
            backgroundColor: (isAudioOnly || isDocumentOnly) ? (mine ? tk.bubbleOwnBg : tk.bubbleThemBg) : (mine ? tk.bubbleOwnBg : tk.bubbleThemBg),
            borderColor: (isAudioOnly || isDocumentOnly) ? 'transparent' : (mine ? tk.bubbleOwnBorder : tk.bubbleThemBorder),
            opacity: isSelected ? 0.85 : 1,
            paddingTop: isDocumentOnly ? 0 : (mine && !isAudioOnly && !isMediaAttachment ? 11 : undefined),
            paddingBottom: isMediaAttachment ? 10 : undefined,
          }}
        >
        {/* Group sender name */}
        {showSenderName && !mine && message.author ? (
          <Text
            variant="micro"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: tk.brand.gold.primary,
              marginLeft: (isDocumentOnly || isAudioOnly || isMediaAttachment) ? 12 : 0,
              marginRight: 12,
              marginTop: (isDocumentOnly || isAudioOnly) ? 2 : 4,
              maxWidth: senderNameMaxWidth ?? '100%',
            }}
            className={`font-bold ${isMediaAttachment ? 'mb-[6px]' : 'mb-[4px]'}`}
          >
            {message.author}
            {message.role ? ` · ${message.role}` : ''}
          </Text>
        ) : null}

        {/* Forwarded badge */}
        {(isForwarded || message.isForwarded) ? (
          <View className="flex-row items-center gap-1 mb-1 opacity-70">
            <Forward size={10} color={mine ? tk.replyTextOwn : tk.replyTextThem} />
            <Text variant="micro" style={{ color: mine ? tk.replyTextOwn : tk.replyTextThem }}>
              Encaminhado
            </Text>
          </View>
        ) : null}

        {/* Reply quote */}
          {message.replyTo ? (
            <View
              className="mb-1.5 rounded-[8px] overflow-hidden"
              style={{ backgroundColor: mine ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.06)' }}
            >
              <View className="flex-row">
                <View style={{ width: 4, backgroundColor: mine ? '#22c55e' : tk.brand.gold.primary }} />
                <View className="flex-1 px-2.5 py-1.5">
                  <Text
                    variant="micro"
                    numberOfLines={1}
                    style={{ color: mine ? '#4ade80' : tk.brand.gold.primary }}
                    className="font-bold"
                  >
                    {message.replyMine ? 'Você' : (message.replyAuthor || 'Mensagem')}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-[1px]">
                    {message.replyTo.toLowerCase().includes('audio') ? (
                      <Mic size={11} color={mine ? '#4ade80' : tk.text.secondary} />
                    ) : null}
                    <Text
                      variant="micro"
                      numberOfLines={1}
                      style={{ color: mine ? 'rgba(255,255,255,0.72)' : tk.text.secondary }}
                    >
                      {message.replyTo}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null}

        {message.contactShare ? (
          <Pressable
            onPress={() => onContactPress?.(message)}
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: mine ? 'rgba(255,255,255,0.25)' : tk.bubbleThemBorder,
              paddingHorizontal: 10,
              paddingVertical: 8,
              marginBottom: message.text ? 8 : 0,
              backgroundColor: mine ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.03)',
            }}
          >
            <Text variant="micro" style={{ color: mine ? 'rgba(255,255,255,0.75)' : tk.text.tertiary }}>
              Contato
            </Text>
            <Text variant="caption" className="font-bold" style={{ color: mine ? '#fff' : tk.text.primary }}>
              {message.contactShare.fullName}
            </Text>
            {message.contactShare.phone ? (
              <Text variant="micro" style={{ color: mine ? 'rgba(255,255,255,0.82)' : tk.text.secondary }}>
                {message.contactShare.phone}
              </Text>
            ) : null}
          </Pressable>
        ) : null}

        {(message.attachment?.kind === 'image' || message.attachment?.kind === 'video') && message.attachment.url ? (
          <Pressable onPress={() => onAttachmentPress?.(message)}>
            {message.attachment.kind === 'image' ? (
              <View
                style={{
                  width: mediaWidth,
                  height: mediaHeight,
                  borderRadius: 0,
                  marginBottom: message.text ? 8 : 0,
                  backgroundColor: mine ? 'rgba(0,0,0,0.15)' : '#0b1220',
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={{ uri: message.attachment.url }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View
                style={{
                  width: mediaWidth,
                  height: mediaHeight,
                  borderRadius: 0,
                  marginBottom: message.text ? 8 : 0,
                  backgroundColor: mine ? 'rgba(0,0,0,0.15)' : '#0b1220',
                  overflow: 'hidden',
                }}
              >
                <VideoAttachmentPreview url={message.attachment.url} />
              </View>
            )}
          </Pressable>
        ) : null}

        {message.attachment?.kind === 'audio' ? (
          <AudioAttachmentCard
            message={message}
            mine={mine}
            bubbleBg={mine ? tk.bubbleOwnBg : tk.bubbleThemBg}
            textSecondary={tk.text.secondary}
            textTertiary={tk.text.tertiary}
            brandGold={tk.brand.gold.primary}
            isPinned={isPinned}
            isSaved={isSaved}
            receiptIcon={receiptIcon}
            attachmentCardWidth={attachmentCardWidth}
          />
        ) : null}

        {message.attachment?.kind === 'document' ? (() => {
          const fileName = message.attachment.fileName ?? 'Documento';
          const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
          const extLabel = ext.toUpperCase() || 'FILE';
          const iconBg =
            ext === 'pdf' ? '#e11d48' :
            ext === 'doc' || ext === 'docx' ? '#2563eb' :
            ext === 'xls' || ext === 'xlsx' ? '#16a34a' :
            ext === 'm4a' || ext === 'mp3' || ext === 'wav' || ext === 'aac' ? '#7c3aed' :
            '#475569';
          const actionColor = mine ? '#4ade80' : '#22d3ee';
          return (
            <Pressable
              onPress={() => onAttachmentPress?.(message)}
              style={{
                backgroundColor: mine ? tk.bubbleOwnBg : tk.bubbleThemBg,
                borderRadius: 18,
                paddingHorizontal: 12,
                paddingTop: 12,
                paddingBottom: 10,
                width: attachmentCardWidth,
                minWidth: 220,
              }}
            >
              {/* Row 1: icon + file info */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 44, height: 44, borderRadius: 11, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={21} color="#fff" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="caption" numberOfLines={2} ellipsizeMode="middle" style={{ color: mine ? '#f1f5f9' : tk.text.primary, fontWeight: '700', lineHeight: 17 }}>
                    {fileName}
                  </Text>
                  <Text variant="micro" style={{ color: mine ? 'rgba(255,255,255,0.50)' : tk.text.secondary, marginTop: 3, letterSpacing: 0.4 }}>
                    {extLabel}
                  </Text>
                </View>
              </View>
              {/* Divider */}
              <View style={{ height: 1, backgroundColor: mine ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.07)', marginTop: 10, marginBottom: 8 }} />
              {/* Row 2: actions + time/receipt */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', gap: 18 }}>
                  <Pressable onPress={() => onAttachmentPress?.(message)}>
                    <Text variant="caption" style={{ color: actionColor, fontWeight: '700' }}>Abrir</Text>
                  </Pressable>
                  <Pressable onPress={() => onAttachmentDownload?.(message)}>
                    <Text variant="caption" style={{ color: actionColor, fontWeight: '700' }}>Baixar</Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {isPinned ? <Pin size={10} color={mine ? 'rgba(255,255,255,0.68)' : tk.brand.gold.primary} /> : null}
                  {isSaved ? <Star size={10} color={mine ? 'rgba(255,255,255,0.68)' : tk.brand.gold.primary} fill={mine ? 'rgba(255,255,255,0.68)' : tk.brand.gold.primary} /> : null}
                  {message.time ? (
                    <Text variant="micro" style={{ color: mine ? 'rgba(255,255,255,0.55)' : tk.text.tertiary, fontSize: 11 }}>
                      {message.time}
                    </Text>
                  ) : null}
                  {receiptIcon}
                </View>
              </View>
            </Pressable>
          );
        })() : null}

        {/* Message text */}
        {message.text ? (
          <TwemojiRichText
            text={message.text}
            color={mine ? '#FFFFFF' : tk.text.primary}
            fontSize={14}
            lineHeight={18}
          />
        ) : null}

          {/* Footer: pin, save, time, receipt */}
          {!isAudioOnly && !isDocumentOnly ? (
            <View
              className="flex-row items-center justify-end gap-1.5"
              style={{
                paddingRight: isMediaAttachment ? (mine ? 4 : 10) : 0,
                marginTop: isMediaAttachment ? 8 : 4,
              }}
            >
              {isPinned ? (
                <Pin size={10} color={mine ? 'rgba(255,255,255,0.68)' : tk.brand.gold.primary} />
              ) : null}
              {isSaved ? (
                <Star size={10} color={mine ? 'rgba(255,255,255,0.68)' : tk.brand.gold.primary} fill={mine ? 'rgba(255,255,255,0.68)' : tk.brand.gold.primary} />
              ) : null}
              {message.time ? (
                <Text
                  variant="micro"
                  style={{ color: mine ? 'rgba(255,255,255,0.55)' : tk.text.tertiary, lineHeight: 14 }}
                >
                  {message.time}
                </Text>
              ) : null}
              {receiptIcon}
            </View>
          ) : null}
        </View>

        {hasReactionBadge ? (
          <Pressable
            onPress={() => firstReaction && onReactionPress?.(firstReaction.emoji)}
            className="absolute flex-row items-center"
            style={{
              left: 6,
              right: undefined,
              bottom: -11,
              backgroundColor: theme === 'dark' ? '#2A2A2A' : '#FFFFFF',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme === 'dark' ? '#3A3A3A' : '#E5E7EB',
              paddingHorizontal: 5,
              paddingVertical: 2,
              gap: 3,
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 2,
              shadowOffset: { width: 0, height: 1 },
              elevation: 3,
            }}
          >
            {firstReaction?.emoji ? <Twemoji emoji={firstReaction.emoji} size={14} /> : null}
            {(firstReaction?.count ?? 0) > 1 ? (
              <Text variant="micro" style={{ color: theme === 'dark' ? '#D1D5DB' : '#374151', fontSize: 11, lineHeight: 14 }} className="font-semibold">
                {firstReaction?.count}
              </Text>
            ) : null}
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}
