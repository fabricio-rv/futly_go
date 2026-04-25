import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { Text } from '@/src/components/ui';

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
	return (
		<View>
			<Text variant="micro" className="px-[22px] pt-[18px] pb-[6px] uppercase tracking-[2.2px] font-extrabold text-fg4">
				{title}
			</Text>

			<View className="mx-[18px] rounded-[18px] border border-line2 bg-[#0C111E] overflow-hidden">
				{rows.map((row, index) => (
					<Pressable
						key={row.id}
						onPress={row.onPress}
						className={`px-[14px] py-[14px] flex-row items-center gap-[14px] ${
							index < rows.length - 1 ? 'border-b border-line' : ''
						}`}
					>
						<View className={`h-[34px] w-[34px] rounded-[10px] items-center justify-center ${iconToneClass[row.iconTone ?? 'default']}`}>
							{row.icon}
						</View>

						<View className="flex-1">
							<Text variant="label" className={`font-medium ${row.danger ? 'text-[#FF8B7A]' : 'text-white'}`}>
								{row.title}
							</Text>
							{row.subtitle ? (
								<Text variant="micro" className="text-fg3 mt-[1px]">
									{row.subtitle}
								</Text>
							) : null}
						</View>

						{row.rightLabel ? (
							<Text variant="caption" className="text-fg3 mr-1">
								{row.rightLabel}
							</Text>
						) : null}

						{row.rightNode ? row.rightNode : null}

						{row.showArrow ? <ChevronRight size={14} color="rgba(255,255,255,0.28)" /> : null}
					</Pressable>
				))}
			</View>
		</View>
	);
}

