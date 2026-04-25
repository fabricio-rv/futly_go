import {
	Bell,
	CircleHelp,
	Eye,
	FileText,
	Globe,
	Lock,
	LogOut,
	MapPin,
	MessageCircle,
	Moon,
	Shield,
	Star,
	Store,
	Trash2,
	UserRound,
	UserX,
} from 'lucide-react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthFeedbackModal } from '@/src/components/features/auth';
import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav, SettingsGroup, type SettingsRow } from '@/src/components/features/store';
import { ToggleSwitch, Text } from '@/src/components/ui';
import { signOut } from '@/src/features/auth/service';

export default function SettingsScreen() {
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);
	const [locationEnabled, setLocationEnabled] = useState(true);
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [signingOut, setSigningOut] = useState(false);

	async function handleConfirmSignOut() {
		if (signingOut) return;

		try {
			setSigningOut(true);
			await signOut();
			setShowLogoutModal(false);
			router.replace('/(auth)');
		} finally {
			setSigningOut(false);
		}
	}

	const accountRows: SettingsRow[] = [
		{
			id: 'edit-profile',
			icon: <UserRound size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'ok',
			title: 'Editar perfil',
			subtitle: 'Nome, foto, posicao, cidade',
			showArrow: true,
			onPress: () => router.push('/(app)/profile'),
		},
		{
			id: 'security',
			icon: <Lock size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: 'Senha e seguranca',
			subtitle: 'Trocar senha - 2 fatores',
			showArrow: true,
		},
		{
			id: 'plan',
			icon: <Star size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'gold',
			title: 'Plano e pagamento',
			subtitle: 'Gold - Renova 10/05',
			rightLabel: 'Gerenciar',
			showArrow: true,
		},
		{
			id: 'store',
			icon: <Store size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: 'Loja e planos',
			subtitle: 'Ver pacotes e beneficios',
			showArrow: true,
			onPress: () => router.push('/(app)/store'),
		},
	];

	const preferenceRows: SettingsRow[] = [
		{
			id: 'notifications',
			icon: <Bell size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'sky',
			title: 'Notificacoes',
			subtitle: 'Push - Chat - Convites',
			rightNode: (
				<ToggleSwitch
					value={notificationsEnabled}
					onValueChange={setNotificationsEnabled}
				/>
			),
		},
		{
			id: 'location',
			icon: <MapPin size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: 'Localizacao',
			subtitle: 'Encontrar partidas perto',
			rightNode: (
				<ToggleSwitch value={locationEnabled} onValueChange={setLocationEnabled} />
			),
		},
		{
			id: 'language',
			icon: <Globe size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: 'Idioma',
			subtitle: 'Portugues (Brasil)',
			rightLabel: 'pt-BR',
			showArrow: true,
		},
		{
			id: 'theme',
			icon: <Moon size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: 'Tema',
			subtitle: 'Escuro - Sempre ligado',
			rightLabel: 'Escuro',
		},
	];

	const privacyRows: SettingsRow[] = [
		{
			id: 'invites',
			icon: <Shield size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: 'Quem pode me convidar',
			subtitle: 'Apenas amigos e plano Gold+',
			showArrow: true,
		},
		{
			id: 'visibility',
			icon: <Eye size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: 'Visibilidade do perfil',
			subtitle: 'Publico',
			rightLabel: 'Publico',
			showArrow: true,
		},
		{
			id: 'blocked',
			icon: <UserX size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: 'Bloqueados',
			subtitle: '3 contas bloqueadas',
			showArrow: true,
		},
	];

	const supportRows: SettingsRow[] = [
		{
			id: 'help',
			icon: <CircleHelp size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: 'Central de ajuda',
			subtitle: 'FAQ - Tutoriais',
			showArrow: true,
		},
		{
			id: 'support-chat',
			icon: <MessageCircle size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: 'Falar com suporte',
			subtitle: 'Resposta em ate 4h',
			showArrow: true,
		},
		{
			id: 'terms',
			icon: <FileText size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: 'Termos - Privacidade',
			subtitle: 'Atualizado em 15/04/26',
			showArrow: true,
		},
	];

	const dangerRows: SettingsRow[] = [
		{
			id: 'logout',
			icon: <LogOut size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'bad',
			title: 'Sair da conta',
			subtitle: 'Voce precisara entrar de novo',
			danger: true,
			onPress: () => setShowLogoutModal(true),
		},
		{
			id: 'delete',
			icon: <Trash2 size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'bad',
			title: 'Excluir conta',
			subtitle: 'Permanente - Remove todo o historico',
			danger: true,
		},
	];

	return (
		<SafeAreaView className="flex-1 bg-ink-0">
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
				<HubTopNav title="Configuracoes" subtitle="v 1.4.2" />

				<LinearGradient
					colors={['#0F3A24', '#072314']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					className="mx-[18px] mb-2 rounded-[18px] border border-[#22B76C4D] px-[14px] py-[14px] flex-row items-center gap-3"
				>
					<View className="h-[46px] w-[46px] rounded-full border-2 border-goldB bg-[#1B3A5F] items-center justify-center">
						<Text variant="label" className="font-bold text-white">
							FR
						</Text>
					</View>

					<View className="flex-1">
						<Text variant="label" className="font-bold text-white">
							Fabricio Rodrigues
						</Text>
						<Text variant="micro" className="mt-0.5 text-[#86E5B4] tracking-[0.5px]">
							fab@email.com - Plano Gold
						</Text>
					</View>

					<Pressable className="h-9 w-9 rounded-[12px] border border-white/10 bg-white/10 items-center justify-center">
						<Text variant="body" className="text-white">&gt;</Text>
					</Pressable>
				</LinearGradient>

				<SettingsGroup title="Conta" rows={accountRows} />
				<SettingsGroup title="Preferencias" rows={preferenceRows} />
				<SettingsGroup title="Privacidade" rows={privacyRows} />
				<SettingsGroup title="Suporte" rows={supportRows} />
				<SettingsGroup title="Zona perigosa" rows={dangerRows} />

				<View className="items-center px-4 pt-7 pb-5">
					<Text variant="micro" className="text-fg4 text-center uppercase tracking-[1.8px] leading-[16px]">
						HUB DE PARTIDAS
						{'\n'}v 1.4.2 - Build 240425
					</Text>
				</View>
			</ScrollView>

			<MatchBottomNav active="settings" />

			<AuthFeedbackModal
				visible={showLogoutModal}
				tone="info"
				title="Sair da conta?"
				message="Tem certeza que deseja sair e voltar para o login?"
				primaryLabel={signingOut ? 'Saindo...' : 'Sim, sair'}
				onPrimaryPress={handleConfirmSignOut}
				secondaryLabel="Cancelar"
				onSecondaryPress={() => setShowLogoutModal(false)}
				onClose={() => setShowLogoutModal(false)}
			/>
		</SafeAreaView>
	);
}
