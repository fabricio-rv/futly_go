import { ScrollView, type ScrollViewProps } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type ThemedScrollViewProps = ScrollViewProps & {
  children?: React.ReactNode;
};

export function ThemedScrollView({ children, style, ...props }: ThemedScrollViewProps) {
  const theme = useAppColorScheme();
  const backgroundColor = theme === 'light' ? '#F4F6F9' : '#05070B';

  return (
    <ScrollView
      {...props}
      style={[{ backgroundColor }, style]}
    >
      {children}
    </ScrollView>
  );
}
