import {
	Bell,
	CircleHelp,
	FileText,
	Languages,
	Lock,
	LogOut,
	MapPin,
	MessageCircle,
	// Moon, Star, Store, Sun — removidos temporariamente (ver src/_future/settings-plans-theme.tsx)
	Trash2,
	UserRound,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthFeedbackModal } from '@/src/components/features/auth';
import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav, SettingsGroup, type SettingsRow } from '@/src/components/features/store';
import { ToggleSwitch, Text, TouchableScale } from '@/src/components/ui';
import { signOut, deleteAccount } from '@/src/features/auth/service';
import { useProfile } from '@/src/features/profile/hooks/useProfile';
import { useSettings } from '@/src/features/settings/hooks/useSettings';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import type { Locale } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

const LANGUAGE_STORAGE_KEY = 'futly_go_language';

const LANGUAGE_OPTIONS: Array<{ code: Locale; label: string }> = [
	{ code: 'pt-BR', label: 'Portugues (Brasil)' },
	{ code: 'pt-PT', label: 'Portugues (Portugal)' },
	{ code: 'en-US', label: 'English' },
	{ code: 'es-ES', label: 'Espanol' },
];

export default function SettingsScreen() {
	const theme = useAppColorScheme();
	const insets = useSafeAreaInsets();
	const { profile, loadProfile } = useProfile();
	const { settings, loadSettings, updateNotifications, updateLocation, setTheme } = useSettings();
	const { t, changeLanguage } = useTranslation('common');

	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showLanguageModal, setShowLanguageModal] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useState<Locale>('pt-BR');
	const [signingOut, setSigningOut] = useState(false);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		loadProfile().catch(() => undefined);
		loadSettings().catch(() => undefined);
		AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
			.then((storedLanguage) => {
				if (!storedLanguage) return;
				if (LANGUAGE_OPTIONS.some((option) => option.code === storedLanguage)) {
					setSelectedLanguage(storedLanguage as Locale);
				}
			})
			.catch(() => undefined);
	}, [loadProfile, loadSettings]);

	async function handleSelectLanguage(language: Locale) {
		setSelectedLanguage(language);
		setShowLanguageModal(false);

		try {
			await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
			await changeLanguage(language);
		} catch {
			// sem toast por enquanto, apenas mantem a mudanca visual local
		}
	}

	const selectedLanguageLabel =
		LANGUAGE_OPTIONS.find((option) => option.code === selectedLanguage)?.label ??
		'Portugues (Brasil)';

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
			title: t('settings.editProfile', 'Editar perfil'),
			subtitle: t('settings.editProfileSubtitle', 'Nome, bio, telefone, cidade'),
			showArrow: true,
			onPress: () => router.push('/(app)/edit-profile'),
		},
		{
			id: 'security',
			icon: <Lock size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: t('settings.security', 'Senha e segurança'),
			subtitle: t('settings.securitySubtitle', 'Trocar senha com OTP'),
			showArrow: true,
			onPress: () => router.push('/(app)/security'),
		},
		// [FUTURAS IMPLEMENTAÇÕES] Plano e pagamento + Planos — ver src/_future/settings-plans-theme.tsx
		// { id: 'plan', ... },
		// { id: 'store', ... },
	];

	const preferenceRows: SettingsRow[] = [
		{
			id: 'notifications',
			icon: <Bell size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'sky',
			title: t('settings.notifications', 'Notificacoes'),
			subtitle: t('settings.notificationsSubtitle', 'Push - Chat - Convites'),
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
			title: t('settings.location', 'Localização'),
			subtitle: t('settings.locationSubtitle', 'Encontrar partidas perto'),
			rightNode: (
				<ToggleSwitch value={settings?.locationEnabled ?? true} onValueChange={updateLocation} />
			),
		},
		{
			id: 'language',
			icon: <Languages size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: t('settings.language', 'Idioma'),
			subtitle: t('settings.languageSubtitle', 'Portugues (Brasil), Portugues (Portugal), English, Espanol'),
			rightLabel: selectedLanguageLabel,
			showArrow: true,
			onPress: () => setShowLanguageModal(true),
		},
		// [FUTURAS IMPLEMENTAÇÕES] Tema claro/escuro — ver src/_future/settings-plans-theme.tsx
		// { id: 'theme', ... },
	];

	const supportRows: SettingsRow[] = [
		{
			id: 'help',
			icon: <CircleHelp size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: t('settings.helpCenter', 'Central de ajuda'),
			subtitle: t('settings.helpCenterSubtitle', 'FAQ - Tutoriais'),
			showArrow: true,
			onPress: () => router.push('/(app)/help-center'),
		},
		{
			id: 'support-chat',
			icon: <MessageCircle size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: t('settings.support', 'Falar com suporte'),
			subtitle: t('settings.supportSubtitle', 'Resposta em at? 4h'),
			showArrow: true,
			onPress: () => router.push('/(app)/support-chat'),
		},
		{
			id: 'terms',
			icon: <FileText size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'default',
			title: t('settings.termsPrivacy', 'Termos - Privacidade'),
			subtitle: t('settings.termsUpdated', 'Atualizado em 15/04/26'),
			showArrow: true,
			onPress: () => router.push('/(app)/terms'),
		},
	];

	const dangerRows: SettingsRow[] = [
		{
			id: 'logout',
			icon: <LogOut size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'bad',
			title: t('settings.logout', 'Sair da conta'),
			subtitle: t('settings.logoutSubtitle', 'Você precisara entrar de novo'),
			danger: true,
			onPress: () => setShowLogoutModal(true),
		},
		{
			id: 'delete',
			icon: <Trash2 size={16} color="currentColor" strokeWidth={2} />,
			iconTone: 'bad',
			title: t('settings.deleteAccount', 'Excluir conta'),
			subtitle: t('settings.deleteAccountSubtitle', 'Permanente - Todos dados apagados'),
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

	const bgColor = theme === 'light' ? '#F4F6F9' : '#05070B';
	return (
		<View style={{ flex: 1, backgroundColor: bgColor, paddingTop: insets.top }}>
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
				<HubTopNav title={t('settings.title', 'Configuracoes')} subtitle="v 1.4.2" plainBack />

				<LinearGradient
					colors={theme === 'dark' ? ['#0F3A24', '#072314'] : ['#E3F5EC', '#D6EEE3']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={{ marginHorizontal: 18, marginBottom: 8, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(34,183,108,0.30)', paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}
				>
					<View className="h-[46px] w-[46px] rounded-full border-2 border-goldB dark:bg-[#1B3A5F] bg-[#E3F5EC] items-center justify-center">
						<Text variant="label" className="font-bold text-white dark:text-white" style={{ color: theme === 'light' ? '#1A7A4A' : '#FFFFFF' }}>
							{initials || 'AA'}
						</Text>
					</View>

					<View className="flex-1">
						<Text variant="label" className="font-bold text-[#111827] dark:text-white">
							{profile?.full_name ?? 'Atleta Futly'}
						</Text>
						<Text variant="micro" className="mt-0.5 tracking-[0.5px]" style={{ color: theme === 'light' ? '#2F6C54' : '#86E5B4' }}>
							{profile?.email ?? 'email@example.com'}
						</Text>
					</View>

					{/* [FUTURAS IMPLEMENTAÇÕES] Botão de atalho para editar perfil no header — ver src/_future/settings-plans-theme.tsx */}
				</LinearGradient>

				<SettingsGroup title={t('settings.accountGroup', 'Conta')} rows={accountRows} />
				<SettingsGroup title={t('settings.preferencesGroup', 'Preferencias')} rows={preferenceRows} />
				<SettingsGroup title={t('settings.supportGroup', 'Suporte')} rows={supportRows} />
				<SettingsGroup title={t('settings.dangerGroup', 'Zona perigosa')} rows={dangerRows} />

				<View className="items-center px-4 pt-7 pb-5">
					<Text variant="micro" className="text-[#4B5563] dark:text-fg4 text-center uppercase tracking-[1.8px] leading-[16px]">
						HUB DE PARTIDAS
						{'\n'}v 1.4.2 - Build 240425
					</Text>
				</View>
			</ScrollView>

			{/* navbar removido — settings não faz parte da navegação principal */}

			<AuthFeedbackModal
				visible={showLogoutModal}
				tone="info"
				title={t('settings.logoutModalTitle', 'Sair da conta?')}
				message={t('settings.logoutModalMessage', 'Tem certeza que deseja sair e voltar para o login?')}
				primaryLabel={signingOut ? t('settings.loggingOut', 'Saindo...') : t('settings.confirmLogout', 'Sim, sair')}
				onPrimaryPress={handleConfirmSignOut}
				secondaryLabel={t('actions.cancel', 'Cancelar')}
				onSecondaryPress={() => setShowLogoutModal(false)}
				onClose={() => setShowLogoutModal(false)}
			/>

			<AuthFeedbackModal
				visible={showDeleteModal}
				tone="error"
				title={t('settings.deleteModalTitle', 'Excluir conta permanentemente?')}
				message={t('settings.deleteModalMessage', 'Tem certeza? Todos os seus dados, mensagens e histórico serao apagados para sempre. Esta ação não pode ser desfeita.')}
				primaryLabel={deleting ? t('settings.deleting', 'Deletando...') : t('settings.confirmDelete', 'Sim, excluir tudo')}
				onPrimaryPress={handleConfirmDeleteAccount}
				secondaryLabel={t('actions.cancel', 'Cancelar')}
				onSecondaryPress={() => setShowDeleteModal(false)}
				onClose={() => setShowDeleteModal(false)}
			/>

			<Modal
				visible={showLanguageModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowLanguageModal(false)}
			>
				<Pressable
					className="flex-1 justify-center px-6"
					style={{ backgroundColor: theme === 'light' ? 'rgba(15,23,42,0.28)' : 'rgba(0,0,0,0.6)' }}
					onPress={() => setShowLanguageModal(false)}
				>
					<Pressable
						className="rounded-[18px] border p-4"
						style={{
							backgroundColor: theme === 'light' ? '#F8FAFB' : '#0C111E',
							borderColor: theme === 'light' ? '#E5E7EB' : 'rgba(255,255,255,0.10)',
						}}
						onPress={() => undefined}
					>
						<Text
							variant="label"
							className="font-semibold mb-3"
							style={{ color: theme === 'light' ? '#111827' : '#FFFFFF' }}
						>
							Selecionar idioma
						</Text>

						{LANGUAGE_OPTIONS.map((languageOption, index) => {
							const isActive = selectedLanguage === languageOption.code;
							return (
								<TouchableScale
									key={languageOption.code}
									onPress={() => handleSelectLanguage(languageOption.code)}
									style={{
										paddingVertical: 12,
										paddingHorizontal: 10,
										borderRadius: 12,
										borderWidth: isActive ? 1 : 0,
										borderColor: isActive ? '#22B76C' : 'transparent',
										backgroundColor: isActive
											? theme === 'light'
												? 'rgba(34,183,108,0.10)'
												: 'rgba(34,183,108,0.14)'
											: 'transparent',
										marginBottom: index < LANGUAGE_OPTIONS.length - 1 ? 6 : 0,
									}}
								>
									<Text
										variant="body"
										style={{
											color: isActive
												? theme === 'light'
													? '#11663D'
													: '#86E5B4'
												: theme === 'light'
													? '#1F2937'
													: 'rgba(255,255,255,0.88)',
										}}
									>
										{languageOption.label}
									</Text>
								</TouchableScale>
							);
						})}
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}

