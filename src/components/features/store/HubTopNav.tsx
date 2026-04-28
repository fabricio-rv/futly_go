import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { IconButton, Text } from '@/src/components/ui';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type HubTopNavProps = {
	title: string;
	subtitle?: string;
	rightNode?: ReactNode;
	centerNode?: ReactNode;
	hideBack?: boolean;
	onBackPress?: () => void;
	plainBack?: boolean;
	titleClassName?: string;
};

export function HubTopNav({
	title,
	subtitle,
	rightNode,
	centerNode,
	hideBack = false,
	onBackPress,
	plainBack = false,
	titleClassName,
}: HubTopNavProps) {
	const theme = useAppColorScheme();
	const iconColor = theme === 'dark' ? '#FFFFFF' : '#1A1A2E';

	const handleBack = () => {
		if (onBackPress) {
			onBackPress();
			return;
		}
		if (typeof router.canGoBack === 'function' && router.canGoBack()) {
			router.back();
			return;
		}
		router.replace('/(app)');
	};

	return (
		<View className={`${plainBack ? 'pl-2 pr-4' : 'px-4'} pb-3 pt-1 flex-row items-center`}>
			{hideBack ? (
				<View className="w-10" />
			) : plainBack ? (
				<Pressable onPress={handleBack} hitSlop={12} className="w-10 h-10 items-start justify-center">
					<ChevronLeft size={22} color={iconColor} />
				</Pressable>
			) : (
				<IconButton
					icon={<ChevronLeft size={18} color={iconColor} />}
					onPress={handleBack}
				/>
			)}

			<View className="flex-1 items-center">
				{centerNode ? centerNode : (
					<>
						<Text variant="body" className={`font-semibold text-[#111827] dark:text-white ${titleClassName ?? ''}`.trim()}>
							{title}
						</Text>
						{subtitle ? (
							<Text variant="micro" className="mt-[1px] uppercase tracking-[1.8px] font-bold text-[#4B5563] dark:text-fg3">
								{subtitle}
							</Text>
						) : null}
					</>
				)}
			</View>

			{rightNode ? rightNode : <View className="w-10" />}
		</View>
	);
}
