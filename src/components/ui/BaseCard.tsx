import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { MotiView } from 'moti';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { TouchableScale } from './TouchableScale';

type BaseCardProps = PropsWithChildren<
  ViewProps & {
    className?: string;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    disableHaptics?: boolean;
    animateIn?: boolean;
    delayMs?: number;
  }
>;

const PREMIUM_SHADOW: ViewStyle = {
  shadowColor: '#020617',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.12,
  shadowRadius: 24,
  elevation: 6,
};

export function BaseCard({
  children,
  className,
  style,
  onPress,
  disableHaptics,
  animateIn = true,
  delayMs = 0,
  ...rest
}: BaseCardProps) {
  const theme = useAppColorScheme();

  const content = (
    <MotiView
      from={animateIn ? { opacity: 0, translateY: 16 } : undefined}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 260, delay: delayMs }}
    >
      <View
        className={`rounded-[20px] border p-4 ${className ?? ''}`.trim()}
        style={[
          {
            backgroundColor: theme === 'light' ? '#F8FAFC' : '#0F172A',
            borderColor: theme === 'light' ? '#CBD5E1' : 'rgba(148,163,184,0.24)',
          },
          PREMIUM_SHADOW,
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    </MotiView>
  );

  if (onPress) {
    return (
      <TouchableScale onPress={onPress} disableHaptics={disableHaptics} className="rounded-[20px]">
        {content}
      </TouchableScale>
    );
  }

  return content;
}
