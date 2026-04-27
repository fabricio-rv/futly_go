import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/src/components/ui';

type SocialAuthRowProps = {
	onGooglePress?: () => void;
	onApplePress?: () => void;
	googleDisabled?: boolean;
	appleDisabled?: boolean;
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

export function SocialAuthRow({
	onGooglePress,
	onApplePress,
	googleDisabled = false,
	appleDisabled = false,
}: SocialAuthRowProps) {
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
			<SocialButton
				label="Apple"
				onPress={onApplePress}
				disabled={appleDisabled}
				icon={(
					<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
						<Path
							d="M17.32 12.34c.01-2 1.64-2.96 1.72-3.01-.94-1.37-2.4-1.56-2.9-1.58-1.24-.12-2.42.73-3.05.73-.64 0-1.62-.71-2.67-.69-1.37.02-2.63.8-3.34 2.04-1.43 2.47-.36 6.12 1.03 8.12.68.98 1.49 2.08 2.55 2.04 1.02-.04 1.41-.66 2.65-.66 1.24 0 1.6.66 2.67.64 1.11-.02 1.81-1 2.49-1.98.79-1.14 1.11-2.25 1.13-2.31-.03-.01-2.28-.88-2.27-3.34z"
							fill="#FFFFFF"
						/>
						<Path
							d="M15.22 5.36c.57-.69.95-1.65.85-2.61-.82.03-1.8.54-2.39 1.22-.53.61-.99 1.58-.87 2.52.91.07 1.84-.46 2.41-1.13z"
							fill="#FFFFFF"
						/>
					</Svg>
				)}
			/>
		</View>
	);
}
