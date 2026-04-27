import { Pressable, View } from 'react-native';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { Text } from '@/src/components/ui';

import { billingOptions, type BillingPeriod } from './data';

type BillingPeriodToggleProps = {
	value: BillingPeriod;
	onChange: (value: BillingPeriod) => void;
};

export function BillingPeriodToggle({ value, onChange }: BillingPeriodToggleProps) {
	const theme = useAppColorScheme();
	const isLight = theme === 'light';

	return (
		<View className={`mx-[18px] mb-[14px] rounded-[14px] border p-1 flex-row gap-1 ${isLight ? 'border-[rgba(0,0,0,0.10)] bg-[#F4F6F9]' : 'border-line2 bg-[#0C111E]'}`}>
			{billingOptions.map((option) => {
				const active = option.value === value;

				return (
					<Pressable
						key={option.value}
						accessibilityRole="button"
						onPress={() => onChange(option.value)}
						className={`h-10 flex-1 rounded-[10px] flex-row items-center justify-center gap-1 ${
							active ? (isLight ? 'bg-black/5' : 'bg-white/10') : 'bg-transparent'
						}`}
					>
						<Text
							variant="caption"
							className={`font-semibold ${active ? (isLight ? 'text-[#111827]' : 'text-white') : (isLight ? 'text-[#4B5563]' : 'text-fg2')}`}
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

