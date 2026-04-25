import { View } from 'react-native';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { Text } from '@/src/components/ui';

import type { ChatMessage } from './data';

type ChatBubbleProps = {
  message: ChatMessage;
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const theme = useAppColorScheme();

  if (message.kind === 'system') {
    return (
      <View className="self-center rounded-full border px-3.5 py-1.5 my-1" style={{ borderColor: 'rgba(212,161,58,0.35)', backgroundColor: 'rgba(212,161,58,0.14)' }}>
        <Text variant="micro" className="text-gold-700 dark:text-goldA font-semibold">
          {message.text}
        </Text>
      </View>
    );
  }

  if (message.kind === 'typing') {
    return (
      <View
        className="self-start rounded-[14px] rounded-tl-[4px] px-3.5 py-2 flex-row items-center gap-1.5 mt-1"
        style={{ backgroundColor: theme === 'light' ? '#E9EFF8' : 'rgba(255,255,255,0.05)' }}
      >
        <Text variant="micro" className="text-gold-700 dark:text-goldA font-bold mr-1">
          {message.author}
        </Text>
        <View className="h-[6px] w-[6px] rounded-full" style={{ backgroundColor: theme === 'light' ? '#8FA1B9' : 'rgba(255,255,255,0.45)' }} />
        <View className="h-[6px] w-[6px] rounded-full" style={{ backgroundColor: theme === 'light' ? '#8FA1B9' : 'rgba(255,255,255,0.45)' }} />
        <View className="h-[6px] w-[6px] rounded-full" style={{ backgroundColor: theme === 'light' ? '#8FA1B9' : 'rgba(255,255,255,0.45)' }} />
      </View>
    );
  }

  const mine = message.kind === 'me';

  return (
    <View
      className={`max-w-[78%] rounded-[14px] px-3 py-2 ${mine ? 'self-end rounded-tr-[4px]' : 'self-start rounded-tl-[4px]'}`}
      style={{ backgroundColor: mine ? '#0A6E3D' : theme === 'light' ? '#E9EFF8' : '#141C2E' }}
    >
      {!mine && message.author ? (
        <Text variant="micro" className="text-gold-700 dark:text-goldA font-bold tracking-[0.5px] mb-[2px]">
          {message.author}
          {message.role ? ` - ${message.role}` : ''}
        </Text>
      ) : null}

      <Text variant="caption" className={mine ? 'text-white' : 'text-gray-900 dark:text-white'} style={{ lineHeight: 18 }}>
        {message.text}
      </Text>

      {message.time ? (
        <Text variant="micro" className={`mt-1 text-right ${mine ? 'text-white/55' : 'text-gray-500 dark:text-fg4'}`}>
          {mine ? `${message.time} OK` : message.time}
        </Text>
      ) : null}
    </View>
  );
}
