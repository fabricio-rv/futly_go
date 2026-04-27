import { View } from 'react-native';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { Text } from '@/src/components/ui';

export function StoreHero() {
	const theme = useAppColorScheme();
	const isLight = theme === 'light';

	return (
		<View className={`mx-[18px] mb-[14px] rounded-[20px] border border-[#D4A13A47] overflow-hidden ${isLight ? 'bg-[#FFFBF0]' : 'bg-[#0A0703]'} px-[18px] py-[18px]`}>
			<Text variant="micro" className="uppercase tracking-[2.5px] font-extrabold text-goldA mb-1">
				Hub de Partidas - Pro
			</Text>
			<Text variant="heading" className={`font-extrabold tracking-[-0.5px] ${isLight ? 'text-[#111827]' : 'text-white'}`}>
				Mais partidas. Mais visibilidade. Mais futebol.
			</Text>
			<Text variant="caption" className={`mt-2.5 max-w-[260px] leading-[18px] ${isLight ? 'text-[#4B5563]' : 'text-fg2'}`}>
				Desbloqueie raio de busca ampliado, criacao ilimitada de partidas e prioridade nas vagas concorridas.
			</Text>
			<Text className="absolute right-4 top-2 text-[74px] leading-[74px] font-bebas text-[#D4A13A2E]">
				PRO
			</Text>
		</View>
	);
}

