import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { getChatTokens } from '@/src/lib/chatTokens';

type TypingIndicatorProps = {
  names: string[];
};

function AnimatedDot({ color, delay }: { color: string; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: -4, duration: 280, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.delay(600 - delay),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  return (
    <Animated.View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: color,
        transform: [{ translateY: anim }],
      }}
    />
  );
}

export function TypingIndicator({ names }: TypingIndicatorProps) {
  const theme = useAppColorScheme();
  const tk = getChatTokens(theme);

  if (names.length === 0) return null;

  const label = names.length === 1 ? names[0] : `${names[0]} +${names.length - 1}`;

  return (
    <View
      className="self-start rounded-[14px] rounded-tl-[4px] px-3.5 py-2 flex-row items-center gap-1.5 mt-1 mb-1"
      style={{ backgroundColor: tk.typingBubbleBg }}
    >
      <Text variant="micro" style={{ color: tk.brand.gold.primary }} className="font-bold mr-1">
        {label}
      </Text>
      <AnimatedDot color={tk.typingDot} delay={0} />
      <AnimatedDot color={tk.typingDot} delay={160} />
      <AnimatedDot color={tk.typingDot} delay={320} />
    </View>
  );
}
