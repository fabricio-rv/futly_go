import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { IconButton, Text } from '@/src/components/ui';

type AuthTopNavProps = {
	title: string;
	subtitle?: string;
	rightLabel?: string;
	onRightPress?: () => void;
	onBackPress?: () => void;
};

export function AuthTopNav({
	title,
	subtitle,
	rightLabel,
	onRightPress,
	onBackPress,
}: AuthTopNavProps) {
	return (
		<View className="px-4 pb-3 pt-1 flex-row items-center justify-between">
			<IconButton
				icon={<ChevronLeft size={18} color="#FFFFFF" />}
				onPress={() => {
					if (onBackPress) {
						onBackPress();
						return;
					}
					if (typeof router.canGoBack === 'function' && router.canGoBack()) {
						router.back();
						return;
					}
					router.replace('/(auth)');
				}}
			/>

			<View className="items-center">
				<Text variant="body" className="font-semibold text-white">
					{title}
				</Text>
				{subtitle ? (
					<Text variant="micro" className="uppercase tracking-[1.8px] font-bold text-fg3 mt-[1px]">
						{subtitle}
					</Text>
				) : null}
			</View>

			{rightLabel ? (
				<Pressable
					accessibilityRole="button"
					className="h-10 min-w-10 items-center justify-center px-2"
					onPress={onRightPress}
				>
					<Text variant="caption" className="font-semibold text-fg2">
						{rightLabel}
					</Text>
				</Pressable>
			) : (
				<View className="w-10" />
			)}
		</View>
	);
}

