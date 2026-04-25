import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type PressableStateCallbackType, type StyleProp, type ViewStyle } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type IconButtonProps = Omit<PressableProps, 'children'> & {
  icon: ReactNode;
  size?: number;
  className?: string;
};

export function IconButton({ icon, size = 40, className, style, ...rest }: IconButtonProps) {
  const theme = useAppColorScheme();

  const baseStyle: ViewStyle = {
    width: size,
    height: size,
    borderColor: theme === 'light' ? '#D6DFEB' : 'rgba(255,255,255,0.10)',
    backgroundColor: theme === 'light' ? '#EEF3FA' : 'rgba(255,255,255,0.05)',
  };

  const mergedStyle = (state: PressableStateCallbackType): StyleProp<ViewStyle> => {
    const resolved = typeof style === 'function' ? style(state) : style;
    return [baseStyle, resolved as StyleProp<ViewStyle>];
  };

  return (
    <Pressable
      accessibilityRole="button"
      className={`items-center justify-center rounded-[14px] border ${className ?? ''}`.trim()}
      style={mergedStyle}
      {...rest}
    >
      {icon}
    </Pressable>
  );
}
