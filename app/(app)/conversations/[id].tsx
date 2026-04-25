import { useLocalSearchParams } from 'expo-router';
import { ChevronLeft, MoreVertical, Plus, Send, Smile, Star } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ChatBubble,
  ChatContextBanner,
  getConversationDetail,
} from '@/src/components/features/store';
import { IconButton, Text } from '@/src/components/ui';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ConversationDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const detail = getConversationDetail(params.id ?? 'arena-central-quinta');

  return (
    <SafeAreaView className="flex-1 bg-ink-0">
      <View className="border-b border-line bg-ink-0/95">
        <View className="px-3 pb-2 pt-1 flex-row items-center gap-2">
          <IconButton
            icon={<ChevronLeft size={18} color="#FFFFFF" />}
            onPress={() => {
              if (typeof router.canGoBack === 'function' && router.canGoBack()) {
                router.back();
                return;
              }
              router.replace('/(app)/conversations');
            }}
          />

          <View className="flex-1 flex-row items-center gap-2">
            <LinearGradient
              colors={['#0F3A24', '#072314']}
              className="h-9 w-9 rounded-full border border-ok items-center justify-center"
            >
              <Text variant="label" className="font-bold text-white">
                {detail.avatar}
              </Text>
            </LinearGradient>

            <View className="flex-1">
              <View className="flex-row items-center gap-1">
                <Text variant="label" className="font-semibold text-white">
                  {detail.title}
                </Text>
                <Star size={11} color="#D4A13A" fill="#D4A13A" strokeWidth={1.6} />
              </View>
              <Text variant="micro" className="text-[#86E5B4] mt-[1px]">
                {detail.subtitle}
              </Text>
            </View>
          </View>

          <IconButton icon={<MoreVertical size={16} color="#FFFFFF" />} />
        </View>
      </View>

      <ChatContextBanner title={detail.bannerTitle} subtitle={detail.bannerSubtitle} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 112 + insets.bottom }}
      >
        <View className="self-center rounded-full bg-white/5 px-3 py-1 mb-3 mt-1">
          <Text variant="micro" className="uppercase tracking-[1.6px] text-fg3 font-bold">
            Hoje
          </Text>
        </View>

        <View className="gap-1">
          {detail.messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </View>
      </ScrollView>

      <View
        className="absolute left-0 right-0 bottom-0 border-t border-line bg-surf1/95 px-[14px] pt-3 flex-row items-end gap-2"
        style={{ paddingBottom: Math.max(insets.bottom, 14) }}
      >
        <IconButton
          icon={<Plus size={18} color="#86E5B4" strokeWidth={2.3} />}
          size={36}
          className="rounded-full border-[#22B76C4D] bg-[#22B76C24]"
        />

        <View className="flex-1 min-h-11 rounded-full border border-line2 bg-[#0C111E] px-[14px] py-[11px] flex-row items-center gap-2">
          <Text variant="caption" className="flex-1 text-fg3">
            Mensagem...
          </Text>
          <Smile size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />
        </View>

        <IconButton
          icon={<Send size={18} color="#05070B" strokeWidth={2.4} />}
          size={44}
          className="rounded-full border-ok bg-ok"
        />
      </View>
    </SafeAreaView>
  );
}
