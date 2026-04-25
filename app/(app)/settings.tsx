import {
	Bell,
	CircleHelp,
	FileText,
	Lock,
	LogOut,
	MapPin,
	MessageCircle,
	Moon,
	Star,
	Store,
	Sun,
	Trash2,
	UserRound,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthFeedbackModal } from '@/src/components/features/auth';
import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav, SettingsGroup, type SettingsRow } from '@/src/components/features/store';
import { ToggleSwitch, Text } from '@/src/components/ui';
import { signOut, deleteAccount } from '@/src/features/auth/service';
import { useProfile } from '@/src/features/profile/hooks/useProfile';
import { useSettings } from '@/src/features/settings/hooks/useSettings';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

export default function SettingsScreen() {
	const theme = useAppColorScheme();
	const { profile, loadProfile } = useProfile();
	const { settings, loadSettings, updateNotifications, updateLocation, setTheme } = useSettings();

	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [signingOut, setSigningOut] = useState(false);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		loadProfile().catch(() => undefined);
		loadSettings().catch(() => undefined);
	}, [loadProfile, loadSettings]);

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

	async function handleConfirmDeleteAccount() {
		if (deleting) return;

		try {
			setDeleting(true);
			await deleteAccount();
			setShowDeleteModal(false);
			router.replace('/(auth)');
		} finally {
			setDeleting(false);
		}
	}

	const accountRows: SettingsRow[] = [
		{
			id: 'edit-profile',
			icon: <UserRound size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'ok',
			title: 'Editar perfil',
			subtitle: 'Nome, bio, telefone, cidade',
			showArrow: true,
			onPress: () => router.push('/(app)/edit-profile'),
		},
		{
			id: 'security',
			icon: <Lock size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: 'Senha e seguranca',
			subtitle: 'Trocar senha com OTP',
			showArrow: true,
			onPress: () => router.push('/(app)/security'),
		},
		{
			id: 'plan',
			icon: <Star size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'gold',
			title: 'Plano e pagamento',
			subtitle: 'Gold - Renova 10/05',
			rightLabel: 'Gerenciar',
			showArrow: true,
			onPress: () => router.push('/(app)/plan'),
		},
		{
			id: 'store',
			icon: <Store size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: 'Planos',
			subtitle: 'Ver pacotes e beneficios dos planos',
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
					value={settings?.notificationsEnabled ?? true}
					onValueChange={updateNotifications}
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
				<ToggleSwitch value={settings?.locationEnabled ?? true} onValueChange={updateLocation} />
			),
		},
		{
			id: 'theme',
			icon: settings?.theme === 'dark' ? <Moon size={16} color="currentColor" strokeWidth={2} /> : <Sun size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: 'Tema',
			subtitle: settings?.theme === 'dark' ? 'Escuro' : 'Claro',
			rightLabel: settings?.theme === 'dark' ? 'Escuro' : 'Claro',
			showArrow: true,
			onPress: () => setTheme(settings?.theme === 'dark' ? 'light' : 'dark').catch(() => undefined),
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
			onPress: () => router.push('/(app)/help-center'),
		},
		{
			id: 'support-chat',
			icon: <MessageCircle size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: 'Falar com suporte',
			subtitle: 'Resposta em ate 4h',
			showArrow: true,
			onPress: () => router.push('/(app)/support-chat'),
		},
		{
			id: 'terms',
			icon: <FileText size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: 'Termos - Privacidade',
			subtitle: 'Atualizado em 15/04/26',
			showArrow: true,
			onPress: () => router.push('/(app)/terms'),
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
			subtitle: 'Permanente - Todos dados apagados',
			danger: true,
			onPress: () => setShowDeleteModal(true),
		},
	];

	const initials = (profile?.full_name ?? 'Atleta')
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('');

	const bgColor = theme === 'light' ? '#F3F6FB' : '#05070B';
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
				<HubTopNav title="Configuracoes" subtitle="v 1.4.2" />

				<LinearGradient
					colors={theme === 'dark' ? ['#0F3A24', '#072314'] : ['#E3F5EC', '#D6EEE3']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					className="mx-[18px] mb-2 rounded-[18px] border border-[#22B76C4D] px-[14px] py-[14px] flex-row items-center gap-3"
				>
					<View className="h-[46px] w-[46px] rounded-full border-2 border-goldB bg-[#1B3A5F] items-center justify-center">
						<Text variant="label" className="font-bold text-white">
							{initials || 'AA'}
						</Text>
					</View>

					<View className="flex-1">
						<Text variant="label" className="font-bold text-gray-900 dark:text-white">
							{profile?.full_name ?? 'Atleta Futly'}
						</Text>
						<Text variant="micro" className="mt-0.5 tracking-[0.5px]" style={{ color: theme === 'light' ? '#2F6C54' : '#86E5B4' }}>
							{profile?.email ?? 'email@example.com'} - Plano Gold
						</Text>
					</View>

					<Pressable className="h-9 w-9 rounded-[12px] border items-center justify-center" style={{ borderColor: theme === 'light' ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.10)', backgroundColor: theme === 'light' ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.10)' }}>
						<Text variant="body" className="text-gray-700 dark:text-white">&gt;</Text>
					</Pressable>
				</LinearGradient>

				<SettingsGroup title="Conta" rows={accountRows} />
				<SettingsGroup title="Preferencias" rows={preferenceRows} />
				<SettingsGroup title="Suporte" rows={supportRows} />
				<SettingsGroup title="Zona perigosa" rows={dangerRows} />

				<View className="items-center px-4 pt-7 pb-5">
					<Text variant="micro" className="text-gray-600 dark:text-fg4 text-center uppercase tracking-[1.8px] leading-[16px]">
						HUB DE PARTIDAS
						{'\n'}v 1.4.2 - Build 240425
					</Text>
				</View>
			</ScrollView>

			<MatchBottomNav active="none" />

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

			<AuthFeedbackModal
				visible={showDeleteModal}
				tone="error"
				title="Excluir conta permanentemente?"
				message="Tem certeza? Todos os seus dados, mensagens e historico serao apagados para sempre. Esta acao nao pode ser desfeita."
				primaryLabel={deleting ? 'Deletando...' : 'Sim, excluir tudo'}
				onPrimaryPress={handleConfirmDeleteAccount}
				secondaryLabel="Cancelar"
				onSecondaryPress={() => setShowDeleteModal(false)}
				onClose={() => setShowDeleteModal(false)}
			/>
		</SafeAreaView>
	);
}

