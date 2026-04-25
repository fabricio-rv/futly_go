import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { ReactNode } from 'react';

import { Text } from '@/src/components/ui';

type SocialAuthRowProps = {
	onGooglePress?: () => void;
	googleDisabled?: boolean;
};

function SocialButton({
	label,
	onPress,
	icon,
	disabled = false,
}: {
	label: string;
	onPress?: () => void;
	icon: ReactNode;
	disabled?: boolean;
}) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ disabled }}
			onPress={onPress}
			disabled={disabled}
			className={`h-12 flex-1 rounded-[14px] border border-line2 bg-[#0C111E] flex-row items-center justify-center gap-2 ${disabled ? 'opacity-45' : ''}`}
		>
			{icon}
			<Text variant="caption" className="text-white font-semibold">
				{label}
			</Text>
		</Pressable>
	);
}

export function SocialAuthRow({ onGooglePress, googleDisabled = false }: SocialAuthRowProps) {
	return (
		<View className="flex-row gap-[10px]">
			<SocialButton
				label="Google"
				onPress={onGooglePress}
				disabled={googleDisabled}
				icon={(
					<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
						<Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.05 5.05 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
						<Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.28-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23z" fill="#34A853" />
						<Path d="M5.85 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.67-2.83z" fill="#FBBC05" />
						<Path d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.1 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.67 2.83C6.72 7.31 9.14 5.38 12 5.38z" fill="#EA4335" />
					</Svg>
				)}
			/>
		</View>
	);
}

