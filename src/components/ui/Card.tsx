import type { PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';

type CardProps = PropsWithChildren<ViewProps & { className?: string }>;

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <View
      className={`bg-ink-2 border border-ink-hairline rounded-lg p-4 shadow-card ${className ?? ''}`.trim()}
      {...rest}
    >
      {children}
    </View>
  );
}
