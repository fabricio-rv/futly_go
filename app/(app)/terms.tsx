import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { Pill, Text } from '@/src/components/ui';

type Tab = 'terms' | 'privacy';

export default function TermsScreen() {
  const theme = useAppColorScheme();
  const [activeTab, setActiveTab] = useState<Tab>('terms');
  const bgColor = theme === 'light' ? '#FFFFFF' : '#05070B';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubTopNav title="Termos e Privacidade" subtitle="POLÍTICA E TERMOS" />

        {/* Tabs */}
        <View className="mx-[18px] mt-6 flex-row gap-2 mb-6">
          <Pill
            label="Termos de Uso"
            tone={activeTab === 'terms' ? 'active' : 'default'}
            onPress={() => setActiveTab('terms')}
          />
          <Pill
            label="Privacidade"
            tone={activeTab === 'privacy' ? 'active' : 'default'}
            onPress={() => setActiveTab('privacy')}
          />
        </View>

        {/* Content */}
        <View className="mx-[18px] rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-[18px] mb-4">
          {activeTab === 'terms' && (
            <View className="gap-4">
              <View>
                <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-2">
                  1. Aceitação dos Termos
                </Text>
                <Text variant="body" className="text-[#1F2937] dark:text-white">
                  Ao acessar e usar o Futly Hub de Partidas, você concorda em respeitar estes Termos de Uso. Se você não concordar
                  com qualquer parte destes termos, não utilize o aplicativo.
                </Text>
              </View>

              <View>
                <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-2">
                  2. Descrição do Serviço
                </Text>
                <Text variant="body" className="text-[#1F2937] dark:text-white">
                  Futly Hub é uma plataforma que conecta atletas para organizarem partidas de futebol. O aplicativo fornece
                  funcionalidades para criar, buscar e participar de partidas em sua região.
                </Text>
              </View>

              <View>
                <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-2">
                  3. Responsabilidade do Usuário
                </Text>
                <Text variant="body" className="text-[#1F2937] dark:text-white">
                  Você é responsável por manter a confidencialidade de sua conta e senha. Você concorda em ser responsável por
                  todas as atividades que ocorrem em sua conta. Você deve notificar-nos imediatamente de qualquer acesso
                  não autorizado.
                </Text>
              </View>

              <View>
                <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-2">
                  4. Regras de Conduta
                </Text>
                <Text variant="body" className="text-[#1F2937] dark:text-white">
                  Você concorda em não:
                </Text>
                <Text variant="body" className="text-[#1F2937] dark:text-white ml-4 mt-1">
                  • Usar linguagem ofensiva ou discriminatória{'\n'}• Danificar ou interferi com a plataforma{'\n'}• Compartilhar
                  informações pessoais de outros usuários{'\n'}• Criar múltiplas contas fraudulentas
                </Text>
              </View>

              <View>
                <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-2">
                  5. Cancelamento de Conta
                </Text>
                <Text variant="body" className="text-[#1F2937] dark:text-white">
                  Você pode cancelar sua conta a qualquer momento nas configurações. Ao cancelar, todos os seus dados serão
                  permanentemente removidos.
                </Text>
              </View>

              <View>
                <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-2">
                  6. Limitação de Responsabilidade
                </Text>
                <Text variant="body" className="text-[#1F2937] dark:text-white">
                  Futly Hub não é responsável por lesões, danos ou perda de propriedade que ocorram durante partidas organizadas
                  através da plataforma. Você participa por sua conta e risco.
                </Text>
              </View>

              <View>
                <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-2">
                  7. Modificação dos Termos
                </Text>
                <Text variant="body" className="text-[#1F2937] dark:text-white">
                  Reservamos o direito de modificar estes termos a qualquer momento. As alterações entram em vigor
                  imediatamente após publicação. O uso continuado significa aceitação dos novos termos.
                </Text>
              </View>

              <Text variant="caption" className="text-[#6B7280] dark:text-fg4 mt-4">
                Última atualização: 15/04/2026
              </Text>
            </View>
          )}

          {activeTab === 'privacy' && (
            <View className="gap-4">
              <View>
                <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-2">
                  1. Informações que Coletamos
                </Text>
                <Text variant="body" className="text-[#1F2937] dark:text-white">
                  Coletamos informações que você nos fornece diretamente, como nome, email, telefone e localização. Também
                  coletamos dados de uso do aplicativo, como partidas criadas e participadas.
                </Text>
              </View>

              <View>
                <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-2">
                  2. Como Usamos Suas Informações
                </Text>
                <Text variant="body" className="text-[#1F2937] dark:text-white">
                  Suas informações são usadas para:
                </Text>
                <Text variant="body" className="text-[#1F2937] dark:text-white ml-4 mt-1">
                  • Fornecer e melhorar o serviço{'\n'}• Enviar notificações e atualizações{'\n'}• Processar pagamentos{'\n'}•
                  Combater fraude e abuso
                </Text>
              </View>

              <View>
                <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-2">
                  3. Localização e Privacidade
                </Text>
                <Text variant="body" className="text-[#1F2937] dark:text-white">
                  Se você ativar a localização, ela será usada apenas para encontrar partidas perto de você. Sua localização
                  exata não é compartilhada com outros usuários. Você pode desativar a localização a qualquer momento nas
                  configurações.
                </Text>
              </View>

              <View>
                <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-2">
                  4. Segurança de Dados
                </Text>
                <Text variant="body" className="text-[#1F2937] dark:text-white">
                  Implementamos medidas de segurança para proteger suas informações. Porém, nenhum método de transmissão pela
                  internet é 100% seguro. Use uma senha forte e não compartilhe sua conta.
                </Text>
              </View>

              <View>
                <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-2">
                  5. Compartilhamento de Dados
                </Text>
                <Text variant="body" className="text-[#1F2937] dark:text-white">
                  Não vendemos ou compartilhamos seus dados pessoais com terceiros, exceto quando necessário para fornecer o
                  serviço (ex: processamento de pagamento).
                </Text>
              </View>

              <View>
                <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-2">
                  6. Seus Direitos
                </Text>
                <Text variant="body" className="text-[#1F2937] dark:text-white">
                  Você tem o direito de acessar, corrigir ou deletar suas informações pessoais. Entre em contato com suporte
                  para fazer essas solicitações.
                </Text>
              </View>

              <View>
                <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-2">
                  7. Contato
                </Text>
                <Text variant="body" className="text-[#1F2937] dark:text-white">
                  Se tiver dúvidas sobre nossa política de privacidade, entre em contato através da central de suporte.
                </Text>
              </View>

              <Text variant="caption" className="text-[#6B7280] dark:text-fg4 mt-4">
                Última atualização: 15/04/2026
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <MatchBottomNav active="none" />
    </SafeAreaView>
  );
}
