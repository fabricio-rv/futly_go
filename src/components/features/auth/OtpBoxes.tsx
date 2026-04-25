import { View } from 'react-native';

import { Text } from '@/src/components/ui';

type OtpBoxesProps = {
	value: string;
};

export function OtpBoxes({ value }: OtpBoxesProps) {
	const emptyChar = String.fromCharCode(183);

	const chars = value
		.replace(/[^0-9]/g, '')
		.slice(0, 6)
		.padEnd(6, emptyChar)
		.split('');

	return (
		<View className="flex-row gap-[10px]">
			{chars.map((char, index) => {
				const hasValue = char !== emptyChar;

				return (
					<View
						key={`${char}-${index}`}
						className={`h-[50px] flex-1 rounded-[14px] border items-center justify-center ${
							hasValue
								? index === Math.min(value.length - 1, 5)
									? 'border-ok bg-[#0C111E]'
									: 'border-line2 bg-[#0C111E]'
								: 'border-line2 bg-[#0C111E]'
						}`}
					>
						<Text
							variant="number"
							className={`text-[28px] leading-none ${hasValue ? 'text-white' : 'text-fg4'}`}
						>
							{char}
						</Text>
					</View>
				);
			})}
		</View>
	);
}

