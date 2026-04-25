import { router } from 'expo-router';
import { Clock3, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
	ConversationListItem,
	HubTopNav,
	activeConversations,
	archivedConversations,
	type ConversationPreview,
} from '@/src/components/features/store';
import { IconButton, Pill, Text } from '@/src/components/ui';

type Filter = 'todas' | 'ativas' | 'host' | 'jogador' | 'arquivadas';

function filterConversations(filter: Filter) {
	if (filter === 'host') {
		return activeConversations.filter((item) => item.id === 'arena-central-quinta' || item.id === 'ct-bola-cheia');
	}

	if (filter === 'jogador') {
		return activeConversations.filter((item) => item.id === 'estadio-bairro-sab' || item.id === 'luiz-privado');
	}

	if (filter === 'arquivadas') {
		return [];
	}

	return activeConversations;
}

export default function ConversationsListScreen() {
	const [filter, setFilter] = useState<Filter>('todas');

	const visibleActive = useMemo(() => filterConversations(filter), [filter]);
	const visibleArchived: ConversationPreview[] =
		filter === 'arquivadas' || filter === 'todas' ? archivedConversations : [];

	return (
		<SafeAreaView className="flex-1 bg-ink-0">
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
				<HubTopNav
					title="Conversas"
					subtitle="4 ATIVAS - 2 NAO LIDAS"
					rightNode={
						<IconButton icon={<Search size={18} color="#FFFFFF" strokeWidth={2} />} />
					}
				/>

				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 12, gap: 8 }}
				>
					<Pill label="Todas" rightLabel="4" tone={filter === 'todas' ? 'active' : 'default'} onPress={() => setFilter('todas')} />
					<Pill label="Ativas" tone={filter === 'ativas' ? 'active' : 'default'} onPress={() => setFilter('ativas')} />
					<Pill label="Como Host" tone={filter === 'host' ? 'active' : 'default'} onPress={() => setFilter('host')} />
					<Pill label="Como Jogador" tone={filter === 'jogador' ? 'active' : 'default'} onPress={() => setFilter('jogador')} />
					<Pill label="Arquivadas" tone={filter === 'arquivadas' ? 'active' : 'default'} onPress={() => setFilter('arquivadas')} />
				</ScrollView>

				<View className="px-[18px] py-[10px] border-y border-line bg-[#22B76C14] flex-row items-center gap-2">
					<Clock3 size={12} color="#86E5B4" strokeWidth={2.2} />
					<Text variant="micro" className="text-fg2">
						Cada conversa e vinculada a uma <Text className="text-[#86E5B4] font-bold">partida marcada</Text>. Auto-arquiva 7 dias apos o jogo.
					</Text>
				</View>

				{visibleActive.map((item) => (
					<ConversationListItem
						key={item.id}
						item={item}
						onPress={() => router.push(`/(app)/conversations/${item.id}`)}
					/>
				))}

				{visibleArchived.length > 0 ? (
					<View>
						<View className="px-[18px] pt-[14px] pb-1">
							<Text variant="micro" className="uppercase tracking-[2.4px] font-extrabold text-white">
								Arquivadas <Text className="text-goldA">12</Text>
							</Text>
						</View>

						{visibleArchived.map((item) => (
							<ConversationListItem
								key={item.id}
								item={item}
								onPress={() => router.push(`/(app)/conversations/${item.id}`)}
							/>
						))}
					</View>
				) : null}
			</ScrollView>
		</SafeAreaView>
	);
}

