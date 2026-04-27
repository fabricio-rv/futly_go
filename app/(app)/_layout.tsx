import { Stack } from 'expo-router';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

export default function AppLayout() {
  const theme = useAppColorScheme();

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme === 'light' ? '#F1F5F9' : '#020617' },
      }}
    />
  );
}
