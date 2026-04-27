import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

type AuthStepIndicatorProps = {
	current: number;
	total?: number;
};

export function AuthStepIndicator({ current, total = 3 }: AuthStepIndicatorProps) {
	return (
		<View className="px-[22px] pb-3 flex-row items-center gap-2">
			{Array.from({ length: total }).map((_, index) => {
				const step = index + 1;

				if (step < current) {
					return <View key={step} className="h-[3px] flex-1 rounded-full bg-ok" />;
				}

				if (step === current) {
					return (
						<LinearGradient
							key={step}
							colors={['#22B76C', '#F6D27A']}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							className="h-[3px] flex-1 rounded-full"
						/>
					);
				}

				return <View key={step} className="h-[3px] flex-1 rounded-full bg-[#FAFBFC]/10" />;
			})}
		</View>
	);
}

