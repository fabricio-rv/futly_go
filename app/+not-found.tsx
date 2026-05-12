import { Link, Stack } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from '@/src/i18n/hooks/useTranslation';

export default function NotFoundScreen() {
  const { t } = useTranslation('common');

  return (
    <>
      <Stack.Screen options={{ title: t('notFound.title', 'Ops') }} />
      <SafeAreaView className="flex-1 bg-bg">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-3 text-center text-2xl font-geistBold text-white">{t('notFound.message', 'Essa tela não existe.')}</Text>
          <Text className="mb-6 text-center text-sm text-fg3">
            {t('notFound.description', 'Verifique o endereco ou volte para o inicio do Futly Go.')}
          </Text>
          <Link asChild href="/(app)">
            <Pressable className="h-12 items-center justify-center rounded-[14px] bg-ok px-6">
              <Text className="text-sm font-geistBold text-bg">{t('notFound.backHome', 'Voltar para o inicio')}</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}
