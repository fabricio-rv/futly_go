import { router } from 'expo-router';
import { ChevronDown, BookOpen, HelpCircle, MessageCircle } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { Button, Text } from '@/src/components/ui';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

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

// Generate FAQ items from translations with fallbacks
const getFAQItems = (t: any): FAQItem[] => [
  {
    id: '1',
    question: t('faq.items.1.question', 'How do I create a match?'),
    answer: t('faq.items.1.answer', 'Click the "+" button on the home screen, fill in the match details and confirm.'),
  },
  {
    id: '2',
    question: t('faq.items.2.question', 'How do I join a match?'),
    answer: t('faq.items.2.answer', 'Choose an available match and click on Join.'),
  },
  {
    id: '3',
    question: t('faq.items.3.question', 'How does the rating system work?'),
    answer: t('faq.items.3.answer', 'After the match, you can rate other players and the host.'),
  },
  {
    id: '4',
    question: t('faq.items.4.question', 'What\'s the difference between plans?'),
    answer: t('faq.items.4.answer', 'Each plan unlocks different creation, search and priority features.'),
  },
  {
    id: '5',
    question: t('faq.items.5.question', 'How do I cancel a match?'),
    answer: t('faq.items.5.answer', 'If you created the match, open details and click cancel.'),
  },
];

// Generate tutorial items from translations with fallbacks
const getTutorialItems = (t: any): TutorialItem[] => [
  {
    id: '1',
    title: t('tutorials.items.1.title', 'How to create your first match'),
    description: t('tutorials.items.1.description', 'Step by step to create a match and attract players'),
    icon: <HelpCircle size={24} color="#22B76C" />,
  },
  {
    id: '2',
    title: t('tutorials.items.2.title', 'Tips for managing your match'),
    description: t('tutorials.items.2.description', 'Confirm athletes and organize everything in advance'),
    icon: <BookOpen size={24} color="#5AB1FF" />,
  },
  {
    id: '3',
    title: t('tutorials.items.3.title', 'How to build a good reputation'),
    description: t('tutorials.items.3.description', 'Best practices to maintain profile and positive ratings'),
    icon: <HelpCircle size={24} color="#D4A13A" />,
  },
];

export default function HelpCenterScreen() {
  const { t } = useTranslation('help');
  const theme = useAppColorScheme();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const bgColor = theme === 'light' ? '#F4F6F9' : '#05070B';

  const faqItems = getFAQItems(t);
  const tutorials = getTutorialItems(t);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubTopNav plainBack title={t('title', 'Help Center')} subtitle={t('subtitle', 'FAQ AND TUTORIALS')} />

        <View className="mx-[18px] mt-6">
          <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-3">
            {t('faq.title', 'Frequently Asked Questions')}
          </Text>

          <View className="rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] overflow-hidden mb-6">
            {faqItems.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
                className={`px-[14px] py-[14px] flex-row items-center gap-3 ${index < faqItems.length - 1 ? 'border-b border-gray-100 dark:border-line' : ''}`}
              >
                <View className="flex-1">
                  <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                    {item.question}
                  </Text>

                  {expandedFAQ === item.id && (
                    <Text variant="body" className="text-[#4B5563] dark:text-fg3 mt-2">
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

          <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-3">
            {t('tutorials.title', 'Tutorials')}
          </Text>

          <View className="gap-3 mb-6">
            {tutorials.map((item) => (
              <View
                key={item.id}
                className="flex-row items-start gap-3 rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-3"
              >
                <View className="mt-1">{item.icon}</View>
                <View className="flex-1">
                  <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                    {item.title}
                  </Text>
                  <Text variant="caption" className="text-[#4B5563] dark:text-fg3 mt-1">
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View className="rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-[18px] mb-4">
            <View className="flex-row items-center gap-2 mb-2">
              <MessageCircle size={20} color="#5AB1FF" strokeWidth={2} />
              <Text variant="label" className="font-bold text-[#111827] dark:text-white">
                {t('support.title', 'Still have questions?')}
              </Text>
            </View>

            <Text variant="body" className="text-[#4B5563] dark:text-fg3 mb-4">
              {t('support.description', 'Our support team is ready to help. Contact us.')}
            </Text>

            <Button
              label={t('support.cta', 'Talk to support')}
              onPress={() => router.push('/(app)/support-chat')}
            />
          </View>
        </View>
      </ScrollView>

      <MatchBottomNav active="none" />
    </SafeAreaView>
  );
}
