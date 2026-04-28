import { useState } from 'react';
import { Camera, Mic, Paperclip, Send, Smile, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { getChatTokens } from '@/src/lib/chatTokens';

type ComposerBarProps = {
  text: string;
  placeholder: string;
  replyTo?: string | null;
  replySender?: string | null;
  replyLabel?: string;
  isSending?: boolean;
  isRecording?: boolean;
  recordingDuration?: number;
  bottomInset: number;
  onChangeText: (value: string) => void;
  onSend: () => void;
  onAddAttachment: () => void;
  onPickImage: () => void;
  onOpenEmoji: () => void;
  onCancelReply: () => void;
  onStartRecording: () => void;
  onStopRecording: (cancelled: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

function formatSeconds(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

const BTN = 36;
const PILL_H = 40; // pill min-height
const INPUT_MIN_H = 20;
const INPUT_MAX_H = 140;
const INPUT_VERTICAL_PAD = 6;


export function ComposerBar({
  text,
  placeholder,
  replyTo,
  replySender,
  replyLabel = 'Respondendo',
  isSending = false,
  isRecording = false,
  recordingDuration = 0,
  bottomInset,
  onChangeText,
  onSend,
  onAddAttachment,
  onPickImage,
  onOpenEmoji,
  onCancelReply,
  onStartRecording,
  onStopRecording,
  onFocus,
  onBlur,
}: ComposerBarProps) {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(INPUT_MIN_H);
  const theme = useAppColorScheme();
  const tk = getChatTokens(theme);
  const hasText = text.trim().length > 0;
  const canSend = (hasText || isRecording) && !isSending;

  function handleComposerChange(value: string) {
    if (value.length < text.length) {
      setInputHeight(INPUT_MIN_H);
    }
    onChangeText(value);
    if (value.length === 0) {
      setInputHeight(INPUT_MIN_H);
    }
  }

  return (
    <View
      className="absolute left-0 right-0 bottom-0 border-t"
      style={{
        paddingHorizontal: 10,
        paddingTop: 7,
        paddingBottom: Math.max(bottomInset, 8),
        borderTopColor: tk.borderHeader,
        backgroundColor: tk.surfaceComposer,
      }}
    >
      {/* ── Reply preview ── */}
      {replyTo ? (
        <View
          className="mb-2 rounded-xl border flex-row items-center overflow-hidden"
          style={{ borderColor: tk.borderInput, backgroundColor: tk.surfaceReply }}
        >
          <View className="w-[3px] self-stretch" style={{ backgroundColor: tk.brand.green.primary }} />
          <View className="flex-1 px-3 py-1.5">
            <Text variant="micro" style={{ color: tk.onlineText }} className="font-bold mb-[1px]">
              {replySender ? `${replyLabel} ${replySender}` : replyLabel}
            </Text>
            <Text variant="micro" style={{ color: tk.text.secondary }} numberOfLines={1}>
              {replyTo}
            </Text>
          </View>
          <Pressable accessibilityRole="button" hitSlop={12} onPress={onCancelReply} className="pr-3">
            <X size={14} color={tk.closeIcon} />
          </Pressable>
        </View>
      ) : null}

      {/* ── Main row: [🎤 left] [pill] [send right] ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>

        {/* ── LEFT: Mic button (recording → cancel) ── */}
        {isRecording ? (
          <Pressable
            onPress={() => onStopRecording(true)}
            accessibilityRole="button"
            accessibilityLabel="Cancelar gravação"
            style={{
              width: BTN,
              height: BTN,
              borderRadius: BTN / 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FF3B30',
            }}
          >
            <X size={20} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        ) : (
          <Pressable
            onPress={onStartRecording}
            onLongPress={onStartRecording}
            delayLongPress={200}
            accessibilityRole="button"
            accessibilityLabel="Segure para gravar áudio"
            style={{
              width: BTN,
              height: BTN,
              borderRadius: BTN / 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: tk.sendActiveBg,
            }}
          >
            <Mic size={20} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
        )}

        {/* ── CENTER: Pill [😊 | input | 📎 | 📷] ── */}
        <View
          style={{
            flex: 1,
            minHeight: PILL_H,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: isRecording ? '#FF3B30' : tk.borderInput,
            backgroundColor: tk.surfaceInput,
            flexDirection: 'row',
            alignItems: 'center',      // sempre centrado, ícones e texto no meio
            overflow: 'hidden',
          }}
        >
          {/* Emoji */}
          <Pressable
            onPress={onOpenEmoji}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Abrir emoji"
            style={{ paddingHorizontal: 11 }}
          >
            <Smile size={20} color={tk.placeholderColor} strokeWidth={1.8} />
          </Pressable>

          {/* Recording indicator OR text input */}
          {isRecording ? (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF3B30' }} />
              <Text style={{ color: '#FF3B30', fontSize: 14, fontWeight: '600' }}>
                {formatSeconds(recordingDuration)}
              </Text>
              <Text style={{ color: tk.placeholderColor, fontSize: 12 }}>
                Gravando...
              </Text>
            </View>
          ) : (
            <View style={{ flexGrow: 1, flexShrink: 1, minHeight: PILL_H, justifyContent: 'center', position: 'relative', paddingVertical: INPUT_VERTICAL_PAD }}>
              {!hasText && !isInputFocused ? (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    variant="body"
                    style={{
                      color: tk.placeholderColor,
                      fontSize: 14,
                      lineHeight: 18,
                    }}
                    numberOfLines={1}
                  >
                    {placeholder}
                  </Text>
                </View>
              ) : null}
              <TextInput
                value={text}
                onChangeText={handleComposerChange}
                placeholder=""
                placeholderTextColor={tk.placeholderColor}
                multiline
                scrollEnabled={false}
                maxLength={2000}
                onContentSizeChange={(event) => {
                  const nextHeight = Math.max(INPUT_MIN_H, Math.min(INPUT_MAX_H, event.nativeEvent.contentSize.height));
                  if (Math.abs(nextHeight - inputHeight) > 1) {
                    setInputHeight(nextHeight);
                  }
                }}
                onFocus={() => {
                  setIsInputFocused(true);
                  onFocus?.();
                }}
                onBlur={() => {
                  setIsInputFocused(false);
                  onBlur?.();
                }}
                style={{
                  color: tk.inputText,
                  fontSize: 14,
                  lineHeight: 20,
                  height: inputHeight,
                  maxHeight: INPUT_MAX_H,
                  paddingTop: 0,
                  paddingBottom: 0,
                  paddingVertical: 0,
                  paddingRight: 0,
                  includeFontPadding: true,
                  textAlignVertical: 'top',
                }}
              />
            </View>
          )}

          {/* Right icons inside pill */}
          {isRecording ? null : (
            <>
              <Pressable
                onPress={onAddAttachment}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Anexar arquivo"
                style={{ paddingHorizontal: 9 }}
              >
                <Paperclip size={19} color={tk.placeholderColor} strokeWidth={1.8} />
              </Pressable>

              <Pressable
                onPress={onPickImage}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Enviar imagem"
                style={{ paddingHorizontal: 11 }}
              >
                <Camera size={20} color={tk.placeholderColor} strokeWidth={1.8} />
              </Pressable>
            </>
          )}
        </View>

        {/* ── RIGHT: Send button ── */}
        <Pressable
          onPress={isRecording ? () => onStopRecording(false) : onSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel={isRecording ? 'Enviar áudio' : 'Enviar mensagem'}
          style={{
            width: BTN,
            height: BTN,
            borderRadius: BTN / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: canSend ? tk.sendActiveBg : tk.sendInactiveBg,
          }}
        >
          <Send size={17} color="#FFFFFF" strokeWidth={2} />
        </Pressable>

      </View>
    </View>
  );
}
