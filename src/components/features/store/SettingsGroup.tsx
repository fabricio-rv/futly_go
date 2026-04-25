import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { Text } from '@/src/components/ui';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type IconTone = 'default' | 'ok' | 'gold' | 'bad' | 'sky';

const iconToneClass: Record<IconTone, string> = {
	default: 'bg-white/5 text-fg2',
	ok: 'bg-[#22B76C24] text-[#86E5B4]',
	gold: 'bg-[#D4A13A24] text-goldA',
	bad: 'bg-[#E84C3724] text-[#FF8B7A]',
	sky: 'bg-[#5AB1FF24] text-[#7AC0FF]',
};

export type SettingsRow = {
	id: string;
	icon: ReactNode;
	iconTone?: IconTone;
	title: string;
	subtitle?: string;
	rightLabel?: string;
	rightNode?: ReactNode;
	showArrow?: boolean;
	danger?: boolean;
	onPress?: () => void;
};

type SettingsGroupProps = {
	title: string;
	rows: SettingsRow[];
};

export function SettingsGroup({ title, rows }: SettingsGroupProps) {
	const theme = useAppColorScheme();
	const cardBg = theme === 'light' ? '#F8FAFB' : '#0C111E';
	const cardBorder = theme === 'light' ? '#E5E7EB' : 'rgba(255,255,255,0.10)';
	const borderDivider = theme === 'light' ? '#F3F4F6' : 'rgba(255,255,255,0.06)';

	return (
		<View>
			<Text
				variant="micro"
				className="px-[22px] pt-[18px] pb-[6px] uppercase tracking-[2.2px] font-extrabold"
				style={{ color: theme === 'light' ? '#9CA3AF' : 'rgba(255,255,255,0.28)' }}
			>
				{title}
			</Text>

			<View
				style={{
					marginHorizontal: 18,
					borderRadius: 18,
					borderWidth: 1,
					borderColor: cardBorder,
					backgroundColor: cardBg,
					overflow: 'hidden',
				}}
			>
				{rows.map((row, index) => (
					<Pressable
						key={row.id}
						onPress={row.onPress}
						style={{
							paddingHorizontal: 14,
							paddingVertical: 14,
							flexDirection: 'row',
							alignItems: 'center',
							gap: 14,
							borderBottomWidth: index < rows.length - 1 ? 1 : 0,
							borderBottomColor: borderDivider,
						}}
					>
						<View className={`h-[34px] w-[34px] rounded-[10px] items-center justify-center ${iconToneClass[row.iconTone ?? 'default']}`}>
							{row.icon}
						</View>

						<View className="flex-1">
							<Text
								variant="label"
								className="font-medium"
								style={{
									color: row.danger
										? '#FF8B7A'
										: theme === 'light'
											? '#1F2937'
											: '#FFFFFF',
								}}
							>
								{row.title}
							</Text>
							{row.subtitle ? (
								<Text
									variant="micro"
									style={{
										color: theme === 'light' ? '#6B7280' : 'rgba(255,255,255,0.45)',
										marginTop: 1,
									}}
								>
									{row.subtitle}
								</Text>
							) : null}
						</View>

						{row.rightLabel ? (
							<Text
								variant="caption"
								style={{
									color:
										theme === 'light'
											? 'rgba(0,0,0,0.5)'
											: 'rgba(255,255,255,0.45)',
									marginRight: 4,
								}}
							>
								{row.rightLabel}
							</Text>
						) : null}

						{row.rightNode ? row.rightNode : null}

						{row.showArrow ? (
							<ChevronRight
								size={14}
								color={
									theme === 'light'
										? 'rgba(0,0,0,0.3)'
										: 'rgba(255,255,255,0.28)'
								}
							/>
						) : null}
					</Pressable>
				))}
			</View>
		</View>
	);
}

