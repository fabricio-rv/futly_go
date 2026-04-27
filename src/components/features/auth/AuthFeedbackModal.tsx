import { useEffect, useRef } from 'react';
import {
	Animated,
	Modal,
	Pressable,
	View,
} from 'react-native';
import {
	AlertCircle,
	CheckCircle2,
	Info,
} from 'lucide-react-native';

import { Button, Text } from '@/src/components/ui';

type FeedbackTone = 'success' | 'error' | 'info';

type AuthFeedbackModalProps = {
	visible: boolean;
	tone?: FeedbackTone;
	title: string;
	message: string;
	primaryLabel: string;
	onPrimaryPress: () => void;
	secondaryLabel?: string;
	onSecondaryPress?: () => void;
	onClose?: () => void;
};

const toneStyle: Record<FeedbackTone, { iconColor: string; bg: string; border: string }> = {
	success: { iconColor: '#22B76C', bg: '#22B76C1F', border: '#22B76C66' },
	error: { iconColor: '#FF5D7D', bg: '#FF5D7D1F', border: '#FF5D7D66' },
	info: { iconColor: '#9DB0D1', bg: '#15233D', border: '#2A3A5B' },
};

export function AuthFeedbackModal({
	visible,
	tone = 'info',
	title,
	message,
	primaryLabel,
	onPrimaryPress,
	secondaryLabel,
	onSecondaryPress,
	onClose,
}: AuthFeedbackModalProps) {
	const opacity = useRef(new Animated.Value(0)).current;
	const translateY = useRef(new Animated.Value(24)).current;
	const scale = useRef(new Animated.Value(0.97)).current;

	useEffect(() => {
		if (!visible) return;

		opacity.setValue(0);
		translateY.setValue(24);
		scale.setValue(0.97);

		Animated.parallel([
			Animated.timing(opacity, {
				toValue: 1,
				duration: 180,
				useNativeDriver: true,
			}),
			Animated.spring(translateY, {
				toValue: 0,
				friction: 8,
				tension: 95,
				useNativeDriver: true,
			}),
			Animated.spring(scale, {
				toValue: 1,
				friction: 8,
				tension: 95,
				useNativeDriver: true,
			}),
		]).start();
	}, [opacity, scale, translateY, visible]);

	const Icon = tone === 'success' ? CheckCircle2 : tone === 'error' ? AlertCircle : Info;
	const style = toneStyle[tone];

	return (
		<Modal
			transparent
			animationType="fade"
			visible={visible}
			onRequestClose={onClose ?? onPrimaryPress}
		>
			<View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: 'rgba(1, 4, 10, 0.76)' }}>
				<Pressable className="absolute inset-0" onPress={onClose ?? onPrimaryPress} />

				<Animated.View
					className="w-full max-w-[420px] rounded-[20px] border bg-[#070E1B] p-5"
					style={{
						opacity,
						borderColor: style.border,
						transform: [{ translateY }, { scale }],
					}}
				>
					<View className="flex-row items-center gap-3">
						<View
							className="h-11 w-11 items-center justify-center rounded-[14px] border"
							style={{ backgroundColor: style.bg, borderColor: style.border }}
						>
							<Icon size={22} color={style.iconColor} strokeWidth={2.2} />
						</View>
						<Text variant="title" className="flex-1 font-bold text-white">
							{title}
						</Text>
					</View>

					<Text variant="body" className="mt-3 leading-[22px] text-fg2">
						{message}
					</Text>

					<Button
						label={primaryLabel}
						variant="primary"
						size="lg"
						className="mt-5"
						onPress={onPrimaryPress}
					/>
					{secondaryLabel && onSecondaryPress ? (
						<Button
							label={secondaryLabel}
							variant="ghost"
							size="lg"
							className="mt-2"
							onPress={onSecondaryPress}
						/>
					) : null}
				</Animated.View>
			</View>
		</Modal>
	);
}
