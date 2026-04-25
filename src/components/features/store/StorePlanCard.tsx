import { Check, X } from 'lucide-react-native';
import { View } from 'react-native';

import { Button, Text } from '@/src/components/ui';

import type { StorePlan } from './data';

const planToneClass: Record<StorePlan['tone'], string> = {
	default: 'border-line bg-[#0F1625]',
	gold: 'border-[#D4A13A66] bg-[#191207]',
	elite: 'border-[#22B76C66] bg-[#06180D]',
};

const tagToneClass = {
	neutral: 'bg-white/10 border border-line2 text-fg2',
	gold: 'bg-gold-500 text-[#2A1A05]',
	popular: 'bg-[#22B76C2E] border border-[#22B76C66] text-[#86E5B4]',
};

const featureIconColor = {
	muted: 'rgba(255,255,255,0.28)',
	gold: '#D4A13A',
	ok: '#22B76C',
} as const;

type StorePlanCardProps = {
	plan: StorePlan;
};

export function StorePlanCard({ plan }: StorePlanCardProps) {
	const isGoldTone = plan.tone === 'gold';
	const isEliteTone = plan.tone === 'elite';

	return (
		<View className={`mx-[18px] mb-3 overflow-hidden rounded-[20px] border px-[18px] py-[18px] ${planToneClass[plan.tone]}`}>
			{plan.tag ? (
				<View className={`absolute right-3 top-3 rounded-[6px] px-2 py-1 ${tagToneClass[plan.tag.tone]}`}>
					<Text variant="micro" className="font-extrabold uppercase tracking-[1.4px]">
						{plan.tag.label}
					</Text>
				</View>
			) : null}

			<Text variant="micro" className={`font-extrabold uppercase tracking-[2.4px] mb-1 ${
				isGoldTone ? 'text-goldA' : isEliteTone ? 'text-[#86E5B4]' : 'text-fg3'
			}`}>
				{plan.name}
			</Text>

			<Text variant="title" className="font-extrabold text-white">
				{plan.title}
			</Text>

			<Text variant="caption" className="text-fg2 mt-1 leading-[18px] mb-3">
				{plan.description}
			</Text>

			<View className="flex-row items-end gap-1 mb-2">
				<Text variant="label" className="text-fg3 mb-1">
					R$
				</Text>
				<Text variant="number" className="text-[42px] text-white leading-[40px]">
					{plan.price}
				</Text>
				<Text variant="caption" className="text-fg3 mb-1">
					{plan.per}
				</Text>
				{plan.strike ? (
					<Text variant="caption" className="text-fg4 line-through mb-1 ml-1">
						{plan.strike}
					</Text>
				) : null}
			</View>

			{plan.highlight ? (
				<Text
					variant="micro"
					className={`mb-3 font-bold tracking-[0.5px] ${
						isGoldTone ? 'text-goldA' : 'text-[#86E5B4]'
					}`}
				>
					{plan.highlight}
				</Text>
			) : null}

			<View className="mb-4 gap-2">
				{plan.features.map((feature) => {
					const disabled = !!feature.muted;
					const iconColor = disabled
						? featureIconColor.muted
						: feature.gold
							? featureIconColor.gold
							: featureIconColor.ok;

					return (
						<View key={feature.text} className="flex-row items-start gap-2">
							<View className="mt-[2px]">
								{disabled ? (
									<X size={14} color={iconColor} strokeWidth={2.1} />
								) : (
									<Check size={14} color={iconColor} strokeWidth={2.4} />
								)}
							</View>
							<Text
								variant="caption"
								className={`flex-1 leading-[18px] ${
									disabled ? 'text-fg4' : 'text-fg2'
								}`}
							>
								{feature.text}
							</Text>
						</View>
					);
				})}
			</View>

			<Button
				label={plan.ctaLabel}
				variant={plan.ctaVariant === 'ghost' ? 'ghost' : plan.ctaVariant}
				size="md"
				className="rounded-[14px]"
				labelClassName="font-bold"
			/>
		</View>
	);
}

