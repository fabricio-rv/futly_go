import { View } from 'react-native';

import { Text } from '@/src/components/ui';

type PasswordStrengthMeterProps = {
	level: number;
	label: string;
};

export function PasswordStrengthMeter({ level, label }: PasswordStrengthMeterProps) {
	return (
		<View className="mt-1">
			<View className="flex-row gap-1">
				{Array.from({ length: 4 }).map((_, index) => (
					<View
						key={index}
						className={`h-[3px] flex-1 rounded-full ${index < level ? 'bg-ok' : 'bg-[#FAFBFC]/10'}`}
					/>
				))}
			</View>
			<Text variant="micro" className="mt-1 text-fg3">
				{label}
			</Text>
		</View>
	);
}

