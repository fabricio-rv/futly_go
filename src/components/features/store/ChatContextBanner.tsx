import { Globe, ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';

type ChatContextBannerProps = {
	title: string;
	subtitle: string;
	onPress?: () => void;
};

export function ChatContextBanner({ title, subtitle, onPress }: ChatContextBannerProps) {
	return (
		<View className="mx-[14px] mt-[6px] mb-[10px] rounded-[14px] border border-[#22B76C4D] bg-[#22B76C1F] px-[14px] py-3 flex-row items-center gap-[10px]">
			<View className="h-[34px] w-[34px] rounded-[10px] items-center justify-center bg-[#22B76C2E]">
				<Globe size={18} color="#86E5B4" strokeWidth={2} />
			</View>

			<View className="flex-1">
				<Text variant="caption" className="font-bold text-white">
					{title}
				</Text>
				<Text variant="micro" className="mt-[2px] text-fg2">
					{subtitle}
				</Text>
			</View>

			<Pressable
				accessibilityRole="button"
				onPress={onPress}
				className="h-8 w-8 rounded-[10px] border border-[#22B76C4D] bg-[#22B76C24] items-center justify-center"
			>
				<ChevronRight size={14} color="#86E5B4" />
			</Pressable>
		</View>
	);
}

