import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#020617' },
      }}
    />
  );
}
