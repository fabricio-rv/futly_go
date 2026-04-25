import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

const verticalLines = Array.from({ length: 14 });
const horizontalLines = Array.from({ length: 26 });

export function AuthBackground() {
	return (
		<View className="absolute inset-0 overflow-hidden bg-ink-0">
			<LinearGradient
				colors={['#05070B', '#05070B']}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
				className="absolute inset-0"
			/>

			<LinearGradient
				colors={['rgba(0,0,0,0)', 'rgba(5,7,11,0.9)']}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
				className="absolute inset-0"
			/>

			<View className="absolute inset-0 opacity-35">
				{verticalLines.map((_, index) => (
					<View
						key={`v-${index}`}
						className="absolute top-0 bottom-0 w-px bg-white/[0.04]"
						style={{ left: 28 + index * 29 }}
					/>
				))}

				{horizontalLines.map((_, index) => (
					<View
						key={`h-${index}`}
						className="absolute left-0 right-0 h-px bg-white/[0.03]"
						style={{ top: index * 29 }}
					/>
				))}
			</View>
		</View>
	);
}
