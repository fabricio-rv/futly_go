import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { Pill, Text } from '@/src/components/ui';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

type Tab = 'terms' | 'privacy';

export default function TermsScreen() {
  const { t } = useTranslation('legal');
  const theme = useAppColorScheme();
  const [activeTab, setActiveTab] = useState<Tab>('terms');
  const bgColor = theme === 'light' ? '#FFFFFF' : '#05070B';

  const termsSections = [
    { title: t('sections.acceptance', '1. Acceptance of Terms'), body: t('sections.acceptanceText', 'By accessing and using Futly Hub...') },
    { title: t('sections.service', '2. Service Description'), body: t('terms.serviceText', 'Futly Hub connects athletes to organize matches.') },
    { title: t('sections.responsibility', '3. User Responsibility'), body: t('terms.responsibilityText', 'You are responsible for your account and your actions in the app.') },
    { title: t('sections.conduct', '4. Code of Conduct'), body: t('terms.conductText', 'Respect other users and avoid offensive behavior.') },
    { title: t('sections.cancellation', '5. Account Cancellation'), body: t('terms.cancellationText', 'You can cancel your account at any time in settings.') },
    { title: t('sections.liability', '6. Limitation of Liability'), body: t('terms.liabilityText', 'Participation in matches is at the user\'s own risk.') },
    { title: t('sections.modifications', '7. Terms Modifications'), body: t('terms.modificationsText', 'We may update these terms periodically.') },
    { title: t('sections.contact', '8. Contact'), body: t('terms.contactText', 'In case of doubts, contact support.') },
  ];

  const privacySections = [
    { title: t('privacy.dataCollected', '1. Information We Collect'), body: t('privacy.dataCollectedText', 'We collect registration and usage data to operate the app.') },
    { title: t('privacy.usage', '2. How We Use Your Information'), body: t('privacy.usageText', 'We use the data to improve the service and notifications.') },
    { title: t('privacy.location', '3. Location and Privacy'), body: t('privacy.locationText', 'Location is used to find nearby matches.') },
    { title: t('privacy.security', '4. Data Security'), body: t('privacy.securityText', 'We apply measures to protect your information.') },
    { title: t('privacy.sharing', '5. Data Sharing'), body: t('privacy.sharingText', 'We do not sell personal data to third parties.') },
    { title: t('privacy.rights', '6. Your Rights'), body: t('privacy.rightsText', 'You can request access, correction or deletion of data.') },
    { title: t('privacy.contact', '7. Contact'), body: t('privacy.contactText', 'Questions about privacy: talk to support.') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubTopNav plainBack title={t('title', 'Terms and Privacy')} subtitle={t('subtitle', 'POLICY AND TERMS')} />

        <View className="mx-[18px] mt-6 flex-row gap-2 mb-6">
          <Pill
            label={t('tabs.terms', 'Terms of Use')}
            tone={activeTab === 'terms' ? 'active' : 'default'}
            onPress={() => setActiveTab('terms')}
          />
          <Pill
            label={t('tabs.privacy', 'Privacy')}
            tone={activeTab === 'privacy' ? 'active' : 'default'}
            onPress={() => setActiveTab('privacy')}
          />
        </View>

        <View className="mx-[18px] rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-[18px] mb-4">
          {(activeTab === 'terms' ? termsSections : privacySections).map((section) => (
            <View key={section.title} className="mb-4">
              <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-2">
                {section.title}
              </Text>
              <Text variant="body" className="text-[#111827] dark:text-white">
                {section.body}
              </Text>
            </View>
          ))}

          <Text variant="caption" className="text-[#6B7280] dark:text-fg4 mt-4">
            {t('updated', 'Updated on 15/04/26')}
          </Text>
        </View>
      </ScrollView>

      <MatchBottomNav active="none" />
    </SafeAreaView>
  );
}
