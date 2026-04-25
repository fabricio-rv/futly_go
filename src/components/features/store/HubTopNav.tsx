import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { View } from 'react-native';

import { IconButton, Text } from '@/src/components/ui';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type HubTopNavProps = {
	title: string;
	subtitle?: string;
	rightNode?: ReactNode;
	hideBack?: boolean;
	onBackPress?: () => void;
};

export function HubTopNav({
	title,
	subtitle,
	rightNode,
	hideBack = false,
	onBackPress,
}: HubTopNavProps) {
	const theme = useAppColorScheme();
	const iconColor = theme === 'dark' ? '#FFFFFF' : '#1A1A2E';

	return (
		<View className="px-4 pb-3 pt-1 flex-row items-center">
			{hideBack ? (
				<View className="w-10" />
			) : (
				<IconButton
					icon={<ChevronLeft size={18} color={iconColor} />}
					onPress={() => {
						if (onBackPress) {
							onBackPress();
							return;
						}
						if (typeof router.canGoBack === 'function' && router.canGoBack()) {
							router.back();
							return;
						}
						router.replace('/(app)');
					}}
				/>
			)}

			<View className="flex-1 items-center">
				<Text variant="body" className="font-semibold text-gray-900 dark:text-white">
					{title}
				</Text>
				{subtitle ? (
					<Text variant="micro" className="mt-[1px] uppercase tracking-[1.8px] font-bold text-gray-600 dark:text-fg3">
						{subtitle}
					</Text>
				) : null}
			</View>

			{rightNode ? rightNode : <View className="w-10" />}
		</View>
	);
}

