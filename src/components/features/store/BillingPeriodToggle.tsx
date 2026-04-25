import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';

import { billingOptions, type BillingPeriod } from './data';

type BillingPeriodToggleProps = {
	value: BillingPeriod;
	onChange: (value: BillingPeriod) => void;
};

export function BillingPeriodToggle({ value, onChange }: BillingPeriodToggleProps) {
	return (
		<View className="mx-[18px] mb-[14px] rounded-[14px] border border-line2 bg-[#0C111E] p-1 flex-row gap-1">
			{billingOptions.map((option) => {
				const active = option.value === value;

				return (
					<Pressable
						key={option.value}
						accessibilityRole="button"
						onPress={() => onChange(option.value)}
						className={`h-10 flex-1 rounded-[10px] flex-row items-center justify-center gap-1 ${
							active ? 'bg-white/10' : 'bg-transparent'
						}`}
					>
						<Text
							variant="caption"
							className={`font-semibold ${active ? 'text-white' : 'text-fg2'}`}
						>
							{option.label}
						</Text>

						{option.save ? (
							<View className="rounded-[4px] border border-[#D4A13A4D] bg-[#D4A13A24] px-1 py-[1px]">
								<Text variant="micro" className="font-bold text-goldA tracking-[0.6px]">
									{option.save}
								</Text>
							</View>
						) : null}
					</Pressable>
				);
			})}
		</View>
	);
}

