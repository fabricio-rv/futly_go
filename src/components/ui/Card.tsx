import type { PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type CardProps = PropsWithChildren<ViewProps & { className?: string }>;

export function Card({ children, className, ...rest }: CardProps) {
  const theme = useAppColorScheme();
  const mergedStyle = Array.isArray(rest.style) ? rest.style : rest.style ? [rest.style] : [];

  return (
    <View
      className={`border rounded-lg p-4 shadow-card ${className ?? ''}`.trim()}
      style={[
        {
          backgroundColor: theme === 'light' ? '#FFFFFF' : '#101626',
          borderColor: theme === 'light' ? '#D9E1EC' : '#1F2A44',
        },
        ...mergedStyle,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
