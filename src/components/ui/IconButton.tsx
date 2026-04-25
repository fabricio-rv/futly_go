import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

type IconButtonProps = Omit<PressableProps, 'children'> & {
  icon: ReactNode;
  size?: number;
  className?: string;
};

export function IconButton({ icon, size = 40, className, ...rest }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`items-center justify-center rounded-[14px] border border-gray-200 dark:border-line2 bg-gray-100 dark:bg-white/5 ${className ?? ''}`.trim()}
      style={{ width: size, height: size }}
      {...rest}
    >
      {icon}
    </Pressable>
  );
}
