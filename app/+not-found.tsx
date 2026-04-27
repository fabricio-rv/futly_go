import { Link, Stack } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Ops' }} />
      <SafeAreaView className="flex-1 bg-bg">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-3 text-center text-2xl font-geistBold text-white">Essa tela não existe.</Text>
          <Text className="mb-6 text-center text-sm text-fg3">
            Verifique o endereco ou volte para o inicio do Futly Go.
          </Text>
          <Link asChild href="/(app)">
            <Pressable className="h-12 items-center justify-center rounded-[14px] bg-ok px-6">
              <Text className="text-sm font-geistBold text-bg">Voltar para o inicio</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}
