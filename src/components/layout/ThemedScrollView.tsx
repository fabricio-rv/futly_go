import { ScrollView, type ScrollViewProps } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type ThemedScrollViewProps = ScrollViewProps & {
  children?: React.ReactNode;
};

export function ThemedScrollView({ children, style, ...props }: ThemedScrollViewProps) {
  const theme = useAppColorScheme();
  const backgroundColor = theme === 'light' ? '#F1F5F9' : '#020617';

  return (
    <ScrollView
      {...props}
      bounces={props.bounces ?? true}
      overScrollMode={props.overScrollMode ?? 'always'}
      contentInsetAdjustmentBehavior={props.contentInsetAdjustmentBehavior ?? 'automatic'}
      style={[{ backgroundColor }, style]}
    >
      {children}
    </ScrollView>
  );
}
