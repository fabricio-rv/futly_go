import { View, type ViewProps } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type ThemeWrapperProps = ViewProps & {
  children: React.ReactNode;
  lightClassName?: string;
  darkClassName?: string;
};

export function ThemeWrapper({
  children,
  lightClassName = '',
  darkClassName = '',
  ...rest
}: ThemeWrapperProps) {
  const colorScheme = useAppColorScheme();
  const className = colorScheme === 'light' ? lightClassName : darkClassName;

  return (
    <View className={className} {...rest}>
      {children}
    </View>
  );
}
