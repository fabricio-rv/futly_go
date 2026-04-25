import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchBottomNav } from '@/src/components/features/matches';
import {
	BillingPeriodToggle,
	HubTopNav,
	StoreHero,
	StorePlanCard,
	plansByPeriod,
	type BillingPeriod,
} from '@/src/components/features/store';
import { IconButton, Text } from '@/src/components/ui';

export default function StoreScreen() {
	const [period, setPeriod] = useState<BillingPeriod>('semestral');

	return (
		<SafeAreaView className="flex-1 bg-ink-0">
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
				<HubTopNav
					title="Planos"
					subtitle="SEU PLANO ATUAL - GOLD"
					rightNode={
						<IconButton icon={<Check size={16} color="#86E5B4" strokeWidth={2.8} />} />
					}
				/>

				<StoreHero />

				<BillingPeriodToggle value={period} onChange={setPeriod} />

				{plansByPeriod[period].map((plan) => (
					<StorePlanCard key={plan.id} plan={plan} />
				))}

				<View className="mx-[18px] mt-1 rounded-[14px] border border-dashed border-line2 bg-white/[0.02] px-[14px] py-[14px]">
					<Text variant="caption" className="font-bold text-white mb-1">
						Pague a vontade. Cancele quando quiser.
					</Text>
					<Text variant="micro" className="leading-[18px] text-fg3">
						PIX, cartao de credito ou Apple/Google Pay. Sem fidelidade. Reembolso integral nos primeiros 7 dias.
					</Text>
				</View>
			</ScrollView>

			<MatchBottomNav active="settings" />
		</SafeAreaView>
	);
}

