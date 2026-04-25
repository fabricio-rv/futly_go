import { ScrollView, View } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, Star, Zap } from 'lucide-react-native';

import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { Button, Pill, Text } from '@/src/components/ui';

export default function PlanScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-ink-0">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubTopNav title="Plano e Pagamento" subtitle="SEU PLANO ATUAL" />

        {/* Current Plan */}
        <View className="mx-[18px] mt-6">
          <View className="rounded-[18px] border-2 border-goldB bg-gradient-to-b from-[#3A2A0B] to-[#1A0F04] p-[18px] mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <Star size={24} color="#D4A13A" strokeWidth={2} />
              <Text variant="title" className="font-bold text-white">
                Plano Gold
              </Text>
            </View>

            <Text variant="body" className="text-gray-400 dark:text-fg3 mb-4">
              Você está no nosso plano premium com todos os benefícios exclusivos.
            </Text>

            <View className="rounded-[12px] bg-black/20 px-3 py-2 mb-4">
              <Text variant="label" className="text-goldA font-semibold">
                Renova em 10/05/2026
              </Text>
            </View>

            <Button label="Gerenciar plano" variant="ghost" disabled />
          </View>

          {/* Benefits */}
          <Text variant="label" className="font-bold text-gray-900 dark:text-white mb-3">
            Benefícios do Gold
          </Text>

          <View className="gap-3 mb-6">
            <View className="flex-row items-center gap-3 rounded-[12px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] px-3 py-3">
              <CheckCircle size={20} color="#22B76C" strokeWidth={2} />
              <View className="flex-1">
                <Text variant="label" className="font-semibold text-gray-900 dark:text-white">
                  Partidas ilimitadas
                </Text>
                <Text variant="caption" className="text-gray-600 dark:text-fg3">
                  Crie e participe de quantas partidas quiser
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 rounded-[12px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] px-3 py-3">
              <CheckCircle size={20} color="#22B76C" strokeWidth={2} />
              <View className="flex-1">
                <Text variant="label" className="font-semibold text-gray-900 dark:text-white">
                  Filtros avançados
                </Text>
                <Text variant="caption" className="text-gray-600 dark:text-fg3">
                  Busque partidas por nível, horário e localização
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 rounded-[12px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] px-3 py-3">
              <CheckCircle size={20} color="#22B76C" strokeWidth={2} />
              <View className="flex-1">
                <Text variant="label" className="font-semibold text-gray-900 dark:text-white">
                  Prioridade no chat
                </Text>
                <Text variant="caption" className="text-gray-600 dark:text-fg3">
                  Suas mensagens aparecem em destaque
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 rounded-[12px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] px-3 py-3">
              <CheckCircle size={20} color="#22B76C" strokeWidth={2} />
              <View className="flex-1">
                <Text variant="label" className="font-semibold text-gray-900 dark:text-white">
                  Perfil verificado
                </Text>
                <Text variant="caption" className="text-gray-600 dark:text-fg3">
                  Seu perfil recebe o badge de verificação
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 rounded-[12px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] px-3 py-3">
              <CheckCircle size={20} color="#22B76C" strokeWidth={2} />
              <View className="flex-1">
                <Text variant="label" className="font-semibold text-gray-900 dark:text-white">
                  Sem anúncios
                </Text>
                <Text variant="caption" className="text-gray-600 dark:text-fg3">
                  Aproveite a experiência sem distrações
                </Text>
              </View>
            </View>
          </View>

          {/* Other Plans */}
          <View className="rounded-[18px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] p-[18px] mb-4">
            <Text variant="label" className="font-bold text-gray-900 dark:text-white mb-4">
              Explorar outros planos
            </Text>

            <View className="gap-3">
              <View className="rounded-[12px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0A0F1C] px-3 py-3">
                <View className="flex-row items-center justify-between">
                  <Text variant="label" className="font-semibold text-gray-900 dark:text-white">
                    Plano Gratuito
                  </Text>
                  <Pill tone="default" label="Ativo" className="px-2" />
                </View>
                <Text variant="caption" className="text-gray-600 dark:text-fg3 mt-1">
                  Funcionalidades básicas - R$ 0,00/mês
                </Text>
              </View>

              <View className="rounded-[12px] border border-gold-500 bg-white dark:bg-[#0A0F1C] px-3 py-3 border-2">
                <View className="flex-row items-center justify-between">
                  <Text variant="label" className="font-semibold text-gray-900 dark:text-white">
                    Plano Gold
                  </Text>
                  <Pill tone="gold" label="Seu plano" className="px-2" />
                </View>
                <Text variant="caption" className="text-gray-600 dark:text-fg3 mt-1">
                  Plano premium - R$ 19,90/mês
                </Text>
              </View>

              <View className="rounded-[12px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0A0F1C] px-3 py-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text variant="label" className="font-semibold text-gray-900 dark:text-white">
                        Plano Elite
                      </Text>
                      <Zap size={14} color="#FF8B7A" />
                    </View>
                  </View>
                  <Pill tone="sky" label="Em breve" className="px-2" />
                </View>
                <Text variant="caption" className="text-gray-600 dark:text-fg3 mt-1">
                  Plano exclusivo - R$ 49,90/mês
                </Text>
              </View>
            </View>
          </View>

          <View className="rounded-[18px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] p-[18px] mb-4">
            <Text variant="label" className="font-bold text-gray-900 dark:text-white mb-2">
              Tem dúvidas sobre os planos?
            </Text>
            <Text variant="caption" className="text-gray-600 dark:text-fg3 mb-4">
              Consulte nossa central de ajuda ou fale com o suporte para mais informações.
            </Text>
          </View>
        </View>
      </ScrollView>

      <MatchBottomNav active="none" />
    </SafeAreaView>
  );
}
