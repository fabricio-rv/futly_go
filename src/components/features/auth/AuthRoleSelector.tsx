import { Building2, Eye, UserRound } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui';

export type AccountRole = 'jogador' | 'tecnico' | 'torcedor';

type RoleOption = {
	id: AccountRole;
	title: string;
	subtitle: string;
	icon: typeof UserRound;
};

const roleOptions: RoleOption[] = [
	{ id: 'jogador', title: 'Jogador', subtitle: 'Marca e joga', icon: UserRound },
	{ id: 'tecnico', title: 'Tecnico', subtitle: 'Treina time', icon: Building2 },
	{ id: 'torcedor', title: 'Torcedor', subtitle: 'Acompanha', icon: Eye },
];

type AuthRoleSelectorProps = {
	value: AccountRole;
	onChange: (value: AccountRole) => void;
};

export function AuthRoleSelector({ value, onChange }: AuthRoleSelectorProps) {
	return (
		<View className="flex-row gap-2">
			{roleOptions.map((role) => {
				const Icon = role.icon;
				const selected = value === role.id;

				return (
					<Pressable
						key={role.id}
						accessibilityRole="button"
						onPress={() => onChange(role.id)}
						className={`flex-1 rounded-[14px] px-2 py-3 items-center border ${
							selected ? 'bg-[#22B76C1F] border-ok' : 'bg-[#0C111E] border-line2'
						}`}
					>
						<Icon
							size={22}
							color={selected ? '#86E5B4' : 'rgba(255,255,255,0.70)'}
							strokeWidth={1.9}
						/>
						<Text variant="caption" className={`mt-1.5 font-bold ${selected ? 'text-white' : 'text-fg2'}`}>
							{role.title}
						</Text>
						<Text variant="micro" className={`mt-0.5 font-semibold ${selected ? 'text-fg3' : 'text-fg4'}`}>
							{role.subtitle}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

