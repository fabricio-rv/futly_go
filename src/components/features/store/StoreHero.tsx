import { View } from 'react-native';

import { Text } from '@/src/components/ui';

export function StoreHero() {
	return (
		<View className="mx-[18px] mb-[14px] rounded-[20px] border border-[#D4A13A47] overflow-hidden bg-[#0A0703] px-[18px] py-[18px]">
			<View className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#D4A13A33]" />
			<Text variant="micro" className="uppercase tracking-[2.5px] font-extrabold text-goldA mb-1">
				Hub de Partidas - Pro
			</Text>
			<Text variant="heading" className="text-white font-extrabold tracking-[-0.5px]">
				Mais partidas. Mais visibilidade. Mais futebol.
			</Text>
			<Text variant="caption" className="mt-2.5 max-w-[260px] leading-[18px] text-fg2">
				Desbloqueie raio de busca ampliado, criacao ilimitada de partidas e prioridade nas vagas concorridas.
			</Text>
			<Text className="absolute right-4 top-2 text-[74px] leading-[74px] font-bebas text-[#D4A13A2E]">
				PRO
			</Text>
		</View>
	);
}

