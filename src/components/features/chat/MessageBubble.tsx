import { Check, CheckCheck, CornerUpLeft, FileText, Forward, Pause, Pin, Play, Star } from 'lucide-react-native';
import { Image, Pressable, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { getChatTokens } from '@/src/lib/chatTokens';
import { Text } from '@/src/components/ui';
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
  onLongPress?: (message: ChatMessage) => void;
  onReactionPress?: (emoji: string) => void;
  onToggleSelect?: (messageId: string) => void;
  onAttachmentPress?: (message: ChatMessage) => void;
  onAttachmentDownload?: (message: ChatMessage) => void;
};

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
}: MessageBubbleProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioDurationMs, setAudioDurationMs] = useState(0);
  const [audioPositionMs, setAudioPositionMs] = useState(0);
  const [probedDurationMs, setProbedDurationMs] = useState(0);
  const theme = useAppColorScheme();
  const tk = getChatTokens(theme);

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

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        void soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let active = true;
    const probe = async () => {
      if (!message.attachment?.url || message.attachment.kind !== 'audio') return;
      if (message.attachment.durationSec && message.attachment.durationSec > 0) {
        setProbedDurationMs(message.attachment.durationSec * 1000);
        return;
      }
      try {
        const { sound, status } = await Audio.Sound.createAsync(
          { uri: message.attachment.url },
          { shouldPlay: false },
        );
        if (active && status.isLoaded) {
          setProbedDurationMs(status.durationMillis ?? 0);
        }
        await sound.unloadAsync();
      } catch {
        if (active) setProbedDurationMs(0);
      }
    };
    void probe();
    return () => { active = false; };
  }, [message.attachment?.id, message.attachment?.kind, message.attachment?.url, message.attachment?.durationSec]);

  const toggleAudioPlayback = async () => {
    if (!message.attachment?.url || message.attachment.kind !== 'audio') return;
    if (!soundRef.current) {
      const { sound } = await Audio.Sound.createAsync(
        { uri: message.attachment.url },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          setIsPlayingAudio(status.isPlaying);
          setAudioDurationMs(status.durationMillis ?? 0);
          setAudioPositionMs(status.positionMillis ?? 0);
        },
      );
      soundRef.current = sound;
      return;
    }

    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const formatAudioTime = (ms: number) => {
    const total = Math.max(0, Math.round(ms / 1000));
    const min = Math.floor(total / 60).toString().padStart(1, '0');
    const sec = (total % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={() => !selectMode && onLongPress?.(message)}
      delayLongPress={260}
      className={`flex-row items-end gap-2 mb-[7px] ${mine ? 'flex-row-reverse' : 'flex-row'}`}
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

      <View
        className={`max-w-[82%] rounded-[16px] ${(isAudioOnly || isDocumentOnly) ? 'px-0 py-0 border-0' : `px-3 py-2 border ${mine ? 'rounded-tr-[4px]' : 'rounded-tl-[4px]'}`}`}
        style={{
          backgroundColor: (isAudioOnly || isDocumentOnly) ? (mine ? tk.bubbleOwnBg : tk.bubbleThemBg) : (mine ? tk.bubbleOwnBg : tk.bubbleThemBg),
          borderColor: (isAudioOnly || isDocumentOnly) ? 'transparent' : (mine ? tk.bubbleOwnBorder : tk.bubbleThemBorder),
          opacity: isSelected ? 0.85 : 1,
        }}
      >
        {/* Group sender name */}
        {showSenderName && !mine && message.author ? (
          <Text
            variant="micro"
            numberOfLines={1}
            style={{ color: tk.brand.gold.primary }}
            className="font-bold mb-[2px]"
          >
            {message.author}
            {message.role ? ` · ${message.role}` : ''}
          </Text>
        ) : null}

        {/* Forwarded badge */}
        {isForwarded ? (
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
            className="mb-1.5 rounded-[8px] border-l-2 px-2 py-1"
            style={{
              borderLeftColor: mine ? tk.replyOwnBorder : tk.replyThemBorder,
              backgroundColor: mine ? tk.replyOwnBg : tk.replyThemBg,
            }}
          >
            <View className="flex-row items-center gap-1">
              <CornerUpLeft size={10} color={mine ? tk.replyArrowOwn : tk.replyArrowThem} />
              <Text
                variant="micro"
                numberOfLines={1}
                style={{ color: mine ? tk.replyTextOwn : tk.replyTextThem }}
              >
                {message.replyTo}
              </Text>
            </View>
          </View>
        ) : null}

        {(message.attachment?.kind === 'image' || message.attachment?.kind === 'video') && message.attachment.url ? (
          <Pressable onPress={() => onAttachmentPress?.(message)}>
            {message.attachment.kind === 'image' ? (
              <View
                style={{
                  width: 330,
                  height: 420,
                  borderRadius: 10,
                  marginBottom: message.text ? 6 : 0,
                  backgroundColor: mine ? 'rgba(0,0,0,0.15)' : '#0b1220',
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={{ uri: message.attachment.url }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <Video
                source={{ uri: message.attachment.url }}
                style={{ width: 330, height: 420, borderRadius: 10, marginBottom: message.text ? 6 : 0 }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping={false}
              />
            )}
          </Pressable>
        ) : null}

        {message.attachment?.kind === 'audio' ? (
          <Pressable
            onPress={toggleAudioPlayback}
            className="rounded-2xl px-3 py-2 mb-0"
            style={{ backgroundColor: mine ? tk.bubbleOwnBg : tk.bubbleThemBg }}
          >
            {/* Top row: avatar + centered play + waves */}
            <View
              className="flex-row items-center gap-2"
              style={{ transform: [{ translateY: 6 }] }}
            >
              {message.avatarUrl ? (
                <Image source={{ uri: message.avatarUrl }} style={{ width: 50, height: 50, borderRadius: 25 }} resizeMode="cover" />
              ) : (
                <View className="h-12 w-12 rounded-full items-center justify-center" style={{ backgroundColor: mine ? 'rgba(255,255,255,0.2)' : '#0f766e' }}>
                  <Text variant="micro" style={{ color: '#fff', fontWeight: '800' }}>{(message.author ?? 'A').slice(0, 1).toUpperCase()}</Text>
                </View>
              )}
              <View style={{ width: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 10 }}>
                <Pressable onPress={toggleAudioPlayback} hitSlop={8}>
                  {isPlayingAudio ? (
                    <Pause size={18} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                  )}
                </Pressable>
              </View>
              <View style={{ width: 4 }} />
              <View style={{ flex: 1 }}>
                <View className="flex-row items-center" style={{ gap: 2 }}>
                  {Array.from({ length: 36 }).map((_, idx) => {
                    const progressMs = audioPositionMs;
                    const totalMs = audioDurationMs || probedDurationMs || ((message.attachment?.durationSec ?? 0) * 1000);
                    const playedRatio = totalMs > 0 ? progressMs / totalMs : 0;
                    const activeBar = idx / 36 <= playedRatio;
                    const barH = 4 + ((idx % 7) * 1.2);
                    return (
                      <View
                        key={`${message.id}-bar-${idx}`}
                        style={{
                          width: 2,
                          height: barH,
                          borderRadius: 1,
                          backgroundColor: activeBar ? '#60a5fa' : (mine ? 'rgba(255,255,255,0.35)' : '#67e8f9'),
                        }}
                      />
                    );
                  })}
                </View>
              </View>
            </View>
            <View className="mt-1.5 flex-row items-center justify-between">
              <Text
                variant="micro"
                style={{ color: mine ? 'rgba(255,255,255,0.88)' : tk.text.secondary, marginLeft: 95 }}
              >
                {formatAudioTime(audioDurationMs || probedDurationMs || ((message.attachment?.durationSec ?? 0) * 1000) || audioPositionMs)}
              </Text>
              <View className="flex-row items-center gap-1.5" style={{ marginTop: 10 }}>
                {message.time ? (
                  <Text variant="micro" style={{ color: mine ? 'rgba(255,255,255,0.72)' : tk.text.tertiary }}>
                    {message.time}
                  </Text>
                ) : null}
                {receiptIcon}
              </View>
            </View>
          </Pressable>
        ) : null}

        {message.attachment?.kind === 'document' ? (
          <Pressable
            onPress={() => onAttachmentPress?.(message)}
            className="rounded-xl overflow-hidden mb-0"
            style={{ backgroundColor: mine ? tk.bubbleOwnBg : tk.bubbleThemBg }}
          >
            <View className="px-3 py-2 flex-row items-center gap-2" style={{ backgroundColor: mine ? tk.bubbleOwnBg : tk.bubbleThemBg }}>
              <View className="h-8 w-8 rounded items-center justify-center" style={{ backgroundColor: '#e11d48' }}>
                <FileText size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="caption" numberOfLines={1} style={{ color: mine ? '#e5e7eb' : tk.text.primary, fontWeight: '700' }}>
                  {message.attachment.fileName ?? 'Documento.pdf'}
                </Text>
                <Text variant="micro" style={{ color: mine ? 'rgba(255,255,255,0.72)' : tk.text.secondary }}>
                  PDF
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5 self-end" style={{ marginBottom: -2 }}>
                {message.time ? (
                  <Text variant="micro" style={{ color: mine ? 'rgba(255,255,255,0.72)' : tk.text.tertiary }}>
                    {message.time}
                  </Text>
                ) : null}
                {receiptIcon}
              </View>
            </View>
            <View className="flex-row">
              <Pressable
                className="flex-1 py-2 items-center"
                style={{ borderTopWidth: 1, borderRightWidth: 1, borderColor: mine ? 'rgba(16,185,129,0.45)' : tk.border.primary }}
                onPress={() => onAttachmentPress?.(message)}
              >
                <Text variant="caption" style={{ color: '#22c55e', fontWeight: '700' }}>Abrir</Text>
              </Pressable>
              <Pressable
                className="flex-1 py-2 items-center"
                style={{ borderTopWidth: 1, borderColor: mine ? 'rgba(16,185,129,0.45)' : tk.border.primary }}
                onPress={() => onAttachmentDownload?.(message)}
              >
                <Text variant="caption" style={{ color: '#22c55e', fontWeight: '700' }}>Baixar</Text>
              </Pressable>
            </View>
          </Pressable>
        ) : null}

        {/* Message text */}
        {message.text ? (
          <Text
            variant="caption"
            style={{ lineHeight: 18, color: mine ? '#FFFFFF' : tk.text.primary }}
          >
            {message.text}
          </Text>
        ) : null}

        {/* Footer: pin, save, time, receipt */}
        {!isAudioOnly && !isDocumentOnly ? (
          <View className="mt-1 flex-row items-center justify-end gap-1.5">
            {isPinned ? (
              <Pin size={10} color={mine ? tk.brand.green.faint : tk.brand.gold.primary} />
            ) : null}
            {isSaved ? (
              <Star size={10} color={tk.brand.gold.primary} fill={tk.brand.gold.primary} />
            ) : null}
            {message.time ? (
              <Text
                variant="micro"
                style={{ color: mine ? 'rgba(255,255,255,0.55)' : tk.text.tertiary }}
              >
                {message.time}
              </Text>
            ) : null}
            {receiptIcon}
          </View>
        ) : null}

        {/* Reaction chips */}
        {reactions.length > 0 ? (
          <View className={`mt-1.5 flex-row flex-wrap gap-1 ${mine ? 'justify-end' : 'justify-start'}`}>
            {reactions.map((reaction) => (
              <Pressable
                key={reaction.emoji}
                className="rounded-full border px-2 py-0.5 flex-row items-center gap-1"
                style={{
                  borderColor: reaction.reactedByMe
                    ? tk.reactionActiveBorder
                    : tk.reactionInactiveBorder,
                  backgroundColor: reaction.reactedByMe
                    ? tk.reactionActiveBg
                    : mine
                      ? tk.reactionOwnInactiveBg
                      : tk.reactionThemInactiveBg,
                }}
                onPress={() => onReactionPress?.(reaction.emoji)}
              >
                <Text
                  variant="micro"
                  style={{ color: mine ? '#FFFFFF' : tk.text.primary }}
                >
                  {reaction.emoji} {reaction.count}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
