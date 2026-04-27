import { Check, X } from 'lucide-react-native';
import { View } from 'react-native';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { Button, Text } from '@/src/components/ui';

import type { StorePlan } from './data';

type StorePlanCardProps = {
	plan: StorePlan;
};

export function StorePlanCard({ plan }: StorePlanCardProps) {
	const theme = useAppColorScheme();
	const isLight = theme === 'light';
	const isGoldTone = plan.tone === 'gold';
	const isEliteTone = plan.tone === 'elite';

	const planToneClass: Record<StorePlan['tone'], string> = {
		default: isLight
			? 'border-[rgba(0,0,0,0.08)] bg-[#FAFBFC]'
			: 'border-line bg-[#0F1625]',
		gold: isLight
			? 'border-[#D4A13A66] bg-[#FFFBF0]'
			: 'border-[#D4A13A66] bg-[#191207]',
		elite: isLight
			? 'border-[#22B76C66] bg-[#F0FBF5]'
			: 'border-[#22B76C66] bg-[#06180D]',
	};

	const tagToneClass = {
		neutral: isLight
			? 'bg-black/5 border border-black/10 text-gray-700'
			: 'bg-white/10 border border-line2 text-fg2',
		gold: 'bg-gold-500 text-[#2A1A05]',
		popular: isLight
			? 'bg-[#22B76C1A] border border-[#22B76C40] text-[#1A7A4A]'
			: 'bg-[#22B76C2E] border border-[#22B76C66] text-[#86E5B4]',
	};

	const featureIconColor = {
		muted: isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.28)',
		gold: '#D4A13A',
		ok: '#22B76C',
	} as const;

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
				isGoldTone ? 'text-goldA' : isEliteTone ? 'text-[#86E5B4]' : isLight ? 'text-[#4B5563]' : 'text-fg3'
			}`}>
				{plan.name}
			</Text>

			<Text variant="title" className={`font-extrabold ${isLight ? 'text-[#111827]' : 'text-white'}`}>
				{plan.title}
			</Text>

			<Text variant="caption" className={`mt-1 leading-[18px] mb-3 ${isLight ? 'text-[#6B7280]' : 'text-fg2'}`}>
				{plan.description}
			</Text>

			<View className="flex-row items-end gap-1 mb-2">
				<Text variant="label" className={`mb-1 ${isLight ? 'text-[#6B7280]' : 'text-fg3'}`}>
					R$
				</Text>
				<Text variant="number" className={`text-[42px] leading-[40px] ${isLight ? 'text-[#111827]' : 'text-white'}`}>
					{plan.price}
				</Text>
				<Text variant="caption" className={`mb-1 ${isLight ? 'text-[#6B7280]' : 'text-fg3'}`}>
					{plan.per}
				</Text>
				{plan.strike ? (
					<Text variant="caption" className={`line-through mb-1 ml-1 ${isLight ? 'text-[#9CA3AF]' : 'text-fg4'}`}>
						{plan.strike}
					</Text>
				) : null}
			</View>

			{plan.highlight ? (
				<Text
					variant="micro"
					className={`mb-3 font-bold tracking-[0.5px] ${
						isGoldTone ? 'text-goldA' : isEliteTone ? 'text-[#86E5B4]' : ''
					}`}
					style={{ color: isGoldTone ? '#F6D27A' : isEliteTone ? '#86E5B4' : (isLight ? '#22B76C' : '#86E5B4') }}
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
								className="flex-1 leading-[18px]"
								style={{ color: disabled ? (isLight ? '#9CA3AF' : 'rgba(255,255,255,0.28)') : (isLight ? '#4B5563' : 'rgba(255,255,255,0.70)') }}
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

