import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react-native';

import { Text } from '@/src/components/ui';

type ToastTone = 'success' | 'error' | 'info';

type AuthToastProps = {
	visible: boolean;
	message: string;
	tone?: ToastTone;
};

const toneStyle: Record<ToastTone, { iconColor: string; bg: string; border: string }> = {
	success: { iconColor: '#22B76C', bg: '#072016', border: '#22B76C66' },
	error: { iconColor: '#FF5D7D', bg: '#2A0E17', border: '#FF5D7D66' },
	info: { iconColor: '#9DB0D1', bg: '#10213B', border: '#39537B' },
};

export function AuthToast({ visible, message, tone = 'info' }: AuthToastProps) {
	const opacity = useRef(new Animated.Value(0)).current;
	const translateY = useRef(new Animated.Value(-12)).current;

	useEffect(() => {
		if (!visible) return;

		opacity.setValue(0);
		translateY.setValue(-12);

		Animated.parallel([
			Animated.timing(opacity, {
				toValue: 1,
				duration: 140,
				useNativeDriver: true,
			}),
			Animated.timing(translateY, {
				toValue: 0,
				duration: 180,
				useNativeDriver: true,
			}),
		]).start();
	}, [opacity, translateY, visible]);

	if (!visible || !message) return null;

	const style = toneStyle[tone];
	const Icon = tone === 'success' ? CheckCircle2 : tone === 'error' ? AlertCircle : Info;

	return (
		<Animated.View
			className="absolute left-5 right-5 top-14 z-50 rounded-[14px] border px-4 py-3"
			style={{
				backgroundColor: style.bg,
				borderColor: style.border,
				opacity,
				transform: [{ translateY }],
			}}
			pointerEvents="none"
		>
			<View className="flex-row items-center gap-2">
				<Icon size={18} color={style.iconColor} strokeWidth={2.2} />
				<Text variant="label" className="flex-1 font-semibold text-white">
					{message}
				</Text>
			</View>
		</Animated.View>
	);
}
