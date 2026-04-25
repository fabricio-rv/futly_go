import { router } from 'expo-router';
import { ChevronDown, BookOpen, HelpCircle, MessageCircle } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { Button, Text } from '@/src/components/ui';

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

type TutorialItem = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'Como crio uma partida?',
    answer:
      'Clique no botão "+" na tela inicial, preencha os dados da partida (data, horário, local, nível) e confirme. A partida será publicada e outros jogadores poderão se inscrever.',
  },
  {
    id: '2',
    question: 'Como me inscrevo em uma partida?',
    answer:
      'Visualize as partidas disponíveis, escolha uma que te interesse e clique em "Participar". O criador da partida precisará aprovar sua inscrição.',
  },
  {
    id: '3',
    question: 'Como funciona o sistema de avaliações?',
    answer:
      'Após o término de uma partida, você pode avaliar outros jogadores. As avaliações ajudam a comunidade a identificar os melhores atletas e criar partidas de melhor qualidade.',
  },
  {
    id: '4',
    question: 'Qual é a diferença entre os planos?',
    answer:
      'O plano Gratuito oferece funcionalidades básicas. O Gold inclui filtros avançados, prioridade no chat e perfil verificado. O Elite (em breve) terá recursos exclusivos adicionais.',
  },
  {
    id: '5',
    question: 'Como cancelo uma partida?',
    answer:
      'Se você criou a partida, acesse-a e clique em "Cancelar". Se for participante, vá em "Minhas partidas" e cancele sua inscrição.',
  },
  {
    id: '6',
    question: 'Como funciona a localização?',
    answer:
      'Você pode ativar a localização nas configurações para encontrar partidas perto de você. Sua localização exata não é compartilhada, apenas usada para filtros.',
  },
  {
    id: '7',
    question: 'Como recebo notificações?',
    answer:
      'Ative as notificações nas configurações. Você receberá alertas sobre inscrições, convites, avaliações e mensagens de chat.',
  },
  {
    id: '8',
    question: 'Posso mudar minha posição em uma partida?',
    answer:
      'Sim, você pode informar sua posição ao se inscrever. O criador da partida pode ajustar as posições conforme necessário.',
  },
  {
    id: '9',
    question: 'Como funciona o chat de partida?',
    answer:
      'Cada partida tem um chat exclusivo onde os participantes podem se comunicar, tirar dúvidas e organizar detalhes da partida.',
  },
  {
    id: '10',
    question: 'Posso recuperar minha senha?',
    answer:
      'Sim, na tela de login clique em "Esqueceu a senha". Digite seu e-mail e você receberá um código para resetar sua senha.',
  },
];

const tutorials: TutorialItem[] = [
  {
    id: '1',
    title: 'Como criar sua primeira partida',
    description: 'Aprenda o passo a passo para criar uma partida e atrair jogadores',
    icon: <HelpCircle size={24} color="#22B76C" />,
  },
  {
    id: '2',
    title: 'Dicas para gerenciar sua partida',
    description: 'Organize confirmações, comunicação e substitutos eficientemente',
    icon: <BookOpen size={24} color="#5AB1FF" />,
  },
  {
    id: '3',
    title: 'Como construir uma boa reputação',
    description: 'Entenda o sistema de avaliações e como manter um perfil exemplar',
    icon: <HelpCircle size={24} color="#D4A13A" />,
  },
  {
    id: '4',
    title: 'Aproveitando os filtros avançados',
    description: 'Encontre partidas perfeitas usando todos os critérios de filtro',
    icon: <BookOpen size={24} color="#86E5B4" />,
  },
];

export default function HelpCenterScreen() {
  const theme = useAppColorScheme();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const bgColor = theme === 'light' ? '#F3F6FB' : '#05070B';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubTopNav title="Central de Ajuda" subtitle="FAQ E TUTORIAIS" />

        {/* FAQ Section */}
        <View className="mx-[18px] mt-6">
          <Text variant="label" className="font-bold text-gray-900 dark:text-white mb-3">
            Perguntas Frequentes
          </Text>

          <View className="rounded-[18px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] overflow-hidden mb-6">
            {faqItems.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
                className={`px-[14px] py-[14px] flex-row items-center gap-3 ${
                  index < faqItems.length - 1 ? 'border-b border-gray-100 dark:border-line' : ''
                }`}
              >
                <View className="flex-1">
                  <Text variant="label" className="font-semibold text-gray-900 dark:text-white">
                    {item.question}
                  </Text>

                  {expandedFAQ === item.id && (
                    <Text variant="body" className="text-gray-600 dark:text-fg3 mt-2">
                      {item.answer}
                    </Text>
                  )}
                </View>

                <ChevronDown
                  size={18}
                  color={expandedFAQ === item.id ? '#22B76C' : 'rgba(255,255,255,0.45)'}
                  strokeWidth={2}
                />
              </Pressable>
            ))}
          </View>

          {/* Tutorials Section */}
          <Text variant="label" className="font-bold text-gray-900 dark:text-white mb-3">
            Tutoriais
          </Text>

          <View className="gap-3 mb-6">
            {tutorials.map((item) => (
              <View
                key={item.id}
                className="flex-row items-start gap-3 rounded-[12px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] p-3"
              >
                <View className="mt-1">{item.icon}</View>
                <View className="flex-1">
                  <Text variant="label" className="font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </Text>
                  <Text variant="caption" className="text-gray-600 dark:text-fg3 mt-1">
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Support Section */}
          <View className="rounded-[18px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] p-[18px] mb-4">
            <View className="flex-row items-center gap-2 mb-2">
              <MessageCircle size={20} color="#5AB1FF" strokeWidth={2} />
              <Text variant="label" className="font-bold text-gray-900 dark:text-white">
                Ainda com dúvidas?
              </Text>
            </View>

            <Text variant="body" className="text-gray-600 dark:text-fg3 mb-4">
              Nosso time de suporte está pronto para ajudar. Entre em contato conosco.
            </Text>

            <Button
              label="Falar com suporte"
              onPress={() => router.push('/(app)/support-chat')}
            />
          </View>
        </View>
      </ScrollView>

      <MatchBottomNav active="none" />
    </SafeAreaView>
  );
}
