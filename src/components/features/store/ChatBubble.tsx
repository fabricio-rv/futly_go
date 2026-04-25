import { View } from 'react-native';

import { Text } from '@/src/components/ui';

import type { ChatMessage } from './data';

type ChatBubbleProps = {
	message: ChatMessage;
};

export function ChatBubble({ message }: ChatBubbleProps) {
	if (message.kind === 'system') {
		return (
			<View className="self-center rounded-full border border-[#D4A13A40] bg-[#D4A13A1A] px-3.5 py-1.5 my-1">
				<Text variant="micro" className="text-goldA font-semibold">
					{message.text}
				</Text>
			</View>
		);
	}

	if (message.kind === 'typing') {
		return (
			<View className="self-start rounded-[14px] rounded-tl-[4px] bg-white/5 px-3.5 py-2 flex-row items-center gap-1.5 mt-1">
				<Text variant="micro" className="text-goldA font-bold mr-1">
					{message.author}
				</Text>
				<View className="h-[6px] w-[6px] rounded-full bg-fg3" />
				<View className="h-[6px] w-[6px] rounded-full bg-fg3" />
				<View className="h-[6px] w-[6px] rounded-full bg-fg3" />
			</View>
		);
	}

	const mine = message.kind === 'me';

	return (
		<View
			className={`max-w-[78%] rounded-[14px] px-3 py-2 ${
				mine
					? 'self-end rounded-tr-[4px] bg-[#0A6E3D]'
					: 'self-start rounded-tl-[4px] bg-[#141C2E]'
			}`}
		>
			{!mine && message.author ? (
				<Text variant="micro" className="text-goldA font-bold tracking-[0.5px] mb-[2px]">
					{message.author}
					{message.role ? ` - ${message.role}` : ''}
				</Text>
			) : null}

			<Text variant="caption" className="text-white leading-[18px]">
				{message.text}
			</Text>

			{message.time ? (
				<Text variant="micro" className={`mt-1 text-right ${mine ? 'text-white/55' : 'text-fg4'}`}>
					{mine ? `${message.time} OK` : message.time}
				</Text>
			) : null}
		</View>
	);
}

