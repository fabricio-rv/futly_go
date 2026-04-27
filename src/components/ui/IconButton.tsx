import type { ReactNode } from 'react';
import type { PressableProps, PressableStateCallbackType, StyleProp, ViewStyle } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { TouchableScale } from './TouchableScale';

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
    <TouchableScale
      accessibilityRole="button"
      className={`items-center justify-center rounded-[14px] border ${className ?? ''}`.trim()}
      style={mergedStyle({ pressed: false })}
      {...rest}
    >
      {icon}
    </TouchableScale>
  );
}
