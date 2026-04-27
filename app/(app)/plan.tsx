import { ScrollView, View } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, Star, Zap } from 'lucide-react-native';

import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { Button, Pill, Text } from '@/src/components/ui';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

export default function PlanScreen() {
  const { t } = useTranslation('store');
  const theme = useAppColorScheme();
  const bgColor = theme === 'light' ? '#F4F6F9' : '#05070B';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubTopNav title={t('plan.title', 'Plano e Pagamento')} subtitle={t('currentPlan', 'SEU PLANO ATUAL')} />

        {/* Current Plan */}
        <View className="mx-[18px] mt-6">
          <View className="rounded-[18px] border-2 border-goldB dark:bg-gradient-to-b dark:from-[#3A2A0B] dark:to-[#1A0F04] p-[18px] mb-6 bg-[#FFFBF0]">
            <View className="flex-row items-center gap-2 mb-3">
              <Star size={24} color="#D4A13A" strokeWidth={2} />
              <Text variant="title" className="font-bold text-white dark:text-white" style={{ color: theme === 'light' ? '#111827' : '#FFFFFF' }}>
                {t('plans.gold.name', 'Plano Gold')}
              </Text>
            </View>

            <Text variant="body" className="text-[#9CA3AF] dark:text-fg3 mb-4">
              {t('plan.currentDescription', 'Você esta no nosso plano premium com todos os benefícios exclusivos.')}
            </Text>

            <View className="rounded-[12px] bg-black/20 px-3 py-2 mb-4">
              <Text variant="label" className="text-goldA font-semibold">
                {t('plans.gold.renews', 'Renova em 10/05/2026')}
              </Text>
            </View>

            <Button label={t('plan.manage', 'Gerenciar plano')} variant="ghost" disabled />
          </View>

          {/* Benefits */}
          <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-3">
            {t('plan.goldBenefits', 'Benefícios do Gold')}
          </Text>

          <View className="gap-3 mb-6">
            <View className="flex-row items-center gap-3 rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] px-3 py-3">
              <CheckCircle size={20} color="#22B76C" strokeWidth={2} />
              <View className="flex-1">
                <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                  {t('features.unlimited', 'Partidas ilimitadas')}
                </Text>
                <Text variant="caption" className="text-[#4B5563] dark:text-fg3">
                  {t('plan.unlimitedDescription', 'Crie e participe de quantas partidas quiser')}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] px-3 py-3">
              <CheckCircle size={20} color="#22B76C" strokeWidth={2} />
              <View className="flex-1">
                <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                  {t('features.advancedFilters', 'Filtros avancados')}
                </Text>
                <Text variant="caption" className="text-[#4B5563] dark:text-fg3">
                  {t('plan.advancedFiltersDescription', 'Busque partidas por nível, horário e localização')}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] px-3 py-3">
              <CheckCircle size={20} color="#22B76C" strokeWidth={2} />
              <View className="flex-1">
                <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                  {t('features.priority', 'Prioridade no chat')}
                </Text>
                <Text variant="caption" className="text-[#4B5563] dark:text-fg3">
                  {t('plan.priorityDescription', 'Suas mensagens aparecem em destaque')}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] px-3 py-3">
              <CheckCircle size={20} color="#22B76C" strokeWidth={2} />
              <View className="flex-1">
                <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                  {t('features.verified', 'Perfil verificado')}
                </Text>
                <Text variant="caption" className="text-[#4B5563] dark:text-fg3">
                  {t('plan.verifiedDescription', 'Seu perfil recebe o badge de verificacao')}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] px-3 py-3">
              <CheckCircle size={20} color="#22B76C" strokeWidth={2} />
              <View className="flex-1">
                <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                  {t('features.noAds', 'Sem anuncios')}
                </Text>
                <Text variant="caption" className="text-[#4B5563] dark:text-fg3">
                  {t('plan.noAdsDescription', 'Aproveite a experiência sem distrações')}
                </Text>
              </View>
            </View>
          </View>

          {/* Other Plans */}
          <View className="rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-[18px] mb-4">
            <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-4">
              {t('plan.exploreOtherPlans', 'Explorar outros planos')}
            </Text>

            <View className="gap-3">
              <View className="rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0A0F1C] px-3 py-3">
                <View className="flex-row items-center justify-between">
                  <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                    {t('plan.freePlan', 'Plano Gratuito')}
                  </Text>
                  <Pill tone="default" label={t('plan.active', 'Ativo')} className="px-2" />
                </View>
                <Text variant="caption" className="text-[#4B5563] dark:text-fg3 mt-1">
                  {t('plan.freeDescription', 'Funcionalidades básicas - R$ 0,00/mês')}
                </Text>
              </View>

              <View className="rounded-[12px] border border-gold-500 bg-[#FAFBFC] dark:bg-[#0A0F1C] px-3 py-3 border-2">
                <View className="flex-row items-center justify-between">
                  <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                    {t('plans.gold.name', 'Plano Gold')}
                  </Text>
                  <Pill tone="gold" label={t('plan.yourPlan', 'Seu plano')} className="px-2" />
                </View>
                <Text variant="caption" className="text-[#4B5563] dark:text-fg3 mt-1">
                  {t('plan.goldDescription', 'Plano premium - R$ 19,90/mês')}
                </Text>
              </View>

              <View className="rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0A0F1C] px-3 py-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                        {t('plans.elite.name', 'Plano Elite')}
                      </Text>
                      <Zap size={14} color="#FF8B7A" />
                    </View>
                  </View>
                  <Pill tone="sky" label={t('plan.comingSoon', 'Em breve')} className="px-2" />
                </View>
                <Text variant="caption" className="text-[#4B5563] dark:text-fg3 mt-1">
                  {t('plan.eliteDescription', 'Plano exclusivo - R$ 49,90/mês')}
                </Text>
              </View>
            </View>
          </View>

          <View className="rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-[18px] mb-4">
            <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-2">
              {t('plan.questionsTitle', 'Tem duvidas sobre os planos?')}
            </Text>
            <Text variant="caption" className="text-[#4B5563] dark:text-fg3 mb-4">
              {t('plan.questionsDescription', 'Consulte nossa central de ajuda ou fale com o suporte para mais informações.')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <MatchBottomNav active="none" />
    </SafeAreaView>
  );
}
